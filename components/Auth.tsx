import React, { useState } from 'react';
import { audioManager } from '../audio';
import { User } from '../types';

interface RegisterProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', description: 'Jugador de Genio' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    audioManager.play('click');
    setIsLoading(true);
    setError(null);

    const baseURL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${baseURL}usuarios/acceso_directo/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              identificador: formData.name,
              email: formData.email,
              descripcion: formData.description // Se incluye el grito de guerra
          }),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        const userToSave = {
          ...data,
          name: data.identificador, 
          avatarColor: '#f5821f',
          avatarIcon: 'sports_soccer'
        };

        localStorage.setItem('mundialista_user', JSON.stringify(userToSave));
        audioManager.play('whistle');
        onSuccess(userToSave);
      } else {
        const errorMsg = data.correo ? "Este correo ya está registrado" : 
                         data.identificador ? "Este nombre ya está en uso" : 
                         "Error al entrar al campo";
        setError(errorMsg);
      }
    } catch (err) {
      setError('El vestuario está cerrado (Error de conexión)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-md mx-auto bg-background-dark soccer-pattern">
      <header className="pt-12 text-center mb-12 relative">
        <button 
          onClick={onBack}
          className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center rounded-full bg-danger/10 border border-danger/30 text-danger active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          NUEVO <br/>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(245,130,31,0.4)]">FICHAJE</span>
        </h1>
        <p className="text-white/40 text-xs font-bold uppercase mt-4 tracking-wider px-8">
          Crea tu perfil de crack para empezar a competir
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto no-scrollbar pb-8">
        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger p-3 rounded-xl text-center text-[10px] font-black uppercase animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Nombre de Usuario</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">sports_soccer</span>
            <input 
              type="text" 
              required
              placeholder="Ej: Pelé_10"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Email del Jugador</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">mail</span>
            <input 
              type="email" 
              required
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Tu Grito de Guerra</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-4 text-primary/40">edit_note</span>
            <textarea 
              rows={2}
              placeholder="Soy el mejor del mundo..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="pt-4">
            <button 
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary text-background-dark font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(245,130,31,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-xl italic ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
                {isLoading ? 'FIRMANDO CONTRATO...' : 'SALTAR AL CAMPO'}
                <span className="material-symbols-outlined font-black">app_registration</span>
            </button>
            <p className="text-center text-[9px] text-white/20 uppercase font-bold mt-4 tracking-widest px-8">
                Al registrarte, aceptas las reglas del juego limpio.
            </p>
        </div>
      </form>
    </div>
  );
};

export default Register;