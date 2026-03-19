//Get data for the popup
const placePreviewModal = document.getElementById("placePreviewModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalShortDescription = document.getElementById("modalShortDescription");
const modalTags = document.getElementById("modalTags");
const modalRating = document.getElementById("modalRating");
const modalHours = document.getElementById("modalHours");
const modalPlaceLink = document.getElementById("modalPlaceLink");
const modalWebsiteLink = document.getElementById("modalWebsiteLink");

//searching data
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

function resolveImagePath(image) {
  const img = String(image || "").trim();

  if (!img) return "";

  // If it's already a full URL, leave it alone
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  // Otherwise assume local image folder
  return `./src/images/${img}`;
}

function formatHours(place) {
  if (place.hours && typeof place.hours === "object") {
    return [
      ["Sunday", place.hours.sunday],
      ["Monday", place.hours.monday],
      ["Tuesday", place.hours.tuesday],
      ["Wednesday", place.hours.wednesday],
      ["Thursday", place.hours.thursday],
      ["Friday", place.hours.friday],
      ["Saturday", place.hours.saturday],
    ];
  }

  return [
    ["Sunday", place.SUNDAYhours],
    ["Monday", place.MONDAYhours],
    ["Tuesday", place.TUESDAYhours],
    ["Wednesday", place.WEDNESDAYhours],
    ["Thursday", place.THURSDAYhours],
    ["Friday", place.FRIDAYhours],
    ["Saturday", place.SATURDAYhours],
  ];
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

//modal logic
function openPlacePreviewModal(place) {
  if (!placePreviewModal || !place) return;

  modalTitle.textContent = place.title || "Untitled";
  modalShortDescription.textContent = place.short_description || "No description available.";

  const tags = splitTags(place.tags);
  modalTags.innerHTML = tags.length
    ? tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
    : `<span class="tag">No tags</span>`;

  const rating = place.rating_estimate ? String(place.rating_estimate) : "N/A";
  const reviews = place.review_count_estimate ? String(place.review_count_estimate) : "N/A";
  modalRating.textContent = `Rating: ${rating} · Reviews: ${reviews}`;

  const hours = formatHours(place).filter(([, value]) => value && String(value).trim());
  modalHours.innerHTML = hours.length
    ? hours.map(([day, value]) => `
        <div class="hours-row">
          <span class="hours-day">${escapeHtml(day)}</span>
          <span class="hours-time">${escapeHtml(value)}</span>
        </div>
      `).join("")
    : `<p class="modal-meta">No hours available.</p>`;

  modalPlaceLink.href = place.id
    ? `./place.html?id=${encodeURIComponent(place.id)}`
    : "#";

  if (place.website && String(place.website).trim()) {
    const href = /^https?:\/\//i.test(place.website.trim())
      ? place.website.trim()
      : `https://${place.website.trim()}`;

    modalWebsiteLink.href = href;
    modalWebsiteLink.style.display = "";
  } else {
    modalWebsiteLink.href = "#";
    modalWebsiteLink.style.display = "none";
  }

  placePreviewModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closePlacePreviewModal() {
  if (!placePreviewModal) return;
  placePreviewModal.hidden = true;
  document.body.classList.remove("modal-open");
}


// render pipeline
function createCard(place) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.category = normalize(place.category || "");
  article.dataset.tags = splitTags(place.tags).join(" ");
  article.setAttribute("role", "button");
  article.setAttribute("tabindex", "0");
  article.setAttribute("aria-label", `Preview ${place.title || "place"}`);

  const safeTitle = escapeHtml(place.title || "Untitled");
  const safeCategory = escapeHtml(place.category || "Uncategorized");
  const safeDescription = escapeHtml(place.short_description || "");
  const placeHref = place.id
    ? `./place.html?id=${encodeURIComponent(place.id)}`
    : "#";

  const visibleTags = splitTags(place.tags).slice(0, 3);

  article.innerHTML = `
    <div class="card-link">
      <div class="card-top">
        <h3>${safeTitle}</h3>
        <span class="badge">${safeCategory}</span>
      </div>
      <p>${safeDescription}</p>
      <div class="card-tags">
        ${visibleTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <a class="card-cta-link" href="${placeHref}">[Open Page]</a>
    </div>
  `;

  article.addEventListener("click", () => {
    openPlacePreviewModal(place);
  });

  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPlacePreviewModal(place);
    }
  });

  const directLink = article.querySelector(".card-cta-link");
  directLink?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

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
//event listeners (spelled it right this time!)
modalCloseBtn?.addEventListener("click", closePlacePreviewModal);

placePreviewModal?.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close-modal")) {
    closePlacePreviewModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && placePreviewModal && !placePreviewModal.hidden) {
    closePlacePreviewModal();
  }
});

// load data from file (=
async function loadPlaces() {
  try {
    const response = await fetch("./src/place.json");
    console.log("Fetch response:", response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("Loaded JSON:", data);

    if (!Array.isArray(data)) {
      throw new Error("directory.json is not an array");
    }

    places = data;
    buildTagBar();
    renderPlaces();
  } catch (err) {
    console.error("Failed to load directory.json:", err);

    if (resultsMeta) {
      resultsMeta.textContent = "Failed to load directory data.";
    }
  }
}

// Init
searchInput?.addEventListener("input", renderPlaces);

loadPlaces();