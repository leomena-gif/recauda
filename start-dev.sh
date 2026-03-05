#!/bin/bash

# Script de inicio del servidor de desarrollo
# Soluciona problemas de permisos en macOS

cd "$(dirname "$0")"

echo "🚀 Iniciando servidor de desarrollo..."
echo "📁 Directorio: $(pwd)"
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Limpiar procesos anteriores y caché si existen
echo "🧹 Limpiando puerto 3000 y caché .next..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -rf .next

# Esperar un momento
sleep 1

# Iniciar el servidor (solo localhost para evitar EPERM en algunos entornos)
echo "✅ Iniciando Next.js en http://localhost:3000"
echo ""
npm run dev
