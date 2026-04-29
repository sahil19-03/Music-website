// Dynamic API Base URL - works for both local and production
const API_BASE = window.API_BASE || 'http://127.0.0.1:5000';

console.log('🎤 Artist page loaded! API_BASE:', API_BASE);

let currentNowPlayingSong = null;
let pagehideBound = false;
let currentPlaylist = [];
let currentPlaylistIndex = -1;
let autoNextBound = false;

// Page Initialization
document.addEventListener("DOMContentLoaded", () => {
    console.log('✅ DOM loaded on artist page');
    
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id');

    if (artistId) {
        console.log('🔍 Fetching artist ID:', artistId);
        fetchArtistDetails(artistId);
        fetchArtistSongs(artistId);
        restorePlayback();
    } else {
        console.error('❌ No artist ID found in URL');
        document.body.innerHTML = '<h1 style="color: white; text-align: center; padding: 50px;">Artist Not Found.</h1>';
    }
});

// Fetching Functions
async function fetchArtistDetails(id) {
    console.log('📡 Fetching artist details...');
    try {
        const res = await fetch(`${API_BASE}/artists/${id}`);
        console.log('📥 Response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const artist = await res.json();
        console.log('✅ Artist loaded:', artist);
        
        const nameEl = document.getElementById("artistName");
        const coverEl = document.getElementById("artistCoverImage");
        
        if (nameEl) {
            nameEl.textContent = artist.name;
        } else {
            console.error('❌ Element #artistName not found');
        }
        
        if (coverEl) {
            coverEl.src = artist.coverUrl || 'default-artist.png';
            coverEl.onerror = () => { coverEl.src = 'default-artist.png'; };
        } else {
            console.error('❌ Element #artistCoverImage not found');
        }
        
    } catch (err) {
        console.error("❌ Error fetching artist details:", err);
    }
}

async function fetchArtistSongs(id) {
    console.log('📡 Fetching artist songs...');
    try {
        const res = await fetch(`${API_BASE}/artists/${id}/songs`);
        console.log('📥 Songs response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const songs = await res.json();
        console.log('✅ Artist songs received:', songs.length);
        displaySongs(songs);
    } catch (err) {
        console.error("❌ Error fetching artist songs:", err);
    }
}

async function incrementPlayCount(songId) {
    if (!songId) return;
    try {
        await fetch(`${API_BASE}/songs/${songId}/play`, { method: 'POST' });
    } catch (err) {
        console.warn('⚠️ Failed to update play count:', err);
    }
}

function savePlaybackState(song, audioPlayer, isPlaying) {
    if (!song || !audioPlayer) return;
    const payload = {
        song,
        currentTime: audioPlayer.currentTime || 0,
        isPlaying: Boolean(isPlaying)
    };
    localStorage.setItem('musicAppNowPlaying', JSON.stringify(payload));
}

function bindPagehideSaver() {
    if (pagehideBound) return;
    pagehideBound = true;

    const saveOnHide = () => {
        const audioPlayer = document.getElementById("audioPlayer");
        if (!audioPlayer || !currentNowPlayingSong) return;
        savePlaybackState(currentNowPlayingSong, audioPlayer, !audioPlayer.paused);
    };

    window.addEventListener('pagehide', saveOnHide);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveOnHide();
    });
}

function restorePlayback() {
    const saved = localStorage.getItem('musicAppNowPlaying');
    if (!saved) return;

    let payload;
    try {
        payload = JSON.parse(saved);
    } catch (err) {
        console.warn('⚠️ Failed to parse saved playback state');
        return;
    }

    const song = payload.song;
    if (!song || !song.audioUrl) return;

    currentNowPlayingSong = song;
    bindPagehideSaver();

    const audioPlayer = document.getElementById("audioPlayer");
    const footerPlayBtn = document.getElementById("footerPlayPause");
    const footerTitle = document.getElementById("footerTitle");
    const footerArtist = document.getElementById("footerArtist");
    const footerCover = document.getElementById("footerCover");
    const progressSlider = document.getElementById("progressSlider");
    const volumeSlider = document.getElementById("volumeSlider");

    if (!audioPlayer) return;

    const artistName = song.artist?.name || song.artistName || 'Unknown Artist';
    const coverUrl = song.coverUrl || 'default-cover.png';

    footerTitle.innerText = song.title;
    footerArtist.innerText = artistName;
    footerCover.src = coverUrl;

    audioPlayer.src = song.audioUrl;
    const savedTime = Number(payload.currentTime || 0);

    const applyTimeAndPlay = async () => {
        if (savedTime > 0) audioPlayer.currentTime = savedTime;
        try {
            await audioPlayer.play();
            footerPlayBtn.innerText = "⏸";
            savePlaybackState(song, audioPlayer, true);
        } catch (err) {
            footerPlayBtn.innerText = "▶";
            savePlaybackState(song, audioPlayer, false);
        }
    };

    audioPlayer.addEventListener("loadedmetadata", applyTimeAndPlay, { once: true });

    if (!footerPlayBtn.hasAttribute('data-initialized')) {
        footerPlayBtn.setAttribute('data-initialized', 'true');
        footerPlayBtn.addEventListener("click", () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                footerPlayBtn.innerText = "⏸";
                savePlaybackState(song, audioPlayer, true);
            } else {
                audioPlayer.pause();
                footerPlayBtn.innerText = "▶";
                savePlaybackState(song, audioPlayer, false);
            }
        });

        audioPlayer.addEventListener("timeupdate", () => {
            if (audioPlayer.duration) {
                progressSlider.max = 100;
                progressSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            }
            savePlaybackState(song, audioPlayer, !audioPlayer.paused);
        });

        progressSlider.addEventListener("input", () => {
            if (audioPlayer.duration) {
                audioPlayer.currentTime = (progressSlider.value / 100) * audioPlayer.duration;
            }
        });

        volumeSlider.addEventListener("input", () => {
            audioPlayer.volume = volumeSlider.value;
        });
    }
}

// Display Function
function displaySongs(songList) {
    console.log('🎨 Displaying artist songs...');
    const songContainer = document.getElementById("songListContainer");
    
    if (!songContainer) {
        console.error('❌ Element #songListContainer not found!');
        return;
    }
    
    songContainer.innerHTML = "";
    
    if (!songList || songList.length === 0) {
        console.warn('⚠️ No songs for this artist');
        songContainer.innerHTML = '<p style="color: white; padding: 20px;">No songs available for this artist</p>';
        return;
    }

    currentPlaylist = songList.slice();
    currentPlaylistIndex = -1;

    songList.forEach(song => {
        const card = document.createElement("div");
        card.classList.add("song-card");
        
        const coverUrl = song.coverUrl || 'default-cover.png';
        
        card.innerHTML = `
            <img src="${coverUrl}" alt="${song.title}" onerror="this.src='default-cover.png'">
            <div class="song-info">
                <h4>${song.title}</h4>
            </div>
        `;
        card.addEventListener("click", () => {
            console.log('🎵 Playing:', song.title);
            playSongInline(song);
        });
        songContainer.appendChild(card);
    });
    
    console.log('✅ Displayed', songList.length, 'song cards');
}

// Play song in footer player
function playSongInline(song) {
    console.log('🎵 Setting up player for:', song.title);
    
    const audioPlayer = document.getElementById("audioPlayer");
    const footerPlayBtn = document.getElementById("footerPlayPause");
    const footerTitle = document.getElementById("footerTitle");
    const footerArtist = document.getElementById("footerArtist");
    const footerCover = document.getElementById("footerCover");
    const progressSlider = document.getElementById("progressSlider");
    const volumeSlider = document.getElementById("volumeSlider");
    
    if (!audioPlayer) {
        console.error('❌ Audio player not found!');
        return;
    }

    currentPlaylistIndex = currentPlaylist.findIndex(item => item._id === song._id);
    
    // Update footer info
    const artistName = song.artist?.name || 'Unknown Artist';
    const coverUrl = song.coverUrl || 'default-cover.png';
    
    footerTitle.innerText = song.title;
    footerArtist.innerText = artistName;
    footerCover.src = coverUrl;
    
    // Setup audio
    audioPlayer.src = song.audioUrl;
    audioPlayer.play();
    footerPlayBtn.innerText = "⏸";
    
    console.log('✅ Now playing:', song.title);
    incrementPlayCount(song._id);
    currentNowPlayingSong = song;
    bindPagehideSaver();
    savePlaybackState(song, audioPlayer, true);
    
    // Setup play/pause button if not already done
    if (!footerPlayBtn.hasAttribute('data-initialized')) {
        footerPlayBtn.setAttribute('data-initialized', 'true');
        
        footerPlayBtn.addEventListener("click", () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                footerPlayBtn.innerText = "⏸";
            } else {
                audioPlayer.pause();
                footerPlayBtn.innerText = "▶";
            }
        });
        
        // Progress bar
        audioPlayer.addEventListener("timeupdate", () => {
            if (audioPlayer.duration) {
                progressSlider.max = 100;
                progressSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            }
            savePlaybackState(song, audioPlayer, !audioPlayer.paused);
        });
        
        // Seek
        progressSlider.addEventListener("input", () => {
            if (audioPlayer.duration) {
                audioPlayer.currentTime = (progressSlider.value / 100) * audioPlayer.duration;
            }
        });
        
        // Volume
        volumeSlider.addEventListener("input", () => {
            audioPlayer.volume = volumeSlider.value;
        });
    }
    bindAutoNext(audioPlayer);
}

function bindAutoNext(audioPlayer) {
    if (autoNextBound) return;
    autoNextBound = true;

    audioPlayer.addEventListener('ended', () => {
        if (!currentPlaylist.length) return;
        const nextIndex = currentPlaylistIndex + 1;
        if (nextIndex < currentPlaylist.length) {
            playSongInline(currentPlaylist[nextIndex]);
        }
    });
}