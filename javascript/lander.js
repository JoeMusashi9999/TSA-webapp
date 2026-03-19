//curated buisnesses!
const SPOTLIGHT_PRIMARY = ["mi_001", "mi_014", "mi_032"];
const SPOTLIGHT_FOOD = ["mi_001", "mi_008", "mi_021"];
const SPOTLIGHT_COMMUNITY = ["mi_071", "mi_093", "mi_104"];

//modal/template elements:
let places = [];
const spotlightGrid = document.getElementById("spotlightGrid");

const spotlightModal = document.getElementById("spotlightModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalShortDescription = document.getElementById("modalShortDescription");
const modalTags = document.getElementById("modalTags");
const modalRating = document.getElementById("modalRating");
const modalHours = document.getElementById("modalHours");
const modalPlaceLink = document.getElementById("modalPlaceLink");
const modalWebsiteLink = document.getElementById("modalWebsiteLink");


// helper functions for the modals
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

function splitTags(tagString) {
  if (Array.isArray(tagString)) {
    return tagString.map((t) => normalize(t)).filter(Boolean);
  }

  const raw = String(tagString || "").trim();
  if (!raw) return [];

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

function getPlaceById(id) {
  return places.find((place) => String(place.id).trim() === String(id).trim());
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
// data loading
async function loadPlaces() {
  try {
    const response = await fetch("./src/place.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("place.json is not an array");
    }

    places = data;
    console.log("Sample IDs:", places.slice(0, 10).map(p => p.id));
    console.log("Loaded spotlight places:", places.length);
    renderSpotlights();
  } catch (err) {
    console.error("Failed to load place.json:", err);
  }
}

function openSpotlightModal(place) {
  if (!spotlightModal || !place) return;

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

  spotlightModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeSpotlightModal() {
  if (!spotlightModal) return;
  spotlightModal.hidden = true;
  document.body.classList.remove("modal-open");
}

//content:
function createSpotlightCard(place) {
  const article = document.createElement("article");
  article.className = "spotlight-tile";
  article.setAttribute("role", "button");
  article.setAttribute("tabindex", "0");
  article.setAttribute("aria-label", `View details for ${place.title || "Untitled"}`);

  const safeTitle = escapeHtml(place.title || "Untitled");
  const safeDescription = escapeHtml(place.short_description || "");
  const safeImage = resolveImagePath(place.image) || "./src/images/PrimarySplash.png";

  const visibleTags = splitTags(place.tags).slice(0, 3);
  const placeHref = place.id
    ? `./place.html?id=${encodeURIComponent(place.id)}`
    : "#";

  article.innerHTML = `
    <div class="spotlight-media">
      <img src="${escapeHtml(safeImage)}" alt="${safeTitle}" loading="lazy" />
    </div>
    <div class="spotlight-body">
      <h2 class="spotlight-name">${safeTitle}</h2>
      <p class="spotlight-desc">${safeDescription}</p>
      <div class="spotlight-meta" aria-label="Tags">
        ${visibleTags.map(tag => `<span class="spotlight-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <a class="spotlight-cta-link" href="${placeHref}">
        [ Open Page ]
      </a>
    </div>
  `;

  article.addEventListener("click", () => {
    openSpotlightModal(place);
  });

  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSpotlightModal(place);
    }
  });

  const directLink = article.querySelector(".spotlight-cta-link");
  directLink?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return article;
}
//spotlight builder:
function renderSpotlights() {
  if (!spotlightGrid) return;

  spotlightGrid.innerHTML = "";

  const spotlightPlaces = SPOTLIGHT_PRIMARY
    .map((id) => {
      const place = getPlaceById(id);
      if (!place) {
        console.warn(`Spotlight ID not found in JSON: ${id}`);
      }
      return place;
    })
    .filter(Boolean);
  if (!spotlightPlaces.length) {
    spotlightGrid.innerHTML = `<p class="section-subtitle">No spotlight places available right now.</p>`;
    return;
  }
  spotlightPlaces.forEach((place) => {
    spotlightGrid.appendChild(createSpotlightCard(place));
  });
}

//misc event listners
modalCloseBtn?.addEventListener("click", closeSpotlightModal);

spotlightModal?.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close-modal")) {
    closeSpotlightModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && spotlightModal && !spotlightModal.hidden) {
    closeSpotlightModal();
  }
});
//init 
loadPlaces();