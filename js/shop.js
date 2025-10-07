class Shop {
    constructor(game, bonusSystem) {
        this.game = game;
        this.bonusSystem = bonusSystem;
        
        // Загружаем скины из базы данных или localStorage
        if (window.userManager && window.userManager.isInitialized) {
            this.ownedSkins = window.userManager.settings.purchasedSkins || ['default'];
            this.currentSkin = window.userManager.settings.activeSkin || 'default';
            console.log('Shop: Loaded skins from userManager:', {
                owned: this.ownedSkins,
                active: this.currentSkin
            });
        } else {
            this.ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || ['default'];
            this.currentSkin = localStorage.getItem('currentSkin') || 'default';
            console.log('Shop: Loaded skins from localStorage');
        }
        
        // Используем глобальные конфигурации скинов
        this.skins = window.SKIN_CONFIGS || {};
        
        // ВАЖНО: Загружаем настройки скинов из админки (enabled/prices)
        this.loadAdminSkinSettings();
        
        // Если конфигурации еще не загружены, используем fallback
        if (Object.keys(this.skins).length === 0) {
            console.warn('Skin configs not loaded yet, using fallback');
            this.skins = {
                default: {
                    name: 'Классический',
                    price: 0,
                    description: 'Стандартный дизайн игры',
                    preview: '🎯'
                }
            };
        }

        this.bonusItems = {
            undo: {
                name: 'Отмена хода',
                price: 50,
                priceStars: 3,
                description: 'Отменить последний ход',
                icon: '🔄'
            },
            shuffle: {
                name: 'Перемешать',
                price: 75,
                priceStars: 4,
                description: 'Перемешать плитки на поле',
                icon: '🎲'
            },
            bomb: {
                name: 'Бомба',
                price: 100,
                priceStars: 5,
                description: 'Уничтожить выбранную плитку',
                icon: '💣'
            },
            life: {
                name: 'Жизнь',
                price: 150,
                priceStars: 8,
                description: 'Продолжить игру после проигрыша',
                icon: '💖'
            }
        };
        
        // Загружаем цены бустеров из админки
        this.loadBoosterPrices();

        this.initShop();
        this.populateShop();
    }

    loadAdminSkinSettings() {
        // Загружаем настройки скинов из localStorage (из админки)
        const skinSettings = JSON.parse(localStorage.getItem('skinSettings')) || {};
        const skinPrices = JSON.parse(localStorage.getItem('skinPrices')) || {};
        
        Object.entries(this.skins).forEach(([skinId, skin]) => {
            // Применяем сохраненный статус enabled
            if (skinSettings[skinId]) {
                skin.enabled = skinSettings[skinId].enabled;
            }
            
            // Применяем сохраненные цены
            if (skinPrices[skinId]) {
                skin.priceStars = skinPrices[skinId].stars;
                skin.price = skinPrices[skinId].coins;
            }
        });
        
        console.log('✅ Настройки скинов загружены из админки');
    }

    loadBoosterPrices() {
        // Загружаем цены бустеров из localStorage (из админки)
        const boosterPrices = JSON.parse(localStorage.getItem('boosterPrices')) || {};
        
        Object.entries(this.bonusItems).forEach(([bonusId, bonus]) => {
            if (boosterPrices[bonusId]) {
                // Поддержка нового формата (объект с coins и stars)
                if (typeof boosterPrices[bonusId] === 'object') {
                    bonus.price = boosterPrices[bonusId].coins || bonus.price;
                    bonus.priceStars = boosterPrices[bonusId].stars || bonus.priceStars;
                } else {
                    // Поддержка старого формата (просто число) для обратной совместимости
                    bonus.price = boosterPrices[bonusId];
                }
            }
        });
        
        console.log('✅ Цены бустеров загружены из админки:', this.bonusItems);
    }

    initShop() {
        // Shop modal controls
        document.getElementById('shop-btn').addEventListener('click', () => {
            this.openShop();
        });

        document.getElementById('close-shop-btn').addEventListener('click', () => {
            this.closeShop();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Close modal when clicking outside
        document.getElementById('shop-modal').addEventListener('click', (e) => {
            if (e.target.id === 'shop-modal') {
                this.closeShop();
            }
        });
    }

    openShop() {
        document.getElementById('shop-modal').classList.add('active');
        this.updateShopDisplay();
    }

    closeShop() {
        document.getElementById('shop-modal').classList.remove('active');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    populateShop() {
        this.populateSkins();
        this.populateBonuses();
    }

    populateSkins() {
        const skinsGrid = document.getElementById('skins-grid');
        skinsGrid.innerHTML = '';

        // Фильтруем только включенные скины и сортируем по цене
        const enabledSkins = Object.entries(this.skins)
            .filter(([skinId, skin]) => skin.enabled !== false) // Показываем только enabled скины
            .sort((a, b) => a[1].price - b[1].price); // Сортировка от дешевых к дорогим

        enabledSkins.forEach(([skinId, skin]) => {
            const skinElement = document.createElement('div');
            skinElement.className = 'shop-item';
            
            const isOwned = this.ownedSkins.includes(skinId);
            const isCurrent = this.currentSkin === skinId;
            
            if (isOwned) {
                skinElement.classList.add('owned');
            }
            
            if (isCurrent) {
                skinElement.classList.add('active-skin');
            }

            const priceHTML = skin.price === 0 ? 
                '<div class="item-price free">Бесплатно</div>' :
                `<div class="item-prices">
                    <div class="price-option price-stars">
                        <span class="price-icon">⭐</span>
                        <span class="price-value">${skin.priceStars || 0}</span>
                    </div>
                    <div class="price-divider">или</div>
                    <div class="price-option price-coins">
                        <span class="price-icon">💰</span>
                        <span class="price-value">${skin.price}</span>
                    </div>
                </div>`;
            
            // Определяем текст и стиль кнопки
            let buttonsHTML = '';
            
            if (isCurrent) {
                // Скин активен
                buttonsHTML = `
                    <button class="buy-btn active-btn" disabled>
                        ✓ Активен
                    </button>
                `;
            } else if (isOwned) {
                // Скин куплен, но не активен
                buttonsHTML = `
                    <button class="buy-btn use-btn" data-skin="${skinId}">
                        Использовать
                    </button>
                `;
            } else {
                // Скин не куплен - показываем 2 кнопки
                const hasEnoughCoins = this.game.coins >= skin.price;
                
                buttonsHTML = `
                    <div class="payment-buttons">
                        <button class="buy-btn buy-coins-btn ${hasEnoughCoins ? '' : 'insufficient'}" 
                                data-skin="${skinId}" 
                                data-method="coins"
                                ${hasEnoughCoins ? '' : 'disabled'}>
                            <span class="btn-icon">💰</span>
                            <span class="btn-label">${skin.price}</span>
                            ${!hasEnoughCoins ? '<span class="btn-hint">Недостаточно</span>' : ''}
                        </button>
                        <button class="buy-btn buy-stars-btn" 
                                data-skin="${skinId}" 
                                data-method="stars">
                            <span class="btn-icon">⭐</span>
                            <span class="btn-label">${skin.priceStars || 0}</span>
                        </button>
                    </div>
                `;
            }
            
            skinElement.innerHTML = `
                <div class="item-preview">${skin.preview}</div>
                <h3>${skin.name}</h3>
                <p>${skin.description}</p>
                ${buttonsHTML}
            `;

            // Обработчики кнопок
            if (isOwned && !isCurrent) {
                // Кнопка "Использовать"
                const useBtn = skinElement.querySelector('.use-btn');
                if (useBtn) {
                    useBtn.addEventListener('click', () => this.useSkin(skinId));
                }
            } else if (!isOwned) {
                // Кнопки покупки
                const coinsBtn = skinElement.querySelector('.buy-coins-btn');
                const starsBtn = skinElement.querySelector('.buy-stars-btn');
                
                if (coinsBtn) {
                    coinsBtn.addEventListener('click', () => {
                        this.buySkinWithCoins(skinId, skin);
                    });
                }
                
                if (starsBtn) {
                    starsBtn.addEventListener('click', () => {
                        this.buySkinWithStars(skinId, skin);
                    });
                }
            }

            skinsGrid.appendChild(skinElement);
        });
    }

    populateBonuses() {
        const bonusesGrid = document.getElementById('boosters-grid');
        if (!bonusesGrid) return;
        bonusesGrid.innerHTML = ''; // Очищаем и НЕ добавляем заголовок

        Object.entries(this.bonusItems).forEach(([bonusId, bonus]) => {
            const bonusElement = document.createElement('div');
            bonusElement.className = 'shop-item';
            
            // Если бустер "скоро будет доступен"
            if (bonus.comingSoon) {
                bonusElement.classList.add('coming-soon');
            }

            // Проверка баланса монет
            const hasEnoughCoins = this.game.coins >= bonus.price;
            
            // Если бустер недоступен - показываем бейдж
            let buttonsHTML;
            if (bonus.comingSoon) {
                buttonsHTML = `
                    <div class="coming-soon-badge">
                        <span class="badge-icon">🔜</span>
                        <span class="badge-text">Скоро будет доступен</span>
                    </div>
                    <div class="payment-buttons">
                        <button class="buy-btn buy-coins-btn insufficient" disabled>
                            <span class="btn-icon">💰</span>
                            <span class="btn-label">${bonus.price}</span>
                        </button>
                        <button class="buy-btn buy-stars-btn insufficient" disabled>
                            <span class="btn-icon">⭐</span>
                            <span class="btn-label">${bonus.priceStars || 0}</span>
                        </button>
                    </div>
                `;
            } else {
                buttonsHTML = `
                    <div class="payment-buttons">
                        <button class="buy-btn buy-coins-btn ${hasEnoughCoins ? '' : 'insufficient'}" 
                                data-bonus="${bonusId}" 
                                data-method="coins"
                                ${hasEnoughCoins ? '' : 'disabled'}>
                            <span class="btn-icon">💰</span>
                            <span class="btn-label">${bonus.price}</span>
                            ${!hasEnoughCoins ? '<span class="btn-hint">Недостаточно</span>' : ''}
                        </button>
                        <button class="buy-btn buy-stars-btn" 
                                data-bonus="${bonusId}" 
                                data-method="stars">
                            <span class="btn-icon">⭐</span>
                            <span class="btn-label">${bonus.priceStars || 0}</span>
                        </button>
                    </div>
                `;
            }

            bonusElement.innerHTML = `
                <div class="item-preview">${bonus.icon}</div>
                <h3>${bonus.name}</h3>
                <p>${bonus.description}</p>
                ${buttonsHTML}
            `;

            // Обработчики кнопок только для доступных бустеров
            if (!bonus.comingSoon) {
                const coinsBtn = bonusElement.querySelector('.buy-coins-btn');
                const starsBtn = bonusElement.querySelector('.buy-stars-btn');
                
                if (coinsBtn) {
                    coinsBtn.addEventListener('click', () => {
                        this.buyBonus(bonusId);
                    });
                }
                
                if (starsBtn) {
                    starsBtn.addEventListener('click', () => {
                        this.buyBonusWithStars(bonusId, bonus);
                    });
                }
            }
            
            bonusesGrid.appendChild(bonusElement);
        });
    }

    showPaymentChoice(skinId, skin) {
        const modal = document.createElement('div');
        modal.className = 'modal active payment-choice-modal';
        modal.innerHTML = `
            <div class="modal-content payment-choice-content">
                <h2>💳 Выберите способ оплаты</h2>
                <div class="skin-preview-large">
                    <div class="preview-icon">${skin.preview}</div>
                    <div class="preview-name">${skin.name}</div>
                </div>
                <div class="payment-options">
                    <button class="payment-btn stars-btn" data-method="stars">
                        <div class="payment-icon">⭐</div>
                        <div class="payment-label">Telegram Stars</div>
                        <div class="payment-amount">${skin.priceStars} Stars</div>
                    </button>
                    <button class="payment-btn coins-btn" data-method="coins">
                        <div class="payment-icon">💰</div>
                        <div class="payment-label">Монеты</div>
                        <div class="payment-amount">${skin.price} монет</div>
                        <div class="payment-balance">Баланс: ${this.game.coins}</div>
                    </button>
                </div>
                <button class="btn btn-secondary cancel-payment">Отмена</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики
        modal.querySelector('.stars-btn').addEventListener('click', () => {
            modal.remove();
            this.buySkinWithStars(skinId, skin);
        });
        
        modal.querySelector('.coins-btn').addEventListener('click', () => {
            modal.remove();
            this.buySkinWithCoins(skinId, skin);
        });
        
        modal.querySelector('.cancel-payment').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async buySkinWithCoins(skinId, skin) {
        const currentCoins = this.game.coins;

        if (currentCoins < skin.price) {
            this.showInsufficientFundsMessage(skin.price - currentCoins);
            return;
        }

        // Deduct coins
        this.game.coins -= skin.price;
        localStorage.setItem('coins', this.game.coins);
        this.game.updateDisplay();

        // Add to owned skins
        await this.completeSkinPurchase(skinId, skin, 'coins');
    }

    async buySkinWithStars(skinId, skin) {
        // Интеграция с Telegram Stars API
        if (!window.Telegram?.WebApp) {
            this.showMessage('Telegram WebApp недоступен. Используйте монеты.', 'error');
            return;
        }

        try {
            // Вызов Telegram API для оплаты Stars
            const invoice = {
                title: `Скин: ${skin.name}`,
                description: skin.description,
                payload: `skin_${skinId}`,
                provider_token: '', // Для Stars не нужен
                currency: 'XTR', // Telegram Stars
                prices: [{
                    label: skin.name,
                    amount: skin.priceStars
                }]
            };

            // Здесь будет реальная интеграция с Telegram
            this.showMessage(`Оплата ${skin.priceStars} ⭐ Stars будет добавлена после интеграции с ботом`, 'info');
            
            // После успешной оплаты:
            await this.completeSkinPurchase(skinId, skin, 'stars');
            
        } catch (error) {
            console.error('Ошибка оплаты Stars:', error);
            this.showMessage('Ошибка оплаты. Попробуйте монеты.', 'error');
        }
    }

    async completeSkinPurchase(skinId, skin, paymentMethod = 'coins') {
        // Add to owned skins
        this.ownedSkins.push(skinId);
        
        // Сохраняем в базу данных
        if (window.userManager && window.userManager.isInitialized) {
            if (!window.userManager.settings.purchasedSkins.includes(skinId)) {
                window.userManager.settings.purchasedSkins.push(skinId);
                await window.userManager.saveSettings();
            }
            console.log('Skin purchased and saved to database:', skinId);
        }
        
        // Также сохраняем в localStorage для совместимости
        localStorage.setItem('ownedSkins', JSON.stringify(this.ownedSkins));

        // Save purchase statistics for admin panel
        const purchases = JSON.parse(localStorage.getItem('skinPurchases')) || {};
        if (!purchases[skinId]) {
            purchases[skinId] = { count: 0, paymentMethod, price: 0 };
        }
        purchases[skinId].count++;
        purchases[skinId].paymentMethod = paymentMethod;
        purchases[skinId].price = paymentMethod === 'stars' ? skin.priceStars : skin.price;
        localStorage.setItem('skinPurchases', JSON.stringify(purchases));

        // Use the skin immediately
        await this.useSkin(skinId);
        
        // Обновляем skinSelector если он существует
        if (window.skinSelector) {
            await window.skinSelector.refreshOwnedSkins();
            console.log('✅ SkinSelector refreshed after purchase');
        }
        
        // Show purchase effect
        this.showPurchaseEffect(`Скин "${skin.name}" куплен!`);

        // Update shop display
        this.populateSkins();

        if (window.audioManager) {
            window.audioManager.playSound('purchase');
        }
    }

    async buySkin(skinId) {
        const skin = this.skins[skinId];
        const currentCoins = this.game.coins;

        if (currentCoins >= skin.price) {
            // Deduct coins
            this.game.coins -= skin.price;
            localStorage.setItem('coins', this.game.coins);
            this.game.updateDisplay();

            // Add to owned skins
            this.ownedSkins.push(skinId);
            
            // Сохраняем в базу данных
            if (window.userManager && window.userManager.isInitialized) {
                await window.userManager.purchaseSkin(skinId, skin.price);
                console.log('Skin purchased and saved to database:', skinId);
            }
            
            // Также сохраняем в localStorage для совместимости
            localStorage.setItem('ownedSkins', JSON.stringify(this.ownedSkins));

            // Use the skin immediately
            await this.useSkin(skinId);
            // Show purchase effect
            this.showPurchaseEffect(`Скин "${skin.name}" куплен!`);

            // Update shop display
            this.populateSkins();

            if (window.audioManager) {
                window.audioManager.playSound('purchase');
            }
        }
    }

    async useSkin(skinId) {
        console.log('🎨 ==================== НАЧАЛО СМЕНЫ СКИНА ====================');
        console.log('🎨 Запрошен скин:', skinId);
        console.log('🎨 Текущий скин:', this.currentSkin);
        
        this.currentSkin = skinId;
        
        // Сохраняем в базу данных
        if (window.userManager && window.userManager.isInitialized) {
            await window.userManager.setActiveSkin(skinId);
            console.log('✅ Skin saved to database:', skinId);
        }
        
        // Также сохраняем в localStorage для совместимости
        localStorage.setItem('currentSkin', skinId);
        console.log('✅ Skin saved to localStorage:', skinId);

        // КРИТИЧНО: Применяем data-skin к body НЕМЕДЛЕННО
        document.body.setAttribute('data-skin', skinId);
        console.log('✅ Applied data-skin to body:', document.body.getAttribute('data-skin'));

        // Update graphics
        if (window.graphics) {
            console.log('✅ Graphics object found, calling changeSkin...');
            window.graphics.changeSkin(skinId);
        } else {
            console.error('❌ Graphics object NOT FOUND!');
        }
        
        // ФОРСИРОВАННОЕ обновление доски для применения CSS
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            console.log('✅ Forcing CSS recalculation on game-board');
            // Trigger reflow
            gameBoard.style.display = 'none';
            gameBoard.offsetHeight; // force reflow
            gameBoard.style.display = '';
            console.log('✅ Game board display reset');
        }
        
        console.log('🎨 ==================== КОНЕЦ СМЕНЫ СКИНА ====================');
        
        // Reload shop
        this.populateSkins();

        // Update bonus display
        this.populateBonusItems();

        this.showMessage(`Скин "${this.skins[skinId].name}" активирован!`);
    }

    buyBonus(bonusId) {
        const bonus = this.bonusItems[bonusId];
        const currentCoins = this.game.coins;

        if (currentCoins >= bonus.price) {
            // Deduct coins
            this.game.coins -= bonus.price;
            this.game.updateDisplay();

            // Add bonus
            this.bonusSystem.addBonus(bonusId, 1);

            // Show purchase effect
            this.showPurchaseEffect(`Бонус "${bonus.name}" куплен!`);

            if (window.audioManager) {
                window.audioManager.playSound('purchase');
            }
            
            // Обновляем отображение
            this.populateBonuses();
        } else {
            this.showInsufficientFundsMessage(bonus.price - currentCoins);
        }
    }

    buyBonusWithStars(bonusId, bonus) {
        // Заглушка для оплаты Stars
        if (!window.Telegram?.WebApp) {
            this.showMessage('Telegram WebApp недоступен. Используйте монеты.', 'error');
            return;
        }

        this.showMessage(`Оплата ${bonus.priceStars} ⭐ Stars будет добавлена после интеграции с ботом`, 'info');
        
        // TODO: После успешной оплаты Stars:
        // this.bonusSystem.addBonus(bonusId, 1);
        // this.showPurchaseEffect(`Бонус "${bonus.name}" куплен!`);
    }

    showPurchaseEffect(message) {
        // Create purchase animation
        const effect = document.createElement('div');
        effect.textContent = message;
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 18px;
            z-index: 1002;
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;

        document.body.appendChild(effect);

        // Animate the effect
        gsap.fromTo(effect, 
            { 
                scale: 0.5, 
                opacity: 0,
                rotation: -10
            },
            { 
                scale: 1, 
                opacity: 1,
                rotation: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }
        );

        // Remove after animation
        setTimeout(() => {
            gsap.to(effect, {
                scale: 0.8,
                opacity: 0,
                y: -50,
                duration: 0.3,
                onComplete: () => {
                    if (effect.parentNode) {
                        effect.parentNode.removeChild(effect);
                    }
                }
            });
        }, 2000);

        // Create coin particles
        this.createCoinParticles();
    }

    createCoinParticles() {
        const particleCount = 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.textContent = '💰';
            particle.style.cssText = `
                position: fixed;
                font-size: 20px;
                pointer-events: none;
                z-index: 1001;
                top: 50%;
                left: 50%;
            `;

            document.body.appendChild(particle);

            // Random animation
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            gsap.to(particle, {
                x: endX,
                y: endY,
                rotation: 360,
                scale: 0,
                duration: 1 + Math.random() * 0.5,
                ease: "power2.out",
                onComplete: () => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }
            });
        }
    }

    showInsufficientFundsMessage(needed) {
        this.showMessage(`Недостаточно монет! Нужно ещё ${needed} монет.`, 'error');
    }

    showMessage(text, type = 'success') {
        // Remove existing message
        const existingMessage = document.getElementById('shop-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.id = 'shop-message';
        message.textContent = text;
        
        const colors = {
            success: 'rgba(46, 204, 113, 0.9)',
            error: 'rgba(231, 76, 60, 0.9)',
            info: 'rgba(52, 152, 219, 0.9)'
        };

        message.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1003;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(message);

        // Animate in
        gsap.fromTo(message, 
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 }
        );

        // Auto-hide after 3 seconds
        setTimeout(() => {
            gsap.to(message, {
                y: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }
            });
        }, 3000);
    }

    updateShopDisplay() {
        // Update coin display in shop if needed
        const coinDisplays = document.querySelectorAll('.coins-display');
        coinDisplays.forEach(display => {
            display.textContent = this.game.coins.toLocaleString();
        });
    }

    // Special offers system
    checkSpecialOffers() {
        const lastOffer = localStorage.getItem('lastSpecialOffer');
        const today = new Date().toDateString();
        
        if (lastOffer !== today && Math.random() < 0.3) {
            this.showSpecialOffer();
            localStorage.setItem('lastSpecialOffer', today);
        }
    }

    showSpecialOffer() {
        const offers = [
            {
                title: 'Скидка 50% на неоновый скин!',
                originalPrice: 500,
                discountPrice: 250,
                item: 'neon',
                type: 'skin'
            },
            {
                title: 'Набор бонусов со скидкой!',
                description: '3 отмены хода + 2 перемешать + 1 бомба',
                originalPrice: 300,
                discountPrice: 200,
                bonuses: { undo: 3, shuffle: 2, bomb: 1 }
            }
        ];

        const offer = offers[Math.floor(Math.random() * offers.length)];
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🎉 Специальное предложение!</h2>
                <h3>${offer.title}</h3>
                ${offer.description ? `<p>${offer.description}</p>` : ''}
                <div style="margin: 20px 0;">
                    <span style="text-decoration: line-through; color: #ccc;">${offer.originalPrice} монет</span>
                    <span style="color: #4ecdc4; font-size: 1.5em; margin-left: 10px;">${offer.discountPrice} монет</span>
                </div>
                <div class="modal-buttons">
                    <button id="accept-offer" class="btn btn-primary">Купить!</button>
                    <button id="decline-offer" class="btn btn-secondary">Отклонить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('accept-offer').addEventListener('click', () => {
            if (this.game.coins >= offer.discountPrice) {
                this.game.coins -= offer.discountPrice;
                this.game.updateDisplay();
                
                if (offer.type === 'skin') {
                    this.ownedSkins.push(offer.item);
                    localStorage.setItem('ownedSkins', JSON.stringify(this.ownedSkins));
                    this.useSkin(offer.item);
                } else if (offer.bonuses) {
                    Object.entries(offer.bonuses).forEach(([bonus, amount]) => {
                        this.bonusSystem.addBonus(bonus, amount);
                    });
                }
                
                this.showPurchaseEffect('Специальное предложение куплено!');
                modal.remove();
            } else {
                this.showInsufficientFundsMessage(offer.discountPrice - this.game.coins);
            }
        });
        
        document.getElementById('decline-offer').addEventListener('click', () => {
            modal.remove();
        });
    }
}
