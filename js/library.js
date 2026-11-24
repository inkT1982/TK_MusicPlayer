/* ==========================================================
   library.js — folder browsing and the library drawer UI
   ========================================================== */

async function openFolder(path, autoLoadAlbum = false) {
  const fSession = ++folderSessionId;
  say('Reading…');
  try {
    let j = await api('files/list_folder', { path: path, recursive: false, include_mounted_folders: true });
    let entries = j.entries || [];
    while (j.has_more && j.cursor) {
      j = await api('files/list_folder/continue', { cursor: j.cursor });
      entries = entries.concat(j.entries || []);
    }
    if (fSession !== folderSessionId) return;

    view = entries
      .filter(f => f['.tag'] === 'folder' || isAudio(f) || isImage(f))
      .sort((a, b) => ((b['.tag'] === 'folder' ? 1 : 0) - (a['.tag'] === 'folder' ? 1 : 0)) || a.name.localeCompare(b.name, undefined, { numeric: true }));

    const audioFiles = view.filter(isAudio);
    const currentFolder = stack[stack.length - 1];

    if (stack.length === 1) {
      say('Choose a CD folder');
    } else if (audioFiles.length > 0) {
      const badge = isMiniSingle(tracks) ? ' [8cm Single]' : '';
      say(tracks.length > 0 && currentAlbumPath === currentFolder.path ? `CD Loaded: ${disc}${badge}` : 'CD ready - choose a track');
    } else {
      say(view.some(f => f['.tag'] === 'folder') ? 'Choose a sub-folder' : 'Folder is empty');
    }

    drawLib();
    draw();

    if (autoLoadAlbum && audioFiles.length > 0 && currentAlbumPath !== currentFolder.path) {
      await loadAlbumIntoTray(audioFiles, currentFolder.name, currentFolder.path, view, 0, false);
    }
  } catch (e) {
    if (fSession !== folderSessionId) return;
    say('Error: ' + e.message);
    showLogin('Connection failed: ' + e.message + '. Please check authorization.');
  }
}

function drawLib() {
  const lib = $('#lib');
  const currentFolder = stack[stack.length - 1];
  lib.innerHTML = `<h2>${stack.length === 1 && !tracks.length ? 'Choose a CD' : stack.map(s => s.name).join(' / ')}</h2>`;
  if (stack.length > 1) {
    lib.append(row('↑', 'Back', null, () => {
      stack.pop();
      openFolder(stack[stack.length - 1].path, false);
    }));
  }

  const files = view.filter(isAudio);
  const hasSubfolders = view.some(f => f['.tag'] === 'folder');

  view.forEach(f => {
    if (f['.tag'] === 'folder') {
      const r = rowWithThumb('▸', f.name, f.path_lower, () => {
        stack.push({ path: f.path_lower, name: f.name });
        openFolder(f.path_lower, true);
      });
      lib.append(r);
    } else if (isAudio(f)) {
      const n = files.indexOf(f);
      const albumSnapshot = files.slice();
      const viewSnapshot = view.slice();
      const folderPath = currentFolder.path;
      const folderName = currentFolder.name;
      const r = row(pad(n + 1), clean(f.name), null, async () => {
        if (isAnimating && pendingTrayRequest && pendingTrayRequest.albumPath === folderPath) {
          pendingTrayRequest.startIdx = n;
          pendingTrayRequest.autoPlayAfterLoad = true;
          return;
        }
        if (currentAlbumPath !== folderPath) {
          await loadAlbumIntoTray(albumSnapshot, folderName, folderPath, viewSnapshot, n, true);
        } else if (isAnimating) {
          pendingTrayRequest = {
            audioFiles: albumSnapshot,
            albumName: folderName,
            albumPath: folderPath,
            folderView: viewSnapshot,
            startIdx: n,
            autoPlayAfterLoad: true
          };
        } else {
          playIdx(n);
        }
      });
      if (currentAlbumPath === folderPath && idx === n) r.classList.add('cur');
      lib.append(r);
    }
  });

  if (!hasSubfolders && files.length === 0) {
    lib.insertAdjacentHTML('beforeend', '<p class="note">This folder has no music or sub-folders.</p>');
  }

  const so = document.createElement('button');
  so.className = 'mini';
  so.style.marginTop = '12px';
  so.textContent = 'Sign out';
  so.onclick = signOut;
  lib.append(so);
}

function row(n, t, thumbUrl, fn) {
  const d = document.createElement('div');
  d.className = 'row';
  d.tabIndex = 0;
  d.setAttribute('role', 'button');
  const icon = document.createElement('i');
  icon.textContent = n;
  const img = document.createElement('img');
  img.className = 'thumb';
  if (thumbUrl) {
    img.src = thumbUrl;
    img.style.display = 'block';
    icon.style.display = 'none';
  }
  const span = document.createElement('span');
  span.textContent = t;
  d.append(icon, img, span);
  d.onclick = fn;
  d.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
  return d;
}

function rowWithThumb(n, t, folderPath, fn) {
  const d = document.createElement('div');
  d.className = 'row';
  d.tabIndex = 0;
  d.setAttribute('role', 'button');
  const icon = document.createElement('i');
  icon.textContent = n;
  const img = document.createElement('img');
  img.className = 'thumb';

  if (currentAlbumPath === folderPath && coverUrl) {
    img.src = coverUrl;
    img.style.display = 'block';
    icon.style.display = 'none';
  } else if (folderArtCache[folderPath]) {
    img.src = folderArtCache[folderPath];
    img.style.display = 'block';
    icon.style.display = 'none';
  } else if (folderArtCache[folderPath] === undefined) {
    getFolderArt(folderPath).then(url => {
      if (url && img.isConnected) {
        img.src = url;
        img.style.display = 'block';
        icon.style.display = 'none';
      }
    });
  }

  const span = document.createElement('span');
  span.textContent = t;
  d.append(icon, img, span);
  d.onclick = fn;
  d.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
  return d;
}
