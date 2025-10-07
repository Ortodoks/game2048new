# 🚀 Деплой на Render.com - Исправлено

## ✅ Исправленные проблемы

- ✅ Удалены ссылки на несуществующие файлы из Dockerfile
- ✅ Обновлен Dockerfile для запуска `server.js` вместо `server-simple.js`
- ✅ Добавлена папка `css/` в Dockerfile
- ✅ Создан `render.yaml` для автоматического деплоя
- ✅ Обновлен docker-compose.yml

---

## 🚀 Деплой на Render.com

### Вариант 1: Через render.yaml (рекомендуется)

1. **Создайте MongoDB Atlas** (бесплатно):
   - https://www.mongodb.com/cloud/atlas
   - Создайте кластер M0 (бесплатный)
   - Получите connection string

2. **Зарегистрируйтесь на Render.com**:
   - https://render.com

3. **Создайте Web Service**:
   - New -> Web Service
   - Connect GitHub репозиторий
   - Render автоматически найдет `render.yaml`

4. **Добавьте переменные окружения**:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/2048-game
   WEBAPP_URL = https://your-app.onrender.com
   ```

5. **Deploy**:
   - Нажмите "Create Web Service"
   - Дождитесь завершения деплоя

### Вариант 2: Ручная настройка

1. **New Web Service** на Render.com

2. **Build & Deploy**:
   ```
   Build Command: cd server && npm install
   Start Command: cd server && node server.js
   ```

3. **Environment Variables**:
   ```
   BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
   MONGODB_URI=mongodb+srv://...
   WEBAPP_URL=https://your-app.onrender.com
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**

---

## 🐳 Локальный запуск с Docker

### С Docker Compose (включая MongoDB):

```bash
docker-compose up -d
```

Это запустит:
- Приложение на порту 3000
- MongoDB на порту 27017

### Только приложение (без MongoDB):

```bash
docker build -t game2048 .
docker run -p 3000:3000 \
  -e BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/2048-game \
  -e WEBAPP_URL=http://localhost:3000 \
  game2048
```

---

## 📝 Переменные окружения

### Обязательные:
- `BOT_TOKEN` - токен Telegram бота
- `MONGODB_URI` - строка подключения к MongoDB
- `WEBAPP_URL` - URL вашего приложения

### Опциональные:
- `PORT` - порт (по умолчанию 3000, Render использует 10000)
- `NODE_ENV` - режим работы (development/production)

---

## ✅ Проверка после деплоя

1. **Откройте ваш URL**:
   ```
   https://your-app.onrender.com
   ```

2. **Проверьте health endpoint**:
   ```
   https://your-app.onrender.com/api/health
   ```
   
   Должен вернуть:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "mode": "database"
   }
   ```

3. **Проверьте логи** в Render Dashboard

---

## 🐛 Решение проблем

### Build fails - файлы не найдены
✅ **Исправлено** - обновлен Dockerfile

### MongoDB connection error
- Проверьте MONGODB_URI
- Убедитесь, что IP Render добавлен в whitelist MongoDB Atlas
- Или используйте `0.0.0.0/0` для всех IP

### App crashes on start
- Проверьте логи в Render Dashboard
- Проверьте переменные окружения
- Убедитесь, что Start Command правильный

---

## 📦 Обновленные файлы

- ✅ `Dockerfile` - убраны несуществующие файлы
- ✅ `docker-compose.yml` - обновлен BOT_TOKEN
- ✅ `render.yaml` - добавлена конфигурация для Render
- ✅ `.dockerignore` - оптимизирован размер образа

---

## 🔄 Повторный деплой

```bash
git add .
git commit -m "fix: update Dockerfile and deployment config"
git push origin main
```

Render автоматически запустит деплой при push в main.

---

## 🎉 Готово!

Теперь ваше приложение готово к деплою на Render.com без ошибок!

**Следующие шаги:**
1. ✅ Создайте MongoDB Atlas
2. ✅ Push изменения в GitHub
3. ✅ Создайте Web Service на Render
4. ✅ Добавьте переменные окружения
5. ✅ Дождитесь завершения деплоя
6. ✅ Откройте ваше приложение!
