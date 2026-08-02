# Enterprise Resource Planning (ERP) Platform

## Overview
A modern, scalable, and fully multi-tenant Enterprise Resource Planning (ERP) platform built for small to medium-sized businesses. It empowers organizations to efficiently manage their daily operations across products, sales, customers, suppliers, inventory, expenses, and cash flow. 

## Features
- **Dashboard**: Real-time business insights and operational overview.
- **Product Management**: Track products, variants, and stock thresholds.
- **Customers & Suppliers**: Comprehensive contact and transaction history management.
- **Sales & Purchases**: End-to-end management of sales pipelines, invoicing, and supplier purchasing.
- **Customer Collections & Supplier Payments**: Track accounts receivable, outstanding debts, and vendor settlements.
- **Expenses & Cashbook**: Full visibility into operational expenses and business cash flow.
- **Inventory Management**: Real-time stock alerts and level adjustments.
- **Data Reports**: Exportable data tables and business health metrics.
- **User & Roles Management**: Granular control over employee access and roles.

## Requirements
- Node.js (v18 or higher recommended)
- npm (v9+)
- Turso Database (or SQLite for local development)
- Git

## Environment Variables
Create a `.env.local` file in the root of the project with the following structure:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="ERP Platform"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (Turso / LibSQL)
DATABASE_URL="libsql://your-turso-database-url"
DATABASE_AUTH_TOKEN="your-turso-auth-token"

# Session & Security
SESSION_SECRET="your-32-character-long-secret"
SESSION_MAX_AGE="86400"

# Initial Super Admin Seed (Used on first migration/seed)
SUPER_ADMIN_EMAIL="admin@your-domain.com"
SUPER_ADMIN_PASSWORD="secure_password"

# Logging
LOG_LEVEL="debug"
```

## Installation

1. **Clone repository**
```bash
git clone <repository_url>
cd erp-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create `.env.local` using the template provided in the Environment Variables section.

4. **Run database migrations (if applicable)**
```bash
npm run db:push
# or
npm run db:generate
npm run db:migrate
```

5. **Start development server**
```bash
npm run dev
```

## Build

To compile an optimized production bundle:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

## Project Structure
- `src/app/` - Next.js App Router endpoints, including platform and tenant portals.
- `src/components/` - Global and shared React UI components.
- `src/platform/` - Core multitenancy logic, platform schemas, and super-admin modules.
- `src/shared/` - Shared utilities, global database configurations, and authentication actions.
- `src/templates/` - Isolated UI layouts and logic for different types of business templates (e.g. `egg-tasta`).

## Technology Stack
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database ORM**: Drizzle ORM
- **Database**: Turso (LibSQL/SQLite)
- **Authentication**: Custom Session Management with Argon2 hashing
- **Bundler**: Turbopack

## Authentication & RBAC
The application uses a custom, secure session-based authentication flow backed by HttpOnly and SameSite cookies. It implements granular Role-Based Access Control (RBAC):
- **Super Admins**: Global platform control, capable of managing all businesses and hidden internal admins.
- **Business Owners & Internal Admins**: Complete access to their business portal. Permissions are permanent and automatically granted.
- **Employees**: Fully RBAC-driven. Assigned roles dictate access to specific modules (e.g. `view:products`, `create:sales`). Lacking permissions hides sidebar menus, shortcuts, buttons, dashboard widgets, and blocks direct route/action access with 403.

## Multi-Tenant Architecture
The platform utilizes a robust Row-Level Tenant Isolation approach. Every tenant (business) is assigned a unique UUID. Shared platform tables (like users, roles, products) explicitly include a `tenantId` column. Core server actions dynamically inject the active session's `tenantId` into database queries, securely preventing data leakage between businesses.

## Database
The platform is optimized for **Turso**, a distributed database built on LibSQL (a fork of SQLite). This offers low-latency edge reads, offline capabilities, and excellent developer ergonomics. For local development, standard local SQLite files can also be utilized.

## Troubleshooting

- **Environment variables missing**: Ensure `.env.local` is present in the project root and restart the server after changes.
- **Database connection issues**: Double check your `DATABASE_URL` format. If using Turso, ensure your `DATABASE_AUTH_TOKEN` is valid and hasn't expired.
- **Build errors**: Check for missing TypeScript declarations or deprecated syntax. Run `npm run build` locally before pushing to identify problems.
- **Cache issues (.next)**: Sometimes the build cache can corrupt. If the development environment behaves unexpectedly, stop the server, delete the `.next` and `.turbo` folders, and run `npm run dev` again.
- **Turbopack issues**: Turbopack is incredibly fast but occasionally encounters HMR hiccups. Clear caches or fallback to Webpack if an obscure bug blocks development.

## Development Notes
- **Transactions**: For operations writing to multiple tables (like creating a product variant alongside inventory logs), always utilize Drizzle transactions (`db.transaction(async (tx) => { ... })`).
- **Security**: Never blindly trust client input. Rely on server-side session checks via validation helpers (e.g. `requirePermissionAction()`) before modifying database records.
- **Components**: Adhere strictly to the established design system and use Tailwind CSS for custom styling. Avoid hard-coding inline styles.
