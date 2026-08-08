'use client'

import { useMemo, useState } from 'react'

function sacarId(texto) {
  if (!texto) return ''
  const sinQuery = texto.split('?')[0]
  const encontrados = sinQuery.match(/[0-9a-fA-F]{32}/g)
  if (encontrados?.length) return encontrados[encontrados.length - 1]
  const conGuiones = sinQuery.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  )
  return conGuiones ? conGuiones[0].replace(/-/g, '') : ''
}

export default function Inicio() {
  const [url, setUrl] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [estado, setEstado] = useState('')
  const [oscuro, setOscuro] = useState(true)
  const [copiado, setCopiado] = useState(false)

  const db = useMemo(() => sacarId(url), [url])

  const enlace = useMemo(() => {
    if (!db) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const params = new URLSearchParams({ db })
    if (handle) params.set('handle', handle.replace('@', ''))
    if (bio) params.set('bio', bio)
    if (avatar) params.set('avatar', avatar)
    if (estado) params.set('estado', estado)
    params.set('tema', oscuro ? 'oscuro' : 'claro')
    return `${base}/g?${params}`
  }, [db, handle, bio, avatar, estado, oscuro])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <main className="setup">
      <p className="eyebrow">VIIM · Agencia Creativa</p>
      <h1>Arma el feed de un cliente</h1>
      <p className="intro">
        Llena estos campos, copia el enlace que sale abajo y pegalo en tu pagina de Notion como
        bloque <code>/embed</code>. Repite para cada cliente: no hay limite.
      </p>

      <div className="campo">
        <label htmlFor="url">Enlace de la base de datos en Notion</label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.notion.so/..."
        />
        <p className="ayuda">
          {db
            ? `Base detectada: ${db.slice(0, 8)}…`
            : 'En Notion abre tu calendario de contenido, toca Compartir y luego Copiar enlace.'}
        </p>
      </div>

      <div className="campo">
        <label htmlFor="handle">Usuario de Instagram</label>
        <input
          id="handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="benditasburgers"
        />
      </div>

      <div className="campo">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={'Se toma de la descripcion de tu base en Notion'}
        />
      </div>

      <div className="campo">
        <label htmlFor="avatar">Foto de perfil (opcional)</label>
        <input
          id="avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://..."
        />
        <p className="ayuda">
          Dejalo vacio: el widget toma el icono que tenga tu calendario en Notion. Para cambiar el
          logo, cambia el icono de la base de datos. Solo llena este campo si quieres usar otra
          imagen distinta.
        </p>
      </div>

      <div className="campo">
        <label htmlFor="estado">Mostrar solo un estado</label>
        <input
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          placeholder="Aprobado"
        />
        <p className="ayuda">Opcional. Util para enseñarle al cliente solo lo ya aprobado.</p>
      </div>

      <div className="campo">
        <label>Tema</label>
        <div className="acciones">
          <button className="btn" data-activo={oscuro} onClick={() => setOscuro(true)}>
            Oscuro
          </button>
          <button className="btn" data-activo={!oscuro} onClick={() => setOscuro(false)}>
            Claro
          </button>
        </div>
        <p className="ayuda">
          Fija el tema del widget. Si no generas el enlace de nuevo, el widget sigue el modo de tu
          computador por su cuenta.
        </p>
      </div>

      {enlace && (
        <div className="resultado">
          <p>Tu enlace para este cliente:</p>
          <code className="enlace">{enlace}</code>
          <div className="acciones">
            <button className="btn" onClick={copiar}>
              {copiado ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a className="btn" href={enlace} target="_blank" rel="noreferrer">
              Ver el feed
            </a>
          </div>
        </div>
      )}

      <section className="pasos">
        <h2>Que necesita tu base de datos</h2>
        <ol>
          <li><strong>Imagen</strong> — tipo Archivos y elementos multimedia. Aqui subes la foto o el video.</li>
          <li><strong>Fecha</strong> — tipo Fecha. Define el orden del feed: lo mas nuevo arriba.</li>
          <li><strong>Formato</strong> — tipo Seleccion: Post, Carrusel, Reel.</li>
          <li><strong>Estado</strong> — tipo Seleccion: Idea, Diseño, Aprobado, Publicado.</li>
          <li><strong>Caption</strong> y <strong>Hashtags</strong> — tipo Texto.</li>
          <li><strong>Orden</strong> — tipo Numero. Necesaria para arrastrar y reordenar.</li>
          <li><strong>Musica</strong> y <strong>Likes</strong> — opcionales, solo para la vista previa.</li>
        </ol>
      </section>
    </main>
  )
}
