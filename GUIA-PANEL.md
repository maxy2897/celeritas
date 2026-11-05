# Panel de administración de Celeritas

Dirección: **https://maxy2897.github.io/celeritas/admin/**

La sección de administración tiene tres partes:

- **Inicio** (`/admin/`): resumen (coches publicados, en portada, envíos en curso, productos, visitas) y accesos directos.
- **Contenido** (`/admin/editor/`): el editor donde se suben coches, precios, fotos, envíos, productos y ajustes.
- **Estadísticas** (`/admin/estadisticas.html`): visitas, coches más vistos, países, dispositivos, de dónde llega la gente, qué botones pulsan e ideas para mejorar.

Desde el panel puedes añadir, editar, ocultar y destacar coches, subir sus fotos y cambiar los datos de contacto. Al pulsar **Guardar**, el cambio queda guardado en GitHub y la web se actualiza sola en 1–2 minutos.

## Entrar por primera vez

El panel entra con una *llave de acceso* (token) de GitHub. Se crea una sola vez:

1. Entra en GitHub con una cuenta que tenga permiso de escritura en el repositorio `maxy2897/celeritas`.
2. Ve a **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
3. En *Repository access* elige **Only select repositories** y marca `maxy2897/celeritas`.
4. En *Permissions → Repository permissions*, pon **Contents: Read and write**.
5. Pon una caducidad (por ejemplo, 1 año), pulsa **Generate token** y copia la llave.
6. Abre el panel, pulsa **Sign In Using Access Token** (Entrar con token) y pega la llave.

Guarda la llave como una contraseña: quien la tenga puede cambiar la web. Si se pierde o se filtra, bórrala en GitHub y crea otra.

## Publicar un coche

1. **Coches → Catálogo de coches → Añadir coche**.
2. Rellena nombre, identificador (minúsculas y guiones, p. ej. `ford-transit-2019`), marca, tipo, combustible, año, km, precio…
3. Sube las fotos: la primera es la principal; las tres primeras se usan como vista frontal, lateral y trasera.
4. Marca **Publicado en la web** (y **Mostrar en la portada** si quieres destacarlo).
5. Pulsa **Guardar**.

- **Ocultar un coche vendido:** desmarca *Publicado en la web* y guarda (no se borra).
- **Poner una oferta:** rellena *Precio anterior* y *Oferta válida hasta*. Al pasar la fecha, la oferta desaparece sola.
- **Datos de contacto:** *Ajustes de la web → Datos de contacto* (tarjeta de la rueda y pie de página).

## Más cosas que se gestionan desde el panel

- **Ficha completa de cada coche:** origen (stock propio, comprado a particular, en intermediación), disponibilidad, datos técnicos (referencia, matriculación, cilindrada, ITV, color…), **imperfecciones con foto** (salen en la pestaña *Imperfecciones* de la galería) y *datos según bastidor*. Puedes subir todas las fotos que quieras.
- **Ajustes de la web → Envíos:** destinos, opciones de entrega, moneda de cada destino (la calculadora se muestra en esa moneda; Guinea Ecuatorial en FCFA) y costes de transporte, impuestos, gestión, entrega a domicilio y seguro. Deja vacío lo que todavía no sepas y saldrá como «A consultar».
- **Seguimiento de envíos:** crea un envío con una referencia difícil de adivinar (p. ej. `CEL-7Q4K-2931`), dásela al cliente y actualiza el paso (1 Reservado … 7 Entregado), las fechas y las novedades. El cliente lo consulta en *Mi envío*. No pongas nombres ni datos personales. Borra el envío de ejemplo `DEMO-0001` cuando empieces.
- **Tienda → Productos:** nombre, categoría, marca, compatibilidad (marca/modelo de coche o «Universal»), precio, foto y si sale en *Más vendidos*.

## Activar las estadísticas (una sola vez)

1. Crea una cuenta gratuita en https://www.goatcounter.com/signup y elige un código (por ejemplo `celeritas`; tu panel quedará en `https://celeritas.goatcounter.com`).
2. En **Contenido → Ajustes de la web → Estadísticas** escribe ese código y guarda. Desde ese momento la web cuenta las visitas (sin cookies, no hace falta aviso de cookies).
3. En GoatCounter: **Settings → API → New API key**, marca solo **Read statistics** y copia la clave.
4. Abre **Administración → Estadísticas**, pega la clave y guárdala. Se queda guardada solo en ese navegador.
5. En **Administración → Inicio**, activa **No contar mis propias visitas** en cada navegador que uses para revisar la web.
