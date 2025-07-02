# Database Setup Guide: passvault

**Version:** 1.0
**Date:** 2023-10-27

This document provides a step-by-step guide for setting up the PostgreSQL database and creating the necessary tables for the **passvault** project using Prisma ORM.

---

## Overview

This project uses **PostgreSQL** as its database and **Prisma** as its Object-Relational Mapper (ORM). Prisma uses the schema defined in `server/prisma/schema.prisma` as the single source of truth for your database tables. You will not need to write raw SQL to create the tables; Prisma handles this for you.

The process involves three main steps:

1.  Running a PostgreSQL instance.
2.  Creating a `.env` file to configure the database connection.
3.  Running a Prisma command to create and apply a migration.

---

## Step 1: Run PostgreSQL

You need a running PostgreSQL server. For local development, the easiest method is to use Docker.

1.  Make sure you have Docker installed and running on your system.
2.  Create a `docker-compose.yml` file in the root of the `passvault` project with the following content. This will create a PostgreSQL container with a persistent volume for your data.

    ```yaml
    # docker-compose.yml
    version: "3.8"
    services:
      postgres:
        image: postgres:15
        container_name: passvault-db
        restart: always
        ports:
          - "5432:5432"
        environment:
          POSTGRES_USER: passvault_user
          POSTGRES_PASSWORD: YourSecurePassword
          POSTGRES_DB: passvault
        volumes:
          - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:
    ```

3.  Open your terminal in the project root and run the following command to start the database server:

    ```bash
    docker-compose up -d
    ```

Your PostgreSQL database is now running.

## Step 2: Configure the Database Connection

The NestJS server needs to know how to connect to this database.

1.  Navigate to the `server` directory: `cd server`
2.  Create a new file named `.env`.
3.  Add the following connection string to the `.env` file. This must match the credentials you set in `docker-compose.yml`.

    ```env
    # server/.env
    DATABASE_URL="postgresql://passvault_user:YourSecurePassword@localhost:5432/passvault?schema=public"
    ```

## Step 3: Create and Apply the Database Schema

Now you will use Prisma to create the `users` and `vault_items` tables based on the `prisma/schema.prisma` file.

1.  Make sure you are in the `server` directory in your terminal.
2.  If you haven't already, install the dependencies: `npm install`.
3.  Run the Prisma migrate command:

    ```bash
    npm run prisma:dev:migrate
    ```

This command will:

- Create a new SQL migration file in the `server/prisma/migrations` directory.
- **Apply that migration to your database**, creating the `User` and `VaultItem` tables with all the specified columns.

Your database is now fully set up and ready for the application to connect to it. You can verify the tables were created by connecting to the database with a client like DBeaver or `psql`.
