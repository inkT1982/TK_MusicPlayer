/* ==========================================================
   player.js — display refresh, playback, track stepping, play/pause
   ========================================================== */

const cur = () => tracks[idx] || { name: '' };

function draw() {
  const discEl = $('#disc');
  const artEl = $('#disc-art');

  discEl.classList.toggle('empty', !tracks.length && !coverUrl);
  discEl.classList.toggle('mini-cd', isMiniSingle(tracks));

  if (coverUrl) {
    artEl.src = coverUrl;
    discEl.classList.add('has-art');
  } else {
    artEl.removeAttribute('src');
    discEl.classList.remove('has-art');
  }

  $('#lab').textContent = tracks.length && !coverUrl ? disc : '';
  $('#trk').textContent = tracks.length > 0 ? `T${pad(idx + 1)}/${pad(tracks.length)}` : 'T--/--';
  $('#seek').disabled = !tracks.length;
  updateSeekFill();
}

async function playIdx(i) {
  if (!tracks.length || i < 0 || i >= tracks.length) return;
  const sessionId = ++playSessionId;
  idx = i;
  const trackToPlay = tracks[idx];
  const albumAtStart = currentAlbumPath;
  const badge = isMiniSingle(tracks) ? ' [8cm Single]' : '';
  activeTrackPath = trackToPlay.path_lower;
  retriedCurrentSrc = false;

  draw();
  drawLib();
  say(`Reading disc…${badge}`);

  try {
    const link = await getLink(trackToPlay.path_lower);
    if (sessionId !== playSessionId || currentAlbumPath !== albumAtStart) return;

    A.src = link;
    A.load();
    await A.play();
    if (sessionId !== playSessionId || currentAlbumPath !== albumAtStart) return;

    startSpin();
    say(`${clean(trackToPlay.name)}${badge}`);

    updateMediaSession(clean(trackToPlay.name), disc, coverUrl);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';

    drawLib();

    if (idx + 1 < tracks.length) {
      prefetchLink(tracks[idx + 1].path_lower);
    }
  } catch (e) {
    if (sessionId === playSessionId) {
      if (e && e.name === 'NotAllowedError' && !unlocked) {
        try {
          A.src = SILENT;
          await A.play();
          unlocked = true;
          if (sessionId === playSessionId) playIdx(idx);
          return;
        } catch (_) {}
      }
      say('Error: ' + e.message);
    }
  }
}

function stopPlayback() {
  ++playSessionId;
  activeTrackPath = '';
  retriedCurrentSrc = false;
  A.pause();
  stopSpin();
  A.currentTime = 0;
  $('#seek').value = 0;
  $('#time').textContent = tracks.length ? '00:00' : '--:--';
  updateSeekFill();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = tracks.length ? 'paused' : 'none';
    syncMediaPosition();
  }
  const badge = isMiniSingle(tracks) ? ' [8cm Single]' : '';
  say(tracks.length ? `${clean(cur().name)}${badge}` : 'No disc');
}

function step(d) {
  if (!tracks.length) return;
  if (shuffle && tracks.length > 1) {
    let n;
    do {
      n = Math.floor(Math.random() * tracks.length);
    } while (n === idx);
    playIdx(n);
    return;
  }
  const n = idx + d;
  if (n >= 0 && n < tracks.length) {
    playIdx(n);
  } else if (d > 0) {
    if (repeatMode === 'all') {
      playIdx(0);
    } else {
      ++playSessionId;
      A.pause();
      stopSpin();
      A.currentTime = 0;
      $('#seek').value = 0;
      updateSeekFill();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
        syncMediaPosition();
      }
      say('End of disc');
    }
  } else if (d < 0 && repeatMode === 'all') {
    playIdx(tracks.length - 1);
  }
}

async function togglePlayPause() {
  const currentFolder = stack[stack.length - 1];

  if (isAnimating) {
    const files = stack.length > 1 ? view.filter(isAudio) : tracks;
    const targetAlbumPath = stack.length > 1 ? currentFolder.path : currentAlbumPath;
    const targetAlbumName = stack.length > 1 ? currentFolder.name : disc;
    if (files.length > 0) {
      pendingTrayRequest = {
        audioFiles: pendingTrayRequest ? pendingTrayRequest.audioFiles : files,
        albumName: pendingTrayRequest ? pendingTrayRequest.albumName : targetAlbumName,
        albumPath: pendingTrayRequest ? pendingTrayRequest.albumPath : targetAlbumPath,
        folderView: pendingTrayRequest ? pendingTrayRequest.folderView : view,
        startIdx: pendingTrayRequest ? pendingTrayRequest.startIdx : Math.max(idx, 0),
        autoPlayAfterLoad: true
      };
      say('Loading disc…');
    }
    return;
  }

  if (stack.length === 1 && !tracks.length) {
    say('Choose a CD folder first');
    return;
  }

  if (stack.length > 1 && (!tracks.length || currentAlbumPath !== currentFolder.path)) {
    const files = view.filter(isAudio);
    if (files.length > 0) {
      await loadAlbumIntoTray(files, currentFolder.name, currentFolder.path, view, 0, true);
      return;
    }
  }

  if (!tracks.length) {
    say('Choose a CD folder first');
    return;
  }

  if (!A.paused) {
    A.pause();
    stopSpin();
  } else if (A.getAttribute('src') && !A.src.startsWith('data:') && A.currentTime > 0 && !A.ended) {
    A.play().catch(() => playIdx(Math.max(idx, 0)));
  } else {
    playIdx(Math.max(idx, 0));
  }
}
