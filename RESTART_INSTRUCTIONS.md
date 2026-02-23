# 🎵 Fresh Start Instructions - Music App

## Overview
You have **19 songs** ready to upload from `songs_to_upload/` folder
- Arijit Singh: 5 songs
- KK: 5 songs
- Shreya: 4 songs
- Faheem: 4 songs

---

## Quick Start (5 Steps)

### 1️⃣ Clear MongoDB Database (Optional)
```bash
mongosh musicapp --eval "db.songs.deleteMany({}); db.artists.deleteMany({});"
```

### 2️⃣ Verify .env File
Make sure your `.env` file has:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGO_URI=mongodb://127.0.0.1:27017/musicapp
```

### 3️⃣ Start MongoDB Server
Open a **NEW terminal** (keep it running):
```bash
mongod
```

### 4️⃣ Upload Songs to Cloudinary
This will upload all songs from `songs_to_upload/` folder:
```bash
npm run upload
```

**What happens:**
- ✅ Uploads song audio files to Cloudinary
- ✅ Uploads cover images to Cloudinary
- ✅ Creates artist profiles with photos
- ✅ Saves all data to MongoDB
- ⏱️ Takes ~2-5 minutes for 19 songs

### 5️⃣ Start Backend Server
Open **another NEW terminal** (keep it running):
```bash
npm run dev
```
Server runs on: `http://127.0.0.1:5000`

### 6️⃣ Start Frontend (Live Server)
In VS Code:
- Right-click `index.html`
- Select "Open with Live Server"
- Or press: `Alt+L` then `Alt+O`

Frontend runs on: `http://127.0.0.1:5500`

---

## Verification Steps

### Check if Upload Worked
```bash
mongosh musicapp --eval "db.songs.countDocuments({})"
mongosh musicapp --eval "db.artists.countDocuments({})"
```
Should show: **songs: 19**, **artists: 4**

### Check Backend API
Open browser: `http://127.0.0.1:5000/songs`
Should see JSON with 19 songs

### Check Frontend
Open browser: `http://127.0.0.1:5500/index.html`
Should see:
- ✅ Songs displayed in "Trending Songs"
- ✅ Artists displayed in "Popular Artists"
- ✅ Click song → Opens dedicated player page
- ✅ Footer player shows song info

---

## Terminal Setup Summary

**You need 3 terminals running:**

1. **Terminal 1:** MongoDB Server
   ```bash
   mongod
   ```

2. **Terminal 2:** Backend Server (Node.js)
   ```bash
   npm run dev
   ```

3. **Terminal 3:** Live Server (VS Code Extension)
   - Use VS Code "Go Live" button
   - Or right-click `index.html` → Open with Live Server

---

## Folder Structure

```
songs_to_upload/          ← Audio files + covers here
  Arijit - Channa Mereya/
  Arijit - Ek Vaari/
  ...

artist_to_upload/         ← Artist profile photos here
  Arijit/
  KK/
  Shreya/
  Faheem/
  ...
```

**Naming convention:** `Artist Name - Song Title`

---

## Common Issues

### ❌ "MongoDB not running"
**Solution:** Start MongoDB in separate terminal
```bash
mongod
```

### ❌ "Port 5000 already in use"
**Solution:** Kill existing process
```bash
npx kill-port 5000
```

### ❌ "Cloudinary upload failed"
**Solution:** Check your `.env` file has correct Cloudinary credentials

### ❌ "Songs not displaying"
**Solution:** 
1. Hard refresh browser: `Ctrl+Shift+R`
2. Check F12 Console for errors
3. Verify backend is running: `http://127.0.0.1:5000/songs`

---

## Testing Checklist

- [ ] Songs display on homepage
- [ ] Artists display on homepage
- [ ] Click song → Goes to player page
- [ ] Song plays automatically
- [ ] Footer shows song/artist info
- [ ] Progress bar works
- [ ] Volume control works
- [ ] Login button works
- [ ] Artist page shows their songs

---

## Features

✅ Full-page song player with background cover  
✅ Persistent footer player across all pages  
✅ Login/Logout system (localStorage)  
✅ Artist profiles with songs  
✅ Auto-play songs  
✅ Progress tracking  
✅ Volume control  
✅ MongoDB + Cloudinary integration  

---

**🎉 You're all set! Enjoy your music app!**
