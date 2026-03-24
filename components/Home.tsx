import React, { useState } from 'react';
import { User } from '../types';

interface HomeProps {
  user?: User | null;
  onStart: () => void;
  onLogin: () => void;
  onProfile: () => void;
  onRegisterAndStart: (data: { nombre: string; email: string; telefono: string; apostemos: boolean }) => Promise<void>;
  isSyncing ?: boolean;
}

const Home: React.FC<HomeProps> = ({ user, onStart, onLogin, onProfile, onRegisterAndStart, isSyncing }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({ nombre: '', email: '', telefono: '', apostemos: false });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleStartClick = () => {
    if (user) {
      onStart();
    } else {
      setModalError(null);
      setModalForm({ nombre: '', email: '', telefono: '', apostemos: false });
      setShowModal(true);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Solo permitir dígitos, +, espacios y guiones
    const cleaned = value.replace(/[^\d+\s\-]/g, '');
    setModalForm({ ...modalForm, telefono: cleaned });
  };

  const handleModalSubmit = async () => {
    if (!modalForm.nombre || !modalForm.email) {
      setModalError('Nombre y email son obligatorios');
      return;
    }
    if (modalForm.telefono) {
      const cleanPhone = modalForm.telefono.replace(/[\s\-]/g, '');
      const phoneRegex = /^(\+504)?\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setModalError('Celular inválido. Ej: +504 9897 6532');
        return;
      }
    }
    setModalError(null);
    setModalLoading(true);
    try {
      await onRegisterAndStart(modalForm);
      setShowModal(false);
    } catch (err: any) {
      setModalError(err.message || 'Error al registrarse');
    } finally {
      setModalLoading(false);
    }
  };
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
    <div className="min-h-[100dvh] flex flex-col justify-between p-3 py-4 sm:p-4 sm:py-6 lg:p-6 lg:py-8 3xl:p-10 3xl:py-12 4k:p-24 4k:py-32 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-[2200px] mx-auto w-full">
      <header className="grid grid-cols-3 items-center px-1 sm:px-2 z-10 shrink-0">
        
        <div></div>

        <div className="flex flex-col items-center 4k:gap-4">
          <span className="text-[7px] sm:text-[8px] lg:text-[10px] 3xl:text-sm 4k:text-4xl uppercase tracking-[0.2em] text-primary font-bold">The Ultimate Challenge</span>
          <h2 className="text-white text-[10px] sm:text-xs lg:text-sm 3xl:text-lg 4k:text-6xl font-bold leading-tight tracking-tight">EL GENIO MUNDIALISTA</h2>
        </div>

        {/* BOTÓN DE PERFIL CON CARGA DINÁMICA */}
        <div className="flex justify-end">
        <button 
          onClick={user ? onProfile : onLogin}
          disabled={isSyncing}
          className="flex items-center justify-center size-9 sm:size-10 lg:size-12 3xl:size-16 4k:size-48 4k:border-[6px] rounded-full bg-white/5 border border-white/10 relative overflow-hidden active:scale-95 transition-transform"
        >
          {isSyncing ? (
            // Spinner pequeño mientras sincroniza
            <div className="w-5 h-5 4k:w-24 4k:h-24 border-2 4k:border-[8px] border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <div 
              className="flex items-center justify-center w-full h-full"
              style={{ backgroundColor: `${userColor}20` }}
            >
               <span 
                className="material-symbols-outlined text-xl 4k:text-[120px]"
                style={{ color: userColor, fontVariationSettings: "'FILL' 1" }}
               >
                {user.emblema || 'person'}
               </span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-xl 4k:text-[120px]">account_circle</span>
          )}
        </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-8 3xl:gap-12 4k:gap-32 text-center overflow-hidden">
        <section className="shrink-0 flex flex-col items-center">
          {user && (
            <div className={`mb-2 4k:mb-10 inline-block px-3 py-0.5 4k:px-12 4k:py-4 bg-primary/10 rounded-full 4k:rounded-full border 4k:border-4 border-primary/30 transition-opacity ${isSyncing ? 'opacity-50' : 'opacity-100'}`}>
                <span className="text-primary text-[8px] 4k:text-5xl font-black uppercase tracking-widest italic">
                  {isSyncing ? 'Sincronizando...' : `Hola, ${user.identificador}`}
                </span>
            </div>
          )}
          <h1 className="text-primary tracking-tighter text-[38px] sm:text-[54px] lg:text-[64px] xl:text-[72px] 3xl:text-[96px] 4k:text-[220px] font-black leading-[0.85] italic uppercase drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] 4k:drop-shadow-[0_0_60px_rgba(249,115,22,0.4)]">
            ¿SABES MÁS<br />QUE EL GENIO?
          </h1>
        </section>

        <section className="relative w-full max-w-[240px] lg:max-w-[320px] xl:max-w-[380px] 3xl:max-w-[500px] 4k:max-w-[1200px] aspect-square flex items-center justify-center shrink-0">
           <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] 4k:blur-[200px]"></div>
           <div className="w-full h-full bg-gradient-to-b from-primary/10 to-transparent rounded-full flex items-center justify-center border border-white/5 4k:border-8 relative">
              <span className="material-symbols-outlined text-primary/40 text-2xl 4k:text-[100px] absolute top-4 4k:top-20 left-1/4 animate-pulse">auto_awesome</span>
              <img 
                src="https://pngimg.com/uploads/football/football_PNG52789.png" 
                alt="Balón de Fútbol" 
                className="w-44 h-44 sm:w-52 sm:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72 3xl:w-96 3xl:h-96 4k:w-[900px] 4k:h-[900px] object-contain drop-shadow-[0_20px_60px_rgba(249,115,22,0.5)] scale-110 rotate-12 transition-transform hover:rotate-45 duration-700"
              />
           </div>
        </section>

        <section className="space-y-4 sm:space-y-6 lg:space-y-8 3xl:space-y-10 4k:space-y-24 w-full shrink-0">
          <p className="text-white/80 text-base sm:text-lg lg:text-xl xl:text-2xl 3xl:text-3xl 4k:text-[80px] font-medium leading-tight 4k:leading-snug max-w-[220px] sm:max-w-[240px] lg:max-w-[320px] xl:max-w-[400px] 3xl:max-w-[520px] 4k:max-w-[1600px] mx-auto">
            ¿Qué tanto sabes de mundiales? <span className="text-primary font-bold">Pruébalo ahora</span>
          </p>
          
          <button 
            onClick={handleStartClick}
            className="flex w-full items-center justify-center overflow-hidden rounded-full h-12 sm:h-14 lg:h-16 xl:h-18 3xl:h-20 4k:h-48 px-6 sm:px-8 3xl:px-12 4k:px-32 bg-primary text-background-dark text-base sm:text-lg lg:text-xl 3xl:text-2xl 4k:text-[80px] font-black tracking-widest shadow-[0_8px_30px_rgba(249,115,22,0.4)] transition-transform active:scale-95 uppercase italic"
          >
            <span className="material-symbols-outlined mr-2 4k:mr-8 font-black 4k:text-[100px]">play_arrow</span>
            EMPEZAR EL RETO
          </button>
        </section>
      </main>

      <footer className="flex justify-between items-center px-2 4k:px-10 py-3 4k:py-10 border-t border-white/5 4k:border-white/20 shrink-0">
        <p className="text-[9px] 3xl:text-sm 4k:text-4xl text-white/40 font-medium uppercase tracking-wider">Copyright © 2026</p>
      </footer>

      {/* MODAL DE REGISTRO PRE-JUEGO ESCALADO A 4K */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 3xl:p-8 4k:p-40 bg-background-dark/95 backdrop-blur-xl">
          <div className="bg-card-bg border 4k:border-[8px] border-primary/20 rounded-3xl 4k:rounded-[6rem] p-6 3xl:p-10 4k:p-32 w-full max-w-sm 3xl:max-w-xl 4k:max-w-[1800px] space-y-5 3xl:space-y-7 4k:space-y-24">
            
            <div className="text-center space-y-4">
              <h3 className="text-xl 3xl:text-3xl 4k:text-[100px] font-black italic uppercase text-white">¡AL CAMPO!</h3>
              <p> "" </p>
              <p className="text-white/40 text-[10px] 3xl:text-sm 4k:text-5xl uppercase font-bold mt-1 3xl:mt-2 tracking-wider">
                Regístrate para empezar a competir
              </p>
            </div>

            {modalError && (
              <div className="bg-danger/10 border border-danger/50 4k:border-4 text-danger p-3 3xl:p-4 4k:p-12 rounded-xl 4k:rounded-[3rem] text-center text-[10px] 3xl:text-sm 4k:text-4xl font-black uppercase">
                {modalError}
              </div>
            )}

            <div className="space-y-1 3xl:space-y-2 4k:space-y-8">
              <label className="text-[10px] 3xl:text-sm 4k:text-5xl font-black uppercase text-white/40 tracking-[0.2em] ml-2 4k:ml-8">Nombre de Usuario *</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 3xl:left-5 4k:left-12 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-[80px]">sports_soccer</span>
                <input
                  type="text"
                  placeholder="Ej: Pelé_10"
                  value={modalForm.nombre}
                  onChange={e => setModalForm({...modalForm, nombre: e.target.value})}
                  className="w-full bg-background-dark border border-white/10 4k:border-4 rounded-2xl 4k:rounded-[3rem] py-3 3xl:py-5 4k:py-16 pl-12 3xl:pl-14 4k:pl-[160px] pr-4 4k:pr-16 text-sm 3xl:text-base 4k:text-6xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-1 3xl:space-y-2 4k:space-y-8">
              <label className="text-[10px] 3xl:text-sm 4k:text-5xl font-black uppercase text-white/40 tracking-[0.2em] ml-2 4k:ml-8">Email *</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 3xl:left-5 4k:left-12 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-[80px]">mail</span>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={modalForm.email}
                  onChange={e => setModalForm({...modalForm, email: e.target.value})}
                  className="w-full bg-background-dark border border-white/10 4k:border-4 rounded-2xl 4k:rounded-[3rem] py-3 3xl:py-5 4k:py-16 pl-12 3xl:pl-14 4k:pl-[160px] pr-4 4k:pr-16 text-sm 3xl:text-base 4k:text-6xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-1 3xl:space-y-2 4k:space-y-8">
              <label className="text-[10px] 3xl:text-sm 4k:text-5xl font-black uppercase text-white/40 tracking-[0.2em] ml-2 4k:ml-8">Teléfono</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 3xl:left-5 4k:left-12 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-[80px]">phone</span>
                <input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={modalForm.telefono}
                  onChange={e => handlePhoneChange(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 4k:border-4 rounded-2xl 4k:rounded-[3rem] py-3 3xl:py-5 4k:py-16 pl-12 3xl:pl-14 4k:pl-[160px] pr-4 4k:pr-16 text-sm 3xl:text-base 4k:text-6xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 3xl:gap-4 4k:gap-12 cursor-pointer px-1 4k:px-6">
              <div
                className={`w-5 h-5 3xl:w-7 3xl:h-7 4k:w-24 4k:h-24 rounded 4k:rounded-3xl border-2 4k:border-8 flex items-center justify-center flex-shrink-0 transition-colors ${
                  modalForm.apostemos ? 'bg-primary border-primary' : 'border-white/20 bg-white/5'
                }`}
                onClick={() => setModalForm({...modalForm, apostemos: !modalForm.apostemos})}
              >
                {modalForm.apostemos && (
                  <span className="material-symbols-outlined text-sm 3xl:text-base 4k:text-[70px] text-background-dark" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                )}
              </div>
              <span className="text-[10px] 3xl:text-sm 4k:text-[45px] text-white/50 font-bold uppercase leading-relaxed 4k:leading-normal">
                Quiero recibir información digital de <span className="text-primary">Apostemos</span>
              </span>
            </label>

            <div className="pt-4 4k:pt-16 flex flex-col gap-4 4k:gap-10">
                <button
                onClick={handleModalSubmit}
                disabled={modalLoading}
                className="w-full bg-primary text-background-dark font-black py-4 3xl:py-6 4k:py-24 rounded-2xl 4k:rounded-[4rem] text-base 3xl:text-xl 4k:text-6xl italic uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 3xl:gap-3 4k:gap-8 active:scale-95 transition-transform"
                >
                {modalLoading && <div className="w-4 h-4 3xl:w-5 3xl:h-5 4k:w-16 4k:h-16 border-2 4k:border-[8px] border-background-dark border-t-transparent rounded-full animate-spin"></div>}
                {modalLoading ? 'FIRMANDO...' : 'EMPEZAR EL RETO'}
                </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;