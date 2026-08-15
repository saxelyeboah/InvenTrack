# 📦 InvenTrack — Retail ERP & Inventory Management System

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-emerald?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-v4.19-sky?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/React-v18.3-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-v5.4-purple?style=for-the-badge&logo=vite)
![SQLite](https://img.shields.io/badge/SQLite-node:sqlite-003B57?style=for-the-badge&logo=sqlite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15%2B-4169E1?style=for-the-badge&logo=postgresql)

A modern, full-stack Retail Inventory Management & Point-of-Sale (POS) System built with Node.js, Express, React, and TailwindCSS. Features dual-database compatibility (Zero-Config local SQLite or Managed Cloud PostgreSQL), real-time stock deduction, thermal receipt printing, and role-based access control.

---

## ✨ Features

- **🛒 Rapid Counter Sales (POS)**: Interactive billing cart with stock checks, automatic line-item totals, and quick product access.
- **📄 Branded Thermal Receipt Engine**: Dedicated receipt printing popup engine formatted for 80mm thermal printers.
- **📦 Inventory Catalog & Stock Movements**: Complete stock audit trail (`Stock In`, `Stock Out`, `Adjustment`), reorder threshold warnings, and real-time activity ranking.
- **🏬 Supplier Directory**: Vendor directory with contact records and 1-click supplier management.
- **🔒 Security & Sanitization**: Comprehensive input sanitization (XSS protection), phone digit validation, price bounds enforcement, and bcrypt password hashing.
- **🚫 Real-Time Auto-Logout**: Automatic session clearing when a user account is deactivated by an Administrator.
- **💾 Dual-Database Architecture**: Automatically runs zero-config embedded SQLite (`inventrack.db`) locally when PostgreSQL is not connected, with smooth failover.
- **📊 Reports & CSV Export**: Export Stock Level, Stock Movement Audit, and Sales Summaries directly to CSV files.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**

---

## 🚀 Quick Start Guide

Follow these steps to set up and run InvenTrack on your local machine:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/saxelyeboah/ug-guy.git
cd ug-guy
```

### 2️⃣ Install Dependencies
InvenTrack uses a monorepo structure. Run the root install command to install backend and frontend dependencies:
```bash
npm run install:all
```
*(Or install manually: `npm install`, `cd backend && npm install`, `cd frontend && npm install`)*.

---

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

#### Environment Configuration Options:

##### **Option A: Zero-Config Local SQLite (Recommended for Local Dev)**
Leave `DATABASE_URL` commented out or blank. InvenTrack will automatically create and use `backend/inventrack.db`.

```env
PORT=5000
JWT_SECRET=inventrack_super_secret_jwt_key_2026
NODE_ENV=development
# DATABASE_URL=   <-- Leave empty for SQLite
```

##### **Option B: Cloud / Local PostgreSQL**
Uncomment and set `DATABASE_URL`:
```env
PORT=5000
JWT_SECRET=inventrack_super_secret_jwt_key_2026
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/inventrack_db
```

---

### 4️⃣ Seed Initial Demo Data
Run the migration and seeding script to set up database tables and populate initial categories, products, and admin accounts:

```bash
npm run seed
```

> **Default Seeded Accounts:**
> - **Admin Account**: Email `admin@inventrack.com` | Password: `Admin@123`
> - **Staff Account**: Email `staff@inventrack.com` | Password: `Staff@123`

---

### 5️⃣ Run the Application locally
Start both backend (Express) and frontend (Vite) dev servers concurrently with a single command:

```bash
npm run dev
```

Open your browser and navigate to:
- 🌐 **Frontend Application**: `http://localhost:3000` (or `http://localhost:5173`)
- ⚙️ **Backend API Status**: `http://localhost:5000/api/health`

---

## 📁 Project Structure Overview

```text
ug-guy/
├── backend/
│   ├── inventrack.db          # Embedded SQLite database (Auto-created)
│   ├── src/
│   │   ├── controllers/       # HTTP Request Handlers
│   │   ├── db/                # Database driver (SQLite & PostgreSQL adapter)
│   │   ├── middleware/        # JWT Auth, Role checking, Error handling
│   │   ├── repositories/      # SQL Data Access Layer
│   │   ├── routes/            # Express API Endpoint Routes
│   │   ├── services/          # Core Business & Transaction Logic
│   │   ├── utils/             # Input Sanitizers & Regex Validators
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # API server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client with Auth Interceptors
│   │   ├── components/        # Layout, Navbar, Sidebar, Modals
│   │   ├── context/           # AuthContext (State & Token management)
│   │   ├── pages/             # Dashboard, Sales, Products, Stock, Reports, Users, Suppliers, Login
│   │   ├── App.jsx            # React Router & Protected Routes
│   │   └── index.css          # Tailwind CSS styling tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json               # Root monorepo script coordinator
└── README.md
```

---

## 📜 Available NPM Scripts

From the root project folder, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Runs both Backend (`http://localhost:5000`) and Frontend (`http://localhost:3000`) concurrently. |
| `npm run start:backend` | Runs only the Express backend server. |
| `npm run dev:frontend` | Runs only the Vite frontend dev server. |
| `npm run install:all` | Installs root, backend, and frontend dependencies. |
| `npm run seed` | Seeds database tables and initial demo records. |
| `npm run build:frontend` | Builds production bundle for frontend in `frontend/dist`. |

---

## 🔐 Security & Validation Standards

- **Password Hashing**: Passwords are hashed using `bcryptjs` with salt rounds = 10.
- **JWT Authentication**: Bearer tokens with 24-hour expiration.
- **Input Sanitization**: XSS string sanitization stripping script tags.
- **Role Guards**: Admin-only routes (`/api/users`, `/api/suppliers`, category deletion) enforced on both API middleware and UI components.

---

## 👤 Author

**saxelyeboah**
- 📧 Email: [saxelyeboah@gmail.com](mailto:saxelyeboah@gmail.com)
- 🐙 GitHub: [@saxelyeboah](https://github.com/saxelyeboah)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
