class Graphics2D {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        
        // Ждем загрузки конфигураций скинов
        this.waitForSkinConfigs();
        
        // Загружаем скин из базы данных или localStorage
        if (window.userManager && window.userManager.isInitialized) {
            this.currentSkin = window.userManager.settings.activeSkin || 'default';
            console.log('Graphics: Loaded skin from userManager:', this.currentSkin);
        } else {
            this.currentSkin = localStorage.getItem('currentSkin') || 'default';
            console.log('Graphics: Loaded skin from localStorage:', this.currentSkin);
        }
        
        this.gameBoard = document.getElementById('game-board');
        this.gameBoardContainer = document.getElementById('game-board-container');
        
        if (!this.gameBoard) {
            throw new Error('Game board element not found');
        }
        
        this.init();
    }

    waitForSkinConfigs() {
        // Проверяем доступность конфигураций скинов
        const checkConfigs = () => {
            if (window.SKIN_CONFIGS) {
                console.log('✅ Skin configs loaded');
            } else {
                console.warn('⚠️ Skin configs not yet loaded, using fallback');
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkConfigs);
        } else {
            checkConfigs();
        }
    }

    init() {
        this.createBoard();
        // Применяем активный скин
        this.applySkin(this.currentSkin);
    }

    createBoard() {
        console.log('🎮 Creating game board...');
        console.log('Game board element:', this.gameBoard);
        this.gameBoard.innerHTML = '';
        
        let tilesCreated = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${i}-${j}`;
                tile.style.background = 'rgba(238, 228, 218, 0.35)'; // Добавляем видимый фон
                tile.style.minWidth = '50px';
                tile.style.minHeight = '50px';
                
                // КРИТИЧНО: Добавляем обработчик клика для режима бомбы
                tile.addEventListener('click', () => {
                    if (window.game && window.game.bombMode) {
                        console.log(`💣 Bomb click on tile [${i}, ${j}]`);
                        window.game.bombTile(i, j);
                    }
                });
                
                this.gameBoard.appendChild(tile);
                tilesCreated++;
            }
        }
        console.log(`✅ Created ${tilesCreated} tiles with bomb handlers`);
        console.log('Game board children:', this.gameBoard.children.length);
    }

    updateBoard(newBoard) {
        console.log('Graphics2D: Updating board with:', newBoard);
        this.board = newBoard;
        
        // Получаем текущий скин и его конфигурацию
        const skinConfig = window.SKIN_CONFIGS?.[this.currentSkin] || window.SKIN_CONFIGS?.default;
        const tileColors = skinConfig?.styleConfig?.tileColors || {};
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tileElement = document.getElementById(`tile-${i}-${j}`);
                const value = newBoard[i][j];
                
                if (!tileElement) {
                    console.error(`Tile element not found: tile-${i}-${j}`);
                    continue;
                }
                
                if (value === 0) {
                    tileElement.textContent = '';
                    tileElement.className = 'tile';
                    tileElement.style.background = '';
                    tileElement.style.color = '';
                } else {
                    tileElement.textContent = value;
                    tileElement.className = `tile tile-${value}`;
                    
                    // Применяем цвета из скина
                    if (tileColors[value]) {
                        tileElement.style.background = tileColors[value].bg;
                        tileElement.style.color = tileColors[value].color;
                    }
                    
                    console.log(`Set tile ${i}-${j} to value ${value}`);
                }
            }
        }
    }

    animateNewTile(x, y, value) {
        const tileElement = document.getElementById(`tile-${x}-${y}`);
        if (tileElement) {
            tileElement.classList.add('new-tile');
            setTimeout(() => {
                tileElement.classList.remove('new-tile');
            }, 300);
        }
    }

    animateMerge(x, y, value) {
        // Анимация слияния плитки с эффектом текущего скина
        const tileElement = document.getElementById(`tile-${x}-${y}`);
        if (tileElement) {
            tileElement.classList.add('merged');
            
            // Удаляем класс после завершения анимации
            setTimeout(() => {
                tileElement.classList.remove('merged');
            }, 700);
        }
    }

    animateMove(direction) {
        // Add a subtle shake effect to the board
        const board = this.gameBoard;
        board.style.transform = 'scale(1.02)';
        setTimeout(() => {
            board.style.transform = 'scale(1)';
        }, 150);
    }

    animateShuffle() {
        // Rotate the entire board
        const board = this.gameBoard;
        board.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            board.style.transform = 'rotate(0deg)';
        }, 500);
    }

    animateExplosion(x, y) {
        const tileElement = document.getElementById(`tile-${x}-${y}`);
        if (tileElement) {
            // Create explosion effect
            tileElement.style.background = '#ff6b6b';
            tileElement.style.transform = 'scale(1.5)';
            
            setTimeout(() => {
                tileElement.style.background = '';
                tileElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    async changeSkin(skinName) {
        this.currentSkin = skinName;
        
        // Сохраняем в базу данных
        if (window.userManager && window.userManager.isInitialized) {
            await window.userManager.setActiveSkin(skinName);
            console.log('Graphics: Skin saved to database:', skinName);
        }
        
        // Также сохраняем в localStorage для совместимости
        localStorage.setItem('currentSkin', skinName);
        
        // Применяем скин
        this.applySkin(skinName);
        
        // Обновляем отображение доски
        this.updateBoard(this.board);
    }

    applySkin(skinName) {
        console.log('🎨 ===== GRAPHICS.APPLYSKIN START =====');
        console.log('🎨 Requested skin:', skinName);
        
        // Получаем конфигурацию скина
        const skinConfig = window.SKIN_CONFIGS?.[skinName] || window.SKIN_CONFIGS?.default;
        
        if (!skinConfig) {
            console.error('❌ Skin config not found:', skinName);
            console.error('❌ Available skins:', Object.keys(window.SKIN_CONFIGS || {}));
            return;
        }
        
        console.log('✅ Skin config found:', skinConfig.name);
        const style = skinConfig.styleConfig;
        
        // КРИТИЧНО: Применяем data-skin к html и body
        document.documentElement.setAttribute('data-skin', skinName);
        document.body.setAttribute('data-skin', skinName);
        console.log('✅ data-skin="' + skinName + '" applied to html and body');
        
        // Применяем стили к игровой доске
        if (this.gameBoard) {
            // Сохраняем для плиток
            this.gameBoard.dataset.skin = skinName;
            console.log('✅ data-skin applied to game-board');
            
            // Убираем старые инлайн-стили чтобы CSS работал
            this.gameBoard.style.removeProperty('background');
            this.gameBoard.style.removeProperty('border-color');
            this.gameBoard.style.removeProperty('box-shadow');
            console.log('✅ Removed inline styles from game-board');
            
            // Форсируем перерисовку
            void this.gameBoard.offsetHeight;
            console.log('✅ Forced reflow');
        }
        
        // Обновляем цвета плиток
        this.updateTileColors(style.tileColors);
        console.log('✅ Tile colors updated');
        
        // Финальная проверка
        console.log('📋 FINAL CHECK:');
        console.log('   - html[data-skin]:', document.documentElement.getAttribute('data-skin'));
        console.log('   - body[data-skin]:', document.body.getAttribute('data-skin'));
        console.log('   - #game-board[data-skin]:', this.gameBoard?.dataset.skin);
        console.log('   - Computed background:', window.getComputedStyle(this.gameBoard).background.substring(0, 50) + '...');
        console.log('🎨 ===== GRAPHICS.APPLYSKIN END =====');
    }

    updateTileColors(tileColors) {
        // Обновляем стили всех плиток согласно скину
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tileElement = document.getElementById(`tile-${i}-${j}`);
                const value = this.board[i][j];
                
                if (tileElement && value > 0 && tileColors[value]) {
                    const colors = tileColors[value];
                    tileElement.style.background = colors.bg;
                    tileElement.style.color = colors.color;
                }
            }
        }
    }

    resize() {
        // Responsive design is handled by CSS
    }

    renderBoard(board) {
        // Alias for updateBoard - used when starting new game
        this.updateBoard(board);
    }
}
