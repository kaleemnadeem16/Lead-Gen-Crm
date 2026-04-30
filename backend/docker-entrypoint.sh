#!/bin/sh
set -e

# Build config/route/view caches at startup so they pick up runtime env vars.
# Running this during the Docker image build would bake in build-time values
# (or empty values if .env isn't present), breaking runtime configuration.
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
