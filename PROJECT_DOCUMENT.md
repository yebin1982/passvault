# Project Document: passvault

**Version:** 1.0
**Date:** 2023-10-27

## 1. Executive Summary

**passvault** is a modern, secure, and user-friendly web application designed to store, manage, and protect a user's sensitive information, such as passwords, credit card details, and secure notes. The core architectural principle is a **zero-knowledge, end-to-end encrypted (E2EE)** system. This ensures that only the user, with their unique master password, can ever access their data. The server stores only encrypted data blobs, making it impossible for developers, administrators, or any malicious actor who might compromise the server to read the user's secrets.

The application will feature a decoupled frontend and backend, a beautiful and responsive user interface, and robust user management, all built on a foundation of the industry's most secure practices.

---

## 2. Project Scope and Objectives

### 2.1. Goal

To create a world-class, highly secure, and intuitive password vault web application that gives users complete control and privacy over their digital secrets.

### 2.2. Objectives

- **User Management:** Implement a complete user lifecycle management system, including secure registration, login, and account recovery.
- **Decoupled Architecture:** Develop a separate frontend (client-side) and backend (server-side) to ensure flexibility, scalability, and a clean separation of concerns.
- **Secure Data Storage:** Design a database schema that securely stores encrypted user data, ensuring strict data isolation between users.
- **Modern UI/UX:** Create a visually appealing, responsive, and intuitive user interface that works seamlessly across desktop and mobile devices.
- **State-of-the-Art Security:** Implement a zero-knowledge architecture using end-to-end encryption, strong cryptographic algorithms, and multi-factor authentication.

---

## 3. System Architecture

The application will be built using a modern, decoupled architecture.

### 3.1. Frontend (Client-Side)

The frontend will be a Single Page Application (SPA) responsible for all UI rendering and client-side cryptography.

- **Framework:** **React** (with Create React App or Vite) for building a dynamic and component-based UI.
- **UI Library:** **Material-UI (MUI)** or **Tailwind CSS** to create a beautiful, modern, and responsive design system.
- **Cryptography:** **`crypto.subtle`** (Web Crypto API) for all encryption/decryption and key derivation operations. This is a native browser API, which is more secure than third-party libraries.
- **State Management:** **Redux Toolkit** for predictable and scalable state management.
- **Communication:** **Axios** for making secure HTTPS requests to the backend API.

### 3.2. Backend (Server-Side)

The backend will serve as a stateless API, responsible for user authentication and storing/retrieving encrypted data blobs. It will have no knowledge of the user's master password or unencrypted data.

- **Framework:** **Node.js** with **NestJS**. NestJS provides a structured, scalable architecture out-of-the-box, perfect for enterprise-grade applications.
- **API:** A **RESTful API** will be exposed for the frontend to consume. All endpoints will be secured.
- **Authentication:** **JSON Web Tokens (JWT)** will be used for managing user sessions in a stateless manner.
- **Database ORM:** **TypeORM** or **Prisma** for interacting with the database in a type-safe way.

### 3.3. Database

A relational database is ideal for this project due to its structured nature and reliability.

- **System:** **PostgreSQL** is recommended for its robustness, security features, and performance.
- **Schema Design:** Instead of creating separate tables for each user (which is inefficient and doesn't scale), we will use a multi-tenant data architecture. A single set of tables will house all users' data, with each row being strictly associated with a `userId`.

#### **Database Tables:**

**`users`**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Hash of the master password, used for authentication only.
    master_password_hash VARCHAR(255) NOT NULL,
    -- Salt for the master password hash.
    master_password_salt VARCHAR(255) NOT NULL,
    -- Salt used to derive the encryption key on the client.
    encryption_key_salt VARCHAR(255) NOT NULL,
    -- Encrypted secret for enabling TOTP-based 2FA.
    mfa_secret_encrypted VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**`vault_items`**

```sql
CREATE TABLE vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- The user's encrypted vault data. The server cannot decrypt this.
    encrypted_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Security Design ("Most Secure Solutions")

Security is the most critical aspect of this project. The following measures will be implemented to ensure the highest level of protection.

### 4.1. Zero-Knowledge & End-to-End Encryption (E2EE)

1.  **Master Password:** The user's master password is the key to everything. **It is never, under any circumstance, sent to the server.**
2.  **Key Derivation:** On the client-side (in the browser), the master password and a unique `encryption_key_salt` (fetched from the server) are fed into a strong Key Derivation Function, **Argon2id**. This function is computationally expensive and resistant to brute-force, GPU, and ASIC attacks.
3.  **Encryption Key:** The output of Argon2id is the user's main **Encryption Key**. This key exists only in the browser's memory during an active session.
4.  **Data Encryption:** When a user saves or edits a secret, the data is encrypted on the client-side using **AES-256-GCM** with the Encryption Key. AES-256-GCM is an authenticated encryption standard that provides both confidentiality and integrity.
5.  **Data Storage:** The resulting encrypted data blob is what gets sent to the backend and stored in the `vault_items` table. The server cannot read it.
6.  **Data Decryption:** When a user views their secrets, the encrypted blob is fetched from the server, and decrypted locally in the browser using the same Encryption Key.

### 4.2. Authentication

- **Login:** To log in, the user enters their master password. The client derives a separate hash using the master password and the `master_password_salt`. This hash is sent to the server to be compared with the stored `master_password_hash`. This process authenticates the user without ever exposing the master password.
- **Two-Factor Authentication (2FA):** Users can enable 2FA using a TOTP (Time-based One-Time Password) app like Google Authenticator or Authy. The 2FA secret will itself be encrypted and stored in the database.
- **Transport Security:** All communication between the client and server must be over **HTTPS (TLS 1.2+)** to prevent man-in-the-middle attacks.

---

## 5. Functional Requirements

### 5.1. User Management

- **Registration:** New user creation with email and a strong master password.
- **Login:** Secure user authentication.
- **2FA:** Ability to enable and disable Time-based One-Time Password (TOTP) 2FA.
- **Logout:** Securely terminate the user session and clear all sensitive data from memory.
- **Account Recovery:** A secure mechanism for account recovery will be investigated, but due to the zero-knowledge model, password reset is not possible. A "recovery kit" or similar method might be implemented.

### 5.2. Vault Features

- **CRUD for Secrets:** Create, Read, Update, and Delete vault items (logins, secure notes, etc.).
- **Password Generator:** A strong, configurable password generator (length, characters, symbols).
- **Search & Filtering:** Instantly search and filter vault items.
- **Organization:** Ability to organize items into folders or categories.
- **Copy to Clipboard:** Securely copy usernames and passwords to the clipboard with an automatic clear-out timer.

### 5.3. UI/UX ("Beautiful Modern UI")

- **Responsive Design:** The interface will be fully responsive, providing an optimal experience on desktops, tablets, and mobile phones.
- **Intuitive Layout:** A clean, minimalist, and easy-to-navigate layout.
- **Accessibility:** Adherence to WCAG guidelines to ensure the app is usable by people with disabilities.
- **Themes:** Offer both light and dark mode themes for user comfort.

---

## 6. High-Level Roadmap

1.  **Phase 1: Foundation & Backend**

    - Setup project structure, CI/CD pipeline.
    - Develop backend API for user registration and login (without E2EE).
    - Design and implement the database schema.

2.  **Phase 2: Frontend & Core Authentication**

    - Develop frontend for registration and login pages.
    - Implement client-side logic for key derivation and authentication.
    - Integrate frontend and backend authentication flow.

3.  **Phase 3: End-to-End Encryption & Vault**

    - Implement client-side encryption/decryption logic.
    - Develop backend endpoints for CRUD operations on encrypted vault data.
    - Build the main vault UI for displaying, creating, and editing items.

4.  **Phase 4: Feature Enhancement & UI Polish**

    - Implement the password generator, search functionality, and 2FA.
    - Refine the entire UI/UX for a polished, professional feel.
    - Implement light/dark themes.

5.  **Phase 5: Testing & Deployment**
    - Conduct thorough end-to-end testing and security audits.
    - Prepare for production deployment.
    - Deploy the application and monitor performance.
