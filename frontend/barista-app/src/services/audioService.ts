class AudioService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  private async createBeep(frequency: number, duration: number, volume: number = 0.1): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }
    
    if (!this.audioContext) return;

    // Resume context if it's suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async playNewOrderSound(): Promise<void> {
    try {
      // Play a pleasant notification sound (C major chord)
      await this.createBeep(523.25, 0.2, 0.1); // C5
      setTimeout(() => this.createBeep(659.25, 0.2, 0.1), 100); // E5
      setTimeout(() => this.createBeep(783.99, 0.3, 0.1), 200); // G5
    } catch (error) {
      console.warn('Failed to play new order sound:', error);
    }
  }

  async playStatusUpdateSound(): Promise<void> {
    try {
      // Play a subtle confirmation sound
      await this.createBeep(440, 0.15, 0.08); // A4
      setTimeout(() => this.createBeep(554.37, 0.15, 0.08), 75); // C#5
    } catch (error) {
      console.warn('Failed to play status update sound:', error);
    }
  }

  async playErrorSound(): Promise<void> {
    try {
      // Play an alert sound
      await this.createBeep(349.23, 0.2, 0.12); // F4
      setTimeout(() => this.createBeep(293.66, 0.3, 0.12), 150); // D4
    } catch (error) {
      console.warn('Failed to play error sound:', error);
    }
  }

  async playCompletionSound(): Promise<void> {
    try {
      // Play a success sound (ascending notes)
      await this.createBeep(392, 0.15, 0.08); // G4
      setTimeout(() => this.createBeep(523.25, 0.15, 0.08), 100); // C5
      setTimeout(() => this.createBeep(659.25, 0.2, 0.08), 200); // E5
    } catch (error) {
      console.warn('Failed to play completion sound:', error);
    }
  }

  // Enable user interaction to initialize audio context
  async enableAudio(): Promise<void> {
    await this.initialize();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export const audioService = new AudioService();
