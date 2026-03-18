const SEARCH_DATA_URL = "./src/place.json";
const MAX_SUGGESTIONS = 8;

let globalSearchPlaces = [];
let globalSearchLoaded = false;

function gsNormalize(str) {
  return (str || "").toLowerCase().trim();
}

function gsSplitTags(tagValue) {
  if (Array.isArray(tagValue)) {
    return tagValue.map(t => gsNormalize(t)).filter(Boolean);
  }

  const raw = String(tagValue || "").trim();
  if (!raw) return [];

  if (raw.includes("|")) {
    return raw.split("|").map(t => gsNormalize(t)).filter(Boolean);
  }
  if (raw.includes(",")) {
    return raw.split(",").map(t => gsNormalize(t)).filter(Boolean);
  }

  return raw.split(/\s+/).map(t => gsNormalize(t)).filter(Boolean);
}

function gsEscapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function scorePlace(place, query) {
  const q = gsNormalize(query);
  if (!q) return -1;

  const title = gsNormalize(place.title);
  const category = gsNormalize(place.category);
  const subcategory = gsNormalize(place.subcategory);
  const desc = gsNormalize(place.short_description);
  const tags = gsSplitTags(place.tags);

  const haystack = `${title} ${category} ${subcategory} ${desc} ${tags.join(" ")}`;
  const terms = q.split(/\s+/).filter(Boolean);

  if (!terms.every(term => haystack.includes(term))) {
    return -1;
  }

  let score = 0;

  if (title === q) score += 100;
  if (title.startsWith(q)) score += 40;
  if (title.includes(q)) score += 25;
  if (category.includes(q)) score += 10;
  if (subcategory.includes(q)) score += 8;
  if (tags.some(tag => tag === q)) score += 20;
  if (tags.some(tag => tag.includes(q))) score += 10;
  if (desc.includes(q)) score += 5;

  return score;
}

function getPlaceUrl(place) {
  const id = String(place.id || "").trim();
  return id ? `./place.html?id=${encodeURIComponent(id)}` : "#";
}

function renderSuggestions(inputEl, suggestionsEl, places, query, activeIndex = -1) {
  const q = gsNormalize(query);

  if (!q) {
    suggestionsEl.hidden = true;
    suggestionsEl.innerHTML = "";
    return;
  }

  const ranked = places
    .map(place => ({ place, score: scorePlace(place, q) }))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score || gsNormalize(a.place.title).localeCompare(gsNormalize(b.place.title)))
    .slice(0, MAX_SUGGESTIONS);

  if (!ranked.length) {
    suggestionsEl.innerHTML = `<div class="search-suggestions-empty">No matching places found.</div>`;
    suggestionsEl.hidden = false;
    return;
  }

  suggestionsEl.innerHTML = ranked.map((item, index) => {
    const place = item.place;
    const tags = gsSplitTags(place.tags).slice(0, 3);
    const href = getPlaceUrl(place);

    return `
      <a class="search-suggestion ${index === activeIndex ? "is-active" : ""}" href="${href}" data-index="${index}">
        <div class="search-suggestion-top">
          <span class="search-suggestion-title">${gsEscapeHtml(place.title || "Untitled")}</span>
          <span class="search-suggestion-category">${gsEscapeHtml(place.category || "Uncategorized")}</span>
        </div>
        <div class="search-suggestion-desc">${gsEscapeHtml(place.short_description || "")}</div>
        <div class="search-suggestion-tags">
          ${tags.map(tag => `<span class="tag">${gsEscapeHtml(tag)}</span>`).join("")}
        </div>
      </a>
    `;
  }).join("");

  suggestionsEl.hidden = false;
}

async function loadGlobalSearchData() {
  if (globalSearchLoaded) return globalSearchPlaces;

  const response = await fetch(SEARCH_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load search data: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("directory.json is not an array");
  }

  globalSearchPlaces = data;
  globalSearchLoaded = true;
  return globalSearchPlaces;
}

function setupSearchSuggestions(inputEl, suggestionsEl, places) {
  let activeIndex = -1;

  const refresh = () => {
    renderSuggestions(inputEl, suggestionsEl, places, inputEl.value, activeIndex);
  };

  inputEl.addEventListener("input", () => {
    activeIndex = -1;
    refresh();
  });

  inputEl.addEventListener("focus", () => {
    if (inputEl.value.trim()) {
      refresh();
    }
  });

  inputEl.addEventListener("keydown", (e) => {
    const items = Array.from(suggestionsEl.querySelectorAll(".search-suggestion"));

    if (suggestionsEl.hidden || !items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      refresh();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      refresh();
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        window.location.href = items[activeIndex].getAttribute("href");
      }
    } else if (e.key === "Escape") {
      suggestionsEl.hidden = true;
      activeIndex = -1;
    }
  });

  document.addEventListener("click", (e) => {
    const clickedInside = inputEl.contains(e.target) || suggestionsEl.contains(e.target);
    if (!clickedInside) {
      suggestionsEl.hidden = true;
      activeIndex = -1;
    }
  });
}

async function initGlobalSearch() {
  const inputEl = document.querySelector(".site-search");
  const suggestionsEl = document.getElementById("searchSuggestions");

  if (!inputEl || !suggestionsEl) return;

  try {
    const places = await loadGlobalSearchData();
    setupSearchSuggestions(inputEl, suggestionsEl, places);
  } catch (err) {
    console.error("Global search failed to initialize:", err);
  }
}

initGlobalSearch();