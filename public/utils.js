export function generateStarField(target = document.body) {
    const totalStars = 150;

    Array.from({ length: totalStars }).forEach(() => {
        const sparkle = document.createElement('div');
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