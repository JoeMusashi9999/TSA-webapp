const splash = document.getElementById("splash");
const enterBtn = document.getElementById("enterBtn");

const searchInput = document.getElementById("searchInput");
const cards = Array.from(document.querySelectorAll(".card"));
const resultsMeta = document.getElementById("resultsMeta");



//Tagbar variables
const tagBar = document.getElementById("tagBar");
let activeTag = "all"; // "all" means no tag filter at all


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

  const tagOk = activeTag === "all" || tags.includes(normalize(activeTag));
  if (!tagOk) return false;

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
    const ok = matches(card, query, "all");
    card.style.display = ok ? "" : "none";
    if (ok) shown += 1;
  });

  // does all the tagging (= 
  if (resultsMeta) {
  const q = normalize(query);
  const catLabel = "All categories";
  const tagLabel = activeTag === "all" ? "All tags" : `Tag: ${activeTag}`;
  const queryLabel = q ? `Search: "${q}"` : "No search";
  resultsMeta.textContent = `${shown} result(s). ${catLabel}. ${tagLabel}. ${queryLabel}.`;
  }

}

searchInput?.addEventListener("input", updateResults);

//Tagbar functions:

function splitTags(tagString) {
  return normalize(tagString).split(/\s+/).filter(Boolean);
}

function buildTagBar() {
  if (!tagBar) return;

  // find each unique tag from all cards
  const tagSet = new Set();
  cards.forEach((card) => {
    splitTags(card.dataset.tags || "").forEach((t) => tagSet.add(t));
  });

  // priority for users
  const priority = ["restaurant", "health", "grocery", "education", "utilities"];
  const allTags = Array.from(tagSet);

  // Sorting of results: tags first (if existant), then alphabetically
  allTags.sort((a, b) => a.localeCompare(b));
  const ordered = [
    ...priority.filter((t) => tagSet.has(t)),
    ...allTags.filter((t) => !priority.includes(t)),
  ];

  // Buttons!
  tagBar.innerHTML = "";

  const makeBtn = (label, value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tagchip" + (activeTag === value ? " is-active" : "");
    btn.dataset.tag = value;
    btn.textContent = label;
    btn.addEventListener("click", () => {
      activeTag = (activeTag === value) ? "all" : value;
      searchInput?.focus();
      syncTagBarActiveState();
      updateResults();
    });
    return btn;
  };

  tagBar.appendChild(makeBtn("All tags", "all"));
  ordered.forEach((t) => tagBar.appendChild(makeBtn(t, t)));
}

function syncTagBarActiveState() {
  if (!tagBar) return;
  tagBar.querySelectorAll(".tagchip").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tag === activeTag);
  });
}



// Initial state
buildTagBar();
updateResults();

