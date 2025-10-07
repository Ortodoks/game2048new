# 🎨 Unified Icon Button System

## Цель
Единая система иконок для всех разделов приложения (профиль, главная, рейтинг, магазин, задачи).

---

## 📋 Использование

### HTML структура

```html
<!-- Базовая иконка -->
<button class="icon-button">
    <svg>...</svg>
</button>

<!-- С цветом -->
<button class="icon-button icon-button--blue">
    <svg>...</svg>
</button>

<!-- Активная иконка -->
<button class="icon-button icon-button--blue is-active">
    <svg>...</svg>
</button>
```

---

## 🎨 Цветовые варианты

| Класс | Цвет | Использование |
|-------|------|---------------|
| `icon-button--blue` | #24A1FD | Рейтинг, информация |
| `icon-button--red` | #ff0030 | Магазин, удаление |
| `icon-button--yellow` | #ffc600 | Главная, важное |
| `icon-button--purple` | #e546ff | Профиль, настройки |
| `icon-button--green` | #00ff36 | Задачи, успех |

---

## 📐 Параметры

### Размеры
```css
width: 2em;
height: 2em;
font-size: 1em; /* Можно менять для масштабирования */
```

### Иконка внутри
```css
svg, .icon {
    width: 1.2em;
    height: 1.2em;
}
```

### Обводка и фон
```css
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 1em;
```

---

## 🎭 Состояния

### Обычное
- Полупрозрачный фон
- Тонкая обводка
- Цвет иконки по умолчанию

### Hover
```css
transform: scale(1.1);
background: rgba(255, 255, 255, 0.15);
border-color: rgba(255, 255, 255, 0.3);
```

### Active (класс `.is-active`)
- Анимация `bump`
- Цветной фон (20% прозрачности)
- Цветная обводка

---

## 💡 Примеры использования

### В профиле
```html
<button class="icon-button icon-button--purple is-active">
    <svg><!-- Иконка профиля --></svg>
</button>
```

### На главной
```html
<button class="icon-button icon-button--yellow">
    <svg><!-- Иконка главной --></svg>
</button>
```

### В рейтинге
```html
<button class="icon-button icon-button--blue is-active">
    <svg><!-- Иконка рейтинга --></svg>
</button>
```

### В магазине
```html
<button class="icon-button icon-button--red">
    <svg><!-- Иконка магазина --></svg>
</button>
```

### В задачах
```html
<button class="icon-button icon-button--green">
    <svg><!-- Иконка задач --></svg>
</button>
```

---

## 🔧 Кастомизация

### Изменить размер
```html
<button class="icon-button icon-button--blue" style="font-size: 1.5em;">
    <svg>...</svg>
</button>
```

### Изменить форму
```css
.icon-button.rounded {
    border-radius: 50%; /* Круглая */
}

.icon-button.square {
    border-radius: 0.5em; /* Квадратная */
}
```

---

## 📱 Адаптивность

Система использует `em` единицы, поэтому автоматически масштабируется:

```css
/* Для мобильных */
@media (max-width: 480px) {
    .icon-button {
        font-size: 0.9em;
    }
}

/* Для планшетов */
@media (max-width: 768px) {
    .icon-button {
        font-size: 0.95em;
    }
}
```

---

## ✅ Преимущества

1. **Единообразие** - Все иконки выглядят одинаково
2. **Масштабируемость** - Легко менять размер через `font-size`
3. **Цветовая система** - 5 готовых цветовых схем
4. **Анимации** - Единые hover и active эффекты
5. **Адаптивность** - Автоматическое масштабирование

---

## 🚀 Миграция

### Старый код
```html
<div class="toolbar__icon icon--home">
    <svg>...</svg>
</div>
```

### Новый код
```html
<button class="icon-button icon-button--yellow">
    <svg>...</svg>
</button>
```

---

**Используйте `.icon-button` везде для единообразия!** 🎯
