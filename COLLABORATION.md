# Celeritas — coordinación entre asistentes

## Proyecto

Celeritas es una web española de compraventa de coches de segunda mano. El código principal está en esta misma carpeta y se publica mediante GitHub Pages.

## Forma de trabajo

- Solo un asistente debe modificar los archivos en cada momento.
- Antes de editar, revisar `git status` y los cambios recientes.
- Claude y Codex pueden modificar cualquier archivo, página, contenido, estilo, comportamiento o funcionalidad cuando el usuario lo solicite expresamente.
- Las peticiones actuales del usuario tienen prioridad sobre restricciones o decisiones de diseño anteriores.
- Conservar el trabajo no relacionado con la petición y evitar sobrescribir cambios ajenos accidentalmente.
- Validar cualquier cambio funcional o visual con `npm run build`.
- Al modificar `styles.css` o `script.js`, subir el número `?v=` en todos los HTML para que los navegadores no usen la versión en caché.
- Claude puede analizar, editar y publicar el proyecto cuando el usuario se lo pida.
- La publicación oficial debe realizarse en `https://github.com/maxy2897/celeritas` mediante GitHub Pages. No utilizar el antiguo alojamiento de ChatGPT/OpenAI Sites.
- Al terminar una intervención, indicar qué archivos se modificaron y qué validación se ejecutó.

## Seguridad

- Todas las páginas llevan una Content-Security-Policy en una etiqueta `<meta>`: solo se cargan scripts, estilos, fuentes e imágenes del propio sitio. No añadir código en línea (`<script>…</script>`, atributos `style="…"` u `onclick="…"`). Si se incorpora un servicio externo (envío de formularios, analítica, mapas), ampliar la CSP de los 12 HTML solo con el dominio imprescindible.
- No insertar con `innerHTML` datos que vengan de la URL, de formularios o de `localStorage`; usar `textContent` o `value`. Validar los identificadores de coche con `isVehicleId()`.
- Los enlaces externos con `target="_blank"` deben llevar `rel="noopener noreferrer"`.
- No subir claves, tokens ni contraseñas: el repositorio y la web son públicos.
- Los formularios todavía no envían datos a ningún servidor. Al conectarlos, usar HTTPS, enlazar la política de privacidad y ampliar la CSP (`connect-src` o `form-action`).

## Estado importante

La web pública oficial es `https://maxy2897.github.io/celeritas/`.
