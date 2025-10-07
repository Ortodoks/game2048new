# 🎮 Игра 2048 - Telegram Web App с базой данных

## ✅ Что готово

Ваше веб-приложение **полностью настроено** для работы с базой данных MongoDB и Telegram Web App.

### 🔧 Реализованная функциональность:

#### 1. **Серверная часть** (`server/server.js`)
- ✅ Полный REST API с MongoDB
- ✅ 20+ API endpoints для всех операций
- ✅ Автоматический fallback на localStorage если MongoDB недоступна
- ✅ Telegram Bot интеграция
- ✅ Graceful shutdown и обработка ошибок

#### 2. **Клиентская часть**
- ✅ `js/telegram-integration.js` - автоматическая регистрация пользователей
- ✅ `js/database.js` - синхронизация с сервером
- ✅ `js/leaderboard.js` - глобальный рейтинг с сервера
- ✅ Автоматическое определение URL API (localhost/production)
- ✅ Двойное хранение данных (сервер + локально)

#### 3. **База данных MongoDB**
- ✅ 5 коллекций: users, scores, game_sessions, achievements, user_settings
- ✅ Индексы для оптимизации запросов
- ✅ Автоматическое создание структуры при первом запуске

---

## 🚀 Как запустить (3 шага)

### Шаг 1: Настройте MongoDB

**Вариант A - Локальная MongoDB:**
```bash
# Скачайте и установите с https://www.mongodb.com/try/download/community
# После установки MongoDB запустится автоматически
```

**Вариант B - MongoDB Atlas (облачная, бесплатно):**
1. Регистрация: https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер M0
3. Создайте пользователя БД
4. Получите connection string

### Шаг 2: Создайте файл `.env`

Скопируйте `server/.env.example` в `server/.env`:

```bash
cd server
copy .env.example .env
```

Отредактируйте `server/.env`:

```env
BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
WEBAPP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/2048-game
PORT=3000
```

> **Для MongoDB Atlas** измените MONGODB_URI на ваш connection string

### Шаг 3: Запустите сервер

```bash
cd server
npm install
npm run dev:full
```

Откройте браузер: **http://localhost:3000**

---

## 📁 Важные файлы

### Основные:
- `server/server.js` - Основной сервер с MongoDB
- `server/server-simple.js` - Простой сервер без БД
- `server/.env` - Конфигурация (создайте из .env.example)
- `index.html` - Главная страница игры
- `js/telegram-integration.js` - Интеграция с Telegram
- `js/database.js` - Работа с базой данных
- `js/leaderboard.js` - Система рейтингов

### Документация:
- `START_HERE.md` - **Этот файл** (начните здесь)
- `QUICK_START.md` - Быстрый старт
- `SETUP_DATABASE.md` - Подробная настройка БД
- `README.md` - Общее описание проекта
- `server/README.md` - Документация сервера

---

## 🔍 Проверка работы

### 1. Проверьте сервер:
```bash
curl http://localhost:3000/api/health
```

Должно вернуть:
```json
{
  "status": "ok",
  "database": "connected",
  "mode": "database"
}
```

### 2. Откройте игру:
```
http://localhost:3000
```

### 3. Проверьте консоль:
Откройте DevTools (F12) и проверьте:
- ✅ "✅ User registered on server successfully"
- ✅ "✅ Connected to MongoDB"
- ✅ "✅ Loaded leaderboard from server"

---

## 📊 API Endpoints

Все доступны по адресу `http://localhost:3000/api`

### Пользователи:
- `POST /api/user/register` - Регистрация
- `GET /api/user/:telegram_id` - Профиль
- `PUT /api/user/:telegram_id` - Обновление
- `GET /api/user/photo/:telegram_id` - Фото из Telegram

### Игра:
- `POST /api/score` - Загрузка счета
- `GET /api/leaderboard` - Рейтинг (топ-100)
- `GET /api/rank/:telegram_id` - Позиция игрока
- `GET /api/stats` - Общая статистика

### Сессии и достижения:
- `POST /api/game-session` - Сохранить игровую сессию
- `GET /api/game-sessions/:telegram_id` - История игр
- `POST /api/achievements` - Разблокировать достижение
- `GET /api/achievements/:telegram_id` - Список достижений

### Настройки:
- `POST /api/user-settings` - Сохранить настройки
- `GET /api/user-settings/:telegram_id` - Получить настройки

### Админ:
- `GET /api/check-admin/:telegram_id` - Проверка прав
- `GET /api/admin/users` - Все пользователи (только админ)

### Служебные:
- `GET /api/health` - Состояние сервера

---

## 🎯 Режимы работы

### Режим 1: С MongoDB (рекомендуется)
```bash
npm run dev:full    # разработка
npm run start:full  # продакшен
```
- Все данные в MongoDB
- Глобальный рейтинг работает
- Синхронизация между устройствами

### Режим 2: Без MongoDB (упрощенный)
```bash
npm run dev    # разработка
npm start      # продакшен
```
- Данные только в localStorage браузера
- Рейтинг локальный
- Подходит для тестирования

---

## 🌐 Деплой

### Render.com (рекомендуется):

1. Создайте MongoDB Atlas (бесплатно)
2. Зарегистрируйтесь на https://render.com
3. Создайте Web Service из GitHub
4. Build Command: `cd server && npm install`
5. Start Command: `cd server && npm run start:full`
6. Переменные окружения:
   ```
   BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
   MONGODB_URI=mongodb+srv://...
   WEBAPP_URL=https://your-app.onrender.com
   ```

### Railway.app:

1. Создайте проект из GitHub
2. Добавьте MongoDB из маркетплейса
3. Добавьте переменные окружения
4. Deploy автоматически

---

## 🐛 Частые проблемы

### MongoDB не подключается
```bash
# Проверьте, запущена ли MongoDB
# Windows: Win+R -> services.msc -> найдите MongoDB

# Или используйте MongoDB Atlas (облачная БД)
```

### Сервер не запускается
```bash
# Проверьте наличие .env
dir server\.env

# Установите зависимости заново
cd server
npm install
```

### Данные не сохраняются
1. Проверьте `/api/health`
2. Откройте консоль браузера (F12)
3. Проверьте логи сервера

---

## 💡 Как это работает

### При открытии игры:
1. `telegram-integration.js` получает данные пользователя
2. Автоматически регистрирует на сервере (`/api/user/register`)
3. Загружает глобальный рейтинг (`/api/leaderboard`)
4. Синхронизирует настройки

### При завершении игры:
1. Счет отправляется на `/api/score`
2. MongoDB сохраняет только лучший результат
3. Обновляется глобальный рейтинг
4. Локальная копия сохраняется как backup

### Синхронизация:
- **Онлайн:** все данные на сервере
- **Оффлайн:** работа продолжается с локальными данными
- **Восстановление связи:** автоматическая синхронизация

---

## 📦 Структура проекта

```
game2048new/
├── server/
│   ├── server.js           # Основной сервер с MongoDB
│   ├── server-simple.js    # Упрощенный сервер
│   ├── package.json        # Зависимости сервера
│   ├── .env.example        # Шаблон конфигурации
│   └── .env                # Ваша конфигурация (создайте)
├── js/
│   ├── telegram-integration.js  # Telegram + API
│   ├── database.js              # Синхронизация с сервером
│   ├── leaderboard.js           # Рейтинг
│   ├── game.js                  # Логика игры
│   ├── main.js                  # Инициализация
│   └── ...
├── index.html              # Главная страница
├── leaderboard.html        # Страница рейтинга
├── profile.html            # Профиль игрока
├── shop.html               # Магазин
├── tasks.html              # Задания
├── styles.css              # Стили
├── package.json            # Зависимости клиента
├── START_HERE.md           # ⭐ Этот файл
├── QUICK_START.md          # Быстрый старт
├── SETUP_DATABASE.md       # Подробная настройка
└── README.md               # Описание проекта
```

---

## ⚡ Команды для работы

```bash
# Установка
cd server
npm install

# Разработка с MongoDB
npm run dev:full

# Разработка без MongoDB
npm run dev

# Продакшен
npm run start:full

# Проверка
curl http://localhost:3000/api/health

# Просмотр БД
mongosh
use 2048-game
db.users.find()
db.scores.find().sort({score: -1}).limit(10)
```

---

## 🎉 Готово!

**Ваше приложение полностью готово к работе!**

### Следующие шаги:
1. ✅ Создайте `server/.env` (скопируйте из .env.example)
2. ✅ Установите MongoDB или используйте Atlas
3. ✅ Запустите: `npm run dev:full`
4. ✅ Откройте: http://localhost:3000
5. ✅ Проверьте работу
6. ✅ Задеплойте на Render/Railway

### Поддержка:
- **Быстрый старт:** `QUICK_START.md`
- **Подробная настройка:** `SETUP_DATABASE.md`
- **Документация сервера:** `server/README.md`

---

**Успешной разработки! 🚀**
