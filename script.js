const root = document.documentElement;
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
let wheelFrame = null;

function readPreference(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function savePreference(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* Storage can be unavailable in private browsing. */ }
}

function removePreference(key) {
  try { window.localStorage.removeItem(key); } catch { /* Storage can be unavailable in private browsing. */ }
}

function readListPreference(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getAccountProfile() {
  try {
    const profile = JSON.parse(readPreference("celeritas-profile") || "{}");
    return profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
  } catch {
    return {};
  }
}

function saveAccountProfile(profile) {
  savePreference("celeritas-profile", JSON.stringify(profile));
  return profile;
}

function uniqueVehicleIds(ids) {
  return [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))];
}

function getCartItems() {
  const items = uniqueVehicleIds(readListPreference("celeritas-cart"));
  const legacyItem = readPreference("celeritas-selected-vehicle");
  if (!items.length && legacyItem) {
    items.push(legacyItem);
    savePreference("celeritas-cart", JSON.stringify(items));
  }
  return items;
}

function saveCartItems(ids) {
  const items = uniqueVehicleIds(ids);
  savePreference("celeritas-cart", JSON.stringify(items));
  if (items.length) savePreference("celeritas-selected-vehicle", items[0]);
  else removePreference("celeritas-selected-vehicle");
  syncCartIndicator(items);
  return items;
}

function getFavorites() {
  return uniqueVehicleIds(readListPreference("celeritas-favorites"));
}

function saveFavorites(ids) {
  const items = uniqueVehicleIds(ids);
  savePreference("celeritas-favorites", JSON.stringify(items));
  syncFavoriteIndicator(items);
  return items;
}

function syncFavoriteIndicator(items = getFavorites()) {
  document.querySelectorAll("[data-favorite-count]").forEach((count) => {
    count.textContent = String(items.length);
    count.hidden = items.length === 0;
  });
}

function syncCartIndicator(items = getCartItems()) {
  document.querySelectorAll("[data-cart-link]").forEach((link) => { link.href = "checkout.html"; });
  document.querySelectorAll("[data-cart-count]").forEach((count) => {
    count.textContent = String(items.length);
    count.hidden = items.length === 0;
  });
}

let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector("[data-site-toast]");
  if (!toast) {
    document.body.insertAdjacentHTML("beforeend", '<div class="site-toast" data-site-toast role="status" aria-live="polite" hidden></div>');
    toast = document.querySelector("[data-site-toast]");
  }
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2400);
}

function animateVehicleToTarget(sourceButton, target) {
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const photo = sourceButton.closest(".vehicle-card-shell")?.querySelector(".single-car-photo");
  if (!photo) return;
  const start = photo.getBoundingClientRect();
  const finish = target.getBoundingClientRect();
  const thumb = photo.cloneNode(false);
  thumb.classList.add("flying-car-thumb");
  thumb.removeAttribute("role");
  thumb.removeAttribute("aria-label");
  Object.assign(thumb.style, {
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
  });
  document.body.append(thumb);
  const destinationX = finish.left + (finish.width / 2) - (start.left + (start.width / 2));
  const destinationY = finish.top + (finish.height / 2) - (start.top + (start.height / 2));
  const flight = thumb.animate([
    { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
    { transform: `translate3d(${destinationX * .45}px, ${destinationY * .35 - 36}px, 0) scale(.48)`, opacity: .92, offset: .55 },
    { transform: `translate3d(${destinationX}px, ${destinationY}px, 0) scale(.08)`, opacity: .15 },
  ], { duration: 720, easing: "cubic-bezier(.22,.8,.3,1)", fill: "forwards" });
  flight.finished.finally(() => {
    thumb.remove();
    target.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.22)" },
      { transform: "scale(1)" },
    ], { duration: 260, easing: "ease-out" });
  });
}

const currencyRates = { EUR: 1, USD: 1.16, GBP: 0.87, CHF: 0.94 };
const savedCurrency = readPreference("celeritas-currency");
let currentCurrency = savedCurrency && Object.hasOwn(currencyRates, savedCurrency) ? savedCurrency : "EUR";

function formatMoney(euros, currency = currentCurrency) {
  const rate = currencyRates[currency] || 1;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency, maximumFractionDigits: 0 }).format(euros * rate);
}

function updateCurrencyPrices() {
  document.querySelectorAll("[data-price-eur]").forEach((element) => {
    element.textContent = formatMoney(Number(element.dataset.priceEur));
  });
  document.querySelectorAll("[data-currency-select]").forEach((select) => { select.value = currentCurrency; });
}

const navMenuItems = {
  "comprar.html": [["Todo el catálogo", "comprar.html"], ["SUV", "comprar.html?tipo=suv"], ["Compactos", "comprar.html?tipo=compacto"], ["Híbridos", "comprar.html?combustible=hibrido"]],
  "financiacion.html": [["Opciones de financiación", "financiacion.html"], ["Solicitar propuesta", "contacto.html?motivo=financiacion"], ["Entregar mi coche", "tasacion.html"]],
  "como-funciona.html": [["Proceso de compra", "como-funciona.html#comprar-proceso"], ["Proceso de venta", "como-funciona.html#vender-proceso"]],
  "contacto.html": [["Formulario de contacto", "contacto.html"], ["WhatsApp y teléfono", "contacto.html?motivo=whatsapp"]],
};

if (nav) {
  [...nav.querySelectorAll(":scope > a:not(.nav-cta)")].forEach((anchor) => {
    const items = navMenuItems[anchor.getAttribute("href")];
    if (!items) return;
    const group = document.createElement("div");
    group.className = "nav-group";
    const submenu = document.createElement("div");
    submenu.className = "nav-submenu";
    submenu.setAttribute("aria-label", `Opciones de ${anchor.textContent.trim()}`);
    submenu.innerHTML = items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
    anchor.before(group);
    group.append(anchor, submenu);
  });
}

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const accountActive = document.body.dataset.page === "mi-espacio" ? " is-active" : "";
  siteHeader.insertAdjacentHTML("beforeend", `<div class="header-tools"><label class="currency-control"><span class="sr-only">Moneda orientativa</span><select data-currency-select aria-label="Mostrar precios en otra moneda" title="Conversión orientativa; el precio final se confirmará en euros"><option value="EUR">EUR €</option><option value="USD">USD $</option><option value="GBP">GBP £</option><option value="CHF">CHF</option></select></label><a class="header-icon${accountActive}" href="mi-espacio.html" aria-label="Abrir mi espacio Celeritas" title="Mi espacio Celeritas"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg></a></div>`);
}

const assuranceBar = document.querySelector(".assurance-bar");
if (assuranceBar) assuranceBar.innerHTML = `<span>✓ Garantía Celeritas</span><a href="checkout.html">Entrega nacional e internacional</a><a href="como-funciona.html">Historial e inspección transparente</a>`;

let scrollWheel = document.querySelector(".scroll-wheel");
if (!scrollWheel) {
  document.body.insertAdjacentHTML("beforeend", '<aside class="scroll-wheel" aria-hidden="true"><img src="assets/celeritas-wheel-icon-outlined.svg" alt=""/></aside>');
  scrollWheel = document.querySelector(".scroll-wheel");
}
if (scrollWheel) {
  scrollWheel.querySelector("span")?.remove();
  const cartItems = getCartItems();
  const favoriteItems = getFavorites();
  scrollWheel.insertAdjacentHTML("beforebegin", `<div class="floating-vehicle-actions" aria-label="Favoritos y carrito"><a class="floating-action" href="favoritos.html" data-favorites-link aria-label="Ver favoritos" title="Ver favoritos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.4 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></svg><b data-favorite-count ${favoriteItems.length ? "" : "hidden"}>${favoriteItems.length}</b></a><a class="floating-action cart-link" href="checkout.html" data-cart-link aria-label="Ver carrito" title="Ver carrito"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10h9.9l2-7H6M9 19h.01M17 19h.01" /></svg><b data-cart-count ${cartItems.length ? "" : "hidden"}>${cartItems.length}</b></a></div>`);
}

syncCartIndicator();
syncFavoriteIndicator();

document.querySelectorAll("[data-currency-select]").forEach((select) => {
  select.value = currentCurrency;
  select.addEventListener("change", () => {
    currentCurrency = select.value;
    savePreference("celeritas-currency", currentCurrency);
    updateCurrencyPrices();
  });
});

const siteFooter = document.querySelector(".site-footer");
const footerBrand = siteFooter?.querySelector(".footer-brand");
footerBrand?.insertAdjacentHTML("afterend", `<div class="footer-contact"><strong>Contacto</strong><a href="contacto.html?motivo=whatsapp">WhatsApp y teléfono · 91 000 00 00</a><a href="mailto:hola@celeritas-motors.com">hola@celeritas-motors.com</a><span>España · Atención online y con cita previa</span><span>Instagram · Próximamente</span></div>`);

function updateWheel() {
  root.style.setProperty("--wheel-angle", `${window.scrollY * 0.42}deg`);
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
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

function vehicleIdFromCard(card) {
  try { return new URL(card.getAttribute("href"), window.location.href).searchParams.get("id"); } catch { return null; }
}

const vehicleRatingById = {
  "porsche-cayenne": 4.5,
  "seat-ibiza": 4.5,
  "vw-golf": 4,
  "renault-clio": 3.5,
  "toyota-corolla": 4.5,
  "nissan-qashqai": 3.5,
  "peugeot-208": 4,
};

function wheelRatingMarkup(rating, label = "Valoración Celeritas", className = "") {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(Number(rating) * 2) / 2));
  const wheels = Array.from({ length: 5 }, (_, index) => {
    const threshold = index + 1;
    const state = normalizedRating >= threshold ? "full" : normalizedRating >= threshold - .5 ? "half" : "empty";
    return `<span class="rating-wheel is-${state}" aria-hidden="true"></span>`;
  }).join("");
  const displayRating = Number.isInteger(normalizedRating) ? String(normalizedRating) : normalizedRating.toFixed(1).replace(".", ",");
  return `<div class="wheel-rating ${className}" role="img" aria-label="${label}: ${displayRating} de 5 ruedas"><span class="wheel-rating-icons">${wheels}</span><strong>${displayRating}/5</strong></div>`;
}

function addBuyButtonToCard(card, id) {
  if (!card || card.querySelector("[data-card-buy]")) return;
  const price = card.querySelector(".price-stack") || card.querySelector(".inventory-card-copy > div:not(.wheel-rating) > strong");
  if (!price) return;
  const priceRow = price.closest(".inventory-card-copy > div");
  priceRow?.classList.add("card-price-row");
  const purchaseStack = document.createElement("span");
  purchaseStack.className = "card-purchase-stack";
  const buyButton = document.createElement("span");
  buyButton.className = "card-buy-button";
  buyButton.dataset.cardBuy = id;
  buyButton.setAttribute("role", "button");
  buyButton.setAttribute("tabindex", "0");
  buyButton.setAttribute("aria-label", "Comprar este coche");
  buyButton.textContent = "Comprar";
  price.before(purchaseStack);
  purchaseStack.append(buyButton, price);
}

function enhanceVehicleCards() {
  const favoriteIds = getFavorites();
  document.querySelectorAll('a.inventory-card[href*="coche.html?id="]').forEach((card) => {
    if (card.closest(".vehicle-card-shell")) return;
    const id = vehicleIdFromCard(card);
    if (!id) return;
    const name = card.querySelector(".inventory-card-copy > p")?.textContent.trim() || "este coche";
    const rating = vehicleRatingById[id] || 4;
    const cardCopy = card.querySelector(".inventory-card-copy");
    const priceRow = cardCopy?.querySelector(":scope > div");
    if (priceRow && !cardCopy.querySelector(".wheel-rating")) priceRow.insertAdjacentHTML("beforebegin", wheelRatingMarkup(rating, `Valoración de ${name}`, "wheel-rating-card"));
    card.querySelector(".condition-pill")?.remove();
    card.querySelector(".discount-pill")?.remove();
    const flagGroup = card.querySelector(".card-flags");
    if (flagGroup && !flagGroup.children.length) flagGroup.remove();
    const shell = document.createElement("article");
    shell.className = "vehicle-card-shell";
    card.before(shell);
    shell.append(card);
    addBuyButtonToCard(card, id);
    shell.insertAdjacentHTML("beforeend", `<div class="card-actions" aria-label="Acciones para ${name}"><button type="button" data-favorite-vehicle="${id}" aria-label="Guardar ${name} en favoritos" aria-pressed="${favoriteIds.includes(id)}" title="Guardar en favoritos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.4 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></svg></button><button type="button" data-share-vehicle="${id}" data-share-name="${name}" aria-label="Compartir ${name}" title="Compartir"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg></button><button type="button" data-cart-vehicle="${id}" aria-label="Añadir ${name} al carrito" title="Añadir al carrito"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10h9.9l2-7H6M9 19h.01M17 19h.01" /></svg></button></div>`);
    const favoriteButton = shell.querySelector("[data-favorite-vehicle]");
    favoriteButton?.classList.toggle("is-active", favoriteIds.includes(id));
  });

  document.querySelectorAll(".condition-pill, .discount-pill").forEach((badge) => badge.remove());
}

enhanceVehicleCards();

document.addEventListener("click", async (event) => {
  const buyButton = event.target.closest("[data-card-buy]");
  if (buyButton) {
    event.preventDefault();
    event.stopPropagation();
    const id = buyButton.dataset.cardBuy;
    const items = getCartItems();
    if (!items.includes(id)) {
      animateVehicleToTarget(buyButton, document.querySelector("[data-cart-link]"));
      saveCartItems([...items, id]);
      window.setTimeout(() => { window.location.href = `checkout.html?id=${id}`; }, 620);
    } else {
      window.location.href = `checkout.html?id=${id}`;
    }
    return;
  }

  const favoriteButton = event.target.closest("[data-favorite-vehicle]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favoriteVehicle;
    const favorites = getFavorites();
    const willSave = !favorites.includes(id);
    const next = willSave ? [...favorites, id] : favorites.filter((item) => item !== id);
    saveFavorites(next);
    document.querySelectorAll(`[data-favorite-vehicle="${id}"]`).forEach((button) => {
      button.classList.toggle("is-active", willSave);
      button.setAttribute("aria-pressed", String(willSave));
    });
    if (willSave) animateVehicleToTarget(favoriteButton, document.querySelector("[data-favorites-link]"));
    renderFavoritesPage();
    showToast(willSave ? "Guardado en favoritos" : "Eliminado de favoritos");
    return;
  }

  const shareButton = event.target.closest("[data-share-vehicle]");
  if (shareButton) {
    const id = shareButton.dataset.shareVehicle;
    const name = shareButton.dataset.shareName;
    const url = new URL(`coche.html?id=${id}`, window.location.href).href;
    try {
      if (navigator.share) await navigator.share({ title: `${name} — Celeritas`, text: `Mira este ${name} en Celeritas.`, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast("Enlace copiado para compartir");
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("No se ha podido compartir el enlace");
    }
    return;
  }

  const cartButton = event.target.closest("[data-cart-vehicle]");
  if (cartButton) {
    const id = cartButton.dataset.cartVehicle;
    const items = getCartItems();
    if (!items.includes(id)) {
      animateVehicleToTarget(cartButton, document.querySelector("[data-cart-link]"));
      saveCartItems([...items, id]);
    }
    showToast(items.includes(id) ? "Este coche ya está en tu carrito" : "Coche añadido al carrito");
  }
});

document.addEventListener("keydown", (event) => {
  const buyButton = event.target.closest?.("[data-card-buy]");
  if (!buyButton || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  buyButton.click();
});

const vehicleItems = [...document.querySelectorAll("[data-vehicle]")];
const filterSearch = document.querySelector("#filter-search");
const filterType = document.querySelector("#filter-type");
const filterFuel = document.querySelector("#filter-fuel");
const filterPrice = document.querySelector("#filter-price");
const filterTransmission = document.querySelector("#filter-transmission");
const filterYear = document.querySelector("#filter-year");
const filterLocation = document.querySelector("#filter-location");
const filterSort = document.querySelector("#filter-sort");
const resultCount = document.querySelector("#result-count");
const catalogEmpty = document.querySelector("#catalog-empty");
const mobileFilterButton = document.querySelector(".mobile-filter-toggle");
const inventoryCatalog = document.querySelector(".inventory-catalog");
const contactReason = document.querySelector("[data-contact-reason]");
const contactMessage = document.querySelector(".form-panel textarea");

if (contactReason) {
  const contactParams = new URLSearchParams(window.location.search);
  const requestedReason = contactParams.get("motivo");
  if ([...contactReason.options].some((option) => option.value === requestedReason)) contactReason.value = requestedReason;
  const requestedVehicle = contactParams.get("coche");
  if (contactMessage && requestedVehicle) {
    const entry = contactParams.get("entrada");
    const term = contactParams.get("plazo");
    contactMessage.value = `Me interesa financiar el ${requestedVehicle}.${entry ? ` Entrada aproximada: ${Number(entry).toLocaleString("es-ES")} €.` : ""}${term ? ` Plazo orientativo: ${term}.` : ""}`;
  }
}

const guideSelector = document.querySelector(".guided-selector");
document.querySelector("[data-guide-open]")?.addEventListener("click", () => {
  if (guideSelector) {
    guideSelector.open = true;
    guideSelector.scrollIntoView({ block: "start" });
  }
});

mobileFilterButton?.addEventListener("click", () => {
  const open = inventoryCatalog?.classList.toggle("filters-open") || false;
  mobileFilterButton.setAttribute("aria-expanded", String(open));
  const icon = mobileFilterButton.querySelector("b");
  if (icon) icon.textContent = open ? "−" : "＋";
});

const heroFilterToggle = document.querySelector("[data-hero-filter-toggle]");
const heroFilters = document.querySelector("[data-hero-filters]");

heroFilterToggle?.addEventListener("click", () => {
  const open = heroFilters?.classList.toggle("filters-open") || false;
  heroFilterToggle.setAttribute("aria-expanded", String(open));
  const icon = heroFilterToggle.querySelector("b");
  if (icon) icon.textContent = open ? "−" : "＋";
});

function normalize(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function updateCatalog() {
  const search = normalize(filterSearch?.value.trim() || "");
  const type = filterType?.value || "all";
  const fuel = filterFuel?.value || "all";
  const maxPrice = Number(filterPrice?.value || 999999);
  const transmission = filterTransmission?.value || "all";
  const minYear = Number(filterYear?.value || 0);
  const location = filterLocation?.value || "all";
  let visible = 0;

  vehicleItems.forEach((item) => {
    const show = (!search || normalize(item.dataset.search).includes(search)) &&
      (type === "all" || item.dataset.type === type) &&
      (fuel === "all" || item.dataset.fuel === fuel) &&
      (transmission === "all" || item.dataset.transmission === transmission) &&
      (location === "all" || item.dataset.location === location) &&
      Number(item.dataset.year || 0) >= minYear &&
      Number(item.dataset.price) <= maxPrice;
    const cardShell = item.closest(".vehicle-card-shell");
    if (cardShell) cardShell.hidden = !show;
    else item.hidden = !show;
    if (show) visible += 1;
  });

  if (resultCount) resultCount.textContent = String(visible);
  if (catalogEmpty) catalogEmpty.hidden = visible !== 0;
}

function sortCatalog() {
  const grid = document.querySelector(".inventory-grid");
  if (!grid || !filterSort) return;
  const mode = filterSort.value;
  const recommendedOrder = new Map(vehicleItems.map((item, index) => [item, index]));
  const sortedItems = [...vehicleItems].sort((a, b) => {
    if (mode === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
    if (mode === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
    if (mode === "km-asc") return Number(a.dataset.km) - Number(b.dataset.km);
    if (mode === "year-desc") return Number(b.dataset.year) - Number(a.dataset.year) || Number(a.dataset.km) - Number(b.dataset.km);
    return recommendedOrder.get(a) - recommendedOrder.get(b);
  });
  sortedItems.forEach((item) => grid.append(item.closest(".vehicle-card-shell") || item));
}

[filterSearch, filterType, filterFuel, filterPrice, filterTransmission, filterYear, filterLocation].forEach((control) => {
  control?.addEventListener(control === filterSearch ? "input" : "change", updateCatalog);
});
filterSort?.addEventListener("change", sortCatalog);

if (vehicleItems.length) {
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("tipo");
  const requestedFuel = params.get("combustible");
  const requestedBrand = params.get("marca");
  const requestedQuery = params.get("q");
  const requestedPrice = params.get("precio");
  if (filterType && [...filterType.options].some((option) => option.value === requestedType)) filterType.value = requestedType;
  if (filterFuel && [...filterFuel.options].some((option) => option.value === requestedFuel)) filterFuel.value = requestedFuel;
  if (filterPrice && [...filterPrice.options].some((option) => option.value === requestedPrice)) filterPrice.value = requestedPrice;
  if (filterSearch && requestedQuery) filterSearch.value = requestedQuery;
  else if (filterSearch && requestedBrand && requestedBrand !== "all") filterSearch.value = requestedBrand;
  updateCatalog();
  sortCatalog();
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
    const reasonSelect = interestDialog?.querySelector("select");
    if (reasonSelect && button.dataset.interestReason) reasonSelect.value = button.dataset.interestReason;
    interestDialog?.querySelector("form")?.removeAttribute("hidden");
    interestDialog?.querySelector(".success-message")?.setAttribute("hidden", "");
    interestDialog?.showModal();
  });
});

const vehicleCatalog = {
  "porsche-cayenne": {
    name: "Porsche Cayenne E-Hybrid",
    kicker: "Porsche · SUV híbrido enchufable · Oferta temporal",
    summary: "2021 · 64.800 km · Híbrido enchufable · Cambio automático",
    price: "65.900 €",
    priceEur: 65900,
    previousPriceEur: 74900,
    marketAvg: 70200,
    location: "Madrid",
    imageClass: "car-cayenne",
    image: "assets/vehicle-porsche-cayenne-v1.png",
    catalog: "https://autocatalogarchive.com/porsche/",
    specs: { Año: "2021", Kilómetros: "64.800 km", Combustible: "Híbrido enchufable", Cambio: "Automático", Potencia: "462 CV", Etiqueta: "0", Puertas: "5", Plazas: "5", Propietarios: "1" },
    condition: { Neumáticos: "Buen estado (80% de vida útil)", Carrocería: "Excelente estado general", Interior: "Muy buen estado, sin desgaste relevante" },
    defects: ["Leve marca de uso en una llanta trasera"],
    features: ["Sistema híbrido enchufable", "Tracción total", "Navegación", "Cámara 360°", "Climatizador de cuatro zonas", "Faros LED matriciales"]
  },
  "seat-ibiza": {
    name: "SEAT Ibiza 1.0 TSI FR",
    kicker: "SEAT · Utilitario",
    summary: "2022 · 39.800 km · Gasolina · Cambio manual",
    price: "17.490 €",
    priceEur: 17490,
    marketAvg: 18700,
    location: "Madrid",
    imageClass: "car-seat",
    image: "assets/vehicle-seat-ibiza.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2022/07/Seat-Ibiza-2022-IE.pdf",
    specs: { Año: "2022", Kilómetros: "39.800 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "110 CV", Etiqueta: "C", Puertas: "5", Plazas: "5", Propietarios: "1" },
    condition: { Neumáticos: "Buen estado (75% de vida útil)", Carrocería: "Sin golpes registrados", Interior: "Muy buen estado, sin desgaste" },
    defects: [],
    features: ["Acabado FR", "Pantalla multimedia", "Climatizador", "Sensores de aparcamiento", "Control de crucero", "Faros LED"]
  },
  "vw-golf": {
    name: "Volkswagen Golf 1.5 TSI Style",
    kicker: "Volkswagen · Compacto",
    summary: "2021 · 52.400 km · Gasolina · Cambio manual",
    price: "20.900 €",
    priceEur: 20900,
    marketAvg: 22100,
    location: "Barcelona",
    imageClass: "car-golf",
    image: "assets/vehicle-vw-golf.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/09/VW-Golf-2021-FR.pdf",
    specs: { Año: "2021", Kilómetros: "52.400 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "130 CV", Etiqueta: "C", Puertas: "5", Plazas: "5", Propietarios: "1" },
    condition: { Neumáticos: "Buen estado (80% de vida útil)", Carrocería: "Sin golpes registrados", Interior: "Muy buen estado" },
    defects: ["Pequeño arañazo en el paragolpes trasero"],
    features: ["Acabado Style", "Navegación", "Climatizador trizona", "Sensores delanteros y traseros", "Control de crucero adaptativo", "Faros LED"]
  },
  "renault-clio": {
    name: "Renault Clio TCe Zen",
    kicker: "Renault · Utilitario",
    summary: "2022 · 34.500 km · Gasolina · Cambio manual",
    price: "16.250 €",
    priceEur: 16250,
    marketAvg: 17400,
    location: "Valencia",
    imageClass: "car-clio",
    image: "assets/vehicle-renault-clio.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2023/01/Renault-Clio-2022-UK-.pdf",
    specs: { Año: "2022", Kilómetros: "34.500 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "90 CV", Etiqueta: "C", Puertas: "5", Plazas: "5", Propietarios: "2" },
    condition: { Neumáticos: "Estado aceptable (55% de vida útil)", Carrocería: "Sin golpes registrados", Interior: "Buen estado, ligero desgaste en el asiento del conductor" },
    defects: ["Ligero desgaste en el asiento del conductor", "Recomendable cambio de neumáticos a medio plazo"],
    features: ["Pantalla multimedia", "Apple CarPlay y Android Auto", "Cámara trasera", "Ayuda al aparcamiento", "Control de crucero", "Asistente de carril"]
  },
  "toyota-corolla": {
    name: "Toyota Corolla 125H Active Tech",
    kicker: "Toyota · Compacto híbrido",
    summary: "2021 · 49.600 km · Híbrido · Cambio automático",
    price: "22.900 €",
    priceEur: 22900,
    marketAvg: 23600,
    location: "Sevilla",
    imageClass: "car-corolla",
    image: "assets/vehicle-toyota-corolla.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/11/Toyota-Corolla-2021-UK.pdf",
    specs: { Año: "2021", Kilómetros: "49.600 km", Combustible: "Híbrido", Cambio: "Automático", Potencia: "122 CV", Etiqueta: "ECO", Puertas: "5", Plazas: "5", Propietarios: "1" },
    condition: { Neumáticos: "Buen estado (85% de vida útil)", Carrocería: "Sin golpes registrados", Interior: "Excelente estado" },
    defects: [],
    features: ["Sistema híbrido Toyota", "Cámara trasera", "Climatizador bizona", "Control de crucero adaptativo", "Lectura de señales", "Arranque sin llave"]
  },
  "nissan-qashqai": {
    name: "Nissan Qashqai DIG-T N-Connecta",
    kicker: "Nissan · SUV",
    summary: "2021 · 55.200 km · Gasolina · Cambio manual",
    price: "23.900 €",
    priceEur: 23900,
    marketAvg: 24800,
    location: "Bilbao",
    imageClass: "car-qashqai",
    image: "assets/vehicle-nissan-qashqai.png",
    catalog: "https://autocatalogarchive.com/wp-content/uploads/2021/04/Nissan-Qashqai-2021-IE.pdf",
    specs: { Año: "2021", Kilómetros: "55.200 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "140 CV", Etiqueta: "ECO", Puertas: "5", Plazas: "5", Propietarios: "2" },
    condition: { Neumáticos: "Buen estado (70% de vida útil)", Carrocería: "Repintado en puerta trasera derecha (golpe leve reparado)", Interior: "Buen estado" },
    defects: ["Repintado en puerta trasera derecha por golpe leve, ya reparado"],
    features: ["Acabado N-Connecta", "Cámara de visión 360°", "Navegación", "Llave inteligente", "Sensores de aparcamiento", "Asistente de ángulo muerto"]
  },
  "peugeot-208": {
    name: "Peugeot 208 PureTech Allure",
    kicker: "Peugeot · Utilitario",
    summary: "2022 · 31.700 km · Gasolina · Cambio manual",
    price: "17.800 €",
    priceEur: 17800,
    marketAvg: 18500,
    location: "Zaragoza",
    imageClass: "car-peugeot",
    image: "assets/vehicle-peugeot-208.png",
    catalog: "https://autocatalogarchive.com/peugeot/",
    specs: { Año: "2022", Kilómetros: "31.700 km", Combustible: "Gasolina", Cambio: "Manual", Potencia: "100 CV", Etiqueta: "C", Puertas: "5", Plazas: "5", Propietarios: "1" },
    condition: { Neumáticos: "Buen estado (78% de vida útil)", Carrocería: "Sin golpes registrados", Interior: "Muy buen estado" },
    defects: [],
    features: ["Acabado Allure", "Peugeot i-Cockpit", "Pantalla táctil", "Climatizador", "Sensores traseros", "Asistente de carril"]
  }
};

const standardServices = [
  { id: "transfer", label: "Gestión del cambio de titularidad", description: "Preparamos y presentamos toda la documentación a tu nombre.", price: 390 },
  { id: "maintenance", label: "Mantenimiento preentrega ampliado", description: "Aceite, filtros, niveles y comprobación final antes de la entrega.", price: 260 },
];

const vehicleReports = {
  "porsche-cayenne": {
    ratings: { General: 4.5, Mecánica: 5, Carrocería: 4, Interior: 4.5, Neumáticos: 4 },
    history: { "Titulares anteriores": "1", Llaves: "2", Mantenimiento: "Historial digital disponible", "Daños estructurales": "No declarados" },
    roadTest: ["Arranque en frío y ralentí: correctos", "Prueba urbana y autovía hasta 120 km/h: sin avisos", "Dirección, frenada y suspensión: sin ruidos anómalos", "Climatización y sistemas eléctricos: funcionamiento comprobado"],
    services: [{ id: "wheel-repair", label: "Reparación estética de llanta trasera", description: "Corrección de la marca de uso declarada en el informe.", price: 160 }, ...standardServices],
  },
  "seat-ibiza": {
    ratings: { General: 4.5, Mecánica: 4.5, Carrocería: 4.5, Interior: 4.5, Neumáticos: 4 },
    history: { "Titulares anteriores": "1", Llaves: "2", Mantenimiento: "Libro de mantenimiento disponible", "Daños estructurales": "No declarados" },
    roadTest: ["Arranque y ralentí: correctos", "Prueba urbana y autovía hasta 120 km/h: sin avisos", "Cambio, dirección y frenada: respuesta normal", "Climatización y sistemas multimedia: comprobados"],
    services: [{ id: "detailing", label: "Preparación estética premium", description: "Limpieza técnica interior y protección exterior.", price: 140 }, ...standardServices],
  },
  "vw-golf": {
    ratings: { General: 4, Mecánica: 4.5, Carrocería: 4, Interior: 4, Neumáticos: 4 },
    history: { "Titulares anteriores": "1", Llaves: "2", Mantenimiento: "Facturas principales disponibles", "Daños estructurales": "No declarados" },
    roadTest: ["Arranque y ralentí: correctos", "Prueba urbana y autovía hasta 120 km/h: sin avisos", "Cambio manual y embrague: funcionamiento normal", "Sin ruidos anómalos en suspensión o dirección"],
    services: [{ id: "bumper-repair", label: "Reparar arañazo del paragolpes", description: "Corrección y acabado del defecto estético declarado.", price: 240 }, ...standardServices],
  },
  "renault-clio": {
    ratings: { General: 3.5, Mecánica: 4, Carrocería: 4, Interior: 3.5, Neumáticos: 3 },
    history: { "Titulares anteriores": "2", Llaves: "2", Mantenimiento: "Documentación parcial disponible", "Daños estructurales": "No declarados" },
    roadTest: ["Arranque y ralentí: correctos", "Prueba urbana y carretera: sin avisos de motor", "Dirección y frenada: funcionamiento normal", "Climatización comprobada; neumáticos con desgaste medio"],
    services: [{ id: "tyres", label: "Juego de neumáticos nuevos", description: "Sustitución de los cuatro neumáticos antes de la entrega.", price: 520 }, { id: "upholstery", label: "Reparación de tapicería", description: "Corrección del desgaste del asiento del conductor.", price: 180 }, ...standardServices],
  },
  "toyota-corolla": {
    ratings: { General: 4.5, Mecánica: 5, Carrocería: 4.5, Interior: 4.5, Neumáticos: 4.5 },
    history: { "Titulares anteriores": "1", Llaves: "2", Mantenimiento: "Historial Toyota disponible", "Daños estructurales": "No declarados" },
    roadTest: ["Sistema híbrido y arranque: correctos", "Prueba urbana y autovía hasta 120 km/h: sin avisos", "Transición eléctrica y térmica: funcionamiento normal", "Frenada, dirección y climatización: comprobadas"],
    services: [{ id: "hybrid-check", label: "Informe ampliado del sistema híbrido", description: "Diagnóstico adicional y certificado del estado de la batería.", price: 120 }, ...standardServices],
  },
  "nissan-qashqai": {
    ratings: { General: 3.5, Mecánica: 4, Carrocería: 3.5, Interior: 4, Neumáticos: 3.5 },
    history: { "Titulares anteriores": "2", Llaves: "2", Mantenimiento: "Historial disponible para revisión", "Daños estructurales": "No declarados; puerta trasera repintada" },
    roadTest: ["Arranque y ralentí: correctos", "Prueba urbana y autovía hasta 120 km/h: sin avisos", "Dirección, embrague y frenada: funcionamiento normal", "Cámaras, sensores y climatización: comprobados"],
    services: [{ id: "paint-report", label: "Informe ampliado de pintura", description: "Medición y documentación fotográfica de la reparación declarada.", price: 90 }, ...standardServices],
  },
  "peugeot-208": {
    ratings: { General: 4, Mecánica: 4.5, Carrocería: 4, Interior: 4, Neumáticos: 4 },
    history: { "Titulares anteriores": "1", Llaves: "2", Mantenimiento: "Libro de mantenimiento disponible", "Daños estructurales": "No declarados" },
    roadTest: ["Arranque y ralentí: correctos", "Prueba urbana y carretera: sin avisos", "Cambio manual, frenada y dirección: funcionamiento normal", "Climatización, pantalla y ayudas: comprobadas"],
    services: [{ id: "detailing", label: "Preparación estética premium", description: "Limpieza técnica interior y protección exterior.", price: 140 }, ...standardServices],
  },
};

function renderFavoritesPage() {
  const root = document.querySelector("[data-favorites-root]");
  if (!root) return;
  const grid = root.querySelector("[data-favorites-grid]");
  const empty = root.querySelector("[data-favorites-empty]");
  const favorites = getFavorites().filter((id) => Boolean(vehicleCatalog[id]));
  empty.hidden = favorites.length > 0;
  grid.hidden = favorites.length === 0;
  grid.innerHTML = favorites.map((id) => {
    const vehicle = vehicleCatalog[id];
    const rating = vehicleRatingById[id] || 4;
    return `<article class="vehicle-card-shell"><a class="inventory-card large" href="coche.html?id=${id}"><div class="single-car-photo ${vehicle.imageClass} view-front" role="img" aria-label="${vehicle.name}, vista frontal"></div><div class="inventory-card-copy"><p>${vehicle.name}</p><span>${vehicle.summary}</span>${wheelRatingMarkup(rating, `Valoración de ${vehicle.name}`, "wheel-rating-card")}<div><small>Ver ficha completa</small><strong data-price-eur="${vehicle.priceEur}">${vehicle.price}</strong></div></div></a><div class="card-actions" aria-label="Acciones para ${vehicle.name}"><button class="is-active" type="button" data-favorite-vehicle="${id}" aria-label="Eliminar ${vehicle.name} de favoritos" aria-pressed="true" title="Eliminar de favoritos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.4 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></svg></button><button type="button" data-share-vehicle="${id}" data-share-name="${vehicle.name}" aria-label="Compartir ${vehicle.name}" title="Compartir"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg></button><button type="button" data-cart-vehicle="${id}" aria-label="Añadir ${vehicle.name} al carrito" title="Añadir al carrito"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10h9.9l2-7H6M9 19h.01M17 19h.01" /></svg></button></div></article>`;
  }).join("");
  grid.querySelectorAll("a.inventory-card").forEach((card) => addBuyButtonToCard(card, vehicleIdFromCard(card)));
  updateCurrencyPrices();
}

renderFavoritesPage();

function accountDisplayName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Conductor Celeritas";
}

function accountCompletion(profile) {
  const fields = ["firstName", "lastName", "email", "phone", "city", "province"];
  const completed = fields.filter((field) => String(profile[field] || "").trim()).length;
  return Math.round((completed / fields.length) * 100);
}

function updateAccountIdentity(profile) {
  const fullName = accountDisplayName(profile);
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((part) => String(part).trim().charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "C";
  document.querySelectorAll("[data-account-display-name]").forEach((element) => { element.textContent = fullName; });
  document.querySelectorAll("[data-account-display-email]").forEach((element) => { element.textContent = profile.email || "Completa tus datos personales"; });
  document.querySelectorAll("[data-account-initials]").forEach((element) => { element.textContent = initials; });
  document.querySelectorAll("[data-account-completion]").forEach((element) => { element.textContent = `${accountCompletion(profile)}%`; });
}

function fillFormFromAccount(profile) {
  const valuesByAutocomplete = {
    name: accountDisplayName(profile) === "Conductor Celeritas" ? "" : accountDisplayName(profile),
    "given-name": profile.firstName || "",
    "family-name": profile.lastName || "",
    email: profile.email || "",
    tel: profile.phone || "",
    "street-address": profile.address || "",
    "postal-code": profile.postalCode || "",
    "address-level2": profile.city || "",
    "address-level1": profile.province || "",
  };
  Object.entries(valuesByAutocomplete).forEach(([autocomplete, value]) => {
    if (!value) return;
    document.querySelectorAll(`[autocomplete="${autocomplete}"]`).forEach((input) => {
      if (!input.value) input.value = value;
    });
  });
}

function renderAccountPage() {
  const root = document.querySelector("[data-account-page]");
  if (!root) return;
  let profile = getAccountProfile();
  const form = root.querySelector("[data-account-form]");
  const favorites = getFavorites().filter((id) => Boolean(vehicleCatalog[id]));
  const cart = getCartItems().filter((id) => Boolean(vehicleCatalog[id]));
  const selectedIds = uniqueVehicleIds([...favorites, ...cart]);
  root.querySelector("[data-account-favorites]").textContent = String(favorites.length);
  root.querySelector("[data-account-cart]").textContent = String(cart.length);
  root.querySelector("[data-account-currency]").textContent = currentCurrency;

  const vehicleList = root.querySelector("[data-account-vehicle-list]");
  const vehicleEmpty = root.querySelector("[data-account-vehicle-empty]");
  vehicleList.hidden = selectedIds.length === 0;
  vehicleEmpty.hidden = selectedIds.length > 0;
  vehicleList.innerHTML = selectedIds.map((id) => {
    const vehicle = vehicleCatalog[id];
    const states = [];
    if (favorites.includes(id)) states.push("Favorito");
    if (cart.includes(id)) states.push("En el carrito");
    return `<a href="coche.html?id=${id}"><span class="account-vehicle-thumb ${vehicle.imageClass} view-front" aria-hidden="true"></span><span><strong>${vehicle.name}</strong><small>${states.join(" · ")}</small></span><b data-price-eur="${vehicle.priceEur}">${vehicle.price}</b></a>`;
  }).join("");

  const fields = ["firstName", "lastName", "email", "phone", "address", "postalCode", "city", "province", "preferredContact"];
  fields.forEach((field) => {
    const control = form.elements.namedItem(field);
    if (control) control.value = profile[field] || (field === "preferredContact" ? "whatsapp" : "");
  });
  form.elements.namedItem("currency").value = profile.currency || currentCurrency;
  form.elements.namedItem("newCars").checked = Boolean(profile.newCars);
  form.elements.namedItem("priceChanges").checked = Boolean(profile.priceChanges);
  updateAccountIdentity(profile);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    profile = saveAccountProfile({
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      address: String(data.get("address") || "").trim(),
      postalCode: String(data.get("postalCode") || "").trim(),
      city: String(data.get("city") || "").trim(),
      province: String(data.get("province") || "").trim(),
      preferredContact: String(data.get("preferredContact") || "whatsapp"),
      currency: String(data.get("currency") || "EUR"),
      newCars: form.elements.namedItem("newCars").checked,
      priceChanges: form.elements.namedItem("priceChanges").checked,
    });
    currentCurrency = Object.hasOwn(currencyRates, profile.currency) ? profile.currency : "EUR";
    savePreference("celeritas-currency", currentCurrency);
    root.querySelector("[data-account-currency]").textContent = currentCurrency;
    updateAccountIdentity(profile);
    updateCurrencyPrices();
    const status = root.querySelector("[data-account-save-status]");
    status.textContent = "Perfil guardado correctamente.";
    showToast("Tu perfil Celeritas se ha guardado");
  });
}

renderAccountPage();
fillFormFromAccount(getAccountProfile());

const detailRoot = document.querySelector("[data-vehicle-detail]");
if (detailRoot) {
  const requestedId = new URLSearchParams(window.location.search).get("id") || "seat-ibiza";
  const id = Object.hasOwn(vehicleCatalog, requestedId) ? requestedId : "seat-ibiza";
  const vehicle = vehicleCatalog[id];
  const report = vehicleReports[id];
  document.querySelector("[data-detail-name]").textContent = vehicle.name;
  document.querySelector("[data-detail-kicker]").textContent = vehicle.kicker;
  document.querySelector("[data-detail-summary]").textContent = vehicle.summary;
  const detailPrice = document.querySelector("[data-detail-price]");
  detailPrice.dataset.priceEur = String(vehicle.priceEur);
  detailPrice.textContent = vehicle.price;
  document.querySelectorAll("[data-detail-photo]").forEach((photo) => photo.classList.add(vehicle.imageClass));
  const ratings = document.querySelector("[data-detail-ratings]");
  if (ratings) ratings.innerHTML = Object.entries(report.ratings).map(([label, rating]) => `<article><span>${label}</span>${wheelRatingMarkup(rating, `${label} de ${vehicle.name}`, "wheel-rating-detail")}</article>`).join("");
  const specs = document.querySelector("[data-detail-specs]");
  specs.innerHTML = Object.entries(vehicle.specs).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  const features = document.querySelector("[data-detail-features]");
  features.innerHTML = vehicle.features.map((feature) => `<li>✓ ${feature}</li>`).join("");
  const catalog = document.querySelector("[data-detail-catalog]");
  catalog.href = vehicle.catalog;
  document.querySelectorAll("[data-interest]").forEach((button) => { button.dataset.interestName = vehicle.name; });

  const condition = document.querySelector("[data-detail-condition]");
  if (condition) condition.innerHTML = Object.entries(vehicle.condition).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  const defectsList = document.querySelector("[data-detail-defects]");
  if (defectsList) {
    if (vehicle.defects.length) {
      defectsList.classList.remove("is-clean");
      defectsList.innerHTML = vehicle.defects.map((defect) => `<li>${defect}</li>`).join("");
    } else {
      defectsList.classList.add("is-clean");
      defectsList.innerHTML = `<li>Sin defectos declarados en la revisión de 100 puntos.</li>`;
    }
  }
  const marketLine = document.querySelector("[data-detail-market]");
  if (marketLine) {
    const diff = vehicle.marketAvg - vehicle.priceEur;
    marketLine.textContent = diff > 0
      ? `${diff.toLocaleString("es-ES")} € por debajo de la media de mercado (${vehicle.marketAvg.toLocaleString("es-ES")} €)`
      : `En línea con la media de mercado (${vehicle.marketAvg.toLocaleString("es-ES")} €)`;
  }
  const locationSpan = document.querySelector("[data-detail-location]");
  if (locationSpan) locationSpan.textContent = vehicle.location;
  const history = document.querySelector("[data-detail-history]");
  if (history) history.innerHTML = Object.entries(report.history).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  const roadTest = document.querySelector("[data-detail-road-test]");
  if (roadTest) roadTest.innerHTML = report.roadTest.map((item) => `<li>${item}</li>`).join("");
  const detailDeal = document.querySelector("[data-detail-deal]");
  if (detailDeal && vehicle.previousPriceEur) {
    detailDeal.hidden = false;
    const previousPrice = detailDeal.querySelector("[data-detail-previous-price]");
    previousPrice.dataset.priceEur = String(vehicle.previousPriceEur);
  }
  const checkoutLink = document.querySelector("[data-checkout-link]");
  const configCheckoutLink = document.querySelector("[data-config-checkout]");
  const servicesRoot = document.querySelector("[data-detail-services]");
  const serviceIdsFromUrl = (new URLSearchParams(window.location.search).get("services") || "").split(",").filter(Boolean);
  const storedServiceIds = readListPreference(`celeritas-services-${id}`);
  const initialServiceIds = serviceIdsFromUrl.length ? serviceIdsFromUrl : storedServiceIds;
  const validServices = new Map(report.services.map((service) => [service.id, service]));
  if (servicesRoot) {
    servicesRoot.innerHTML = report.services.map((service) => `<label class="service-option"><input type="checkbox" value="${service.id}" ${initialServiceIds.includes(service.id) ? "checked" : ""}/><span><strong>${service.label}</strong><small>${service.description}</small></span><b data-price-eur="${service.price}">${formatMoney(service.price)}</b></label>`).join("");
  }

  function updateVehicleConfiguration() {
    const selectedServiceIds = [...(servicesRoot?.querySelectorAll('input[type="checkbox"]:checked') || [])].map((input) => input.value).filter((serviceId) => validServices.has(serviceId));
    const extrasTotal = selectedServiceIds.reduce((total, serviceId) => total + validServices.get(serviceId).price, 0);
    const basePrice = document.querySelector("[data-config-base]");
    const extrasPrice = document.querySelector("[data-config-extras]");
    const totalPrice = document.querySelector("[data-config-total]");
    if (basePrice) basePrice.dataset.priceEur = String(vehicle.priceEur);
    if (extrasPrice) extrasPrice.dataset.priceEur = String(extrasTotal);
    if (totalPrice) totalPrice.dataset.priceEur = String(vehicle.priceEur + extrasTotal);
    savePreference(`celeritas-services-${id}`, JSON.stringify(selectedServiceIds));
    const checkoutParams = new URLSearchParams({ id });
    if (selectedServiceIds.length) checkoutParams.set("services", selectedServiceIds.join(","));
    const checkoutHref = `checkout.html?${checkoutParams.toString()}`;
    if (checkoutLink) checkoutLink.href = checkoutHref;
    if (configCheckoutLink) configCheckoutLink.href = checkoutHref;
    updateCurrencyPrices();
  }

  servicesRoot?.addEventListener("change", updateVehicleConfiguration);
  updateVehicleConfiguration();
  if (checkoutLink) {
    checkoutLink.addEventListener("click", () => {
      const items = getCartItems();
      if (!items.includes(id)) saveCartItems([...items, id]);
      savePreference("celeritas-selected-vehicle", id);
    });
  }
  configCheckoutLink?.addEventListener("click", () => {
    const items = getCartItems();
    if (!items.includes(id)) saveCartItems([...items, id]);
    savePreference("celeritas-selected-vehicle", id);
  });

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

const checkoutRoot = document.querySelector("[data-checkout-root]");
if (checkoutRoot) {
  const checkoutParams = new URLSearchParams(window.location.search);
  const queryId = checkoutParams.get("id");
  let cartItems = getCartItems().filter((id) => Boolean(vehicleCatalog[id]));
  if (queryId && vehicleCatalog[queryId] && !cartItems.includes(queryId)) cartItems = saveCartItems([...cartItems, queryId]);
  const requestedId = (queryId && vehicleCatalog[queryId] ? queryId : null) || cartItems[0] || null;
  const vehicle = requestedId ? vehicleCatalog[requestedId] : null;
  const emptyState = checkoutRoot.querySelector("[data-checkout-empty]");
  const content = checkoutRoot.querySelector("[data-checkout-content]");
  if (!vehicle) {
    emptyState.hidden = false;
  } else {
    savePreference("celeritas-selected-vehicle", requestedId);
    syncCartIndicator(cartItems);
    content.hidden = false;
    const cartList = content.querySelector("[data-cart-list]");
    cartList.innerHTML = cartItems.map((id) => {
      const item = vehicleCatalog[id];
      const current = id === requestedId;
      const savedServices = readListPreference(`celeritas-services-${id}`).filter((serviceId) => vehicleReports[id].services.some((service) => service.id === serviceId));
      const itemParams = new URLSearchParams({ id });
      if (savedServices.length) itemParams.set("services", savedServices.join(","));
      return `<article class="cart-vehicle-item${current ? " is-selected" : ""}"><a href="checkout.html?${itemParams.toString()}" aria-current="${current ? "true" : "false"}"><span class="cart-vehicle-thumb ${item.imageClass} view-front" aria-hidden="true"></span><span><strong>${item.name}</strong><small data-price-eur="${item.priceEur}">${item.price}</small></span></a><button type="button" data-cart-remove="${id}" aria-label="Quitar ${item.name} del carrito" title="Quitar del carrito">×</button></article>`;
    }).join("");
    cartList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-cart-remove]");
      if (!removeButton) return;
      const nextItems = saveCartItems(cartItems.filter((id) => id !== removeButton.dataset.cartRemove));
      showToast("Coche eliminado del carrito");
      const nextId = removeButton.dataset.cartRemove === requestedId ? nextItems[0] : requestedId;
      window.location.href = nextId ? `checkout.html?id=${nextId}` : "checkout.html";
    });
    content.querySelector("[data-checkout-name]").textContent = vehicle.name;
    content.querySelector("[data-checkout-summary]").textContent = vehicle.summary;
    const photo = content.querySelector("[data-checkout-photo]");
    photo.classList.add(vehicle.imageClass);
    photo.setAttribute("aria-label", `${vehicle.name}, vista frontal`);
    const detailLink = content.querySelector("[data-checkout-detail]");
    const report = vehicleReports[requestedId];
    const requestedServiceIds = (checkoutParams.get("services") || "").split(",").filter(Boolean);
    const storedServiceIds = readListPreference(`celeritas-services-${requestedId}`);
    const selectedServiceIds = (requestedServiceIds.length ? requestedServiceIds : storedServiceIds).filter((serviceId) => report.services.some((service) => service.id === serviceId));
    const selectedServices = report.services.filter((service) => selectedServiceIds.includes(service.id));
    const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    savePreference(`celeritas-services-${requestedId}`, JSON.stringify(selectedServiceIds));
    const detailParams = new URLSearchParams({ id: requestedId });
    if (selectedServiceIds.length) detailParams.set("services", selectedServiceIds.join(","));
    detailLink.href = `coche.html?${detailParams.toString()}`;
    const price = content.querySelector("[data-checkout-price]");
    const shipping = content.querySelector("[data-checkout-shipping]");
    const total = content.querySelector("[data-checkout-total]");
    const note = content.querySelector("[data-checkout-note]");
    const extras = content.querySelector("[data-checkout-extras]");
    const country = content.querySelector("[data-shipping-country]");
    const deliveryEstimates = { ES: 350, "ES-ISLANDS": 900, PT: 750, FR: 950, DE: 1250, IT: 1350, EU: 1600 };
    price.dataset.priceEur = String(vehicle.priceEur);
    if (extras && selectedServices.length) {
      extras.hidden = false;
      extras.innerHTML = selectedServices.map((service) => `<p><span>${service.label}</span><strong data-price-eur="${service.price}">${formatMoney(service.price)}</strong></p>`).join("");
    }

    function updateCheckoutEstimate() {
      const delivery = deliveryEstimates[country.value];
      if (delivery === undefined) {
        shipping.removeAttribute("data-price-eur");
        total.removeAttribute("data-price-eur");
        shipping.textContent = "A confirmar";
        total.textContent = "Presupuesto personalizado";
        note.textContent = "Para entregas fuera de la Unión Europea calcularemos transporte, impuestos y documentación de manera personalizada.";
      } else {
        shipping.dataset.priceEur = String(delivery);
        total.dataset.priceEur = String(vehicle.priceEur + servicesTotal + delivery);
        note.textContent = "Estimación no contractual. Confirmaremos el coste exacto según la dirección, el transporte y la documentación necesaria.";
        updateCurrencyPrices();
      }
    }

    country.addEventListener("change", updateCheckoutEstimate);
    updateCheckoutEstimate();
  }
}

function updateCountdowns() {
  document.querySelectorAll("[data-countdown]").forEach((element) => {
    const remaining = new Date(element.dataset.dealDeadline).getTime() - Date.now();
    if (remaining <= 0) {
      element.textContent = "Oferta finalizada";
      return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    element.textContent = `${days} d · ${hours} h · ${minutes} min`;
  });
}

if (document.querySelector("[data-countdown]")) {
  updateCountdowns();
  window.setInterval(updateCountdowns, 60000);
}

document.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close()));
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
updateCurrencyPrices();
updateWheel();
