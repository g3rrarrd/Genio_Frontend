import React from 'react';
import { Question } from '../types';

interface FeedbackProps {
  isCorrect: boolean;
  question: Question;
  onNext: () => void;
  pointsEarned: number; // Recibimos los puntos calculados de App.tsx
}

const Feedback: React.FC<FeedbackProps> = ({ isCorrect, question, onNext, pointsEarned }) => {
  const respuestaTexto = question.respuesta_correcta ? 'VERDADERO' : 'FALSO';

  return (
    <div className={`min-h-[100dvh] flex flex-col p-6 max-w-md mx-auto relative overflow-hidden ${isCorrect ? 'bg-background-dark' : 'bg-[#1a0a0a]'}`}>
      
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className={`absolute top-10 left-10 w-2 h-2 rounded-full ${isCorrect ? 'bg-primary' : 'bg-red-500'} rotate-12 animate-ping`}></div>
         <div className={`absolute top-40 right-20 w-3 h-3 rounded-full ${isCorrect ? 'bg-secondary' : 'bg-red-500'} -rotate-45`}></div>
      </div>

      <header className="pt-6 text-center z-10">
        <h1 className={`text-5xl font-[900] italic tracking-tighter uppercase mb-2 ${isCorrect ? 'text-primary' : 'text-red-500'} drop-shadow-[0_0_15px_rgba(242,13,13,0.3)]`}>
          {isCorrect ? '¡CORRECTO!' : '¡FUERA DE JUEGO!'}
        </h1>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
          {isCorrect ? '¡Impecable definición!' : 'El VAR ha revisado la jugada'}
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center z-10">
        <div className={`w-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col ${isCorrect ? 'bg-primary' : 'bg-red-600'}`}>
          
          {/* Header de la Tarjeta */}
          <div className="relative h-40 w-full bg-black/20 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="size-20 rounded-2xl bg-white flex items-center justify-center shadow-xl mb-2">
                <span className="material-symbols-outlined text-5xl" style={{ color: isCorrect ? '#13ec5b' : '#f20d0d', fontVariationSettings: "'FILL' 1" }}>
                  {isCorrect ? 'emoji_events' : 'gavel'}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Respuesta Correcta</span>
                <div className="bg-black text-white px-4 py-1 rounded-lg text-sm font-black tracking-tighter border border-white/20">
                  {respuestaTexto}
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo con la Explicación */}
          <div className="p-8 bg-card-bg flex flex-col items-center gap-6">
            <div className={`w-12 h-1 rounded-full ${isCorrect ? 'bg-primary' : 'bg-red-500'}`}></div>
            
            <div className="space-y-3 text-center">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Análisis del experto:</p>
                <p className="text-white text-lg font-bold leading-tight italic px-2">
                  "{question.explicacion || 'No hay dudas, el fútbol es así.'}"
                </p>
            </div>

            {/* PUNTOS DINÁMICOS AQUÍ */}
            <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
              <span className={`material-symbols-outlined text-sm ${isCorrect ? 'text-primary' : 'text-red-500'}`}>
                {isCorrect ? 'bolt' : 'history_toggle_off'}
              </span>
              <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">
                {isCorrect ? `+${Math.floor(pointsEarned)} PUNTOS` : '0 PUNTOS'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 z-10">
        <button 
          onClick={onNext}
          className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl uppercase italic ${isCorrect ? 'bg-primary text-background-dark' : 'bg-white text-red-600'}`}
        >
          Siguiente Jugada
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default Feedback;