import React from 'react';
import { Question } from '../types';

interface FeedbackProps {
  isCorrect: boolean;
  question: Question;
  onNext: () => void;
  pointsEarned: number; // Mantenemos la lógica de puntos dinámicos
}

const Feedback: React.FC<FeedbackProps> = ({ isCorrect, question, onNext, pointsEarned }) => {
  const respuestaTexto = question.respuesta_correcta ? 'VERDADERO' : 'FALSO';

  return (
    <div className={`min-h-[100dvh] flex flex-col p-6 max-w-md mx-auto relative overflow-hidden ${isCorrect ? 'bg-background-dark' : 'bg-[#221010]'}`}>
      
      {/* Decoración de fondo estilo Confetti */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className={`absolute top-10 left-10 w-2 h-2 rounded-full ${isCorrect ? 'bg-primary' : 'bg-danger'} rotate-12 animate-ping`}></div>
          <div className={`absolute top-40 right-20 w-3 h-3 rounded-full ${isCorrect ? 'bg-secondary' : 'bg-danger'} -rotate-45`}></div>
      </div>

      <header className="pt-6 text-center z-10">
        <h1 className={`text-5xl font-[900] italic tracking-tighter uppercase mb-2 ${isCorrect ? 'text-primary' : 'text-danger'} drop-shadow-lg`}>
          {isCorrect ? '¡CORRECTO!' : '¡UPA! CASI...'}
        </h1>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
          {isCorrect ? '¡Vas por buen camino, crack!' : 'El VAR ha sentenciado la jugada'}
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center z-10 overflow-y-auto no-scrollbar py-4">
        <div className={`w-full relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col ${isCorrect ? 'bg-primary' : 'bg-danger'}`}>
          
          {/* Header de la Tarjeta con Iconos de esquina */}
          <div className="relative h-48 w-full bg-black/20 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <span className="material-symbols-outlined absolute top-4 left-4 text-white/20 text-4xl">{isCorrect ? 'star' : 'close'}</span>
            <span className="material-symbols-outlined absolute bottom-4 right-4 text-white/20 text-4xl">{isCorrect ? 'star' : 'close'}</span>

            <div className="relative z-10 flex flex-col items-center">
              <div className="size-24 rounded-2xl bg-white flex items-center justify-center shadow-inner mb-3">
                <span className="material-symbols-outlined text-6xl" style={{ color: isCorrect ? '#f5821f' : '#f20d0d', fontVariationSettings: "'FILL' 1" }}>
                  {isCorrect ? 'emoji_events' : 'monitor_heart'}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase border border-white/10">
                  {isCorrect ? 'CAMPEÓN DEL MUNDO' : 'VAR REVIEW: NO GOL'}
                </div>
                <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-1 rounded-lg text-xs font-black tracking-widest border border-white/20">
                  {respuestaTexto}
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo con la Explicación */}
          <div className="p-8 bg-card-bg flex flex-col items-center gap-6">
            <div className={`w-12 h-1 rounded-full ${isCorrect ? 'bg-primary' : 'bg-danger'}`}></div>
            
            <div className="space-y-3 text-center">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Análisis del experto:</p>
                <p className="text-white text-lg font-bold leading-tight italic px-2">
                  "{question.explicacion || 'No hay dudas, el fútbol es así.'}"
                </p>
            </div>

            {/* PUNTOS DINÁMICOS */}
            <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
              <span className={`material-symbols-outlined text-sm ${isCorrect ? 'text-primary' : 'text-danger'}`}>
                {isCorrect ? 'bolt' : 'error'}
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
          className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl uppercase italic ${isCorrect ? 'bg-primary text-background-dark' : 'bg-white text-danger'}`}
        >
          Siguiente Reto
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default Feedback;