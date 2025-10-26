#!/bin/bash
# AWS EC2 Deployment Script for Channel Funding Platform
# Run this script on your EC2 instance after connecting via SSH

set -e  # Exit on error

echo "🚀 Starting deployment of Channel Funding Platform..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.10
echo "🐍 Installing Python 3.10..."
sudo apt install -y python3.10 python3-pip python3-venv

# Install Node.js 18
echo "📗 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📚 Installing Git..."
sudo apt install -y git

# Clone repository
echo "📥 Cloning repository..."
cd /home/ubuntu
if [ -d "app" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd app
    git pull origin main
    cd ..
else
    git clone https://github.com/Varada01/app.git
fi

cd app

# Setup Python backend
echo "🔧 Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

# Setup React frontend
echo "⚛️ Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Create .env file
echo "📝 Creating environment configuration..."
cat > backend/.env << 'EOF'
# MongoDB Atlas connection (UPDATE THIS!)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=channelfunding

# JWT Secret (CHANGE THIS to a random string!)
JWT_SECRET_KEY=change-this-to-a-very-secure-random-key-minimum-32-characters

# CORS (Update with your domain in production)
CORS_ORIGINS=*
EOF

echo "⚠️  IMPORTANT: Edit backend/.env and update MONGO_URL and JWT_SECRET_KEY!"

# Create systemd service
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/channelfunding.service > /dev/null << 'EOF'
[Unit]
Description=Channel Funding Platform API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/app/backend
Environment="PATH=/home/ubuntu/app/backend/venv/bin"
ExecStart=/home/ubuntu/app/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/channelfunding > /dev/null << EOF
server {
    listen 80;
    server_name $PUBLIC_IP;

    # Serve React frontend
    location / {
        root /home/ubuntu/app/frontend/build;
        try_files \$uri /index.html;
    }

    # Proxy API requests to FastAPI backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/channelfunding /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
echo "🎬 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable channelfunding
sudo systemctl start channelfunding
sudo systemctl restart nginx

# Check status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
sudo systemctl status channelfunding --no-pager
echo ""
echo "🌍 Your application is now available at:"
echo "   Frontend: http://$PUBLIC_IP"
echo "   API:      http://$PUBLIC_IP/api/channels"
echo ""
echo "⚠️  Next Steps:"
echo "1. Edit /home/ubuntu/app/backend/.env with your MongoDB URL"
echo "2. Run: sudo systemctl restart channelfunding"
echo "3. Test: curl http://$PUBLIC_IP/api/channels"
echo ""
echo "📝 Useful Commands:"
echo "   View logs: sudo journalctl -u channelfunding -f"
echo "   Restart:   sudo systemctl restart channelfunding"
echo "   Stop:      sudo systemctl stop channelfunding"
echo ""
