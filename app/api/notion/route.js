export const dynamic = 'force-dynamic'
export const revalidate = 0

const V_NUEVA = '2025-09-03'
const V_VIEJA = '2022-06-28'

const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function pick(props, names, types) {
  const wanted = names.map(norm)
  for (const key of Object.keys(props)) {
    if (wanted.includes(norm(key))) {
      if (!types || types.includes(props[key].type)) return props[key]
    }
  }
  if (types) {
    for (const key of Object.keys(props)) {
      if (types.includes(props[key].type)) return props[key]
    }
  }
  return null
}

const plain = (p) =>
  p && Array.isArray(p.rich_text) ? p.rich_text.map((t) => t.plain_text).join('') : ''

const titleOf = (props) => {
  for (const key of Object.keys(props)) {
    if (props[key].type === 'title') return props[key].title.map((t) => t.plain_text).join('')
  }
  return ''
}

function filesOf(p) {
  if (!p || p.type !== 'files') return []
  return p.files
    .map((f) => {
      const url = f.type === 'external' ? f.external.url : f.file?.url
      if (!url) return null
      const clean = url.split('?')[0].toLowerCase()
      return { url, isVideo: /\.(mp4|mov|webm|m4v)$/.test(clean), name: f.name || '' }
    })
    .filter(Boolean)
}

const selectOf = (p) => {
  if (!p) return ''
  if (p.type === 'select') return p.select?.name || ''
  if (p.type === 'status') return p.status?.name || ''
  if (p.type === 'multi_select') return (p.multi_select || []).map((s) => s.name).join(', ')
  return ''
}

// Del icono de Notion sacamos el logo del perfil: puede ser imagen o emoji.
function perfilDe(obj) {
  if (!obj) return null
  const icon = obj.icon
  let logo = null
  let emoji = null
  if (icon?.type === 'emoji') emoji = icon.emoji
  else if (icon?.type === 'external') logo = icon.external?.url || null
  else if (icon?.type === 'file') logo = icon.file?.url || null

  const desc = Array.isArray(obj.description)
    ? obj.description.map((t) => t.plain_text).join('')
    : ''
  const titulo = Array.isArray(obj.title) ? obj.title.map((t) => t.plain_text).join('') : ''

  return { logo, emoji, descripcion: desc, titulo }
}

const cabeceras = (token, version) => ({
  Authorization: `Bearer ${token}`,
  'Notion-Version': version,
  'Content-Type': 'application/json',
})

async function mensajeDe(res) {
  try {
    const j = await res.json()
    return j.message || j.code || `Notion respondio ${res.status}.`
  } catch {
    return `Notion respondio ${res.status}.`
  }
}

async function traerTodo(url, token, version) {
  const filas = []
  let cursor
  do {
    const res = await fetch(url, {
      method: 'POST',
      headers: cabeceras(token, version),
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
      cache: 'no-store',
    })
    if (!res.ok) return { error: await mensajeDe(res), estado: res.status }
    const json = await res.json()
    filas.push(...json.results)
    cursor = json.has_more ? json.next_cursor : undefined
  } while (cursor)
  return { filas }
}

// Notion tiene dos formas de consultar una base segun su antiguedad,
// y ademas la gente suele pegar el enlace de la pagina en vez del de la base.
// Esta funcion resuelve los tres casos.
async function consultar(id, token, profundidad = 0) {
  const meta = await fetch(`https://api.notion.com/v1/databases/${id}`, {
    headers: cabeceras(token, V_NUEVA),
    cache: 'no-store',
  })

  let perfil = null

  if (meta.ok) {
    const info = await meta.json()
    perfil = perfilDe(info)
    const fuentes = info.data_sources || []
    if (fuentes.length) {
      const todas = []
      for (const f of fuentes) {
        const r = await traerTodo(
          `https://api.notion.com/v1/data_sources/${f.id}/query`,
          token,
          V_NUEVA
        )
        if (r.error) return r
        todas.push(...r.filas)
      }
      return { filas: todas, perfil }
    }
  }

  const clasica = await traerTodo(
    `https://api.notion.com/v1/databases/${id}/query`,
    token,
    V_VIEJA
  )
  if (!clasica.error) return { ...clasica, perfil }

  // El id es de una pagina: buscamos las bases de datos que tiene adentro.
  if (profundidad < 2) {
    const hijos = await buscarBasesAdentro(id, token)
    if (hijos.length) {
      const todas = []
      let perfilHijo = null
      for (const hijo of hijos) {
        const r = await consultar(hijo, token, profundidad + 1)
        if (!r.error) {
          todas.push(...r.filas)
          if (!perfilHijo && (r.perfil?.logo || r.perfil?.emoji)) perfilHijo = r.perfil
        }
      }
      // Si la base no tiene icono, usamos el de la pagina que la contiene.
      if (!perfilHijo?.logo && !perfilHijo?.emoji) {
        const pag = await fetch(`https://api.notion.com/v1/pages/${id}`, {
          headers: cabeceras(token, V_VIEJA),
          cache: 'no-store',
        })
        if (pag.ok) {
          const p = perfilDe(await pag.json())
          if (p?.logo || p?.emoji) perfilHijo = p
        }
      }
      if (todas.length || hijos.length) return { filas: todas, perfil: perfilHijo }
    }
  }

  if (!meta.ok) {
    const msg = await mensajeDe(meta)
    return {
      error:
        meta.status === 404
          ? 'Notion no encuentra nada en ese enlace. Revisa que le hayas dado acceso a la integracion desde ••• > Conexiones.'
          : msg,
      estado: meta.status,
    }
  }
  return clasica
}

// Recorre los bloques de una pagina y devuelve los ids de las bases que contiene.
async function buscarBasesAdentro(id, token) {
  const encontradas = []
  let cursor
  try {
    do {
      const url = new URL(`https://api.notion.com/v1/blocks/${id}/children`)
      url.searchParams.set('page_size', '100')
      if (cursor) url.searchParams.set('start_cursor', cursor)
      const res = await fetch(url, { headers: cabeceras(token, V_VIEJA), cache: 'no-store' })
      if (!res.ok) return encontradas
      const json = await res.json()
      for (const b of json.results) {
        if (b.type === 'child_database') encontradas.push(b.id)
      }
      cursor = json.has_more ? json.next_cursor : undefined
    } while (cursor)
  } catch {
    return encontradas
  }
  return encontradas
}

export async function GET(request) {
  const token = process.env.NOTION_TOKEN
  if (!token) {
    return Response.json({ error: 'Falta la variable NOTION_TOKEN en el proyecto.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const db = (searchParams.get('db') || '').replace(/-/g, '')
  if (!db) return Response.json({ error: 'Falta el id de la base de datos.' }, { status: 400 })

  const estado = searchParams.get('estado') || ''
  const cliente = searchParams.get('cliente') || ''

  try {
    const r = await consultar(db, token)
    if (r.error) return Response.json({ error: r.error }, { status: r.estado || 400 })

    let posts = r.filas.map((page) => {
      const props = page.properties || {}
      const media = filesOf(
        pick(
          props,
          ['Imagen', 'Imagenes', 'Media', 'Archivo', 'Archivos', 'Attachment', 'Adjunto', 'Foto', 'Pieza'],
          ['files']
        )
      )
      const linkProp = pick(props, ['Link', 'URL', 'Enlace', 'Canva'], ['url'])
      const fechaProp = pick(props, ['Fecha', 'Publicacion', 'Date', 'Fecha de publicacion'], ['date'])
      const ordenProp = pick(props, ['Orden', 'Order', 'Posicion'], ['number'])
      const likesProp = pick(props, ['Likes', 'Me gusta'], ['number'])

      return {
        id: page.id,
        titulo: titleOf(props),
        caption: plain(pick(props, ['Caption', 'Copy', 'Texto', 'Descripcion', 'Contenido'], ['rich_text'])),
        hashtags: plain(pick(props, ['Hashtags', 'Etiquetas'], ['rich_text'])),
        musica: plain(pick(props, ['Musica', 'Audio', 'Music', 'Cancion'], ['rich_text'])),
        formato: selectOf(pick(props, ['Formato', 'Tipo', 'Type'], ['select', 'multi_select'])),
        estado: selectOf(pick(props, ['Estado', 'Status'], ['status', 'select'])),
        cliente: selectOf(pick(props, ['Cliente', 'Marca', 'Cuenta'], ['select', 'multi_select'])),
        fecha: fechaProp?.date?.start || '',
        orden: ordenProp?.number ?? null,
        likes: likesProp?.number ?? null,
        media,
        externalLink: linkProp?.url || '',
        notionUrl: page.url,
      }
    })

    const total = posts.length
    if (estado) posts = posts.filter((p) => norm(p.estado) === norm(estado))
    if (cliente) posts = posts.filter((p) => norm(p.cliente) === norm(cliente))

    const conOrden = posts.filter((p) => p.orden !== null)
    if (conOrden.length === posts.length && posts.length > 0) posts.sort((a, b) => a.orden - b.orden)
    else posts.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))

    const conImagen = posts.filter((p) => p.media.length || p.externalLink).length

    return Response.json(
      { posts, total, conImagen, perfil: r.perfil || null, actualizado: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    return Response.json({ error: `No se pudo leer la base de datos. ${String(e)}` }, { status: 500 })
  }
}
