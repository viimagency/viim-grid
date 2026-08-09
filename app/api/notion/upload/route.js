export const dynamic = 'force-dynamic'
export const maxDuration = 60

const V_NUEVA = '2025-09-03'
const V_VIEJA = '2022-06-28'

const cabeceras = (token, version, extra = {}) => ({
  Authorization: `Bearer ${token}`,
  'Notion-Version': version,
  ...extra,
})

async function mensajeDe(res) {
  try {
    const j = await res.json()
    return j.message || j.code || `Notion respondio ${res.status}.`
  } catch {
    return `Notion respondio ${res.status}.`
  }
}

// Busca como se llama la columna de archivos en esta publicacion.
async function nombreDeColumna(pageId, token) {
  for (const v of [V_NUEVA, V_VIEJA]) {
    const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: cabeceras(token, v),
      cache: 'no-store',
    })
    if (!res.ok) continue
    const page = await res.json()
    const props = page.properties || {}
    const preferidas = ['portada', 'imagen', 'imagenes', 'media', 'archivo', 'archivos', 'foto', 'pieza']
    const norm = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

    for (const p of preferidas) {
      for (const key of Object.keys(props)) {
        if (norm(key) === p && props[key].type === 'files') {
          return { nombre: key, version: v, actuales: props[key].files || [] }
        }
      }
    }
    for (const key of Object.keys(props)) {
      if (props[key].type === 'files') {
        return { nombre: key, version: v, actuales: props[key].files || [] }
      }
    }
    return { error: 'Esta base no tiene una columna de archivos donde guardar la imagen.' }
  }
  return { error: 'No se pudo leer la publicacion en Notion.' }
}

export async function POST(request) {
  const token = process.env.NOTION_TOKEN
  if (!token) return Response.json({ error: 'Falta NOTION_TOKEN.' }, { status: 500 })

  let archivo
  let pageId
  let reemplazar = true
  try {
    const form = await request.formData()
    archivo = form.get('archivo')
    pageId = form.get('pageId')
    reemplazar = form.get('reemplazar') !== 'no'
  } catch {
    return Response.json({ error: 'No se recibio el archivo.' }, { status: 400 })
  }

  if (!archivo || typeof archivo === 'string' || !pageId) {
    return Response.json({ error: 'Falta el archivo o la publicacion.' }, { status: 400 })
  }
  if (archivo.size > 20 * 1024 * 1024) {
    return Response.json({ error: 'La imagen pesa mas de 20 MB. Reducela e intenta de nuevo.' }, { status: 400 })
  }

  const columna = await nombreDeColumna(pageId, token)
  if (columna.error) return Response.json({ error: columna.error }, { status: 400 })

  try {
    // 1. Le pedimos a Notion un espacio para subir el archivo.
    const crear = await fetch('https://api.notion.com/v1/file_uploads', {
      method: 'POST',
      headers: cabeceras(token, V_VIEJA, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        filename: archivo.name || 'imagen.jpg',
        content_type: archivo.type || 'image/jpeg',
      }),
    })
    if (!crear.ok) return Response.json({ error: await mensajeDe(crear) }, { status: 400 })
    const subida = await crear.json()

    // 2. Enviamos el contenido del archivo.
    const cuerpo = new FormData()
    cuerpo.append('file', archivo, archivo.name || 'imagen.jpg')
    const enviar = await fetch(subida.upload_url, {
      method: 'POST',
      headers: cabeceras(token, V_VIEJA),
      body: cuerpo,
    })
    if (!enviar.ok) return Response.json({ error: await mensajeDe(enviar) }, { status: 400 })

    // 3. Lo guardamos en la columna de la publicacion.
    const anteriores = reemplazar
      ? []
      : (columna.actuales || []).filter((f) => f.type === 'external' || f.type === 'file_upload')

    const nuevos = [
      ...anteriores,
      { type: 'file_upload', file_upload: { id: subida.id }, name: archivo.name || 'imagen.jpg' },
    ]

    const guardar = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: cabeceras(token, columna.version, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ properties: { [columna.nombre]: { files: nuevos } } }),
    })
    if (!guardar.ok) return Response.json({ error: await mensajeDe(guardar) }, { status: 400 })

    return Response.json({ ok: true, columna: columna.nombre })
  } catch (e) {
    return Response.json({ error: `No se pudo subir la imagen. ${String(e)}` }, { status: 500 })
  }
}
