const modal = document.getElementById("spotlightModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalLong = document.getElementById("modalLong");
const modalTags = document.getElementById("modalTags");
const modalPrimary = document.getElementById("modalPrimary");
const modalLinks = document.getElementById("modalLinks");

let lastFocus = null;

function parseList(value, delimiter = "|") {
  if (!value) return [];
  return value.split(delimiter).map((s) => s.trim()).filter(Boolean);
}

function parseLinks(value) {
  // Format: "Label|href;Label|href"
  if (!value) return [];
  return value
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [label, href] = pair.split("|").map((s) => (s ?? "").trim());
      return { label, href };
    })
    .filter((x) => x.label && x.href);
}

function setModalFromTile(tile) {
  const name = tile.dataset.name || "";
  const desc = tile.dataset.desc || "";
  const long = tile.dataset.long || "";
  const tags = parseList(tile.dataset.tags);
  const image = tile.dataset.image || "";
  const links = parseLinks(tile.dataset.links);

  modalTitle.innerHTML = name;
  modalDesc.textContent = desc;
  modalLong.textContent = long;

  modalImg.src = image;
  modalImg.alt = name ? `${name} spotlight image` : "Spotlight image";

  modalTags.innerHTML = "";
  for (const t of tags) {
    const span = document.createElement("span");
    span.className = "modal-tag";
    span.textContent = t;
    modalTags.appendChild(span);
  }

  modalPrimary.href = "directory.html";

  modalLinks.innerHTML = "";
  for (const l of links) {
    const a = document.createElement("a");
    a.className = "modal-link";
    a.href = l.href;
    a.textContent = l.label;
    modalLinks.appendChild(a);
  }
}

function openModal(tile, triggerEl) {
  if (!modal) return;
  lastFocus = triggerEl || document.activeElement;
  setModalFromTile(tile);

  modal.hidden = false;
  document.body.classList.add("modal-open");

  const focusTarget = modal.querySelector(".modal-close") || modal;
  focusTarget.focus();
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");

  if (lastFocus && typeof lastFocus.focus === "function") {
    lastFocus.focus();
  }
  lastFocus = null;
}

document.addEventListener("click", (e) => {
  const viewBtn = e.target.closest('[data-action="view-details"]');
  if (viewBtn) {
    e.preventDefault();
    e.stopPropagation();

    const tile = viewBtn.closest(".spotlight-tile");
    if (tile) openModal(tile, viewBtn);
    return;
  }

  const closeEl = e.target.closest('[data-action="close-modal"]');
  if (closeEl && !modal?.hidden) {
    e.preventDefault();
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.hidden) {
    e.preventDefault();
    closeModal();
    return;
  }

  if (e.key === "Tab" && modal && !modal.hidden) {
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const items = Array.from(focusables).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );

    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

