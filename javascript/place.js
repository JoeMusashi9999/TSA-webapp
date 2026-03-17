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
  const image = place.image && String(place.image).trim() ? place.image.trim() : "";
  const website = place.website && String(place.website).trim() ? place.website.trim() : "";
  const phone = place.phone && String(place.phone).trim() ? place.phone.trim() : "";
  const address = place.address && String(place.address).trim() ? place.address.trim() : "";
  const familyFriendly = normalizeBool(place.family_friendly);
  const outdoor = normalizeBool(place.outdoor);

  document.title = `${place.title || "Place"} | Community Hub`;

  placePage.innerHTML = `
    <section class="place-hero">
      ${image ? `<img class="place-image" src="${escapeHtml(image)}" alt="${escapeHtml(place.title)}" />` : ""}
      <div class="place-header">
        <div>
          <p class="section-subtitle">${escapeHtml(place.category || "Uncategorized")} · ${escapeHtml(place.subcategory || "")}</p>
          <h1 class="section-title">${escapeHtml(place.title || "Untitled")}</h1>
          <p class="place-short">${escapeHtml(place.short_description || "")}</p>
        </div>

        <div class="place-actions">
          ${website ? `<a class="btn btn-primary" href="${escapeHtml(website)}" target="_blank" rel="noopener">Visit Website</a>` : ""}
          <a class="btn" href="./discover.html">Back to Directory</a>
        </div>
      </div>
    </section>

    <section class="place-grid">
      <article class="place-card">
        <h2>Overview</h2>
        <p>${escapeHtml(place.description || "No description available.")}</p>
      </article>

      <article class="place-card">
        <h2>Key Details</h2>
        <div class="detail-list">
          ${address ? `<div><strong>Address:</strong> ${escapeHtml(address)}</div>` : ""}
          ${phone ? `<div><strong>Phone:</strong> ${escapeHtml(phone)}</div>` : ""}
          ${place.price_level ? `<div><strong>Price Level:</strong> ${escapeHtml(place.price_level)}</div>` : ""}
          ${place.rating_estimate ? `<div><strong>Rating:</strong> ${escapeHtml(place.rating_estimate)}</div>` : ""}
          ${place.review_count_estimate ? `<div><strong>Review Count:</strong> ${escapeHtml(place.review_count_estimate)}</div>` : ""}
          ${place.popularity_score ? `<div><strong>Popularity Score:</strong> ${escapeHtml(place.popularity_score)}</div>` : ""}
        </div>
      </article>

      <article class="place-card">
        <h2>Tags</h2>
        <div class="card-tags">
          ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </article>

      <article class="place-card">
        <h2>Attributes</h2>
        <div class="card-tags">
          ${familyFriendly ? `<span class="tag">family-friendly</span>` : ""}
          ${outdoor ? `<span class="tag">outdoor</span>` : ""}
          ${seasonalTags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Hours</h2>
        <div class="hours-list">
          ${renderHours(place) || "<p>No hours available.</p>"}
        </div>
      </article>

      <article class="place-card place-card-full">
        <h2>Review Summary</h2>
        <p>${escapeHtml(place.review_summary || "No review summary available.")}</p>
        ${
          formatTags(place.review_keywords).length
            ? `<div class="card-tags">${formatTags(place.review_keywords).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
            : ""
        }
      </article>
    </section>
  `;
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