# JarFlow Backend API (Laravel + PostgreSQL)

This directory contains the production-grade Laravel 11 / Sanctum API specification and backend architecture for the JarFlow Water Jar Management System.

---

## Database Architecture (PostgreSQL)

### Tables
1. **`users`**: Admin, Staff, Delivery Boys, Accountants with Sanctum API tokens.
2. **`customers`**: UUID, name, mobile, area, address, current_jars, pending_amount, default_rate, active.
3. **`jars`**: UUID, serial_number (e.g. `JAR-0001`), qr_code, status (`available`, `with_customer`, `damaged`, `lost`), current_customer_id, date_given, date_returned.
4. **`jar_transactions`**: Daily entries with jars_given, jars_returned, bill_amount, cash_paid, upi_paid, udhari_amount, payment_mode.
5. **`payments`**: Credit collections, payment_mode (`CASH`, `UPI`, `BANK`), remaining_balance.
6. **`ledgers`**: Immutable financial and jar movement audit trail.
7. **`settings`**: Business profile, UPI ID, default jar rate (₹35), godown inventory count.

---

## Setup & Execution

### 1. Environment Configuration (`.env`)
```env
APP_NAME=JarFlow
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=jarflow_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 2. Run Database Migrations
```bash
php artisan migrate
```

### 3. Run Dev Server
```bash
php artisan serve
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Sanctum token login |
| `GET` | `/api/customers` | Search & filter customer list |
| `POST` | `/api/customers` | Add new customer |
| `GET` | `/api/customers/{id}/ledger` | Complete customer ledger |
| `POST` | `/api/transactions` | **Speed Daily Entry** (< 1 sec atomic save) |
| `POST` | `/api/payments` | Record Cash/UPI payment against udhari |
| `GET` | `/api/jars` | Godown inventory & statuses |
| `POST` | `/api/jars/batch` | Bulk add jars with serial numbers |
| `GET` | `/api/reports/daily` | Day sales, jars given & collections |
| `GET` | `/api/reports/udhari` | Full market outstanding balances |
