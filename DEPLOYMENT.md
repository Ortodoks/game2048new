# 🚀 Deployment Guide - 2048 Telegram Mini App

## 🐳 Docker Deployment (Рекомендуется)

### Быстрый старт:

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/spasskiy91/2048.git
cd 2048

# 2. Запустите с Docker Compose
docker-compose up -d

# 3. Проверьте статус
docker-compose ps

# 4. Посмотрите логи
docker-compose logs -f
```

Приложение будет доступно на `http://localhost:3000`

### Настройка переменных окружения:

Отредактируйте `docker-compose.yml`:

```yaml
environment:
  - BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
  - MONGODB_URI=mongodb://mongo:27017/2048-game
  - WEBAPP_URL=https://your-domain.com  # Замените на ваш домен
  - PORT=3000
```

### Команды Docker:

```bash
# Остановить
docker-compose down

# Перезапустить
docker-compose restart

# Пересобрать после изменений
docker-compose up -d --build

# Удалить все (включая данные)
docker-compose down -v
```

---

## ☁️ Деплой на Railway

### 1. Создайте аккаунт на Railway.app

### 2. Подключите GitHub репозиторий:
- New Project → Deploy from GitHub
- Выберите `spasskiy91/2048`

### 3. Добавьте MongoDB:
- New → Database → MongoDB

### 4. Настройте переменные окружения:
```
BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
MONGODB_URI=${{MongoDB.MONGO_URL}}
WEBAPP_URL=https://your-app.railway.app
PORT=3000
NODE_ENV=production
```

### 5. Deploy автоматически!

Railway автоматически определит Node.js проект и запустит его.

---

## 🌐 Деплой на Vercel

### 1. Установите Vercel CLI:

```bash
npm i -g vercel
```

### 2. Деплой:

```bash
cd /Users/vadim/Downloads/2048
vercel
```

### 3. Настройте переменные в Vercel Dashboard:
- Settings → Environment Variables
- Добавьте все переменные из `.env.example`

### 4. Для MongoDB используйте MongoDB Atlas:
- https://www.mongodb.com/cloud/atlas
- Создайте бесплатный кластер
- Получите connection string
- Добавьте в Vercel как `MONGODB_URI`

---

## 🔧 Деплой на VPS (Ubuntu)

### 1. Подключитесь к серверу:

```bash
ssh user@your-server-ip
```

### 2. Установите зависимости:

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# PM2 (process manager)
sudo npm install -g pm2
```

### 3. Клонируйте и настройте:

```bash
git clone https://github.com/spasskiy91/2048.git
cd 2048/server
npm install
cp .env.example .env
nano .env  # Отредактируйте переменные
```

### 4. Запустите с PM2:

```bash
pm2 start server.js --name "2048-game"
pm2 save
pm2 startup
```

### 5. Настройте Nginx:

```bash
sudo apt-get install nginx

sudo nano /etc/nginx/sites-available/2048
```

Добавьте:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/2048 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL с Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🤖 Настройка Telegram Bot

### 1. Откройте @BotFather

### 2. Настройте Web App:

```
/mybots
@your_bot_name
Bot Settings
Menu Button
Configure Menu Button

Button text: 🎮 Играть
URL: https://your-domain.com
```

### 3. Настройте команды:

```
/setcommands
@your_bot_name

start - Начать игру
help - Помощь
stats - Статистика
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

## ✅ Проверка деплоя

### 1. Проверьте API:

```bash
curl https://your-domain.com/api/health
# Должно вернуть: {"status":"ok","timestamp":...}
```

### 2. Проверьте админа:

```bash
curl https://your-domain.com/api/check-admin/5414042665
# Должно вернуть: {"success":true,"isAdmin":true}
```

### 3. Откройте бота в Telegram:
- Нажмите "Начать"
- Должна открыться игра
- Проверьте профиль и админ панель

---

## 🔍 Troubleshooting

### Ошибка: "Cannot connect to MongoDB"
```bash
# Проверьте MongoDB
docker-compose logs mongo
# или
sudo systemctl status mongod
```

### Ошибка: "Bot token invalid"
- Проверьте BOT_TOKEN в переменных окружения
- Убедитесь, что токен правильный

### Игра не открывается в Telegram:
- Проверьте WEBAPP_URL - должен быть HTTPS
- Проверьте, что домен доступен
- Проверьте настройки бота в @BotFather

### Админ панель не видна:
- Проверьте ваш Telegram ID
- Откройте консоль браузера (F12)
- Проверьте логи: `window.telegramIntegration.getUserProfile()`

---

## 📊 Мониторинг

### PM2:
```bash
pm2 status
pm2 logs 2048-game
pm2 monit
```

### Docker:
```bash
docker-compose logs -f
docker stats
```

### Логи MongoDB:
```bash
# Docker
docker-compose exec mongo mongosh
use 2048-game
db.users.countDocuments()
db.scores.find().sort({score:-1}).limit(10)

# VPS
mongosh
use 2048-game
db.users.countDocuments()
```

---

## 🎉 Готово!

Ваше приложение развернуто и готово к использованию!

**URL:** https://your-domain.com
**Bot:** @your_bot_name
**Admin:** ID 5414042665
