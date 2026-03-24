import React, { useState, useRef } from 'react';
import { toPng } from 'https://esm.sh/html-to-image';
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
  const accuracy = state.questions.length > 0 ? (correctCount / state.questions.length) * 100 : 0;

  const handleSyncScore = async () => {
    if (!state.user) {
      onRegister();
      return;
    }
    audioManager.play('click');
    setSyncStatus('SYNCING');
    const success = await saveScoreToCloud(state.user, state.score);
    setSyncStatus(success ? 'DONE' : 'IDLE');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 3xl:p-16 4k:p-40 max-w-md lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-7xl 4k:max-w-[2200px] mx-auto bg-background-dark overflow-x-hidden">
      
      <header className="pt-4 4k:pt-20 flex flex-col items-center gap-4 4k:gap-12 z-10 shrink-0 mb-12 4k:mb-32">
        <span className="text-[10px] 3xl:text-xl 4k:text-6xl uppercase tracking-[0.4em] text-primary font-black italic">Final del Partido</span>
        <h1 className="text-3xl 3xl:text-6xl 4k:text-[150px] font-black italic text-white uppercase tracking-tighter">ESTADÍSTICAS</h1>
      </header>

      <main className="flex-1 flex flex-col items-center z-10 gap-10 4k:gap-32">
        
        {/* TARJETA DE RESULTADOS GIGANTE */}
        <div 
          ref={summaryRef}
          className="w-full bg-card-bg rounded-[3rem] 4k:rounded-[8rem] border-2 4k:border-[15px] border-primary/30 p-8 3xl:p-16 4k:p-40 shadow-[0_0_100px_rgba(245,130,31,0.15)] relative overflow-hidden"
        >
          {/* Fondo decorativo de la tarjeta */}
          <div className="absolute top-0 right-0 p-10 4k:p-32 opacity-5">
             <span className="material-symbols-outlined text-9xl 4k:text-[500px] text-white">emoji_events</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-12 4k:space-y-40">
            
            {/* PUNTAJE GIGANTE */}
            <div className="space-y-2 4k:space-y-10">
               <span className="text-[10px] 3xl:text-2xl 4k:text-7xl font-black uppercase text-white/30 tracking-[0.3em]">Puntaje Final</span>
               <div className="text-7xl 3xl:text-9xl 4k:text-[400px] font-black italic text-primary leading-none drop-shadow-[0_0_40px_rgba(245,130,31,0.4)]">
                {Math.floor(state.score)}
               </div>
            </div>

            {/* GRILLA DE STATS ESCALADA */}
            <div className="grid grid-cols-3 gap-6 3xl:gap-12 4k:gap-24 w-full">
               <div className="bg-white/5 rounded-3xl 4k:rounded-[5rem] p-6 3xl:p-10 4k:p-24 border border-white/5 4k:border-[8px] flex flex-col items-center gap-3 4k:gap-10">
                  <span className="material-symbols-outlined text-primary text-3xl 3xl:text-5xl 4k:text-[150px]">check_circle</span>
                  <div className="flex flex-col">
                    <span className="text-xl 3xl:text-4xl 4k:text-[100px] font-black text-white">{correctCount}</span>
                        <p>""</p>
                    <span className="text-[8px] 3xl:text-lg 4k:text-5xl font-bold uppercase text-white/30 tracking-widest italic">Goles</span>
                  </div>
               </div>
               <div className="bg-white/5 rounded-3xl 4k:rounded-[5rem] p-6 3xl:p-10 4k:p-24 border border-white/5 4k:border-[8px] flex flex-col items-center gap-3 4k:gap-10">
                  <span className="material-symbols-outlined text-secondary text-3xl 3xl:text-5xl 4k:text-[150px]">timer</span>
                  <div className="flex flex-col">
                    <span className="text-xl 3xl:text-4xl 4k:text-[100px] font-black text-white">{minutes}:{seconds}</span>
                        <p>""</p>
                    <span className="text-[8px] 3xl:text-lg 4k:text-5xl font-bold uppercase text-white/30 tracking-widest italic">Tiempo</span>
                  </div>
               </div>
               <div className="bg-white/5 rounded-3xl 4k:rounded-[5rem] p-6 3xl:p-10 4k:p-24 border border-white/5 4k:border-[8px] flex flex-col items-center gap-3 4k:gap-10">
                  <span className="material-symbols-outlined text-orange-400 text-3xl 3xl:text-5xl 4k:text-[150px]">insights</span>
                  <div className="flex flex-col">
                    <span className="text-xl 3xl:text-4xl 4k:text-[100px] font-black text-white">{Math.round(accuracy)}%</span>
                        <p>""</p>
                    <span className="text-[8px] 3xl:text-lg 4k:text-5xl font-bold uppercase text-white/30 tracking-widest italic">Efectividad</span>
                  </div>
               </div>
            </div>

            {/* VISUALIZADOR DE HISTORIAL GRUESO */}
            <div className="w-full space-y-4 4k:space-y-12">
               <div className="flex justify-between items-center text-[10px] 3xl:text-xl 4k:text-6xl font-black uppercase text-white/20 tracking-widest italic px-2">
                 <span>Historial de Jugadas</span>
                 <span>{state.questions.length} Total</span>
               </div>
               <div className="flex gap-2 3xl:gap-3 4k:gap-8 h-4 3xl:h-6 4k:h-16 w-full">
                  {state.answersHistory.map((ans: boolean, i: number) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full ${ans ? 'bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-red-500/20 border border-red-500/30 4k:border-4'}`}
                    ></div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* BOTÓN DE RANKING */}
        <div className="w-full pb-12 4k:pb-40">
            <button 
              onClick={onRanking}
              className="w-full h-16 3xl:h-24 4k:h-56 bg-primary text-background-dark font-black rounded-3xl 4k:rounded-[5rem] text-lg 3xl:text-3xl 4k:text-8xl italic uppercase tracking-widest shadow-[0_8px_40px_rgba(245,130,31,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-4 4k:gap-12"
            >
              <span className="material-symbols-outlined text-3xl 3xl:text-5xl 4k:text-[100px] font-black">leaderboard</span>
              VER RANKING
            </button>
        </div>
      </main>
    </div>
  );
};

export default Summary;
