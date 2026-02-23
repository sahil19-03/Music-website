# 🚀 Live Server Deployment Guide

## Complete instructions to deploy your Music Streaming App to a live server

---

## 📋 Pre-Deployment Checklist

### ✅ What You Already Have:
- [x] Cloudinary account (configured in `.env`)
- [x] MongoDB connection string
- [x] All dependencies in `package.json`
- [x] Files stored on Cloudinary (cloud storage)

### ⚠️ Issues to Fix Before Deployment:

#### 1. **Update API_BASE URLs in Frontend Files**
Currently hardcoded to `http://127.0.0.1:5000` - needs to be dynamic:

**Files to update:**
- `player.js` (line 4)
- `script.js` (line 1)
- `artist.js` (line 1)

**Replace with:**
```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://your-backend-url.com';
```

Or use environment-based approach (recommended):
```javascript
const API_BASE = ""; // Empty string will use same domain
```

#### 2. **Add Start Script to package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "upload": "node upload_script.js"
  }
}
```

#### 3. **Update CORS in server.js**
For production, specify your frontend domain:
```javascript
app.use(cors({
    origin: "https://your-frontend-domain.com", // or "*" for any domain
    credentials: true
}));
```

---

## 🌐 Deployment Options

### **Option 1: Render.com (Recommended - FREE)**

#### Backend Deployment:
1. **Create a Render account** at https://render.com
2. **Create a new Web Service**
3. **Connect your GitHub repository** (push code to GitHub first)
4. **Configure settings:**
   - **Name**: `music-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. **Add Environment Variables** in Render dashboard:
   ```
   CLOUDINARY_CLOUD_NAME=drqlqaevt
   CLOUDINARY_API_KEY=984526754273397
   CLOUDINARY_API_SECRET=uAjfon2Pcpn3BI_sFwicHBOkOoU
   MONGO_URI=your_mongodb_atlas_connection_string
   PORT=5000
   NODE_ENV=production
   ```

6. **Get your backend URL**: `https://music-app-backend.onrender.com`

#### Frontend Deployment:
1. **Create a Static Site** on Render
2. **Upload these files:**
   - `index.html`
   - `artist.html`
   - `clickedsongs.html`
   - `loginpage.html`
   - `spotify.css`
   - `player.js`
   - `script.js`
   - `artist.js`
   - All image files

3. **Update API_BASE** in all JS files to your backend URL

---

### **Option 2: Railway.app (Easy Deployment)**

1. **Sign up** at https://railway.app
2. **Click "New Project" → "Deploy from GitHub"**
3. **Add environment variables** (same as above)
4. **Railway auto-detects** Node.js and deploys
5. **Get your URL**: `https://your-app.railway.app`

---

### **Option 3: Vercel (Frontend) + Render (Backend)**

#### Backend on Render:
Follow Option 1 backend steps

#### Frontend on Vercel:
1. **Sign up** at https://vercel.com
2. **Import project** from GitHub
3. **Configure:**
   - Framework Preset: `Other`
   - Build Command: (leave empty)
   - Output Directory: `.`
4. **Add environment variable:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. **Deploy**

---

### **Option 4: Self-Hosted VPS (DigitalOcean, AWS, etc.)**

#### Requirements:
- Ubuntu Server 20.04+
- Node.js 18+
- MongoDB (or use MongoDB Atlas)
- Domain name (optional)

#### Setup Steps:

```bash
# 1. Connect to your server
ssh root@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MongoDB (or use Atlas)
# MongoDB Atlas is recommended for easier setup

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Clone/Upload your project
cd /var/www
git clone your-repo-url music-app
cd music-app

# 6. Install dependencies
npm install

# 7. Create .env file
nano .env
# Paste your environment variables

# 8. Start with PM2
pm2 start server.js --name music-app
pm2 save
pm2 startup

# 9. Install Nginx (web server)
sudo apt install nginx

# 10. Configure Nginx
sudo nano /etc/nginx/sites-available/music-app
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend files
    location / {
        root /var/www/music-app;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/music-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL (optional but recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ MongoDB Atlas Setup (Cloud Database)

1. **Create account** at https://www.mongodb.com/cloud/atlas
2. **Create a FREE cluster**
3. **Setup Database Access:**
   - Create a database user with password
4. **Setup Network Access:**
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/musicapp?retryWrites=true&w=majority
   ```
6. **Update MONGO_URI** in your `.env` or deployment platform

---

## 📤 Upload Songs to Production

After deployment, upload songs using:

```bash
# From your local machine
node upload_script.js
```

This uploads directly to Cloudinary and your production MongoDB.

---

## 🔧 Quick Fixes Needed

### 1. Update `player.js`, `script.js`, `artist.js`:
```javascript
// Change from:
const API_BASE = "http://127.0.0.1:5000";

// To:
const API_BASE = "https://your-backend-url.onrender.com";
// OR for same-domain deployment:
const API_BASE = "";
```

### 2. Add to `package.json`:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Update `server.js` CORS (line 114):
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
```

---

## 🎯 Recommended Deployment Path

**For Beginners (Easiest):**
1. ✅ Use **MongoDB Atlas** (free cloud database)
2. ✅ Deploy backend to **Render.com** (free)
3. ✅ Deploy frontend to **Vercel** or **Render Static Site** (free)
4. ✅ Update API URLs in JS files
5. ✅ Test everything works

**Total Cost: $0/month**

---

## 📝 Environment Variables Summary

Required for production:
```env
CLOUDINARY_CLOUD_NAME=drqlqaevt
CLOUDINARY_API_KEY=984526754273397
CLOUDINARY_API_SECRET=uAjfon2Pcpn3BI_sFwicHBOkOoU
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/musicapp
PORT=5000
NODE_ENV=production
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend loads in browser
- [ ] API calls work (check browser console)
- [ ] Songs play correctly
- [ ] Artist pages load
- [ ] MongoDB stores data correctly
- [ ] Images/audio load from Cloudinary
- [ ] No CORS errors
- [ ] HTTPS enabled (SSL certificate)

---

## 🐛 Common Issues & Fixes

### Issue: "CORS Error"
**Fix:** Update CORS in `server.js` to include your frontend URL

### Issue: "Cannot connect to MongoDB"
**Fix:** Check MongoDB Atlas IP whitelist (use 0.0.0.0/0) and connection string

### Issue: "Songs not loading"
**Fix:** Verify API_BASE URL is correct in JS files

### Issue: "500 Internal Server Error"
**Fix:** Check server logs for error details

---

## 📱 Testing Your Live App

Once deployed:
1. Visit your frontend URL
2. Check browser console for errors (F12)
3. Test song playback
4. Test artist navigation
5. Check mobile responsiveness

---

## 🎉 You're Live!

Your music streaming app is now accessible worldwide! 🌍

**Need help?** Check the logs:
- Render: Dashboard → Logs tab
- Railway: Project → Deployments → Logs
- VPS: `pm2 logs music-app`

---

**Last Updated:** February 2026
