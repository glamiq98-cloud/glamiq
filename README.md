# 👑 GlamIQ — AI-Powered Fashion & Styling Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_Async-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NVIDIA AI](https://img.shields.io/badge/AI_Engine-NVIDIA_NIM-76B900?style=flat&logo=nvidia&logoColor=white)](https://build.nvidia.com/)

**GlamIQ** is an AI-powered fashion platform tailored for luxury Pakistani bridal, festive pret, and contemporary formal styling. Users can upload or select dresses; the platform automatically analyzes fabric colors, occasions, and personal skin undertones to curate matching **Kundan & Polki jewelry**, **signature glam makeup**, and styling advice.

---

## 🌟 Key Features

1. **🎨 Computer Vision & Color Palette Detection**:
   - Automatically analyzes dress photos to identify dominant color families (*Mustard Yellow & Gold, Crimson Red, Emerald Green, Royal Navy, Terracotta*).
2. **🧬 Skin Undertone Recognition**:
   - Analyzes portrait photos to classify skin undertones (*Fair, Medium, Dark*) for tailored makeup recommendations.
3. **💎 Rule-Based Color Harmony Engine**:
   - Matches warm, cool, and neutral color families with suitable jewelry metals (*Kundan, 22K Gold, Sterling Silver, Platinum, Rose Gold*).
4. **🤖 24/7 Virtual Stylist Chatbot (NVIDIA NIM)**:
   - Deep reasoning AI stylist powered by `moonshotai/kimi-k3` on NVIDIA NIM, with live context injection of the user's current wardrobe and preferences.
5. **🛍️ Interactive Multi-Page Catalog & Shopping Cart**:
   - Dedicated collections for **Dresses**, **Jewellery**, and **Makeup** with PKR pricing and an interactive slide-out cart drawer.
6. **🛡️ Comprehensive Admin Portal**:
   - Complete CRUD catalog management with **direct product image file uploads**, status moderation, user tracking, and analytics.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+ / 3.14, FastAPI, SQLAlchemy 2.0 (Asyncpg), Alembic, Pillow, NumPy, Direct `bcrypt` hashing, HTTPX.
- **Frontend**: React 19, Vite, TailwindCSS v4, React Router 7, Axios, Lucide Icons.
- **Database**: PostgreSQL (standalone `glamiq` database with async connection pooling).
- **AI / LLM Integration**: NVIDIA NIM Cloud API (`https://integrate.api.nvidia.com/v1/chat/completions`) with model `moonshotai/kimi-k3`.
- **Public Tunneling**: Cloudflare Tunnel (`cloudflared`).

---

## 🚀 Step-by-Step Local Setup Guide

Follow these steps to run GlamIQ on any Windows, macOS, or Linux machine.

### 1. Prerequisites
Ensure you have the following installed:
- **Python 3.10+** ([Download Python](https://www.python.org/downloads/))
- **Node.js 18+ & npm** ([Download Node.js](https://nodejs.org/))
- **PostgreSQL 14+** ([Download PostgreSQL](https://www.postgresql.org/download/))
- **Git** ([Download Git](https://git-scm.com/))

---

### 2. Clone the Repository
```bash
git clone https://github.com/glamiq98-cloud/glamiq.git
cd glamiq
```

---

### 3. Create the PostgreSQL Database

Open your terminal or `psql` shell and create a dedicated database named `glamiq`:

```sql
CREATE DATABASE glamiq;
```

---

### 4. Backend Setup & Configuration

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install all required backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` configuration file:
   ```bash
   # Copy from example
   cp .env.example .env
   ```

5. Edit `backend/.env` with your PostgreSQL credentials and NVIDIA API Key:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/glamiq
   JWT_SECRET=super_secure_jwt_secret_key_change_me
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

   # NVIDIA NIM API (Chatbot)
   NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
   NVIDIA_MODEL=moonshotai/kimi-k3
   NVIDIA_API_KEY=nvapi-your_api_key_here
   ```

6. Run Database Migrations (creates all 8 tables):
   ```bash
   alembic upgrade head
   ```

7. Seed Initial Data (Occasions, Jewelry, Makeup & Admin account):
   ```bash
   # Seed default occasions and catalog items
   python seed_fashion_items.py

   # Seed default administrator account
   python seed_admin.py
   ```

8. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The backend API will be live at `http://127.0.0.1:8000` (Interactive Swagger Docs: `http://127.0.0.1:8000/docs`)*.

---

### 5. Frontend Setup & Configuration

1. Open a **second terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install all frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will be live at `http://localhost:5173`*.

---

## 🔑 Default Admin Account Credentials

| Attribute | Value |
|---|---|
| **Admin Portal URL** | `http://localhost:5173/admin/login` |
| **Username** | `admin` |
| **Password** | `admin12345` |

---

## 🌐 Exposing via Cloudflare Tunnel (Optional)

To create an instant, free public HTTPS link accessible from any device or mobile phone:

1. Install `cloudflared` ([Cloudflare Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)).
2. In a third terminal, run:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
3. Cloudflare will print a public HTTPS link (e.g. `https://your-tunnel-name.trycloudflare.com`).

---

## 📁 Repository Structure

```text
glamiq/
├── backend/
│   ├── alembic/                  # Database migration scripts
│   ├── app/
│   │   ├── models/               # SQLAlchemy ORM models (User, Outfit, Item, etc.)
│   │   ├── routers/              # API Route endpoints (auth, outfits, recs, admin, etc.)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Core logic (AI Vision, Recommendation, Chatbot)
│   │   ├── config.py             # Environment configuration settings
│   │   ├── database.py           # Async engine & session factory
│   │   ├── dependencies.py       # Auth & session dependencies
│   │   └── main.py               # FastAPI application entry point
│   ├── uploads/                  # Uploaded profile photos, dresses & product assets
│   ├── seed_fashion_items.py     # Database catalog seeder
│   ├── seed_admin.py             # Admin credentials seeder
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Example environment template
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios HTTP client with JWT interceptor
│   │   ├── components/           # Navbar, CartDrawer, ChatWidget, Footer, etc.
│   │   ├── contexts/             # AuthContext & CartContext
│   │   ├── pages/                # Home, Dresses, Jewellery, Makeup, Analyzer, Stylist
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Luxury Pakistani fashion design tokens
│   │   └── main.jsx              # App root & context providers
│   ├── package.json              # Node.js dependencies
│   └── vite.config.js            # Vite configuration with backend proxy
│
├── .gitignore                    # Git ignore file
└── README.md                     # Documentation & setup guide
```

---

## 🧪 Running Automated Verification Tests

To verify all database connections, the rule-based recommendation engine, and the end-to-end API pipeline:

```bash
cd backend
python test_e2e.py
```

---

## 📄 License
This project is open-source and available under the **MIT License**.
