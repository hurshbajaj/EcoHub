import { generateStarField, outroStrong, assign_auth } from "./utils.js";

generateStarField(document.querySelector('.rhs'))

function updateOverlay() {
  const overlay = document.querySelector('.lhs');
  const screenHeight = window.innerHeight;
  overlay.style.height = `${screenHeight * 2}px`; 
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);

async function loadCartItems() {
  const reqsContainer = document.querySelector(".reqs");
  const indicator = document.querySelector(".indic");
  
  try {
    const res = await fetch("/api/get-auth", { credentials: "include" });
    const userData = await res.json();
    
    if (!res.ok) {
      throw new Error("Failed to get user data");
    }

    const cartRes = await fetch("/api/all-carts", { credentials: "include" });
    const allCartItems = await cartRes.json();
    
    if (!cartRes.ok) {
      throw new Error("Failed to get cart items");
    }

    const authRes = await fetch("/api/get-auth", { credentials: "include" });
    const authData = await authRes.json();
    const currentUserEmail = authData.username + "@gmail.com"; // Reconstruct email

    const userCartItems = allCartItems.filter(item => item.gmail === currentUserEmail);

    reqsContainer.innerHTML = ""; 

    if (userCartItems.length === 0) {
      indicator.style.opacity = 1;
      return;
    }

    indicator.style.opacity = 0;

    userCartItems.forEach((item, i) => {
      const reqEl = document.createElement("div");
      reqEl.classList.add("req");
      reqEl.title = "Click me to cancel this order!";
      
      reqEl.dataset.itemTitle = item.title;
      reqEl.dataset.itemPts = item.pts;
      reqEl.dataset.itemDays = item.daysLeft;

      reqEl.innerHTML = `
        <p class="req_sub">${item.title} - ${item.pts} pts</p>
        <p class="desc">Arriving in ${item.daysLeft} days...</p>
      `;

      reqEl.addEventListener("click", () => cancelOrder(item, reqEl));
      
      reqEl.style.cursor = "pointer";
      reqEl.addEventListener("mouseenter", () => {
        reqEl.style.transform = "scale(1.02)";
        reqEl.style.transition = "transform 0.2s ease";
      });
      reqEl.addEventListener("mouseleave", () => {
        reqEl.style.transform = "scale(1)";
      });

      const baseDelay = 1.5;
      const extraDelay = 0.1 * i;
      reqEl.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;

      reqsContainer.appendChild(reqEl);
    });

  } catch (err) {
    console.error("Error loading cart items:", err);
    indicator.textContent = "Error loading cart items";
    indicator.style.opacity = 1;
  }
}

async function cancelOrder(item, element) {
  const confirmed = confirm(`Are you sure you want to cancel your order for "${item.title}"?\n\nThis action cannot be undone.`);
  
  if (!confirmed) {
    return;
  }

  try {
    element.style.opacity = "0.6";
    element.style.pointerEvents = "none";

    const res = await fetch("/api/cancel-cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        title: item.title,
        pts: item.pts,
        daysLeft: item.daysLeft
      })
    });

    const data = await res.json();

    if (res.ok) {
      element.style.animation = "fadeOutUp 0.3s ease-out forwards";
      
      setTimeout(() => {
        element.remove();
        
        const remainingItems = document.querySelectorAll('.req');
        if (remainingItems.length === 0) {
          document.querySelector(".indic").style.opacity = 1;
        }
      }, 300);

      showNotification("Order cancelled successfully!", "success");
    } else {
      element.style.opacity = "1";
      element.style.pointerEvents = "auto";
      alert(data.error || "Failed to cancel order");
    }
  } catch (err) {
    console.error("Error cancelling order:", err);
    element.style.opacity = "1";
    element.style.pointerEvents = "auto";
    alert("Something went wrong while cancelling the order");
  }
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    background-color: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

window.onload = async () => {
  await assign_auth(); 
  await loadCartItems(); 
}

let about_us = document.querySelector(".rf");
about_us.addEventListener("click", () => {
  outroStrong("/user/marketplace");
})

document.querySelector(".lf").addEventListener("click", () => {
  window.location.href = "/user/Main";
})
