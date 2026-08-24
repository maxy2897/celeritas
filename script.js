const root = document.documentElement;
const loader = document.querySelector(".page-loader");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
const hero = document.querySelector(".hero");
const hotspots = [...document.querySelectorAll(".hotspot")];
const modelTabs = [...document.querySelectorAll(".model-tab")];
const modelShowcase = document.querySelector(".model-showcase");
const modelImage = document.querySelector("#model-image");
const dialog = document.querySelector("#visit-dialog");
const visitForm = document.querySelector("#visit-form");
const successMessage = document.querySelector(".form-success");

const parts = {
  motor: {
    number: "01",
    kicker: "Potencia inteligente",
    title: "V8 Biturbo Celeritas",
    description: "Entrega inmediata, respuesta progresiva y una banda sonora afinada para convertir cada aceleración en una experiencia física.",
    labels: ["Potencia", "Par máximo"],
    values: ["620 CV", "760 Nm"],
    progress: "25%"
  },
  frenos: {
    number: "02",
    kicker: "Control absoluto",
    title: "Carbono-cerámicos",
    description: "Discos de 410 mm y pinzas de seis pistones mantienen una frenada estable, precisa y resistente incluso en conducción intensiva.",
    labels: ["Disco delantero", "Peso reducido"],
    values: ["410 mm", "−18 kg"],
    progress: "50%"
  },
  chasis: {
    number: "03",
    kicker: "Ligereza estructural",
    title: "Monocasco híbrido",
    description: "Aluminio aeronáutico y fibra de carbono se combinan para ofrecer máxima rigidez con un centro de gravedad excepcionalmente bajo.",
    labels: ["Rigidez torsional", "Distribución"],
    values: ["42 kNm/°", "49:51"],
    progress: "75%"
  },
  aero: {
    number: "04",
    kicker: "El aire como aliado",
    title: "Aerodinámica activa",
    description: "Aletas delanteras y difusor adaptativo ajustan el flujo en milisegundos para reducir resistencia o generar apoyo cuando lo necesitas.",
    labels: ["Carga a 250 km/h", "Coeficiente Cx"],
    values: ["186 kg", "0,27"],
    progress: "100%"
  }
};

const models = {
  gt: {
    name: "GT",
    description: "Gran turismo de altas prestaciones. Potencia refinada para viajes que no quieres terminar.",
    color: "Azul Medianoche",
    dot: "#18355f",
    filter: "none",
    power: "620 CV",
    acceleration: "3,1 s",
    range: "680 km"
  },
  r: {
    name: "R",
    description: "La expresión más radical de Celeritas. Menos peso, más apoyo y una puesta a punto nacida en circuito.",
    color: "Grafito Corsa",
    dot: "#34383c",
    filter: "grayscale(.72) contrast(1.12) brightness(.72)",
    power: "710 CV",
    acceleration: "2,8 s",
    range: "590 km"
  },
  e: {
    name: "E",
    description: "Silencio eléctrico, respuesta instantánea. Una nueva forma de rendimiento para la próxima generación.",
    color: "Cobre Aurora",
    dot: "#8e5d42",
    filter: "sepia(.7) saturate(.7) hue-rotate(330deg) brightness(.92)",
    power: "680 CV",
    acceleration: "2,9 s",
    range: "610 km"
  }
};

window.addEventListener("load", () => {
  window.setTimeout(() => loader.classList.add("is-hidden"), 350);
  animateCounters();
});

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    const y = window.scrollY;
    root.style.setProperty("--wheel-angle", `${y * 0.38}deg`);
    if (y < window.innerHeight * 1.1) {
      root.style.setProperty("--hero-shift", `${Math.min(y * 0.055, 52)}px`);
    }
    scrollTicking = false;
  });
}, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .14 });

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    const part = parts[hotspot.dataset.part];
    hotspots.forEach((item) => {
      const active = item === hotspot;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    document.querySelector("#part-number").textContent = part.number;
    document.querySelector("#part-kicker").textContent = part.kicker;
    document.querySelector("#part-title").textContent = part.title;
    document.querySelector("#part-description").textContent = part.description;
    document.querySelector("#stat-one-label").textContent = part.labels[0];
    document.querySelector("#stat-one-value").textContent = part.values[0];
    document.querySelector("#stat-two-label").textContent = part.labels[1];
    document.querySelector("#stat-two-value").textContent = part.values[1];
    document.querySelector("#part-progress").style.width = part.progress;
  });
});

modelTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selected = models[tab.dataset.model];
    modelTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    modelShowcase.classList.add("is-changing");
    window.setTimeout(() => {
      document.querySelector(".model-name").textContent = selected.name;
      document.querySelector("#model-description").textContent = selected.description;
      document.querySelector("#color-name").textContent = selected.color;
      document.querySelector("#color-dot").style.background = selected.dot;
      document.querySelector("#model-power").textContent = selected.power;
      document.querySelector("#model-acceleration").textContent = selected.acceleration;
      document.querySelector("#model-range").textContent = selected.range;
      modelImage.alt = `Celeritas ${selected.name}`;
      modelImage.style.filter = selected.filter;
      modelShowcase.classList.remove("is-changing");
    }, 260);
  });
});

document.querySelectorAll("[data-open-visit]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

visitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!visitForm.reportValidity()) return;
  visitForm.hidden = true;
  successMessage.hidden = false;
});

document.querySelector("#year").textContent = new Date().getFullYear();

function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((counter) => {
    const target = Number(counter.dataset.count);
    const decimal = String(target).includes(".");
    const duration = 1000;
    const start = performance.now();

    function update(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = decimal ? value.toFixed(1).replace(".", ",") : Math.round(value);
      if (progress < 1) window.requestAnimationFrame(update);
    }

    window.requestAnimationFrame(update);
  });
}

// Despiece técnico controlado por scroll y por botón.
const explodeSection = document.querySelector("#despiece");
const explodeToggle = document.querySelector("#explode-toggle");
let explodeTicking = false;
let manualExplosion = false;

function setExplosion(progress) {
  const safeProgress = Math.max(0, Math.min(progress, 1));
  explodeSection.style.setProperty("--explode", safeProgress.toFixed(3));
  explodeSection.classList.toggle("is-labeled", safeProgress > .43);
  explodeSection.classList.toggle("is-complete", safeProgress > .82);
}

function updateExplosionFromScroll() {
  if (manualExplosion) return;
  const rect = explodeSection.getBoundingClientRect();
  const scrollableDistance = Math.max(explodeSection.offsetHeight - window.innerHeight, 1);
  const progress = Math.max(0, Math.min(-rect.top / scrollableDistance, 1));
  setExplosion(progress);
}

window.addEventListener("scroll", () => {
  if (explodeTicking) return;
  explodeTicking = true;
  window.requestAnimationFrame(() => {
    updateExplosionFromScroll();
    explodeTicking = false;
  });
}, { passive: true });

explodeToggle.addEventListener("click", () => {
  const isOpen = explodeToggle.getAttribute("aria-pressed") === "true";
  manualExplosion = !isOpen;
  explodeToggle.setAttribute("aria-pressed", String(!isOpen));
  explodeToggle.querySelector("span").textContent = isOpen ? "Desmontar vehículo" : "Montar vehículo";

  if (isOpen) {
    setExplosion(0);
    window.setTimeout(() => {
      manualExplosion = false;
    }, 650);
  } else {
    setExplosion(1);
  }
});

window.addEventListener("resize", updateExplosionFromScroll, { passive: true });
updateExplosionFromScroll();

// La portada funciona como una secuencia de vídeo controlada por el scroll.
let heroSequenceTicking = false;

function updateHeroSequence() {
  const rect = hero.getBoundingClientRect();
  const distance = Math.max(hero.offsetHeight - window.innerHeight, 1);
  const rawProgress = Math.max(0, Math.min(-rect.top / distance, 1));
  const explodeProgress = Math.max(0, Math.min((rawProgress - .12) / .7, 1));
  const easedProgress = explodeProgress * explodeProgress * (3 - 2 * explodeProgress);

  hero.style.setProperty("--hero-explode", easedProgress.toFixed(4));
  hero.classList.toggle("is-technical", easedProgress > .46);
}

window.addEventListener("scroll", () => {
  if (heroSequenceTicking) return;
  heroSequenceTicking = true;
  window.requestAnimationFrame(() => {
    updateHeroSequence();
    heroSequenceTicking = false;
  });
}, { passive: true });

window.addEventListener("resize", updateHeroSequence, { passive: true });
window.addEventListener("load", () => {
  window.setTimeout(() => {
    hero.classList.add("sequence-ready");
    updateHeroSequence();
  }, 1350);
});

updateHeroSequence();

// Coreografía cinematográfica: cada componente entra en un momento distinto.
let cinematicTicking = false;

function phaseRange(value, start, end) {
  const progress = Math.max(0, Math.min((value - start) / (end - start), 1));
  return progress * progress * (3 - 2 * progress);
}

function updateCinematicSequence() {
  const rect = hero.getBoundingClientRect();
  const distance = Math.max(hero.offsetHeight - window.innerHeight, 1);
  const progress = Math.max(0, Math.min(-rect.top / distance, 1));
  const cameraIn = phaseRange(progress, .04, .36);
  const cameraOut = phaseRange(progress, .66, .94);

  const phases = {
    "--hero-progress": progress,
    "--phase-title": phaseRange(progress, .06, .23),
    "--phase-scan": phaseRange(progress, .13, .4),
    "--phase-mechanics": phaseRange(progress, .25, .64),
    "--phase-roof": phaseRange(progress, .28, .48),
    "--phase-front": phaseRange(progress, .34, .57),
    "--phase-rear": phaseRange(progress, .4, .64),
    "--phase-center": phaseRange(progress, .47, .71),
    "--phase-heading": phaseRange(progress, .6, .72),
    "--label-chassis": phaseRange(progress, .65, .74),
    "--label-engine": phaseRange(progress, .7, .79),
    "--label-gearbox": phaseRange(progress, .75, .84),
    "--label-brakes": phaseRange(progress, .8, .89),
    "--camera-push": cameraIn * (1 - cameraOut)
  };

  Object.entries(phases).forEach(([name, value]) => {
    hero.style.setProperty(name, value.toFixed(4));
  });

  hero.classList.toggle("is-technical", progress > .58);
}

window.addEventListener("scroll", () => {
  if (cinematicTicking) return;
  cinematicTicking = true;
  window.requestAnimationFrame(() => {
    updateCinematicSequence();
    cinematicTicking = false;
  });
}, { passive: true });

window.addEventListener("resize", updateCinematicSequence, { passive: true });
window.addEventListener("load", updateCinematicSequence);
updateCinematicSequence();

// Movimiento editorial de los coches cenitales.
const whySection = document.querySelector(".why-celeritas");
const trustSection = document.querySelector(".trust-section");
let editorialTicking = false;

function sectionViewportProgress(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const travel = rect.height + window.innerHeight;
  return Math.max(0, Math.min((window.innerHeight - rect.top) / travel, 1));
}

function updateEditorialMotion() {
  const whyProgress = sectionViewportProgress(whySection);
  const trustProgress = sectionViewportProgress(trustSection);
  const whyEase = whyProgress * whyProgress * (3 - 2 * whyProgress);
  const trustEase = trustProgress * trustProgress * (3 - 2 * trustProgress);

  whySection?.style.setProperty("--top-car-y", `${-95 + whyEase * 190}px`);
  whySection?.style.setProperty("--top-car-rotate", `${-3.5 + whyEase * 7}deg`);
  trustSection?.style.setProperty("--trust-car-x", `${110 - trustEase * 220}px`);
}

window.addEventListener("scroll", () => {
  if (editorialTicking) return;
  editorialTicking = true;
  window.requestAnimationFrame(() => {
    updateEditorialMotion();
    editorialTicking = false;
  });
}, { passive: true });

window.addEventListener("resize", updateEditorialMotion, { passive: true });
window.addEventListener("load", updateEditorialMotion);
updateEditorialMotion();

// Acordeón accesible de preguntas frecuentes.
document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    document.querySelectorAll(".faq-item button[aria-expanded='true']").forEach((openButton) => {
      if (openButton === button) return;
      openButton.setAttribute("aria-expanded", "false");
      openButton.closest(".faq-item").querySelector(".faq-answer").hidden = true;
    });

    button.setAttribute("aria-expanded", String(willOpen));
    answer.hidden = !willOpen;
  });
});

// Confirmación local para la solicitud desde el bloque de contacto.
const contactForm = document.querySelector("#contact-form");
const contactSuccess = document.querySelector(".contact-success");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  contactForm.hidden = true;
  contactSuccess.hidden = false;
});
