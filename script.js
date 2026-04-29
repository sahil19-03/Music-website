// Dynamic API Base URL - works for both local and production
const API_BASE = window.API_BASE || 'http://127.0.0.1:5000';
let currentNowPlayingSong = null;
let pagehideBound = false;
let currentPlaylist = [];
let currentPlaylistIndex = -1;
let autoNextBound = false;

console.log('🎵 Script loaded! API_BASE:', API_BASE);

// Page Initialization
document.addEventListener("DOMContentLoaded", () => {
    console.log('✅ DOM loaded, starting to fetch data...');
    checkUserLogin(); // Check if user is logged in
    fetchTrendingSongs();
    fetchArtists();
    setupLoginButton();
    restorePlayback();
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
async function fetchTrendingSongs() {
    console.log('📡 Fetching trending songs from:', `${API_BASE}/songs/trending`);
    try {
        const res = await fetch(`${API_BASE}/songs/trending`);
        console.log('📥 Trending songs response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const songs = await res.json();
        console.log('✅ Trending songs received:', songs.length, 'songs');
        
        if (songs.length > 0) {
            console.log('First song:', songs[0]);
            displaySongs(songs);
        } else {
            console.warn('⚠️ No trending songs in database!');
            const container = document.querySelector("#songsContainer");
            if (container) container.innerHTML = '<p style="color: white; padding: 20px;">No trending songs available</p>';
        }
        
    } catch (err) {
        console.error("❌ Error fetching trending songs:", err);
        const container = document.querySelector("#songsContainer");
        if (container) container.innerHTML = '<p style="color: red; padding: 20px;">Error loading trending songs. Is backend running?</p>';
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

    currentPlaylist = songList.slice();
    currentPlaylistIndex = -1;

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
    currentNowPlayingSong = song;
    bindPagehideSaver();
    savePlaybackState(song, audioPlayer, true);
    
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
    incrementPlayCount(song._id);
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