// Dynamic API Base URL - works for both local and production
const API_BASE = 'http://127.0.0.1:5000';

console.log('🎤 Artist page loaded! API_BASE:', API_BASE);

// Page Initialization
document.addEventListener("DOMContentLoaded", () => {
    console.log('✅ DOM loaded on artist page');
    
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id');

    if (artistId) {
        console.log('🔍 Fetching artist ID:', artistId);
        fetchArtistDetails(artistId);
        fetchArtistSongs(artistId);
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
}