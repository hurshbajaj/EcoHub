function updateOverlay() {
  const overlay = document.querySelector('.lhs');

  const screenHeight = window.innerHeight;

  overlay.style.height = `${screenHeight * 2}px`; 
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);