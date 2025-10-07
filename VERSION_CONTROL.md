# 🔄 Система автоматического обновления для Telegram Mini App

## 📊 Проблема

В Telegram Mini App пользователи не могут принудительно обновить кэш (нет Cmd+Shift+R). Старые файлы кэшируются браузером и пользователи не видят обновления.

## ✅ Решение

Реализована система автоматического версионирования:

### 1. Версионирование файлов

Все CSS и JS файлы загружаются с параметром версии:
```html
<link rel="stylesheet" href="styles.css?v=1.2.0">
<script src="js/shop.js?v=1.2.0"></script>
```

### 2. Автоматическая очистка кэша

При загрузке страницы проверяется версия приложения:
```javascript
const APP_VERSION = '1.2.0';
const savedVersion = localStorage.getItem('app_version');

if (savedVersion !== APP_VERSION) {
    // Очищаем кэш
    if ('caches' in window) {
        caches.keys().then(names => 
            names.forEach(name => caches.delete(name))
        );
    }
    
    // Сохраняем новую версию
    localStorage.setItem('app_version', APP_VERSION);
}
```

### 3. Meta-теги против кэширования

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

## 🚀 Как обновить приложение

### Шаг 1: Обновите версию

В **обоих** файлах (`index.html` и `profile.html`) найдите и увеличьте версию:

```javascript
const APP_VERSION = '1.2.0'; // Увеличь до 1.2.1, 1.3.0 и т.д.
```

### Шаг 2: Обновите версии в URL

**В `index.html`:**
```html
<link rel="stylesheet" href="styles.css?v=1.2.1">
<script src="js/shop.js?v=1.2.1"></script>
<!-- И все остальные -->
```

**В `profile.html`:**
```html
<link rel="stylesheet" href="styles.css?v=1.2.1">
<script src="js/profile.js?v=1.2.1"></script>
<!-- И все остальные -->
```

### Шаг 3: Коммит и пуш

```bash
git add index.html profile.html
git commit -m "chore: Bump version to 1.2.1"
git push origin main
```

### Шаг 4: Деплой

После деплоя на хостинг (Netlify/Vercel), пользователи при следующем заходе:
1. Увидят новую версию `1.2.1`
2. Автоматически очистится кэш
3. Загрузятся новые файлы

## 📝 Правила версионирования

Используем [Semantic Versioning](https://semver.org/):

- **1.x.x** - Мажорная версия (большие изменения, breaking changes)
- **x.2.x** - Минорная версия (новые функции, обратно совместимые)
- **x.x.1** - Патч (исправления багов, мелкие изменения)

### Примеры:

| Изменение | Старая версия | Новая версия |
|-----------|--------------|--------------|
| Исправлен баг с Undo | 1.2.0 | 1.2.1 |
| Добавлен бустер Жизни | 1.2.1 | 1.3.0 |
| Переработан UI магазина | 1.3.0 | 2.0.0 |

## 🎯 Текущая версия

**Версия:** `1.2.0`

**Что включено:**
- ✅ Двойные кнопки оплаты (💰 + ⭐) для скинов
- ✅ Двойные кнопки оплаты для бустеров
- ✅ Бустер ❤️ Жизни (Coming Soon)
- ✅ Исправлен бустер Undo (сохранение истории)
- ✅ Фильтрация выключенных скинов
- ✅ Система автоматического обновления

## 🔍 Как проверить версию

### В консоли браузера:
```javascript
localStorage.getItem('app_version')
// Вернет: "1.2.0"
```

### В коде:
```javascript
console.log('Current version:', APP_VERSION);
```

## ⚠️ Важные замечания

### 1. Всегда обновляйте версию в двух местах:
- ✅ `index.html` - константа `APP_VERSION`
- ✅ `profile.html` - константа `APP_VERSION`

### 2. Обновляйте версию во ВСЕХ URL:
```html
<!-- ❌ НЕПРАВИЛЬНО -->
<script src="js/shop.js?v=1.2.0"></script>  <!-- Старая версия -->
<script src="js/game.js?v=1.2.1"></script>  <!-- Новая версия -->

<!-- ✅ ПРАВИЛЬНО -->
<script src="js/shop.js?v=1.2.1"></script>  <!-- Везде одинаково -->
<script src="js/game.js?v=1.2.1"></script>  <!-- Везде одинаково -->
```

### 3. Версия должна совпадать:
```javascript
// index.html
const APP_VERSION = '1.2.1';

// profile.html  
const APP_VERSION = '1.2.1'; // ✅ Та же версия

// Все URL
href="styles.css?v=1.2.1"    // ✅ Та же версия
```

## 🛠️ Автоматизация (опционально)

Для автоматического обновления версий можно создать скрипт:

```bash
#!/bin/bash
# update-version.sh

NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
    echo "Usage: ./update-version.sh 1.2.1"
    exit 1
fi

# Обновляем в index.html
sed -i '' "s/const APP_VERSION = '[^']*'/const APP_VERSION = '$NEW_VERSION'/" index.html
sed -i '' "s/\?v=[0-9.]*/?v=$NEW_VERSION/g" index.html

# Обновляем в profile.html
sed -i '' "s/const APP_VERSION = '[^']*'/const APP_VERSION = '$NEW_VERSION'/" profile.html
sed -i '' "s/\?v=[0-9.]*/?v=$NEW_VERSION/g" profile.html

echo "✅ Version updated to $NEW_VERSION"
```

**Использование:**
```bash
chmod +x update-version.sh
./update-version.sh 1.2.1
```

## 📊 История версий

### v1.2.0 (2025-10-07)
- Добавлены двойные кнопки оплаты
- Добавлен бустер Жизни (Coming Soon)
- Исправлен бустер Undo
- Система автоматического обновления

### v1.1.0 (ранее)
- Система скинов
- Магазин
- Рейтинговая таблица
- Профиль пользователя

### v1.0.0 (начало)
- Базовая игра 2048
- Бустеры
- Монеты

## 🎯 Чеклист при обновлении

- [ ] Обновил `APP_VERSION` в `index.html`
- [ ] Обновил `APP_VERSION` в `profile.html`
- [ ] Обновил все `?v=` в `index.html`
- [ ] Обновил все `?v=` в `profile.html`
- [ ] Проверил что версии одинаковые везде
- [ ] Сделал коммит с описанием изменений
- [ ] Запушил в GitHub
- [ ] Сделал деплой
- [ ] Проверил работу в Telegram Mini App

---

**Текущая версия:** 1.2.0  
**Последнее обновление:** 2025-10-07  
**Статус:** ✅ Активная система версионирования
