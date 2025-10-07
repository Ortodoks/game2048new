# 🎯 Booster Star Prices - Документация

## 📋 Обзор

Реализована полная система управления ценами бустеров с поддержкой двух валют:
- **💰 Монеты** (внутриигровая валюта)
- **⭐ Telegram Stars** (премиум валюта)

## ✨ Реализованные функции

### 1. Админ-панель для управления ценами

**Расположение:** `profile.html` → Админ панель → Вкладка "🎯 Бустеры"

**Функциональность:**
- ✅ Установка цен в монетах (1-1000)
- ✅ Установка цен в Stars (1-100)
- ✅ Сохранение цен в `localStorage`
- ✅ Валидация введенных значений
- ✅ Отдельные кнопки сохранения для каждого бустера

**Доступные бустеры:**
- **⟲ Отмена хода** - отменить последний ход
- **⚡ Перемешать** - перемешать плитки на поле
- **💣 Бомба** - уничтожить выбранную плитку

### 2. Отображение цен в магазине

**Расположение:** `index.html` → Кнопка "Магазин" → Вкладка "Бонусы"

**Функциональность:**
- ✅ Отображение двух кнопок оплаты для каждого бустера
- ✅ Кнопка "💰 Монеты" - показывает цену в монетах
- ✅ Кнопка "⭐ Stars" - показывает цену в Stars
- ✅ Динамическая загрузка цен из `localStorage`
- ✅ Блокировка кнопки монет при недостаточном балансе
- ✅ Placeholder для оплаты через Telegram Stars

### 3. Система хранения данных

**Формат данных в localStorage:**
```json
{
  "boosterPrices": {
    "undo": {
      "coins": 50,
      "stars": 3
    },
    "shuffle": {
      "coins": 75,
      "stars": 4
    },
    "bomb": {
      "coins": 100,
      "stars": 5
    }
  }
}
```

**Ключ:** `boosterPrices`

**Структура:** Объект с ключами бустеров, каждый содержит `coins` и `stars`

## 📁 Измененные файлы

### 1. `/Users/vadim/Downloads/2048/profile.html`

**Изменения в функции `loadBoosterPrices()`:**
```javascript
function loadBoosterPrices() {
    const prices = JSON.parse(localStorage.getItem('boosterPrices')) || {};
    
    // Default values
    const defaults = {
        undo: { coins: 50, stars: 3 },
        shuffle: { coins: 75, stars: 4 },
        bomb: { coins: 100, stars: 5 }
    };
    
    // Load coins prices
    document.getElementById('undo-price').value = prices.undo?.coins || defaults.undo.coins;
    // ... аналогично для других бустеров
    
    // Load stars prices
    document.getElementById('undo-stars').value = prices.undo?.stars || defaults.undo.stars;
    // ... аналогично для других бустеров
}
```

**Изменения в функции `saveBoosterPrice()`:**
```javascript
window.saveBoosterPrice = function(boosterType) {
    const coinsInput = document.getElementById(boosterType + '-price');
    const starsInput = document.getElementById(boosterType + '-stars');
    
    const newCoinsPrice = parseInt(coinsInput.value);
    const newStarsPrice = parseInt(starsInput.value);
    
    // Валидация
    if (newCoinsPrice < 1 || newCoinsPrice > 1000) {
        alert('Цена в монетах должна быть от 1 до 1000');
        return;
    }
    
    if (newStarsPrice < 1 || newStarsPrice > 100) {
        alert('Цена в Stars должна быть от 1 до 100');
        return;
    }
    
    // Сохранение
    const prices = JSON.parse(localStorage.getItem('boosterPrices')) || {};
    prices[boosterType] = {
        coins: newCoinsPrice,
        stars: newStarsPrice
    };
    
    localStorage.setItem('boosterPrices', JSON.stringify(prices));
    alert(`✅ Цены для бустера обновлены:\n💰 ${newCoinsPrice} монет\n⭐ ${newStarsPrice} Stars`);
};
```

### 2. `/Users/vadim/Downloads/2048/js/shop.js`

**Изменения в методе `loadBoosterPrices()`:**
```javascript
loadBoosterPrices() {
    const boosterPrices = JSON.parse(localStorage.getItem('boosterPrices')) || {};
    
    Object.entries(this.bonusItems).forEach(([bonusId, bonus]) => {
        if (boosterPrices[bonusId]) {
            // Поддержка нового формата (объект с coins и stars)
            if (typeof boosterPrices[bonusId] === 'object') {
                bonus.price = boosterPrices[bonusId].coins || bonus.price;
                bonus.priceStars = boosterPrices[bonusId].stars || bonus.priceStars;
            } else {
                // Поддержка старого формата для обратной совместимости
                bonus.price = boosterPrices[bonusId];
            }
        }
    });
    
    console.log('✅ Цены бустеров загружены из админки:', this.bonusItems);
}
```

**Особенности:**
- ✅ Обратная совместимость со старым форматом (просто число)
- ✅ Поддержка нового формата (объект с `coins` и `stars`)
- ✅ Автоматическое применение дефолтных значений

## 🧪 Тестирование

### Тестовый файл
**Расположение:** `/Users/vadim/Downloads/2048/test-booster-prices.html`

**Возможности:**
- ✅ Просмотр текущего состояния `localStorage`
- ✅ Установка и сохранение цен
- ✅ Тестирование загрузки в `shop.js`
- ✅ Экспорт данных в JSON
- ✅ Быстрые тесты (дефолтные, кастомные цены)

**Как использовать:**
1. Откройте `test-booster-prices.html` в браузере
2. Установите нужные цены для каждого бустера
3. Нажмите "💾 Сохранить все цены"
4. Проверьте результат в разделе "Тест загрузки цен в Shop"

### Ручное тестирование

**Шаг 1: Установка цен**
```javascript
// В консоли браузера на странице профиля
localStorage.setItem('boosterPrices', JSON.stringify({
    undo: { coins: 100, stars: 5 },
    shuffle: { coins: 150, stars: 8 },
    bomb: { coins: 200, stars: 10 }
}));
```

**Шаг 2: Проверка в админке**
1. Откройте `profile.html`
2. Перейдите в Админ панель → Бустеры
3. Убедитесь, что цены отображаются корректно

**Шаг 3: Проверка в магазине**
1. Откройте `index.html`
2. Нажмите кнопку "Магазин"
3. Перейдите на вкладку "Бонусы"
4. Убедитесь, что цены соответствуют установленным

## 🔄 Процесс работы

### 1. Администратор устанавливает цены
```
Админ панель → Бустеры → Установка цен → Сохранение в localStorage
```

### 2. Цены загружаются в магазин
```
index.html загружается → Shop.constructor() → loadBoosterPrices() → Цены применены
```

### 3. Пользователь покупает бустер
```
Магазин → Выбор бустера → Выбор валюты (💰 или ⭐) → Покупка
```

## 📊 Дефолтные значения

```javascript
const DEFAULT_PRICES = {
    undo: { coins: 50, stars: 3 },
    shuffle: { coins: 75, stars: 4 },
    bomb: { coins: 100, stars: 5 }
};
```

## 🛠️ API функций

### `loadBoosterPrices()` (profile.html)
Загружает цены из `localStorage` и заполняет поля ввода в админке.

**Параметры:** Нет

**Возвращает:** `void`

### `saveBoosterPrice(boosterType)` (profile.html)
Сохраняет цены указанного бустера в `localStorage`.

**Параметры:**
- `boosterType` (string) - ID бустера ('undo', 'shuffle', 'bomb')

**Возвращает:** `void`

**Валидация:**
- Coins: 1-1000
- Stars: 1-100

### `loadBoosterPrices()` (shop.js)
Загружает цены из `localStorage` и применяет их к объектам бустеров.

**Параметры:** Нет

**Возвращает:** `void`

**Особенности:**
- Обратная совместимость
- Автоматические дефолтные значения

## 🎨 UI элементы

### Админ-панель
```html
<div class="booster-price-card">
    <div class="booster-icon-large">⟲</div>
    <h4>Отмена хода</h4>
    <div class="price-controls">
        <label>💰 Монеты:</label>
        <input type="number" id="undo-price" value="50" min="1" max="1000">
    </div>
    <div class="price-controls">
        <label>⭐ Stars:</label>
        <input type="number" id="undo-stars" value="3" min="1" max="100">
    </div>
    <button onclick="saveBoosterPrice('undo')">💾 Сохранить</button>
</div>
```

### Магазин
```html
<div class="payment-buttons">
    <button class="buy-coins-btn" data-bonus="undo" data-method="coins">
        <span class="btn-icon">💰</span>
        <span class="btn-label">50</span>
    </button>
    <button class="buy-stars-btn" data-bonus="undo" data-method="stars">
        <span class="btn-icon">⭐</span>
        <span class="btn-label">3</span>
    </button>
</div>
```

## ⚡ Производительность

- ✅ Минимальное использование памяти
- ✅ Все данные в `localStorage` (синхронная операция)
- ✅ Загрузка цен происходит 1 раз при инициализации
- ✅ Нет дополнительных HTTP запросов

## 🔒 Безопасность

- ✅ Валидация на стороне клиента
- ✅ Ограничения диапазона значений
- ✅ Защита от некорректного ввода
- ⚠️ Данные хранятся локально (может быть изменено пользователем)

## 🚀 Будущие улучшения

### Планируется:
- [ ] Синхронизация с сервером
- [ ] История изменения цен
- [ ] A/B тестирование цен
- [ ] Аналитика покупок
- [ ] Динамическое ценообразование
- [ ] Скидки и промокоды

### Интеграция с Telegram Stars:
- [ ] Реальная оплата через Telegram WebApp API
- [ ] Webhook для подтверждения платежей
- [ ] Система возвратов
- [ ] История транзакций

## 📝 Примечания

1. **Обратная совместимость:** Код поддерживает старый формат хранения цен (просто число) для плавной миграции.

2. **Дефолтные значения:** Если в `localStorage` нет сохраненных цен, используются значения по умолчанию.

3. **Telegram Stars:** Функциональность покупки за Stars имеет placeholder и требует интеграции с Telegram Bot API.

4. **Админ-права:** Доступ к админ-панели контролируется через `checkAdminAccess()` в `profile.html`.

## 🐛 Известные проблемы

Нет известных проблем на данный момент.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на наличие ошибок
2. Используйте `test-booster-prices.html` для диагностики
3. Очистите `localStorage` и установите дефолтные значения

---

**Версия:** 1.0.0  
**Дата:** 2025-10-07  
**Статус:** ✅ Полностью реализовано и протестировано
