import { generateStarField, outro } from "./utils.js";

generateStarField(document.querySelector(".rhs"));

function updateOverlay() {
  const overlay = document.querySelector(".lhs");
  const screenHeight = window.innerHeight;
  overlay.style.height = `${screenHeight * 2}px`;
}

window.addEventListener("load", updateOverlay);
window.addEventListener("resize", updateOverlay);

window.addEventListener("load", () => {
  const reqs = document.querySelectorAll(".anim");

  reqs.forEach((el, i) => {
    const baseDelay = 1.5;
    const extraDelay = 0.1 * i;
    el.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
  });
});

document.querySelector(".rf").addEventListener("click", () => {
  const hr = document.querySelector(".hr");             
  hr.classList.add("shrink");           
  const hrad = document.querySelector(".hrad");
  hrad.classList.add("shrink");
  document.querySelector(".frm").style.animation = "fadeOut 0.5s cubic-bezier(0,0.4,.8,1) forwards";
  outro("/public/Main.html");
});

document.querySelector(".lf").addEventListener("click", () => {
  window.location.href = "/public/";
});

const ecoActions = [
  { action: "Other", pts: null },
  { action: "Trees Planted", pts: 10 },
  { action: "Pages Reused", pts: 3 },
  { action: "Trash Picked", pts: 5 },
  { action: "Distance Walked", pts: 6 },
  { action: "Items Recycled", pts: 4 },
  { action: "Clothes Donated", pts: 5 },
  { action: "Reusables Used", pts: 3 },
  { action: "Plastic Refused", pts: 4 },
  { action: "Compost Made", pts: 6 },
  { action: "Books Borrowed", pts: 2 },
  { action: "Items Repaired", pts: 7 },
  { action: "Plants Grown", pts: 5 },
  { action: "Switches Turned Off", pts: 4 },
  { action: "E-waste Disposed", pts: 6 },
  { action: "Digital Cleaned", pts: 2 },
  { action: "Awareness Shared", pts: 3 },
  { action: "Events Attended", pts: 7 },
  { action: "Water Saved", pts: 4 },
  { action: "Petitions Signed", pts: 3 }
];


let atitem = -1;

let item = document.querySelector(".item");
let ptsI = document.querySelector(".ptsI");
let amt = document.querySelector(".amt");
amt.value = 0;

item.addEventListener("click", ()=>{
  atitem += 1;
  item.value = ecoActions[atitem % ecoActions.length].action;
  ptsI.value = ecoActions[atitem % ecoActions.length].pts * amt.value;
})

amt.addEventListener("change", ()=>{
  ptsI.value = ecoActions[atitem % ecoActions.length].pts * amt.value;
})


