# Music Streaming Web App 🎵

A Spotify-inspired music streaming platform built with Node.js, MongoDB, and Cloudinary.

## Features
- Browse and play songs
- View artist profiles
- Persistent audio player across pages
- Cloud-based music storage
- Responsive UI with dark theme

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
copy .env.example .env
```

Edit `.env` with:
- MongoDB connection string
- Cloudinary credentials (from https://cloudinary.com)

### 3. Start MongoDB
Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

### 4. Start the Server
```bash
node server.js
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### 5. Open the App
Open `index.html` in your browser or use Live Server extension in VS Code.

### 6. Upload Songs (Optional)
To populate your database:
```bash
node upload_script.js
```

## Project Structure

### Frontend Files
- `index.html` - Home page with song/artist listings
- `artist.html` - Individual artist page
- `clickedsongs.html` - Dedicated song player
- `loginpage.html` - User authentication
- `spotify.css` - All styling
- `script.js` - Main page logic
- `artist.js` - Artist page logic
- `player.js` - Persistent audio player

### Backend Files
- `server.js` - Express server with API endpoints
- `models/` - MongoDB schemas (Song, Artist)
- `cloudinary.js` - Cloud storage configuration
- `upload_script.js` - Batch upload utility

## API Endpoints

### Songs
- `GET /songs` - Get all songs
- `GET /songs/:songId` - Get specific song
- `POST /songs/:songId/play` - Increment play count

### Artists
- `GET /artists` - Get all artists
- `GET /artists/:artistId` - Get artist details
- `GET /artists/:artistId/songs` - Get artist's songs

## Song Upload Format

Place songs in `songs_to_upload/` with this structure:
```
songs_to_upload/
  Artist Name - Song Title/
    audio.mp3
    cover.jpg
```

Place artist images in `artist_to_upload/`:
```
artist_to_upload/
  Artist Name/
    artist-photo.jpg
```

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudinary
- **Authentication**: Firebase (optional)

## Notes
- Backend runs on `http://127.0.0.1:5000`
- Frontend typically runs on `http://127.0.0.1:5500`
- All audio/cover files are stored on Cloudinary
- Player state persists using localStorage

## Troubleshooting
- Ensure ports 5000 and 5500 are available
- Check MongoDB is running
- Verify Cloudinary credentials in `.env`
- Clear browser cache if player doesn't load

Enjoy your music! 🎶
