// Telegram Mini App Integration
class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isReady = false;
        
        if (this.tg) {
            this.init();
        } else {
            console.log('Telegram WebApp not available, creating production fallback');
            this.createProductionUser();
        }
    }
    
    init() {
        console.log('Initializing Telegram WebApp...');
        
        // Expand app to full height
        this.tg.expand();
        
        // Enable closing confirmation
        this.tg.enableClosingConfirmation();
        
        // Prevent accidental closing - make app more sticky
        this.tg.disableVerticalSwipes();
        
        // Set header color
        this.tg.setHeaderColor('#1F1B2C');
        this.tg.setBackgroundColor('#1F1B2C');
        
        // Add additional protection against accidental closing
        this.setupClosingProtection();
        
        // Get user data - PRODUCTION MODE
        // Try to get secure data first, fallback to unsafe for development
        this.user = this.tg.initDataUnsafe?.user || this.tg.initData?.user;
        
        if (this.user) {
            console.log('Telegram user loaded in production mode:', this.user);
            this.isReady = true;
            this.onUserReady();
        } else {
            // Create a production-ready fallback user instead of demo
            console.log('Creating production fallback user');
            this.createProductionUser();
        }
        
        // Ready
        this.tg.ready();
        
        // Only hide debug elements if in development mode
        if (this.tg.initDataUnsafe) {
            this.hideDebugElements();
        }
    }
    
    hideDebugElements() {
        // Aggressive removal of Telegram debug elements
        const removeDebug = () => {
            // Find all possible debug elements
            const selectors = [
                'a[href*="t.me"]',
                'a[href*="userpic"]', 
                'div[style*="position:fixed"][style*="bottom"]',
                'a[href*="tgWebAppData"]',
                'a[href*="user#id"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.textContent.includes('t.me') || 
                        el.href?.includes('t.me') || 
                        el.href?.includes('userpic') ||
                        el.textContent.includes('userpic')) {
                        el.remove();
                    }
                });
            });
            
            // Also check for any links at the bottom of the page
            const allLinks = document.querySelectorAll('a');
            allLinks.forEach(link => {
                const rect = link.getBoundingClientRect();
                const isAtBottom = rect.bottom > window.innerHeight - 100;
                if (isAtBottom && (link.href?.includes('t.me') || link.textContent.includes('t.me'))) {
                    link.remove();
                }
            });
        };
        
        // Run immediately and very frequently
        removeDebug();
        setInterval(removeDebug, 50); // Increased frequency
        
        // Also use MutationObserver to catch dynamically added elements
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                removeDebug();
            });
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        }
        
        // Also on page load and visibility change
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeDebug);
        }
        document.addEventListener('visibilitychange', removeDebug);
    }
    
    createProductionUser() {
        // Create production-ready user based on browser/device info
        const deviceId = this.generateDeviceId();
        const savedProfile = this.getUserProfile();
        
        if (savedProfile && savedProfile.telegramId) {
            // Use existing profile
            this.user = {
                id: savedProfile.telegramId,
                first_name: savedProfile.firstName || 'Player',
                last_name: savedProfile.lastName || '',
                username: savedProfile.username || `player_${deviceId.slice(-6)}`,
                photo_url: savedProfile.photoUrl || null
            };
            console.log('Using existing production profile:', this.user);
        } else {
            // Create new production user
            this.user = {
                id: deviceId,
                first_name: 'Player',
                last_name: '',
                username: `player_${deviceId.slice(-6)}`,
                photo_url: null
            };
            console.log('Created new production user:', this.user);
        }
        
        this.isReady = true;
        this.onUserReady();
    }
    
    generateDeviceId() {
        // Generate consistent device ID based on browser fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = canvas.toDataURL() + 
                          navigator.userAgent + 
                          navigator.language + 
                          screen.width + 
                          screen.height;
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash);
    }
    
    async onUserReady() {
        // Load user photo from Telegram API
        await this.loadUserPhoto();
        
        // Create or update user profile
        this.createUserProfile();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('telegram-user-ready', {
            detail: { user: this.user }
        }));
    }
    
    async loadUserPhoto() {
        try {
            const response = await fetch(`/api/user/photo/${this.user.id}`);
            const data = await response.json();
            
            if (data.success && data.photo_url) {
                this.user.photo_url = data.photo_url;
                console.log('✅ User photo loaded:', data.photo_url);
            }
        } catch (error) {
            console.warn('Could not load user photo:', error);
        }
    }
    
    createUserProfile() {
        const profile = {
            telegramId: this.user.id,
            firstName: this.user.first_name || '',
            lastName: this.user.last_name || '',
            username: this.user.username || `user_${this.user.id}`,
            photoUrl: this.user.photo_url || null,
            displayName: this.getDisplayName(),
            avatar: this.getAvatar(),
            createdAt: Date.now(),
            lastActive: Date.now()
        };
        
        // Save to localStorage for compatibility
        localStorage.setItem('telegram_user', JSON.stringify(profile));
        localStorage.setItem('user_id', profile.telegramId.toString());
        localStorage.setItem('user_name', profile.displayName);
        localStorage.setItem('user_avatar', profile.avatar);
        
        // Also save to game database if available
        if (window.gameDB && window.gameDB.isReady) {
            this.saveToGameDatabase(profile);
        }
        
        // Trigger avatar update in UI
        setTimeout(() => {
            if (window.updateToolbarAvatar) {
                window.updateToolbarAvatar();
            }
            window.dispatchEvent(new CustomEvent('avatarUpdated'));
        }, 100);
        
        console.log('User profile created:', profile);
        
        return profile;
    }
    
    getDisplayName() {
        if (this.user.username) {
            return this.user.username;
        }
        if (this.user.first_name) {
            return this.user.first_name + (this.user.last_name ? ' ' + this.user.last_name : '');
        }
        return `User ${this.user.id}`;
    }
    
    getAvatar() {
        // If user has photo, we'll use it
        // Otherwise, use first letter of name
        if (this.user.first_name) {
            return this.user.first_name.charAt(0).toUpperCase();
        }
        return '👤';
    }
    
    getUserProfile() {
        const saved = localStorage.getItem('telegram_user');
        return saved ? JSON.parse(saved) : null;
    }
    
    async uploadScore(score) {
        const profile = this.getUserProfile();
        
        if (!profile) {
            console.error('No user profile found');
            return false;
        }
        
        const data = {
            telegram_id: profile.telegramId,
            username: profile.displayName,
            avatar: profile.avatar,
            score: score,
            timestamp: Date.now()
        };
        
        console.log('Uploading score to server:', data);
        
        try {
            // Upload to backend API
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : 'https://your-domain.com';
            
            const response = await fetch(`${API_URL}/api/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Score uploaded successfully:', result);
                
                // Also save locally as backup
                this.saveScoreLocally(data);
                
                return result;
            } else {
                console.error('Failed to upload score:', response.statusText);
                // Fallback to local save
                this.saveScoreLocally(data);
                return false;
            }
        } catch (error) {
            console.error('Error uploading score:', error);
            // Fallback to local save
            this.saveScoreLocally(data);
            return false;
        }
    }
    
    saveScoreLocally(data) {
        // Get existing scores
        const scores = JSON.parse(localStorage.getItem('all_scores') || '[]');
        
        // Find user's existing score
        const existingIndex = scores.findIndex(s => s.telegram_id === data.telegram_id);
        
        if (existingIndex >= 0) {
            // Update if new score is higher
            if (data.score > scores[existingIndex].score) {
                scores[existingIndex] = data;
            }
        } else {
            // Add new score
            scores.push(data);
        }
        
        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);
        
        // Save back
        localStorage.setItem('all_scores', JSON.stringify(scores));
        
        console.log('Score saved locally, leaderboard updated');
    }
    
    getLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('all_scores') || '[]');
        return scores;
    }
    
    getUserRank() {
        const profile = this.getUserProfile();
        if (!profile) return null;
        
        const leaderboard = this.getLeaderboard();
        const rank = leaderboard.findIndex(s => s.telegram_id === profile.telegramId);
        
        return rank >= 0 ? rank + 1 : null;
    }
    
    showMainButton(text, callback) {
        if (!this.tg) return;
        
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(callback);
    }
    
    hideMainButton() {
        if (!this.tg) return;
        this.tg.MainButton.hide();
    }
    
    hapticFeedback(type = 'medium') {
        if (!this.tg) return;
        
        const types = {
            light: () => this.tg.HapticFeedback.impactOccurred('light'),
            medium: () => this.tg.HapticFeedback.impactOccurred('medium'),
            heavy: () => this.tg.HapticFeedback.impactOccurred('heavy'),
            success: () => this.tg.HapticFeedback.notificationOccurred('success'),
            error: () => this.tg.HapticFeedback.notificationOccurred('error'),
            warning: () => this.tg.HapticFeedback.notificationOccurred('warning')
        };
        
        if (types[type]) {
            types[type]();
        }
    }
    
    setupClosingProtection() {
        if (!this.tg) return;
        
        // Prevent accidental closing with additional measures
        document.addEventListener('touchstart', (e) => {
            // Prevent pull-to-refresh and other gestures that might close the app
            if (e.touches.length > 1) return; // Allow multi-touch gestures
            
            const touch = e.touches[0];
            const startY = touch.clientY;
            
            // If touch starts near the top and might be a pull-down gesture
            if (startY < 50 && window.scrollY === 0) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevent default swipe behaviors that might close the app
        document.addEventListener('touchmove', (e) => {
            // Only prevent if it's a vertical swipe at the top
            if (window.scrollY === 0 && e.touches[0].clientY > e.touches[0].clientY) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Override back button behavior
        this.tg.onEvent('backButtonClicked', () => {
            // Custom back button logic - don't close immediately
            if (confirm('Вы уверены, что хотите выйти из игры?')) {
                this.tg.close();
            }
        });
        
        console.log('Closing protection setup complete');
    }

    close() {
        if (this.tg) {
            this.tg.close();
        }
    }
}

// Initialize globally
window.telegramIntegration = new TelegramIntegration();
