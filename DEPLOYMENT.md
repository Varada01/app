# 🚀 Deployment Guide

This guide covers deploying your Channel Funding Platform to **Railway** (recommended for simplicity) or **AWS Free Tier**.

---

## 📋 Prerequisites

Your app requires:
- **Backend**: Python 3.10+ with FastAPI
- **Frontend**: React (Node.js 18+)
- **Database**: MongoDB

---

## 🎯 Option 1: Deploy to Railway (Recommended - Easiest)

Railway offers free tier with $5 monthly credit and MongoDB hosting.

### Step 1: Setup MongoDB on Railway

1. Go to [Railway](https://railway.app/) and sign up/login
2. Click **"New Project"** → **"Provision MongoDB"**
3. Once created, go to **MongoDB service** → **Variables** tab
4. Copy the `MONGO_URL` (it looks like: `mongodb://mongo:PASSWORD@mongodb.railway.internal:27017`)

### Step 2: Deploy Backend

1. In Railway, click **"New"** → **"GitHub Repo"**
2. Select your `Varada01/app` repository
3. Railway will auto-detect and deploy using the `railway.json` config

4. **Set Environment Variables**:
   - Click your service → **Variables** tab
   - Add these variables:
     ```
     MONGO_URL=<paste-your-mongodb-url-from-step-1>
     DB_NAME=channelfunding
     JWT_SECRET_KEY=<generate-random-secure-key>
     CORS_ORIGINS=*
     PORT=8000
     ```

5. **Generate JWT Secret**: Run this in PowerShell to create a secure key:
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

6. Railway will automatically deploy. Click **"Deployments"** to see logs.

### Step 3: Get Your API URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://your-app.up.railway.app`)

### Step 4: Deploy Frontend (Optional)

If you want to deploy the frontend separately:
1. Create another service in Railway
2. Add these build settings:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npx serve -s build -p $PORT`
3. Set environment variable:
   ```
   REACT_APP_API_URL=<your-backend-url-from-step-3>
   ```

### ✅ Railway Deployment Complete!

Your API will be live at: `https://your-app.up.railway.app/api`

Test it: `https://your-app.up.railway.app/api/channels`

---

## 🎯 Option 2: Deploy to AWS Free Tier

AWS Free Tier includes EC2, but requires more setup.

### Architecture:
- **EC2 t2.micro**: Host backend + frontend
- **MongoDB Atlas**: Free tier database (512MB)
- **Nginx**: Reverse proxy

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0 - 512MB)
3. **Database Access**: Create a user with password
4. **Network Access**: Add `0.0.0.0/0` (allow from anywhere)
5. Click **"Connect"** → **"Connect your application"**
6. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

### Step 2: Launch EC2 Instance

1. Login to [AWS Console](https://console.aws.amazon.com/)
2. Go to **EC2** → **Launch Instance**
3. Choose:
   - **AMI**: Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance Type**: t2.micro
   - **Key Pair**: Create new or use existing
   - **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (API)
4. Launch and wait for instance to start

### Step 3: Connect to EC2

```powershell
# Download your .pem key file
ssh -i "your-key.pem" ubuntu@<your-ec2-public-ip>
```

### Step 4: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10
sudo apt install python3.10 python3-pip python3-venv -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y

# Install Nginx
sudo apt install nginx -y
```

### Step 5: Clone and Setup Application

```bash
# Clone your repo
cd /home/ubuntu
git clone https://github.com/Varada01/app.git
cd app

# Setup Python backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup React frontend
cd frontend
npm install
npm run build
cd ..
```

### Step 6: Create Environment File

```bash
# Create .env file for backend
nano backend/.env
```

Add these variables:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=channelfunding
JWT_SECRET_KEY=your-very-secure-random-key-here
CORS_ORIGINS=*
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Step 7: Setup Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/channelfunding.service
```

Add this content:
```ini
[Unit]
Description=Channel Funding API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/app/backend
Environment="PATH=/home/ubuntu/app/backend/venv/bin"
ExecStart=/home/ubuntu/app/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable channelfunding
sudo systemctl start channelfunding
sudo systemctl status channelfunding
```

### Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/channelfunding
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name <your-ec2-public-ip>;

    # Serve React frontend
    location / {
        root /home/ubuntu/app/frontend/build;
        try_files $uri /index.html;
    }

    # Proxy API requests to FastAPI
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/channelfunding /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com
```

### ✅ AWS Deployment Complete!

Your app is now live at:
- **Frontend**: `http://<your-ec2-ip>`
- **API**: `http://<your-ec2-ip>/api`

---

## 🧪 Testing Deployment

Test your API endpoints:

```bash
# Health check (if you add one)
curl https://your-app.up.railway.app/

# Get channels
curl https://your-app.up.railway.app/api/channels

# Register user
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "user_type": "creator"
  }'
```

---

## 🔧 Troubleshooting

### Railway Issues:
- **Build fails**: Check deployment logs in Railway dashboard
- **MongoDB connection error**: Verify `MONGO_URL` is correct in variables
- **CORS errors**: Add your frontend URL to `CORS_ORIGINS`

### AWS Issues:
- **Can't connect**: Check EC2 security group allows port 8000 and 80
- **Service not running**: Check logs with `sudo journalctl -u channelfunding -f`
- **Nginx 502 error**: Ensure backend is running on port 8000

---

## 💰 Cost Comparison

| Platform | Free Tier | Limits | Best For |
|----------|-----------|--------|----------|
| **Railway** | $5/month credit | 500 hours/month | Quick deployment, easy scaling |
| **AWS EC2** | 750 hours/month (12 months) | 1 GB RAM, 30 GB storage | Long-term free hosting |
| **MongoDB Atlas** | 512 MB storage | Shared cluster | Both options |

---

## 🚀 Next Steps

1. **Add Health Check Endpoint**: Add a `/health` route to verify service status
2. **Setup CI/CD**: Connect GitHub Actions for auto-deploy on push
3. **Monitor Logs**: Use Railway logs or CloudWatch (AWS)
4. **Scale**: Upgrade plan when you hit free tier limits
5. **Custom Domain**: Point your domain to Railway or EC2 IP

---

## 📝 Important Notes

- **Environment Variables**: Never commit `.env` files to Git
- **JWT Secret**: Use a strong random key (minimum 32 characters)
- **CORS**: In production, replace `*` with your actual frontend domain
- **Database**: Backup your MongoDB regularly
- **Security**: Always use HTTPS in production

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app/
- AWS EC2 Guide: https://docs.aws.amazon.com/ec2/
- MongoDB Atlas: https://docs.atlas.mongodb.com/

Good luck with your deployment! 🎉
