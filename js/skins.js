/* ==========================================================
   skins.js — skin switcher (loaded in <head>, right after the skin <link>s)

   Skins are declared in index.html, NOT here:
     <link rel="stylesheet" href="css/skins/xyz.css" data-skin="xyz" data-name="Display Name">
   The first one is the default. This file never needs editing to add a skin.
   ========================================================== */

(function () {
  const KEY = 'tk_skin';   // localStorage key for the remembered skin

  const skinLinks = () => Array.from(document.querySelectorAll('link[data-skin]'));

  // Enable one skin's stylesheet and disable all the others
  function applySkin(id, announce) {
    const all = skinLinks();
    if (!all.length) return;
    const target = all.find(l => l.dataset.skin === id) || all[0];   // unknown id -> default (first)

    all.forEach(l => { l.disabled = (l !== target); });
    document.documentElement.dataset.skin = target.dataset.skin;
    try { localStorage.setItem(KEY, target.dataset.skin); } catch (e) {}

    if (announce) {
      const msg = document.getElementById('msg');
      if (!msg) return;
      const prev = msg.textContent;
      const text = 'Skin: ' + (target.dataset.name || target.dataset.skin);
      msg.textContent = text;
      setTimeout(() => { if (msg.textContent === text) msg.textContent = prev; }, 1500);
    }
  }

  function cycleSkin() {
    const all = skinLinks();
    const i = all.findIndex(l => !l.disabled);
    applySkin(all[(i + 1) % all.length].dataset.skin, true);
  }

  // Apply the saved skin immediately (before the page is painted)
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  applySkin(saved);

  // Hook up the header button once the DOM exists
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('skin-toggle');
    if (btn) btn.onclick = cycleSkin;
  });
})();
