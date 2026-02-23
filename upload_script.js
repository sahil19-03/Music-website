require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const Song = require('./models/song');
const Artist = require('./models/Artist');

const SONGS_BASE_FOLDER = 'songs_to_upload';
const ARTISTS_BASE_FOLDER = 'artist_to_upload';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected for script"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

function findFiles(folderPath) {
    let audioFile = null;
    let coverFile = null;
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        if (/\.(mp3|wav|flac|m4a)$/i.test(file)) {
            audioFile = path.join(folderPath, file);
        } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
            coverFile = path.join(folderPath, file);
        }
    }
    return { audioFile, coverFile };
}

async function processSongFolder(folderPath) {
    const folderName = path.basename(folderPath);
    try {
        const parts = folderName.split(' - ');
        if (parts.length !== 2) {
            console.warn(`⚠️ Skipping '${folderName}': Name not in 'Artist Name - Song Title' format.`);
            return;
        }

        const [artistName, songTitle] = parts.map(p => p.trim());
        console.log(`\nProcessing song: '${songTitle}' by '${artistName}'...`);

        const { audioFile, coverFile: songCoverFile } = findFiles(folderPath);
        if (!audioFile || !songCoverFile) {
            console.error('❌ Error: Missing song audio or cover file. Skipping.');
            return;
        }
        
        let artist = await Artist.findOne({ name: artistName });
        if (!artist) {
            artist = new Artist({ name: artistName });
            console.log(`  Creating new artist '${artistName}'...`);
            await artist.save();
        }

        const artistImagePath = path.join(ARTISTS_BASE_FOLDER, artistName);
        if (fs.existsSync(artistImagePath)) {
            const { coverFile: artistCoverFile } = findFiles(artistImagePath);
            if (artistCoverFile) {
                console.log(`  Found artist cover art. Uploading...`);
                const artistUploadResult = await cloudinary.uploader.upload(artistCoverFile, { folder: 'artist_covers' });
                artist.coverUrl = artistUploadResult.secure_url;
                await artist.save();
                console.log(`  ✅ Artist cover art updated.`);
            }
        }

        console.log('  Uploading song files...');
        const [coverUploadResult, audioUploadResult] = await Promise.all([
            cloudinary.uploader.upload(songCoverFile, { folder: 'covers' }),
            cloudinary.uploader.upload(audioFile, { resource_type: 'video', folder: 'songs' })
        ]);
        console.log('  ✅ Song files uploaded successfully.');

        const songData = {
            title: songTitle,
            artist: artist._id,
            artistName: artist.name,
            audioUrl: audioUploadResult.secure_url,
            coverUrl: coverUploadResult.secure_url,
        };

        await Song.findOneAndUpdate(
            { title: songTitle, artist: artist._id },
            songData,
            { upsert: true }
        );
        
        console.log(`  ✅ Song '${songTitle}' data saved/updated in database.`);

    } catch (error) {
        console.error(`❌ Error processing '${folderName}':`, error);
    }
}

async function runScript() {
    console.log('🎵 Starting song upload script...\n');
    const items = fs.readdirSync(SONGS_BASE_FOLDER, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            const itemPath = path.join(SONGS_BASE_FOLDER, item.name);
            await processSongFolder(itemPath);
        }
    }
    console.log('\n✅ Upload script completed!');
    mongoose.connection.close();
}

runScript();