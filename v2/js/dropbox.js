/* ==========================================================
   dropbox.js — Dropbox API wrapper + temporary link cache
   ========================================================== */

async function getLink(path, forceRefresh = false) {
  if (!forceRefresh && linkCache[path]) return linkCache[path];
  const j = await api('files/get_temporary_link', { path });
  linkCache[path] = j.link;
  return j.link;
}

function prefetchLink(path) {
  if (!path || linkCache[path] || isAnimating) return;
  api('files/get_temporary_link', { path }).then(j => {
    linkCache[path] = j.link;
  }).catch(() => {});
}

async function api(method, params) {
  if (!S || !S.token) throw new Error('Not authenticated');

  let res = await fetch(`https://api.dropboxapi.com/2/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${S.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(`https://api.dropboxapi.com/2/${method}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${S.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
    } else {
      S = null;
      save(null);
      showLogin('Session expired. Please sign in again.');
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const rawText = await res.text();
    let msg = rawText;
    try {
      const errJson = JSON.parse(rawText);
      msg = errJson.error_summary || errJson.user_message || rawText;
    } catch (e) {}
    throw new Error(msg || `Dropbox HTTP ${res.status}`);
  }
  return await res.json();
}
