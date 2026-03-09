import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, Difficulty } from '../types';

interface GameplayProps {
  question: Question;
  index: number;
  total: number;
  streak: number;
  difficulty: Difficulty;
  onAnswer: (answer: boolean) => void;
  onHome: () => void;
  timeLimit: number;
}

const Gameplay: React.FC<GameplayProps> = ({ question, index, total, streak, difficulty, onAnswer, onHome, timeLimit }) => {
  const calculateInitialTime = () => {
    const baseTime = timeLimit || 15;
    const penalty = (index * 0.4) + (Math.floor(streak / 3) * 0.5);
    return Math.max(3, Math.floor(baseTime - penalty));
  };

  const initialTime = useMemo(() => calculateInitialTime(), [question.id_pregunta]);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isAnswering, setIsAnswering] = useState(false); // Bloqueo de doble respuesta

  // --- Lógica de Arrastre (Swipe) ---
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  
  const SWIPE_THRESHOLD = 90;
  const timeProgress = (timeLeft / initialTime) * 100;

  // Reset al cambiar de pregunta
  useEffect(() => {
    setTimeLeft(initialTime);
    setDragOffset({ x: 0, y: 0 });
    setIsAnswering(false);
  }, [question.id_pregunta, initialTime]);

  // Cronómetro
  useEffect(() => {
    if (timeLeft <= 0 && !isAnswering) {
      handleAnswer(null); // Timeout cuenta como error automático
      return;
    }
    if (isAnswering) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswering]);

  const handleAnswer = (userAnswer: boolean | null) => {
    if (isAnswering) return;
    setIsAnswering(true);

    // 1. COMPARACIÓN LÓGICA: ¿El usuario acertó?
    const isCorrect = userAnswer === null 
      ? false 
      : userAnswer === question.respuesta_correcta;

    console.log({
      pregunta: question.pregunta,
      usuarioDijo: userAnswer,
      respuestaDB: question.respuesta_correcta,
      resultadoFinal: isCorrect
    });

    // 2. LLAMADA A LA PROP DEL PADRE
    // Usamos onAnswer (la prop) para pasarle el resultado al componente principal
    setTimeout(() => {
      onAnswer(isCorrect); 
    }, 200);
  };

  // --- Handlers de Eventos ---
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isAnswering) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStart.current = { x, y };
    setIsDragging(true);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || isAnswering) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragOffset({ 
      x: x - touchStart.current.x, 
      y: (y - touchStart.current.y) * 0.2 // Reducimos movimiento vertical para que se sienta más "Tinder"
    });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragOffset.x > SWIPE_THRESHOLD) {
        handleAnswer(true); // Derecha = Usuario dice "Verdadero"
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
        handleAnswer(false); // Izquierda = Usuario dice "Falso"
    } else {
        setDragOffset({ x: 0, y: 0 });
    }
  };

  const isUrgent = timeLeft <= 3;
  const stampOpacity = Math.min(Math.abs(dragOffset.x) / (SWIPE_THRESHOLD * 0.8), 1);

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden select-none bg-[#050a06]">
      <header className="shrink-0 pt-2 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="h-full flex flex-col p-4 overflow-hidden select-none bg-[#050a06] animate-in fade-in duration-700"></div>
          <div className="flex items-center gap-2">
            <button onClick={onHome} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all">
              <span className="material-symbols-outlined text-white text-xl">home</span>
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isUrgent ? 'bg-red-500/20 border-red-500/40 animate-pulse' : 'bg-card-bg border-white/10'}`}>
              <span className={`material-symbols-outlined text-sm ${isUrgent ? 'text-red-500' : 'text-primary'}`}>timer</span>
              <span className={`text-sm font-black tracking-tighter ${isUrgent ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{difficulty}</span>
             </div>
             <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
               <span className="text-primary font-black text-sm">{streak}</span>
               <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
             </div>
          </div>
        </div>
        
        {/* Barra de progreso de tiempo */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-red-500' : 'bg-primary'}`} 
            style={{ width: `${timeProgress}%` }}
          ></div>
        </div>
      </header>

      <main 
        className="flex-1 flex items-center justify-center perspective-1000"
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
      >
        <div 
          className={`relative w-full max-w-[300px] aspect-[3/4] transition-transform ${!isDragging ? 'duration-500' : 'duration-0'}`}
          style={{ 
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x / 15}deg)`,
            opacity: isAnswering ? 0 : 1
          }}
        >
          {/* Sellos dinámicos mejorados */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            style={{ opacity: stampOpacity }}
          >
            {dragOffset.x > 0 ? (
              <div className="border-8 border-primary text-primary font-black text-4xl px-6 py-2 rounded-2xl -rotate-12 uppercase scale-125 bg-[#050a06]/80">¡GOL!</div>
            ) : (
              <div className="border-8 border-red-500 text-red-500 font-black text-4xl px-6 py-2 rounded-2xl rotate-12 uppercase scale-125 bg-[#050a06]/80">OFFSIDE</div>
            )}
          </div>

          <div className="absolute inset-0 bg-card-bg rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col">
            <div className="relative h-[40%] bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <img 
                  src="https://pngimg.com/uploads/football/football_PNG52789.png" 
                  alt="Balón"
                  className={`w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(19,236,91,0.4)] transition-transform ${isUrgent ? 'animate-bounce' : 'rotate-12'}`}
                />
                <div className="absolute bottom-3 flex items-center gap-2">
                   <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Jugada {index + 1} de {total}</span>
                </div>
            </div>
            
            <div className="flex-1 p-8 flex flex-col justify-between items-center text-center">
              <h2 className={`text-white text-xl font-bold leading-tight italic transition-colors ${isUrgent ? 'text-red-400' : ''}`}>
                "{question.pregunta}"
              </h2>
              
              <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-white/5 opacity-40">
                <div className="flex flex-col items-center gap-1">
                   <span className="material-symbols-outlined text-red-500 text-xl">chevron_left</span>
                   <span className="text-[9px] font-black uppercase text-red-500">Falso</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <span className="material-symbols-outlined text-primary text-xl">chevron_right</span>
                   <span className="text-[9px] font-black uppercase text-primary">Verdad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 pb-10 flex justify-center gap-12">
        <button 
          onClick={() => handleAnswer(false)} 
          disabled={isAnswering}
          className="group relative size-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center active:scale-75 transition-all disabled:opacity-50"
        >
          <div className="absolute inset-0 rounded-full bg-red-500 blur-md opacity-0 group-active:opacity-20 transition-opacity"></div>
          <span className="material-symbols-outlined text-4xl font-black">close</span>
        </button>
        
        <button 
          onClick={() => handleAnswer(true)} 
          disabled={isAnswering}
          className="group relative size-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center active:scale-75 transition-all disabled:opacity-50"
        >
          <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-0 group-active:opacity-20 transition-opacity"></div>
          <span className="material-symbols-outlined text-4xl font-black">check</span>
        </button>
      </footer>
    </div>
  );
};

export default Gameplay;