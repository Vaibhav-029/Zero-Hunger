# Smart Charity & Humanitarian Donation System (MVP)

This folder is a **separate donation module** for **FoodRescue AI — Expiry-Aware Real-Time Food Redistribution Network**.

It includes:
- `frontend/` → Next.js + TypeScript + Tailwind + shadcn-style UI components + jsPDF certificate
- `backend/` → Spring Boot + PostgreSQL + Razorpay Sandbox order + verification
- `db/init.sql` → optional schema/seed script (backend also seeds via `data.sql`)

## Run (Hackathon demo)

### 1) Start PostgreSQL

From `smart-donation-module/`:

```bash
docker compose up -d
```

### 2) Run backend (Spring Boot)

Set env vars (PowerShell example):

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/foodrescue_donations"
$env:DB_USER="postgres"
$env:DB_PASS="postgres"
$env:RAZORPAY_KEY_ID="rzp_test_..."
$env:RAZORPAY_KEY_SECRET="..."
$env:CORS_ALLOWED_ORIGINS="http://localhost:3005"
```

Then:

```bash
cd smart-donation-module/backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8085`.

### 3) Run frontend (Next.js)

```bash
cd smart-donation-module/frontend
cp .env.example .env.local
npm i
npm run dev
```

Frontend runs on `http://localhost:3005`:
- `/donate`
- `/campaigns`
- `/impact`
- `/donation-history`

## Razorpay Sandbox flow

- Frontend calls `POST /api/payments/order` → backend creates Razorpay order + stores donation as `CREATED`
- Razorpay checkout returns payment info → frontend calls `POST /api/payments/verify`
- Backend verifies signature and marks donation `PAID` (or `FAILED`), then updates NGO/campaign totals
- Frontend generates a **premium PDF certificate** using `jsPDF` + QR payload (demo verification)

## Integration with your existing FoodRescue AI site

Because this module is isolated, you can integrate by:
- adding a navbar button on your main site pointing to `http://localhost:3005/donate` (or deployed URL)
- or reverse-proxy this frontend under your main domain as `/donate`, `/campaigns`, etc.

