# Tu feed de Instagram dentro de Notion

Planea tu contenido en Notion y velo exactamente como se vera publicado.
Arrastras una imagen sobre la grilla y queda guardada en tu calendario.

La instalacion es de una sola vez y toma unos 10 minutos. Todo corre en tu
propia cuenta: nadie mas ve tu contenido.

---

## Antes de empezar

Vas a necesitar dos cuentas gratuitas: **GitHub** y **Vercel**. Crea la de
GitHub primero, porque Vercel te deja entrar con ella.

---

## Paso 1 — Saca tu llave de Notion

1. Entra a **notion.so/my-integrations**
2. **New integration** → nombre: `Mi feed` → escoge tu espacio de trabajo → tipo **Internal** → Submit
3. Copia el **Internal Integration Secret**. Empieza con `ntn_`

Guardala en un lugar seguro. Es privada: da acceso a lo que le compartas de tu
Notion, y a nada mas.

---

## Paso 2 — Presiona el boton

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU-USUARIO/viim-grid&env=NOTION_TOKEN&envDescription=Tu%20llave%20de%20Notion%20del%20paso%201&project-name=mi-feed&repository-name=mi-feed)

Te va a pedir tres cosas:

- Entrar con **GitHub**
- Un nombre para tu proyecto
- **NOTION_TOKEN** → pega aqui la llave del paso 1

Presiona **Deploy** y espera un minuto.

**Al terminar, guarda tu direccion en favoritos.** Es la que aparece en
*Domains*, del estilo `mi-feed.vercel.app`. Vercel tambien muestra direcciones
largas con codigos en el medio (`mi-feed-a8f3k2x9.vercel.app`): esas quedan
congeladas en una version vieja. Usa siempre la corta.

---

## Paso 3 — Dale acceso a tu calendario

Notion no muestra nada hasta que tu lo autorices, base por base.

1. Abre tu calendario de contenido en Notion
2. Si esta dentro de otra pagina, presiona el icono de expandir (⤢) para abrirlo completo
3. Arriba a la derecha: **•••** → **Conexiones** → elige `Mi feed` → Confirmar

**Si tu calendario es una vista vinculada** (una vista de otra base que vive en
otro lado), tienes que dar el permiso sobre la base original, no sobre la vista.
Presiona el nombre de la base en el bloque para saltar a ella.

---

## Paso 4 — Pega el feed en tu pagina

1. Abre `mi-feed.vercel.app`
2. Pega el enlace de tu calendario, escribe tu usuario de Instagram
3. Copia el enlace que aparece abajo
4. En Notion escribe `/embed`, pega el enlace y elige **Insercion**
5. Estira el bloque desde el borde inferior para darle altura

Para una segunda cuenta, repite solo el paso 4. No hay limite.

---

## Como se usa

**Arrastra una imagen** desde tu computador sobre cualquier casilla del feed y
queda guardada en esa publicacion. Para reemplazarla, sueltas otra encima.
Maximo 20 MB por imagen.

**Actualizar** trae los cambios que hiciste en Notion.

**Reordenar** te deja mover las publicaciones arrastrandolas. El nuevo orden se
guarda solo. Apagalo cuando vayas a subir imagenes.

**4:5 / 1:1** cambia la forma de las miniaturas. Instagram hoy usa 4:5.

**Toca una publicacion** y se abre la vista previa completa, con caption,
hashtags, musica y fecha.

**El logo** sale del icono de tu calendario en Notion. Cambia el icono y cambia
el logo. La bio sale de la descripcion de la base.

**Para mostrarle el feed a un cliente sin que vea borradores**, escribe
`Aprobado` en el campo "Mostrar solo un estado" al generar el enlace.

---

## Que columnas necesita tu calendario

| Columna | Tipo | Para que |
|---|---|---|
| **Imagen** | Archivos y elementos multimedia | La pieza. Varios archivos = carrusel |
| **Fecha** | Fecha | Ordena el feed: lo mas nuevo arriba |
| **Formato** | Seleccion | Post / Carrusel / Reel |
| **Estado** | Seleccion | Idea / Diseño / Aprobado / Publicado |
| **Caption** | Texto | El copy |
| **Hashtags** | Texto | Se muestran en azul |
| **Orden** | Numero | Necesaria para reordenar arrastrando |
| **Musica**, **Likes** | Texto, Numero | Opcionales, decoran la vista previa |

Si tu columna de imagenes se llama `portada`, `foto` o `media`, tambien la
reconoce. La plantilla ya viene con todo esto listo.

---

## Si algo no funciona

**"Notion no encuentra esa base"** — falta el paso 3. Si ya lo hiciste, revisa
que lo hayas hecho sobre la base original y no sobre una vista vinculada.

**Sale un error viejo aunque hayas arreglado algo** — estas usando una direccion
congelada. Vuelve a `mi-feed.vercel.app` (la corta) y genera el enlace de nuevo.

**La grilla sale vacia con los titulos en gris** — tus publicaciones no tienen
imagenes cargadas. Arrastra una imagen sobre una casilla para probar.

**Las imagenes se ven y despues desaparecen** — los archivos de Notion caducan
cada hora. Presiona Actualizar y vuelven. Es normal.

**"No se pudo guardar el orden"** — falta la columna **Orden** de tipo Numero.

**El logo no aparece** — ponle un icono a tu calendario en Notion: presiona
sobre el titulo, boton del icono, Subir una imagen.
