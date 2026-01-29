FROM php:8.2-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Copy application
COPY . .

# Render provides PORT
ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "php artisan serve --host 0.0.0.0 --port ${PORT}"]
