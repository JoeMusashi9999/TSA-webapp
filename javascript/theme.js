const themeToggle = document.getElementById("themeToggle");
const themeTransition = document.getElementById("themeTransition");

const STORAGE_KEY = "communityhub-theme";

function getCurrentTheme() {
  return document.body.classList.contains("theme-dark") ? "dark" : "light";
}

function applySavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.remove("theme-dark");
  }

  updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
  if (!themeToggle) return;
  themeToggle.textContent = getCurrentTheme() === "dark" ? "Dark" : "Light";
}

function animateThemeTransition(nextTheme, originX, originY) {
  if (!themeTransition) {
    setTheme(nextTheme);
    return;
  }

  themeTransition.className = "theme-transition is-animating";
  themeTransition.classList.add(nextTheme === "dark" ? "to-dark" : "to-light");

  const maxX = Math.max(originX, window.innerWidth - originX);
  const maxY = Math.max(originY, window.innerHeight - originY);
  const finalRadius = Math.sqrt(maxX * maxX + maxY * maxY);

  themeTransition.style.clipPath = `circle(0px at ${originX}px ${originY}px)`;

  requestAnimationFrame(() => {
    themeTransition.style.transition = "clip-path 520ms cubic-bezier(.22,.85,.25,1), opacity 120ms ease";
    themeTransition.style.clipPath = `circle(${finalRadius}px at ${originX}px ${originY}px)`;
  });

  setTimeout(() => {
    setTheme(nextTheme);
  }, 260);

  setTimeout(() => {
    themeTransition.className = "theme-transition";
    themeTransition.style.transition = "";
    themeTransition.style.clipPath = "";
  }, 560);
}

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.remove("theme-dark");
  }

  localStorage.setItem(STORAGE_KEY, theme);
  updateThemeToggleLabel();
}

themeToggle?.addEventListener("click", (e) => {
  const rect = themeToggle.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  animateThemeTransition(nextTheme, originX, originY);
});

applySavedTheme();