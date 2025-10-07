class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('volume')) || 0.5;
        
        this.initAudio();
        this.setupControls();
    }

    initAudio() {
        try {
            // Create audio context for better browser compatibility
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Generate sound effects using Web Audio API
            this.generateSounds();
            
            // Create background music
            this.createBackgroundMusic();
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            // Fallback - disable audio
            this.soundEnabled = false;
            this.musicEnabled = false;
        }
    }

    generateSounds() {
        // Move sound
        this.sounds.move = this.createTone(220, 0.1, 'sine');
        
        // Merge sound
        this.sounds.merge = this.createTone(440, 0.2, 'square');
        
        // Bonus sound
        this.sounds.bonus = this.createChord([523, 659, 784], 0.3);
        
        // Purchase sound
        this.sounds.purchase = this.createChord([523, 659, 784, 1047], 0.4);
        
        // Explosion sound
        this.sounds.explosion = this.createNoise(0.3);
        
        // Win sound
        this.sounds.win = this.createVictoryFanfare();
        
        // Game over sound
        this.sounds.gameOver = this.createGameOverSound();
        
        // Achievement sound
        this.sounds.achievement = this.createAchievementSound();
        
        // Button click
        this.sounds.click = this.createTone(800, 0.05, 'square');
    }

    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createChord(frequencies, duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                }, index * 50);
            });
        };
    }

    createNoise(duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            const bufferSize = this.audioContext.sampleRate * duration;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const whiteNoise = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            whiteNoise.buffer = buffer;
            whiteNoise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            whiteNoise.start(this.audioContext.currentTime);
            whiteNoise.stop(this.audioContext.currentTime + duration);
        };
    }

    createVictoryFanfare() {
        return () => {
            if (!this.soundEnabled) return;
            
            const melody = [523, 659, 784, 1047, 1319];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'triangle';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        };
    }

    createGameOverSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            const frequencies = [440, 415, 392, 370, 349];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sawtooth';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.4);
                }, index * 200);
            });
        };
    }

    createAchievementSound() {
        return () => {
            if (!this.soundEnabled) return;
            
            // Ascending arpeggio
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                }, index * 80);
            });
        };
    }

    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        try {
            // Simple ambient background music
            this.musicOscillators = [];
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.connect(this.audioContext.destination);
            this.musicGainNode.gain.setValueAtTime(this.musicEnabled ? this.volume * 0.1 : 0, this.audioContext.currentTime);
            
            this.startBackgroundMusic();
        } catch (error) {
            console.warn('Background music creation failed:', error);
        }
    }

    startBackgroundMusic() {
        if (!this.musicEnabled) return;
        
        // Create a simple ambient drone
        const frequencies = [110, 165, 220]; // A2, E3, A3
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 2 + index);
            
            // Add subtle frequency modulation
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.frequency.setValueAtTime(0.1 + index * 0.05, this.audioContext.currentTime);
            lfoGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            
            oscillator.start(this.audioContext.currentTime);
            lfo.start(this.audioContext.currentTime);
            
            this.musicOscillators.push({ oscillator, lfo, gainNode });
        });
    }

    stopBackgroundMusic() {
        this.musicOscillators.forEach(({ oscillator, lfo, gainNode }) => {
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            setTimeout(() => {
                oscillator.stop();
                lfo.stop();
            }, 1000);
        });
        this.musicOscillators = [];
    }

    playSound(soundName) {
        try {
            if (this.sounds[soundName] && this.soundEnabled) {
                this.sounds[soundName]();
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }

    setupControls() {
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = this.soundEnabled;
            soundToggle.addEventListener('change', () => {
                this.soundEnabled = soundToggle.checked;
                localStorage.setItem('soundEnabled', this.soundEnabled);
            });
        }

        // Music toggle
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.checked = this.musicEnabled;
            musicToggle.addEventListener('change', () => {
                this.musicEnabled = musicToggle.checked;
                localStorage.setItem('musicEnabled', this.musicEnabled);
                
                if (this.musicGainNode) {
                    if (this.musicEnabled) {
                        this.musicGainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.5);
                        if (this.musicOscillators.length === 0) {
                            this.startBackgroundMusic();
                        }
                    } else {
                        this.musicGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
                    }
                }
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        if (volumeSlider && volumeValue) {
            volumeSlider.value = this.volume * 100;
            volumeValue.textContent = Math.round(this.volume * 100);
            
            volumeSlider.addEventListener('input', () => {
                this.volume = volumeSlider.value / 100;
                volumeValue.textContent = volumeSlider.value;
                localStorage.setItem('volume', this.volume);
                
                // Update music volume
                if (this.musicEnabled && this.musicGainNode) {
                    this.musicGainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
                }
            });
        }

        // Add click sounds to buttons
        setTimeout(() => {
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.playSound('click');
                });
            });
        }, 100);
    }

    // Resume audio context on user interaction (required by browsers)
    resumeAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Dynamic music based on game state
    updateMusicForGameState(gameState) {
        if (!this.musicEnabled) return;
        
        switch (gameState) {
            case 'playing':
                // Normal ambient music
                break;
            case 'winning':
                // Increase tempo and brightness
                this.musicOscillators.forEach(({ oscillator }, index) => {
                    oscillator.frequency.exponentialRampToValueAtTime(
                        oscillator.frequency.value * 1.2, 
                        this.audioContext.currentTime + 1
                    );
                });
                break;
            case 'danger':
                // Add tension with dissonance
                this.musicOscillators.forEach(({ oscillator }, index) => {
                    oscillator.frequency.exponentialRampToValueAtTime(
                        oscillator.frequency.value * 0.95, 
                        this.audioContext.currentTime + 0.5
                    );
                });
                break;
        }
    }
}
