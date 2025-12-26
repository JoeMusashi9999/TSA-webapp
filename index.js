const splash = document.getElementById("splash");
const enterBtn = document.getElementById("enterBtn");

const searchInput = document.getElementById("searchInput");
const chips = Array.from(document.querySelectorAll(".chip"));
const cards = Array.from(document.querySelectorAll(".card"));
const resultsMeta = document.getElementById("resultsMeta");

let activeCategory = "all";

// Splash: fade out
function dismissSplash() {
  if (!splash) return;
  splash.classList.add("is-fading");
  enterBtn?.setAttribute("disabled", "true");

  // After animation, remove from the DOM so it is not clickable
  setTimeout(() => {
    splash.remove();
    searchInput?.focus();
  }, 450);
}

enterBtn?.addEventListener("click", dismissSplash);

// Allow Enter or Esc key on splash
document.addEventListener("keydown", (e) => {
  if (!splash) return;
  if (e.key === "Enter" || e.key ==="Escape") dismissSplash();
});

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



// Filtering
function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function matches(card, query, category) {
  const q = normalize(query);
  const c = normalize(category);

  const cardCategory = normalize(card.dataset.category);
  const tags = normalize(card.dataset.tags);
  const title = normalize(card.querySelector("h3")?.textContent);
  const desc = normalize(card.querySelector("p")?.textContent);

  const categoryOk = c === "all" || cardCategory === c;
  if (!categoryOk) return false;

  if (!q) return true;

  // Search in title, description, tags, and category name
  return (
    title.includes(q) ||
    desc.includes(q) ||
    tags.includes(q) ||
    cardCategory.includes(q)
  );
}

function updateResults() {
  const query = searchInput?.value ?? "";
  let shown = 0;

  cards.forEach((card) => {
    const ok = matches(card, query, activeCategory);
    card.style.display = ok ? "" : "none";
    if (ok) shown += 1;
  });

  if (resultsMeta) {
    const q = normalize(query);
    const catLabel = activeCategory === "all" ? "All categories" : `Category: ${activeCategory}`;
    const queryLabel = q ? `Search: "${q}"` : "No search";
    resultsMeta.textContent = `${shown} result(s). ${catLabel}. ${queryLabel}.`;
  }
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeCategory = chip.dataset.filter || "all";
    updateResults();
  });
});

searchInput?.addEventListener("input", updateResults);

// Initial state
updateResults();
animateLight();
