# Test Project

A project combining PHP (80.8%) and TypeScript (19.1%) technologies.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- PHP >= 7.4
- Composer (PHP package manager)
- Node.js >= 14.x
- npm (Node package manager)

## Configuration

1. Create a copy of the environment file for the api
```bash
cd api
cp .env.example .env
cd ..
```

2. Configure your environment variables in `.env`
```bash
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

3. Create a copy of the environment file for the app
```bash
cd app
cp .env.example .env
cd ..
```

4. Configure your environment variables in `.env`

## Installation

1. Install PHP dependencies
```bash
cd api
composer install
php artisan migrate --seed
cd ..
```

2. Install TypeScript/JavaScript dependencies
```bash
cd app
git init
npm install
cd ..
```

## Running the Application

1. Start the PHP development server in a new terminal:
```bash
cd api
php artisan serve
```

2. Start the PHP reverb server in a new terminal
```bash
cd api
php artisan reverb:start
```

3. Start the PHP queue listing in a new terminal
```bash
cd api
php artisan queue:work
```

4. Start the Next development server in a new terminal
```bash
cd app
npm run dev
```

5. Visit `http://localhost:3000` in your browser
