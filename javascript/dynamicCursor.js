// Dynamic Cursor Effect
const cursorLight = document.getElementById("cursor-light");
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.add("cursor-active");
});

document.addEventListener("mouseleave", () => {
    document.body.classList.remove("cursor-active");
});

function animateLight() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    if (cursorLight) {
        cursorLight.style.left = `${currentX}px`;
        cursorLight.style.top = `${currentY}px`;
    }
    requestAnimationFrame(animateLight);
}


// Initial state
animateLight();