const root = document.documentElement;
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
let wheelFrame = null;

function updateWheel() {
  root.style.setProperty("--wheel-angle", `${window.scrollY * 0.42}deg`);
  wheelFrame = null;
}

window.addEventListener("scroll", () => {
  if (wheelFrame !== null) return;
  wheelFrame = window.requestAnimationFrame(updateWheel);
}, { passive: true });

menuButton?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

nav?.addEventListener("click", () => {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
});

const vehicleItems = [...document.querySelectorAll("[data-vehicle]")];
const filterSearch = document.querySelector("#filter-search");
const filterType = document.querySelector("#filter-type");
const filterFuel = document.querySelector("#filter-fuel");
const filterPrice = document.querySelector("#filter-price");
const resultCount = document.querySelector("#result-count");
const catalogEmpty = document.querySelector("#catalog-empty");

function normalize(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function updateCatalog() {
  const search = normalize(filterSearch?.value.trim() || "");
  const type = filterType?.value || "all";
  const fuel = filterFuel?.value || "all";
  const maxPrice = Number(filterPrice?.value || 999999);
  let visible = 0;

  vehicleItems.forEach((item) => {
    const show = (!search || normalize(item.dataset.search).includes(search)) &&
      (type === "all" || item.dataset.type === type) &&
      (fuel === "all" || item.dataset.fuel === fuel) &&
      Number(item.dataset.price) <= maxPrice;
    item.hidden = !show;
    if (show) visible += 1;
  });

  if (resultCount) resultCount.textContent = String(visible);
  if (catalogEmpty) catalogEmpty.hidden = visible !== 0;
}

[filterSearch, filterType, filterFuel, filterPrice].forEach((control) => {
  control?.addEventListener(control === filterSearch ? "input" : "change", updateCatalog);
});

if (vehicleItems.length) {
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("tipo");
  const requestedFuel = params.get("combustible");
  const requestedBrand = params.get("marca");
  const requestedPrice = params.get("precio");
  if (filterType && [...filterType.options].some((option) => option.value === requestedType)) filterType.value = requestedType;
  if (filterFuel && [...filterFuel.options].some((option) => option.value === requestedFuel)) filterFuel.value = requestedFuel;
  if (filterPrice && [...filterPrice.options].some((option) => option.value === requestedPrice)) filterPrice.value = requestedPrice;
  if (filterSearch && requestedBrand && requestedBrand !== "all") filterSearch.value = requestedBrand;
  updateCatalog();
}

const modelTrack = document.querySelector("#model-track");
const modelCards = [...document.querySelectorAll(".model-card")];
const powerFilters = [...document.querySelectorAll("[data-power-filter]")];

powerFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.powerFilter;
    powerFilters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    modelCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.power !== filter;
    });
    if (modelTrack) modelTrack.scrollLeft = 0;
  });
});

document.querySelector("[data-track-prev]")?.addEventListener("click", () => {
  modelTrack?.scrollBy({ left: -336, behavior: "auto" });
});

document.querySelector("[data-track-next]")?.addEventListener("click", () => {
  modelTrack?.scrollBy({ left: 336, behavior: "auto" });
});

const interestDialog = document.querySelector("#interest-dialog");
document.querySelectorAll("[data-interest]").forEach((button) => {
  button.addEventListener("click", () => {
    const vehicle = button.closest("[data-vehicle]");
    const name = button.dataset.interestName || vehicle?.querySelector("h2, p")?.textContent || "Vehículo seleccionado";
    const heading = document.querySelector("#interest-name");
    if (heading) heading.textContent = name;
    interestDialog?.querySelector("form")?.removeAttribute("hidden");
    interestDialog?.querySelector(".success-message")?.setAttribute("hidden", "");
    interestDialog?.showModal();
  });
});

const vehicleCatalog = {
  "seat-ibiza": {
    name: "SEAT Ibiza 1.0 TSI FR",
    kicker: "SEAT · Utilitario",
    summary: "2022 · 39.800 km · Gasolina · Cambio manual",
    price: "17.490 €",
    imageClass: "car-seat",
    image: "assets/vehicle-seat-ibiza.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2022/07/Seat-Ibiza-2022-IE.pdf",
    specs: { Año: "2022", Kilómetros: "39.800 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "110 CV", Etiqueta: "C" },
    features: ["Acabado FR", "Pantalla multimedia", "Climatizador", "Sensores de aparcamiento", "Control de crucero", "Faros LED"]
  },
  "vw-golf": {
    name: "Volkswagen Golf 1.5 TSI Style",
    kicker: "Volkswagen · Compacto",
    summary: "2021 · 52.400 km · Gasolina · Cambio manual",
    price: "20.900 €",
    imageClass: "car-golf",
    image: "assets/vehicle-vw-golf.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/09/VW-Golf-2021-FR.pdf",
    specs: { Año: "2021", Kilómetros: "52.400 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "130 CV", Etiqueta: "C" },
    features: ["Acabado Style", "Navegación", "Climatizador trizona", "Sensores delanteros y traseros", "Control de crucero adaptativo", "Faros LED"]
  },
  "renault-clio": {
    name: "Renault Clio TCe Zen",
    kicker: "Renault · Utilitario",
    summary: "2022 · 34.500 km · Gasolina · Cambio manual",
    price: "16.250 €",
    imageClass: "car-clio",
    image: "assets/vehicle-renault-clio.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2023/01/Renault-Clio-2022-UK-.pdf",
    specs: { Año: "2022", Kilómetros: "34.500 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "90 CV", Etiqueta: "C" },
    features: ["Pantalla multimedia", "Apple CarPlay y Android Auto", "Cámara trasera", "Ayuda al aparcamiento", "Control de crucero", "Asistente de carril"]
  },
  "toyota-corolla": {
    name: "Toyota Corolla 125H Active Tech",
    kicker: "Toyota · Compacto híbrido",
    summary: "2021 · 49.600 km · Híbrido · Cambio automático",
    price: "22.900 €",
    imageClass: "car-corolla",
    image: "assets/vehicle-toyota-corolla.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/11/Toyota-Corolla-2021-UK.pdf",
    specs: { Año: "2021", Kilómetros: "49.600 km", Combustible: "Híbrido", Cambio: "Automático", Potencia: "122 CV", Etiqueta: "ECO" },
    features: ["Sistema híbrido Toyota", "Cámara trasera", "Climatizador bizona", "Control de crucero adaptativo", "Lectura de señales", "Arranque sin llave"]
  },
  "nissan-qashqai": {
    name: "Nissan Qashqai DIG-T N-Connecta",
    kicker: "Nissan · SUV",
    summary: "2021 · 55.200 km · Gasolina · Cambio manual",
    price: "23.900 €",
    imageClass: "car-qashqai",
    image: "assets/vehicle-nissan-qashqai.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/04/Nissan-Qashqai-2021-IE.pdf",
    specs: { Año: "2021", Kilómetros: "55.200 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "140 CV", Etiqueta: "ECO" },
    features: ["Acabado N-Connecta", "Cámara de visión 360°", "Navegación", "Llave inteligente", "Sensores de aparcamiento", "Asistente de ángulo muerto"]
  },
  "peugeot-208": {
    name: "Peugeot 208 PureTech Allure",
    kicker: "Peugeot · Utilitario",
    summary: "2022 · 31.700 km · Gasolina · Cambio manual",
    price: "17.800 €",
    imageClass: "car-peugeot",
    image: "assets/vehicle-peugeot-208.png",
    catalog: "https://autocatalogarchive.com/peugeot/",
    specs: { Año: "2022", Kilómetros: "31.700 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "100 CV", Etiqueta: "C" },
    features: ["Acabado Allure", "Peugeot i-Cockpit", "Pantalla táctil", "Climatizador", "Sensores traseros", "Asistente de carril"]
  }
};

const detailRoot = document.querySelector("[data-vehicle-detail]");
if (detailRoot) {
  const id = new URLSearchParams(window.location.search).get("id") || "seat-ibiza";
  const vehicle = vehicleCatalog[id] || vehicleCatalog["seat-ibiza"];
  document.querySelector("[data-detail-name]").textContent = vehicle.name;
  document.querySelector("[data-detail-kicker]").textContent = vehicle.kicker;
  document.querySelector("[data-detail-summary]").textContent = vehicle.summary;
  document.querySelector("[data-detail-price]").textContent = vehicle.price;
  document.querySelectorAll("[data-detail-photo]").forEach((photo) => photo.classList.add(vehicle.imageClass));
  const specs = document.querySelector("[data-detail-specs]");
  specs.innerHTML = Object.entries(vehicle.specs).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  const features = document.querySelector("[data-detail-features]");
  features.innerHTML = vehicle.features.map((feature) => `<li>✓ ${feature}</li>`).join("");
  const catalog = document.querySelector("[data-detail-catalog]");
  catalog.href = vehicle.catalog;
  const interest = document.querySelector("[data-interest]");
  interest.dataset.interestName = vehicle.name;

  const description = `${vehicle.name}: ${vehicle.summary}. ${vehicle.price}.`;
  document.title = `${vehicle.name} — Celeritas`;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = `${vehicle.name} — Celeritas`;
  document.querySelector('meta[property="og:description"]').content = description;
  document.querySelector('meta[property="og:image"]').content = new URL(vehicle.image, window.location.href).href;
  document.querySelector('meta[name="twitter:title"]').content = `${vehicle.name} — Celeritas`;
  document.querySelector('meta[name="twitter:description"]').content = description;
  document.querySelector('meta[name="twitter:image"]').content = new URL(vehicle.image, window.location.href).href;
}

document.querySelector(".dialog-close")?.addEventListener("click", () => interestDialog?.close());
interestDialog?.addEventListener("click", (event) => {
  const box = interestDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) interestDialog.close();
});

document.querySelectorAll("[data-success-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    form.hidden = true;
    const success = form.parentElement.querySelector(".success-message");
    if (success) success.hidden = false;
  });
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
updateWheel();
