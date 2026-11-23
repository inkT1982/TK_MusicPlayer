/* ==========================================================
   auth.js — Dropbox OAuth 2.0 PKCE login, token storage, sign-out
   ========================================================== */

const save = v => { try { v ? localStorage.setItem(STORAGE_AUTH, JSON.stringify(v)) : localStorage.removeItem(STORAGE_AUTH); } catch (e) {} };
const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_AUTH)); } catch (e) { return null; } };

// PKCE Helper Functions
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function startLogin() {
  try {
    const verifier = generateCodeVerifier();
    localStorage.setItem(STORAGE_VERIFIER, verifier);
    const challenge = await generateCodeChallenge(verifier);
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&code_challenge_method=S256&code_challenge=${challenge}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  } catch (e) {
    say('Auth error: ' + e.message);
  }
}

async function refreshAccessToken() {
  if (!S || !S.refresh_token) return false;
  try {
    const res = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: S.refresh_token,
        client_id: CLIENT_ID
      })
    });
    if (!res.ok) return false;
    const data = await res.json();
    S.token = data.access_token;
    if (data.refresh_token) S.refresh_token = data.refresh_token;
    save(S);
    return true;
  } catch (e) {
    return false;
  }
}

function showLogin(note) {
  const lib = $('#lib');
  lib.classList.add('open');
  $('#lib-toggle').setAttribute('aria-expanded', 'true');
  lib.innerHTML = `<h2>Connect to Dropbox</h2>
  <button class="go" id="login-btn">Sign in with Dropbox</button>
  <p class="note">${note || 'Sign in securely through Dropbox. This establishes a permanent connection with automatic token refreshing.'}</p>`;
  $('#login-btn').onclick = startLogin;
}

function signOut() {
  ++playSessionId;
  ++folderSessionId;
  pendingTrayRequest = null;
  activeTrackPath = '';
  A.pause();
  A.removeAttribute('src');
  S = null;
  save(null);
  tracks = [];
  idx = -1;
  disc = '';
  currentAlbumPath = '';
  folderCoverUrl = '';
  coverUrl = '';
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  }
  stopSpin();
  draw();
  showLogin();
}

// Initialization & OAuth code exchange check (called from main.js)
function initAuth() {
  // Initialization & OAuth Code Exchange Check
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  if (authCode) {
    window.history.replaceState({}, document.title, window.location.pathname);
    const verifier = localStorage.getItem(STORAGE_VERIFIER);
    const redirectUri = window.location.origin + window.location.pathname;

    fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: CLIENT_ID,
        code_verifier: verifier,
        redirect_uri: redirectUri
      })
    }).then(res => res.json()).then(data => {
      if (data.access_token) {
        S = { token: data.access_token, refresh_token: data.refresh_token };
        save(S);
        openFolder('', false);
      } else {
        showLogin('Authentication failed. Please try again.');
      }
    }).catch(() => {
      showLogin('Authentication network error.');
    });
  } else {
    S = load();
    if (S && S.token) {
      openFolder('', false);
    } else {
      showLogin();
    }
  }
}
