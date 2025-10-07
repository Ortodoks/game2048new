# 🚀 Деплой игры 2048 Telegram Mini App

## 📋 Подготовка к деплою

Все необходимые файлы уже созданы:
- ✅ `netlify.toml` - конфигурация Netlify
- ✅ `.gitignore` - исключения для Git
- ✅ Все исходные файлы игры

## 🌐 Способы деплоя

### 1. Через Netlify Web Interface (Рекомендуется)

1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "Add new site" → "Deploy manually"
3. Перетащите папку `/Users/vadim/Downloads/2048` в окно браузера
4. Дождитесь завершения деплоя
5. Получите URL вида: `https://random-name-123.netlify.app`

### 2. Через Netlify CLI

```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Переход в папку проекта
cd /Users/vadim/Downloads/2048

# Деплой
netlify deploy --prod --dir .
```

### 3. Через GitHub + Netlify

1. Создайте репозиторий на GitHub
2. Загрузите файлы:
```bash
cd /Users/vadim/Downloads/2048
git init
git add .
git commit -m "Initial commit: 2048 Telegram Mini App"
git remote add origin https://github.com/yourusername/2048-telegram-game.git
git push -u origin main
```
3. Подключите репозиторий к Netlify для автоматического деплоя

## 🔧 Настройка Telegram Bot

После деплоя обновите настройки бота:

1. Получите URL деплоя (например: `https://your-app.netlify.app`)
2. Обновите команды бота через BotFather:
```
/setmenubutton
@your_bot_name
button_text=🎮 Играть в 2048
web_app_url=https://your-app.netlify.app
```

## 📱 Особенности для Telegram Mini App

- ✅ Поддержка Telegram Web App API
- ✅ Адаптивный дизайн для мобильных устройств  
- ✅ Интеграция с профилем Telegram
- ✅ Сохранение прогресса в localStorage
- ✅ Поддержка haptic feedback
- ✅ Оптимизация для iOS и Android

## 🛠 Возможные проблемы

### Если игра не загружается:
1. Проверьте консоль браузера (F12)
2. Убедитесь, что все файлы загружены
3. Проверьте HTTPS (Telegram требует HTTPS)

### Если не работает навигация:
- Очистите кеш браузера
- Проверьте, что `toolbar-nav.js` загружается

### Для отладки:
- Откройте `/debug-nav.html` для тестирования навигации
- Используйте Telegram Web Inspector для отладки

## 📊 Мониторинг

После деплоя можно отслеживать:
- Количество пользователей через Telegram Analytics
- Производительность через Netlify Analytics
- Ошибки через консоль браузера

## 🔄 Обновления

Для обновления игры:
1. Внесите изменения в код
2. Повторите процесс деплоя
3. Пользователи получат обновления автоматически
