import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 3xl:p-10 4k:p-14">
      <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-52 lg:h-52 3xl:w-72 3xl:h-72 4k:w-96 4k:h-96 flex items-center justify-center">
        {/* Círculos de pulso detrás del balón */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse"></div>
        
        {/* Balón animado */}
        <img 
          src="https://pngimg.com/uploads/football/football_PNG52789.png" 
          className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 3xl:w-44 3xl:h-44 4k:w-60 4k:h-60 object-contain animate-bounce drop-shadow-[0_0_20px_rgba(245,130,31,0.6)]"
          alt="Cargando..."
        />
      </div>

      <div className="mt-6 sm:mt-8 3xl:mt-12 4k:mt-16 text-center space-y-2 3xl:space-y-4 4k:space-y-6">
        <h3 className="text-primary text-xl sm:text-2xl lg:text-3xl 3xl:text-4xl 4k:text-5xl font-black italic uppercase tracking-tighter animate-pulse">
          ALISTANDO CANCHA
        </h3>
        <div className="flex items-center justify-center gap-1 3xl:gap-2 4k:gap-3">
          <div className="w-1.5 h-1.5 3xl:w-3 3xl:h-3 4k:w-4 4k:h-4 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 3xl:w-3 3xl:h-3 4k:w-4 4k:h-4 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 3xl:w-3 3xl:h-3 4k:w-4 4k:h-4 bg-white/60 rounded-full animate-bounce"></div>
        </div>
        <p className="text-white/30 text-[10px] 3xl:text-sm 4k:text-base font-bold uppercase tracking-[0.3em] mt-4 3xl:mt-6 4k:mt-8">
          Trayendo preguntas desde el VAR...
        </p>
      </div>
      
      {/* Decoración de pasto/línea de fondo */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
    </div>
  );
};

export default LoadingScreen;