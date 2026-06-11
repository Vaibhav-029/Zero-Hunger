# FoodRescue AI — Expiry-Aware Real-Time Food Redistribution Network

## Quick start (Windows)

1. Install **Docker Desktop**, **Java 17+**, **Java 21** (for donation module), **Node.js 18+**, and **Python 3.10+**
2. From this folder, run:

```powershell
.\start.ps1
```

3. Open:
   - Main site: http://localhost:5173
   - Donations: http://localhost:3005/donate
   - ML pipeline: http://localhost:5173/pipeline

**Demo logins:** `donor` / `donor123`, `ngo` / `ngo123`, `driver` / `driver123`

Stop everything:

```powershell
.\stop.ps1
```

## Project structure

| Folder | Port | Description |
|--------|------|-------------|
| `frontend/` | 5173 | React main site (food donations, logistics UI) |
| `zero-hunger/` | 8080 | Spring Boot API for food rescue logistics |
| `smart-donation-module/` | 3005 + 8085 | Next.js + Spring Boot charity donations (Razorpay) |
| `ml-service/` | 8000 | FastAPI ML engine (spoilage, routing, matching) |

**Database:** If Docker is available, PostgreSQL runs on port **5432** with databases `epoch_db` and `foodrescue_donations`. If Docker is not running, backends automatically fall back to embedded **H2** file databases (no setup needed).
