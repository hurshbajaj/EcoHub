export function generateStarField(target = document.body) {
    const totalStars = 150;

    Array.from({ length: totalStars }).forEach(() => {
        const sparkle = document.createElement('div');
        sparkle.classList.add("stars");
        sparkle.classList.add('star');

        const diameter = 1 + Math.random() * 3;
        Object.assign(sparkle.style, {
            width: `${diameter}px`,
            height: `${diameter}px`,
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`,
            animationDuration: `${1 + Math.random() * 2}s`
        });

        target.appendChild(sparkle);
    })
}

export function outro(url="/public/") {
  document.querySelector(".hotbar").style.animation = "fadeOutUp 0.4s ease-out forwards";
    document.querySelector(".head").style.animation = "headingOut 1.5s ease-out forwards";
    document.querySelector(".hovO").classList.remove("hovO");
    document.querySelector(".hovT").classList.remove("hovT");
    setTimeout(()=>{
      document.querySelector(".feet").style.animation = "feetOut 0.5s cubic-bezier(0,0.4,.8,1) forwards";
    }, 0);
    setTimeout(()=>{
      window.location.href = url;
    }, 500)
}

export function outroWeak(url="/public/") {
  document.querySelector(".hotbar").style.animation = "fadeOutUp 0.4s ease-out forwards";
    document.querySelector(".head").style.animation = "headingOut 1.5s ease-out forwards";
    document.querySelector(".hovO").classList.remove("hovO");
    setTimeout(()=>{
      document.querySelector(".feet").style.animation = "feetOut 0.5s cubic-bezier(0,0.4,.8,1) forwards";
    }, 0);
    setTimeout(()=>{
      window.location.href = url;
    }, 500)
}

export function outroStrong(url="/public/") {
  document.querySelector(".hotbar").style.animation = "fadeOutUp 0.4s ease-out forwards";
    document.querySelector(".head").style.animation = "headingOut 1.5s ease-out forwards";
    document.querySelector(".hovO").classList.remove("hovO");
    setTimeout(()=>{
      document.querySelector(".feet").style.animation = "feetOut 0.5s cubic-bezier(0,0.4,.8,1) forwards";
    }, 0);
    setTimeout(()=>{
      window.location.href = url;
    }, 500)

    const reqs = document.querySelectorAll('.req');

    if(reqs.length == 0 ) {
      document.querySelector(".indic").classList.add("fade-out-f");
    }

    reqs.forEach((el, i) => {
        const baseDelay = 1.5; 
        const extraDelay = 0.1 * i; 
        el.style.animation = `fadeOutUp 0.5s ${baseDelay + extraDelay}s cubic-bezier(.77,0,.175,1) forwards`;
    });
  }

  export async function get_auth() {
    try {
        const res = await fetch("/api/get-auth", {
            method: "GET",
            credentials: "include", 
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            console.error("Failed to get auth:", res.status);
            return null;
        }

        const data = await res.json();

        if ("error" in data) {
          
            return null;
        }

        return {
            username: data.username,
            pts: data.pts
        };
    } catch (err) {
        console.error("Error fetching auth:", err);
        return null;
    }
}

export async function assign_auth(){
  let auth = await get_auth();
  document.querySelector(".name").textContent = auth.username;
  document.querySelector(".pts").textContent = auth.pts;
}
