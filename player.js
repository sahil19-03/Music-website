// Global Player State Variables
let currentSongId = null;
let isPlaying = false;

// Dynamic API Base URL - works for both local and production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : ''; // Empty string uses same domain in production

// State Management with localStorage

// Saves the current player state to the browser's memory
function savePlayerState() {
    const currentState = {
        songId: currentSongId,
        isPlaying: isPlaying,
        currentTime: document.getElementById('audioPlayer').currentTime,
    };
    localStorage.setItem('musicPlayerState', JSON.stringify(currentState));
}

// Loads the player state when a new page is opened
async function loadPlayerState() {
    const savedState = JSON.parse(localStorage.getItem('musicPlayerState'));
    if (!savedState || !savedState.songId) return;

    // Fetch the full song details using the saved ID
    try {
        const res = await fetch(`${API_BASE}/songs/${savedState.songId}`); // You will need to create this new backend route
        if (!res.ok) {
            localStorage.removeItem('musicPlayerState'); // Clear state if song not found
            return;
        }
        const song = await res.json();
        
        // Setup the player without starting it
        setupPlayer(song, savedState.currentTime, savedState.isPlaying);

    } catch (error) {
        console.error("Error loading saved song:", error);
        localStorage.removeItem('musicPlayerState');
    }
}

// --- Player Logic ---

// This function sets up the player UI and audio element
function setupPlayer(song, startTime = 0, shouldPlay = false) {
    const audioPlayer = document.getElementById("audioPlayer");
    const footer = document.querySelector(".spotify-footer");
    if (!footer || !audioPlayer) return;

    const playBtn = footer.querySelector("#footerPlayPause");
    const songTitle = footer.querySelector("#footerTitle");
    const songArtist = footer.querySelector("#footerArtist");
    const songCover = footer.querySelector("#footerCover");
    const progressSlider = footer.querySelector("#progressSlider");
    const volumeSlider = footer.querySelector("#volumeSlider");

    // Update song info
    currentSongId = song._id;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist ? song.artist.name : 'Unknown Artist';
    songCover.src = song.coverUrl;
    
    // Set audio source and start time
    if (audioPlayer.src !== song.audioUrl) {
        audioPlayer.src = song.audioUrl;
    }
    audioPlayer.currentTime = startTime;

    // Set initial play/pause state
    isPlaying = shouldPlay;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    if (isPlaying) {
        audioPlayer.play().catch(e => console.error("Playback error:", e));
    } else {
        audioPlayer.pause();
    }

    // --- Event Listeners ---
    audioPlayer.ontimeupdate = () => {
        if (audioPlayer.duration) {
            progressSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        }
        savePlayerState(); // Continuously save progress
    };
    
    progressSlider.oninput = () => {
        if (audioPlayer.duration) {
            audioPlayer.currentTime = (progressSlider.value / 100) * audioPlayer.duration;
        }
    };
    
    volumeSlider.oninput = () => {
        audioPlayer.volume = volumeSlider.value;
    };
    
    audioPlayer.onended = () => {
        playBtn.textContent = "▶";
        isPlaying = false;
        savePlayerState();
    };

    playBtn.onclick = () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
        playBtn.textContent = isPlaying ? "⏸" : "▶";
        savePlayerState();
    };
}

// This is the main function called when a song card is clicked
function playSong(song) {
    // If it's the same song, just toggle play/pause
    if (currentSongId === song._id) {
        const audioPlayer = document.getElementById("audioPlayer");
        const playBtn = document.querySelector("#footerPlayPause");
        if (audioPlayer.paused) {
            audioPlayer.play();
            isPlaying = true;
        } else {
            audioPlayer.pause();
            isPlaying = false;
        }
        playBtn.textContent = isPlaying ? "⏸" : "▶";
        savePlayerState();
        return;
    }
    
    // If it's a new song, report a play and set it up
    fetch(`${API_BASE}/songs/${song._id}/play`, { method: 'POST' });
    setupPlayer(song, 0, true);
}