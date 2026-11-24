/* ==========================================================
   controls.js — event bindings for buttons, scrubber and <audio>
   ========================================================== */

// Wires every button, the scrubber and the <audio> element to the app logic.
function bindControls() {
  $('#pp').onclick = togglePlayPause;
  $('#eject').onclick = ejectDisc;

  $('#next').onclick = () => step(1);
  $('#prev').onclick = () => {
    if (A.currentTime > 3) {
      A.currentTime = 0;
      syncMediaPosition();
    } else {
      step(-1);
    }
  };
  $('#stop').onclick = stopPlayback;

  $('#shuf').onclick = e => {
    shuffle = !shuffle;
    e.currentTarget.setAttribute('aria-pressed', shuffle);
  };

  $('#rep').onclick = e => {
    const order = ['off', 'all', 'one'];
    repeatMode = order[(order.indexOf(repeatMode) + 1) % order.length];
    const btn = e.currentTarget;
    btn.setAttribute('aria-pressed', repeatMode !== 'off');
    const label = repeatMode === 'off' ? 'Repeat: Off' : repeatMode === 'all' ? 'Repeat: All' : 'Repeat: One';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    $('#rep-icon').innerHTML = repeatMode === 'one' ? REP_IC.one : REP_IC.loop;
  };

  $('#lib-toggle').onclick = () => {
    const isOpen = $('#lib').classList.toggle('open');
    $('#lib-toggle').setAttribute('aria-expanded', isOpen);
  };

  $('#tv-mode').onclick = () => {
    document.body.classList.toggle('tv-mode');
    const active = document.body.classList.contains('tv-mode');
    $('#tv-mode').setAttribute('aria-pressed', active);
    $('#lib').classList.remove('open');
    $('#lib-toggle').setAttribute('aria-expanded', 'false');
  };

  $('#seek').oninput = e => {
    if (isFinite(A.duration)) {
      A.currentTime = e.target.value / 1000 * A.duration;
      syncMediaPosition();
    }
    updateSeekFill();
  };

  A.onplay = () => {
    unlocked = true;
    startSpin();
    $('#ppi').innerHTML = IC.pause;
    $('#pp').setAttribute('aria-label', 'Pause');
    bindMediaSessionHandlers();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    syncMediaPosition();
  };

  A.onpause = () => {
    stopSpin();
    $('#ppi').innerHTML = IC.play;
    $('#pp').setAttribute('aria-label', 'Play');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    syncMediaPosition();
  };

  A.onloadedmetadata = () => {
    syncMediaPosition();
  };

  A.ontimeupdate = () => {
    if (!A.getAttribute('src') || A.src.startsWith('data:')) return;
    $('#time').textContent = fmt(A.currentTime);
    if (isFinite(A.duration)) {
      $('#seek').value = A.currentTime / A.duration * 1000;
      updateSeekFill();
    }
  };

  A.onended = () => {
    if (repeatMode === 'one') playIdx(idx);
    else step(1);
  };

  A.onerror = async () => {
    if (!A.getAttribute('src') || A.src.startsWith('data:')) return;
    const sessionAtError = playSessionId;
    const pathToRetry = activeTrackPath || (tracks[idx] && tracks[idx].path_lower);

    if (pathToRetry && !retriedCurrentSrc) {
      retriedCurrentSrc = true;
      delete linkCache[pathToRetry];
      try {
        const freshLink = await getLink(pathToRetry, true);
        if (sessionAtError !== playSessionId) return;
        A.src = freshLink;
        A.load();
        await A.play();
        return;
      } catch (e) {
        if (sessionAtError !== playSessionId) return;
      }
    }

    stopSpin();
    say('Cannot play this file');
  };

  document.addEventListener('visibilitychange', () => {
    if (!('mediaSession' in navigator)) return;
    bindMediaSessionHandlers();
    if (A.getAttribute('src') && !A.src.startsWith('data:')) {
      navigator.mediaSession.playbackState = (!A.paused && !A.ended) ? 'playing' : 'paused';
      syncMediaPosition();
    }
  });
}
