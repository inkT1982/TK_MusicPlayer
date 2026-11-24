/* ==========================================================
   disc.js — spinning CD animation loop
   ========================================================== */

function animateSpin(timestamp) {
  if (!isSpinning) return;
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  spinAngle = (spinAngle + delta * 0.06) % 360;
  const rotor = $('#disc-rotor');
  if (rotor) rotor.style.transform = `rotate(${spinAngle}deg)`;
  spinReq = requestAnimationFrame(animateSpin);
}

function startSpin() {
  if (isSpinning) return;
  isSpinning = true;
  lastTime = null;
  spinReq = requestAnimationFrame(animateSpin);
}

function stopSpin() {
  isSpinning = false;
  if (spinReq) {
    cancelAnimationFrame(spinReq);
    spinReq = null;
  }
}
