class VibrationManager {
    constructor() {
        this.isEnabled = true;
        this.isSupported = 'vibrate' in navigator;
        
        // Vibration patterns for different events
        this.patterns = {
            move: [10],           // Short vibration for moves
            merge: [20],          // Medium vibration for merges
            bigMerge: [30],       // Longer vibration for big merges (256+)
            gameOver: [100, 50, 100], // Pattern for game over
            win: [50, 50, 50, 50, 200], // Victory pattern
            buttonClick: [5],     // Very short for button clicks
            bonusUse: [25],       // Medium for bonus usage
            achievement: [50, 30, 50, 30, 100] // Achievement unlock
        };
        
        console.log('VibrationManager initialized. Supported:', this.isSupported);
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log('Vibration', enabled ? 'enabled' : 'disabled');
    }

    vibrate(pattern = 'move') {
        if (!this.isEnabled || !this.isSupported) {
            return false;
        }

        try {
            let vibrationPattern;
            
            if (typeof pattern === 'string' && this.patterns[pattern]) {
                vibrationPattern = this.patterns[pattern];
            } else if (Array.isArray(pattern)) {
                vibrationPattern = pattern;
            } else if (typeof pattern === 'number') {
                vibrationPattern = [pattern];
            } else {
                vibrationPattern = this.patterns.move;
            }

            navigator.vibrate(vibrationPattern);
            return true;
        } catch (error) {
            console.warn('Vibration failed:', error);
            return false;
        }
    }

    // Convenience methods for common vibrations
    onMove() {
        this.vibrate('move');
    }

    onMerge(tileValue = 0) {
        if (tileValue >= 256) {
            this.vibrate('bigMerge');
        } else {
            this.vibrate('merge');
        }
    }

    onGameOver() {
        this.vibrate('gameOver');
    }

    onWin() {
        this.vibrate('win');
    }

    onButtonClick() {
        this.vibrate('buttonClick');
    }

    onBonusUse() {
        this.vibrate('bonusUse');
    }

    onAchievement() {
        this.vibrate('achievement');
    }

    // Custom vibration patterns
    onCombo(comboCount) {
        // Create a pattern based on combo count
        const pattern = [];
        for (let i = 0; i < Math.min(comboCount, 5); i++) {
            pattern.push(15, 10);
        }
        this.vibrate(pattern);
    }

    onBigScore(score) {
        // Vibrate based on score milestone
        if (score >= 10000) {
            this.vibrate([50, 30, 50, 30, 100]);
        } else if (score >= 5000) {
            this.vibrate([40, 20, 40]);
        } else if (score >= 1000) {
            this.vibrate([30, 15, 30]);
        }
    }

    // Test vibration (for settings)
    test() {
        if (this.isSupported) {
            this.vibrate([100, 50, 100, 50, 200]);
            return true;
        }
        return false;
    }

    // Stop all vibrations
    stop() {
        if (this.isSupported) {
            navigator.vibrate(0);
        }
    }

    // Get vibration info
    getInfo() {
        return {
            supported: this.isSupported,
            enabled: this.isEnabled,
            patterns: Object.keys(this.patterns)
        };
    }
}

// Initialize vibration manager
window.vibrationManager = new VibrationManager();
