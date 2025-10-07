# 🚀 Быстрый запуск - Игра 2048 с базой данных

## ⚡ Запуск за 3 минуты

### Вариант 1: С MongoDB (полная функциональность)

#### 1. Установите MongoDB

**Windows:**
```bash
# Скачайте и установите: https://www.mongodb.com/try/download/community
# MongoDB запустится автоматически как служба Windows
```

**Или используйте MongoDB Atlas (бесплатно, в облаке):**
- Зарегистрируйтесь: https://www.mongodb.com/cloud/atlas
- Создайте бесплатный кластер M0
- Получите connection string

#### 2. Создайте файл `.env`

Создайте файл `server/.env`:

```env
BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
WEBAPP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/2048-game
PORT=3000
```

> **Для MongoDB Atlas** замените `MONGODB_URI`:
> ```
> MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/2048-game
> ```

#### 3. Установите зависимости и запустите

```bash
# Перейдите в папку сервера
cd server

# Установите зависимости
npm install

# Запустите сервер
npm run dev:full
```

Вы увидите:
```
✅ Connected to MongoDB
🚀 Server running on port 3000
🤖 Telegram bot is active
💾 Database: MongoDB connected
🎮 Game ready to play!
```

#### 4. Откройте игру

Откройте в браузере: **http://localhost:3000**

---

### Вариант 2: Без MongoDB (только localStorage)

Самый простой способ для тестирования:

```bash
cd server
npm install
npm run dev
```

Сервер запустится без базы данных. Все данные будут сохраняться локально в браузере.

---

## ✅ Что было сделано

### 1. **Серверная часть** (`server/server.js`)
- ✅ Полный REST API с MongoDB
- ✅ Автоматический fallback на localStorage если MongoDB недоступна
- ✅ Telegram Bot интеграция
- ✅ Все необходимые endpoints:
  - Регистрация пользователей
  - Сохранение счетов
  - Глобальный рейтинг
  - Игровые сессии
  - Достижения и настройки

### 2. **Клиентская часть**
- ✅ `telegram-integration.js` - автоматическая регистрация и синхронизация
- ✅ `database.js` - работа с IndexedDB и синхронизация с сервером
- ✅ `leaderboard.js` - получение рейтинга с сервера
- ✅ Автоматическое определение URL API (localhost или production)

### 3. **Двойная система хранения**
- Все данные сохраняются **и на сервере, и локально**
- Если сервер недоступен - работа продолжается с локальными данными
- При восстановлении связи - данные синхронизируются

---

## 🔧 API Endpoints

Все endpoints доступны по адресу `http://localhost:3000/api`

### Основные:
- `POST /api/user/register` - Регистрация пользователя
- `POST /api/score` - Загрузка счета
- `GET /api/leaderboard` - Глобальный рейтинг
- `GET /api/rank/:telegram_id` - Позиция в рейтинге
- `GET /api/health` - Состояние сервера

**Полный список:** смотрите в `SETUP_DATABASE.md`

---

## 📊 Структура базы данных

### Коллекции MongoDB:
1. **users** - профили пользователей
2. **scores** - лучшие результаты
3. **game_sessions** - история игр
4. **achievements** - достижения
5. **user_settings** - настройки пользователей

---

## 🎮 Как это работает

### При запуске игры:
1. Пользователь открывает `http://localhost:3000`
2. `telegram-integration.js` создает профиль пользователя
3. Автоматически отправляется запрос на `/api/user/register`
4. Пользователь сохраняется в MongoDB (если доступна)
5. Загружается глобальный рейтинг с сервера

### При завершении игры:
1. Счет отправляется на `/api/score`
2. Сервер сохраняет только лучший результат
3. Обновляется глобальный рейтинг
4. Данные также сохраняются локально как backup

### Синхронизация:
- При каждом запуске игры данные синхронизируются
- Если сервер недоступен - используются локальные данные
- При восстановлении связи - происходит автосинхронизация

---

## 🚀 Деплой в продакшен

### Render.com (рекомендуется)

1. Зарегистрируйтесь на https://render.com
2. Создайте Web Service
3. Подключите ваш GitHub репозиторий
4. Настройки:
   ```
   Build Command: cd server && npm install
   Start Command: cd server && npm run start:full
   ```
5. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
   MONGODB_URI=mongodb+srv://...  (MongoDB Atlas)
   WEBAPP_URL=https://your-app.onrender.com
   ```

### Railway.app

1. Создайте аккаунт на https://railway.app
2. Создайте новый проект из GitHub
3. Добавьте MongoDB из маркетплейса
4. Добавьте переменные окружения
5. Deploy происходит автоматически

---

## 🐛 Решение проблем

### Сервер не запускается
```bash
# Проверьте, что установлены зависимости
cd server
npm install

# Проверьте наличие файла .env
ls .env  # (или dir .env в Windows)
```

### MongoDB не подключается
```bash
# Проверьте, запущена ли MongoDB
# Windows: services.msc -> найдите MongoDB
# Или используйте MongoDB Atlas

# Проверьте connection string в .env
cat .env  # (или type .env в Windows)
```

### Данные не сохраняются
1. Откройте консоль браузера (F12)
2. Проверьте наличие ошибок
3. Проверьте, что сервер запущен
4. Проверьте `/api/health`:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Telegram Bot не работает
1. Проверьте BOT_TOKEN в `.env`
2. Убедитесь, что токен правильный (получите у @BotFather)
3. Для локального тестирования Bot необязателен

---

## 📝 Проверка работы

### 1. Проверьте статус сервера:
```bash
curl http://localhost:3000/api/health
```

Ответ должен быть:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "database": "connected",
  "mode": "database"
}
```

### 2. Откройте игру:
```
http://localhost:3000
```

### 3. Сыграйте партию и проверьте:
- Консоль браузера (F12) - должны быть сообщения о регистрации
- Консоль сервера - должны быть логи о сохранении счета
- MongoDB Compass - должна появиться база `2048-game` с коллекциями

---

## 💡 Полезные команды

```bash
# Запуск с MongoDB
cd server
npm run dev:full

# Запуск без MongoDB
npm run dev

# Проверка здоровья
curl http://localhost:3000/api/health

# Просмотр БД (если MongoDB установлена локально)
mongosh
use 2048-game
db.users.find()
db.scores.find().sort({score: -1})
```

---

## 🎯 Что дальше?

1. ✅ Настройте MongoDB (локально или Atlas)
2. ✅ Создайте `.env` файл
3. ✅ Запустите сервер: `npm run dev:full`
4. ✅ Откройте игру: `http://localhost:3000`
5. ✅ Проверьте работу регистрации и сохранения
6. ✅ Задеплойте на Render/Railway

---

## 📖 Дополнительная документация

- **Полная инструкция:** `SETUP_DATABASE.md`
- **README проекта:** `README.md`
- **README сервера:** `server/README.md`

---

**Готово! Ваше приложение полностью интегрировано с базой данных!** 🎉

Все игровые данные автоматически сохраняются и синхронизируются между устройствами.
