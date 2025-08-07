import { generateStarField, outroWeak } from "./utils.js";

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

    if(reqs.length == 0 ) {
      document.querySelector(".indic").style.opacity = 1;
    }

    document.querySelector(".reqs").style.animation = `fadeInUp 0.5s 1.2s cubic-bezier(.77,0,.175,1) forwards`;

    reqs.forEach((el, i) => {
        const baseDelay = 1.5; 
        const extraDelay = 0.1 * i; 
        el.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
    });
}

document.querySelector(".lf").addEventListener("click", ()=>{
  window.location.href = "/public/";
})

document.querySelector(".reqBtn").addEventListener("click", ()=>{
  const reqBtn = document.querySelector(".reqBtn");
  const mainS = document.querySelector(".reqs");

  reqBtn.style.animation = "fadeOut 0.3s ease-out"; 
  mainS.style.animation = "fadeOutUpHyper 0.2s ease-out";

  outroWeak("/public/Cart.html")
})