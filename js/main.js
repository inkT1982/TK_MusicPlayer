/* ==========================================================
   main.js — application bootstrap (loaded last)
   ========================================================== */

initSkins();
bindControls();
bindMediaSessionHandlers();
initAuth();   // handles OAuth redirect, restores session, opens the library
