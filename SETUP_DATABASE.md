# 🚀 Настройка базы данных для игры 2048

## 📋 Обзор

Ваше веб-приложение теперь полностью интегрировано с базой данных MongoDB. Система работает в двух режимах:

- **С базой данных (MongoDB)** - все данные сохраняются на сервере
- **Без базы данных (localStorage)** - данные сохраняются локально в браузере

## ✅ Что уже готово

### 1. **Серверная часть** (`server/server.js`)
- ✅ Полный REST API с MongoDB
- ✅ Регистрация пользователей
- ✅ Сохранение счетов и рейтинга
- ✅ Игровые сессии
- ✅ Достижения
- ✅ Настройки пользователей
- ✅ Telegram Bot интеграция
- ✅ Автоматический fallback на localStorage

### 2. **Клиентская часть**
- ✅ `js/telegram-integration.js` - автоматическая регистрация пользователей
- ✅ `js/database.js` - работа с IndexedDB и localStorage
- ✅ Синхронизация с сервером

### 3. **API Endpoints**
```
POST   /api/user/register          - Регистрация пользователя
GET    /api/user/:telegram_id      - Получить профиль
PUT    /api/user/:telegram_id      - Обновить профиль
GET    /api/user/photo/:telegram_id - Получить фото из Telegram

POST   /api/score                  - Загрузить счет
GET    /api/leaderboard            - Глобальный рейтинг
GET    /api/rank/:telegram_id      - Позиция в рейтинге
GET    /api/stats                  - Статистика

POST   /api/game-session           - Сохранить игровую сессию
GET    /api/game-sessions/:telegram_id - История игр

POST   /api/achievements           - Разблокировать достижение
GET    /api/achievements/:telegram_id - Список достижений

POST   /api/user-settings          - Сохранить настройки
GET    /api/user-settings/:telegram_id - Получить настройки

GET    /api/check-admin/:telegram_id - Проверка прав админа
GET    /api/admin/users            - Список всех пользователей (только админ)

GET    /api/health                 - Проверка состояния сервера
```

---

## 🔧 Установка и настройка

### Вариант 1: С MongoDB (рекомендуется для продакшена)

#### Шаг 1: Установите MongoDB

**Windows:**
1. Скачайте MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Установите с настройками по умолчанию
3. MongoDB запустится автоматически как служба

**Или используйте MongoDB Atlas (облачная БД, бесплатно):**
1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер (M0)
3. Создайте пользователя БД
4. Получите connection string (например: `mongodb+srv://user:password@cluster.mongodb.net/2048-game`)

#### Шаг 2: Настройте переменные окружения

Создайте файл `server/.env`:

```env
# Telegram Bot Token (получите у @BotFather)
BOT_TOKEN=1832915778:AAEoEWEQLFkG43zhgZ6PfLQyrwci_20_7KE

# URL вашего веб-приложения
WEBAPP_URL=http://localhost:3000

# MongoDB Connection String
# Для локальной MongoDB:
MONGODB_URI=mongodb://localhost:27017/2048-game

# Или для MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/2048-game

# Порт сервера
PORT=3000

# Режим работы
NODE_ENV=development
```

#### Шаг 3: Установите зависимости

```bash
cd server
npm install
```

#### Шаг 4: Запустите сервер

**Для разработки (с автоперезагрузкой):**
```bash
npm run dev:full
```

**Для продакшена:**
```bash
npm run start:full
```

Вы увидите:
```
🚀 Server running on port 3000
🤖 Telegram bot is active
📊 API available at http://localhost:3000/api
💾 Database: MongoDB connected
🎮 Game ready to play!
```

---

### Вариант 2: Без MongoDB (только localStorage)

Если вы не хотите устанавливать MongoDB, сервер автоматически будет работать в режиме localStorage.

#### Шаг 1: Создайте файл `server/.env`

```env
BOT_TOKEN=1832915778:AAEoEWEQLFkG43zhgZ6PfLQyrwci_20_7KE
WEBAPP_URL=http://localhost:3000
PORT=3000
```

#### Шаг 2: Запустите простой сервер

```bash
cd server
npm install
npm run dev
```

Или используйте полный сервер без MongoDB:
```bash
npm run dev:full
```

Вы увидите:
```
🚀 Server running on port 3000
⚠️ Server will run without database
💾 Database: localStorage mode
```

---

## 🎮 Как это работает

### Автоматическая регистрация пользователя

1. Пользователь открывает приложение в Telegram
2. `telegram-integration.js` получает данные пользователя из Telegram
3. Автоматически отправляется запрос на `/api/user/register`
4. Пользователь сохраняется в MongoDB (или localStorage)
5. При следующих запусках данные синхронизируются

### Сохранение игровых данных

1. Игрок завершает игру
2. Счет отправляется на `/api/score`
3. Сохраняется в коллекцию `scores` (только лучший результат)
4. Обновляется глобальный рейтинг
5. Данные доступны на всех устройствах

### Глобальный рейтинг

- Доступен через `/api/leaderboard`
- Автоматически сортируется по убыванию счета
- Показывает топ-100 игроков
- Обновляется в реальном времени

---

## 📊 Структура базы данных MongoDB

### Коллекции:

**users** - профили пользователей
```javascript
{
  telegram_id: Number,        // Уникальный ID из Telegram
  username: String,           // @username
  first_name: String,         // Имя
  last_name: String,          // Фамилия
  photo_url: String,          // URL фото профиля
  display_name: String,       // Отображаемое имя
  avatar: String,             // Аватар (первая буква имени)
  created_at: Date,           // Дата регистрации
  last_active: Date           // Последняя активность
}
```

**scores** - лучшие результаты
```javascript
{
  telegram_id: Number,        // ID пользователя
  username: String,           // Имя пользователя
  avatar: String,             // Аватар
  score: Number,              // Лучший счет
  timestamp: Number,          // Время достижения
  created_at: Date,           // Дата создания записи
  updated_at: Date            // Дата обновления
}
```

**game_sessions** - история игр
```javascript
{
  telegram_id: Number,        // ID пользователя
  score: Number,              // Счет в игре
  moves: Number,              // Количество ходов
  duration: Number,           // Длительность (мс)
  won: Boolean,               // Победа (достигнута 2048)
  highestTile: Number,        // Максимальная плитка
  created_at: Date            // Дата игры
}
```

**achievements** - достижения
```javascript
{
  telegram_id: Number,        // ID пользователя
  achievement_id: String,     // ID достижения
  unlocked_at: Date           // Дата разблокировки
}
```

**user_settings** - настройки пользователей
```javascript
{
  telegram_id: Number,        // ID пользователя
  soundEnabled: Boolean,      // Звук включен
  volume: Number,             // Громкость (0-100)
  vibrationEnabled: Boolean,  // Вибрация включена
  theme: String,              // Тема оформления
  activeSkin: String,         // Активный скин
  purchasedSkins: Array,      // Купленные скины
  coins: Number,              // Монеты
  updated_at: Date            // Дата обновления
}
```

---

## 🔒 Безопасность

- ✅ Валидация всех входных данных
- ✅ Проверка прав администратора
- ✅ Обработка ошибок
- ✅ Graceful shutdown
- ✅ CORS настроен
- ✅ Защита от SQL-инъекций (используется MongoDB)

---

## 🐛 Решение проблем

### MongoDB не подключается

**Проблема:** `❌ MongoDB connection failed`

**Решения:**
1. Проверьте, запущен ли MongoDB:
   ```bash
   # Windows
   services.msc -> найдите MongoDB
   
   # Или проверьте подключение
   mongosh
   ```

2. Проверьте `MONGODB_URI` в `.env`
3. Для MongoDB Atlas проверьте:
   - Правильность connection string
   - Добавлен ли ваш IP в whitelist
   - Правильность логина/пароля

### Сервер работает, но данные не сохраняются

**Решение:**
1. Проверьте консоль браузера на ошибки
2. Проверьте логи сервера
3. Убедитесь, что URL сервера правильный в `telegram-integration.js` (строки 265, 355)

### Telegram Bot не отвечает

**Решение:**
1. Проверьте `BOT_TOKEN` в `.env`
2. Убедитесь, что токен правильный (получите у @BotFather)
3. Проверьте, что сервер запущен

---

## 🚀 Деплой в продакшен

### Render.com (рекомендуется)

1. Создайте аккаунт на https://render.com
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm run start:full`
5. Добавьте переменные окружения:
   - `BOT_TOKEN`
   - `MONGODB_URI` (используйте MongoDB Atlas)
   - `WEBAPP_URL` (URL вашего Render приложения)
   - `PORT=3000`

### Railway.app

1. Создайте аккаунт на https://railway.app
2. Создайте новый проект
3. Подключите GitHub
4. Добавьте MongoDB из маркетплейса
5. Добавьте переменные окружения
6. Deploy автоматически

---

## 📈 Мониторинг

### Проверка состояния сервера

```bash
curl http://localhost:3000/api/health
```

Ответ:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "database": "connected",
  "mode": "database"
}
```

### Просмотр логов

Сервер выводит подробные логи:
- ✅ Регистрация пользователей
- ✅ Загрузка счетов
- ✅ Подключение к БД
- ✅ Ошибки

---

## 🎯 Следующие шаги

1. ✅ Настройте MongoDB (локально или Atlas)
2. ✅ Создайте файл `.env` с правильными настройками
3. ✅ Установите зависимости: `npm install`
4. ✅ Запустите сервер: `npm run dev:full`
5. ✅ Откройте приложение в браузере: `http://localhost:3000`
6. ✅ Проверьте работу регистрации и сохранения данных
7. ✅ Задеплойте на Render/Railway для продакшена

---

## 💡 Полезные команды

```bash
# Установка зависимостей
cd server
npm install

# Запуск в режиме разработки (с MongoDB)
npm run dev:full

# Запуск в режиме разработки (без MongoDB)
npm run dev

# Запуск в продакшене
npm run start:full

# Проверка состояния
curl http://localhost:3000/api/health

# Просмотр логов MongoDB (если установлен локально)
mongosh
use 2048-game
db.users.find()
db.scores.find().sort({score: -1})
```

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи сервера
2. Проверьте консоль браузера
3. Убедитесь, что все зависимости установлены
4. Проверьте файл `.env`

**Система готова к работе!** 🎉

Теперь ваше приложение полностью интегрировано с базой данных и готово к использованию как локально, так и в продакшене.
