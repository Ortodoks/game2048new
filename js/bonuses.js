class BonusSystem {
    constructor(game) {
        this.game = game;
        this.bonuses = {
            undo: parseInt(localStorage.getItem('bonus_undo')) || 3,
            shuffle: parseInt(localStorage.getItem('bonus_shuffle')) || 2,
            bomb: parseInt(localStorage.getItem('bonus_bomb')) || 1
        };
        this.bombMode = false;
        
        this.initBonusButtons();
        this.updateBonusDisplay();
    }

    initBonusButtons() {
        // Undo bonus
        const undoBtn = document.getElementById('bonus-undo');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.useUndo();
            });
        }

        // Shuffle bonus
        const shuffleBtn = document.getElementById('bonus-shuffle');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.useShuffle();
            });
        }

        // Bomb bonus
        const bombBtn = document.getElementById('bonus-bomb');
        if (bombBtn) {
            bombBtn.addEventListener('click', () => {
                this.useBomb();
            });
        }
    }

    useUndo() {
        if (this.bonuses.undo > 0 && !this.game.gameOver) {
            if (this.game.undoMove()) {
                this.bonuses.undo--;
                this.saveBonuses();
                this.updateBonusDisplay();
                this.showBonusEffect('undo');
                
                if (window.audioManager) {
                    window.audioManager.playSound('bonus');
                }
            }
        } else {
            this.showInsufficientBonusMessage('Отмена хода');
        }
    }

    useShuffle() {
        if (this.bonuses.shuffle > 0 && !this.game.gameOver) {
            this.game.shuffleBoard();
            this.bonuses.shuffle--;
            this.saveBonuses();
            this.updateBonusDisplay();
            this.showBonusEffect('shuffle');
            
            if (window.audioManager) {
                window.audioManager.playSound('bonus');
            }
        } else {
            this.showInsufficientBonusMessage('Перемешать');
        }
    }

    useBomb() {
        if (this.bonuses.bomb > 0 && !this.game.gameOver) {
            this.bombMode = true;
            document.body.style.cursor = 'crosshair';
            document.getElementById('bonus-bomb').classList.add('active');
            
            // Add click listener to game board for tile selection
            const gameBoard = document.getElementById('game-board');
            gameBoard.addEventListener('click', this.handleBombClick.bind(this), { once: true });
            
            this.showMessage('Выберите плитку для уничтожения');
            
            // Auto-cancel bomb mode after 10 seconds
            setTimeout(() => {
                if (this.bombMode) {
                    this.cancelBombMode();
                }
            }, 10000);
        } else {
            this.showInsufficientBonusMessage('Бомба');
        }
    }

    handleBombClick(event) {
        if (!this.bombMode) return;

        // Check if clicked on a tile
        const clickedElement = event.target;
        if (clickedElement.classList.contains('tile') && clickedElement.textContent) {
            // Extract coordinates from tile ID
            const tileId = clickedElement.id;
            const coords = tileId.split('-');
            const x = parseInt(coords[1]);
            const y = parseInt(coords[2]);
            
            if (this.game.board[x][y] !== 0) {
                // Remove the tile
                this.game.removeTile(x, y);
                this.bonuses.bomb--;
                this.saveBonuses();
                this.updateBonusDisplay();
                this.showBonusEffect('bomb');
                
                if (window.audioManager) {
                    window.audioManager.playSound('explosion');
                }
            }
        }

        this.cancelBombMode();
    }

    cancelBombMode() {
        this.bombMode = false;
        document.body.style.cursor = 'default';
        document.getElementById('bonus-bomb').classList.remove('active');
        this.hideMessage();
    }

    addBonus(type, amount = 1) {
        if (this.bonuses.hasOwnProperty(type)) {
            this.bonuses[type] += amount;
            this.saveBonuses();
            this.updateBonusDisplay();
            this.showBonusGainEffect(type, amount);
        }
    }

    updateBonusDisplay() {
        const undoCount = document.querySelector('#bonus-undo .bonus-count');
        if (undoCount) undoCount.textContent = this.bonuses.undo;
        
        const shuffleCount = document.querySelector('#bonus-shuffle .bonus-count');
        if (shuffleCount) shuffleCount.textContent = this.bonuses.shuffle;
        
        const bombCount = document.querySelector('#bonus-bomb .bonus-count');
        if (bombCount) bombCount.textContent = this.bonuses.bomb;

        // Update button states
        const undoBtn = document.getElementById('bonus-undo');
        if (undoBtn) undoBtn.classList.toggle('disabled', this.bonuses.undo === 0);
        
        const shuffleBtn = document.getElementById('bonus-shuffle');
        if (shuffleBtn) shuffleBtn.classList.toggle('disabled', this.bonuses.shuffle === 0);
        
        const bombBtn = document.getElementById('bonus-bomb');
        if (bombBtn) bombBtn.classList.toggle('disabled', this.bonuses.bomb === 0);
    }

    saveBonuses() {
        localStorage.setItem('bonus_undo', this.bonuses.undo);
        localStorage.setItem('bonus_shuffle', this.bonuses.shuffle);
        localStorage.setItem('bonus_bomb', this.bonuses.bomb);
    }

    showBonusEffect(type) {
        const bonusElement = document.getElementById(`bonus-${type}`);
        if (bonusElement) {
            bonusElement.classList.add('pulse');
            
            setTimeout(() => {
                bonusElement.classList.remove('pulse');
            }, 600);

            // Create floating text effect
            this.createFloatingText(`${type.toUpperCase()} ИСПОЛЬЗОВАН!`, bonusElement);
        }
    }

    showBonusGainEffect(type, amount) {
        const bonusElement = document.getElementById(`bonus-${type}`);
        if (bonusElement) {
            this.createFloatingText(`+${amount}`, bonusElement, '#4ecdc4');
        }
    }

    createFloatingText(text, element, color = '#fff') {
        if (!element) return;
        
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: absolute;
            color: ${color};
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        const rect = element.getBoundingClientRect();
        floatingText.style.left = rect.left + rect.width / 2 + 'px';
        floatingText.style.top = rect.top + 'px';

        document.body.appendChild(floatingText);

        // Animate the floating text
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(floatingText, 
                { 
                    y: 0, 
                    opacity: 1,
                    scale: 0.8
                },
                { 
                    y: -50, 
                    opacity: 0,
                    scale: 1.2,
                    duration: 1.5,
                    ease: "power2.out",
                    onComplete: () => {
                        document.body.removeChild(floatingText);
                    }
                }
            );
        } else {
            // Fallback animation
            setTimeout(() => {
                floatingText.style.transform = 'translateY(-50px)';
                floatingText.style.opacity = '0';
                setTimeout(() => {
                    if (floatingText.parentNode) {
                        document.body.removeChild(floatingText);
                    }
                }, 500);
            }, 1000);
        }
    }

    showInsufficientBonusMessage(bonusName) {
        this.showMessage(`Недостаточно бонусов "${bonusName}". Купите в магазине!`, 'error');
    }

    showMessage(text, type = 'info') {
        // Remove existing message
        const existingMessage = document.getElementById('bonus-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.id = 'bonus-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(52, 152, 219, 0.9)'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1001;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(message);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideMessage();
        }, 3000);
    }

    hideMessage() {
        const message = document.getElementById('bonus-message');
        if (message) {
            if (typeof gsap !== 'undefined') {
                gsap.to(message, {
                    duration: 0.3,
                    opacity: 0,
                    scale: 0.8,
                    onComplete: () => {
                        if (message.parentNode) {
                            message.parentNode.removeChild(message);
                        }
                    }
                });
            } else {
                // Fallback
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 300);
            }
        }
    }

    // Daily bonus system
    checkDailyBonus() {
        const lastBonus = localStorage.getItem('lastDailyBonus');
        const today = new Date().toDateString();
        
        if (lastBonus !== today) {
            // Give daily bonus
            this.addBonus('undo', 1);
            this.addBonus('shuffle', 1);
            
            // Random chance for bomb bonus
            if (Math.random() < 0.3) {
                this.addBonus('bomb', 1);
            }
            
            localStorage.setItem('lastDailyBonus', today);
            this.showDailyBonusMessage();
        }
    }

    showDailyBonusMessage() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🎁 Ежедневный бонус!</h2>
                <p>Вы получили:</p>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>+1 Отмена хода</li>
                    <li>+1 Перемешать</li>
                    <li>${Math.random() < 0.3 ? '+1 Бомба' : 'Попробуйте завтра для бомбы!'}</li>
                </ul>
                <button id="close-daily-bonus" class="btn btn-primary">Отлично!</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-daily-bonus').addEventListener('click', () => {
            modal.remove();
        });
    }

    // Achievement system
    checkAchievements(score, highestTile) {
        const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        
        // Score achievements
        if (score >= 10000 && !achievements.score10k) {
            achievements.score10k = true;
            this.addBonus('bomb', 1);
            this.showAchievementMessage('Мастер счёта!', 'Достигните 10,000 очков', '+1 Бомба');
        }
        
        if (score >= 50000 && !achievements.score50k) {
            achievements.score50k = true;
            this.addBonus('bomb', 2);
            this.addBonus('shuffle', 1);
            this.showAchievementMessage('Легенда!', 'Достигните 50,000 очков', '+2 Бомбы, +1 Перемешать');
        }
        
        // Tile achievements
        if (highestTile >= 512 && !achievements.tile512) {
            achievements.tile512 = true;
            this.addBonus('undo', 2);
            this.showAchievementMessage('Продвинутый игрок!', 'Достигните плитки 512', '+2 Отмены хода');
        }
        
        if (highestTile >= 1024 && !achievements.tile1024) {
            achievements.tile1024 = true;
            this.addBonus('shuffle', 2);
            this.showAchievementMessage('Эксперт!', 'Достигните плитки 1024', '+2 Перемешать');
        }
        
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }

    showAchievementMessage(title, description, reward) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🏆 ${title}</h2>
                <p>${description}</p>
                <p><strong>Награда: ${reward}</strong></p>
                <button id="close-achievement" class="btn btn-primary">Забрать награду!</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-achievement').addEventListener('click', () => {
            modal.remove();
        });
        
        if (window.audioManager) {
            window.audioManager.playSound('achievement');
        }
    }

    getHighestTile() {
        let highest = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.game.board[i][j] > highest) {
                    highest = this.game.board[i][j];
                }
            }
        }
        return highest;
    }

    reset() {
        // Don't reset bonuses on new game, only on explicit reset
        this.cancelBombMode();
    }
}
