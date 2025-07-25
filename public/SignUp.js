import { generateStarField } from "./utils.js";

generateStarField(document.querySelector('.rhs'))

function updateOverlay() {
  const overlay = document.querySelector('.lhs');

  const screenHeight = window.innerHeight;

  overlay.style.height = `${screenHeight * 2}px`; 
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);

window.onload = () => {
    const reqs = document.querySelectorAll('.req');

    reqs.forEach((el, i) => {
        const baseDelay = 1.5; 
        const extraDelay = 0.1 * i; 
        el.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
    });
}