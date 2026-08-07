export const dynamic = 'force-dynamic'

const NOTION_VERSION = '2022-06-28'

// Recibe [{id, orden}] y escribe la propiedad Orden en cada pagina de Notion.
export async function POST(request) {
  const token = process.env.NOTION_TOKEN
  if (!token) return Response.json({ error: 'Falta NOTION_TOKEN.' }, { status: 500 })

  let items
  try {
    const body = await request.json()
    items = body.items
  } catch {
    return Response.json({ error: 'Cuerpo invalido.' }, { status: 400 })
  }
  if (!Array.isArray(items)) return Response.json({ error: 'Cuerpo invalido.' }, { status: 400 })

  const propName = 'Orden'
  const errores = []

  for (const item of items) {
    const res = await fetch(`https://api.notion.com/v1/pages/${item.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: { [propName]: { number: item.orden } } }),
    })
    if (!res.ok) errores.push(await res.text())
  }

  if (errores.length) {
    return Response.json(
      {
        error:
          'No se pudo guardar el orden. Revisa que tu base tenga una propiedad de tipo Numero llamada "Orden".',
        detail: errores[0],
      },
      { status: 400 }
    )
  }
  return Response.json({ ok: true })
}
