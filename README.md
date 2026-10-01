# Remy Real Estate

Full-stack real estate platform built with **Next.js**, **NestJS**, **PostgreSQL**, **TypeORM**, and **Tailwind CSS**.

## Project Architecture

```
remy_real_estate/
├── Backend/          # NestJS API (Port 4000)
├── Frontend/         # Next.js App Router UI (Port 3000)
└── docker-compose.yml # PostgreSQL DB (Port 5432) & pgAdmin (Port 5050)
```

## Getting Started

### 1. Database Setup (PostgreSQL)

Start the local PostgreSQL container via Docker Compose:

```bash
docker-compose up -d
```

- **PostgreSQL**: `localhost:5432` (User: `postgres`, Password: `postgrespassword`, Database: `remy_real_estate`)
- **pgAdmin**: `http://localhost:5050` (Email: `admin@remy.com`, Password: `adminpassword`)

---

### 2. Backend Setup (NestJS + TypeORM)

Navigate to the `Backend` directory and install dependencies:

```bash
cd Backend
npm install
```

Copy the environment blueprint and configure variables:

```bash
cp .env.example .env
```

Start the NestJS backend dev server:

```bash
npm run start:dev
```

The NestJS server runs on `http://localhost:4000/api`.

#### TypeORM Migrations

- Generate migration: `npm run migration:generate -- src/database/migrations/MigrationName`
- Run migrations: `npm run migration:run`
- Revert migration: `npm run migration:revert`

---

### 3. Frontend Setup (Next.js + Tailwind CSS)

Navigate to the `Frontend` directory and install dependencies:

```bash
cd Frontend
npm install
```

Copy the environment blueprint:

```bash
cp .env.example .env.local
```

Start the Next.js frontend dev server:

```bash
npm run dev
```

The Next.js client runs on `http://localhost:3000`.

---

## Tech Stack Summary

- **Frontend**: Next.js 14+ (App Router), React 18/19, Tailwind CSS v3/v4, TypeScript, Lucide Icons
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport JWT, Class Validator
- **Database**: PostgreSQL 16 managed via Docker Compose
