# 🚀 Telegram Mini App Integration Guide

## ✅ Что сделано:

### 1. **Создан модуль telegram-integration.js**
- Автоматическое получение данных пользователя из Telegram
- Создание профиля при первом запуске
- Сохранение данных: Telegram ID, username, имя, фото
- Система рейтинга с автоматическим обновлением позиций
- Haptic feedback для нативного ощущения

### 2. **Добавлен Telegram WebApp SDK**
- Подключен во всех HTML файлах
- `<script src="https://telegram.org/js/telegram-web-app.js"></script>`

### 3. **Функционал**

#### При первом запуске (кнопка "Начать"):
1. Получает данные пользователя из Telegram
2. Создает профиль с:
   - `telegramId` - ID пользователя
   - `username` - никнейм из Telegram
   - `firstName` / `lastName` - имя и фамилия
   - `photoUrl` - ссылка на фото профиля
   - `displayName` - отображаемое имя
   - `avatar` - аватар (первая буква имени или эмодзи)

3. Сохраняет в localStorage

#### При игре:
1. Автоматически загружает счет в систему рейтинга
2. Обновляет позицию в лидерборде
3. Синхронизирует с другими игроками

---

## 📋 Структура данных профиля:

```javascript
{
    telegramId: 123456789,
    firstName: "Иван",
    lastName: "Петров",
    username: "ivan_petrov",
    photoUrl: "https://t.me/i/userpic/...",
    displayName: "ivan_petrov",
    avatar: "И",
    createdAt: 1234567890,
    lastActive: 1234567890
}
```

---

## 📋 Структура данных рейтинга:

```javascript
{
    telegram_id: 123456789,
    username: "ivan_petrov",
    avatar: "И",
    score: 5000,
    timestamp: 1234567890
}
```

---

## 🔧 API методы:

### `window.telegramIntegration`

#### `getUserProfile()`
Возвращает профиль текущего пользователя

#### `uploadScore(score)`
Загружает счет в систему рейтинга

#### `getLeaderboard()`
Получает весь лидерборд (отсортирован по очкам)

#### `getUserRank()`
Возвращает позицию пользователя в рейтинге

#### `hapticFeedback(type)`
Вибрация:
- `'light'` - легкая
- `'medium'` - средняя
- `'heavy'` - сильная
- `'success'` - успех
- `'error'` - ошибка
- `'warning'` - предупреждение

---

## 🔌 Подключение к Backend API:

### В файле `js/telegram-integration.js` найдите метод `uploadScore()`:

```javascript
async uploadScore(score) {
    const profile = this.getUserProfile();
    const data = {
        telegram_id: profile.telegramId,
        username: profile.displayName,
        avatar: profile.avatar,
        score: score,
        timestamp: Date.now()
    };
    
    // TODO: Замените на ваш API endpoint
    const response = await fetch('YOUR_API_URL/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    return response.ok;
}
```

### Пример Backend API (Node.js + Express):

```javascript
app.post('/api/score', async (req, res) => {
    const { telegram_id, username, avatar, score, timestamp } = req.body;
    
    // Сохранить в БД (MongoDB, PostgreSQL, etc.)
    await db.collection('scores').updateOne(
        { telegram_id },
        { 
            $set: { username, avatar, timestamp },
            $max: { score } // Обновить только если новый счет больше
        },
        { upsert: true }
    );
    
    res.json({ success: true });
});

app.get('/api/leaderboard', async (req, res) => {
    const scores = await db.collection('scores')
        .find()
        .sort({ score: -1 })
        .limit(100)
        .toArray();
    
    res.json(scores);
});
```

---

## 🎮 Использование в игре:

### При окончании игры (в `js/game.js`):

```javascript
gameOver() {
    this.gameOver = true;
    
    // Upload score to leaderboard
    if (window.telegramIntegration) {
        window.telegramIntegration.uploadScore(this.score);
    }
    
    // Show game over modal
    this.showGameOver();
}
```

### Обновление рейтинга (в `js/leaderboard.js`):

```javascript
updateLeaderboard() {
    if (window.telegramIntegration) {
        const leaderboard = window.telegramIntegration.getLeaderboard();
        this.renderLeaderboard(leaderboard);
    }
}
```

---

## 📱 Тестирование:

### Локально (без Telegram):
- Автоматически создается демо-пользователь
- Все функции работают с localStorage

### В Telegram:
1. Создайте бота через @BotFather
2. Настройте Mini App URL
3. Откройте приложение в Telegram
4. Данные пользователя загрузятся автоматически

---

## ✅ Готово к использованию!

Все файлы обновлены:
- ✅ `index.html` - добавлен SDK и скрипт
- ✅ `welcome.html` - интеграция при первом запуске
- ✅ `js/telegram-integration.js` - основной модуль
- ✅ Защита от зума на всех страницах
- ✅ Haptic feedback

**Следующий шаг**: Подключите ваш Backend API для синхронизации с реальной БД!
