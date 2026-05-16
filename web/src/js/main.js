import i18n from "./i18n.js";

// Configuration state
const state = {
  type: "percentage",
  value: 75,
  current: 3.5,
  total: 5,
  style: "classic",
  color: "44cc11",
  theme: "light",
  label: "",
  segments: 10,
  width: 200,
  shape: "star",
};

// Resolve a CSS colour name (e.g. "chocolate") to a hex string via a canvas.
// Returns "#rrggbb" if valid, or null if the name is not recognised.
function resolveColorName(name) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = "#123456"; // sentinel value
  ctx.fillStyle = name;
  const resolved = ctx.fillStyle;
  // If fillStyle didn't change, the name was invalid
  if (resolved === "#123456") return null;
  return resolved;
}

// API base URL — derived from the host the UI is served from:
//   localhost                  → http://localhost:8787   (wrangler dev)
//   barbuilder.dev             → https://api.barbuilder.dev
//   staging.barbuilder.dev     → https://api.staging.barbuilder.dev
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : `https://api.${window.location.hostname}`;

// Debounce timer
let updateTimeout;

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize i18n first
  await i18n.init();

  initializeEventListeners();
  loadPresetsFromURL();
  updatePreview();
});

function initializeEventListeners() {
  // Progress type selector
  document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.type = e.target.value;
      updateValueInputs();
      updateStyleShapeVisibility();
      debouncedUpdate();
    });
  });

  // Value inputs (percentage)
  const percentageValue = document.getElementById("percentageValue");
  const percentageNumber = document.getElementById("percentageNumber");

  if (percentageValue) {
    percentageValue.addEventListener("input", (e) => {
      state.value = parseFloat(e.target.value);
      percentageNumber.value = state.value;
      debouncedUpdate();
    });
  }

  if (percentageNumber) {
    percentageNumber.addEventListener("input", (e) => {
      state.value = parseFloat(e.target.value);
      percentageValue.value = state.value;
      debouncedUpdate();
    });
  }

  // Style selector
  document.querySelectorAll("#styleSelector .style-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.style = e.currentTarget.dataset.style;
      updateStyleSelection();
      updateSegmentsVisibility();
      debouncedUpdate();
    });
  });

  // Shape selector
  document.querySelectorAll("#shapeSelector .style-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.shape = e.currentTarget.dataset.shape;
      updateShapeSelection();
      debouncedUpdate();
    });
  });

  // Language selector
  const languageSelector = document.getElementById("languageSelector");
  if (languageSelector) {
    languageSelector.addEventListener("change", async (e) => {
      await i18n.loadLanguage(e.target.value);
    });
  }

  // Color picker
  const colorPicker = document.getElementById("colorPicker");
  const colorHex = document.getElementById("colorHex");

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      const hex = e.target.value.substring(1); // Remove #
      state.color = hex;
      colorHex.value = "#" + hex;
      document
        .querySelectorAll(".color-chip")
        .forEach((c) => c.classList.remove("selected"));
      debouncedUpdate();
    });
  }

  if (colorHex) {
    colorHex.addEventListener("input", (e) => {
      const raw = e.target.value.replace(/^#/, "");
      state.color = raw;
      // Update color picker if valid 6-digit hex
      if (/^[0-9a-f]{6}$/i.test(raw)) {
        colorPicker.value = "#" + raw;
      } else {
        // Try resolving as a CSS named colour (e.g. "chocolate" → "#d2691e")
        const resolved = resolveColorName(raw);
        if (resolved) {
          colorPicker.value = resolved;
        }
      }
      document
        .querySelectorAll(".color-chip")
        .forEach((c) => c.classList.remove("selected"));
      debouncedUpdate();
    });
  }

  // Color chip clicks
  document.querySelectorAll(".color-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      const hex = e.currentTarget.dataset.color;
      state.color = hex;
      colorHex.value = "#" + hex;
      if (/^[0-9a-f]{6}$/i.test(hex)) {
        colorPicker.value = "#" + hex;
      }
      document
        .querySelectorAll(".color-chip")
        .forEach((c) => c.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
      debouncedUpdate();
    });
  });

  // Label
  const label = document.getElementById("label");

  if (label) {
    label.addEventListener("input", (e) => {
      state.label = e.target.value;
      updateCharCount(e.target.value.length);
      debouncedUpdate();
    });
  }

  // Theme toggles
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.theme = e.currentTarget.dataset.theme;
      updateThemeSelection();
      debouncedUpdate();
    });
  });

  // Width
  const width = document.getElementById("width");
  if (width) {
    width.addEventListener("input", (e) => {
      state.width = parseInt(e.target.value, 10);
      debouncedUpdate();
    });
  }

  // Segments
  const segments = document.getElementById("segments");
  if (segments) {
    segments.addEventListener("input", (e) => {
      state.segments = parseInt(e.target.value, 10);
      debouncedUpdate();
    });
  }

  // Preview background toggle
  document.querySelectorAll(".bg-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bg = e.currentTarget.dataset.bg;
      document
        .querySelectorAll(".bg-toggle")
        .forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");

      const container = document.getElementById("previewContainer");
      if (bg === "dark") {
        container.classList.add("dark-bg");
      } else {
        container.classList.remove("dark-bg");
      }
    });
  });

  // Copy buttons
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const format = e.currentTarget.dataset.format;
      copyToClipboard(format, e.currentTarget);
    });
  });

  // Preset selector
  const presetSelector = document.getElementById("presetSelector");
  if (presetSelector) {
    presetSelector.addEventListener("change", (e) => {
      if (e.target.value) {
        loadPreset(e.target.value);
        // Reset selector
        e.target.value = "";
      }
    });
  }
}

function createInputGroup(labelText, inputAttrs) {
  const group = document.createElement("div");
  group.className = "input-group";
  const label = document.createElement("label");
  label.setAttribute("for", inputAttrs.id);
  label.textContent = labelText;
  group.appendChild(label);
  const input = document.createElement("input");
  for (const [key, val] of Object.entries(inputAttrs)) {
    input.setAttribute(key, String(val));
  }
  group.appendChild(input);
  return group;
}

function updateValueInputs() {
  const container = document.getElementById("valueInputs");

  // Clear existing inputs
  while (container.firstChild) container.removeChild(container.firstChild);

  // Build appropriate inputs based on type
  switch (state.type) {
    case "percentage":
    case "threshold": {
      const group = document.createElement("div");
      group.className = "input-group";
      const label = document.createElement("label");
      label.setAttribute("for", "percentageValue");
      label.textContent = "Percentage (0-100)";
      group.appendChild(label);
      const range = document.createElement("input");
      range.type = "range";
      range.id = "percentageValue";
      range.min = "0";
      range.max = "100";
      range.value = String(state.value);
      range.step = "1";
      group.appendChild(range);
      const num = document.createElement("input");
      num.type = "number";
      num.id = "percentageNumber";
      num.min = "0";
      num.max = "100";
      num.value = String(state.value);
      num.step = "1";
      num.setAttribute("aria-label", "Percentage value");
      group.appendChild(num);
      container.appendChild(group);
      break;
    }

    case "xofy": {
      container.appendChild(
        createInputGroup("Current", {
          type: "number",
          id: "currentValue",
          min: "0",
          value: String(state.current),
        }),
      );
      container.appendChild(
        createInputGroup("Total", {
          type: "number",
          id: "totalValue",
          min: "1",
          value: String(state.total),
        }),
      );
      break;
    }

    case "icon": {
      container.appendChild(
        createInputGroup("Current (supports half-icons: 2.5, 3.5, etc.)", {
          type: "number",
          id: "currentValue",
          min: "0",
          value: String(state.current),
          step: "0.5",
        }),
      );
      container.appendChild(
        createInputGroup("Total", {
          type: "number",
          id: "totalValue",
          min: "1",
          value: String(state.total),
        }),
      );
      break;
    }

    case "indeterminate": {
      const p = document.createElement("p");
      p.style.cssText = "color: #666; font-size: 0.9rem;";
      p.textContent = "No value required for indeterminate progress.";
      container.appendChild(p);
      break;
    }
  }

  // Re-attach event listeners
  attachValueListeners();
}

function attachValueListeners() {
  const percentageValue = document.getElementById("percentageValue");
  const percentageNumber = document.getElementById("percentageNumber");
  const currentValue = document.getElementById("currentValue");
  const totalValue = document.getElementById("totalValue");

  if (percentageValue) {
    percentageValue.addEventListener("input", (e) => {
      state.value = parseFloat(e.target.value);
      percentageNumber.value = state.value;
      debouncedUpdate();
    });
  }

  if (percentageNumber) {
    percentageNumber.addEventListener("input", (e) => {
      state.value = parseFloat(e.target.value);
      percentageValue.value = state.value;
      debouncedUpdate();
    });
  }

  if (currentValue) {
    currentValue.addEventListener("input", (e) => {
      // Use parseFloat for icon type to support half-icons, parseInt for xofy
      state.current =
        state.type === "icon"
          ? parseFloat(e.target.value)
          : parseInt(e.target.value, 10);
      debouncedUpdate();
    });
  }

  if (totalValue) {
    totalValue.addEventListener("input", (e) => {
      state.total = parseInt(e.target.value, 10);
      debouncedUpdate();
    });
  }
}

function updateStyleSelection() {
  document.querySelectorAll("#styleSelector .style-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.style === state.style);
  });
}

function updateShapeSelection() {
  document.querySelectorAll("#shapeSelector .style-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.shape === state.shape);
  });
}

function updateThemeSelection() {
  document.querySelectorAll("[data-theme]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === state.theme);
  });
}

function updateStyleShapeVisibility() {
  const styleSection = document.getElementById("styleSection");
  const shapeSection = document.getElementById("shapeSection");

  if (state.type === "icon") {
    // Icon type: hide style, show shape
    if (styleSection) styleSection.style.display = "none";
    if (shapeSection) shapeSection.style.display = "block";
  } else {
    // Other types: show style, hide shape
    if (styleSection) styleSection.style.display = "block";
    if (shapeSection) shapeSection.style.display = "none";
  }
}

function updateSegmentsVisibility() {
  const segmentsGroup = document.getElementById("segmentsGroup");
  if (segmentsGroup) {
    segmentsGroup.style.display = state.style === "segments" ? "block" : "none";
  }
}

function updateCharCount(count) {
  const element = document.getElementById("labelCount");
  if (element) {
    element.textContent = `${count}/50`;
  }
}

function generateURL() {
  let path = `/${state.type}`;

  // Add path parameters
  switch (state.type) {
    case "percentage":
    case "threshold":
      path += `/${state.value}`;
      break;
    case "xofy":
    case "icon":
      path += `/${state.current}/${state.total}`;
      break;
    case "indeterminate":
      // No path params
      break;
  }

  // Build query string
  const params = new URLSearchParams();

  if (state.style !== "classic") {
    params.set("style", state.style);
  }

  if (state.color && state.color !== "44cc11") {
    params.set("color", state.color);
  }

  if (state.theme !== "light") {
    params.set("theme", state.theme);
  }

  if (state.label) {
    params.set("label", state.label);
  }

  if (state.width !== 200) {
    params.set("width", state.width.toString());
  }

  if (state.style === "segments" && state.segments !== 10) {
    params.set("segments", state.segments.toString());
  }

  if (state.type === "icon" && state.shape && state.shape !== "star") {
    params.set("shape", state.shape);
  }

  const query = params.toString();
  const fullUrl = `${API_BASE}${path}${query ? "?" + query : ""}`;

  return fullUrl;
}

function updatePreview() {
  const url = generateURL();

  // Update preview image
  const previewImage = document.getElementById("previewImage");
  previewImage.src = url;

  // Update URL display with colour-coded segments (safe DOM construction)
  const urlEl = document.getElementById("generatedUrl");
  const domain = API_BASE.replace(/^https?:\/\//, "");
  const rest = url.replace(API_BASE, "");
  const [path, qs] = rest.split("?");
  urlEl.textContent = "";
  const domainSpan = document.createElement("span");
  domainSpan.className = "url-domain";
  domainSpan.textContent = domain;
  urlEl.appendChild(domainSpan);
  const pathSpan = document.createElement("span");
  pathSpan.className = "url-path";
  pathSpan.textContent = path;
  urlEl.appendChild(pathSpan);
  if (qs) {
    const paramsSpan = document.createElement("span");
    paramsSpan.className = "url-params";
    paramsSpan.textContent = "?" + qs;
    urlEl.appendChild(paramsSpan);
  }

  // Update URL hash for sharing (encode state)
  updateURLHash();
}

// Debounce preview updates (300ms delay)
function debouncedUpdate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updatePreview, 300);
}

function copyToClipboard(format, button) {
  const url = generateURL();
  let text;

  switch (format) {
    case "url":
      text = url;
      break;
    case "markdown":
      text = `![Progress](${url})`;
      break;
    case "html":
      text = `<img src="${url}" alt="Progress">`;
      break;
  }

  navigator.clipboard.writeText(text).then(() => {
    showCopyFeedback(button);
  });
}

function showCopyFeedback(button) {
  const originalChildren = Array.from(button.childNodes).map((n) =>
    n.cloneNode(true),
  );

  button.textContent = "✓ Copied!";
  button.classList.add("success");

  setTimeout(() => {
    button.textContent = "";
    originalChildren.forEach((n) => button.appendChild(n));
    button.classList.remove("success");
  }, 2000);
}

function updateURLHash() {
  // Encode current state in URL hash for sharing
  const hash = btoa(JSON.stringify(state));
  window.location.hash = hash;
}

// Allowlist of state keys and their expected types for hash decoding
const STATE_SCHEMA = {
  type: {
    type: "string",
    allowed: ["percentage", "xofy", "icon", "indeterminate", "threshold"],
  },
  value: { type: "number", min: 0, max: 100 },
  current: { type: "number", min: 0, max: 999 },
  total: { type: "number", min: 1, max: 50 },
  style: {
    type: "string",
    allowed: ["classic", "pill", "minimal", "badge", "segments"],
  },
  color: { type: "string", pattern: /^[0-9a-fA-F]{3,8}$/ },
  theme: { type: "string", allowed: ["light", "dark"] },
  label: { type: "string", maxLength: 50 },
  segments: { type: "number", min: 2, max: 20 },
  width: { type: "number", min: 50, max: 500 },
  shape: { type: "string", allowed: ["star", "heart", "circle", "8bit-heart"] },
};

function sanitiseHashState(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return {};
  const clean = {};
  for (const [key, schema] of Object.entries(STATE_SCHEMA)) {
    if (!(key in obj)) continue;
    const val = obj[key];
    if (typeof val !== schema.type) continue;
    if (schema.allowed && !schema.allowed.includes(val)) continue;
    if (schema.pattern && !schema.pattern.test(val)) continue;
    if (
      schema.maxLength &&
      typeof val === "string" &&
      val.length > schema.maxLength
    )
      continue;
    if (schema.min !== undefined && val < schema.min) continue;
    if (schema.max !== undefined && val > schema.max) continue;
    clean[key] = val;
  }
  return clean;
}

function loadPresetsFromURL() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  try {
    const decoded = JSON.parse(atob(hash));
    const safe = sanitiseHashState(decoded);
    Object.assign(state, safe);
    updateUIFromState();
  } catch {
    // Invalid hash, ignore
  }
}

function updateUIFromState() {
  // Update all form fields to match state
  const typeRadio = document.querySelector(
    `input[name="type"][value="${state.type}"]`,
  );
  if (typeRadio) typeRadio.checked = true;

  updateValueInputs();
  updateStyleSelection();
  updateShapeSelection();
  updateStyleShapeVisibility();
  updateThemeSelection();
  updateSegmentsVisibility();

  document.getElementById("colorHex").value = "#" + state.color;
  document.getElementById("colorPicker").value =
    "#" + state.color.padStart(6, "0");
  // Update selected chip
  document.querySelectorAll(".color-chip").forEach((c) => {
    c.classList.toggle("selected", c.dataset.color === state.color);
  });
  document.getElementById("label").value = state.label;
  document.getElementById("width").value = state.width;
  document.getElementById("segments").value = state.segments;

  updateCharCount(state.label.length);

  updatePreview();
}

// Preset loading
function loadPreset(presetName) {
  const presets = {
    "github-build": {
      type: "percentage",
      value: 100,
      style: "badge",
      color: "44cc11",
      label: "Build",
    },
    "test-coverage": {
      type: "percentage",
      value: 87,
      style: "pill",
      color: "32cd32",
      label: "",
    },
    "download-counter": {
      type: "xofy",
      current: 1250,
      total: 2000,
      style: "classic",
      color: "1e90ff",
      label: "Downloads",
    },
    "star-rating": {
      type: "icon",
      current: 4.5,
      total: 5,
      shape: "star",
      color: "ffd700",
      label: "Rating",
    },
    "progress-simple": {
      type: "percentage",
      value: 65,
      style: "minimal",
      color: "44cc11",
    },
    "task-tracker": {
      type: "xofy",
      current: 7,
      total: 10,
      style: "segments",
      color: "1e90ff",
      label: "Tasks",
      segments: 10,
    },
  };

  const preset = presets[presetName];
  if (preset) {
    Object.assign(state, preset);
    updateUIFromState();
  }
}
