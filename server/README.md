# 🚀 2048 Telegram Mini App - Backend Setup

## 📋 Требования

- Node.js 16+ 
- MongoDB (локально или MongoDB Atlas)
- Telegram Bot Token: `1832915778:AAEoEWEQLFkG43zhgZ6PfLQyrwci_20_7KE`

---

## ⚙️ Установка

### 1. Установите зависимости:

```bash
cd server
npm install
```

### 2. Настройте переменные окружения:

Создайте файл `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
BOT_TOKEN=1832915778:AAEoEWEQLFkG43zhgZ6PfLQyrwci_20_7KE
WEBAPP_URL=https://your-domain.com
MONGODB_URI=mongodb://localhost:27017/2048-game
PORT=3000
```

### 3. Установите MongoDB (если нужно):

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Или используйте MongoDB Atlas** (бесплатно):
1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте кластер
3. Получите connection string
4. Вставьте в `.env` как `MONGODB_URI`

---

## 🚀 Запуск

### Development (с автоперезагрузкой):

```bash
npm run dev
```

### Production:

```bash
npm start
```

Сервер запустится на `http://localhost:3000`

---

## 📡 API Endpoints

### User Management

**Регистрация пользователя:**
```http
POST /api/user/register
Content-Type: application/json

{
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://..."
}
```

**Получить профиль:**
```http
GET /api/user/:telegram_id
```

### Scores & Leaderboard

**Загрузить счет:**
```http
POST /api/score
Content-Type: application/json

{
  "telegram_id": 123456789,
  "username": "john_doe",
  "avatar": "J",
  "score": 5000,
  "timestamp": 1234567890
}
```

**Получить лидерборд:**
```http
GET /api/leaderboard?limit=100&offset=0
```

**Получить ранг пользователя:**
```http
GET /api/rank/:telegram_id
```

**Статистика:**
```http
GET /api/stats
```

---

## 🤖 Настройка Telegram Bot

### 1. Откройте @BotFather в Telegram

### 2. Настройте Mini App:

```
/setmenubutton
@your_bot_name
button text: 🎮 Играть
URL: https://your-domain.com
```

### 3. Настройте команды:

```
/setcommands
@your_bot_name

start - Начать игру
```

### 4. Настройте описание:

```
/setdescription
@your_bot_name

🎮 Классическая игра 2048 в Telegram!
Объединяйте плитки и достигайте 2048!
Соревнуйтесь с друзьями в глобальном рейтинге!
```

---

## 🌐 Деплой

### Vercel (рекомендуется):

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Деплой:
```bash
vercel
```

3. Настройте переменные окружения в Vercel Dashboard

### Railway:

1. Подключите GitHub репозиторий
2. Добавьте переменные окружения
3. Deploy автоматически

### Heroku:

```bash
heroku create your-app-name
heroku config:set BOT_TOKEN=1832915778:AAEoEWEQLFkG43zhgZ6PfLQyrwci_20_7KE
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

---

## 📊 База данных

### Коллекции:

**users:**
```javascript
{
  telegram_id: Number,
  username: String,
  first_name: String,
  last_name: String,
  photo_url: String,
  display_name: String,
  avatar: String,
  created_at: Date,
  last_active: Date
}
```

**scores:**
```javascript
{
  telegram_id: Number,
  username: String,
  avatar: String,
  score: Number,
  timestamp: Number,
  created_at: Date,
  updated_at: Date
}
```

---

## 🔧 Troubleshooting

### MongoDB connection error:
- Проверьте, запущен ли MongoDB: `brew services list`
- Проверьте MONGODB_URI в `.env`

### Bot не отвечает:
- Проверьте BOT_TOKEN
- Убедитесь, что сервер запущен
- Проверьте логи: `npm run dev`

### CORS errors:
- Убедитесь, что WEBAPP_URL правильный
- Проверьте настройки CORS в `server.js`

---

## ✅ Готово!

Ваш Backend API готов к работе! 

**Следующие шаги:**
1. Запустите сервер: `npm run dev`
2. Откройте бота в Telegram
3. Нажмите "Начать" - профиль создастся автоматически
4. Играйте и смотрите обновления в реальном времени!

**Логи покажут:**
- ✅ Регистрацию пользователей
- ✅ Загрузку счетов
- ✅ Обновления рейтинга
