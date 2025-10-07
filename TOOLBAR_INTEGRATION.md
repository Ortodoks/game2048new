# 🛠️ Toolbar Integration Guide

## ✅ Цель
Интегрировать кастомное меню (`.toolbar`) с SCSS-стилями, заменив иконки на кнопки проекта: магазин, профиль, рейтинг, задачи и главная.

---

## ⚙️ Шаги интеграции

### 1. **Подключение стилей**

Стили уже интегрированы в `styles.css`. Если используете SCSS:

```scss
@import 'styles.css'; // или путь к вашему файлу
```

### 2. **HTML структура**

Замените существующий toolbar на эту структуру:

```html
<div class="toolbar">
  <!-- Home -->
  <div class="toolbar__icon icon--home is-active" data-page="home">
    <svg width="48" height="48" viewBox="0 0 48 48">
      <!-- SVG content -->
    </svg>
  </div>

  <!-- Tasks -->
  <svg class="toolbar__icon icon--chart" data-page="tasks" width="24" height="21">
    <!-- SVG content -->
  </svg>

  <!-- Leaderboard -->
  <div class="toolbar__icon icon--podium" data-page="leaderboard">
    <svg width="24" height="24" viewBox="0 0 488.049 488.049">
      <!-- SVG content -->
    </svg>
  </div>

  <!-- Shop -->
  <svg class="toolbar__icon icon--shop" data-page="shop" width="24" height="24">
    <!-- SVG content -->
  </svg>

  <!-- Profile -->
  <div class="toolbar__icon icon--search" data-page="profile">
    <div class="toolbar-avatar" id="toolbar-avatar">👤</div>
  </div>
</div>
```

### 3. **Доступные классы иконок**

| Класс | Цвет | Описание |
|-------|------|----------|
| `icon--home` | Фиолетовый | Главная страница |
| `icon--chart` | Зелёный | Задачи/Статистика |
| `icon--podium` | Голубой | Рейтинг |
| `icon--shop` | Красный | Магазин |
| `icon--search` | Фиолетовый | Профиль |

### 4. **Активное состояние**

Добавьте класс `is-active` к активной кнопке:

```html
<div class="toolbar__icon icon--home is-active"></div>
```

### 5. **Кастомизация цветов**

Если нужны другие цвета, измените градиенты в CSS:

```css
.toolbar__icon.icon--shop {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    border: 2px solid rgba(255, 107, 107, 0.5);
}
```

### 6. **Адаптивность**

Стили автоматически адаптируются:

- **Desktop**: Полный размер, все кнопки в ряд
- **Tablet (≤768px)**: Уменьшенные отступы
- **Mobile (≤480px)**: `flex-wrap: wrap`, кнопки переносятся
- **Small Mobile (≤360px)**: Минимальные размеры

### 7. **JavaScript навигация**

Добавьте обработчики кликов:

```javascript
document.querySelectorAll('.toolbar__icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        
        // Убрать активный класс у всех
        document.querySelectorAll('.toolbar__icon').forEach(i => 
            i.classList.remove('is-active')
        );
        
        // Добавить активный класс текущей
        this.classList.add('is-active');
        
        // Навигация
        window.location.href = `${page}.html`;
    });
});
```

---

## 🧪 Финальный тест

✅ Все кнопки отображаются корректно  
✅ Цвета и обводки соответствуют стилю  
✅ Никаких вылазов, багов или перекосов  
✅ Анимации работают (bump при клике)  
✅ Фон панели прозрачный, не конфликтует с фоном приложения  
✅ Адаптивность на всех разрешениях  

---

## 🎨 Параметры стилей

### Обводка
- **Толщина**: `2px solid`
- **Цвет**: Полупрозрачный, соответствует градиенту
- **Скругление**: `border-radius: 1rem` (16px)

### Тени
- **Обычное**: `box-shadow: 0 4px 12px rgba(..., 0.3)`
- **Активное**: `box-shadow: 0 6px 16px rgba(..., 0.5)`
- **Drop-shadow**: `filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`

### Анимации
- **Hover**: `transform: scale(1.15)`
- **Active**: `transform: scale(1.1)` + усиленное свечение
- **Bump**: Анимация при клике (200ms)

---

## 📱 Поддержка устройств

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (480px - 768px)
- ✅ Small Mobile (360px - 480px)
- ✅ Extra Small (< 360px)

---

## 🔧 Troubleshooting

### Проблема: Тёмный фон панели
**Решение**: Убедитесь, что `background: transparent` в `.toolbar`

### Проблема: Кнопки не помещаются
**Решение**: Добавлено `flex-wrap: wrap` для мобильных

### Проблема: Иконки не видны
**Решение**: Проверьте `fill: #ffffff` для SVG и контраст с фоном

### Проблема: Обводка отсутствует
**Решение**: Убедитесь, что нет `!important` переопределений в других файлах

---

## 📦 Файлы проекта

- `styles.css` - Основные стили toolbar
- `js/toolbar-nav.js` - JavaScript навигация
- `js/toolbar-avatar.js` - Обновление аватара
- `index.html`, `profile.html`, `leaderboard.html`, `shop.html`, `tasks.html` - Страницы с toolbar

---

**Готово к использованию!** 🚀
