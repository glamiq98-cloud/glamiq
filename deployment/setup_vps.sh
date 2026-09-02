#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   GlamIQ Contabo VPS Complete Automated Provisioning     "
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Stop background auto-upgrade locks
echo "🛡️ Stopping background upgrade locks..."
systemctl stop unattended-upgrades apt-daily.timer apt-daily-upgrade.timer apt-daily.service apt-daily-upgrade.service 2>/dev/null || true
killall -9 apt apt-get dpkg 2>/dev/null || true
rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock /var/cache/apt/archives/lock
dpkg --configure -a

# 2. Update and install packages
echo "📦 Installing system packages (Python, Nginx, PostgreSQL, Git)..."
apt-get update
apt-get install -y python3 python3-pip python3-venv git nginx postgresql postgresql-contrib curl certbot python3-certbot-nginx

# 3. Install Node.js 20 LTS
echo "⚛️ Installing Node.js 20 LTS..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1)" != "v20" ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "Node: $(node -v), NPM: $(npm -v)"

# 4. Configure PostgreSQL
echo "🐘 Configuring PostgreSQL database..."
systemctl start postgresql
systemctl enable postgresql

DB_PASS="${DB_PASSWORD:-$(openssl rand -hex 16)}"
JWT_SEC="${JWT_SECRET:-$(openssl rand -hex 32)}"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'glamiq'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE glamiq;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'glamiq_user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER glamiq_user WITH ENCRYPTED PASSWORD '$DB_PASS';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE glamiq TO glamiq_user;"
sudo -u postgres psql -c "ALTER DATABASE glamiq OWNER TO glamiq_user;"

# 5. Setup Project Directory & Clone Repo
echo "📁 Setting up project in /var/www/glamiq..."
mkdir -p /var/www/glamiq
if [ ! -d /var/www/glamiq/.git ]; then
  git clone https://github.com/glamiq98-cloud/glamiq.git /var/www/glamiq
else
  cd /var/www/glamiq
  git fetch origin main
  git reset --hard origin/main
fi

# 6. Setup Backend .env (only if not already created)
echo "🔐 Checking backend environment variables..."
if [ ! -f /var/www/glamiq/backend/.env ]; then
cat << EOF > /var/www/glamiq/backend/.env
DATABASE_URL=postgresql+asyncpg://glamiq_user:${DB_PASS}@localhost:5432/glamiq
DATABASE_SCHEMA=glamiq
JWT_SECRET=${JWT_SEC}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://156.67.30.190,http://localhost:3000
OPENAI_API_KEY=
NVIDIA_API_KEY=
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct
EOF
chmod 600 /var/www/glamiq/backend/.env
fi

# 7. Setup Backend Virtual Environment & Dependencies
echo "🐍 Setting up Python venv and installing requirements..."
cd /var/www/glamiq/backend
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

# 8. Seed Database Catalog
echo "🌱 Seeding initial fashion items catalog..."
./venv/bin/python seed_fashion_items.py || echo "Seed completed or already populated"

# 9. Configure & Start Systemd Service
echo "⚙️ Configuring systemd service for FastAPI..."
cat << 'EOF' > /etc/systemd/system/glamiq-backend.service
[Unit]
Description=GlamIQ FastAPI Uvicorn Backend Service
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/var/www/glamiq/backend
EnvironmentFile=/var/www/glamiq/backend/.env
ExecStart=/var/www/glamiq/backend/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=3
KillSignal=SIGQUIT
Type=simple
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable glamiq-backend
systemctl restart glamiq-backend

# 10. Build Frontend Production Bundle
echo "⚛️ Building frontend production bundle..."
cd /var/www/glamiq/frontend
npm ci
npm run build

# 11. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx reverse proxy..."
cat << 'EOF' > /etc/nginx/sites-available/glamiq
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 50M;

    # Frontend Static Build
    location / {
        root /var/www/glamiq/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads (Images) Proxy
    location /uploads/ {
        proxy_pass http://127.0.0.1:8001/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/glamiq /etc/nginx/sites-enabled/glamiq
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 12. Ensure GitHub Actions SSH Deploy Key is ready
echo "🔑 Verifying GitHub Actions Deploy Key..."
mkdir -p /root/.ssh && chmod 700 /root/.ssh
if [ ! -f /root/.ssh/github_actions_deploy ]; then
  ssh-keygen -t ed25519 -N "" -C "github-actions-glamiq" -f /root/.ssh/github_actions_deploy
fi
cat /root/.ssh/github_actions_deploy.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

echo "=========================================================="
echo "🎉 GLAMIQ_DEPLOYMENT_COMPLETE"
echo "=========================================================="
