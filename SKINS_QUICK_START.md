# 🎨 Быстрый старт: Система скинов

## Для пользователей

### Как купить скин?
1. Откройте **Магазин** (кнопка в главном меню)
2. Перейдите на вкладку **"Скины"**
3. Выберите понравившийся скин
4. Нажмите **"Купить"** (если достаточно монет)
5. Скин автоматически применится к игровому полю ✨

### Как сменить скин?
**Способ 1 (Главная страница):**
1. Нажмите кнопку **"🎨 Скин"** под игровым полем
2. Выберите скин из купленных
3. Скин сразу применится!

**Способ 2 (Профиль):**
1. Откройте **Профиль**
2. Прокрутите до секции **"🎨 Мои скины"**
3. Нажмите **"Изменить"**
4. Выберите скин на главной странице

### Доступные скины

| Скин | Эмодзи | Цена | Особенности |
|------|--------|------|-------------|
| Классический | 🎯 | Бесплатно | Стандартный дизайн |
| Неоновый | 🎇 | 500 монет | Яркое свечение |
| Золотой | 🪙 | 1000 монет | Роскошное мерцание |
| Космический | 🌌 | 1500 монет | Звездное небо |
| Природный | 🌿 | 800 монет | Зеленые тона |
| Огненный | 🔥 | 1200 монет | Пламенные эффекты |
| Ледяной | ❄️ | 900 монет | Холодное сияние |
| Радужный | 🌈 | 2000 монет | Все цвета радуги |

## Для разработчиков

### Добавление нового скина

1. **Добавьте конфигурацию в `js/skinConfigs.js`:**
```javascript
myskin: {
    id: 'myskin',
    name: 'Мой скин',
    preview: '✨',
    price: 1000,
    description: 'Описание скина',
    styleConfig: {
        boardBackground: 'linear-gradient(...)',
        boardBorder: 'rgba(...)',
        tileBackground: 'rgba(...)',
        tileBorder: 'rgba(...)',
        glowEffect: '0 0 20px rgba(...)',
        mergeEffect: 'custom_effect',
        tileColors: {
            2: { bg: '...', color: '...' },
            // ... остальные плитки
        }
    }
}
```

2. **Добавьте визуальные эффекты в `css/skin-effects.css`:**
```css
/* === МОЙ СКИН === */
[data-skin="myskin"] {
    --board-bg: linear-gradient(...);
    --board-border: rgba(...);
}

[data-skin="myskin"] #game-board {
    background: var(--board-bg) !important;
    border: 2px solid var(--board-border) !important;
    box-shadow: 0 0 30px rgba(...) !important;
}

/* Анимация слияния */
@keyframes custom-effect {
    0% { /* начальное состояние */ }
    100% { /* конечное состояние */ }
}

[data-skin="myskin"] .tile.merged {
    animation: custom-effect 0.5s ease-out;
}
```

3. **Скин автоматически появится:**
   - В магазине (вкладка "Скины")
   - В селекторе скинов на главной
   - В профиле пользователя

### Тестирование скина

```javascript
// В консоли браузера (F12):

// Получить бесплатно любой скин для тестирования
localStorage.setItem('ownedSkins', JSON.stringify([
    'default', 'neon', 'gold', 'space', 'nature', 'fire', 'ice', 'rainbow', 'myskin'
]));

// Применить скин
await window.graphics.changeSkin('myskin');

// Добавить монет для покупки
localStorage.setItem('coins', 10000);
location.reload();
```

### API для работы со скинами

```javascript
// Получить текущий скин
const currentSkin = window.graphics.currentSkin;

// Получить все купленные скины
const ownedSkins = window.userManager.settings.purchasedSkins;

// Купить скин (через магазин)
await window.shop.buySkin('neon');

// Сменить скин
await window.skinSelector.selectSkin('gold');

// Проверить владение скином
const hasGoldSkin = ownedSkins.includes('gold');

// Открыть селектор скинов программно
window.skinSelector.openSelector();
```

## Структура файлов

```
2048/
├── css/
│   └── skin-effects.css         # Визуальные стили скинов
├── js/
│   ├── skinConfigs.js          # Конфигурации скинов
│   ├── skinSelector.js         # Селектор скинов на главной
│   ├── graphics.js             # Применение скинов к полю
│   ├── shop.js                 # Покупка скинов
│   ├── profile.js              # Отображение в профиле
│   ├── database.js             # Хранение данных
│   └── userManager.js          # Управление пользователем
├── index.html                  # Главная (с кнопкой смены)
├── profile.html                # Профиль (с секцией скинов)
└── shop.html                   # Магазин скинов
```

## Хранение данных

### localStorage
```javascript
{
    "currentSkin": "neon",                    // Активный скин
    "ownedSkins": ["default", "neon", "gold"] // Купленные
}
```

### IndexedDB (userSettings)
```javascript
{
    "purchasedSkins": ["default", "neon", "gold"],
    "activeSkin": "neon"
}
```

## Частые вопросы

**Q: Скин не применяется после покупки?**
A: Убедитесь, что `skinConfigs.js` загружен до `graphics.js` в HTML.

**Q: Как сделать скин бесплатным?**
A: Установите `price: 0` в конфигурации скина.

**Q: Как добавить скин по умолчанию для всех?**
A: Добавьте его ID в `defaultSettings.purchasedSkins` в `database.js`.

**Q: Можно ли использовать изображения вместо градиентов?**
A: Да! Используйте `background: url('path/to/image.png')` в стилях.

**Q: Как сбросить скин на дефолтный?**
A: 
```javascript
await window.graphics.changeSkin('default');
```

## Поддержка

Для вопросов и предложений:
- Документация: `SKINS_SYSTEM.md`
- Примеры: Смотрите существующие скины в `skinConfigs.js`
- Дебаг: Откройте консоль (F12) и проверьте логи

---

**Статус**: ✅ Система полностью рабочая
**Версия**: 1.0.0
**Обновлено**: 2025-10-07
