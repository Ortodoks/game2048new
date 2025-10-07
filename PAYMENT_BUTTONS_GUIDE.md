# 💰⭐ Система двойных кнопок оплаты

## ✅ Что реализовано

### Отображение кнопок в магазине скинов:

#### 1. **Скин НЕ куплен** → 2 кнопки:
- **💰 Кнопка "Монеты"** 
  - Показывает цену из админки
  - Если монет недостаточно → кнопка disabled + надпись "Недостаточно"
  - Если монет достаточно → покупка работает как раньше
  
- **⭐ Кнопка "Stars"**
  - Показывает цену из админки (priceStars)
  - Пока работает с заглушкой (можно подключить Telegram Payment API)

#### 2. **Скин куплен, но НЕ активен** → 1 кнопка:
- **"Использовать"** → применяет скин

#### 3. **Скин активен** → 1 кнопка:
- **"✓ Активен"** (disabled)

## 🎨 Визуальное оформление

### Кнопка "Монеты":
- Цвет: Золотой градиент `#FFD700 → #FFA500`
- Иконка: 💰
- При недостатке: красный фон + надпись "Недостаточно"

### Кнопка "Stars":
- Цвет: Фиолетовый градиент `#667eea → #764ba2`
- Иконка: ⭐
- Всегда активна (с заглушкой)

## 📋 Структура кнопок

```html
<!-- Для некупленного скина -->
<div class="payment-buttons">
    <button class="buy-btn buy-coins-btn">
        <span class="btn-icon">💰</span>
        <span class="btn-label">900</span>
    </button>
    <button class="buy-btn buy-stars-btn">
        <span class="btn-icon">⭐</span>
        <span class="btn-label">45</span>
    </button>
</div>

<!-- Для купленного скина -->
<button class="buy-btn use-btn">Использовать</button>

<!-- Для активного скина -->
<button class="buy-btn active-btn" disabled>✓ Активен</button>
```

## 🔧 Как это работает

### В shop.js:
```javascript
if (!isOwned) {
    // Скин не куплен - показываем 2 кнопки
    const hasEnoughCoins = this.game.coins >= skin.price;
    
    buttonsHTML = `
        <div class="payment-buttons">
            <button class="buy-coins-btn ${hasEnoughCoins ? '' : 'insufficient'}">
                💰 ${skin.price}
            </button>
            <button class="buy-stars-btn">
                ⭐ ${skin.priceStars}
            </button>
        </div>
    `;
}
```

### Обработчики:
- **Монеты**: `buySkinWithCoins(skinId, skin)` - проверка баланса + покупка
- **Stars**: `buySkinWithStars(skinId, skin)` - пока заглушка

## 🚀 Интеграция с Telegram Stars (будущее)

Для подключения реальной оплаты Stars:
1. В `buySkinWithStars()` добавить:
```javascript
if (window.Telegram?.WebApp) {
    const invoice = {
        title: `Скин: ${skin.name}`,
        currency: 'XTR', // Telegram Stars
        prices: [{ label: skin.name, amount: skin.priceStars }]
    };
    // Вызов Telegram Payment API
}
```

## 📊 Цены из админки

Цены берутся из `window.SKIN_CONFIGS`:
- `skin.price` → цена в монетах (💰 кнопка)
- `skin.priceStars` → цена в Stars (⭐ кнопка)

Админ может менять цены в профиле → все обновится автоматически!

## ✅ Проверка работы

1. **Откройте магазин** → вкладка "Скины"
2. **Найдите некупленный скин** → видны 2 кнопки (💰 и ⭐)
3. **Проверьте монеты**:
   - Если денег мало → кнопка 💰 серая + "Недостаточно"
   - Если денег достаточно → кнопка 💰 активна
4. **Купите скин** → кнопки заменятся на "Использовать"
5. **Активируйте скин** → кнопка станет "✓ Активен"

**Всё работает! 🎉**
