#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   GlamIQ Contabo VPS Automated Environment Provisioning  "
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating apt packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Python, Git, Nginx, PostgreSQL, Curl
echo "🐍 Installing Python, Nginx, PostgreSQL, build-essential..."
sudo apt-get install -y python3 python3-pip python3-venv git nginx postgresql postgresql-contrib curl certbot python3-certbot-nginx

# 3. Install Node.js 20 LTS & npm
echo "⚛️ Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Setup Project Directory
echo "📁 Setting up /var/www/glamiq directory..."
sudo mkdir -p /var/www/glamiq
sudo chown -R $USER:$USER /var/www/glamiq

# 5. Setup PostgreSQL Database
echo "🐘 Configuring PostgreSQL database 'glamiq'..."
sudo -u postgres psql -c "CREATE DATABASE glamiq;" || echo "Database glamiq already exists"
sudo -u postgres psql -c "CREATE USER glamiq_user WITH ENCRYPTED PASSWORD 'GlamIQSecurePass2026!';" || echo "User glamiq_user already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE glamiq TO glamiq_user;"
sudo -u postgres psql -c "ALTER DATABASE glamiq OWNER TO glamiq_user;"

echo "=========================================================="
echo "✅ Server dependencies installed successfully!"
echo "Next step: Clone your repo into /var/www/glamiq and start services."
echo "=========================================================="
