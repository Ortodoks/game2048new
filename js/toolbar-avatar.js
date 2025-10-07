// Toolbar Avatar Manager
class ToolbarAvatarManager {
    constructor() {
        this.avatarElement = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.avatarElement = document.getElementById('toolbar-avatar');
        if (this.avatarElement) {
            this.updateAvatar();
            
            // Listen for avatar changes
            window.addEventListener('storage', (e) => {
                if (e.key === 'currentUser') {
                    this.updateAvatar();
                }
            });

            // Listen for custom avatar update events
            window.addEventListener('avatarUpdated', () => {
                this.updateAvatar();
            });
        }
    }

    updateAvatar() {
        if (!this.avatarElement) return;

        // Get current user from localStorage or Telegram integration
        const savedUser = localStorage.getItem('currentUser');
        const telegramUser = localStorage.getItem('telegram_user');
        const userAvatarImage = localStorage.getItem('userAvatarImage');
        
        let user = null;
        let telegramPhoto = null;
        
        // Получаем основные данные пользователя
        if (savedUser) {
            try {
                user = JSON.parse(savedUser);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        
        // Получаем Telegram фото отдельно
        if (telegramUser) {
            try {
                const tgUser = JSON.parse(telegramUser);
                telegramPhoto = tgUser.photoUrl;
                // Если нет основного пользователя, используем Telegram данные
                if (!user) {
                    user = tgUser;
                }
            } catch (e) {
                console.error('Error parsing telegram user:', e);
            }
        }

        if (user) {
            // Приоритет: загруженное фото > Telegram фото > эмодзи
            if (userAvatarImage || user.avatarImage) {
                // Используем загруженное пользователем фото
                this.setAvatarImage(userAvatarImage || user.avatarImage, user.avatar || '👤');
            } else if (telegramPhoto && telegramPhoto.includes('t.me')) {
                // Используем Telegram фото
                this.setAvatarImage(telegramPhoto, user.avatar || '👤');
            } else if (user.photoUrl && user.photoUrl.includes('t.me')) {
                // Fallback на photoUrl в user
                this.setAvatarImage(user.photoUrl, user.avatar || '👤');
            } else {
                // Используем эмодзи аватар
                this.setAvatarText(user.avatar || '👤');
            }
        } else {
            // Default avatar
            this.setAvatarText('👤');
        }
    }

    setAvatarImage(imageUrl, fallbackText) {
        // Clear existing content
        this.avatarElement.innerHTML = '';
        
        // Remove background when showing image
        this.avatarElement.style.background = 'transparent';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        
        // Handle load error - fallback to text
        img.onerror = () => {
            this.setAvatarText(fallbackText);
        };
        
        // Handle successful load
        img.onload = () => {
            console.log('Avatar image loaded successfully:', imageUrl);
        };
        
        this.avatarElement.appendChild(img);
    }

    setAvatarText(text) {
        this.avatarElement.innerHTML = '';
        this.avatarElement.textContent = text;
        // Restore gradient background for emoji
        this.avatarElement.style.background = 'linear-gradient(135deg, #78dbff 0%, #667eea 100%)';
    }

    // Method to manually update avatar
    setAvatar(avatar) {
        if (this.avatarElement) {
            this.avatarElement.textContent = avatar;
        }
    }
}

// Initialize toolbar avatar manager
window.toolbarAvatarManager = new ToolbarAvatarManager();

// Helper function to trigger avatar update
window.updateToolbarAvatar = function() {
    if (window.toolbarAvatarManager) {
        window.toolbarAvatarManager.updateAvatar();
    }
};
