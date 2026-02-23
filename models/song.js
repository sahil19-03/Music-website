// const mongoose = require("mongoose");

// const songSchema = new mongoose.Schema({
//   title: String,
//   artist: String,
//   filePath: String,
//   coverPath: String
// });

// module.exports = mongoose.model("Song", songSchema);
// backend/models/Song.js (modify existing)

// models/song.js - UPDATED
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    artistName: String,
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Song", songSchema);