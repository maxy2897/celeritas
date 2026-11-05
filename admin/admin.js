// Panel de administración de Celeritas: resumen de contenido y estadísticas de GoatCounter.
const TOKEN_KEY = "celeritas-goatcounter-token";

const readStorage = (key) => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const writeStorage = (key, value) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* Storage can be unavailable in private browsing. */ }
};
const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const groupThousands = (value) => String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

async function loadJson(path, fallback) {
  try {
    const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-cache" });
    return response.ok ? await response.json() : fallback;
  } catch {
    return fallback;
  }
}

const [catalog, settings, shipments, shop] = await Promise.all([
  loadJson("../data/coches.json", { vehiculos: [] }),
  loadJson("../data/ajustes.json", {}),
  loadJson("../data/envios.json", { envios: [] }),
  loadJson("../data/tienda.json", { productos: [] }),
]);
const vehicles = catalog.vehiculos || [];
const vehicleNames = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle.nombre]));
const analyticsCode = String(settings.analitica?.goatcounter || "").trim().toLowerCase();
const codeIsValid = /^[a-z0-9-]{2,50}$/.test(analyticsCode);

const pageNames = {
  "/": "Portada", "/index.html": "Portada", "/comprar.html": "Catálogo", "/envios.html": "Envíos", "/mi-envio.html": "Mi envío",
  "/vender.html": "Vender", "/tasacion.html": "Tasación", "/tienda.html": "Tienda", "/conocenos.html": "Conócenos", "/contacto.html": "Contacto",
  "/checkout.html": "Cesta / reserva", "/comparar.html": "Comparador", "/favoritos.html": "Favoritos", "/financiacion.html": "Financiación",
  "/como-funciona.html": "Cómo funciona", "/mi-espacio.html": "Mi espacio",
};
function friendlyPath(path, title) {
  if (path.startsWith("evento/")) return title || path.slice(7);
  const car = /coche\.html\?id=([a-z0-9-]+)/.exec(path);
  if (car) return `Ficha: ${vehicleNames[car[1]] || car[1]}`;
  return pageNames[path.split("?")[0]] || title || path;
}

async function goatcounter(path, params = {}) {
  const token = readStorage(TOKEN_KEY);
  const url = new URL(`https://${analyticsCode}.goatcounter.com/api/v0/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  if (response.status === 401 || response.status === 403) throw new Error("auth");
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

function periodRange(days) {
  const end = new Date();
  end.setMinutes(0, 0, 0);
  end.setHours(end.getHours() + 1);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start: start.toISOString().replace(/\.\d{3}Z$/, "Z"), end: end.toISOString().replace(/\.\d{3}Z$/, "Z") };
}

// Inicio
if (document.body.dataset.adminPage === "inicio") {
  const set = (key, value) => { const element = document.querySelector(`[data-kpi="${key}"]`); if (element) element.textContent = value; };
  const published = vehicles.filter((vehicle) => vehicle.publicado !== false);
  set("published", published.length);
  const hidden = vehicles.length - published.length;
  document.querySelector('[data-kpi-note="published"]').textContent = hidden ? `${hidden} ocultos` : "todos visibles";
  set("featured", published.filter((vehicle) => vehicle.destacado).length);
  set("shipments", (shipments.envios || []).filter((item) => item.publicado !== false && Number(item.paso) < 7).length);
  set("products", (shop.productos || []).filter((item) => item.publicado !== false).length);

  const skipButton = document.querySelector("[data-skip-toggle]");
  const paintSkip = () => {
    const on = readStorage("skipgc") === "t";
    skipButton.textContent = on ? "Activado: no se cuentan" : "Desactivado";
    skipButton.setAttribute("aria-pressed", String(on));
    skipButton.classList.toggle("is-on", on);
  };
  skipButton.addEventListener("click", () => {
    writeStorage("skipgc", readStorage("skipgc") === "t" ? null : "t");
    paintSkip();
  });
  paintSkip();

  if (codeIsValid && readStorage(TOKEN_KEY)) {
    const note = document.querySelector('[data-kpi-note="visits"]');
    goatcounter("stats/total", periodRange(7))
      .then((data) => { set("visits", groupThousands(data.total)); note.textContent = "últimos 7 días"; })
      .catch(() => { note.textContent = "No se pudieron cargar"; });
  }
}

// Estadísticas
if (document.body.dataset.adminPage === "estadisticas") {
  const setup = document.querySelector("[data-stats-setup]");
  const body = document.querySelector("[data-stats-body]");
  const errorBox = document.querySelector("[data-stats-error]");
  const setupStatus = document.querySelector("[data-setup-status]");
  let period = 7;

  const showSetup = (message = "") => {
    setup.hidden = false;
    body.hidden = true;
    setupStatus.textContent = message || (codeIsValid ? `Código configurado: ${analyticsCode}. Falta la clave de la API.` : "Todavía no hay código de GoatCounter configurado en Ajustes de la web.");
  };

  const renderBars = (list, rows, emptyText = "Sin datos en este periodo.") => {
    const max = Math.max(1, ...rows.map((row) => row.count));
    list.innerHTML = rows.length
      ? rows.map((row) => `<li><span class="adm-bar-label">${escapeText(row.label)}</span><span class="adm-bar"><i data-width="${Math.round((row.count / max) * 100)}"></i></span><b>${groupThousands(row.count)}</b></li>`).join("")
      : `<li class="adm-empty">${emptyText}</li>`;
    list.querySelectorAll("i[data-width]").forEach((bar) => { bar.style.width = `${bar.dataset.width}%`; });
  };

  const renderChart = (days) => {
    const chart = document.querySelector("[data-stats-chart]");
    const max = Math.max(1, ...days.map((day) => day.daily));
    chart.innerHTML = days.map((day) => `<div class="adm-col" title="${escapeText(day.day)}: ${day.daily} visitas"><span data-height="${Math.round((day.daily / max) * 100)}"></span><small>${escapeText(day.day.slice(8, 10))}/${escapeText(day.day.slice(5, 7))}</small></div>`).join("");
    chart.querySelectorAll("span[data-height]").forEach((bar) => { bar.style.height = `${Math.max(2, Number(bar.dataset.height))}%`; });
  };

  const insightsFor = ({ total, pages, events, countries, sizes, refs }) => {
    const tips = [];
    const pageCount = (name) => pages.filter((row) => row.label === name).reduce((sum, row) => sum + row.count, 0);
    const carViews = pages.filter((row) => row.label.startsWith("Ficha: ")).reduce((sum, row) => sum + row.count, 0);
    const buyClicks = events.filter((row) => /Comprar o reservar/.test(row.label)).reduce((sum, row) => sum + row.count, 0);
    const forms = events.filter((row) => /Formulario enviado/.test(row.label)).reduce((sum, row) => sum + row.count, 0);
    const mobile = sizes.filter((row) => /móvil|tablet/i.test(row.label)).reduce((sum, row) => sum + row.count, 0);
    const sizeTotal = sizes.reduce((sum, row) => sum + row.count, 0);
    if (!total) return ["Todavía no hay visitas registradas en este periodo. Comparte la web en WhatsApp, Instagram o Facebook para empezar a ver datos."];
    if (pages[0]) tips.push(`La página más vista es «${pages[0].label}». Asegúrate de que esté siempre actualizada.`);
    const topCar = pages.find((row) => row.label.startsWith("Ficha: "));
    if (topCar) tips.push(`El coche que más interesa es ${topCar.label.slice(7)}. Destácalo en la portada o crea una oferta para él.`);
    if (carViews > 20 && buyClicks / carViews < 0.03) tips.push(`Muchas visitas a fichas (${carViews}) pero pocos clics en «Comprar o reservar» (${buyClicks}). Revisa precios, fotos y la información de envío.`);
    if (pageCount("Envíos") > 0 && forms === 0) tips.push("La gente consulta los envíos pero no envía formularios. Rellena los costes que faltan en Ajustes → Envíos para que la calculadora dé un total.");
    if (sizeTotal && mobile / sizeTotal > 0.6) tips.push(`El ${Math.round((mobile / sizeTotal) * 100)} % de las visitas son desde móvil: revisa siempre los cambios en el teléfono.`);
    if (countries[0]) tips.push(`La mayoría de visitas llega desde ${countries[0].label}. Adapta las ofertas y la moneda a ese país.`);
    if (refs[0]) tips.push(`El origen de tráfico principal es «${refs[0].label}». Sigue publicando allí.`);
    return tips;
  };

  const load = async () => {
    errorBox.hidden = true;
    if (!codeIsValid || !readStorage(TOKEN_KEY)) return showSetup();
    setup.hidden = true;
    body.hidden = false;
    body.classList.add("is-loading");
    const range = periodRange(period);
    try {
      const [total, hits, toprefs, locations, sizes, systems] = await Promise.all([
        goatcounter("stats/total", range),
        goatcounter("stats/hits", { ...range, limit: 100 }),
        goatcounter("stats/toprefs", { ...range, limit: 10 }),
        goatcounter("stats/locations", { ...range, limit: 10 }),
        goatcounter("stats/sizes", { ...range, limit: 10 }),
        goatcounter("stats/systems", { ...range, limit: 10 }),
      ]);
      const hitRows = (hits.hits || []).map((hit) => ({ label: friendlyPath(hit.path || "", hit.title), count: hit.count || 0, event: Boolean(hit.event) }));
      const merge = (rows) => Object.values(rows.reduce((acc, row) => {
        acc[row.label] = acc[row.label] || { label: row.label, count: 0 };
        acc[row.label].count += row.count;
        return acc;
      }, {})).sort((a, b) => b.count - a.count);
      const pages = merge(hitRows.filter((row) => !row.event)).slice(0, 12);
      const events = merge(hitRows.filter((row) => row.event)).slice(0, 12);
      const sizeNames = { Phones: "Móviles", "Large phones, small tablets": "Móviles grandes y tablets pequeñas", "Tablets and small laptops": "Tablets y portátiles pequeños", "Computer monitors": "Ordenadores", "Computer monitors larger than HD": "Pantallas grandes", "(unknown)": "Desconocido" };
      const toRows = (data, empty = "Desconocido") => (data.stats || []).map((row) => ({ label: sizeNames[row.name] || row.name || empty, count: row.count || 0 }));
      const refs = toRows(toprefs, "Directo (escribiendo la dirección o desde un enlace guardado)");
      const countries = toRows(locations);
      const sizeRows = toRows(sizes);
      document.querySelector('[data-stat="visits"]').textContent = groupThousands(total.total);
      document.querySelector('[data-stat-note="visits"]').textContent = period === 1 ? "hoy" : `últimos ${period} días`;
      document.querySelector('[data-stat="events"]').textContent = groupThousands(events.reduce((sum, row) => sum + row.count, 0));
      const topCar = pages.find((row) => row.label.startsWith("Ficha: "));
      document.querySelector('[data-stat="topcar"]').textContent = topCar ? topCar.label.slice(7) : "—";
      document.querySelector('[data-stat-note="topcar"]').textContent = topCar ? `${groupThousands(topCar.count)} visitas` : "sin datos";
      document.querySelector('[data-stat="topcountry"]').textContent = countries[0]?.label || "—";
      document.querySelector('[data-stat-note="topcountry"]').textContent = countries[0] ? `${groupThousands(countries[0].count)} visitas` : "sin datos";
      renderChart(total.stats || []);
      renderBars(document.querySelector('[data-list="pages"]'), pages);
      renderBars(document.querySelector('[data-list="events"]'), events, "Aún no hay clics registrados.");
      renderBars(document.querySelector('[data-list="toprefs"]'), refs);
      renderBars(document.querySelector('[data-list="locations"]'), countries);
      renderBars(document.querySelector('[data-list="sizes"]'), sizeRows);
      renderBars(document.querySelector('[data-list="systems"]'), toRows(systems));
      document.querySelector("[data-stats-insights]").innerHTML = insightsFor({ total: total.total, pages, events, countries, sizes: sizeRows, refs }).map((tip) => `<li>${escapeText(tip)}</li>`).join("");
    } catch (error) {
      if (error.message === "auth") {
        writeStorage(TOKEN_KEY, null);
        showSetup("La clave de la API no es válida o no tiene el permiso «Read statistics». Crea otra y pégala de nuevo.");
      } else {
        body.hidden = true;
        errorBox.hidden = false;
        errorBox.textContent = "No se han podido cargar las estadísticas. Comprueba la conexión y que el código de GoatCounter sea correcto.";
      }
    } finally {
      body.classList.remove("is-loading");
    }
  };

  document.querySelector("[data-token-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    writeStorage(TOKEN_KEY, event.target.elements.namedItem("token").value.trim());
    event.target.reset();
    load();
  });
  document.querySelector("[data-token-reset]").addEventListener("click", () => {
    writeStorage(TOKEN_KEY, null);
    showSetup();
  });
  document.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", () => {
    period = Number(button.dataset.period);
    document.querySelectorAll("[data-period]").forEach((other) => other.classList.toggle("is-active", other === button));
    load();
  }));
  load();
}
