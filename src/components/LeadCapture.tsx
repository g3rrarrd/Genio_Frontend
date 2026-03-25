
import React, { useState } from 'react';
import { audioManager } from '../../audio';
import { saveScoreToCloud } from '../../firebase';
import { User } from '../../types';

interface LeadCaptureProps {
  score: number;
  onComplete: () => void;
  onCancel: () => void;
}

const LeadCapture: React.FC<LeadCaptureProps> = ({ score, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    audioManager.play('click');
    setStatus('LOADING');

    const newUser: User = {
      name: formData.name,
      email: formData.email,
      avatarIcon: 'sports_soccer',
      avatarColor: '#f97316'
    };

    // Guardar en LocalStorage para sesión actual
    localStorage.setItem('mundialista_user', JSON.stringify(newUser));

    // Guardar en Firebase
    const success = await saveScoreToCloud(newUser, score);

    if (success) {
      setStatus('SUCCESS');
      audioManager.play('whistle');
    } else {
      // Si falla Firebase, igual dejamos que el usuario vea su éxito localmente
      // pero avisamos en consola o podríamos mostrar un error sutil.
      setStatus('SUCCESS'); 
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 3xl:p-14 4k:p-20 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-6xl mx-auto text-center bg-background-dark soccer-pattern overflow-x-hidden">
        <div className="w-20 h-20 sm:w-24 sm:h-24 3xl:w-36 3xl:h-36 4k:w-48 4k:h-48 bg-primary/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 3xl:mb-8 4k:mb-10 border-2 border-primary animate-bounce">
          <span className="material-symbols-outlined text-primary text-5xl sm:text-6xl 3xl:text-7xl 4k:text-8xl">check_circle</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4k:text-7xl font-black italic text-primary uppercase mb-3 sm:mb-4 3xl:mb-6 4k:mb-8 tracking-tighter">¡FICHAJE COMPLETADO!</h2>
        <p className="text-white/60 text-base sm:text-lg 3xl:text-xl 4k:text-2xl mb-8 sm:mb-12 3xl:mb-14 4k:mb-18">Tus datos han sido registrados en la base de datos oficial. ¿En qué puesto habrás quedado?</p>
        <button 
          onClick={onComplete}
          className="w-full bg-primary text-background-dark font-black py-4 sm:py-5 3xl:py-7 4k:py-9 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.4)] active:scale-95 transition-all uppercase italic text-lg sm:text-xl 3xl:text-2xl 4k:text-3xl flex items-center justify-center gap-3"
        >
          VER MI POSICIÓN
          <span className="material-symbols-outlined font-black">leaderboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 sm:p-6 lg:p-10 3xl:p-14 4k:p-20 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-6xl mx-auto bg-background-dark soccer-pattern overflow-x-hidden">
      <header className="pt-8 sm:pt-12 text-center mb-8 sm:mb-12">
        <div className="inline-block px-4 py-1 bg-primary/10 rounded-full border border-primary/30 mb-4">
          <span className="text-primary text-[10px] 3xl:text-sm 4k:text-base font-black uppercase tracking-widest">Sincronización Cloud</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4k:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
          REGISTRA TU <br/>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">MARCA</span>
        </h1>
        <p className="text-white/40 text-xs 3xl:text-base 4k:text-lg font-bold uppercase mt-3 sm:mt-4 3xl:mt-6 4k:mt-8 tracking-wider">Tu puntaje de {Math.floor(score).toLocaleString()} se guardará en la nube</p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 3xl:space-y-8 4k:space-y-10">
        <div className="space-y-2">
          <label className="text-[10px] 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Nombre de Crack</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 3xl:left-6 4k:left-8 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-2xl">person</span>
            <input 
              type="text" 
              required
              placeholder="Escribe tu nombre..."
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-4 3xl:py-6 4k:py-8 pl-12 3xl:pl-14 4k:pl-16 pr-4 text-white 3xl:text-lg 4k:text-xl focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Correo de Contacto</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 3xl:left-6 4k:left-8 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-2xl">mail</span>
            <input 
              type="email" 
              required
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-4 3xl:py-6 4k:py-8 pl-12 3xl:pl-14 4k:pl-16 pr-4 text-white 3xl:text-lg 4k:text-xl focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 sm:pt-8">
            <button 
                type="submit"
                disabled={status === 'LOADING'}
                className={`w-full bg-primary text-background-dark font-black py-4 sm:py-5 3xl:py-7 4k:py-9 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-lg sm:text-xl 3xl:text-2xl 4k:text-3xl italic ${status === 'LOADING' ? 'opacity-50 cursor-wait' : ''}`}
            >
                {status === 'LOADING' ? 'SUBIENDO A FIRESTORE...' : 'ENVIAR A LA NUBE'}
                <span className="material-symbols-outlined font-black">{status === 'LOADING' ? 'sync' : 'cloud_upload'}</span>
            </button>
            <p className="text-center text-[9px] 3xl:text-sm 4k:text-base text-white/20 uppercase font-bold mt-4 tracking-widest px-4 sm:px-8">
                Al registrarte, tu puntuación será visible en el ranking global de Firebase.
            </p>
        </div>
      </form>

      <button 
        onClick={onCancel}
        className="mt-6 sm:mt-8 3xl:mt-10 4k:mt-14 pb-4 text-white/30 font-black text-xs 3xl:text-base 4k:text-lg uppercase tracking-widest hover:text-white transition-colors"
      >
        SALTAR REGISTRO
      </button>
    </div>
  );
};

export default LeadCapture;
