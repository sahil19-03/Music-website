// Dynamic API Base URL - works for both local and production
const API_BASE = window.API_BASE || 'http://127.0.0.1:5000';

console.log('🎵 Script loaded! API_BASE:', API_BASE);

// Page Initialization
document.addEventListener("DOMContentLoaded", () => {
    console.log('✅ DOM loaded, starting to fetch data...');
    checkUserLogin(); // Check if user is logged in
    fetchSongs();
    fetchArtists();
    setupLoginButton();
});

// Check if user is logged in
function checkUserLogin() {
    const user = localStorage.getItem('musicAppUser');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('👤 Logged in as:', userData.username);
            
            if (loginBtn) {
                loginBtn.textContent = `👤 ${userData.username}`;
                loginBtn.style.background = '#1DB954';
                loginBtn.style.color = '#000';
            }
            
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('musicAppUser');
                    console.log('✅ Logged out');
                    alert('Logged out successfully!');
                    window.location.reload();
                });
            }
        } catch (err) {
            console.error('Error parsing user data:', err);
        }
    } else {
        console.log('🔓 No user logged in');
    }
}

// Setup Functions
function setupLoginButton() {
    const loginButton = document.getElementById("loginBtn");
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            window.location.href = "loginpage.html";
        });
    }
}

// Fetching Functions
async function fetchSongs() {
    console.log('📡 Fetching songs from:', `${API_BASE}/songs`);
    try {
        const res = await fetch(`${API_BASE}/songs`);
        console.log('📥 Songs response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const songs = await res.json();
        console.log('✅ Songs received:', songs.length, 'songs');
        
        if (songs.length > 0) {
            console.log('First song:', songs[0]);
            displaySongs(songs);
        } else {
            console.warn('⚠️ No songs in database!');
            const container = document.querySelector("#songsContainer");
            if (container) container.innerHTML = '<p style="color: white; padding: 20px;">No songs available</p>';
        }
        
    } catch (err) {
        console.error("❌ Error fetching songs:", err);
        const container = document.querySelector("#songsContainer");
        if (container) container.innerHTML = '<p style="color: red; padding: 20px;">Error loading songs. Is backend running?</p>';
    }
}

async function fetchArtists() {
    console.log('📡 Fetching artists from:', `${API_BASE}/artists`);
    try {
        const res = await fetch(`${API_BASE}/artists`);
        console.log('📥 Artists response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const artists = await res.json();
        console.log('✅ Artists received:', artists.length, 'artists');
        
        if (artists.length > 0) {
            console.log('First artist:', artists[0]);
        } else {
            console.warn('⚠️ No artists in database!');
        }
        
        displayArtists(artists);
    } catch (err) {
        console.error("❌ Error fetching artists:", err);
        console.error('Is backend running? Check: http://127.0.0.1:5000/artists');
    }
}

// Display Functions
function displaySongs(songList) {
    console.log('🎨 Displaying songs...');
    const songContainer = document.querySelector("#songsContainer");
    console.log('Container found:', songContainer ? 'YES' : 'NO');
    
    if (!songContainer) {
        console.error('❌ #songsContainer element not found in HTML!');
        return;
    }
    
    songContainer.innerHTML = "";
    
    if (!songList || songList.length === 0) {
        console.warn('⚠️ No songs to display');
        songContainer.innerHTML = '<p style="color: white; padding: 20px;">No songs available</p>';
        return;
    }

    songList.forEach(song => {
        const card = document.createElement("div");
        card.classList.add("song-card");
        
        const artistName = song.artist?.name || 'Unknown Artist';
        const coverUrl = song.coverUrl || 'default-cover.png';
        
        card.innerHTML = `
            <img src="${coverUrl}" alt="${song.title}" onerror="this.src='default-cover.png'">
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${artistName}</p>
            </div>
        `;
        card.addEventListener("click", () => {
            console.log('🎵 Playing:', song.title);
            playSongInline(song);
        });
        songContainer.appendChild(card);
    });
    console.log('✅ Displayed', songList.length, 'song cards successfully');
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

function displayArtists(artistList) {
    console.log('🎨 Displaying artists...');
    const artistContainer = document.querySelector("#artistsContainer");
    console.log('Container found:', artistContainer ? 'YES' : 'NO');
    
    if (!artistContainer) {
        console.error('❌ #artistsContainer element not found in HTML!');
        return;
    }
    
    artistContainer.innerHTML = "";
    
    if (!artistList || artistList.length === 0) {
        console.warn('⚠️ No artists to display');
        artistContainer.innerHTML = '<p style="color: white; padding: 20px;">No artists available</p>';
        return;
    }

    artistList.forEach(artist => {
        const card = document.createElement("div");
        card.classList.add("artist-card");
        
        const coverUrl = artist.coverUrl || 'default-artist.png';
        
        card.innerHTML = `
            <img src="${coverUrl}" alt="${artist.name}" class="artist-cover-image" onerror="this.src='default-artist.png'">
            <div class="artist-info">
                <h4>${artist.name}</h4>
            </div>
        `;
        card.addEventListener("click", () => {
            console.log('👤 Navigating to artist:', artist.name);
            window.location.href = `artist.html?id=${artist._id}`;
        });
        artistContainer.appendChild(card);
    });
    console.log('✅ Displayed', artistList.length, 'artist cards successfully');
}