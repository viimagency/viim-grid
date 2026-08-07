export const dynamic = 'force-dynamic'
export const revalidate = 0

const NOTION_VERSION = '2022-06-28'

// Busca una propiedad por varios nombres posibles (sin importar mayusculas/acentos)
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function pick(props, names, types) {
  const wanted = names.map(norm)
  for (const key of Object.keys(props)) {
    if (wanted.includes(norm(key))) {
      if (!types || types.includes(props[key].type)) return props[key]
    }
  }
  // Segundo intento: cualquier propiedad del tipo pedido
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
    if (props[key].type === 'title') {
      return props[key].title.map((t) => t.plain_text).join('')
    }
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
      const isVideo = /\.(mp4|mov|webm|m4v)$/.test(clean)
      return { url, isVideo, name: f.name || '' }
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

export async function GET(request) {
  const token = process.env.NOTION_TOKEN
  if (!token) {
    return Response.json(
      { error: 'Falta la variable NOTION_TOKEN en el proyecto.' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const db = (searchParams.get('db') || '').replace(/-/g, '')
  if (!db) return Response.json({ error: 'Falta el id de la base de datos.' }, { status: 400 })

  const estado = searchParams.get('estado') || ''
  const cliente = searchParams.get('cliente') || ''

  try {
    const results = []
    let cursor
    do {
      const res = await fetch(`https://api.notion.com/v1/databases/${db}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
        cache: 'no-store',
      })
      if (!res.ok) {
        const detail = await res.text()
        return Response.json(
          {
            error:
              res.status === 404
                ? 'Notion no encuentra esa base de datos. Revisa que la hayas conectado a la integracion desde el menu ••• > Conexiones.'
                : `Notion respondio ${res.status}.`,
            detail,
          },
          { status: res.status }
        )
      }
      const json = await res.json()
      results.push(...json.results)
      cursor = json.has_more ? json.next_cursor : undefined
    } while (cursor)

    let posts = results.map((page) => {
      const props = page.properties || {}
      const media = filesOf(pick(props, ['Imagen', 'Media', 'Archivo', 'Archivos', 'Attachment', 'Adjunto', 'Foto'], ['files']))
      const linkProp = pick(props, ['Link', 'URL', 'Enlace', 'Canva'], ['url'])
      const externalLink = linkProp?.url || ''
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
        externalLink,
        tieneOrden: !!ordenProp,
        notionUrl: page.url,
      }
    })

    if (estado) posts = posts.filter((p) => norm(p.estado) === norm(estado))
    if (cliente) posts = posts.filter((p) => norm(p.cliente) === norm(cliente))

    const conOrden = posts.filter((p) => p.orden !== null)
    if (conOrden.length === posts.length && posts.length > 0) {
      posts.sort((a, b) => a.orden - b.orden)
    } else {
      posts.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    }

    return Response.json(
      { posts, actualizado: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    return Response.json({ error: 'No se pudo leer la base de datos.', detail: String(e) }, { status: 500 })
  }
}
