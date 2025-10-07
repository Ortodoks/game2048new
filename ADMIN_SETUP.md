# 👑 Настройка админ панели

## 🔑 Как добавить себя в админы:

### 1. Узнайте свой Telegram ID

**Способ 1 - Через бота:**
1. Откройте @userinfobot в Telegram
2. Нажмите /start
3. Бот покажет ваш ID (например: `123456789`)

**Способ 2 - Через консоль браузера:**
1. Откройте игру в Telegram
2. Откройте консоль браузера (F12)
3. Введите: `window.telegramIntegration.getUserProfile()`
4. Скопируйте значение `telegramId`

### 2. Добавьте свой ID в код

Откройте файл `/Users/vadim/Downloads/2048/profile.html`

Найдите строку 949-952:

```javascript
const ADMIN_IDS = [
    // Add your Telegram ID here
    // Example: 123456789
];
```

Замените на:

```javascript
const ADMIN_IDS = [
    123456789,  // Ваш Telegram ID
    // Можно добавить несколько админов:
    // 987654321,
    // 555666777
];
```

### 3. Сохраните и перезагрузите

1. Сохраните файл
2. Перезагрузите страницу профиля
3. Кнопка "👑 Админ панель" появится рядом с "Настройками"

---

## 📋 Что есть в админ панели:

### Текущая версия (заглушка):
- ✅ Красивый интерфейс
- ✅ Проверка доступа по Telegram ID
- ✅ Скрыта от обычных пользователей
- ✅ Placeholder с будущим функционалом

### Планируемый функционал:
- 📊 Статистика пользователей
- 🎮 Управление играми
- 👥 Модерация профилей
- ⚙️ Настройки сервера
- 🏆 Управление рейтингом
- 💎 Управление монетами
- 📢 Рассылка уведомлений
- 🚫 Бан/разбан пользователей

---

## 🔒 Безопасность:

### Текущая защита:
- ✅ Кнопка скрыта по умолчанию
- ✅ Проверка Telegram ID на клиенте
- ✅ Список админов в коде

### Рекомендации для продакшена:
1. **Переместите проверку на сервер:**
   ```javascript
   // В server.js добавьте:
   const ADMIN_IDS = [123456789];
   
   app.get('/api/check-admin/:telegram_id', (req, res) => {
       const isAdmin = ADMIN_IDS.includes(parseInt(req.params.telegram_id));
       res.json({ isAdmin });
   });
   ```

2. **Обновите клиент:**
   ```javascript
   async function checkAdminAccess() {
       const telegramUser = window.telegramIntegration?.getUserProfile();
       if (!telegramUser) return false;
       
       const response = await fetch(`/api/check-admin/${telegramUser.telegramId}`);
       const { isAdmin } = await response.json();
       
       if (isAdmin) {
           document.querySelector('.admin-only').style.display = 'block';
       }
       return isAdmin;
   }
   ```

3. **Защитите все админ API endpoints:**
   ```javascript
   function isAdmin(telegram_id) {
       return ADMIN_IDS.includes(telegram_id);
   }
   
   app.post('/api/admin/*', (req, res, next) => {
       if (!isAdmin(req.body.telegram_id)) {
           return res.status(403).json({ error: 'Access denied' });
       }
       next();
   });
   ```

---

## 🎨 Кастомизация:

### Изменить цвет кнопки:
В `profile.html` найдите `.admin-only` и измените стили.

### Изменить иконку:
Замените `👑` на любой другой эмодзи в кнопке.

### Добавить больше функций:
Замените содержимое `<div class="admin-placeholder">` на реальный функционал.

---

## ✅ Готово!

Теперь у вас есть админ панель, которая видна только вам! 

**Следующие шаги:**
1. Добавьте свой Telegram ID
2. Откройте профиль в игре
3. Увидите кнопку "👑 Админ панель"
4. Скажите, какой функционал добавить первым!
