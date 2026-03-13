
import React from 'react';
import { User } from '../types';

interface HomeProps {
  user?: User | null;
  onStart: () => void;
  onLogin: () => void;
  onProfile: () => void;
  isSyncing ?: boolean;
}

const Home: React.FC<HomeProps> = ({ user, onStart, onLogin, onProfile, isSyncing }) => {
  const getEmblemaColor = (icon?: string) => {
    const colors: Record<string, string> = {
      'sports_soccer': '#f97316',
      'crown': '#f4f425',
      'grade': '#a855f7',
      'bolt': '#f20d0d'
    };
    return colors[icon || ''] || '#f97316';
  };

  const userColor = getEmblemaColor(user?.emblema);
  
  return (
    <div className="h-full flex flex-col justify-between p-4 py-6">
      <header className="flex items-center justify-between px-2 z-10 shrink-0">
        <div className="flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10">
          <span className="material-symbols-outlined text-xl">menu</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-[0.2em] text-primary font-bold">The Ultimate Challenge</span>
          <h2 className="text-white text-xs font-bold leading-tight tracking-tight">EL GENIO MUNDIALISTA</h2>
        </div>

        {/* BOTÓN DE PERFIL CON CARGA DINÁMICA */}
        <button 
          onClick={user ? onProfile : onLogin}
          disabled={isSyncing}
          className="flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10 relative overflow-hidden active:scale-95 transition-transform"
        >
          {isSyncing ? (
            // Spinner pequeño mientras sincroniza
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <div 
              className="flex items-center justify-center w-full h-full"
              style={{ backgroundColor: `${userColor}20` }}
            >
               <span 
                className="material-symbols-outlined text-xl"
                style={{ color: userColor, fontVariationSettings: "'FILL' 1" }}
               >
                {user.emblema || 'person'}
               </span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-xl">account_circle</span>
          )}
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center gap-6 text-center overflow-hidden">
        <section className="shrink-0">
          {user && (
            <div className={`mb-2 inline-block px-3 py-0.5 bg-primary/10 rounded-full border border-primary/30 transition-opacity ${isSyncing ? 'opacity-50' : 'opacity-100'}`}>
                <span className="text-primary text-[8px] font-black uppercase tracking-widest italic">
                  {isSyncing ? 'Sincronizando...' : `Hola, ${user.identificador}`}
                </span>
            </div>
          )}
          <h1 className="text-primary tracking-tighter text-[38px] sm:text-[54px] font-black leading-[0.85] italic uppercase drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            ¿SABES MÁS QUE EL GENIO?
          </h1>
        </section>

        <section className="relative w-full max-w-[240px] aspect-square flex items-center justify-center shrink-0">
           <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px]"></div>
           <div className="w-full h-full bg-gradient-to-b from-primary/10 to-transparent rounded-full flex items-center justify-center border border-white/5 relative">
              <span className="material-symbols-outlined text-primary/40 text-2xl absolute top-4 left-1/4 animate-pulse">auto_awesome</span>
              <img 
                src="https://pngimg.com/uploads/football/football_PNG52789.png" 
                alt="Balón de Fútbol" 
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-[0_20px_60px_rgba(249,115,22,0.5)] scale-110 rotate-12 transition-transform hover:rotate-45 duration-700"
              />
           </div>
        </section>

        <section className="space-y-6 w-full shrink-0">
          <p className="text-white/80 text-lg font-medium leading-tight max-w-[240px] mx-auto">
            ¿Qué tanto sabes de mundiales? <span className="text-primary font-bold">Pruébalo ahora</span>
          </p>
          
          <button 
            onClick={onStart}
            className="flex w-full items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-background-dark text-lg font-black tracking-widest shadow-[0_8px_30px_rgba(249,115,22,0.4)] transition-transform active:scale-95 uppercase italic"
          >
            <span className="material-symbols-outlined mr-2 font-black">play_arrow</span>
            EMPEZAR EL RETO
          </button>
        </section>
      </main>

      <footer className="flex justify-between items-center px-2 py-3 border-t border-white/5 shrink-0">
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <img key={i} src={`https://picsum.photos/seed/${i+10}/80/80`} className="size-6 rounded-full border border-background-dark" alt="User" />
          ))}
          <div className="size-6 rounded-full border border-background-dark bg-primary flex items-center justify-center">
            <span className="text-[7px] font-bold text-background-dark">+10k</span>
          </div>
        </div>
        <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Crack jugando ahora</p>
      </footer>
    </div>
  );
};

export default Home;
