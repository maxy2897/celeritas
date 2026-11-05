// Vista previa sin inicio de sesión: empieza siempre con una copia fresca del contenido publicado
// y después carga el editor con el backend de prueba (los cambios se quedan en este navegador).
try {
  const root = await navigator.storage?.getDirectory?.();
  await root?.removeEntry("sveltia-cms-test", { recursive: true });
} catch { /* No había copia anterior o el navegador no permite borrarla. */ }
const editor = document.createElement("script");
editor.src = "../editor/sveltia-cms.js";
document.body.append(editor);

// Salta las pantallas de bienvenida del modo de prueba (en inglés) pulsando sus botones automáticamente.
const autoButtons = ["Start Demo", "Get Started"];
const clicked = new Set();
const observer = new MutationObserver(() => {
  document.querySelectorAll("button").forEach((button) => {
    const label = button.textContent.trim();
    if (autoButtons.includes(label) && !clicked.has(label)) {
      clicked.add(label);
      button.click();
    }
  });
  if (clicked.size === autoButtons.length) observer.disconnect();
});
observer.observe(document.body, { childList: true, subtree: true });
window.setTimeout(() => observer.disconnect(), 20000);
