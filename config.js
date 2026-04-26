// Central API base config for local and production.
(function () {
    const storedBase = localStorage.getItem('API_BASE');
    if (storedBase) {
        window.API_BASE = storedBase;
        return;
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    window.API_BASE = isLocal ? 'http://127.0.0.1:5000' : 'https://YOUR_RENDER_URL';
})();
