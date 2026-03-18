const placePage = document.getElementById("placePage");
const placeStatus = document.getElementById("placeStatus");

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeBool(value) {
  return String(value || "").toLowerCase() === "true";
}

function formatTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  return String(tags)
    .split(/[|,]/)
    .map(t => t.trim())
    .filter(Boolean);
}

function getPlaceIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

//map loader
function initPlaceMap(place) {
  const lat = Number(place.latitude);
  const lon = Number(place.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

  const mapEl = document.getElementById("placeMap");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map(mapEl).setView([lat, lon], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup(escapeHtml(place.title || "Place"))
    .openPopup();
}


function renderHours(place) {
  const days = [
    ["Sunday", place.SUNDAYhours],
    ["Monday", place.MONDAYhours],
    ["Tuesday", place.TUESDAYhours],
    ["Wednesday", place.WEDNESDAYhours],
    ["Thursday", place.THURSDAYhours],
    ["Friday", place.FRIDAYhours],
    ["Saturday", place.SATURDAYhours],
  ];

  return days
    .map(([day, hours]) => {
      if (!hours) return "";
      return `
        <div class="hours-row">
          <span class="hours-day">${day}</span>
          <span class="hours-time">${escapeHtml(hours)}</span>
        </div>
      `;
    })
    .join("");
}

function renderPlace(place) {
  const tags = formatTags(place.tags);
  const seasonalTags = formatTags(place.seasonal_tags);
  const reviewKeywords = formatTags(place.review_keywords);

  const image = place.image && String(place.image).trim() ? place.image.trim() : "";
  const website = place.website && String(place.website).trim() ? place.website.trim() : "";
  const phone = place.phone && String(place.phone).trim() ? place.phone.trim() : "";
  const address = place.address && String(place.address).trim() ? place.address.trim() : "";

  const familyFriendly = normalizeBool(place.family_friendly);
  const outdoor = normalizeBool(place.outdoor);

  const safeWebsite = website
    ? (/^https?:\/\//i.test(website) ? website : `https://${website}`)
    : "";

  document.title = `${place.title || "Place"} | Community Hub`;

  placePage.innerHTML = `
    <section class="place-hero split-hero">
      <div class="place-header">
        <p class="section-subtitle">
          ${escapeHtml(place.category || "Uncategorized")}
          ${place.subcategory ? ` · ${escapeHtml(place.subcategory)}` : ""}
        </p>

        <h1 class="section-title">${escapeHtml(place.title || "Untitled")}</h1>

        <p class="place-short">
          ${escapeHtml(place.short_description || place.description || "No description available.")}
        </p>

        <div class="place-actions">
          ${safeWebsite ? `<a class="btn btn-primary" href="${escapeHtml(safeWebsite)}" target="_blank" rel="noopener">Visit Website</a>` : ""}
          <a class="btn" href="./discover.html">Back to Directory</a>
        </div>
      </div>

      <div class="place-hero-media">
        ${image
      ? `<img class="place-image" src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}" />`
      : `<div class="place-image place-image-fallback">No image available</div>`
    }
      </div>
    </section>

    <section class="place-grid">
      <article class="place-card place-card-full">
        <h2>Description</h2>
        <p>${escapeHtml(place.description || "No description available.")}</p>
      </article>

      <article class="place-card">
        <h2>Classification</h2>
        <div class="detail-list">
          <div><strong>Title:</strong> ${escapeHtml(place.title || "")}</div>
          <div><strong>Category:</strong> ${escapeHtml(place.category || "")}</div>
          <div><strong>Subcategory:</strong> ${escapeHtml(place.subcategory || "")}</div>
          ${place.price_level ? `<div><strong>Price Level:</strong> ${escapeHtml(place.price_level)}</div>` : ""}
          ${place.popularity_score !== null && place.popularity_score !== undefined && place.popularity_score !== "" ? `<div><strong>Popularity Score:</strong> ${escapeHtml(place.popularity_score)}</div>` : ""}
        </div>
      </article>

      <article class="place-card">
        <h2>Location & Contact</h2>
        <div class="detail-list">
          ${address ? `<div><strong>Address:</strong> ${escapeHtml(address)}</div>` : ""}
          ${place.city ? `<div><strong>City:</strong> ${escapeHtml(place.city)}</div>` : ""}
          ${place.state ? `<div><strong>State:</strong> ${escapeHtml(place.state)}</div>` : ""}
          ${place.zip ? `<div><strong>ZIP:</strong> ${escapeHtml(place.zip)}</div>` : ""}
          ${phone ? `<div><strong>Phone:</strong> ${escapeHtml(phone)}</div>` : ""}
          ${safeWebsite ? `<div><strong>Website:</strong> <a href="${escapeHtml(safeWebsite)}" target="_blank" rel="noopener">${escapeHtml(safeWebsite)}</a></div>` : ""}
        </div>
      </article>

      <article class="place-card">
  <h2>Location</h2>
  <div class="detail-list">
    ${address ? `<div><strong>Address:</strong> ${escapeHtml(address)}</div>` : ""}
    ${place.latitude !== null && place.latitude !== undefined &&
      place.longitude !== null && place.longitude !== undefined
      ? `
          <div id="placeMap" class="place-map"></div>
          <div class="place-actions place-map-actions">
            <a
              class="btn btn-primary"
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.latitude + "," + place.longitude)}"
              target="_blank"
              rel="noopener"
            >
              Get Directions
            </a>
          </div>
        `
      : `<div>No map coordinates available.</div>`
    }
  </div>
</article>

      <article class="place-card">
        <h2>Ratings</h2>
        <div class="detail-list">
          ${place.rating_estimate !== null && place.rating_estimate !== undefined ? `<div><strong>Rating:</strong> ${escapeHtml(place.rating_estimate)}</div>` : ""}
          ${place.review_count_estimate !== null && place.review_count_estimate !== undefined ? `<div><strong>Review Count:</strong> ${escapeHtml(place.review_count_estimate)}</div>` : ""}
          <div><strong>Family Friendly:</strong> ${familyFriendly ? "Yes" : "No"}</div>
          <div><strong>Outdoor:</strong> ${outdoor ? "Yes" : "No"}</div>
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Tags</h2>
        <div class="card-tags">
          ${tags.length ? tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("") : `<span class="tag">No tags</span>`}
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Seasonal Tags</h2>
        <div class="card-tags">
          ${seasonalTags.length ? seasonalTags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("") : `<span class="tag">None listed</span>`}
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Review Summary</h2>
        <p>${escapeHtml(place.review_summary || "No review summary available.")}</p>
      </article>

      <article class="place-card place-card-full">
        <h2>Review Keywords</h2>
        <div class="card-tags">
          ${reviewKeywords.length ? reviewKeywords.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("") : `<span class="tag">None listed</span>`}
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Hours</h2>
        <div class="hours-list">
          ${renderHours(place) || "<p>No hours available.</p>"}
        </div>
      </article>
    </section>
  `;
  initPlaceMap(place);
}

async function loadPlace() {
  const placeId = getPlaceIdFromUrl();

  if (!placeId) {
    placeStatus.textContent = "No place ID was provided.";
    return;
  }

  try {
    const response = await fetch("./src/place.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const places = await response.json();

    if (!Array.isArray(places)) {
      throw new Error("place.json is not an array");
    }

    const place = places.find(p => String(p.id).trim() === String(placeId).trim());

    if (!place) {
      placeStatus.textContent = "Place not found.";
      return;
    }

    renderPlace(place);
  } catch (err) {
    console.error("Failed to load place:", err);
    placeStatus.textContent = "Failed to load place details.";
  }
}

loadPlace();