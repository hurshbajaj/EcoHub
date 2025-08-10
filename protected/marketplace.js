import { generateStarField, outroWeak, assign_auth } from "./utils.js";

generateStarField(document.querySelector('.rhs'))

let currentUserPoints = 0; 
let marketplaceItems = []; 

function updateOverlay() {
  const overlay = document.querySelector('.lhs');
  const screenHeight = window.innerHeight;
  overlay.style.height = `${screenHeight * 2}px`; 
}

window.addEventListener('load', updateOverlay);
window.addEventListener('resize', updateOverlay);

async function getUserPoints() {
  try {
    const res = await fetch("/api/get-auth", { credentials: "include" });
    const data = await res.json();
    
    if (res.ok) {
      currentUserPoints = data.pts || 0;
      const ptsElement = document.querySelector(".pts");
      if (ptsElement) {
        ptsElement.textContent = `${currentUserPoints} pts`;
      }
      return currentUserPoints;
    }
    return 0;
  } catch (err) {
    console.error("Error getting user points:", err);
    return 0;
  }
}

async function getMarketplaceItems() {
  try {
    const res = await fetch("/api/marketplace-items", { credentials: "include" });
    const data = await res.json();
    
    if (res.ok) {
      marketplaceItems = data;
      return marketplaceItems;
    }
    return [];
  } catch (err) {
    console.error("Error getting marketplace items:", err);
    return [];
  }
}

async function loadMarketplaceItems() {
  const reqsContainer = document.querySelector(".reqs");
  reqsContainer.innerHTML = ""; 

  if (marketplaceItems.length === 0) {
    document.querySelector(".indic").style.opacity = 1;
    return;
  }

  marketplaceItems.forEach((item, i) => {
    const reqEl = document.createElement("div");
    reqEl.classList.add("req");
    reqEl.dataset.itemId = item._id; 

    const canAfford = currentUserPoints >= item.pts;
    const inStock = item.stock > 0;
    const canPurchase = canAfford && inStock;
    
    reqEl.innerHTML = `
      <div class="rlhs">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="rrhs">
        <p class="rhead">${item.title}</p>
        <div class="details">
          <p class="detail">Eco Pts: ${item.pts}</p>
          <p class="detail">Stock: ${item.stock}</p>
        </div>
        ${!canAfford ? '<p class="detail" style="color: #f44336; font-size: 12px;">Insufficient Points</p>' : ''}
        ${!inStock ? '<p class="detail" style="color: #f44336; font-size: 12px;">Out of Stock</p>' : ''}
      </div>
    `;

    reqEl.addEventListener("click", () => addToCart(item));
    reqEl.style.cursor = canPurchase ? "pointer" : "not-allowed";
    if (!canPurchase) {
      reqEl.style.opacity = "0.6";
    }
    
    reqEl.addEventListener("mouseenter", () => {
      if (canPurchase) {
        reqEl.style.transform = "scale(1.02)";
        reqEl.style.transition = "transform 0.2s ease";
      }
    });
    reqEl.addEventListener("mouseleave", () => {
      reqEl.style.transform = "scale(1)";
    });

    const baseDelay = 1.5;
    const extraDelay = 0.1 * i;
    reqEl.style.animation = `fadeInUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;

    reqsContainer.appendChild(reqEl);
  });
}

async function addToCart(item) {
  if (currentUserPoints < item.pts) {
    showNotification(`Not enough points! You need ${item.pts} points but only have ${currentUserPoints}.`, "error");
    return;
  }

  if (item.stock <= 0) {
    showNotification("This item is out of stock!", "error");
    return;
  }

  try {
    const itemElement = document.querySelector(`[data-item-id="${item._id}"]`);
    itemElement.style.opacity = "0.6";

    const res = await fetch("/api/new-cart", {
      method: "POST",
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
      currentUserPoints = data.remainingPoints;
      
      const ptsElement = document.querySelector(".pts");
      if (ptsElement) {
        ptsElement.textContent = `${currentUserPoints} pts`;
      }

      const itemIndex = marketplaceItems.findIndex(i => i._id === item._id);
      if (itemIndex !== -1) {
        marketplaceItems[itemIndex].stock = data.remainingStock;
      }

      await loadMarketplaceItems();

      showNotification("Order placed successfully! Points deducted.", "success");
    } else {
      const itemElement = document.querySelector(`[data-item-id="${item._id}"]`);
      itemElement.style.opacity = "1";
      showNotification(data.error || "Failed to add item to cart", "error");
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    showNotification("Something went wrong while placing order", "error");
    
    const itemElement = document.querySelector(`[data-item-id="${item._id}"]`);
    itemElement.style.opacity = "1";
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
    max-width: 300px;
    word-wrap: break-word;
  `;

  document.body.appendChild(notification);

  const timeout = type === "error" ? 4000 : 3000;
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, timeout);
}

window.onload = async () => {
  await assign_auth();
  await getUserPoints(); 
  await getMarketplaceItems(); 
  await loadMarketplaceItems(); 

  document.querySelector(".reqs").style.animation = `fadeInUp 0.5s 1.2s cubic-bezier(.77,0,.175,1) forwards`;
}

document.querySelector(".lf").addEventListener("click", () => {
  window.location.href = "/user/Main";
})

document.querySelector(".reqBtn").addEventListener("click", () => {
  const reqBtn = document.querySelector(".reqBtn");
  const mainS = document.querySelector(".reqs");

  reqBtn.style.animation = "fadeOut 0.3s ease-out"; 
  mainS.style.animation = "fadeOutUpHyper 0.2s ease-out";

  outroWeak("/user/Cart")
})
