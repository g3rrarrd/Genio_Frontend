
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/946/946-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2563/2563-preview.mp3',
  whistle: 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3',
  // Música de fondo: Un tema upbeat estilo estadio/deportes
  bgMusic: 'https://assets.mixkit.co/music/443/443.mp3',
};

class AudioManager {
  private audioCache: Record<string, HTMLAudioElement> = {};
  private bgMusic: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = false;

  play(sound: keyof typeof SOUNDS) {
    try {
      if (!this.audioCache[sound]) {
        this.audioCache[sound] = new Audio(SOUNDS[sound]);
        this.audioCache[sound].preload = 'auto';
      }
      const audio = this.audioCache[sound];
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch(e => console.debug("Autoplay blocked or audio error:", e));
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  startBackgroundMusic() {
    if (this.isMusicPlaying) return;
    
    try {
      if (!this.bgMusic) {
        this.bgMusic = new Audio(SOUNDS.bgMusic);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.15; // Volumen bajo para que no sature
      }
      this.bgMusic.play().then(() => {
        this.isMusicPlaying = true;
      }).catch(e => console.debug("Music autoplay blocked:", e));
    } catch (e) {
      console.error("Error playing background music:", e);
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.isMusicPlaying = false;
    }
  }

  toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMusicPlaying;
  }
}

export const audioManager = new AudioManager();
