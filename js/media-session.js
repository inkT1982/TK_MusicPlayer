/* ==========================================================
   media-session.js — OS / lock-screen media controls
   ========================================================== */

function bindMediaSessionHandlers() {
  if (!('mediaSession' in navigator)) return;
  const m = navigator.mediaSession;

  // Clear seekbackward/seekforward so iOS lock screen shows Previous/Next track controls instead of ±10s skip
  try { m.setActionHandler('seekbackward', null); } catch (e) {}
  try { m.setActionHandler('seekforward', null); } catch (e) {}

  try {
    m.setActionHandler('play', () => {
      if (!tracks.length) return;
      if (A.getAttribute('src') && !A.src.startsWith('data:') && A.paused && !A.ended) {
        A.play().catch(() => playIdx(Math.max(idx, 0)));
      } else {
        playIdx(Math.max(idx, 0));
      }
    });
  } catch (e) {}

  try {
    m.setActionHandler('pause', () => {
      A.pause();
      stopSpin();
    });
  } catch (e) {}

  try {
    m.setActionHandler('stop', () => {
      stopPlayback();
    });
  } catch (e) {}

  try {
    m.setActionHandler('previoustrack', () => {
      if (A.currentTime > 3) {
        A.currentTime = 0;
        syncMediaPosition();
      } else {
        step(-1);
      }
    });
  } catch (e) {}

  try {
    m.setActionHandler('nexttrack', () => {
      step(1);
    });
  } catch (e) {}

  try {
    m.setActionHandler('seekto', details => {
      if (details && isFinite(details.seekTime) && isFinite(A.duration)) {
        A.currentTime = Math.max(0, Math.min(details.seekTime, A.duration));
        syncMediaPosition();
      }
    });
  } catch (e) {}
}

function syncMediaPosition() {
  if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;
  if (!isFinite(A.duration) || A.duration <= 0) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: A.duration,
      playbackRate: A.playbackRate || 1,
      position: Math.min(A.currentTime || 0, A.duration)
    });
  } catch (e) {}
}

function guessImageMime(url) {
  if (!url) return 'image/jpeg';
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
    return match ? match[1] : 'image/jpeg';
  }
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.png')) return 'image/png';
  if (cleanUrl.endsWith('.webp')) return 'image/webp';
  if (cleanUrl.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function updateMediaSession(titleText, albumText, artSrc) {
  if (!('mediaSession' in navigator)) return;
  bindMediaSessionHandlers();
  const mime = guessImageMime(artSrc);
  navigator.mediaSession.metadata = new MediaMetadata({
    title: titleText,
    artist: 'TK-100 Compact Disc',
    album: albumText,
    artwork: artSrc ? [
      { src: artSrc, sizes: '256x256', type: mime },
      { src: artSrc, sizes: '512x512', type: mime }
    ] : []
  });
  syncMediaPosition();
}
