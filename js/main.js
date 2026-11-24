/* ==========================================================
   main.js — application bootstrap (loaded last)
   ========================================================== */

bindControls();
bindMediaSessionHandlers();
initAuth();   // handles OAuth redirect, restores session, opens the library
