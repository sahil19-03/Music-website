// models/artist.js - UPDATED
const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bio: String,
    coverUrl: String,
});

module.exports = mongoose.model("Artist", artistSchema);