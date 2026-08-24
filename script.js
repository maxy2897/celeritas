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
const filterPrice = document.querySelector("#filter-price");
const resultCount = document.querySelector("#result-count");
const catalogEmpty = document.querySelector("#catalog-empty");

function normalize(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function updateCatalog() {
  const search = normalize(filterSearch?.value.trim() || "");
  const type = filterType?.value || "all";
  const maxPrice = Number(filterPrice?.value || 999999);
  let visible = 0;

  vehicleItems.forEach((item) => {
    const show = (!search || normalize(item.dataset.search).includes(search)) &&
      (type === "all" || item.dataset.type === type) &&
      Number(item.dataset.price) <= maxPrice;
    item.hidden = !show;
    if (show) visible += 1;
  });

  if (resultCount) resultCount.textContent = String(visible);
  if (catalogEmpty) catalogEmpty.hidden = visible !== 0;
}

[filterSearch, filterType, filterPrice].forEach((control) => {
  control?.addEventListener(control === filterSearch ? "input" : "change", updateCatalog);
});

const interestDialog = document.querySelector("#interest-dialog");
document.querySelectorAll("[data-interest]").forEach((button) => {
  button.addEventListener("click", () => {
    const vehicle = button.closest("[data-vehicle]");
    const name = vehicle?.querySelector("h2")?.textContent || "Vehículo seleccionado";
    const heading = document.querySelector("#interest-name");
    if (heading) heading.textContent = name;
    interestDialog?.querySelector("form")?.removeAttribute("hidden");
    interestDialog?.querySelector(".success-message")?.setAttribute("hidden", "");
    interestDialog?.showModal();
  });
});

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
