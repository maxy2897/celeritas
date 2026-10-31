# Panel de administración de Celeritas

Dirección: **https://maxy2897.github.io/celeritas/admin/**

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
