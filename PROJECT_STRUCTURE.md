# Project Structure: passvault

**Version:** 1.0
**Date:** 2023-10-27

## 1. Introduction

This document outlines the recommended directory and file structure for the **passvault** project. The structure is designed to be logical, scalable, and maintainable, separating concerns between the frontend (client) and backend (server). This guide will serve as a blueprint for development, ensuring all modules and components are placed in a consistent and predictable manner.

## 2. Root Directory Structure

The project root will be a monorepo-style layout, containing separate directories for the client and server applications, along with top-level configuration files.

```
/passvault
├── client/                 # React Frontend Application
├── server/                 # NestJS Backend Application
├── .gitignore              # Specifies intentionally untracked files to ignore
├── docker-compose.yml      # Defines services for local development (e.g., PostgreSQL DB)
├── PROJECT_DOCUMENT.md     # The main project specification document
├── PROJECT_STRUCTURE.md    # This document
└── README.md               # Top-level project README
```

---

## 3. Backend Structure (`server/`)

The backend is a **NestJS** application. The structure follows the standard NestJS conventions, organized by feature modules.

```
/server
├── src/
│   ├── main.ts                     # Application entry point, bootstraps the Nest app
│   ├── app.module.ts               # Root application module
│   │
│   ├── auth/                       # Handles authentication (login, JWT, 2FA)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # API endpoints for /auth/*
│   │   ├── auth.service.ts         # Business logic for authentication
│   │   ├── dto/                    # Data Transfer Objects for auth endpoints
│   │   │   ├── login-user.dto.ts
│   │   │   └── enable-2fa.dto.ts
│   │   └── strategies/             # Passport.js strategies
│   │       └── jwt.strategy.ts     # Strategy to validate JWTs
│   │
│   ├── users/                      # Handles user management (registration, profile)
│   │   ├── users.module.ts
│   │   ├── users.controller.ts     # API endpoints for /users/*
│   │   ├── users.service.ts        # Business logic for user creation and management
│   │   ├── dto/
│   │   │   └── create-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts      # TypeORM/Prisma entity for the 'users' table
│   │
│   ├── vault/                      # Handles CRUD for encrypted vault items
│   │   ├── vault.module.ts
│   │   ├── vault.controller.ts     # API endpoints for /vault/*
│   │   ├── vault.service.ts        # Business logic for storing/retrieving encrypted data
│   │   ├── dto/
│   │   │   ├── create-vault-item.dto.ts
│   │   │   └── create-bulk-items.dto.ts # DTO for batch CSV import
│   │   └── entities/
│   │       └── vault-item.entity.ts # TypeORM/Prisma entity for 'vault_items'
│   │
│   ├── config/                     # Application configuration (env variables, etc.)
│   │   └── configuration.ts
│   │
│   └── shared/                     # Shared modules, services, or utilities
│       ├── guards/
│       │   └── jwt-auth.guard.ts   # Protects routes requiring authentication
│       └── crypto/
│           └── crypto.service.ts   # Backend crypto functions (e.g., Argon2 for hashing)
│
├── test/                           # End-to-end tests
├── .env.example                    # Example environment variables
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

---

## 4. Frontend Structure (`client/`)

The frontend is a **React** application (bootstrapped with Vite). The structure is component-based and organized by feature, promoting reusability and separation of concerns.

```
/client
├── public/                         # Static assets (favicon, etc.)
├── src/
│   ├── main.tsx                    # Application entry point, renders the root component
│   ├── App.tsx                     # Root component, contains router setup
│   ├── index.css                   # Global styles
│   │
│   ├── api/                        # API communication layer
│   │   ├── axios.ts                # Base Axios instance configuration
│   │   ├── authApi.ts              # Functions for auth-related API calls
│   │   └── vaultApi.ts             # Functions for vault-related API calls
│   │
│   ├── assets/                     # Static assets like images, fonts, svgs
│   │
│   ├── components/                 # Reusable React components
│   │   ├── common/                 # Generic components (Button, Input, Modal)
│   │   ├── layout/                 # Layout components (Navbar, Sidebar, PageWrapper)
│   │   └── features/               # Components specific to a feature
│   │       ├── VaultList.tsx
│   │       ├── VaultItem.tsx
│   │       ├── PasswordGenerator.tsx
│   │       └── CsvImporter.tsx     # Component for the CSV upload feature
│   │
│   ├── crypto/                     # Client-side cryptography logic (E2EE)
│   │   ├── encryption.ts           # AES-256-GCM encryption/decryption functions
│   │   └── keyDerivation.ts        # Argon2id key derivation from master password
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Hook for authentication status and actions
│   │   └── useDebounce.ts          # Example utility hook
│   │
│   ├── pages/                      # Page-level components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx       # Main vault view after login
│   │   └── SettingsPage.tsx
│   │
│   ├── routes/                     # Routing configuration
│   │   ├── AppRouter.tsx           # Defines all application routes
│   │   └── ProtectedRoute.tsx      # Wrapper for routes that require authentication
│   │
│   ├── store/                      # Redux Toolkit state management
│   │   ├── store.ts                # Redux store configuration
│   │   └── slices/                 # Feature-based state slices
│   │       ├── authSlice.ts
│   │       ├── vaultSlice.ts
│   │       └── uiSlice.ts          # For managing UI state (modals, themes)
│   │
│   ├── types/                      # TypeScript type definitions and interfaces
│   │   ├── index.ts
│   │   └── vault.ts
│   │
│   └── utils/                      # General utility functions
│
├── index.html                      # Main HTML template for Vite
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts                  # Vite configuration file
```

---

## 5. Development Workflow Guidance

1.  **Backend First:** Begin by scaffolding the `server` application using the NestJS CLI. Create the `users`, `auth`, and `vault` modules with their respective controllers, services, and entities as defined above. Implement the database schema and user registration/login logic first.
2.  **Frontend Scaffolding:** Set up the `client` application using Vite with the React + TypeScript template. Create the folder structure as outlined.
3.  **Authentication Flow:** Implement the user registration and login pages on the frontend. Connect them to the backend API. Implement the client-side key derivation (`crypto/keyDerivation.ts`) as per the security design in `PROJECT_DOCUMENT.md`.
4.  **E2EE Vault:** Once authentication is working, build the core vault functionality.
    - Implement the client-side encryption/decryption logic in `client/src/crypto/encryption.ts`.
    - Build the backend endpoints in the `vault` module to handle the opaque encrypted data blobs.
    - Develop the frontend `DashboardPage` to display, create, edit, and delete vault items, ensuring all encryption/decryption happens only on the client.
5.  **Feature Implementation:** Add features like the Password Generator and CSV Import, creating the necessary components and integrating them into the vault dashboard.
