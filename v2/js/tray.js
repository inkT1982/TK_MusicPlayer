/* ==========================================================
   tray.js — CD tray mechanics: load (insert) and eject
   ========================================================== */

async function loadAlbumIntoTray(audioFiles, albumName, albumPath, folderView, startIdx = 0, autoPlayAfterLoad = false) {
  if (isAnimating) {
    pendingTrayRequest = { audioFiles, albumName, albumPath, folderView, startIdx, autoPlayAfterLoad };
    return;
  }

  // Stop-on-Disc-Change invariant: halt active audio and reset timer/scrubber
  const loadSession = ++playSessionId;
  activeTrackPath = '';
  A.pause();
  A.removeAttribute('src');
  stopSpin();
  $('#time').textContent = '--:--';
  $('#seek').value = 0;
  updateSeekFill();

  isAnimating = true;

  const discEl = $('#disc');

  if (tracks.length > 0 && currentAlbumPath && currentAlbumPath !== albumPath) {
    discEl.classList.add('ejecting');
    await new Promise(r => setTimeout(r, 900));
    discEl.classList.remove('ejecting');
  }

  if (loadSession !== playSessionId && !pendingTrayRequest) {
    isAnimating = false;
    return;
  }

  const cachedArt = folderArtCache[albumPath] || '';
  tracks = audioFiles.slice();
  disc = albumName;
  currentAlbumPath = albumPath;
  idx = Math.max(0, Math.min(startIdx, tracks.length - 1));
  folderCoverUrl = cachedArt;
  coverUrl = cachedArt;

  spinAngle = 0;
  const rotor = $('#disc-rotor');
  if (rotor) rotor.style.transform = 'rotate(0deg)';

  draw();
  drawLib();

  // Resolve cover art in background so disc insertion starts immediately without delay
  resolveAlbumCoverAsync(loadSession, albumPath, audioFiles, folderView);

  discEl.classList.add('inserting');
  await new Promise(r => setTimeout(r, 1100));
  discEl.classList.remove('inserting');
  isAnimating = false;
  pumpFolderArtQueue();

  if (pendingTrayRequest) {
    const nextReq = pendingTrayRequest;
    pendingTrayRequest = null;
    if (nextReq.albumPath === currentAlbumPath) {
      if (nextReq.autoPlayAfterLoad) {
        playIdx(nextReq.startIdx);
      } else {
        idx = nextReq.startIdx;
        draw();
        drawLib();
      }
    } else {
      await loadAlbumIntoTray(
        nextReq.audioFiles,
        nextReq.albumName,
        nextReq.albumPath,
        nextReq.folderView,
        nextReq.startIdx,
        nextReq.autoPlayAfterLoad
      );
    }
    return;
  }

  const badge = isMiniSingle(tracks) ? ' [8cm Single]' : '';
  say(`CD Loaded: ${albumName}${badge} - ready to play`);

  if (autoPlayAfterLoad) {
    playIdx(idx);
  }
}

async function ejectDisc() {
  if ((!tracks.length && !disc) || isAnimating) return;
  ++playSessionId;
  ++folderSessionId;
  pendingTrayRequest = null;
  activeTrackPath = '';
  retriedCurrentSrc = false;
  isAnimating = true;

  stopSpin();
  const discEl = $('#disc');
  discEl.classList.add('ejecting');
  await new Promise(r => setTimeout(r, 900));
  discEl.classList.remove('ejecting');

  A.pause();
  A.removeAttribute('src');
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
  draw();
  $('#time').textContent = '--:--';
  $('#seek').value = 0;
  updateSeekFill();
  say('Disc ejected');
  isAnimating = false;
  pumpFolderArtQueue();

  stack = [{ path: '', name: 'TK_MusicPlayer' }];
  openFolder('', false);
}
