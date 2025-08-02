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
    });
}

export function outro(url="/public/") {
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