
import React, { useState, useRef } from 'react';
import { toPng } from 'https://esm.sh/html-to-image';
import { GameState } from '../types';
import { audioManager } from '../audio';
import { saveScoreToCloud } from '../firebase';

interface SummaryProps {
  state: any; 
  onRestart: () => void;
  onRegister: () => void;
  onRanking: () => void;
  onHome: () => void;
}

const Summary: React.FC<SummaryProps> = ({ state, onRestart, onRegister, onRanking, onHome }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'DONE'>('IDLE');
  const summaryRef = useRef<HTMLDivElement>(null);
  
  const duration = state.endTime ? Math.floor((state.endTime - state.startTime) / 1000) : 0;
  const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
  const seconds = (duration % 60).toString().padStart(2, '0');
  
  const correctCount = state.answersHistory.filter((a: boolean) => a).length;
  const accuracy = (correctCount / state.questions.length) * 100;

  const handleSyncScore = async () => {
    if (!state.user) {
      onRegister();
      return;
    }

    audioManager.play('click');
    setSyncStatus('SYNCING');
    
    const success = await saveScoreToCloud(state.user, state.score);
    
    if (success) {
      setSyncStatus('DONE');
      audioManager.play('whistle');
      setTimeout(() => onRanking(), 1000);
    } else {
      setSyncStatus('IDLE');
      alert("Error al sincronizar con Firebase. Intenta de nuevo.");
    }
  };

  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    
    audioManager.play('click');
    setIsProcessing(true);
    
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(summaryRef.current, {
        cacheBust: true,
        backgroundColor: '#102216',
        pixelRatio: 2,
        style: {
          borderRadius: '0'
        }
      });
      
      const link = document.createElement('a');
      link.download = `genio-mundialista-score-${Math.floor(state.score)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden bg-background-dark">
      {/* BOTÓN HOME / CERRAR */}
      <div className="absolute top-6 left-6 z-30">
        <button 
          onClick={onHome}
          className="size-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all backdrop-blur-md"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div ref={summaryRef} className="flex-1 flex flex-col p-6 bg-background-dark soccer-pattern">
        <header className="pt-12 text-center z-10">
          {state.user && (
            <div className="mb-2 inline-block px-4 py-1 bg-primary text-background-dark rounded-full">
               <span className="text-[10px] font-black uppercase italic tracking-tighter">
                 PARTIDAZO DE: {state.user.identificador}
               </span>
            </div>
          )}
          <h1 className="text-primary text-4xl font-[900] italic tracking-tighter uppercase mb-2">
            RETO FINALIZADO
          </h1>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Estadísticas de tus 10 jugadas</p>
        </header>

        <main className="flex-1 flex flex-col justify-center gap-6 z-10 py-8">
          <div className="w-full relative bg-card-bg rounded-2xl p-8 border border-primary/30 shadow-[0_0_30px_rgba(19,236,91,0.1)] flex flex-col items-center text-center">
            <div className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Puntuación Total</div>
            <div className="text-primary text-6xl font-[900] mb-8 tracking-tighter italic drop-shadow-lg">
              {Math.floor(state.score).toLocaleString()}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full mb-8">
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-primary text-xl font-black">{correctCount}</span>
                <span className="text-white/40 text-[8px] font-bold uppercase">Goles</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white text-xl font-black">{minutes}:{seconds}</span>
                <span className="text-white/40 text-[8px] font-bold uppercase">Minutos</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-secondary text-xl font-black">{accuracy}%</span>
                <span className="text-white/40 text-[8px] font-bold uppercase">Precisión</span>
              </div>
            </div>

            <div className="w-full space-y-3">
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest text-left">Mapa del partido</p>
               <div className="flex gap-1.5 justify-between w-full">
                  {state.answersHistory.map((ans: boolean, i: number) => (
                    <div 
                      key={i} 
                      className={`h-2 flex-1 rounded-full ${ans ? 'bg-primary shadow-[0_0_8px_rgba(19,236,91,0.5)]' : 'bg-danger/30'}`}
                    ></div>
                  ))}
               </div>
            </div>
            
            <div className="mt-8 flex flex-col items-center opacity-40">
                <img 
                  src="https://pngimg.com/uploads/football/football_PNG52789.png" 
                  alt="Ball Logo"
                  className="w-10 h-10 object-contain mb-1"
                />
                <span className="text-[8px] font-black uppercase text-white tracking-widest">El Genio Mundialista</span>
            </div>
          </div>
        </main>
      </div>

      <footer className="p-6 pt-0 z-10 space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={handleDownloadImage}
                disabled={isProcessing}
                className={`flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-xs italic ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
            >
                <span className="material-symbols-outlined text-sm font-black">download</span>
                IMAGEN
            </button>
            <button 
                onClick={onRanking}
                className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold py-4 rounded-2xl border border-secondary/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-xs italic"
            >
                <span className="material-symbols-outlined text-sm font-black">leaderboard</span>
                RANKING
            </button>
        </div>

        <button 
            onClick={handleSyncScore}
            disabled={syncStatus === 'SYNCING'}
            className={`w-full bg-white text-background-dark font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter italic ${syncStatus === 'SYNCING' ? 'opacity-50' : ''}`}
        >
            <span className={`material-symbols-outlined font-black ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`}>
              {syncStatus === 'DONE' ? 'cloud_done' : 'cloud_upload'}
            </span>
            {syncStatus === 'SYNCING' ? 'SINCRONIZANDO...' : state.user ? 'GUARDAR EN LA NUBE' : 'REGISTRAR MI MARCA'}
        </button>

        <button 
          onClick={onRestart}
          className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(19,236,91,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-xl italic"
        >
          NUEVO RETO
          <span className="material-symbols-outlined font-black">refresh</span>
        </button>

        {/* BOTÓN TEXTO VOLVER AL INICIO */}
        <button 
          onClick={onHome}
          className="w-full py-2 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] active:text-white/50 transition-colors"
        >
          SALIR AL INICIO
        </button>
      </footer>
    </div>
  );
}
export default Summary;
