# VIIM Grid — vista previa del feed de Instagram dentro de Notion

Convierte tu calendario de contenido de Notion en una grilla que se ve igual al feed de
Instagram. Cambias algo en Notion, presionas **Actualizar** y la grilla se actualiza.

Sin límite de clientes: un solo montaje sirve para Magdalena, Benditas Burgers, La Conquista,
Bravío, Asistir y NEA. Un enlace distinto para cada uno.

---

## Para vender la plantilla

Si vas a distribuirla, el comprador no repite todo esto. Sube el proyecto a GitHub como
repositorio **publico** y entregale el archivo `INSTALACION.md`: ahi hay un boton que le crea su
propia copia en su cuenta de Vercel, gratis, en cuatro clics. Antes de entregarlo, reemplaza
`TU-USUARIO` en el enlace del boton por tu usuario de GitHub.

Asi cada comprador hospeda lo suyo: tu no pagas servidor, no guardas llaves ajenas y si alguien
deja de usarlo no te afecta.

---

## Antes de empezar

Necesitas dos cuentas gratuitas: **github.com** y **vercel.com**. Crea la de GitHub primero,
porque Vercel te deja entrar con ella.

Todo el montaje es de una sola vez. Después solo trabajas en Notion.

---

## Paso 1 — Prepara tu base de datos en Notion

Tu calendario de contenido necesita estas columnas. Los nombres importan.

| Columna | Tipo en Notion | Para qué sirve |
|---|---|---|
| **Imagen** | Archivos y elementos multimedia | La foto o el video del post. Varios archivos = carrusel |
| **Fecha** | Fecha | Ordena el feed: lo más nuevo arriba a la izquierda |
| **Formato** | Selección | Post / Carrusel / Reel |
| **Estado** | Selección | Idea / Diseño / Aprobado / Publicado |
| **Caption** | Texto | El copy de la publicación |
| **Hashtags** | Texto | Se muestran en azul en la vista previa |
| **Orden** | Número | Necesaria para arrastrar y reordenar la grilla |
| **Música** | Texto | Opcional. El audio del reel |
| **Likes** | Número | Opcional. Solo decora la vista previa |
| **Cliente** | Selección | Opcional. Solo si metes varias marcas en una misma base |

Si prefieres una base por cliente, no necesitas la columna Cliente.

---

## Paso 2 — Crea la conexión de Notion

1. Entra a **notion.so/my-integrations**
2. Botón **New integration**
3. Nombre: `VIIM Grid`. Escoge tu espacio de trabajo. Tipo: **Internal**
4. Guarda y copia el **Internal Integration Secret**. Es una clave larga que empieza con `ntn_`
5. Guárdala en un lugar seguro. La vas a necesitar en el paso 4

Esta clave es la llave de tu Notion. No la compartas ni la pegues en ningún chat.

---

## Paso 3 — Sube el proyecto a GitHub

1. Entra a **github.com** y presiona **New repository**
2. Nombre: `viim-grid`. Márcalo como **Private**. Presiona **Create repository**
3. En la pantalla que sigue, haz clic en **uploading an existing file**
4. Descomprime `viim-grid.zip` y arrastra **todo lo que está adentro** a esa pantalla
5. Presiona **Commit changes**

No subas las carpetas `node_modules` ni `.next` si aparecen. No hacen falta.

---

## Paso 4 — Publícalo en Vercel

1. Entra a **vercel.com** y presiona **Continue with GitHub**
2. **Add New → Project** y busca `viim-grid`. Presiona **Import**
3. Antes de dar Deploy, abre **Environment Variables** y agrega una:
   - Name: `NOTION_TOKEN`
   - Value: la clave que copiaste en el paso 2
   - Presiona **Add**
4. Presiona **Deploy** y espera un minuto
5. Vercel te da una dirección tipo `viim-grid.vercel.app`. Esa es tu herramienta

---

## Paso 5 — Conecta cada base de datos

Notion no deja ver nada hasta que le des permiso, base por base.

1. Abre tu calendario de contenido en Notion
2. Arriba a la derecha, presiona **•••**
3. Busca **Conexiones** y elige **VIIM Grid**
4. Confirma

Repite esto con la base de cada cliente.

---

## Paso 6 — Genera el enlace y pégalo en Notion

1. Abre `viim-grid.vercel.app` en el navegador
2. Pega el enlace de la base de datos del cliente, escribe el usuario de Instagram y la bio
3. Copia el enlace que aparece abajo
4. En tu página de Notion, escribe `/embed`, pega el enlace y presiona **Insertar enlace**
5. Estira el bloque desde el borde inferior para darle altura

Repite el paso 6 para cada cliente. Cada uno queda en su propia página.

---

## Cómo se usa el día a día

- **Actualizar** — trae los cambios que hiciste en Notion
- **Reordenar** — actívalo y arrastra las publicaciones. El nuevo orden se guarda solo en la
  columna Orden de Notion
- **1:1 / 4:5** — cambia la forma de las miniaturas. Instagram hoy usa 4:5
- **Grid / Reels** — la pestaña Reels solo muestra videos y lo marcado como Reel
- **Toca una publicación** — se abre la vista previa completa con caption, hashtags, música y
  likes, tal como se verá publicada

Para mostrarle un feed a un cliente sin que vea los borradores, escribe `Aprobado` en el campo
"Mostrar solo un estado" al generar su enlace.

---

## Si algo falla

**"Notion no encuentra esa base de datos"**
Falta el paso 5. Abre la base, ••• → Conexiones → VIIM Grid.

**Las imágenes se ven un rato y después desaparecen**
Los archivos subidos a Notion caducan cada hora. Presiona Actualizar y vuelven. Es normal.

**"No se pudo guardar el orden"**
Falta la columna **Orden** de tipo Número en esa base.

**La grilla sale vacía**
Revisa que la columna de imágenes se llame exactamente **Imagen** y sea de tipo Archivos y
elementos multimedia.

**Quiero cambiar el usuario o la bio de un cliente**
Genera el enlace otra vez en la página de inicio y reemplaza el bloque en Notion.
