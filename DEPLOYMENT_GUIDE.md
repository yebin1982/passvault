# Deployment Guide: passvault on Ubuntu 20.04

**Version:** 1.0
**Date:** 2023-10-27

This document provides a step-by-step guide for deploying the **passvault** application to a production server running Ubuntu 20.04. It covers server setup, database configuration, application build, and serving via a reverse proxy.

---

## Table of Contents

1.  [Prerequisites](#1-prerequisites)
2.  [Server Preparation](#2-server-preparation)
3.  [Database Setup (PostgreSQL)](#3-database-setup-postgresql)
4.  [Clone and Build the Application](#4-clone-and-build-the-application)
5.  [Deploy Backend with PM2](#5-deploy-backend-with-pm2)
6.  [Deploy Frontend with Nginx](#6-deploy-frontend-with-nginx)
7.  [Secure with HTTPS (Let's Encrypt)](#7-secure-with-https-lets-encrypt)
8.  [Firewall Configuration](#8-firewall-configuration)

---

## 1. Prerequisites

- A server running a fresh installation of **Ubuntu 20.04**.
- A **domain name** (e.g., `passvault.yourdomain.com`) pointing to your server's public IP address.
- Root or `sudo` access to the server.

## 2. Server Preparation

First, update your server's package list and install essential tools.

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install Git, Nginx (web server), and Node.js (v18.x is recommended)
sudo apt install -y git nginx

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL database
sudo apt install -y postgresql postgresql-contrib
```

## 3. Database Setup (PostgreSQL)

We need to create a dedicated user and database for the `passvault` application.

```bash
# Switch to the postgres user
sudo -i -u postgres

# Open the PostgreSQL prompt
psql

# Inside the psql prompt, run the following SQL commands.
# Replace 'YourSecurePassword' with a strong, unique password.
CREATE DATABASE passvault;
CREATE USER passvault_user WITH PASSWORD 'YourSecurePassword';
GRANT ALL PRIVILEGES ON DATABASE passvault TO passvault_user;

# Exit the psql prompt
\q

# Return to your regular sudo user
exit
```

## 4. Clone and Build the Application

Next, clone the project from your repository and build both the frontend and backend.

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yebin1982/passvault.git
cd passvault

# --- Setup the Backend ---
cd server

# Install backend dependencies
npm install

# Create the production environment file
cp .env.example .env
```

Now, edit the `.env` file using `nano server/.env` and fill in the production values. It should look like this:

```env
# server/.env

# The port the NestJS app will run on. PM2 will manage this.
PORT=3000

# Your PostgreSQL connection string
DATABASE_URL="postgresql://passvault_user:YourSecurePassword@localhost:5432/passvault?schema=public"

# Generate strong, random secrets for JWT
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
JWT_EXPIRATION="1d"
```

```bash
# Build the backend for production
npm run build

# --- Setup the Frontend ---
cd ../client

# Install frontend dependencies
npm install

# Create the production environment file
touch .env
```

Now, edit the frontend `.env` file using `nano client/.env`. This tells the React app where to find the backend API.

```env
# client/.env

# The public URL of your backend API
VITE_API_URL=https://passvault.yourdomain.com/api
```

```bash
# Build the frontend for production
npm run build

# Return to the project root
cd ..
```

## 5. Deploy Backend with PM2

PM2 is a process manager that will keep your NestJS application running continuously.

```bash
# Install PM2 globally
sudo npm install pm2 -g

# Start the backend application using PM2
# The entry point is the 'main.js' file in the 'dist' folder
pm2 start server/dist/main.js --name passvault-api

# Configure PM2 to restart automatically on server reboot
pm2 startup
# (Follow the on-screen instructions to run the generated command)

# Save the current process list
pm2 save
```

## 6. Deploy Frontend with Nginx

Nginx will act as a reverse proxy. It will serve the static React frontend and forward all API requests (`/api/*`) to the backend service running on port 3000.

Create a new Nginx configuration file.

```bash
sudo nano /etc/nginx/sites-available/passvault
```

Paste the following configuration into the file. **Replace `passvault.yourdomain.com` with your actual domain.**

```nginx
# /etc/nginx/sites-available/passvault

server {
    listen 80;
    server_name passvault.yourdomain.com;

    # Path to the built React app
    root /root/passvault/client/dist; # Adjust path if you cloned elsewhere
    index index.html;

    # Route for the backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle client-side routing for the SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Now, enable the site and restart Nginx.

```bash
# Create a symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/passvault /etc/nginx/sites-enabled/

# Test the Nginx configuration for errors
sudo nginx -t

# Restart Nginx to apply the changes
sudo systemctl restart nginx
```

## 7. Secure with HTTPS (Let's Encrypt)

It is **critical** to serve a password manager over HTTPS. We will use Certbot to get a free SSL certificate from Let's Encrypt.

```bash
# Install Certbot and its Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install the SSL certificate
sudo certbot --nginx -d passvault.yourdomain.com

# Follow the prompts. It will ask if you want to redirect HTTP to HTTPS.
# Choose the redirect option to enforce security.
```

Certbot will automatically update your Nginx configuration and set up a cron job to renew the certificate before it expires.

## 8. Firewall Configuration

Finally, configure the firewall to only allow necessary traffic.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full' # Allows both HTTP and HTTPS
sudo ufw enable
```

Your **passvault** application is now deployed and accessible at `https://passvault.yourdomain.com`.
