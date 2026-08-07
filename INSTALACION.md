# Instala tu vista de feed — 4 pasos

Tu grilla corre en tu propia cuenta, gratis. Nadie más ve tu contenido ni tu llave.

---

## 1. Saca tu llave de Notion

1. Entra a **notion.so/my-integrations**
2. **New integration** → nombre: `Mi feed` → tipo **Internal** → Submit
3. Copia el **Internal Integration Secret**. Empieza con `ntn_`

Guárdala. Es privada: da acceso a lo que tú le compartas de tu Notion.

---

## 2. Presiona el botón

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU-USUARIO/viim-grid&env=NOTION_TOKEN&envDescription=Tu%20llave%20de%20Notion%20del%20paso%201&project-name=mi-feed&repository-name=mi-feed)

Te va a pedir:
- Entrar con **GitHub** (crea la cuenta ahí mismo si no tienes)
- Un nombre para tu proyecto
- **NOTION_TOKEN** → pega la llave del paso 1

Presiona **Deploy** y espera un minuto. Te queda una dirección tipo `mi-feed.vercel.app`.

---

## 3. Dale permiso a tu calendario

Notion no muestra nada hasta que le des acceso, base por base.

1. Abre tu calendario de contenido en Notion
2. Arriba a la derecha, **•••** → **Conexiones** → elige `Mi feed`
3. Confirma

---

## 4. Pega el feed en tu página

1. Abre `mi-feed.vercel.app`
2. Pega el enlace de tu calendario, escribe tu usuario de Instagram y tu bio
3. Copia el enlace que aparece
4. En Notion escribe `/embed`, pega el enlace, **Insertar**
5. Estira el bloque desde abajo para darle altura

Para una segunda cuenta de Instagram, repite solo el paso 4. No hay límite.

---

## Columnas que necesita tu calendario

| Columna | Tipo |
|---|---|
| **Imagen** | Archivos y elementos multimedia |
| **Fecha** | Fecha |
| **Formato** | Selección: Post / Carrusel / Reel |
| **Estado** | Selección: Idea / Diseño / Aprobado / Publicado |
| **Caption** | Texto |
| **Hashtags** | Texto |
| **Orden** | Número — necesaria para arrastrar y reordenar |
| **Música**, **Likes** | Opcionales, solo decoran la vista previa |

---

## Si algo no funciona

**"Notion no encuentra esa base de datos"** — falta el paso 3.

**Las imágenes desaparecen después de un rato** — los archivos subidos a Notion caducan cada hora. Presiona **Actualizar** y vuelven. Es normal.

**"No se pudo guardar el orden"** — falta la columna **Orden** de tipo Número.

**La grilla sale vacía** — revisa que tu columna de imágenes se llame exactamente **Imagen**.
