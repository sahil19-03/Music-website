require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// Corrected file path to lowercase 'artist'
const Song = require('./models/song');
const Artist = require('./models/Artist');

const app = express();
app.use(cors());
app.use(express.json());

// ===================
// Database Connection
// ===================
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/musicapp")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error(err));

// ===================
// Cloudinary Config
// ===================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===================
// API Routes
// ===================
// NOTE: Route order matters! More specific routes MUST come before generic :param routes

// --- Artist Routes ---
app.get("/artists", async (req, res) => {
    try {
        const artists = await Artist.find();
        console.log(`📋 Fetched ${artists.length} artists from database`);
        res.json(artists);
    } catch (err) {
        console.error("❌ Error fetching artists:", err);
        res.status(500).json({ error: "Could not fetch artists." });
    }
});

app.get("/artists/:artistId/songs", async (req, res) => {
    try {
        const { artistId } = req.params;
        const songs = await Song.find({ artist: artistId }).populate('artist');
        console.log(`🎵 Fetched ${songs.length} songs for artist ${artistId}`);
        res.json(songs);
    } catch (err) {
        console.error("❌ Error fetching artist songs:", err);
        res.status(500).json({ error: "Could not fetch songs for this artist." });
    }
});

app.get("/artists/:artistId", async (req, res) => {
    try {
        const { artistId } = req.params;
        const artist = await Artist.findById(artistId);
        if (!artist) return res.status(404).json({ error: "Artist not found" });
        console.log(`👤 Fetched artist: ${artist.name}`);
        res.json(artist);
    } catch (err) {
        console.error("❌ Error fetching artist details:", err);
        res.status(500).json({ error: "Could not fetch artist details." });
    }
});

// --- Song Routes ---
// IMPORTANT: /songs/trending MUST come BEFORE /songs/:songId to avoid routing conflict!
app.get("/songs/trending", async (req, res) => {
    try {
        const trendingSongs = await Song.find()
            .sort({ playCount: -1 })
            .limit(5)
            .populate('artist');
        console.log(`🔥 Fetched ${trendingSongs.length} trending songs`);
        res.json(trendingSongs);
    } catch (err) {
        console.error("❌ Error fetching trending songs:", err);
        res.status(500).json({ error: "Could not fetch trending songs." });
    }
});

app.get("/songs/:songId", async (req, res) => {
    try {
        const { songId } = req.params;
        const song = await Song.findById(songId).populate('artist');
        if (!song) return res.status(404).json({ error: "Song not found" });
        console.log(`🎵 Fetched song: ${song.title}`);
        res.json(song);
    } catch (err) {
        console.error("❌ Error fetching song:", err);
        res.status(500).json({ error: "Could not fetch song." });
    }
});

app.get("/songs", async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 }).populate('artist');
        console.log(`📋 Fetched ${songs.length} songs from Cloudinary/database`);
        res.json(songs);
    } catch (err) {
        console.error("❌ Error fetching songs:", err);
        res.status(500).json({ error: "Could not fetch songs." });
    }
});

app.post("/songs/:songId/play", async (req, res) => {
    try {
        const { songId } = req.params;
        await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });
        res.status(200).json({ message: "Play count updated." });
    } catch (err) {
        console.error("❌ Error updating play count:", err);
        res.status(500).json({ error: "Could not update play count." });
    }
});

// ===================
// Start Server
// ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));