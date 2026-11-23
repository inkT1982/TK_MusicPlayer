/* ==========================================================
   state.js — shared mutable application state
   ========================================================== */

// Audio element
const A = $('#a');

let S = null;
let stack = [{ path: '', name: 'TK_MusicPlayer' }];
let view = [];
let tracks = [];
let disc = '';
let currentAlbumPath = '';
let idx = -1;
let shuffle = false;
let repeatMode = 'off'; // 'off' | 'all' | 'one'
let unlocked = false;
let folderCoverUrl = '';
let coverUrl = '';
let isAnimating = false;
let playSessionId = 0;
let folderSessionId = 0;
let pendingTrayRequest = null;

// Tracks whether the active audio element URL came from linkCache for 1-time refresh on error
let activeTrackPath = '';
let retriedCurrentSrc = false;

// Temporary Dropbox links, keyed by file path
let linkCache = {};

// Folder artwork cache + throttled queue
let folderArtCache = {};
let folderArtQueue = [];
let activeFolderArtWorkers = 0;

// CD spin animation state
let spinAngle = 0, lastTime = null, isSpinning = false, spinReq = null;
