# 🪣 JarFlow (जलधारा) - Premium Mobile-First Water Jar Management PWA

> **Extreme simplicity + fast daily operations + clean UI + automatic calculations + minimal clicks.**

JarFlow is a mobile-first Progressive Web Application (PWA) designed specifically for small and medium packaged water distribution businesses (20L jars). Designed to feel as **clean as Apple**, as **practical as WhatsApp Business**, as **minimal as Notion**, and as **premium as Awwwards**.

---

## 🎯 Answering the Water Business Owner's Core Daily Questions
Every screen is architected around the 7 fundamental questions every water supplier needs answered in under 3 seconds:

| Marathi (मराठी) | English | System Widget / Calculation |
|---|---|---|
| **आज किती jar गेले?** | How many jars delivered today? | **Jars Given** live metric & daily report |
| **कोणाला गेले?** | To whom were they given? | **Customer Ledger** & Daily Transaction Log |
| **किती पैसे मिळाले?** | How much money collected today? | **Cash + UPI** payment tracking |
| **किती उधारी आहे?** | What is the outstanding credit? | **Total Pending Udhari** live summary |
| **कोणाकडे किती jar आहेत?** | Who holds how many jars? | **With Customers** fleet count |
| **किती jar परत आले?** | How many empty jars returned? | **Jars Returned** counter |
| **किती jar available आहेत?** | How many available in godown? | **Godown Stock** = Total - Customer - Damaged |

---

## 📱 Features & Highlights

### 1. ⚡ 3-Second Daily Speed Entry (`/` -> Hero Action `+`)
* **Select Customer**: Search or 1-tap select recent client.
* **Tactile Steppers**: Large 54px touch targets with `+` and `-` steppers, plus quick preset pills (`+1`, `+2`, `+5`, `+10`).
* **Auto Calculations**: Live rate calculation (e.g. ₹35/jar), instant bill calculation, projected jar balances.
* **1-Tap Payment**: `Cash Full (रोख)`, `UPI Full (फोनपे)`, `Udhari Full (उधारी)`, or `Split`.
* **Instant Confirmation & WhatsApp Receipt**: Celebratory confetti, tactile audio feedback, and 1-tap pre-filled WhatsApp receipt generator.

### 2. 📊 Executive Dashboard
* **9 Primary Metric Cards**: Total Fleet, Available in Godown, Jars Given, Jars Returned, With Customers, Cash Collected, Today's Udhari, Total Outstanding Balance, and Damaged Jars.
* **Interactive Time Filters**: Today, Yesterday, This Week, This Month.
* **Dynamic Visual Charts**:
  - Weekly Jar Movement (Given vs Returned Bar Chart with Recharts)
  - Cash vs Udhari Ratio Donut Chart
  - Top Customers ranking with quick Call and WhatsApp actions.

### 3. 👥 Customer Management & Full Ledger
* Customer profile: Name, Mobile, Address, Area route, Rate per jar, Notes.
* **Customer Ledger**: Chronological audit trail of deliveries, returns, bill amounts, payments, and running balance.
* **PDF & CSV Export**: One-click download of professional statements formatted with business header and UPI details.
* **One-Tap Actions**: Direct Phone Call (`tel:`) and pre-filled WhatsApp billing summary.

### 4. 📦 Jar Inventory & QR Code Tracking
* Complete fleet breakdown: Available, With Customers, Damaged, Lost.
* Serial number allocation (e.g. `JAR-0001` ... `JAR-0050`).
* **QR Code Scanner Simulator**: Camera scanner simulation to identify jar origin and customer.
* **QR Sticker Generator**: High-contrast QR codes ready to print and stick on jars.
* Batch Addition: Add 20, 50, or 100 new jars to Godown stock with 1 click.

### 5. 💰 Payment Collection & Udhari Recovery
* Dedicated payment collection screen for clearing customer credit.
* Payment modes: Cash, PhonePe / Google Pay UPI, Bank Transfer.
* Automatic real-time deduction from customer pending balance.
* Instant WhatsApp payment receipt generator.

### 6. 📈 Business Reports
* Daily Sales & Operations Summary.
* Pending Udhari Balance Ledger (sorted by highest debtor).
* Jar Fleet Stock Ledger.
* PDF, Excel/CSV, and Print-friendly layouts.

### 7. 📲 Progressive Web App (PWA) Capabilities
* **Offline-First**: Service worker caching and localStorage engine for 100% offline usage.
* **Add to Home Screen**: Install banner for iOS and Android.
* **Bilingual Switcher**: Instant toggle between **Marathi (मराठी)** and **English**.
* **Device Mockup Switcher**: Toggle between an iPhone 16 mockup frame and a full responsive desktop view.

---

## 🛠 Tech Stack

### Frontend (Live & Production-Ready)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design system (`#1E40AF` Deep Blue, `#16A34A` Green, `#F59E0B` Orange, `#DC2626` Red)
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Tactile Audio**: Synthesized Web Audio API + Vibration API
- **PWA**: Service Worker (`/public/sw.js`) + Web App Manifest (`/public/manifest.json`)

### Backend Architecture (`/backend`)
- **Framework**: Laravel 11 API
- **Database**: PostgreSQL (UUIDs, indexed customer and transaction tables)
- **Authentication**: Laravel Sanctum API tokens
- **Tables**: `users`, `customers`, `jars`, `jar_transactions`, `payments`, `ledgers`, `settings`
- **Transactions**: Atomic `DB::transaction` with row-level locking for zero-loss financial integrity.

---

## 🚀 Getting Started

### 1. Run Frontend (React PWA)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
Visit `http://localhost:5173/` in your browser or mobile phone.

### 2. Run Backend (Laravel API)
```bash
cd backend

# Configure environment (.env)
cp .env.example .env

# Run database migrations
php artisan migrate

# Start Laravel server
php artisan serve
```

---

## 🎨 Visual Design Tokens
- **Primary Deep Blue**: `#1E40AF`
- **Success Green**: `#16A34A`
- **Warning Orange**: `#F59E0B`
- **Danger Red**: `#DC2626`
- **Background**: `#FAFAFA`
- **Cards**: `#FFFFFF` with soft shadows (`shadow-card`)
- **Corners**: `16px` to `24px` (`rounded-2xl`, `rounded-3xl`)
- **Touch Target**: Minimum `48px` - `54px`
