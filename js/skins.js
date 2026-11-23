/* ==========================================================
   skins.js — skin registry and switcher
   To add a skin: create css/skins/<id>.css, then add an entry here.
   ========================================================== */

const SKINS = [
  { id: 'default', name: 'TK-100' },
  { id: 'mp1',     name: 'MP1' }
];
const DEFAULT_SKIN = SKINS[0].id;

let currentSkin = DEFAULT_SKIN;

function getSkin(id) {
  return SKINS.find(s => s.id === id) || SKINS[0];
}

// Swap the skin stylesheet without a flash: load the new one first, then drop the old one.
function applySkin(id, { announce = false } = {}) {
  const skin = getSkin(id);
  const oldLink = $('#skin-css');
  const prevMsg = $('#msg').textContent;

  const finish = () => {
    currentSkin = skin.id;
    document.documentElement.dataset.skin = skin.id;
    try { localStorage.setItem(STORAGE_SKIN, skin.id); } catch (e) {}
    updateSeekFill();
    if (announce) {
      const text = `Skin: ${skin.name}`;
      say(text);
      setTimeout(() => { if ($('#msg').textContent === text) say(prevMsg); }, 1500);
    }
  };

  // Already showing this skin's stylesheet (page-load path)
  if (oldLink && oldLink.getAttribute('href') === `css/skins/${skin.id}.css`) {
    finish();
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `css/skins/${skin.id}.css`;
  link.onload = () => {
    if (oldLink) oldLink.remove();
    link.id = 'skin-css';
    finish();
  };
  link.onerror = () => {
    link.remove();
    if (announce) say('Skin failed to load');
  };
  document.head.appendChild(link);
}

function cycleSkin() {
  const i = SKINS.findIndex(s => s.id === currentSkin);
  applySkin(SKINS[(i + 1) % SKINS.length].id, { announce: true });
}

function initSkins() {
  let saved = DEFAULT_SKIN;
  try { saved = localStorage.getItem(STORAGE_SKIN) || DEFAULT_SKIN; } catch (e) {}
  applySkin(getSkin(saved).id);   // falls back to the default if the saved skin no longer exists
  $('#skin-toggle').onclick = cycleSkin;
}
