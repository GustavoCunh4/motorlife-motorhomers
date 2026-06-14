const WHATSAPP_NUMBER = "5551993426537";
const INSTAGRAM_URL = "https://instagram.com/motorlife_rs";
const ADMIN_PIN = "6537";
const STORAGE_KEY = "motorlife.catalog.v1";

const defaultFeatures = [
  "Cozinha equipada",
  "Espaço de descanso",
  "Pet friendly",
  "CNH B",
  "Viagens nacionais e internacionais",
  "Briefing de retirada",
];

const defaultCatalog = [
  {
    id: "cardeal",
    name: "Cardeal",
    price: 799,
    model: "Sprinter Mercedes-Benz",
    passengers: 4,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/cardeal.jpeg"],
    profile: "Viagens de casal ou família pequena que priorizam interior confortável e rotina prática.",
    features: ["Cozinha equipada", "Ambiente interno aconchegante", "Ideal para 4 passageiros", "Pet friendly"],
  },
  {
    id: "garca",
    name: "Garça",
    price: 979,
    model: "Sprinter Mercedes-Benz",
    passengers: 4,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/garca.jpeg"],
    profile: "Roteiros de 3 a 7 dias com conforto interno, boa circulação e capacidade para 4 passageiros.",
    features: ["Layout funcional", "Mesa interna", "Cozinha compacta", "Pet friendly"],
  },
  {
    id: "andorinha",
    name: "Andorinha",
    price: 979,
    model: "Ford Transit - Câmbio automático",
    passengers: 5,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/andorinha.jpeg"],
    profile: "Quem quer dirigir com mais facilidade e conforto em percursos longos, com câmbio automático.",
    features: ["Câmbio automático", "5 passageiros", "Boa opção para famílias", "Pet friendly"],
  },
  {
    id: "aguia",
    name: "Águia",
    price: 1250,
    model: "Mercedes-Benz Sprinter 516",
    passengers: 6,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/aguia.jpeg"],
    profile: "Grupos maiores ou famílias que precisam de mais espaço e capacidade para até 6 passageiros.",
    features: ["Maior capacidade da frota", "Mercedes-Benz Sprinter 516", "Perfil robusto", "Pet friendly"],
  },
  {
    id: "arara",
    name: "Arara",
    price: 979,
    model: "Sprinter Mercedes-Benz",
    passengers: 5,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/arara.jpeg"],
    profile: "Viagens com até 5 pessoas, boa autonomia e perfil versátil para roteiros nacionais e internacionais.",
    features: ["5 passageiros", "Sprinter Mercedes-Benz", "Boa relação entre espaço e valor", "Pet friendly"],
  },
  {
    id: "flamingo",
    name: "Flamingo",
    price: 879,
    model: "Peugeot Boxer",
    passengers: 4,
    license: "CNH B",
    petFriendly: true,
    travel: "Viagens nacionais e internacionais",
    images: ["assets/flamingo.jpeg"],
    profile: "Viagens compactas para até 4 passageiros, com valor base competitivo e boa mobilidade.",
    features: ["Peugeot Boxer", "4 passageiros", "Valor base competitivo", "Pet friendly"],
  },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

let catalog = loadCatalog();
let activeFilter = "all";

const fleetGrid = document.querySelector("[data-fleet-grid]");
const quoteForm = document.querySelector("[data-quote-form]");
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const adminDialog = document.querySelector("[data-admin-dialog]");
const adminOpen = document.querySelector("[data-admin-open]");
const adminClose = document.querySelector("[data-admin-close]");
const pinForm = document.querySelector("[data-pin-form]");
const catalogEditor = document.querySelector("[data-catalog-editor]");
const galleryDialog = document.querySelector("[data-gallery-dialog]");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryTitle = document.querySelector("[data-gallery-title]");
const galleryThumbs = document.querySelector("[data-gallery-thumbs]");
const galleryClose = document.querySelector("[data-gallery-close]");
const compareBody = document.querySelector("[data-compare-body]");
const vehicleSelect = document.querySelector("[data-vehicle-select]");
const detailsDialog = document.querySelector("[data-details-dialog]");
const detailsClose = document.querySelector("[data-details-close]");
const detailsMedia = document.querySelector("[data-details-media]");
const detailsTitle = document.querySelector("[data-details-title]");
const detailsSummary = document.querySelector("[data-details-summary]");
const detailsSpecs = document.querySelector("[data-details-specs]");
const detailsProfile = document.querySelector("[data-details-profile]");
const detailsFeatures = document.querySelector("[data-details-features]");
const detailsQuote = document.querySelector("[data-details-quote]");
const detailsGallery = document.querySelector("[data-details-gallery]");

let activeDetailsVehicleId = null;

init();

function init() {
  wireLinks();
  populateVehicleSelect();
  renderFleet();
  renderCompareTable();
  setupFilters();
  setupQuoteForm();
  setupMenu();
  setupAdmin();
  setupGallery();
  setupDetails();
  setupRouteQuotes();
}

function loadCatalog() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return normalizeCatalog(defaultCatalog);
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return normalizeCatalog(defaultCatalog);
    }
    return normalizeCatalog(parsed);
  } catch {
    return normalizeCatalog(defaultCatalog);
  }
}

function saveCatalog() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
}

function normalizeCatalog(items) {
  return structuredClone(items).map((vehicle, index) => {
    const images = Array.isArray(vehicle.images)
      ? vehicle.images
      : [vehicle.image].filter(Boolean);

    return {
      id: vehicle.id || `motorhome-${index + 1}`,
      name: vehicle.name || "Motorhome",
      price: Number(vehicle.price) || 0,
      model: vehicle.model || "Modelo do veículo",
      passengers: Number(vehicle.passengers) || 4,
      license: vehicle.license || "CNH B",
      petFriendly: vehicle.petFriendly !== false,
      travel: vehicle.travel || "Viagens nacionais e internacionais",
      images: images.map((image) => String(image).trim()).filter(Boolean),
      profile: vehicle.profile || "Viagem com conforto, autonomia e atendimento consultivo.",
      features: Array.isArray(vehicle.features) && vehicle.features.length ? vehicle.features : defaultFeatures,
    };
  });
}

function wireLinks() {
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = buildWhatsAppUrl("Olá! Vi o site da Motorlife Motorhomers e gostaria de um orçamento.");
  });
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderFleet() {
  const vehicles = catalog.filter((vehicle) => {
    return activeFilter === "all" || String(vehicle.passengers) === activeFilter;
  });

  if (!vehicles.length) {
    fleetGrid.innerHTML = `<p class="empty-state">Nenhum motorhome encontrado para este filtro.</p>`;
    return;
  }

  fleetGrid.innerHTML = vehicles.map(renderVehicleCard).join("");

  fleetGrid.querySelectorAll("[data-vehicle-quote]").forEach((button) => {
    button.addEventListener("click", () => {
      const vehicle = catalog.find((item) => item.id === button.dataset.vehicleQuote);
      if (!vehicle) return;

      quoteVehicle(vehicle);
    });
  });

  fleetGrid.querySelectorAll("[data-gallery-open]").forEach((button) => {
    button.addEventListener("click", () => {
      openGallery(button.dataset.galleryOpen, Number(button.dataset.galleryIndex) || 0);
    });
  });

  fleetGrid.querySelectorAll("[data-details-open]").forEach((button) => {
    button.addEventListener("click", () => openDetails(button.dataset.detailsOpen));
  });
}

function renderVehicleCard(vehicle) {
  const pet = vehicle.petFriendly ? "Pet friendly" : "Consultar pets";
  const images = getVehicleImages(vehicle);
  const cover = images[0];
  const photoStrip = images.length > 1
    ? `
      <div class="photo-strip" aria-label="Fotos de ${escapeHtml(vehicle.name)}">
        ${images.slice(0, 4).map((image, index) => `
          <button type="button" class="photo-thumb" data-gallery-open="${escapeHtml(vehicle.id)}" data-gallery-index="${index}" aria-label="Abrir foto ${index + 1} de ${escapeHtml(vehicle.name)}">
            <img src="${escapeHtml(image)}" alt="" loading="lazy">
          </button>
        `).join("")}
      </div>
    `
    : "";

  return `
    <article class="vehicle-card">
      <figure>
        <img src="${escapeHtml(cover)}" alt="Motorhome ${escapeHtml(vehicle.name)}" loading="lazy">
        <figcaption class="price">${currency.format(Number(vehicle.price) || 0)} / dia</figcaption>
        ${images.length > 1 ? `
          <button class="photo-count" type="button" data-gallery-open="${escapeHtml(vehicle.id)}" data-gallery-index="0">
            ${images.length} fotos
          </button>
        ` : ""}
      </figure>
      ${photoStrip}
      <div class="vehicle-body">
        <div class="vehicle-title">
          <div>
            <h3>${escapeHtml(vehicle.name)}</h3>
            <p>${escapeHtml(vehicle.model)}</p>
          </div>
        </div>
        <ul class="specs">
          <li>${Number(vehicle.passengers) || 0} passageiros</li>
          <li>${escapeHtml(vehicle.license)}</li>
          <li>${escapeHtml(pet)}</li>
          <li>${escapeHtml(vehicle.travel)}</li>
        </ul>
        <button class="btn primary full" type="button" data-vehicle-quote="${escapeHtml(vehicle.id)}">
          Orçar ${escapeHtml(vehicle.name)}
        </button>
        <button class="btn secondary full" type="button" data-details-open="${escapeHtml(vehicle.id)}">
          Ver detalhes
        </button>
      </div>
    </article>
  `;
}

function renderCompareTable() {
  compareBody.innerHTML = catalog.map((vehicle) => `
    <tr>
      <th>${escapeHtml(vehicle.name)}</th>
      <td>${currency.format(Number(vehicle.price) || 0)} / dia</td>
      <td>${Number(vehicle.passengers) || 0}</td>
      <td>${escapeHtml(vehicle.model)}</td>
      <td>${escapeHtml(vehicle.license)}</td>
      <td>${escapeHtml(vehicle.profile)}</td>
    </tr>
  `).join("");
}

function populateVehicleSelect() {
  vehicleSelect.innerHTML = `
    <option value="A definir">A definir</option>
    ${catalog.map((vehicle) => `
      <option value="${escapeHtml(vehicle.name)}">${escapeHtml(vehicle.name)} - ${currency.format(Number(vehicle.price) || 0)} / dia</option>
    `).join("")}
  `;
}

function getVehicleImages(vehicle) {
  const images = Array.isArray(vehicle.images) ? vehicle.images : [vehicle.image];
  const cleanImages = images.map((image) => String(image || "").trim()).filter(Boolean);
  return cleanImages.length ? cleanImages : ["assets/arara.jpeg"];
}

function setupGallery() {
  galleryClose.addEventListener("click", () => galleryDialog.close());
}

function setupDetails() {
  detailsClose.addEventListener("click", () => detailsDialog.close());
  detailsQuote.addEventListener("click", () => {
    const vehicle = catalog.find((item) => item.id === activeDetailsVehicleId);
    if (!vehicle) return;
    quoteVehicle(vehicle);
  });
  detailsGallery.addEventListener("click", () => {
    const vehicle = catalog.find((item) => item.id === activeDetailsVehicleId);
    if (!vehicle) return;
    detailsDialog.close();
    openGallery(vehicle.id, 0);
  });
}

function setupRouteQuotes() {
  document.querySelectorAll("[data-route-quote]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const route = link.dataset.routeQuote;
      const message = [
        "Olá! Quero um orçamento para uma viagem de motorhome.",
        `Roteiro de interesse: ${route}`,
        "Datas: a definir",
        "Passageiros: a definir",
      ].join("\n");
      window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    });
  });
}

function openDetails(vehicleId) {
  const vehicle = catalog.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  activeDetailsVehicleId = vehicle.id;
  const images = getVehicleImages(vehicle);

  detailsTitle.textContent = vehicle.name;
  detailsSummary.textContent = `${vehicle.model}. Valor base ${currency.format(Number(vehicle.price) || 0)} por dia.`;
  detailsProfile.textContent = vehicle.profile;
  detailsSpecs.innerHTML = `
    <div><dt>Valor base</dt><dd>${currency.format(Number(vehicle.price) || 0)} / dia</dd></div>
    <div><dt>Passageiros</dt><dd>${Number(vehicle.passengers) || 0}</dd></div>
    <div><dt>CNH</dt><dd>${escapeHtml(vehicle.license)}</dd></div>
    <div><dt>Pet friendly</dt><dd>${vehicle.petFriendly ? "Sim" : "Consultar"}</dd></div>
    <div><dt>Viagem</dt><dd>${escapeHtml(vehicle.travel)}</dd></div>
  `;
  detailsFeatures.innerHTML = vehicle.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
  detailsMedia.innerHTML = `
    <img src="${escapeHtml(images[0])}" alt="Motorhome ${escapeHtml(vehicle.name)}" decoding="async">
    ${images.length > 1 ? `<span>${images.length} fotos disponíveis</span>` : ""}
  `;
  detailsDialog.showModal();
}

function quoteVehicle(vehicle) {
  const message = [
    `Olá! Quero um orçamento para o motorhome ${vehicle.name}.`,
    `Modelo: ${vehicle.model}`,
    `Passageiros: ${vehicle.passengers}`,
    `Valor base: ${currency.format(vehicle.price)} / dia`,
    "Datas: a definir",
    "Roteiro: a definir",
  ].join("\n");

  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

function openGallery(vehicleId, startIndex = 0) {
  const vehicle = catalog.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const images = getVehicleImages(vehicle);
  const safeIndex = Math.min(Math.max(startIndex, 0), images.length - 1);

  galleryTitle.textContent = vehicle.name;
  setGalleryImage(vehicle, images[safeIndex]);
  galleryThumbs.innerHTML = images.map((image, index) => `
    <button class="gallery-thumb ${index === safeIndex ? "active" : ""}" type="button" data-gallery-src="${escapeHtml(image)}">
      <img src="${escapeHtml(image)}" alt="Foto ${index + 1} do motorhome ${escapeHtml(vehicle.name)}">
    </button>
  `).join("");

  galleryThumbs.querySelectorAll("[data-gallery-src]").forEach((button) => {
    button.addEventListener("click", () => {
      setGalleryImage(vehicle, button.dataset.gallerySrc);
      galleryThumbs.querySelectorAll(".gallery-thumb").forEach((thumb) => thumb.classList.remove("active"));
      button.classList.add("active");
    });
  });

  galleryDialog.showModal();
}

function setGalleryImage(vehicle, image) {
  galleryImage.src = image;
  galleryImage.alt = `Motorhome ${vehicle.name}`;
}

function setupFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderFleet();
    });
  });
}

function setupQuoteForm() {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(quoteForm);
    const message = [
      "Olá! Gostaria de um orçamento para alugar um motorhome.",
      `Motorhome: ${form.get("vehicle") || "A definir"}`,
      `Retirada: ${formatDate(form.get("pickup"))}`,
      `Devolução: ${formatDate(form.get("return"))}`,
      `Passageiros: ${form.get("passengers")}`,
      `Roteiro: ${form.get("route") || "a definir"}`,
      `Tipo de viagem: ${form.get("tripType") || "A definir"}`,
      `Vai levar pet: ${form.get("pet") || "A definir"}`,
    ].join("\n");

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  });
}

function formatDate(value) {
  if (!value) return "a definir";
  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
}

function setupMenu() {
  menuToggle.addEventListener("click", () => {
    header.classList.toggle("menu-active");
    document.body.classList.toggle("menu-open");
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("menu-active");
      document.body.classList.remove("menu-open");
    });
  });
}

function setupAdmin() {
  adminOpen.addEventListener("click", () => {
    adminDialog.showModal();
    pinForm.hidden = false;
    catalogEditor.hidden = true;
    pinForm.reset();
  });

  adminClose.addEventListener("click", () => adminDialog.close());

  pinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const pin = new FormData(pinForm).get("pin");
    if (pin !== ADMIN_PIN) {
      pinForm.querySelector("input").setCustomValidity("PIN inválido");
      pinForm.reportValidity();
      pinForm.querySelector("input").setCustomValidity("");
      return;
    }

    pinForm.hidden = true;
    catalogEditor.hidden = false;
    renderCatalogEditor();
  });

  catalogEditor.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(catalogEditor);

    catalog = catalog.map((vehicle) => ({
      ...vehicle,
      name: clean(form.get(`${vehicle.id}.name`), vehicle.name),
      price: Number(form.get(`${vehicle.id}.price`)) || vehicle.price,
      model: clean(form.get(`${vehicle.id}.model`), vehicle.model),
      passengers: Number(form.get(`${vehicle.id}.passengers`)) || vehicle.passengers,
      license: clean(form.get(`${vehicle.id}.license`), vehicle.license),
      travel: clean(form.get(`${vehicle.id}.travel`), vehicle.travel),
      images: parseImages(form.get(`${vehicle.id}.images`), getVehicleImages(vehicle)),
      profile: clean(form.get(`${vehicle.id}.profile`), vehicle.profile),
      features: parseLines(form.get(`${vehicle.id}.features`), vehicle.features),
      petFriendly: form.get(`${vehicle.id}.petFriendly`) === "true",
    }));

    saveCatalog();
    renderFleet();
    renderCompareTable();
    populateVehicleSelect();
    renderCatalogEditor();
  });

  catalogEditor.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-catalog]");
    if (add) {
      const id = `novo-${Date.now()}`;
      catalog.push({
        id,
        name: "Novo motorhome",
        price: 0,
        model: "Modelo do veículo",
        passengers: 4,
        license: "CNH B",
        petFriendly: true,
        travel: "Viagens nacionais e internacionais",
        images: ["assets/arara.jpeg"],
        profile: "Descreva o perfil ideal deste motorhome.",
        features: defaultFeatures,
      });
      saveCatalog();
      renderFleet();
      renderCompareTable();
      populateVehicleSelect();
      renderCatalogEditor();
      return;
    }

    const remove = event.target.closest("[data-remove-catalog]");
    if (remove) {
      catalog = catalog.filter((vehicle) => vehicle.id !== remove.dataset.removeCatalog);
      saveCatalog();
      renderFleet();
      renderCompareTable();
      populateVehicleSelect();
      renderCatalogEditor();
      return;
    }

    const exportButton = event.target.closest("[data-export-catalog]");
    if (exportButton) {
      downloadCatalog();
      return;
    }

    const importButton = event.target.closest("[data-import-catalog]");
    if (importButton) {
      const raw = window.prompt("Cole aqui o JSON exportado do catálogo:");
      if (!raw) return;
      try {
        const imported = JSON.parse(raw);
        if (!Array.isArray(imported)) throw new Error("JSON precisa ser uma lista.");
        catalog = normalizeCatalog(imported);
        saveCatalog();
        renderFleet();
        renderCompareTable();
        populateVehicleSelect();
        renderCatalogEditor();
      } catch {
        window.alert("Não foi possível importar o catálogo. Verifique o JSON.");
      }
      return;
    }

    const reset = event.target.closest("[data-reset-catalog]");
    if (!reset) return;

    catalog = structuredClone(defaultCatalog);
    localStorage.removeItem(STORAGE_KEY);
    activeFilter = "all";
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === "all");
    });
    renderFleet();
    renderCompareTable();
    populateVehicleSelect();
    renderCatalogEditor();
  });
}

function renderCatalogEditor() {
  const totalPhotos = catalog.reduce((total, vehicle) => total + getVehicleImages(vehicle).length, 0);

  catalogEditor.innerHTML = `
    <div class="editor-intro">
      <div>
        <strong>${catalog.length} motorhomes</strong>
        <span>${totalPhotos} fotos cadastradas</span>
      </div>
      <div class="editor-intro-actions">
        <button class="btn primary" type="button" data-add-catalog>Adicionar motorhome</button>
        <button class="btn secondary" type="button" data-export-catalog>Exportar JSON</button>
        <button class="btn secondary" type="button" data-import-catalog>Importar JSON</button>
      </div>
    </div>
    ${catalog.map(renderEditorCard).join("")}
    <div class="editor-actions">
      <button class="btn primary" type="submit">Salvar catálogo</button>
      <button class="btn secondary" type="button" data-reset-catalog>Restaurar original</button>
    </div>
  `;
}

function renderEditorCard(vehicle) {
  const images = getVehicleImages(vehicle);

  return `
    <section class="editor-card">
      <div class="editor-title">
        <div>
          <h3>${escapeHtml(vehicle.name)}</h3>
          <p>${images.length} ${images.length === 1 ? "foto" : "fotos"}</p>
        </div>
        <img src="${escapeHtml(images[0])}" alt="" loading="lazy">
      </div>
      <label>
        Nome
        <input name="${vehicle.id}.name" value="${escapeHtml(vehicle.name)}" required>
      </label>
      <label>
        Preço
        <input name="${vehicle.id}.price" type="number" min="0" step="1" value="${Number(vehicle.price) || 0}" required>
      </label>
      <label>
        Passageiros
        <input name="${vehicle.id}.passengers" type="number" min="1" max="12" value="${Number(vehicle.passengers) || 1}" required>
      </label>
      <label>
        Pet friendly
        <select name="${vehicle.id}.petFriendly">
          <option value="true" ${vehicle.petFriendly ? "selected" : ""}>Sim</option>
          <option value="false" ${!vehicle.petFriendly ? "selected" : ""}>Não</option>
        </select>
      </label>
      <label class="wide">
        Modelo
        <input name="${vehicle.id}.model" value="${escapeHtml(vehicle.model)}" required>
      </label>
      <label>
        Habilitação
        <input name="${vehicle.id}.license" value="${escapeHtml(vehicle.license)}" required>
      </label>
      <label>
        Viagem
        <input name="${vehicle.id}.travel" value="${escapeHtml(vehicle.travel)}" required>
      </label>
      <label class="wide photos-field">
        Fotos do motorhome
        <textarea name="${vehicle.id}.images" rows="4" required>${escapeHtml(images.join("\n"))}</textarea>
        <small>Use uma imagem por linha. Pode ser um arquivo em <strong>assets/</strong> ou uma URL.</small>
      </label>
      <label class="wide">
        Perfil ideal
        <textarea name="${vehicle.id}.profile" rows="3" required>${escapeHtml(vehicle.profile)}</textarea>
      </label>
      <label class="wide photos-field">
        Itens e diferenciais
        <textarea name="${vehicle.id}.features" rows="4" required>${escapeHtml(vehicle.features.join("\n"))}</textarea>
        <small>Use um item por linha.</small>
      </label>
      <button class="btn secondary danger" type="button" data-remove-catalog="${escapeHtml(vehicle.id)}">
        Remover do catálogo
      </button>
    </section>
  `;
}

function parseImages(value, fallback) {
  return parseLines(value, fallback);
}

function parseLines(value, fallback) {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length ? lines : fallback;
}

function downloadCatalog() {
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "motorlife-catalogo.json";
  link.click();
  URL.revokeObjectURL(url);
}

function clean(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
