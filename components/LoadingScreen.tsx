import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Círculos de pulso detrás del balón */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse"></div>
        
        {/* Balón animado */}
        <img 
          src="https://pngimg.com/uploads/football/football_PNG52789.png" 
          className="w-24 h-24 object-contain animate-bounce drop-shadow-[0_0_20px_rgba(19,236,91,0.6)]"
          alt="Cargando..."
        />
      </div>

      <div className="mt-8 text-center space-y-2">
        <h3 className="text-primary text-2xl font-black italic uppercase tracking-tighter animate-pulse">
          ALISTANDO CANCHA
        </h3>
        <div className="flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
        </div>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-4">
          Trayendo preguntas desde el VAR...
        </p>
      </div>
      
      {/* Decoración de pasto/línea de fondo */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
    </div>
  );
};

export default LoadingScreen;