import { generateStarField } from "./utils.js";

generateStarField()

function updateOverlay() {
  const overlay = document.querySelector('.overlay');

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const angleRad = Math.atan2(screenHeight, screenWidth);
  const angleDeg = angleRad * (180 / Math.PI);

  const requiredWidth = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);

  const buffer = 0.1;
  const extendedWidth = requiredWidth * (1 + buffer);

  overlay.style.width = `${extendedWidth}px`;
  overlay.style.height = `${screenHeight * 2}px`; 
  overlay.style.transformOrigin = 'top left';
  overlay.style.transform = `rotate(${angleDeg}deg)`;
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);

window.onload = () => {
    const hints = document.querySelectorAll('.foot');

    hints.forEach((el, i) => {
        const baseDelay = 0.4; 
        const extraDelay = 0.1 * i; 
        el.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
    });

    document.getElementById("newu").addEventListener("click", ()=>{fade_out(); align();})
};

function fade_out() {
  document.querySelectorAll(".a, .vec, .feet, .head").forEach(el => {
    el.classList.add("fade-out");
  });
}

function align() {
  const overlay = document.querySelector('.overlay');

  document.querySelectorAll('.star').forEach(el => {
    el.style.zIndex = "-1";
  });

  overlay.style.transform = 'rotate(90deg)';
  overlay.style.animation = "finalPush 0.6s 1.4s cubic-bezier(.77,0,.175,1) forwards";

  setTimeout(() => {
    window.location.href = "/public/SignUp.html";
  }, 2000);
}


