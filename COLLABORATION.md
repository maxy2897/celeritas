# Celeritas — coordinación entre asistentes

## Proyecto

Celeritas es una web española de compraventa de coches de segunda mano. El código principal está en esta misma carpeta y se publica mediante OpenAI Sites.

## Forma de trabajo

- Solo un asistente debe modificar los archivos en cada momento.
- Antes de editar, revisar `git status` y los cambios recientes.
- Conservar el logotipo, la paleta azul marino y verde, el diseño a pantalla completa y la adaptación móvil existente.
- No eliminar páginas, vehículos, formularios, filtros ni enlaces existentes salvo petición expresa del usuario.
- No añadir animaciones; se conserva únicamente el efecto de la rueda.
- Validar cualquier cambio funcional o visual con `npm run build`.
- Claude puede analizar, proponer y editar el proyecto, pero no debe publicar la web.
- Codex revisará los cambios finales y realizará la publicación en OpenAI Sites con autorización del usuario.
- Al terminar una intervención, indicar qué archivos se modificaron y qué validación se ejecutó.

## Estado importante

La web pública es `https://celeritas.benjaminmajadaljamin.chatgpt.site/`.
El cambio más reciente preparado localmente convierte los filtros móviles de la página Comprar en un panel plegable; todavía requiere publicación.
