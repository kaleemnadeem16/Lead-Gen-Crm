#!/bin/sh
set -e

# Install dependencies into the named volume if not already installed
if [ ! -f "vendor/autoload.php" ]; then
    echo "[entrypoint] Running composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    echo "[entrypoint] Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations on startup (safe — never fresh)
echo "[entrypoint] Running migrations..."
php artisan migrate --no-interaction --force

# Clear compiled caches (dev only)
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "[entrypoint] Starting Laravel dev server on 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
