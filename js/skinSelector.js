// Модуль выбора скинов на главной странице
class SkinSelector {
    constructor() {
        this.currentSkin = 'default';
        this.ownedSkins = ['default'];
        this.skins = window.SKIN_CONFIGS || {};
        
        this.init();
    }

    async init() {
        // Ждем загрузки userManager
        while (!window.userManager || !window.userManager.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Загружаем данные о скинах
        this.loadSkinData();
        
        // Инициализируем UI
        this.initUI();
        
        // Проверяем URL параметры
        this.checkUrlParameters();
        
        console.log('SkinSelector initialized:', {
            current: this.currentSkin,
            owned: this.ownedSkins
        });
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('openSkinSelector') === 'true') {
            // Открываем селектор скинов
            setTimeout(() => {
                this.openSelector();
                // Очищаем URL параметр
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    }

    loadSkinData() {
        if (window.userManager && window.userManager.settings) {
            this.currentSkin = window.userManager.settings.activeSkin || 'default';
            this.ownedSkins = window.userManager.settings.purchasedSkins || ['default'];
        } else {
            // Fallback к localStorage
            this.currentSkin = localStorage.getItem('currentSkin') || 'default';
            this.ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '["default"]');
        }
    }

    initUI() {
        const changeSkinBtn = document.getElementById('change-skin-btn');
        const modal = document.getElementById('skin-selector-modal');
        const closeBtn = document.getElementById('close-skin-selector-btn');

        if (changeSkinBtn) {
            changeSkinBtn.addEventListener('click', () => this.openSelector());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSelector());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeSelector();
                }
            });
        }

        // Обновляем отображение
        this.updateCurrentSkinDisplay();
        this.populateSkinGrid();
    }

    openSelector() {
        const modal = document.getElementById('skin-selector-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateCurrentSkinDisplay();
            this.populateSkinGrid();
        }
    }

    closeSelector() {
        const modal = document.getElementById('skin-selector-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    updateCurrentSkinDisplay() {
        const displayElement = document.getElementById('current-skin-name');
        if (displayElement && this.skins[this.currentSkin]) {
            displayElement.textContent = this.skins[this.currentSkin].name;
        }
    }

    populateSkinGrid() {
        const grid = document.getElementById('skin-selector-grid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(this.skins).forEach(([skinId, skinData]) => {
            const isOwned = this.ownedSkins.includes(skinId);
            const isActive = this.currentSkin === skinId;

            const card = document.createElement('div');
            card.className = 'skin-card';
            
            if (isActive) card.classList.add('active');
            if (!isOwned) card.classList.add('locked');

            card.innerHTML = `
                <div class="skin-preview">${skinData.preview}</div>
                <div class="skin-name">${skinData.name}</div>
                ${!isOwned ? `<div class="skin-price">${skinData.price} монет</div>` : ''}
                ${isActive ? '<div class="skin-price">✓ Активен</div>' : ''}
            `;

            if (isOwned && !isActive) {
                card.addEventListener('click', () => this.selectSkin(skinId));
            } else if (!isOwned) {
                card.addEventListener('click', () => this.showBuyMessage(skinData.name));
            }

            grid.appendChild(card);
        });
    }

    async selectSkin(skinId) {
        if (!this.ownedSkins.includes(skinId)) {
            console.warn('Попытка выбрать не купленный скин:', skinId);
            return;
        }

        this.currentSkin = skinId;

        // Сохраняем в базу данных
        if (window.userManager && window.userManager.isInitialized) {
            await window.userManager.setActiveSkin(skinId);
        }

        // Сохраняем в localStorage
        localStorage.setItem('currentSkin', skinId);

        // Применяем скин к графике
        if (window.graphics) {
            await window.graphics.changeSkin(skinId);
        }

        // Обновляем UI
        this.updateCurrentSkinDisplay();
        this.populateSkinGrid();

        // Показываем уведомление
        this.showMessage(`Скин "${this.skins[skinId].name}" применён! 🎨`);

        // Воспроизводим звук
        if (window.audioManager) {
            window.audioManager.playSound('move');
        }

        console.log('Скин изменен:', skinId);
    }

    showBuyMessage(skinName) {
        this.showMessage(`Скин "${skinName}" доступен в магазине 🛒`);
        
        // Можем автоматически открыть магазин
        setTimeout(() => {
            this.closeSelector();
            const shopBtn = document.getElementById('shop-btn');
            if (shopBtn) {
                shopBtn.click();
            }
        }, 1500);
    }

    showMessage(text) {
        // Используем существующую систему уведомлений или создаем свою
        const message = document.createElement('div');
        message.className = 'skin-change-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 30px;
            font-weight: 600;
            z-index: 1003;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            animation: slideDown 0.3s ease-out;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 2500);
    }

    // Метод для обновления списка купленных скинов (вызывается после покупки)
    async refreshOwnedSkins() {
        this.loadSkinData();
        this.populateSkinGrid();
    }
}

// Инициализация при загрузке страницы
if (typeof window !== 'undefined') {
    window.skinSelector = null;
    
    document.addEventListener('DOMContentLoaded', async () => {
        // Ждем загрузки всех зависимостей
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.skinSelector = new SkinSelector();
    });
}
