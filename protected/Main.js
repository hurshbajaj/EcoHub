import { generateStarField, outroStrong, assign_auth } from "./utils.js";

generateStarField(document.querySelector('.rhs'));

function updateOverlay() {
  const overlay = document.querySelector('.lhs');
  const screenHeight = window.innerHeight;
  overlay.style.height = `${screenHeight * 2}px`;
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);

window.onload = async () => {
  await assign_auth();

  const reqsContainer = document.querySelector(".reqs");
  reqsContainer.innerHTML = ""; 

  try {
    const res = await fetch("/api/requests", { credentials: "include" });
    const data = await res.json();

    if (!data || data.length === 0) {
      document.querySelector(".indic").style.opacity = 1;
    } else {
      document.querySelector(".indic").style.opacity = 0;

      data.forEach((req, i) => {
        const reqEl = document.createElement("div");
        reqEl.classList.add("req");

        reqEl.innerHTML = `
          <p class="req_sub">${req.item} - ${req.pts} pts</p>
          <p class="desc">${req.desc}</p>
        `;

        const baseDelay = 1.5;
        const extraDelay = 0.1 * i;
        reqEl.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;

        reqsContainer.appendChild(reqEl);
      });
    }
  } catch (err) {
    console.error("Error fetching requests:", err);
    document.querySelector(".indic").textContent = "Error loading requests.";
    document.querySelector(".indic").style.opacity = 1;
  }
};

document.querySelector(".lf").addEventListener("click", () => {
  window.location.href = "/";
});

document.querySelector(".reqBtn").addEventListener("click", () => {
  document.querySelector(".reqBtn").style.animation = "fadeOut 0.3s ease-out";
  document.querySelector(".mp").style.animation = "fadeOut 0.3s ease-out";
  outroStrong("/user/New");
});

document.querySelector(".mp").addEventListener("click", () => {
  document.querySelector(".reqBtn").style.animation = "fadeOut 0.3s ease-out";
  document.querySelector(".mp").style.animation = "fadeOut 0.3s ease-out";
  outroStrong("/user/marketplace");
});

document.getElementById("out").addEventListener("click", () => {
  fetch("/api/out", { 
    method: "GET", 
    credentials: "include" 
  })
  .then(() => {
    window.location.href = "/";
  })
  .catch(err => console.error("Logout failed:", err));
});
