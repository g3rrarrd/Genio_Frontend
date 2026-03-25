import React from 'react';
import { Question } from '../../types';

interface FeedbackProps {
  isCorrect: boolean;
  question: Question;
  onNext: () => void;
  pointsEarned: number;
}

const Feedback: React.FC<FeedbackProps> = ({ isCorrect, question, onNext, pointsEarned }) => {
  const respuestaTexto = question.respuesta_correcta ? 'VERDADERO' : 'FALSO';

  return (
    <div className={`min-h-[100dvh] flex flex-col p-6 3xl:p-16 4k:p-40 max-w-md lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-7xl 4k:max-w-[2200px] mx-auto relative overflow-x-hidden transition-colors duration-500 ${isCorrect ? 'bg-[#102210]' : 'bg-[#221010]'}`} >
      
      {/* Decoración de fondo escalada */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className={`absolute top-20 left-20 size-8 4k:size-32 rounded-full ${isCorrect ? 'bg-primary' : 'bg-danger'} animate-ping`}></div>
          <div className={`absolute top-1/4 right-40 size-12 4k:size-48 rounded-full ${isCorrect ? 'bg-secondary' : 'bg-danger'} animate-bounce`}></div>
          <div className={`absolute bottom-1/3 left-1/2 size-10 4k:size-40 rounded-full bg-white/10`}></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center z-10 space-y-12 4k:space-y-40">
        
        {/* ICONO Y ESTADO GIGANTE */}
        <div className="flex flex-col items-center text-center space-y-6 4k:space-y-20">
          <div className={`size-32 lg:size-56 3xl:size-72 4k:size-[700px] rounded-full flex items-center justify-center border-4 4k:border-[20px] shadow-2xl transition-transform duration-700 scale-110 ${isCorrect ? 'bg-primary/10 border-primary shadow-primary/20' : 'bg-danger/10 border-danger shadow-danger/20'}`}>
            {isCorrect ? (
              <img src="/images/icono victoria.svg" alt="Correcto" className="size-20 lg:size-40 3xl:size-56 4k:size-[500px] object-contain" />
            ) : (
              <img src="/images/icono fallaste.svg" alt="Fallaste" className="size-20 lg:size-40 3xl:size-56 4k:size-[500px] object-contain" />
            )}
          </div>

          <div className="space-y-2 4k:space-y-10">
            <h1 className={`text-5xl lg:text-7xl 3xl:text-9xl 4k:text-[250px] font-black italic uppercase tracking-tighter ${isCorrect ? 'text-green-400' : 'text-danger'}`}>
              {isCorrect ? '¡GOLAZO!' : 'OFFSIDE'}
            </h1>
            <p className="text-white/40 text-xs 3xl:text-2xl 4k:text-6xl font-bold uppercase tracking-[0.4em]">
              {isCorrect ? 'Respuesta Correcta' : 'Jugada No Válida'}
            </p>
          </div>
        </div>

        {/* CONTENEDOR DE INFORMACIÓN ESCALADO */}
        <div className="w-full bg-card-bg border-2 4k:border-[12px] border-white/5 4k:border-white/10 rounded-[3rem] 4k:rounded-[8rem] p-8 3xl:p-16 4k:p-32 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 4k:p-20 opacity-10">
             <span className="material-symbols-outlined text-6xl 4k:text-[250px] text-white">info</span>
          </div>

          <div className="space-y-8 4k:space-y-24 text-center">
            <div className="space-y-4 4k:space-y-12">
                <span className="text-[10px] 3xl:text-xl 4k:text-5xl font-black uppercase text-white/30 tracking-[0.2em]">La respuesta era</span>
                <div className={`text-2xl 3xl:text-5xl 4k:text-[120px] font-black italic uppercase ${isCorrect ? 'text-green-400' : 'text-white'}`}>
                    {respuestaTexto}
                </div>
            </div>

            <div className="bg-background-dark/50 rounded-[2rem] 4k:rounded-[4rem] p-6 3xl:p-12 4k:p-24 border border-white/5 4k:border-[8px]">
                <p className="text-sm 3xl:text-2xl 4k:text-6xl text-white/80 font-medium leading-relaxed 4k:leading-[1.4] italic">
                    "{question.explicacion || '¡Sigue así, vas por buen camino para ser una leyenda del mundial!'}"
                </p>
            </div>

            {/* MARCADOR DE PUNTOS ESCALADO */}
            <div className="flex items-center justify-center gap-4 4k:gap-16 px-8 4k:px-24 py-4 4k:py-16 bg-white/5 rounded-full border border-white/10 4k:border-[8px] mx-auto w-fit">
              <span className={`material-symbols-outlined text-2xl 3xl:text-4xl 4k:text-[100px] ${isCorrect ? 'text-green-400' : 'text-danger'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isCorrect ? 'bolt' : 'error'}
              </span>
              <span className="text-white text-base 3xl:text-3xl 4k:text-7xl font-black uppercase tracking-widest">
                {isCorrect ? `+1 PUNTO` : '0 PUNTOS'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 4k:py-40 z-10 shrink-0">
        <button 
          onClick={onNext}
          className={`w-full h-16 lg:h-24 3xl:h-32 4k:h-56 rounded-3xl 4k:rounded-[5rem] flex items-center justify-center gap-4 4k:gap-12 text-lg 3xl:text-4xl 4k:text-8xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-2xl ${
            isCorrect ? 'bg-primary text-background-dark' : 'bg-white/10 text-white'
          }`}
        >
          {isCorrect ? 'SIGUIENTE JUGADA' : 'INTENTAR DE NUEVO'}
          <span className="material-symbols-outlined text-2xl 3xl:text-5xl 4k:text-[100px] font-black">
            {isCorrect ? 'double_arrow' : 'refresh'}
          </span>
        </button>
      </footer>
    </div>
  );
};

export default Feedback;