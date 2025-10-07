/**
 * Auto-Update System for Telegram Mini App
 * Автоматически проверяет и применяет обновления приложения
 */

const VERSION_CONFIG = {
    current: '1.3.0', // ГЛАВНАЯ ВЕРСИЯ - обновляй при деплое!
    checkInterval: 30000, // Проверка каждые 30 секунд
    apiEndpoint: '/version.json', // Файл с версией на сервере
    forceReload: true // Принудительная перезагрузка при обновлении
};

class AppVersionManager {
    constructor() {
        this.currentVersion = VERSION_CONFIG.current;
        this.lastCheck = null;
        this.updateAvailable = false;
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Version Manager initialized. Current version:', this.currentVersion);
        
        // Проверяем версию из localStorage
        const savedVersion = localStorage.getItem('app_version');
        
        if (savedVersion && savedVersion !== this.currentVersion) {
            console.log('🆕 New version detected!', {
                old: savedVersion,
                new: this.currentVersion
            });
            this.handleVersionUpdate(savedVersion);
        }
        
        // Сохраняем текущую версию
        localStorage.setItem('app_version', this.currentVersion);
        
        // Запускаем периодическую проверку
        this.startVersionCheck();
        
        // Проверяем при фокусе на приложение
        this.setupFocusCheck();
        
        // Проверяем через Telegram Web App события
        this.setupTelegramCheck();
        
        this.initialized = true;
    }
    
    /**
     * Обработка обновления версии
     */
    handleVersionUpdate(oldVersion) {
        console.log('🔄 Handling version update from', oldVersion, 'to', this.currentVersion);
        
        // Очищаем все кэши
        this.clearAllCaches();
        
        // Очищаем старые данные если нужно
        this.migrateData(oldVersion, this.currentVersion);
        
        // Показываем уведомление пользователю
        this.showUpdateNotification();
    }
    
    /**
     * Очистка всех кэшей
     */
    async clearAllCaches() {
        console.log('🗑️ Clearing all caches...');
        
        try {
            // 1. Service Worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('  - Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }
            
            // 2. Очищаем Application Cache (устаревший API, но всё ещё может использоваться)
            if (window.applicationCache) {
                try {
                    window.applicationCache.update();
                } catch (e) {
                    console.log('  - Application cache not available');
                }
            }
            
            console.log('✅ All caches cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing caches:', error);
        }
    }
    
    /**
     * Миграция данных между версиями
     */
    migrateData(oldVersion, newVersion) {
        console.log('📦 Migrating data from', oldVersion, 'to', newVersion);
        
        // Здесь можно добавить логику миграции данных
        // Например, если структура localStorage изменилась
        
        // Пример: если версия старше 1.2.0, обновляем структуру данных
        if (this.compareVersions(oldVersion, '1.2.0') < 0) {
            console.log('  - Migrating old data structure...');
            // Миграция данных
        }
        
        console.log('✅ Data migration completed');
    }
    
    /**
     * Сравнение версий (возвращает -1, 0, 1)
     */
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (parts1[i] > parts2[i]) return 1;
            if (parts1[i] < parts2[i]) return -1;
        }
        return 0;
    }
    
    /**
     * Периодическая проверка версии на сервере
     */
    startVersionCheck() {
        // Первая проверка через 5 секунд после загрузки
        setTimeout(() => this.checkForUpdates(), 5000);
        
        // Затем проверяем периодически
        setInterval(() => {
            this.checkForUpdates();
        }, VERSION_CONFIG.checkInterval);
    }
    
    /**
     * Проверка обновлений на сервере
     */
    async checkForUpdates() {
        try {
            // Добавляем timestamp чтобы обойти кэш браузера
            const timestamp = Date.now();
            const response = await fetch(`${VERSION_CONFIG.apiEndpoint}?t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                console.log('⚠️ Version check failed:', response.status);
                return;
            }
            
            const data = await response.json();
            const serverVersion = data.version;
            
            this.lastCheck = new Date();
            
            if (serverVersion !== this.currentVersion) {
                console.log('🆕 Server has new version:', serverVersion);
                this.updateAvailable = true;
                this.promptUpdate(serverVersion);
            } else {
                console.log('✅ App is up to date:', this.currentVersion);
            }
        } catch (error) {
            // Если файл не найден, это нормально - просто пропускаем проверку
            if (error.message.includes('404')) {
                console.log('ℹ️ Version check file not found (expected in development)');
            } else {
                console.error('❌ Error checking for updates:', error);
            }
        }
    }
    
    /**
     * Предложить пользователю обновить приложение
     */
    promptUpdate(newVersion) {
        if (VERSION_CONFIG.forceReload) {
            // Принудительное обновление
            console.log('🔄 Force reloading application...');
            this.showUpdateNotification(`Обновление до версии ${newVersion}...`);
            
            setTimeout(() => {
                // Очищаем кэш и перезагружаем
                this.clearAllCaches().then(() => {
                    window.location.reload(true); // true = hard reload
                });
            }, 1000);
        } else {
            // Показываем уведомление с кнопкой обновления
            this.showUpdateDialog(newVersion);
        }
    }
    
    /**
     * Показать диалог обновления
     */
    showUpdateDialog(newVersion) {
        // Проверяем, не показываем ли мы уже диалог
        if (document.getElementById('update-dialog')) {
            return;
        }
        
        const dialog = document.createElement('div');
        dialog.id = 'update-dialog';
        dialog.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(28, 28, 30, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 24px;
                max-width: 320px;
                width: 90%;
                z-index: 99999;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s ease-out;
            ">
                <h3 style="
                    color: #fff;
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    text-align: center;
                ">🎉 Доступно обновление!</h3>
                <p style="
                    color: #8E8E93;
                    font-size: 14px;
                    margin: 0 0 20px 0;
                    text-align: center;
                ">
                    Версия ${newVersion} уже доступна.<br>
                    Обновите приложение, чтобы получить новые возможности.
                </p>
                <button id="update-now-btn" style="
                    width: 100%;
                    background: linear-gradient(135deg, #0A84FF, #0066CC);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 8px;
                ">
                    Обновить сейчас
                </button>
                <button id="update-later-btn" style="
                    width: 100%;
                    background: transparent;
                    color: #8E8E93;
                    border: none;
                    border-radius: 12px;
                    padding: 12px;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    Позже
                </button>
            </div>
            <style>
                @keyframes slideUp {
                    from {
                        transform: translate(-50%, -40%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%);
                        opacity: 1;
                    }
                }
            </style>
        `;
        
        document.body.appendChild(dialog);
        
        // Обработчики кнопок
        document.getElementById('update-now-btn').addEventListener('click', () => {
            dialog.remove();
            this.clearAllCaches().then(() => {
                window.location.reload(true);
            });
        });
        
        document.getElementById('update-later-btn').addEventListener('click', () => {
            dialog.remove();
        });
    }
    
    /**
     * Показать уведомление об обновлении
     */
    showUpdateNotification(message = 'Приложение обновляется...') {
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(28, 28, 30, 0.95);
                backdrop-filter: blur(20px);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                z-index: 99999;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                animation: fadeInDown 0.3s ease-out;
            ">
                ${message}
            </div>
            <style>
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
            </style>
        `;
        document.body.appendChild(notification);
    }
    
    /**
     * Проверка при возвращении в приложение
     */
    setupFocusCheck() {
        let hidden, visibilityChange;
        
        if (typeof document.hidden !== 'undefined') {
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
            visibilityChange = 'webkitvisibilitychange';
        }
        
        if (visibilityChange) {
            document.addEventListener(visibilityChange, () => {
                if (!document[hidden]) {
                    console.log('👀 App focused, checking for updates...');
                    this.checkForUpdates();
                }
            });
        }
        
        // Также проверяем при window.focus
        window.addEventListener('focus', () => {
            console.log('👀 Window focused, checking for updates...');
            this.checkForUpdates();
        });
    }
    
    /**
     * Проверка через Telegram Web App события
     */
    setupTelegramCheck() {
        if (window.Telegram?.WebApp) {
            // Проверяем при каждом показе приложения
            window.addEventListener('focus', () => {
                if (window.Telegram.WebApp.isExpanded) {
                    this.checkForUpdates();
                }
            });
        }
    }
    
    /**
     * Получить информацию о версии
     */
    getVersionInfo() {
        return {
            current: this.currentVersion,
            lastCheck: this.lastCheck,
            updateAvailable: this.updateAvailable,
            initialized: this.initialized
        };
    }
}

// Инициализация менеджера версий
if (typeof window !== 'undefined') {
    window.appVersionManager = new AppVersionManager();
    
    // Делаем доступным глобально для отладки
    window.checkAppVersion = () => {
        const info = window.appVersionManager.getVersionInfo();
        console.log('📱 App Version Info:', info);
        return info;
    };
}
