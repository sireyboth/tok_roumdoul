# Tok by Roumdoul

QR ordering for restaurants and cafés in Cambodia.

```
tok_roumdoul/
├── backend/    Laravel 12 + Filament 5 + MySQL
│               /admin  platform team (plans, restaurants)
│               /app    restaurant back office (menu, tables & QR, staff)
│               /api    public menu API for the customer site
└── frontend/   Next.js 16 customer site
                /t/{qr-token}  the menu a customer sees after scanning
                /staff         kitchen, waiter, cashier screens (Step 1)
```

## What Step 0 includes

- Restaurants are **companies** (tenants). Each has branches, table areas, tables, a menu, staff and a plan.
- Sign-up: anyone can register at `/app/register`, then "Register your restaurant" creates the company, a 14-day trial, and the first branch.
- **Menu**: categories, items (Khmer / English / Chinese names), option groups (size, sugar, ice, extras) with extra prices.
- **Per-branch menu**: on each branch page, switch items off, set a branch-only price, or mark sold out today.
- **Tables & QR codes**: add one table or many at once (T1–T20), show/download QR, make a new QR if one was copied.
- **Staff**: owners, managers, cashiers, kitchen, waiters, with a manager PIN for voids/refunds later.
- **Plans** with limits on branches, tables and staff (edit prices in `/admin > Plans`).
- **Audit log** of every change to menus, tables, staff and settings.
- **Customer menu** (Next.js): Khmer/English, categories, item options, cart with USD + riel total. Sending the order to the kitchen arrives in Step 1.

## Data rules built in from day one

- Money is stored as whole numbers (USD cents, or whole riel). No floats.
- Customers are identified only by the table's random QR token; company and branch always come from that token.
- The branch menu is cached and has a version number that changes on every menu edit, so a stale menu is never shown.
- Every restaurant row has `company_id`; the back office only ever shows the signed-in restaurant's data.

## Run it on Windows

You need PHP 8.2+ with the `intl`, `zip`, `gd`, `pdo_mysql` and `fileinfo` extensions, Composer, MySQL 8 (XAMPP / Laragon is fine) and Node.js 20+.

In XAMPP, open `php.ini` and make sure these lines have no `;` in front: `extension=intl`, `extension=zip`, `extension=gd`.

### 1. Create the database

In phpMyAdmin or the MySQL console:

```sql
CREATE DATABASE tok CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bat
cd D:\Leng\Leng\System\tok_roumdoul\backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Set `DB_USERNAME` / `DB_PASSWORD` in `.env` first if your MySQL root user has a password.

The seed step prints the demo logins and one customer link per table.

### 3. Frontend (second terminal)

```bat
cd D:\Leng\Leng\System\tok_roumdoul\frontend
copy .env.example .env.local
npm install
npm run dev
```

### 4. Try it

| What | Where | Login |
|---|---|---|
| Restaurant back office | http://localhost:8000/app | owner@tok.test / password |
| Platform admin | http://localhost:8000/admin | admin@tok.test / password |
| Customer menu | Back office > Tables & QR codes > ⋯ > Open customer menu | none |

### Tests

```bat
cd backend
php artisan test
```

## Next: Step 1

Orders and table sessions, kitchen screen, waiter app, call waiter / request bill, order tracking, payments at the counter, printing, shift close, Telegram alerts, reports and Excel export, with live updates through Laravel Reverb.
