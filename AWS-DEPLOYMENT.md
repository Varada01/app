# 🚀 AWS EC2 Deployment Guide

Complete step-by-step guide to deploy your Channel Funding Platform on AWS Free Tier.

---

## 📋 What You'll Get

- ✅ **Free hosting** for 12 months (750 hours/month EC2)
- ✅ **Backend + Frontend** on same server
- ✅ **Auto-restart** on crashes
- ✅ **Nginx reverse proxy** for production-ready setup
- ✅ **MongoDB Atlas** (free 512MB database)

**Total Cost: $0** (for first year with AWS Free Tier)

---

## 🎯 Step 1: Setup MongoDB Atlas (Free Database)

1. **Go to** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create free account** and login

3. **Create a Cluster**:
   - Click **"Build a Database"**
   - Select **"M0 FREE"** tier
   - Choose a cloud provider (AWS) and region (closest to you)
   - Click **"Create"**

4. **Create Database User**:
   - Go to **"Database Access"** (left sidebar)
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Username: `channelfunding`
   - Password: Generate a secure password (SAVE THIS!)
   - Set privileges to **"Read and write to any database"**
   - Click **"Add User"**

5. **Allow Network Access**:
   - Go to **"Network Access"** (left sidebar)
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
   - Click **"Confirm"**

6. **Get Connection String**:
   - Go to **"Database"** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string:
     ```
     mongodb+srv://channelfunding:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **IMPORTANT**: Replace `<password>` with your actual password!
   - **SAVE THIS** - you'll need it later!

---

## 🎯 Step 2: Launch AWS EC2 Instance

1. **Login to AWS**:
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Sign up for free tier if you don't have an account

2. **Go to EC2**:
   - Search for **"EC2"** in the top search bar
   - Click **"EC2"** to open the dashboard

3. **Launch Instance**:
   - Click **"Launch Instance"** button

4. **Configure Instance**:

   **Name**: `channelfunding-app`

   **Application and OS Images**:
   - Select **"Ubuntu"**
   - Choose **"Ubuntu Server 22.04 LTS"** (Free tier eligible)

   **Instance Type**:
   - Select **"t2.micro"** (Free tier eligible - 1GB RAM)

   **Key Pair**:
   - Click **"Create new key pair"**
   - Name: `channelfunding-key`
   - Type: **RSA**
   - Format: **`.pem`** (for SSH) or **`.ppk`** (if using PuTTY on Windows)
   - Click **"Create key pair"**
   - **SAVE THE FILE** - you can't download it again!

   **Network Settings**:
   - Click **"Edit"**
   - Enable **"Auto-assign public IP"**
   - Create security group:
     - Name: `channelfunding-sg`
     - Description: `Security group for Channel Funding app`
     
   - **Add these rules** (click "Add security group rule" for each):
     - **Rule 1**: SSH
       - Type: `SSH`
       - Port: `22`
       - Source: `My IP` (or `0.0.0.0/0` to allow from anywhere)
     
     - **Rule 2**: HTTP
       - Type: `HTTP`
       - Port: `80`
       - Source: `0.0.0.0/0` (allow from anywhere)
     
     - **Rule 3**: HTTPS (optional, for future SSL)
       - Type: `HTTPS`
       - Port: `443`
       - Source: `0.0.0.0/0`
     
     - **Rule 4**: Custom TCP (for backend testing)
       - Type: `Custom TCP`
       - Port: `8000`
       - Source: `0.0.0.0/0`

   **Storage**:
   - Keep default: **30 GB** gp3 (Free tier eligible)

5. **Launch**:
   - Review and click **"Launch Instance"**
   - Wait 2-3 minutes for instance to start

6. **Get Public IP**:
   - Go to **"Instances"** in the left menu
   - Select your instance
   - Copy the **"Public IPv4 address"** (e.g., `54.123.45.67`)
   - **SAVE THIS IP** - you'll need it!

---

## 🎯 Step 3: Connect to EC2 Instance

### Option A: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
# Navigate to where you saved the .pem file
cd Downloads

# Set correct permissions (important!)
icacls channelfunding-key.pem /inheritance:r
icacls channelfunding-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect via SSH (replace with YOUR public IP)
ssh -i channelfunding-key.pem ubuntu@54.123.45.67
```

### Option B: Using PuTTY (Windows)

1. Open **PuTTY**
2. Host Name: `ubuntu@54.123.45.67` (your IP)
3. Port: `22`
4. Connection → SSH → Auth → Browse for your `.ppk` file
5. Click **"Open"**

### Option C: Using WSL/Git Bash (Windows)

```bash
chmod 400 channelfunding-key.pem
ssh -i channelfunding-key.pem ubuntu@54.123.45.67
```

**First time**: Type `yes` to accept the fingerprint

---

## 🎯 Step 4: Run Automated Deployment Script

Once connected to EC2, run these commands:

```bash
# Download the deployment script
curl -o deploy-aws.sh https://raw.githubusercontent.com/Varada01/app/main/deploy-aws.sh

# Make it executable
chmod +x deploy-aws.sh

# Run the script (this will take 5-10 minutes)
./deploy-aws.sh
```

The script will automatically:
- ✅ Install Python, Node.js, Nginx
- ✅ Clone your repository
- ✅ Install all dependencies
- ✅ Build the React frontend
- ✅ Setup systemd service for auto-restart
- ✅ Configure Nginx reverse proxy
- ✅ Start everything

---

## 🎯 Step 5: Configure Environment Variables

After the script finishes, you need to add your MongoDB connection string:

```bash
# Edit the .env file
nano /home/ubuntu/app/backend/.env
```

**Update these values**:
```env
# Replace with your MongoDB Atlas connection string from Step 1
MONGO_URL=mongodb+srv://channelfunding:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/

# Database name
DB_NAME=channelfunding

# Generate a secure random key (or use the one below)
JWT_SECRET_KEY=a7f9k2m5p8q1r4t6v9w2x5y8z1b4c7e0f3g6h9j2k5m8n1p4q7r0s3t6u9v2w5x8

# CORS (use * for now, or your domain in production)
CORS_ORIGINS=*
```

**Save and exit**:
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**Restart the service**:
```bash
sudo systemctl restart channelfunding
```

---

## 🎯 Step 6: Test Your Deployment

### Test Backend API:
```bash
# From EC2 terminal
curl http://localhost:8000/api/channels

# From your computer (replace with YOUR EC2 IP)
curl http://54.123.45.67/api/channels
```

### Test Frontend:
Open browser and go to:
```
http://54.123.45.67
```

You should see your React app! 🎉

### Test Registration:
```bash
curl -X POST http://54.123.45.67/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "user_type": "creator"
  }'
```

---

## 🔧 Useful Commands

### Check Service Status:
```bash
sudo systemctl status channelfunding
```

### View Real-time Logs:
```bash
sudo journalctl -u channelfunding -f
```

### Restart Service:
```bash
sudo systemctl restart channelfunding
```

### Stop Service:
```bash
sudo systemctl stop channelfunding
```

### Start Service:
```bash
sudo systemctl start channelfunding
```

### Check Nginx Status:
```bash
sudo systemctl status nginx
```

### Update Code (pull latest changes):
```bash
cd /home/ubuntu/app
git pull origin main
cd frontend
npm run build
cd ../backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
sudo systemctl restart channelfunding
```

---

## 🌐 (Optional) Step 7: Add Custom Domain

If you have a domain name:

1. **Point Domain to EC2**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add an **A Record**:
     - Name: `@` (or subdomain like `api`)
     - Value: Your EC2 Public IP
     - TTL: 300

2. **Update Nginx Config**:
   ```bash
   sudo nano /etc/nginx/sites-available/channelfunding
   ```
   
   Change this line:
   ```nginx
   server_name your-ec2-ip;
   ```
   
   To:
   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```

3. **Install SSL Certificate** (Free with Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

4. **Test**:
   ```bash
   https://yourdomain.com
   ```

---

## 🔒 Security Best Practices

1. **Change JWT Secret**:
   - Generate a strong random key
   - Never commit it to Git

2. **Update CORS in Production**:
   - Replace `CORS_ORIGINS=*` with your actual domain
   - Example: `CORS_ORIGINS=https://yourdomain.com`

3. **MongoDB Security**:
   - Use strong passwords
   - Restrict IP access when possible
   - Enable database encryption

4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo reboot  # if kernel updates
   ```

5. **Backup Database**:
   - MongoDB Atlas has automatic backups
   - But export important data regularly

---

## 🐛 Troubleshooting

### Service Won't Start:
```bash
# Check logs for errors
sudo journalctl -u channelfunding -n 50 --no-pager

# Common issues:
# - MongoDB connection failed → Check MONGO_URL in .env
# - Port already in use → Kill process: sudo lsof -ti:8000 | xargs kill
# - Python dependencies → Reinstall: cd backend && source venv/bin/activate && pip install -r requirements.txt
```

### Can't Access from Browser:
```bash
# Check if service is running
sudo systemctl status channelfunding
sudo systemctl status nginx

# Check firewall (should be open)
sudo ufw status

# Check AWS Security Group allows HTTP (port 80)
```

### 502 Bad Gateway:
```bash
# Backend is not running
sudo systemctl start channelfunding

# Check backend is on port 8000
curl http://localhost:8000/api/channels
```

### MongoDB Connection Error:
```bash
# Test connection from EC2
cd /home/ubuntu/app/backend
source venv/bin/activate
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); print(os.environ.get('MONGO_URL'))"

# Verify:
# - Password is correct (no special characters unescaped)
# - IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
# - Connection string format is correct
```

---

## 💰 Cost Management

### AWS Free Tier Limits:
- **750 hours/month** of t2.micro (enough for 24/7)
- **30 GB** of EBS storage
- **Free for 12 months**

### After Free Tier:
- t2.micro: ~$8-10/month
- 30 GB storage: ~$3/month
- **Total: ~$11-13/month**

### Staying Free:
- Stop instance when not needed
- Delete instance if not using
- Set up billing alerts in AWS

---

## 📊 Monitoring

### Setup CloudWatch Alarms (Free Tier):
1. Go to CloudWatch in AWS Console
2. Create alarm for:
   - CPU > 80% (instance overloaded)
   - Status check failed (instance down)
3. Get email notifications

### Application Monitoring:
```bash
# CPU and Memory usage
htop

# Disk space
df -h

# Service uptime
sudo systemctl status channelfunding
```

---

## 🎉 Success Checklist

- [ ] EC2 instance running
- [ ] MongoDB Atlas cluster created
- [ ] Security group allows HTTP/HTTPS
- [ ] Deployment script completed
- [ ] Environment variables configured
- [ ] Service is running (`sudo systemctl status channelfunding`)
- [ ] Frontend accessible via browser
- [ ] API responding to requests
- [ ] Can register/login users
- [ ] Database persisting data

---

## 🆘 Need Help?

**Common Issues**:
1. **Script fails** → Check EC2 has internet access
2. **MongoDB error** → Verify connection string and password
3. **Can't connect to EC2** → Check security group and key file permissions
4. **502 error** → Backend not running, check logs
5. **CORS error** → Update CORS_ORIGINS in .env

**Getting Logs**:
```bash
# Full service logs
sudo journalctl -u channelfunding --no-pager

# Last 100 lines
sudo journalctl -u channelfunding -n 100

# Real-time logs
sudo journalctl -u channelfunding -f
```

---

## 🚀 Next Steps

1. **Test all features**: Registration, login, channels, investments
2. **Setup domain name** (optional but recommended)
3. **Enable SSL** with Let's Encrypt (free)
4. **Setup CI/CD** with GitHub Actions for auto-deploy
5. **Add monitoring** and alerts
6. **Backup strategy** for database

---

**Your app is now live on AWS! 🎊**

Frontend: `http://YOUR_EC2_IP`  
API: `http://YOUR_EC2_IP/api`

Questions? Check the troubleshooting section or review the logs!
