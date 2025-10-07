class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.coins = 1000;
        this.gameOver = false;
        this.won = false;
        this.moveHistory = [];
        this.maxHistorySize = 10;
        this.mergeCount = 0;
        
        // Statistics tracking
        this.wins = parseInt(localStorage.getItem('wins')) || 0;
        this.highestTile = parseInt(localStorage.getItem('highestTile')) || 0;
        
        // Boosters
        this.boosters = {
            undo: 0,
            shuffle: 0,
            bomb: 0,
            life: 0
        };
        this.loadBoosters();
        
        // Load saved data
        this.coins = parseInt(localStorage.getItem('coins')) || 1000;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        // Try to load saved game first, otherwise start new game
        console.log('=== INITIALIZING GAME ===');
        const gameLoaded = this.loadGame();
        console.log('Game loaded from storage:', gameLoaded);
        
        // If no saved game exists, start new game
        if (!gameLoaded) {
            console.log('No saved game, starting new game');
            this.newGame();
        } else {
            console.log('Saved game loaded, checking state...');
            console.log('Board:', this.board);
            console.log('gameOver:', this.gameOver);
            
            // Если игра загружена, но доска пустая - считаем как новую игру
            if (this.board.every(row => row.every(cell => cell === 0))) {
                console.log('Empty board detected, starting new game');
                // Очищаем старое сохранение
                localStorage.removeItem('gameState');
                this.newGame();
            } else if (this.checkGameOver()) {
                // Проверяем что игра не окончена
                console.log('Loaded game is over, starting new game');
                this.newGame();
            } else {
                console.log('Game loaded successfully, continuing from saved state');
            }
        }
        console.log('=== GAME INITIALIZED ===');
        
        // Ensure game over modal is hidden on initialization
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            console.log('Game over modal hidden on init');
        }
        
        // Always update display after initialization
        this.updateDisplay();
        
        // Reload boosters when page regains focus (for admin grants)
        window.addEventListener('focus', () => {
            console.log('Page focused, reloading boosters...');
            this.loadBoosters();
        });
        
        // Listen for storage events (cross-tab communication)
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('booster_')) {
                console.log('Booster updated in storage:', e.key, e.newValue);
                this.loadBoosters();
            }
        });
    }

    async loadUserData() {
        if (window.userManager && window.userManager.isInitialized) {
            this.bestScore = window.userManager.getBestScore();
            this.coins = window.userManager.getCoins();
            this.updateDisplay();
        }
    }

    initBoard() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.addRandomTile();
        this.addRandomTile();
        this.saveState();
        
        // Save initial game state to localStorage
        localStorage.setItem('gameState', JSON.stringify({
            board: this.board,
            score: this.score,
            gameOver: this.gameOver,
            won: this.won
        }));
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance for 2, 10% chance for 4 (exactly like original)
            this.board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            
            // Trigger animation for new tile
            if (window.graphics) {
                window.graphics.animateNewTile(randomCell.x, randomCell.y, this.board[randomCell.x][randomCell.y]);
            }
            return true;
        }
        return false;
    }

    saveState() {
        console.log('💾 saveState() called');
        console.log('💾 Current history length:', this.moveHistory.length);
        console.log('💾 Max history size:', this.maxHistorySize);
        
        if (this.moveHistory.length >= this.maxHistorySize) {
            console.log('💾 History full, removing oldest entry');
            this.moveHistory.shift();
        }
        
        const newState = {
            board: this.board.map(row => [...row]),
            score: this.score
        };
        
        this.moveHistory.push(newState);
        
        console.log('💾 State saved! New history length:', this.moveHistory.length);
        console.log('💾 Saved state:', newState);
    }

    loadBoosters() {
        // Загружаем бустеры из базы данных или localStorage
        if (window.userManager && window.userManager.isInitialized) {
            const bonuses = window.userManager.settings.bonusesOwned;
            this.boosters.undo = bonuses.undo || 0;
            this.boosters.shuffle = bonuses.shuffle || 0;
            this.boosters.bomb = bonuses.bomb || 0;
            this.boosters.life = bonuses.life || 0;
            console.log('Boosters loaded from database:', this.boosters);
        } else {
            // Fallback to localStorage
            this.boosters.undo = parseInt(localStorage.getItem('booster_undo')) || 0;
            this.boosters.shuffle = parseInt(localStorage.getItem('booster_shuffle')) || 0;
            this.boosters.bomb = parseInt(localStorage.getItem('booster_bomb')) || 0;
            this.boosters.life = parseInt(localStorage.getItem('booster_life')) || 0;
            console.log('Boosters loaded from localStorage:', this.boosters);
        }
        this.updateBoosterDisplay();
    }

    saveBoosters() {
        // Сохраняем в базу данных
        if (window.userManager && window.userManager.isInitialized) {
            window.userManager.settings.bonusesOwned.undo = this.boosters.undo;
            window.userManager.settings.bonusesOwned.shuffle = this.boosters.shuffle;
            window.userManager.settings.bonusesOwned.bomb = this.boosters.bomb;
            window.userManager.settings.bonusesOwned.life = this.boosters.life;
            window.userManager.saveSettings();
            console.log('Boosters saved to database:', this.boosters);
        }
        
        // Также в localStorage
        localStorage.setItem('booster_undo', this.boosters.undo);
        localStorage.setItem('booster_shuffle', this.boosters.shuffle);
        localStorage.setItem('booster_bomb', this.boosters.bomb);
        localStorage.setItem('booster_life', this.boosters.life);
    }

    updateBoosterDisplay() {
        // Обновляем отображение количества бустеров
        const undoBtn = document.getElementById('undo-booster');
        const shuffleBtn = document.getElementById('shuffle-booster');
        const bombBtn = document.getElementById('bomb-booster');
        const lifeBtn = document.getElementById('lives-booster');
        
        if (undoBtn) {
            const count = undoBtn.querySelector('.booster-count');
            if (count) count.textContent = this.boosters.undo;
            undoBtn.disabled = this.boosters.undo === 0 || this.gameOver;
            undoBtn.classList.toggle('disabled', this.boosters.undo === 0);
        }
        
        if (shuffleBtn) {
            const count = shuffleBtn.querySelector('.booster-count');
            if (count) count.textContent = this.boosters.shuffle;
            shuffleBtn.disabled = this.boosters.shuffle === 0 || this.gameOver;
            shuffleBtn.classList.toggle('disabled', this.boosters.shuffle === 0);
        }
        
        if (bombBtn) {
            const count = bombBtn.querySelector('.booster-count');
            if (count) count.textContent = this.boosters.bomb;
            bombBtn.disabled = this.boosters.bomb === 0 || this.gameOver;
            bombBtn.classList.toggle('disabled', this.boosters.bomb === 0);
        }
        
        if (lifeBtn) {
            const count = lifeBtn.querySelector('.booster-count');
            if (count) count.textContent = this.boosters.life;
        }
    }

    useUndoBooster() {
        console.log('⟲ ===== USE UNDO BOOSTER START =====');
        console.log('⟲ Current undo count:', this.boosters.undo);
        console.log('⟲ History length:', this.moveHistory.length);
        console.log('⟲ History contents:', this.moveHistory);
        console.log('⟲ Current board:', this.board.map(row => [...row]));
        console.log('⟲ Current score:', this.score);
        
        if (this.boosters.undo <= 0) {
            this.showMessage('❌ У вас нет бустера "Отмена хода"');
            console.log('❌ No undo boosters available');
            alert('❌ У вас нет отмен!\n\nКупите отмены в магазине или получите бонус.');
            return false;
        }
        
        console.log('⟲ Checking history length:', this.moveHistory.length);
        
        if (this.moveHistory.length <= 1) {
            console.error('❌ ПРОБЛЕМА: История слишком короткая!');
            console.error('   moveHistory.length:', this.moveHistory.length);
            console.error('   Нужно минимум 2 записи для отмены');
            console.error('   История:', JSON.stringify(this.moveHistory, null, 2));
            
            this.showMessage('❌ Нет ходов для отмены. Сделайте хотя бы один ход!');
            alert('❌ Нет ходов для отмены!\n\nСделайте минимум 1 ход, чтобы можно было отменить.');
            return false;
        }
        
        // Удаляем текущее состояние
        const removedState = this.moveHistory.pop();
        console.log('✅ Removed current state from history:', removedState);
        
        // Берем предыдущее состояние
        const previousState = this.moveHistory[this.moveHistory.length - 1];
        console.log('✅ Previous state:', previousState);
        
        this.board = previousState.board.map(row => [...row]);
        this.score = previousState.score;
        
        console.log('✅ Restored previous state:');
        console.log('   Board:', this.board.map(row => [...row]));
        console.log('   Score:', this.score);
        console.log('   History length now:', this.moveHistory.length);
        
        // Используем бустер
        this.boosters.undo--;
        this.saveBoosters();
        this.updateBoosterDisplay();
        this.updateDisplay();
        
        if (window.graphics) {
            window.graphics.updateBoard(this.board);
        }
        
        if (window.audioManager) {
            window.audioManager.playSound('powerup');
        }
        
        this.showMessage('⟲ Ход отменён! Осталось: ' + this.boosters.undo);
        console.log('✅ Undo booster used successfully. Remaining:', this.boosters.undo);
        console.log('⟲ ===== USE UNDO BOOSTER END =====');
        return true;
    }

    useShuffleBooster() {
        console.log('🎲 ===== USE SHUFFLE BOOSTER START =====');
        console.log('🎲 Current shuffle count:', this.boosters.shuffle);
        console.log('🎲 Board before shuffle:', this.board.map(row => [...row]));
        
        if (this.boosters.shuffle <= 0) {
            this.showMessage('У вас нет бустера "Перемешать"');
            console.log('❌ No shuffle boosters available');
            return false;
        }
        
        // Собираем все непустые значения
        const tiles = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== 0) {
                    tiles.push(this.board[i][j]);
                }
            }
        }
        
        console.log('🎲 Non-zero tiles collected:', tiles);
        
        // Перемешиваем массив (алгоритм Fisher-Yates)
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        console.log('🎲 Tiles after shuffle:', tiles);
        
        // Заполняем доску перемешанными значениями
        let tileIndex = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = tileIndex < tiles.length ? tiles[tileIndex++] : 0;
            }
        }
        
        console.log('🎲 Board after shuffle:', this.board.map(row => [...row]));
        
        // КРИТИЧНО: Сохраняем новое состояние в историю!
        this.saveState();
        console.log('✅ State saved to moveHistory');
        
        // Используем бустер
        this.boosters.shuffle--;
        this.saveBoosters();
        this.updateBoosterDisplay();
        this.updateDisplay();
        
        if (window.graphics) {
            window.graphics.updateBoard(this.board);
            console.log('✅ Graphics updated');
        }
        
        if (window.audioManager) {
            window.audioManager.playSound('powerup');
        }
        
        this.showMessage('🎲 Плитки перемешаны! Осталось: ' + this.boosters.shuffle);
        console.log('✅ Shuffle booster used, remaining:', this.boosters.shuffle);
        console.log('🎲 ===== USE SHUFFLE BOOSTER END =====');
        return true;
    }

    useBombBooster() {
        console.log('💣 ===== USE BOMB BOOSTER START =====');
        console.log('💣 Current bomb count:', this.boosters.bomb);
        
        if (this.boosters.bomb <= 0) {
            this.showMessage('У вас нет бустера "Бомба"');
            console.log('❌ No bombs available');
            return false;
        }
        
        // Активируем режим выбора плитки
        this.bombMode = true;
        console.log('✅ Bomb mode activated:', this.bombMode);
        
        this.showMessage('💣 Кликните на плитку чтобы удалить её');
        
        // Добавляем визуальный эффект
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.classList.add('bomb-mode');
            console.log('✅ Added bomb-mode class to game-board');
            console.log('   Board classes:', gameBoard.className);
        } else {
            console.error('❌ Game board element not found!');
        }
        
        // Меняем курсор на всё тело
        document.body.style.cursor = 'crosshair';
        console.log('✅ Changed cursor to crosshair');
        
        // Автоотмена через 15 секунд
        setTimeout(() => {
            if (this.bombMode) {
                console.log('⏱️ Bomb mode timeout - cancelling');
                this.cancelBombMode();
            }
        }, 15000);
        
        console.log('💣 ===== USE BOMB BOOSTER END =====');
        return true;
    }
    
    cancelBombMode() {
        console.log('💣 Cancelling bomb mode');
        this.bombMode = false;
        document.body.style.cursor = 'default';
        
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.classList.remove('bomb-mode');
        }
        
        this.showMessage('Режим бомбы отменён');
    }

    bombTile(row, col) {
        console.log(`💣 ===== BOMB TILE START =====`);
        console.log(`💣 Row: ${row}, Col: ${col}`);
        console.log(`💣 Bomb mode active:`, this.bombMode);
        console.log(`💣 Tile value:`, this.board[row][col]);
        
        if (!this.bombMode) {
            console.log('❌ Bomb mode not active');
            return false;
        }
        
        if (this.board[row][col] === 0) {
            this.showMessage('❌ Выберите непустую плитку');
            console.log('❌ Empty tile selected');
            return false;
        }
        
        console.log(`✅ Removing tile [${row}, ${col}] with value ${this.board[row][col]}`);
        
        // Удаляем плитку
        this.board[row][col] = 0;
        
        // КРИТИЧНО: Сохраняем новое состояние в историю!
        this.saveState();
        console.log('✅ State saved to moveHistory after bomb');
        
        // Используем бустер
        this.boosters.bomb--;
        this.bombMode = false;
        
        // Убираем визуальный эффект
        document.body.style.cursor = 'default';
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.classList.remove('bomb-mode');
        }
        
        this.saveBoosters();
        this.updateBoosterDisplay();
        this.updateDisplay();
        
        if (window.graphics) {
            window.graphics.updateBoard(this.board);
        }
        
        if (window.audioManager) {
            window.audioManager.playSound('explosion');
        }
        
        this.showMessage(`💥 Плитка уничтожена! Осталось бомб: ${this.boosters.bomb}`);
        console.log(`✅ Bomb used successfully. Remaining: ${this.boosters.bomb}`);
        console.log(`💣 ===== BOMB TILE END =====`);
        return true;
    }

    showMessage(message) {
        // Показываем сообщение
        const messageEl = document.getElementById('booster-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.classList.add('show');
            setTimeout(() => {
                messageEl.classList.remove('show');
            }, 2000);
        } else {
            console.log('Booster message:', message);
        }
    }

    undoMove() {
        // Старая функция для совместимости
        return this.useUndoBooster();
    }

    move(direction) {
        console.log('➡️ ===== MOVE START =====');
        console.log('➡️ Direction:', direction);
        console.log('➡️ History length BEFORE move:', this.moveHistory.length);
        
        if (this.gameOver) {
            console.log('Game is over, no moves allowed');
            return false;
        }

        const previousBoard = this.board.map(row => [...row]);
        const previousScore = this.score;
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        console.log('➡️ Moved:', moved);

        if (moved) {
            console.log('➡️ Move successful, updating state...');
            
            // Track statistics
            // Track highest tile
            const currentHighest = this.getHighestTile();
            if (currentHighest > this.highestTile) {
                this.highestTile = currentHighest;
                localStorage.setItem('highestTile', this.highestTile);
                
                // Синхронизация с userManager
                if (window.userManager && window.userManager.isInitialized) {
                    try {
                        window.userManager.settings.statistics.highestTile = Math.max(
                            window.userManager.settings.statistics.highestTile || 0,
                            this.highestTile
                        );
                        // НЕ сохраняем сразу для производительности, сохранится в endGame
                    } catch (error) {
                        console.error('Error syncing highestTile:', error);
                    }
                }
            }
            
            console.log('➡️ Calling saveState()...');
            console.log('➡️ History length BEFORE saveState:', this.moveHistory.length);
            
            this.saveState();
            
            console.log('➡️ History length AFTER saveState:', this.moveHistory.length);
            console.log('➡️ Last saved state:', this.moveHistory[this.moveHistory.length - 1]);
            
            this.addRandomTile();
            this.updateDisplay();
            
            // Update 3D graphics
            if (window.graphics) {
                window.graphics.updateBoard(this.board);
                window.graphics.animateMove(direction);
            }

            // Play sound effect and vibration
            if (window.audioManager) {
                window.audioManager.playSound('move');
            }
            if (window.vibrationManager) {
                window.vibrationManager.onMove();
            }

            // Check for win first
            if (this.checkWin() && !this.won) {
                this.won = true;
                this.wins++;
                localStorage.setItem('wins', this.wins);
                
                // Синхронизация с userManager
                if (window.userManager && window.userManager.isInitialized) {
                    try {
                        window.userManager.settings.statistics.winCount = this.wins;
                        window.userManager.saveSettings();
                        console.log('Wins synced to database:', this.wins);
                    } catch (error) {
                        console.error('Error syncing wins:', error);
                    }
                }
                
                this.showWinMessage();
            }
            
            // Then check for game over
            if (this.checkGameOver()) {
                console.log('Game over detected!');
                this.gameOver = true;
                setTimeout(() => {
                    console.log('Calling endGame()');
                    this.endGame();
                }, 500); // Небольшая задержка для показа последнего хода
            }
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(val => val !== 0);
            const merged = new Array(row.length).fill(false);
            
            // Merge tiles from left to right
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1] && !merged[j] && !merged[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.coins += Math.floor(row[j] / 10);
                    this.mergeCount++;
                    
                    // Vibration for merge
                    if (window.vibrationManager) {
                        window.vibrationManager.onMerge(row[j]);
                    }
                    
                    row.splice(j + 1, 1);
                    merged[j] = true;
                }
            }
            
            // Fill with zeros
            while (row.length < this.size) {
                row.push(0);
            }
            
            // Check if anything moved
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== row[j]) {
                    moved = true;
                }
                this.board[i][j] = row[j];
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(val => val !== 0);
            const merged = new Array(row.length).fill(false);
            
            // Merge tiles from right to left
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1] && !merged[j] && !merged[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.coins += Math.floor(row[j] / 10);
                    this.mergeCount++;
                    
                    // Vibration for merge
                    if (window.vibrationManager) {
                        window.vibrationManager.onMerge(row[j]);
                    }
                    
                    row.splice(j - 1, 1);
                    merged[j - 1] = true;
                    j--;
                }
            }
            
            // Fill with zeros at the beginning
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            // Check if anything moved
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== row[j]) {
                    moved = true;
                }
                this.board[i][j] = row[j];
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            const merged = new Array(column.length).fill(false);
            
            // Merge tiles from top to bottom
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1] && !merged[i] && !merged[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.coins += Math.floor(column[i] / 10);
                    column.splice(i + 1, 1);
                    merged[i] = true;
                }
            }
            
            // Fill with zeros
            while (column.length < this.size) {
                column.push(0);
            }
            
            // Check if anything moved
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== column[i]) {
                    moved = true;
                }
                this.board[i][j] = column[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            const merged = new Array(column.length).fill(false);
            
            // Merge tiles from bottom to top
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1] && !merged[i] && !merged[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.coins += Math.floor(column[i] / 10);
                    column.splice(i - 1, 1);
                    merged[i - 1] = true;
                    i--;
                }
            }
            
            // Fill with zeros at the beginning
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            // Check if anything moved
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== column[i]) {
                    moved = true;
                }
                this.board[i][j] = column[i];
            }
        }
        return moved;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkGameOver() {
        // Check for empty cells first
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return false; // Still have empty cells, game continues
                }
            }
        }

        // All cells are filled, check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.board[i][j];
                // Check right neighbor
                if (j < this.size - 1 && this.board[i][j + 1] === current) {
                    return false; // Can merge horizontally
                }
                // Check bottom neighbor
                if (i < this.size - 1 && this.board[i + 1][j] === current) {
                    return false; // Can merge vertically
                }
            }
        }

        // No empty cells and no possible merges
        console.log('Game Over: No moves available');
        return true;
    }

    shuffleBoard() {
        const nonZeroTiles = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== 0) {
                    nonZeroTiles.push(this.board[i][j]);
                }
            }
        }

        // Clear board
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));

        // Shuffle and place tiles
        for (let i = nonZeroTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nonZeroTiles[i], nonZeroTiles[j]] = [nonZeroTiles[j], nonZeroTiles[i]];
        }

        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                emptyCells.push({x: i, y: j});
            }
        }

        for (let i = 0; i < nonZeroTiles.length; i++) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const cell = emptyCells.splice(randomIndex, 1)[0];
            this.board[cell.x][cell.y] = nonZeroTiles[i];
        }

        this.updateDisplay();
        if (window.graphics) {
            window.graphics.updateBoard(this.board);
            window.graphics.animateShuffle();
        }
    }

    removeTile(x, y) {
        if (this.board[x][y] !== 0) {
            this.board[x][y] = 0;
            this.updateDisplay();
            if (window.graphics) {
                window.graphics.updateBoard(this.board);
                window.graphics.animateExplosion(x, y);
            }
            return true;
        }
        return false;
    }

    newGame() {
        console.log('Starting new game...');
        
        // Clear any saved game state
        localStorage.removeItem('gameState');
        
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.moveHistory = [];
        
        // НЕ увеличиваем счетчик здесь - он увеличится в updateGameStats() при окончании игры
        // Это предотвращает двойное увеличение счетчика
        console.log('New game started, gamesPlayed will be updated in endGame()');
        
        this.addRandomTile();
        this.addRandomTile();
        
        // КРИТИЧНО: Сохраняем начальное состояние в историю!
        this.saveState();
        console.log('✅ Initial state saved to moveHistory');
        
        this.updateDisplay();
        
        if (window.graphics) {
            window.graphics.renderBoard(this.board);
            if (window.graphics.resetCamera) {
                window.graphics.resetCamera();
            }
        }
        
        console.log('New game started, board:', this.board);
        console.log('Move history length:', this.moveHistory.length);
    }
    
    // Вспомогательная функция для исправления счетчика игр (вызывается из консоли)
    fixGamesPlayedCount(correctCount) {
        if (typeof correctCount !== 'number' || correctCount < 0) {
            console.error('Please provide a valid positive number');
            return;
        }
        
        localStorage.setItem('gamesPlayed', correctCount);
        
        if (window.userManager && window.userManager.isInitialized) {
            window.userManager.settings.gamesPlayed = correctCount;
            window.userManager.saveSettings();
            console.log('✅ Games played counter fixed to:', correctCount);
            console.log('Updated in localStorage and database');
        } else {
            console.log('✅ Games played counter fixed in localStorage to:', correctCount);
            console.log('⚠️ userManager not available, update will sync on next game end');
        }
    }
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('coins').textContent = this.coins.toLocaleString();
        
        // Save coins to localStorage
        localStorage.setItem('coins', this.coins);
        
        // Sync with userManager if available
        if (window.userManager && window.userManager.isInitialized) {
            try {
                window.userManager.settings.coins = this.coins;
                // НЕ сохраняем сразу (saveSettings), чтобы не создавать много запросов
                // Сохранение произойдет в endGame через updateGameStats
            } catch (error) {
                console.error('Error syncing coins:', error);
            }
        }
        
        // Update best score
        const bestScore = Math.max(this.bestScore, this.score);
        if (bestScore > this.bestScore) {
            this.bestScore = bestScore;
            localStorage.setItem('bestScore', this.bestScore);
            
            // Update leaderboard with new best score
            if (window.leaderboardManager) {
                window.leaderboardManager.updateUserScore(this.bestScore);
            }
        }
        
        // Update user ranking
        this.updateUserRanking();
        
        // Save game state
        this.saveGame();
    }

    saveGame() {
        // Save current game state to localStorage
        localStorage.setItem('gameState', JSON.stringify({
            board: this.board,
            score: this.score,
            gameOver: this.gameOver,
            won: this.won,
            moveHistory: this.moveHistory // Сохраняем историю ходов для Undo
        }));
        
        // Visual indication of game over (только CSS, не вызываем endGame)
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            if (this.gameOver) {
                gameBoard.classList.add('game-over');
            } else {
                gameBoard.classList.remove('game-over');
            }
        }
    }

    async endGame() {
        console.log('Game ended with score:', this.score);
        
        // Check if player has lives and auto-use
        if (this.boosters.life > 0) {
            console.log('💖 Player has', this.boosters.life, 'lives - auto-using!');
            
            // Auto-use life and continue
            this.boosters.life--;
            this.saveBoosters();
            this.updateBoosterDisplay();
            
            // Reset game over state
            this.gameOver = false;
            
            // Shuffle board to give player a chance
            this.shuffleBoard();
            
            console.log('💖 Life auto-used! Lives remaining:', this.boosters.life);
            
            if (window.audioManager) {
                window.audioManager.playSound('bonusUse');
            }
            if (window.vibrationManager) {
                window.vibrationManager.vibrate('bonusUse');
            }
            
            alert(`💖 Жизнь использована автоматически!\n\nДоска перемешана. Продолжайте игру!\n\nЖизней осталось: ${this.boosters.life}`);
            
            return; // Don't end game, continue playing
        }
        
        // Update best score in localStorage
        const currentBest = parseInt(localStorage.getItem('bestScore')) || 0;
        if (this.score > currentBest) {
            localStorage.setItem('bestScore', this.score);
            console.log('New best score:', this.score);
        }
        
        // Синхронизация в userManager будет в updateGameStats() ниже
        
        // Update games played counter (это дубликат, убираем чтобы не считать дважды)
        // Счетчик уже увеличен в newGame(), здесь не нужно увеличивать снова
        // const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
        // localStorage.setItem('gamesPlayed', gamesPlayed + 1);
        
        // Calculate earned coins (1 coin per 100 points)
        const earnedCoins = Math.floor(this.score / 100);
        
        // Game statistics for database
        const gameData = {
            score: this.score,
            won: this.won,
            highestTile: this.getHighestTile()
        };
        
        // Save to database
        if (window.userManager && window.userManager.isInitialized) {
            // Сначала синхронизируем текущие монеты (заработанные во время игры)
            window.userManager.settings.coins = this.coins;
            
            // Затем добавляем бонусные монеты за окончание игры
            await window.userManager.addCoins(earnedCoins);
            
            // Обновляем статистику игры
            await window.userManager.updateGameStats(gameData);
            
            // Update local values
            this.coins = window.userManager.getCoins();
            this.bestScore = window.userManager.getBestScore();
            this.wins = window.userManager.settings.statistics.winCount || 0;
            this.highestTile = window.userManager.settings.statistics.highestTile || 0;
            
            // Сохраняем обновленные данные в localStorage
            localStorage.setItem('coins', this.coins);
            localStorage.setItem('wins', this.wins);
            localStorage.setItem('highestTile', this.highestTile);
            console.log('All stats synced from database:', {
                coins: this.coins,
                bestScore: this.bestScore,
                wins: this.wins,
                highestTile: this.highestTile
            });
        } else {
            // Если userManager недоступен, сохраняем в localStorage
            localStorage.setItem('coins', this.coins);
        }
        
        // Update leaderboard with new score
        if (window.leaderboardManager) {
            window.leaderboardManager.updateUserScore(this.score);
            console.log('Leaderboard updated with score:', this.score);
        }
        
        // Update final score elements
        const finalScoreEl = document.getElementById('final-score');
        const earnedCoinsEl = document.getElementById('earned-coins');
        
        if (finalScoreEl) {
            finalScoreEl.textContent = this.score.toLocaleString();
        }
        if (earnedCoinsEl) {
            earnedCoinsEl.textContent = earnedCoins.toLocaleString();
        }
        
        if (window.audioManager) {
            window.audioManager.playSound('gameOver');
        }
        if (window.vibrationManager) {
            window.vibrationManager.onGameOver();
        }
        
        // Show game over modal immediately
        const modal = document.getElementById('game-over-modal');
        console.log('Looking for game-over-modal:', modal);
        
        if (modal) {
            console.log('Modal found, adding active class');
            modal.classList.add('active');
            modal.style.display = 'flex'; // Force display
            console.log('Game over modal opened, classes:', modal.classList.toString());
        } else {
            console.error('Game over modal not found in DOM');
            // Fallback: show alert immediately
            alert(`Игра окончена!\nВаш счёт: ${this.score}\nЗаработано монет: ${earnedCoins}\n\nНажмите кнопку "НОВАЯ" внизу для новой игры.`);
        }
        
        this.updateDisplay();
    }

    getHighestTile() {
        let highest = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                highest = Math.max(highest, this.board[i][j]);
            }
        }
        return highest;
    }

    loadGame() {
        try {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Если сохранение содержит gameOver=true, игнорируем его
                if (state.gameOver === true) {
                    console.log('Saved game was over, starting fresh');
                    localStorage.removeItem('gameState');
                    return false;
                }
                
                // Validate saved state
                if (state.board && Array.isArray(state.board) && state.board.length === 4) {
                    this.board = state.board;
                    this.score = state.score || 0;
                    // Не загружаем gameOver из сохранения - всегда начинаем с false
                    this.gameOver = false;
                    this.won = state.won || false;
                    
                    console.log('Game loaded from saved state:', {
                        score: this.score,
                        gameOver: this.gameOver,
                        board: this.board
                    });
                    
                    // Восстанавливаем историю ходов если она была сохранена
                    if (state.moveHistory && Array.isArray(state.moveHistory) && state.moveHistory.length > 0) {
                        this.moveHistory = state.moveHistory.map(entry => ({
                            board: entry.board.map(row => [...row]),
                            score: entry.score
                        }));
                        console.log('✅ Restored moveHistory from saved game:', this.moveHistory.length, 'entries');
                    } else {
                        // Если истории нет, создаем начальную
                        this.moveHistory = [];
                        this.saveState();
                        console.log('✅ Created initial moveHistory for loaded game (no history in save)');
                    }
                    
                    this.updateDisplay();
                    
                    if (window.graphics) {
                        window.graphics.updateBoard(this.board);
                    }
                    
                    return true; // Successfully loaded
                }
            }
        } catch (error) {
            console.warn('Failed to load saved game:', error);
            localStorage.removeItem('gameState');
        }
        
        return false; // Failed to load
        const colors = {
            0: '#cdc1b4',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e',
            4096: '#3c3a32',
            8192: '#3c3a32'
        };
        return colors[value] || '#3c3a32';
    }

    getTileTextColor(value) {
        return value <= 4 ? '#776e65' : '#f9f6f2';
    }

    updateUserRanking() {
        if (!window.leaderboardManager) return;

        try {
            // Используем единую функцию обновления
            window.leaderboardManager.updateRankingEverywhere();
            
            // Remove click handler - ranking is just a display now
        } catch (error) {
            console.error('Error updating user ranking:', error);
            const rankingElement = document.getElementById('user-ranking');
            if (rankingElement) {
                rankingElement.textContent = '1';
            }
        }
    }
}
