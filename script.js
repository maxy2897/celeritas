const root = document.documentElement;
const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector("#main-nav");
const cards = [...document.querySelectorAll(".vehicle-card")];
const searchInput = document.querySelector("#filter-search");
const brandSelect = document.querySelector("#filter-brand");
const fuelSelect = document.querySelector("#filter-fuel");
const priceSelect = document.querySelector("#filter-price");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const interestDialog = document.querySelector("#interest-dialog");
const interestForm = document.querySelector("#interest-form");
const interestSuccess = document.querySelector("#interest-success");
const valuationForm = document.querySelector("#valuation-form");
const valuationSuccess = document.querySelector("#valuation-success");

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

mainNav?.addEventListener("click", () => {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
});

function normalize(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filterVehicles() {
  const search = normalize(searchInput.value.trim());
  const brand = brandSelect.value;
  const fuel = fuelSelect.value;
  const maxPrice = Number(priceSelect.value);
  let visible = 0;

  cards.forEach((card) => {
    const searchable = normalize(card.dataset.search);
    const matchesSearch = !search || searchable.includes(search);
    const matchesBrand = brand === "all" || card.dataset.brand === brand;
    const matchesFuel = fuel === "all" || card.dataset.fuel === fuel;
    const matchesPrice = Number(card.dataset.price) <= maxPrice;
    const show = matchesSearch && matchesBrand && matchesFuel && matchesPrice;

    card.hidden = !show;
    if (show) visible += 1;
  });

  resultCount.textContent = String(visible);
  emptyState.hidden = visible !== 0;
}

[searchInput, brandSelect, fuelSelect, priceSelect].forEach((control) => {
  control?.addEventListener(control === searchInput ? "input" : "change", filterVehicles);
});

document.querySelectorAll("[data-interest]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".vehicle-card");
    const brand = card.querySelector(".vehicle-body > p").textContent;
    const model = card.querySelector("h3").textContent;
    const price = card.querySelector(".vehicle-footer strong").textContent;
    const vehicle = `${brand} ${model} · ${price}`;

    document.querySelector("#interest-vehicle").textContent = vehicle;
    document.querySelector("#interest-model").value = vehicle;
    interestForm.hidden = false;
    interestSuccess.hidden = true;
    interestDialog.showModal();
  });
});

document.querySelector(".dialog-close")?.addEventListener("click", () => interestDialog.close());

interestDialog?.addEventListener("click", (event) => {
  const bounds = interestDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) interestDialog.close();
});

interestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!interestForm.reportValidity()) return;
  interestForm.hidden = true;
  interestSuccess.hidden = false;
});

valuationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!valuationForm.reportValidity()) return;
  valuationForm.hidden = true;
  valuationSuccess.hidden = false;
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateWheel();
