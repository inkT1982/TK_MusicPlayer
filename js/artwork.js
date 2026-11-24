/* ==========================================================
   artwork.js — cover art: embedded ID3 extraction + throttled folder-art queue
   ========================================================== */

async function extractEmbeddedArt(audioUrl) {
  if (!window.jsmediatags) return '';
  try {
    const response = await fetch(audioUrl);
    if (!response.ok || !response.body) return '';
    const reader = response.body.getReader();
    let chunks = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      if (receivedLength >= 256 * 1024) {
        try { await reader.cancel(); } catch (e) {}
        break;
      }
    }

    let position = 0;
    let totalArray = new Uint8Array(receivedLength);
    for (let chunk of chunks) {
      totalArray.set(chunk, position);
      position += chunk.length;
    }

    const blob = new Blob([totalArray]);

    return new Promise(resolve => {
      window.jsmediatags.read(blob, {
        onSuccess: tag => {
          const pic = tag.tags && tag.tags.picture;
          if (pic && pic.data) {
            let base64 = '';
            const bytes = new Uint8Array(pic.data);
            for (let i = 0; i < bytes.byteLength; i++) base64 += String.fromCharCode(bytes[i]);
            resolve(`data:${pic.format || 'image/jpeg'};base64,${window.btoa(base64)}`);
          } else {
            resolve('');
          }
        },
        onError: () => resolve('')
      });
    });
  } catch (e) {
    return '';
  }
}

function pumpFolderArtQueue() {
  if (isAnimating) {
    setTimeout(pumpFolderArtQueue, 250);
    return;
  }
  while (activeFolderArtWorkers < MAX_FOLDER_ART_CONCURRENCY && folderArtQueue.length > 0) {
    const job = folderArtQueue.shift();
    activeFolderArtWorkers++;
    runFolderArtJob(job.folderPath)
      .then(job.resolve)
      .catch(() => job.resolve(''))
      .finally(() => {
        activeFolderArtWorkers--;
        pumpFolderArtQueue();
      });
  }
}

async function runFolderArtJob(folderPath) {
  if (folderArtCache[folderPath] !== undefined) return folderArtCache[folderPath];
  try {
    let subJ = await api('files/list_folder', { path: folderPath, recursive: false, include_mounted_folders: true });
    let subEntries = subJ.entries || [];

    const imgFile = subEntries.find(isImage);
    if (imgFile) {
      const linkRes = await api('files/get_temporary_link', { path: imgFile.path_lower });
      folderArtCache[folderPath] = linkRes.link;
      return linkRes.link;
    }

    const audioFiles = subEntries.filter(isAudio);
    if (audioFiles.length > 0) {
      const audioLink = await getLink(audioFiles[0].path_lower);
      const embeddedArt = await extractEmbeddedArt(audioLink);
      if (embeddedArt) {
        folderArtCache[folderPath] = embeddedArt;
        return embeddedArt;
      }
    }
  } catch (e) {}
  folderArtCache[folderPath] = '';
  return '';
}

function getFolderArt(folderPath) {
  if (folderArtCache[folderPath] !== undefined) {
    return Promise.resolve(folderArtCache[folderPath]);
  }
  return new Promise(resolve => {
    folderArtQueue.push({ folderPath, resolve });
    pumpFolderArtQueue();
  });
}

async function resolveAlbumCoverAsync(loadSession, albumPath, audioFiles, folderView) {
  let resolvedCover = '';
  const imgFile = folderView.find(isImage);
  if (imgFile) {
    try {
      const linkRes = await api('files/get_temporary_link', { path: imgFile.path_lower });
      resolvedCover = linkRes.link;
    } catch (e) {}
  }

  if (!resolvedCover && audioFiles.length > 0) {
    try {
      const firstLink = await getLink(audioFiles[0].path_lower);
      resolvedCover = await extractEmbeddedArt(firstLink);
    } catch (e) {}
  }

  if (!resolvedCover || loadSession !== playSessionId || currentAlbumPath !== albumPath) return;

  folderArtCache[albumPath] = resolvedCover;
  folderCoverUrl = resolvedCover;
  coverUrl = resolvedCover;
  draw();
  drawLib();
}
