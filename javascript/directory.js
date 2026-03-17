const splash = document.getElementById("splash");
const enterBtn = document.getElementById("enterBtn");

const searchInput = document.getElementById("searchInput");
const linksGrid = document.getElementById("linksGrid");
const resultsMeta = document.getElementById("resultsMeta");
const tagBar = document.getElementById("tagBar");

let activeTag = "all";
let places = [];

// helpers for the filtering
function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function splitTags(tagString) {
  if (Array.isArray(tagString)) {
    return tagString.map((t) => normalize(t)).filter(Boolean);
  }

  const raw = String(tagString || "").trim();

  if (!raw) return [];

  // Supports pipe-separated, comma-separated, and space-separated tags
  if (raw.includes("|")) {
    return raw.split("|").map((t) => normalize(t)).filter(Boolean);
  }
  if (raw.includes(",")) {
    return raw.split(",").map((t) => normalize(t)).filter(Boolean);
  }

  return raw.split(/\s+/).map((t) => normalize(t)).filter(Boolean);
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

///silly little filtering function
function matchesPlace(place, query) {
  const q = normalize(query);

  const title = normalize(place.title);
  const category = normalize(place.category);
  const subcategory = normalize(place.subcategory);
  const desc = normalize(place.short_description);
  const tags = splitTags(place.tags);

  const tagOk = activeTag === "all" || tags.includes(normalize(activeTag));
  if (!tagOk) return false;

  if (!q) return true;

  const haystack = `${title} ${category} ${subcategory} ${desc} ${tags.join(" ")}`;
  const terms = q.split(/\s+/).filter(Boolean);

  return terms.every((term) => haystack.includes(term));
}

// render pipeline
function createCard(place) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.category = normalize(place.category || "");
  article.dataset.tags = splitTags(place.tags).join(" ");

  const safeTitle = escapeHtml(place.title || "Untitled");
  const safeCategory = escapeHtml(place.category || "Uncategorized");
  const safeDescription = escapeHtml(place.short_description || "");
  const url = place.website && String(place.website).trim() ? place.website.trim() : "#";

  const visibleTags = splitTags(place.tags).slice(0, 3);

  article.innerHTML = `
    <a class="card-link" href="${escapeHtml(url)}" ${url !== "#" ? 'target="_blank" rel="noopener"' : ""}>
      <div class="card-top">
        <h3>${safeTitle}</h3>
        <span class="badge">${safeCategory}</span>
      </div>
      <p>${safeDescription}</p>
      <div class="card-tags">
        ${visibleTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </a>
  `;

  return article;
}

function renderPlaces() {
  if (!linksGrid) return;

  const query = searchInput?.value ?? "";
  const filtered = places.filter((place) => matchesPlace(place, query));

  linksGrid.innerHTML = "";
  filtered.forEach((place) => {
    linksGrid.appendChild(createCard(place));
  });

  if (resultsMeta) {
    const q = normalize(query);
    const tagLabel = activeTag === "all" ? "All tags" : `Tag: ${activeTag}`;
    const queryLabel = q ? `Search: "${q}"` : "No search";
    resultsMeta.textContent = `${filtered.length} result(s). All categories. ${tagLabel}. ${queryLabel}.`;
  }
}

// tag building
function buildTagBar() {
  if (!tagBar) return;

  const tagSet = new Set();

  places.forEach((place) => {
    splitTags(place.tags).forEach((tag) => tagSet.add(tag));
  });

  const priority = ["restaurant", "health", "grocery", "education", "utilities"];
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  const ordered = [
    ...priority.filter((tag) => tagSet.has(tag)),
    ...allTags.filter((tag) => !priority.includes(tag)),
  ];

  tagBar.innerHTML = "";

  const makeBtn = (label, value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tagchip" + (activeTag === value ? " is-active" : "");
    btn.dataset.tag = value;
    btn.textContent = label;

    btn.addEventListener("click", () => {
      activeTag = activeTag === value ? "all" : value;
      searchInput?.focus();
      syncTagBarActiveState();
      renderPlaces();
    });

    return btn;
  };

  tagBar.appendChild(makeBtn("All tags", "all"));
  ordered.forEach((tag) => {
    tagBar.appendChild(makeBtn(tag, tag));
  });
}

function syncTagBarActiveState() {
  if (!tagBar) return;

  tagBar.querySelectorAll(".tagchip").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tag === activeTag);
  });
}

// load data from file (=
async function loadPlaces() {
  try {
    // Adjust this path if your JSON lives somewhere else
    const response = await fetch("./data/places.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("places.json is not an array");
    }

    places = data;
    buildTagBar();
    renderPlaces();
  } catch (err) {
    console.error("Failed to load places.json:", err);

    if (resultsMeta) {
      resultsMeta.textContent = "Failed to load directory data.";
    }
  }
}

// Init
searchInput?.addEventListener("input", renderPlaces);

loadPlaces();