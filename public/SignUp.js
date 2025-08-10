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

fetch("/api/check-auth", { credentials: "include" })
  .then(res => res.json())
  .then(data => {
      if (data.is_auth) {
          window.location.href = "/user/Main";
      }
  })
  .catch(err => console.error(err));

  const reqs = document.querySelectorAll(".frm .req");

  reqs.forEach((el, i) => {
    const baseDelay = 1.5;
    const extraDelay = 0.1 * i;
    el.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
  });
});

document.querySelector(".rf").addEventListener("click", () => {
  outro("/AboutUs");
});

document.querySelector(".lf").addEventListener("click", () => {
  window.location.href = "/";
});

document.querySelector(".submit").addEventListener("click", ()=> {
  const sub_btn = document.getElementById("submit");
  const gmailI = document.getElementById("gmailI");
  const verifI = document.getElementById("verifI");
  const msgT = document.getElementById("msgT");

  sub_btn.addEventListener("click", (_) => {
      msgT.textContent = "- loading -"
      if (verifI.disabled) {
          fetch("/api/sign-up", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              gmail: gmailI.value
          })
          })
          .then(res => res.json())
          .then(data => {
              if(data.error){
                  msgT.textContent = `-${data.error}-`;
              }else{
                  msgT.textContent = `-${data.message}-`;
                  verifI.disabled = false;
                  sub_btn.textContent = "Verify";
              }
          })
          .catch(err => {
              msgT.textContent = `[${JSON.stringify(err)}]`;
          });

      }else{
          fetch("/api/verify", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              gmail: gmailI.value,
              code: verifI.value
          })
          })
          .then(res => res.json())
          .then(data => {
              if(data.error){
                  msgT.textContent = `-${data.error}-`;
              }else{
                  msgT.textContent = `-${data.message}-`;
                  verifI.disabled = false;
                  sub_btn.textContent = "Verify";
              }
          })
          .catch(err => {
              msgT.textContent = `[${JSON.stringify(err)}]`;
          });

      }
  })
})