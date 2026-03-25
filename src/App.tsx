
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

interface ExtendedGameState extends GameState {
  answersHistory: boolean[];
  pointsPerQuestion: number;
  timeLimit: number
}

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
    }
  } catch (error) {
    console.error("Error refrescando usuario", error);
  } finally {
    setIsSyncingUser(false);
  }
};

// Refrescar cada vez que entramos al Home
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

  const handleUserInteraction = () => {
    audioManager.startBackgroundMusic();
  };

  const startGame = async (overrideUserId?: number) => {
    handleUserInteraction();
    audioManager.play('click');
    setIsLoading(true);

    const categoryId = 1;
    const userId = overrideUserId ?? state.user?.id_usuarios;

    if (!userId) {
      setState(prev => ({ ...prev, currentScreen: 'AUTH' }));
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseURL}rondas/iniciar_juego/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          id_categoria: categoryId
        }),
      });

      const data = await response.json();

    if (response.ok) {
      setState(prev => ({
        ...prev,
        currentScreen: 'GAMEPLAY',
        difficulty: 'Banca',
        questions: data.preguntas,
        rondaId: data.ronda_id,
        pointsPerQuestion: Number(data.puntos_categoria) || 150,
        timeLimit: Number(data.tiempo_categoria) || 10, // <-- Capturamos el tiempo de la DB
        currentQuestionIndex: 0,
        score: 0,
        streak: 0,
        startTime: Date.now(),
        answersHistory: []
      }));
    } else{
      alert(data.error || "Error al iniciar el juego");
    }
  }
  catch(error){
    console.error("Error al iniciar el juego:", error);
    alert("Error al iniciar el juego. Por favor, inténtalo de nuevo.");
  }
  finally {
    setIsLoading(false);
  }
};

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

  const handleAuthSuccess = (user: User) => {
    setState(prev => ({ ...prev, user, currentScreen: 'HOME' }));
  };

  const handleRegisterAndStart = async (data: { nombre: string; email: string; telefono: string; apostemos: boolean }) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${baseURL}usuarios/acceso_directo/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identificador: data.nombre,
        email: data.email,
        telefono: data.telefono,
        recibir_apostemos: data.apostemos
      }),
    });
    const result = await response.json();
    if (response.ok || response.status === 201) {
      const userToSave = { ...result, name: result.identificador, avatarColor: '#f5821f', avatarIcon: 'sports_soccer' };
      localStorage.setItem('mundialista_user', JSON.stringify(userToSave));
      audioManager.play('whistle');
      setState(prev => ({ ...prev, user: userToSave, currentScreen: 'GAMEPLAY' }));
      await startGame(userToSave.id_usuarios);
    } else {
      const msg = result.correo ? 'Este correo ya está registrado' :
                  result.identificador ? 'Este nombre ya está en uso' :
                  'Error al registrarse';
      throw new Error(msg);
    }
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
      className="min-h-[100dvh] w-full bg-background-dark text-white font-sans soccer-pattern overflow-x-hidden overflow-y-auto relative"
      onClick={handleUserInteraction}
      style={{ backgroundImage: "url('/images/fondo 3.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {isLoading && <LoadingScreen />}
      {state.currentScreen === 'HOME' && (
        <Home 
          user={state.user}
          onStart={() => { 
            handleUserInteraction();
            audioManager.play('click'); 
            startGame();
          }} 
          onLogin={goToAuth}
          onProfile={goToProfile}
          onRegisterAndStart={handleRegisterAndStart}
          isSyncing={isSyncingUser}
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
        />
      )}
      
      {state.currentScreen === 'FEEDBACK' && (
        <Feedback 
          isCorrect={state.lastAnswerCorrect!}
          question={state.questions[state.currentQuestionIndex]}
          onNext={nextQuestion}
          pointsEarned={state.pointsPerQuestion * (1 + (state.streak - 1) * 0.1)}
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
    </div>
  );
};

export default App;
