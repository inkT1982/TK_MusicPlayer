/* ==========================================================
   utils.js — small DOM / formatting helpers (no app state)
   ========================================================== */

const $ = s => document.querySelector(s);

const fmt = t => isFinite(t) ? Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') : '--:--';
const pad = n => String(n).padStart(2, '0');
const say = t => $('#msg').textContent = t;
const isAudio = f => f['.tag'] === 'file' && /\.(mp3|flac|m4a|aac|wav|ogg)$/i.test(f.name);
const isImage = f => f['.tag'] === 'file' && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name);
const clean = n => n.replace(/\.[^.]+$/, '');
const isMiniSingle = list => list.length > 0 && list.length <= 4;

function updateSeekFill() {
  const el = $('#seek');
  const pct = (el.value / el.max) * 100;
  // Colours come from the skin (--accent / --scrub-track)
  el.style.background = el.disabled
    ? 'var(--scrub-track)'
    : `linear-gradient(90deg, var(--accent) ${pct}%, var(--scrub-track) ${pct}%)`;
}
