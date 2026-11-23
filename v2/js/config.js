/* ==========================================================
   config.js — constants and static configuration
   ========================================================== */

// Dropbox app key (public identifier, safe to ship in client code)
const CLIENT_ID = 'dtcnff0rr7py9qc';

// localStorage keys
const STORAGE_AUTH = 'tk_dbx_auth';
const STORAGE_VERIFIER = 'tk_verifier';
const STORAGE_SKIN = 'tk_skin';

// 1-frame silent WAV, used to unlock audio playback on iOS/Safari
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

// Play/pause icon paths
const IC = {
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'
};

// Repeat button icon paths
const REP_IC = {
  loop: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  one: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="15.5" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace, monospace" fill="currentColor" stroke="none">1</text>'
};

// Max parallel folder-cover lookups
const MAX_FOLDER_ART_CONCURRENCY = 2;
