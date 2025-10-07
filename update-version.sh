#!/bin/bash
# Скрипт для быстрого обновления версии приложения

echo "🔄 2048 Telegram Mini App - Обновление версии"
echo ""

# Текущая версия
CURRENT_VERSION=$(grep -o "current: '[^']*'" version.js | cut -d"'" -f2)
echo "Текущая версия: $CURRENT_VERSION"
echo ""

# Запрос новой версии
read -p "Введите новую версию (например, 1.3.1): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo "❌ Версия не указана. Отмена."
    exit 1
fi

# Подтверждение
echo ""
echo "Обновить версию с $CURRENT_VERSION на $NEW_VERSION?"
read -p "Продолжить? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Отменено."
    exit 0
fi

# Обновление version.js
echo ""
echo "📝 Обновление version.js..."
sed -i.bak "s/current: '$CURRENT_VERSION'/current: '$NEW_VERSION'/g" version.js
rm version.js.bak

# Обновление version.json
echo "📝 Обновление version.json..."
RELEASE_DATE=$(date +%Y-%m-%d)
cat > version.json << EOF
{
  "version": "$NEW_VERSION",
  "releaseDate": "$RELEASE_DATE",
  "changelog": [
    "Обновление версии до $NEW_VERSION",
    "Исправления и улучшения"
  ],
  "minCompatibleVersion": "1.0.0"
}
EOF

echo ""
echo "✅ Версия успешно обновлена до $NEW_VERSION"
echo ""
echo "📦 Следующие шаги:"
echo "1. Проверьте изменения: git diff"
echo "2. Закоммитьте: git add . && git commit -m 'Update to v$NEW_VERSION'"
echo "3. Запушьте на сервер: git push"
echo ""
echo "Или загрузите файлы на Netlify вручную."
