#!/bin/bash

set -e

echo "======================================"
echo "🍔 Desplegando Frontend AVANZADA (Next.js)..."
echo "======================================"

echo ""
echo "📥 Actualizando repositorio..."
git fetch --all
git pull

echo ""
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🏗️ Compilando AVANZADA..."
npm run build

echo ""
echo "📂 Publicando archivos..."

# Si tu Next.js está configurado como export estático:
# npm run export
sudo rsync -av --delete out/ /var/www/avanzadas/

# Si lo sirves como aplicación Node (SSR):
# sudo rsync -av --delete .next/ /var/www/AVANZADA/.next/
# sudo rsync -av --delete public/ /var/www/AVANZADA/public/
# sudo rsync -av --delete package.json /var/www/AVANZADA/
# sudo rsync -av --delete node_modules/ /var/www/AVANZADA/node_modules/

echo ""
echo "✅ AVANZADA desplegado correctamente."
echo "======================================"
