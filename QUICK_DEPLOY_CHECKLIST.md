# ✅ Быстрый чеклист деплоя на Render.com

## Шаг 1: Создайте MongoDB (СНАЧАЛА!)

1. ☐ Зайдите на https://dashboard.render.com
2. ☐ New → **Database** → **MongoDB**
3. ☐ Name: `2048-mongodb`
4. ☐ Region: **Frankfurt (EU Central)**
5. ☐ Plan: **Free**
6. ☐ Нажмите **Create Database**
7. ☐ Дождитесь создания (1-2 минуты)
8. ☐ Откройте базу → **Connections** → Скопируйте **Internal Connection String**

**Пример строки:**
```
mongodb://2048-mongodb:abc123@dpg-xyz123:27017/2048_mongodb_abc
```

---

## Шаг 2: Создайте Web Service

1. ☐ New → **Web Service**
2. ☐ Connect GitHub → выберите `spasskiy91/2048`
3. ☐ Настройте:

```
Name: 2048-game
Region: Frankfurt (EU Central)  ← ТОТ ЖЕ РЕГИОН!
Branch: main
Root Directory: (пусто)
Runtime: Node
Build Command: cd server && npm install
Start Command: cd server && node server.js
```

---

## Шаг 3: Добавьте переменные окружения

В разделе **Environment Variables** добавьте:

### Обязательные:

```
MONGODB_URI
```
Вставьте скопированную строку из Шага 1

```
PORT
```
Значение: `3000`

```
NODE_ENV
```
Значение: `production`

### Опционально (для Telegram):

```
BOT_TOKEN
```
Значение: `8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs`

```
WEBAPP_URL
```
Значение: `https://your-app-name.onrender.com` (замените на ваш URL)

---

## Шаг 4: Deploy!

1. ☐ Нажмите **Create Web Service**
2. ☐ Дождитесь деплоя (2-3 минуты)
3. ☐ Проверьте логи - должно быть:
   ```
   ✅ Connected to MongoDB
   ✅ Database indexes created
   🚀 Server running on port 3000
   ```

---

## Шаг 5: Проверка

1. ☐ Откройте ваш URL: `https://your-app-name.onrender.com`
2. ☐ Проверьте API: `https://your-app-name.onrender.com/api/health`
3. ☐ Должен вернуть: `{"status":"ok","timestamp":...}`

---

## Если что-то не работает:

### Ошибка: "Cannot start without database"
**Решение:** Добавьте `MONGODB_URI` в Environment Variables

### Ошибка: "ECONNREFUSED"
**Решение:** 
- Проверьте, что используете **Internal** Connection String
- Проверьте, что MongoDB и Web Service в **одном регионе**

### Ошибка: "Telegram Bot Token not provided"
**Это не ошибка!** Это предупреждение. Приложение работает без бота.

---

## ✅ Готово!

Ваше приложение развернуто!

**URL:** https://your-app-name.onrender.com

**Следующие шаги:**
1. Откройте приложение в браузере
2. Проверьте профиль и админ панель (ID: 5414042665)
3. Настройте Telegram бота (если добавили BOT_TOKEN)

---

## 🔗 Полезные ссылки

- Dashboard: https://dashboard.render.com
- Логи: Dashboard → Your Service → Logs
- MongoDB: Dashboard → Your Database → Metrics
- Полная инструкция: RENDER_DEPLOY.md
