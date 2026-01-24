#!/bin/bash

# Script para hacer push y crear PR con todas las actualizaciones
# Ejecutar cuando tengas conexión a internet

BRANCH="feature/dark-mode-ui-improvements"
REPO="leomena-gif/recauda"
BASE_BRANCH="main"

echo "🚀 Haciendo push de la rama $BRANCH..."

git push -u origin "$BRANCH"

if [ $? -eq 0 ]; then
  echo "✅ Push exitoso!"
  echo ""
  echo "📝 Creando Pull Request..."

  if command -v gh &> /dev/null; then
    gh pr create \
      --title "feat: UI/UX desktop, Registrar venta modal, Agregar vendedor, calidad de código, localhost" \
      --body-file .pr-body.md \
      --base "$BASE_BRANCH" \
      --head "$BRANCH"
  else
    echo "⚠️  GitHub CLI (gh) no está instalado."
    echo "📋 Crea el PR manualmente en:"
    echo "   https://github.com/$REPO/compare/$BASE_BRANCH...$BRANCH"
    echo ""
    echo "Copia el contenido de .pr-body.md como descripción del PR."
  fi
else
  echo "❌ Error al hacer push. Verifica tu conexión."
  exit 1
fi
