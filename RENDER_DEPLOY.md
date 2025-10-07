# 🚀 Деплой на Render.com

## Быстрый старт

### 1. Создайте аккаунт на Render.com
https://render.com

### 2. Подключите GitHub репозиторий

1. New → Web Service
2. Connect GitHub → выберите `spasskiy91/2048`
3. Настройте:
   - **Name**: `2048-game` (или любое имя)
   - **Region**: Frankfurt (EU Central)
   - **Branch**: `main`
   - **Root Directory**: оставьте пустым
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`

### 3. НЕ НАЖИМАЙТЕ "Create Web Service" ЕЩЕ!

Сначала создадим базу данных MongoDB!

### 4. Создайте MongoDB базу данных

1. New → Database → MongoDB
2. Name: `2048-mongodb`
3. Region: Frankfurt (EU Central) - **тот же регион!**
4. Plan: Free
5. Create Database

### 5. Получите MongoDB Connection String

1. Откройте созданную MongoDB базу данных
2. Найдите раздел **Connections**
3. Скопируйте **Internal Connection String**
   - Должна выглядеть так: `mongodb://2048-mongodb:xxxxx@dpg-xxxxx:27017/2048_mongodb_xxxx`
   - **ВАЖНО:** Используйте Internal, не External!

### 6. Вернитесь к Web Service и добавьте переменные

В разделе **Environment Variables** добавьте ВСЕ переменные:

```
MONGODB_URI=mongodb://2048-mongodb:xxxxx@dpg-xxxxx:27017/2048_mongodb_xxxx
PORT=3000
NODE_ENV=production
```

**Опционально (для Telegram бота):**
```
BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
WEBAPP_URL=https://your-app-name.onrender.com
```

### 7. Теперь Deploy!

Нажмите **Create Web Service** или **Manual Deploy**

---

## ⚙️ Полный список переменных окружения

```env
# Обязательные
MONGODB_URI=mongodb://...  # Из Render MongoDB
PORT=3000

# Telegram Bot (опционально)
BOT_TOKEN=8462254072:AAGnmNqWVuCqkaBbvsC1kO4Mx5b9UjfKtTs
WEBAPP_URL=https://your-app-name.onrender.com

# Настройки
NODE_ENV=production
```

**Примечание:** Если не указать `BOT_TOKEN`, приложение будет работать в web-only режиме без Telegram бота.

---

## 🔧 Настройка после деплоя

### 1. Получите URL приложения

После деплоя Render даст вам URL:
```
https://your-app-name.onrender.com
```

### 2. Обновите WEBAPP_URL

1. Environment Variables
2. Найдите `WEBAPP_URL`
3. Замените на ваш реальный URL
4. Save Changes

### 3. Настройте Telegram Bot

Откройте @BotFather в Telegram:

```
/mybots
@your_bot_name
Bot Settings
Menu Button
Configure Menu Button

Button text: 🎮 Играть
URL: https://your-app-name.onrender.com
```

### 4. Проверьте работу

```bash
# Проверка API
curl https://your-app-name.onrender.com/api/health

# Проверка админа
curl https://your-app-name.onrender.com/api/check-admin/5414042665
```

---

## 📊 Мониторинг

### Логи
Dashboard → Logs → Live Logs

### Метрики
Dashboard → Metrics

### База данных
MongoDB Dashboard → Metrics

---

## 🐛 Troubleshooting

### Ошибка: "Telegram Bot Token not provided"
**Решение:** Это предупреждение, не ошибка. Приложение работает без бота.
Если хотите включить бота - добавьте `BOT_TOKEN` в Environment Variables.

### Ошибка: "Cannot connect to MongoDB"
**Решение:**
1. Проверьте, что MongoDB создана в том же регионе
2. Используйте **Internal Connection String**, не External
3. Проверьте формат: `mongodb://username:password@host:port/database`

### Приложение не запускается
**Решение:**
1. Проверьте Build Command: `cd server && npm install`
2. Проверьте Start Command: `cd server && node server.js`
3. Проверьте логи в Dashboard

### Медленная работа
**Решение:**
1. Free tier засыпает после 15 минут неактивности
2. Первый запрос может быть медленным (cold start)
3. Upgrade до Starter plan для постоянной работы

---

## 💰 Тарифы

### Free Tier (текущий)
- ✅ 750 часов в месяц
- ✅ Автоматический деплой из GitHub
- ✅ SSL сертификат
- ⚠️ Засыпает после 15 минут неактивности
- ⚠️ 512 MB RAM

### Starter ($7/месяц)
- ✅ Всегда активен
- ✅ 1 GB RAM
- ✅ Быстрее работает

---

## 🔄 Автоматический деплой

Render автоматически деплоит при каждом push в GitHub!

```bash
git add .
git commit -m "Update"
git push origin main
```

Render автоматически:
1. Заметит изменения
2. Запустит Build
3. Задеплоит новую версию

---

## ✅ Чеклист после деплоя

- [ ] Приложение запущено (зеленый статус)
- [ ] API работает (`/api/health`)
- [ ] MongoDB подключена
- [ ] WEBAPP_URL обновлен на реальный
- [ ] Telegram Bot настроен (если используется)
- [ ] Админ панель доступна (ID: 5414042665)
- [ ] Игра открывается в браузере
- [ ] Профили создаются
- [ ] Рейтинг обновляется

---

## 🎉 Готово!

Ваше приложение развернуто на Render.com!

**URL:** https://your-app-name.onrender.com
**Dashboard:** https://dashboard.render.com
**Логи:** Dashboard → Logs

**Следующий шаг:** Откройте приложение и проверьте все функции!
