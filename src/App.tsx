
import React, { useState, useEffect } from 'react';
import { GameState, User } from '../types';
import { QUESTIONS_DATABASE } from '../constants';
import { audioManager } from '../audio';
import Home from './components/Home';
import DifficultySelector from './components/DifficultySelector';
import Gameplay from './components/Gameplay';
import Feedback from './components/Feedback';
import Summary from './components/Summary';
import LeadCapture from './components/LeadCapture';
import Ranking from './components/Ranking';
import Auth from './components/Auth';
import Profile from './components/Profile';
import LoadingScreen from './components/LoadingScreen';
import Codigo from './components/Codigo';
import Disenio from './components/Disenio';
import MenuControl from './components/menuControl';
import {
  clearActiveDesignCode,
  getActiveDesignCode,
  getActiveDesignConfig,
  getDesignByCode,
  setActiveDesignCode,
  getQuestionsByCode,
  getQuestionsByCodeOffline,
  updateQuestionsByCode,
} from './components/adminDesignStore';
import { db } from './db';

const hexToRgbString = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
  const validHex = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(validHex)) {
    return '245, 130, 31';
  }

  const r = Number.parseInt(validHex.slice(0, 2), 16);
  const g = Number.parseInt(validHex.slice(2, 4), 16);
  const b = Number.parseInt(validHex.slice(4, 6), 16);

  return `${r}, ${g}, ${b}`;
};

interface ExtendedGameState extends GameState {
  answersHistory: boolean[];
  pointsPerQuestion: number;
  timeLimit: number
}

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026GENIO';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ExtendedGameState>({
    currentScreen: 'HOME',
    difficulty: null,
    currentQuestionIndex: 0,
    questions: [],
    score: 0,
    streak: 0,
    lastAnswerCorrect: null,
    startTime: 0,
    endTime: null,
    answersHistory: [],
    user: null,
    pointsPerQuestion: 150,
    timeLimit: 15,
  });
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [activeDesignCode, setActiveDesignCodeState] = useState('');
  const [activeDesign, setActiveDesignState] = useState<DesignConfig | null>(null);

  const backgroundImage = activeDesign?.backgroundImage || '/images/fondo 3.jpg';
  const logoImage = activeDesign?.logoImage || '/images/icon general.svg';
  const appFontFamily = activeDesign?.fontFamily || 'Plus Jakarta Sans, sans-serif';
  const appTitle = activeDesign?.appTitle;
  const appSubtitle = activeDesign?.appSubtitle;
  const appTagline = activeDesign?.appTagline;
  const iconVictoriaImage = activeDesign?.iconVictoriaImage;
  const iconFallasteImage = activeDesign?.iconFallasteImage;
  const iconVImage = activeDesign?.iconVImage;
  const iconFImage = activeDesign?.iconFImage;
  const primaryGlow = activeDesign?.primaryColor || '#f5821f';
  const primaryRgb = hexToRgbString(primaryGlow);

const refreshUserData = async () => {
  if (!state.user?.id_usuarios) return;
  
  setIsSyncingUser(true);

  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${baseURL}usuarios/${state.user.id_usuarios}/`);
    const freshData = await response.json();
    if (response.ok) {
      setState(prev => ({ ...prev, user: freshData }));
      localStorage.setItem('mundialista_user', JSON.stringify(freshData));
    }else {
      setState(prev => ({ ...prev, user: null, currentScreen: 'AUTH' }));
    }
  } catch (error) {
    console.error("Error refrescando usuario", error);
  } finally {
    setIsSyncingUser(false);
  }
};

useEffect(() => {
  if (state.currentScreen === 'HOME' && state.user) {
    refreshUserData();
  }
}, [state.currentScreen]);

useEffect(() => {
  const savedUser = localStorage.getItem('mundialista_user'); 
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    setState(prev => ({ ...prev, user: userData }));
  }
}, []);

useEffect(() => {
  setActiveDesignCodeState(getActiveDesignCode());
}, []);

useEffect(() => {
  const adminScreens = ['CODIGO', 'DISENIO', 'MENU_CONTROL'];
  if (!adminUnlocked && adminScreens.includes(state.currentScreen)) {
    setState((prev) => ({ ...prev, currentScreen: 'HOME' }));
  }
}, [adminUnlocked, state.currentScreen]);

  const startGame = async (overrideUserId?: number) => {
    audioManager.play('click');
    setIsLoading(true);

    const categoryId = 1;
    const userId = overrideUserId ?? state.user?.id_usuarios;
    const activeCode = getActiveDesignCode();

    if (!userId) {
        setState(prev => ({ ...prev, currentScreen: 'AUTH' }));
        setIsLoading(false);
        return;
    }

    try {
        const baseURL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseURL}rondas/iniciar_juego/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: userId,
                id_categoria: categoryId,
                ...(activeCode ? { codigo: activeCode } : {}),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            if (activeCode && data.preguntas) {
                await updateQuestionsByCode(activeCode, data.preguntas);
            }

            setState(prev => ({
                ...prev,
                currentScreen: 'GAMEPLAY',
                difficulty: 'Banca',
                questions: data.preguntas,
                rondaId: data.ronda_id,
                pointsPerQuestion: Number(data.puntos_categoria) || 150,
                timeLimit: Number(data.tiempo_categoria) || 10,
                currentQuestionIndex: 0,
                score: 0,
                streak: 0,
                startTime: Date.now(),
                answersHistory: []
            }));
        } else {
            throw new Error(data.error || "Error al iniciar el juego");
        }
    } catch (error) {
        console.warn("Fallo de red, iniciando modo offline con lógica local...");

        if (activeCode) {
            const localQuestions = await getQuestionsByCodeOffline(activeCode);

            if (localQuestions.length >= 10) {
                setState(prev => ({
                    ...prev,
                    currentScreen: 'GAMEPLAY',
                    difficulty: 'Banca',
                    questions: localQuestions,
                    rondaId: 0, 
                    pointsPerQuestion: 150,
                    timeLimit: 10,
                    currentQuestionIndex: 0,
                    score: 0,
                    streak: 0,
                    startTime: Date.now(),
                    answersHistory: []
                }));
            } else {
                alert(`No hay suficientes preguntas guardadas (${localQuestions.length}/10). Por favor, conéctate una vez para sincronizar.`);
            }
        } else {
            alert("Error de conexión y no hay un código de diseño activo.");
        }
    } finally {
        setIsLoading(false);
    }
  };

useEffect(() => {
  const loadInitialDesign = async () => {
    const config = await getActiveDesignConfig();
    setActiveDesignState(config);
  };
  loadInitialDesign();
}, []);

  const handleAnswer = (isCorrect: boolean) => {
      audioManager.play(isCorrect ? 'correct' : 'incorrect');

      setState(prev => ({
        ...prev,
        lastAnswerCorrect: isCorrect,
        score: isCorrect 
          ? prev.score + 1
          : prev.score,
        streak: isCorrect ? prev.streak + 1 : 0,
        answersHistory: [...prev.answersHistory, isCorrect],
        currentScreen: 'FEEDBACK'
      }));
  };

  const finishGame = async (finalScore: number, rondaId: number) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL;
      await fetch(`${baseURL}rondas/${rondaId}/finalizar/`, {
        method: 'PATCH', // <-- Cambiar aquí también
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntaje_total: finalScore }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const nextQuestion = () => {
    audioManager.play('click');
    if (state.currentQuestionIndex + 1 < state.questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentScreen: 'GAMEPLAY',
        lastAnswerCorrect: null
      }));
    } else {
      audioManager.play('whistle');
      if (state.rondaId) {
        finishGame(state.score, state.rondaId);
      }

      setState(prev => ({
        ...prev,
        currentScreen: 'SUMMARY',
        endTime: Date.now()
      }));
    }
  };

  const resetToHome = () => {
    audioManager.play('click');
    setState(prev => ({
      ...prev,
      currentScreen: 'HOME',
      difficulty: null,
      currentQuestionIndex: 0,
      questions: [],
      score: 0,
      streak: 0,
      lastAnswerCorrect: null,
      startTime: 0,
      endTime: null,
      answersHistory: []
    }));
  };

  const goToLeadCapture = () => {
    audioManager.play('click');
    setState(prev => ({ ...prev, currentScreen: 'LEAD_CAPTURE' }));
  };

  const goToRanking = () => {
    audioManager.play('click');
    setState(prev => ({ ...prev, currentScreen: 'RANKING' }));
  };

  const goToAuth = () => {
    audioManager.play('click');
    setState(prev => ({ ...prev, currentScreen: 'AUTH' }));
  };

  const goToProfile = () => {
    audioManager.play('click');
    setState(prev => ({ ...prev, currentScreen: 'PROFILE' }));
  };

  const goToDisenio = () => {
    audioManager.play('click');
    setState((prev) => ({ ...prev, currentScreen: 'DISENIO' }));
  };

  const goToCodigo = () => {
    audioManager.play('click');
    setState((prev) => ({ ...prev, currentScreen: 'CODIGO' }));
  };

  const goToMenuControl = () => {
    audioManager.play('click');
    setState((prev) => ({ ...prev, currentScreen: 'MENU_CONTROL' }));
  };

  const handleApplyDesignCode = async (inputCode: string) => { 
    const code = inputCode.trim().toUpperCase();

    if (!code) {
      clearActiveDesignCode();
      setActiveDesignCodeState('');
      setActiveDesignState(null);
      return { ok: true, message: 'Diseño por defecto aplicado.' };
    }

    const design = await getDesignByCode(code);
    if (!design) {
      return { ok: false, message: 'Código no válido. Se mantiene el diseño actual.' };
    }

    setActiveDesignCode(code);
    setActiveDesignCodeState(code);
    setActiveDesignState(design);
    return { ok: true, message: `Diseño ${code} aplicado globalmente.` };
  };

  const handleSecretAdminTap = () => {
    const nextValue = secretTapCount + 1;
    if (nextValue < 7) {
      setSecretTapCount(nextValue);
      return;
    }

    setSecretTapCount(0);
    const pin = window.prompt('Acceso admin oculto. Ingresa PIN:');

    if ((pin || '').trim() === ADMIN_PIN) {
      setAdminUnlocked(true);
      goToDisenio();
      return;
    }

    alert('PIN invalido.');
  };

  const handleAuthSuccess = (user: User) => {
    setState(prev => ({ ...prev, user, currentScreen: 'HOME' }));
  };

  const handleRegisterAndStart = async (data: { nombre: string; email: string; telefono: string; apostemos: boolean }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    
    const userPayload = {
      identificador: data.nombre,
      email: data.email,
      telefono: data.telefono,
      recibir_apostemos: data.apostemos,
      ...(activeDesignCode ? { codigo_diseno: activeDesignCode } : {}),
    };

    try {
      const response = await fetch(`${baseURL}usuarios/acceso_directo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });

      const result = await response.json();

      if (response.ok || response.status === 201) {
        const userToSave = { 
          ...result, 
          name: result.identificador, 
          avatarColor: '#f5821f', 
          avatarIcon: 'sports_soccer' 
        };

        localStorage.setItem('mundialista_user', JSON.stringify(userToSave));
        
        await db.tbl_usuario.put({
          ...userToSave,
          id_usuario: result.id_usuarios,
          estado: 'sincronizado' 
        });

        audioManager.play('whistle');
        setState(prev => ({ ...prev, user: userToSave, currentScreen: 'GAMEPLAY' }));
        await startGame(userToSave.id_usuarios);

      } else {
        const msg = result.correo ? 'Este correo ya está registrado' :
                    result.identificador ? 'Este nombre ya está en uso' :
                    'Error al registrarse';
        throw new Error(msg);
      }

    } catch (error: any) {
      if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
        console.warn("Sin conexión. Guardando usuario localmente...");

        const localId = await db.tbl_usuario.add({
          identificador: data.nombre,
          correo: data.email,
          telefono: data.telefono,
          estado: 'pendiente',
          fecha_creacion: new Date().toISOString()
        });

        const localUser = {
          id_usuarios: localId,
          identificador: data.nombre,
          name: data.nombre,
          avatarColor: '#f5821f',
          avatarIcon: 'sports_soccer',
          isOffline: true 
        };

        finalizeLogin(localUser);
      } else {
        alert(error.message);
      }
    }
  };

  const finalizeLogin = (userToSave: any) => {
    localStorage.setItem('mundialista_user', JSON.stringify(userToSave));
    audioManager.play('whistle');
    setState(prev => ({ ...prev, user: userToSave, currentScreen: 'GAMEPLAY' }));
    startGame(userToSave.id_usuarios);
  };

  const handleLogout = () => {
    audioManager.play('click');
    localStorage.removeItem('mundialista_user');
    setState(prev => ({ ...prev, user: null, currentScreen: 'HOME' }));
  };

  const handleDeleteAccount = async () => {
    const userId = state.user?.id_usuarios;
    if (!userId) return;

    try {
      const baseURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseURL}usuarios/${userId}/desactivar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Al desactivar, simplemente cerramos sesión
        handleLogout(); 
        alert("Tu cuenta ha sido desactivada. ¡Esperamos tu regreso al campo!");
      }
    } catch (error) {
      console.error("Error al desactivar:", error);
    }
  };

  const handleUpdateProfile = async (updatedFields: any) => {
    // Usamos el ID que viene en el objeto user de Django
    const userId = state.user?.id_usuarios;
    if (!userId) return;

    try {
      const baseURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseURL}usuarios/${userId}/`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Actualizamos el estado global y el localStorage
        setState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem('mundialista_user', JSON.stringify(updatedUser));
        audioManager.play('whistle'); // Un pequeño feedback de éxito
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("No se pudieron guardar los cambios.");
    }
  };

  return (
    <div 
      className="design-scope min-h-[100dvh] w-full bg-background-dark text-white font-sans soccer-pattern overflow-x-hidden overflow-y-auto relative transition-all duration-500"
      style={{
        '--design-primary': primaryGlow,
        '--design-primary-rgb': primaryRgb,
        '--design-background-image': `url('${backgroundImage}')`,
        fontFamily: appFontFamily,
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.5)), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Mantiene el fondo quieto al scrollear
        boxShadow: `inset 0 0 120px ${primaryGlow}33`,
      } as React.CSSProperties}
    >
      {isLoading && <LoadingScreen />}
      {state.currentScreen === 'HOME' && (
        <Home 
          user={state.user}
          onStart={() => { 
            startGame();
            audioManager.play('click'); 
            startGame();
          }} 
          onLogin={goToAuth}
          onProfile={goToProfile}
          onRegisterAndStart={startGame}
          isSyncing={isSyncingUser}
          logoImage={logoImage}
          appTitle={appTitle}
          appSubtitle={appSubtitle}
          appTagline={appTagline}
        />
      )}

      {state.currentScreen === 'AUTH' && (
        <Auth 
          onSuccess={handleAuthSuccess}
          onBack={resetToHome}
        />
      )}
      
      {state.currentScreen === 'DIFFICULTY' && (
        <DifficultySelector 
          onSelect={startGame} 
          onBack={resetToHome} 
          onRanking={goToRanking}
          onProfile={state.user ? goToProfile : goToAuth}
        />
      )}

      {state.currentScreen === 'PROFILE' && state.user && (
        <Profile 
          user={state.user}
          onUpdate={handleUpdateProfile}
          onLogout={handleLogout}
          onDelete={handleDeleteAccount}
          onBack={resetToHome}
        />
      )}
      
      {state.currentScreen === 'GAMEPLAY' && (
        <Gameplay 
          question={state.questions[state.currentQuestionIndex]}
          index={state.currentQuestionIndex}
          total={state.questions.length}
          streak={state.streak}
          difficulty={state.difficulty!}
          onAnswer={handleAnswer}
          onHome={resetToHome}
          // PASA EL TIEMPO AQUÍ:
          timeLimit={state.timeLimit}
          logoImage={logoImage}
          iconVImage={iconVImage}
          iconFImage={iconFImage}
        />
      )}
      
      {state.currentScreen === 'FEEDBACK' && (
        <Feedback 
          isCorrect={state.lastAnswerCorrect!}
          question={state.questions[state.currentQuestionIndex]}
          onNext={nextQuestion}
          pointsEarned={state.pointsPerQuestion * (1 + (state.streak - 1) * 0.1)}
          iconVictoriaImage={iconVictoriaImage}
          iconFallasteImage={iconFallasteImage}
        />
      )}
      
      {state.currentScreen === 'SUMMARY' && (
        <Summary 
          state={state}
          onRestart={resetToHome}
          onRegister={() => setState(prev => ({ ...prev, currentScreen: 'REGISTER' }))}
          onRanking={() => setState(prev => ({ ...prev, currentScreen: 'RANKING' }))}
          onHome={() => setState(prev => ({ ...prev, currentScreen: 'HOME' }))}
        />
      )}

      {state.currentScreen === 'LEAD_CAPTURE' && (
        <LeadCapture 
          score={state.score}
          onComplete={goToRanking}
          onCancel={resetToHome}
        />
      )}

      {state.currentScreen === 'RANKING' && (
        <Ranking 
          userId={state.user?.id_usuarios}
          userScore={state.score} 
          userName={state.user?.identificador}
          userIcon={state.user?.emblema}
          userColor={state.user?.avatarColor}
          onBack={state.endTime ? () => setState(prev => ({ ...prev, currentScreen: 'SUMMARY' })) : resetToHome} 
          onProfile={state.user ? goToProfile : goToAuth}
          onLogout={handleLogout}
        />
      )}

      {state.currentScreen === 'DISENIO' && adminUnlocked && (
        <Disenio
          onBack={resetToHome}
          onGoToCodigo={goToCodigo}
          onGoToMenuControl={goToMenuControl}
        />
      )}

      {state.currentScreen === 'CODIGO' && adminUnlocked && (
        <Codigo
          onBack={resetToHome}
          onGoToDisenio={goToDisenio}
          onGoToMenuControl={goToMenuControl}
          currentCode={activeDesignCode}
          onApplyCode={handleApplyDesignCode}
        />
      )}

      {state.currentScreen === 'MENU_CONTROL' && adminUnlocked && (
        <MenuControl
          onBack={resetToHome}
          onGoToDisenio={goToDisenio}
          onGoToCodigo={goToCodigo}
          onDesignUpdated={() => setActiveDesignState(getActiveDesignConfig())}
        />
      )}

      <button
        onClick={handleSecretAdminTap}
        aria-label="admin-hidden-trigger"
        className="absolute bottom-2 right-2 w-6 h-6 opacity-0"
        title="admin-hidden-trigger"
      />
    </div>
  );
};

export default App;
