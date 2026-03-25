import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, Difficulty } from '../../types';

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
  if (!question) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-16 h-16 4k:w-40 4k:h-40 border-4 4k:border-[12px] border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  const calculateInitialTime = () => {
    const baseDifficultyMap: Record<Difficulty, number> = {
      'Banca': 15,
      'Amateur': 13,
      'PRO': 11,
      'Leyenda': 10
    };
    const baseTime = baseDifficultyMap[difficulty] || timeLimit || 15;
    const penalty = (index * 0.4) + (Math.floor(streak / 3) * 0.5);
    return Math.max(4, Math.floor(baseTime - penalty));
  };

  const initialTime = useMemo(() => calculateInitialTime(), [question.id_pregunta]);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isAnswering, setIsAnswering] = useState(false);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  
  const SWIPE_THRESHOLD = 150; // Umbral aumentado para pantalla física grande
  const timeProgress = (timeLeft / initialTime) * 100;

  useEffect(() => {
    setTimeLeft(initialTime);
    setDragOffset({ x: 0, y: 0 });
    setIsAnswering(false);
  }, [question.id_pregunta, initialTime]);

  useEffect(() => {
    if (timeLeft <= 0 && !isAnswering) {
      handleAnswer(null);
      return;
    }
    if (isAnswering) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswering]);

  const handleAnswer = (userAnswer: boolean | null) => {
    if (isAnswering) return;
    setIsAnswering(true);
    const isCorrect = userAnswer === null ? false : userAnswer === question.respuesta_correcta;
    setTimeout(() => onAnswer(isCorrect), 200);
  };

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
    setDragOffset({ x: x - touchStart.current.x, y: (y - touchStart.current.y) * 0.2 });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x > SWIPE_THRESHOLD) handleAnswer(true);
    else if (dragOffset.x < -SWIPE_THRESHOLD) handleAnswer(false);
    else setDragOffset({ x: 0, y: 0 });
  };

  const isUrgent = timeLeft <= 3;
  const stampOpacity = Math.min(Math.abs(dragOffset.x) / (SWIPE_THRESHOLD * 0.8), 1);

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 lg:p-12 3xl:p-20 4k:p-40 max-w-md lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-7xl 4k:max-w-[2200px] mx-auto w-full overflow-hidden select-none bg-[#0a0a0a]" style={{ backgroundImage: "url('/images/fondo 3.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      
      {/* Header Escalado */}
      <header className="shrink-0 pt-4 4k:pt-20 z-30 space-y-6 4k:space-y-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 4k:gap-16">
            <div className={`flex items-center gap-3 4k:gap-12 px-6 4k:px-20 py-3 4k:py-12 rounded-full border 4k:border-[10px] transition-colors ${isUrgent ? 'bg-danger/20 border-danger/40 animate-pulse' : 'bg-card-bg border-white/10'}`}>
              <span className={`material-symbols-outlined text-lg 4k:text-[100px] ${isUrgent ? 'text-danger' : 'text-primary'}`}>timer</span>
              <span className={`text-xl lg:text-3xl 4k:text-[120px] font-black tracking-tighter ${isUrgent ? 'text-danger' : 'text-white'}`}>{timeLeft}s</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 4k:gap-20" style={{ backgroundImage: "url('/images/fondo 3.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
             <div className="bg-white/5 px-6 4k:px-20 py-2 4k:py-10 rounded-full border border-white/10 4k:border-[8px]">
                <span className="text-sm lg:text-xl 4k:text-6xl text-white/40 font-bold uppercase tracking-widest">{difficulty}</span>
             </div>
             <div className="bg-primary/10 px-6 4k:px-20 py-2 4k:py-10 rounded-full border border-primary/20 4k:border-[8px] flex items-center gap-4 4k:gap-10">
               <span className="text-primary font-black text-xl lg:text-3xl 4k:text-8xl">{streak}</span>
               <span className="material-symbols-outlined text-primary text-lg 4k:text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
             </div>
          </div>
        </div>
        
        {/* Barra de Tiempo Gruesa para pantalla gigante */}
        <div className="h-4 4k:h-12 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-danger' : 'bg-primary'}`} 
            style={{ width: `${timeProgress}%` }}
          ></div>
        </div>
      </header>

      {/* Main Container con perspectiva */}
      <main 
        className="flex-1 flex flex-col items-center justify-center gap-12 4k:gap-60 perspective-1000"
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
      >
        {/* Tarjeta de Pregunta Escalada */}
        <div 
          className={`relative w-full max-w-[500px] lg:max-w-[800px] xl:max-w-[1000px] 4k:max-w-[2000px] aspect-[3/4] transition-transform ${!isDragging ? 'duration-500' : 'duration-0'}`}
          style={{ 
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x / 15}deg)`,
            opacity: isAnswering ? 0 : 1
          }}
        >
          {/* Sellos de Feedback de Swipe Gigantes */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            style={{ opacity: stampOpacity }}
          >
            {dragOffset.x > 0 ? (
              <div className="border-[12px] 4k:border-[40px] border-primary text-primary font-black text-6xl lg:text-9xl 4k:text-[280px] px-12 4k:px-40 py-6 4k:py-20 rounded-[3rem] 4k:rounded-[8rem] -rotate-12 uppercase bg-[#0a0a0a]/90 shadow-[0_0_100px_rgba(249,115,22,0.4)]">¡GOL!</div>
            ) : (
              <div className="border-[12px] 4k:border-[40px] border-danger text-danger font-black text-6xl lg:text-9xl 4k:text-[280px] px-12 4k:px-40 py-6 4k:py-20 rounded-[3rem] 4k:rounded-[8rem] rotate-12 uppercase bg-[#0a0a0a]/90 shadow-[0_0_100px_rgba(239,68,68,0.4)]">OFFSIDE</div>
            )}
          </div>

          <div className="absolute inset-0 bg-card-bg rounded-[3rem] 4k:rounded-[10rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 4k:border-[12px] flex flex-col">
            
            {/* Cabecera Visual de la Tarjeta */}
            <div className="relative h-[35%] bg-[#0f0f0f] flex items-center justify-center border-b border-white/5 4k:border-b-[10px]">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <img 
                  src="/images/icon general.svg" 
                  alt="Balón"
                  className={`w-32 h-32 lg:w-60 lg:h-60 4k:w-[600px] 4k:h-[600px] object-contain drop-shadow-[0_0_80px_rgba(245,130,31,0.6)] transition-transform ${isUrgent ? 'animate-bounce' : 'rotate-12'}`}
                />
                <div className="absolute bottom-6 4k:bottom-20 flex items-center gap-4">
                   <span className="text-white/20 text-sm lg:text-2xl 4k:text-6xl font-black uppercase tracking-[0.3em]"></span>
                </div>
            </div>
            
            {/* Texto de la Pregunta */}
            <div className="flex-1 p-10 lg:p-20 4k:p-40 flex flex-col justify-between items-center text-center">
              <h2 className={`text-white text-2xl lg:text-5xl 4k:text-[130px] font-bold leading-tight italic transition-colors 4k:leading-[1.1] ${isUrgent ? 'text-danger' : ''}`}>
                "{question.pregunta}"
              </h2>
              
              <div className="w-full grid grid-cols-2 gap-8 pt-12 4k:pt-40 border-t border-white/5 4k:border-t-[10px] opacity-40">
                <div className="flex flex-col items-center gap-4">
                   <span className="material-symbols-outlined text-danger text-4xl 4k:text-[160px]">chevron_left</span>
                   <span className="text-xs lg:text-2xl 4k:text-6xl font-black uppercase text-danger">Falso</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                   <span className="material-symbols-outlined text-primary text-4xl 4k:text-[160px]">chevron_right</span>
                   <span className="text-xs lg:text-2xl 4k:text-6xl font-black uppercase text-primary">Verdad</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Respuesta de Gran Tamaño */}
        <div className="flex justify-center gap-16 lg:gap-32 4k:gap-[300px] pb-20 4k:pb-40">
          <button 
            onClick={() => handleAnswer(false)} 
            disabled={isAnswering}
            className="group relative size-24 lg:size-40 4k:size-[400px] rounded-full bg-danger/10 text-danger border border-danger/20 4k:border-[20px] flex items-center justify-center active:scale-75 transition-all disabled:opacity-50"
          >
            <div className="absolute inset-0 rounded-full bg-danger blur-2xl opacity-0 group-active:opacity-30 transition-opacity"></div>
            <img src="/images/icono f.svg" alt="Falso" className="size-12 lg:size-20 4k:size-[200px] object-contain" />
          </button>
          
          <button 
            onClick={() => handleAnswer(true)} 
            disabled={isAnswering}
            className="group relative size-24 lg:size-40 4k:size-[400px] rounded-full bg-primary/10 text-primary border border-primary/20 4k:border-[20px] flex items-center justify-center active:scale-75 transition-all disabled:opacity-50"
          >
            <div className="absolute inset-0 rounded-full bg-primary blur-2xl opacity-0 group-active:opacity-30 transition-opacity"></div>
            <img src="/images/icono v.svg" alt="Verdadero" className="size-12 lg:size-20 4k:size-[200px] object-contain" />
          </button>
        </div>
      </main>

    </div>
  );
};

export default Gameplay;