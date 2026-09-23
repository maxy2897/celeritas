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
- Claude puede analizar, editar y publicar el proyecto cuando el usuario se lo pida.
- La publicación oficial debe realizarse en `https://github.com/maxy2897/celeritas` mediante GitHub Pages. No utilizar el antiguo alojamiento de ChatGPT/OpenAI Sites.
- Al terminar una intervención, indicar qué archivos se modificaron y qué validación se ejecutó.

## Estado importante

La web pública oficial es `https://maxy2897.github.io/celeritas/`.
