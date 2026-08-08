'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fechaLarga(iso) {
  if (!iso) return ''
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  if (isNaN(d)) return ''
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const esReel = (p) =>
  /reel/i.test(p.formato) || p.media.some((m) => m.isVideo)

const esCarrusel = (p) => /carru/i.test(p.formato) || p.media.length > 1

function Media({ item, className }) {
  if (!item) return null
  if (item.isVideo) {
    return <video src={item.url} className={className} muted playsInline preload="metadata" />
  }
  return <img src={item.url} alt="" className={className} loading="lazy" />
}

function IconoCarrusel() {
  return (
    <svg className="marca" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 12H9V5h10v10ZM5 7v12a2 2 0 0 0 2 2h12v-2H7V7H5Z" />
    </svg>
  )
}

function IconoReel() {
  return (
    <svg className="marca" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  )
}

export default function Grid({ config }) {
  const { db, handle, bio, avatar, estado, cliente } = config

  const [posts, setPosts] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('grid')
  const [tema, setTema] = useState(config.tema === 'claro' ? 'claro' : 'oscuro')
  const [avatarRoto, setAvatarRoto] = useState(false)
  const [info, setInfo] = useState({ total: 0, conImagen: 0 })
  const [ratio, setRatio] = useState('4-5')
  const [reordenar, setReordenar] = useState(false)
  const [guardado, setGuardado] = useState('')
  const [abierto, setAbierto] = useState(null)
  const [slide, setSlide] = useState(0)

  const arrastrado = useRef(null)
  const [origenVisual, setOrigenVisual] = useState(null)
  const [sobre, setSobre] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const params = new URLSearchParams({ db })
      if (estado) params.set('estado', estado)
      if (cliente) params.set('cliente', cliente)
      const res = await fetch(`/api/notion?${params}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo cargar.')
      setPosts(json.posts)
      setInfo({ total: json.total ?? json.posts.length, conImagen: json.conImagen ?? 0 })
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [db, estado, cliente])

  useEffect(() => {
    if (db) cargar()
  }, [db, cargar])

  // Si el enlace no dice nada, seguimos el modo del sistema y recordamos
  // el ultimo cambio manual del usuario.
  useEffect(() => {
    if (config.tema) return
    let guardado = null
    try {
      guardado = window.localStorage.getItem('viim-grid-tema')
    } catch {}
    if (guardado === 'claro' || guardado === 'oscuro') {
      setTema(guardado)
      return
    }
    const claro = window.matchMedia('(prefers-color-scheme: light)').matches
    setTema(claro ? 'claro' : 'oscuro')
  }, [config.tema])

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'
    if (config.tema) return
    try {
      window.localStorage.setItem('viim-grid-tema', tema)
    } catch {}
  }, [tema, config.tema])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => {
      if (e.key === 'Escape') setAbierto(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])

  const visibles = useMemo(
    () => (tab === 'reels' ? posts.filter(esReel) : posts),
    [posts, tab]
  )

  async function guardarOrden(lista) {
    setGuardado('guardando')
    try {
      const res = await fetch('/api/notion/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lista.map((p, i) => ({ id: p.id, orden: i + 1 })) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setGuardado('listo')
      setTimeout(() => setGuardado(''), 2200)
    } catch (e) {
      setGuardado('')
      setError(e.message)
    }
  }

  function soltar(destino) {
    const origen = arrastrado.current
    setSobre(null)
    setOrigenVisual(null)
    arrastrado.current = null
    if (origen === null || origen === destino) return
    const lista = [...posts]
    const [movido] = lista.splice(origen, 1)
    lista.splice(destino, 0, movido)
    setPosts(lista)
    guardarOrden(lista)
  }

  const post = abierto !== null ? visibles[abierto] : null
  const mediaPost = post?.media?.length ? post.media : post?.externalLink ? [{ url: post.externalLink, isVideo: false }] : []

  const iniciales = (handle || 'v').replace('@', '').slice(0, 2).toUpperCase()

  return (
    <div className="marco">
      <header className="perfil">
        {avatar && !avatarRoto ? (
          <img
            src={avatar}
            alt=""
            className="avatar"
            onError={() => setAvatarRoto(true)}
          />
        ) : (
          <div className="avatar avatar-vacio">{iniciales}</div>
        )}
        <div className="perfil-datos">
          <p className="handle">@{(handle || 'tu_cuenta').replace('@', '')}</p>
          {bio && <p className="bio">{bio}</p>}
        </div>
      </header>

      <div className="mesa">
        <button className="btn" onClick={cargar} disabled={cargando}>
          {cargando ? 'Cargando' : 'Actualizar'}
        </button>
        <button
          className="btn"
          data-activo={reordenar}
          onClick={() => setReordenar((v) => !v)}
        >
          Reordenar
        </button>
        <button className="btn" onClick={() => setRatio((r) => (r === '1-1' ? '4-5' : '1-1'))}>
          {ratio === '1-1' ? '1:1' : '4:5'}
        </button>
        <button
          className="btn btn-icono"
          onClick={() => setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'))}
          aria-label="Cambiar tema"
        >
          {tema === 'claro' ? '\u25D1' : '\u25D0'}
        </button>
        <span className="contador">
          {guardado === 'guardando'
            ? 'Guardando orden'
            : guardado === 'listo'
            ? 'Orden guardado'
            : `${visibles.length} publicaciones`}
        </span>
      </div>

      <div className="tabs">
        <button className="tab" data-activo={tab === 'grid'} onClick={() => setTab('grid')}>
          Grid
        </button>
        <button className="tab" data-activo={tab === 'reels'} onClick={() => setTab('reels')}>
          Reels
        </button>
      </div>

      {error && (
        <div className="aviso">
          <h3>Algo falta</h3>
          <p>{error}</p>
        </div>
      )}

      {!db && (
        <div className="aviso">
          <h3>Sin base de datos</h3>
          <p>
            Este enlace no tiene una base conectada. Vuelve a la pagina de inicio y genera el enlace
            otra vez.
          </p>
        </div>
      )}

      {cargando && (
        <div className="grilla">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="celda esqueleto" data-formato={ratio} />
          ))}
        </div>
      )}

      {!cargando && !error && db && visibles.length === 0 && (
        <div className="aviso">
          <h3>{info.total > 0 ? 'Falta la columna de imagenes' : 'Todavia no hay nada'}</h3>
          {info.total > 0 ? (
            <p>
              Encontre {info.total} publicaciones en tu base, pero {estado ? 'ninguna con ese estado' : 'ninguna llego con imagen'}.
              Revisa que exista una columna de tipo Archivos y elementos multimedia llamada{' '}
              <code>Imagen</code> y que las piezas esten subidas ahi.
            </p>
          ) : (
            <p>
              Agrega una fila en tu base de datos, sube una imagen al campo <code>Imagen</code> y
              presiona Actualizar.
            </p>
          )}
        </div>
      )}

      {!cargando && visibles.length > 0 && (
        <div className="grilla">
          {visibles.map((p, i) => {
            const primera = p.media[0] || (p.externalLink ? { url: p.externalLink, isVideo: false } : null)
            return (
              <button
                key={p.id}
                className={`celda${primera ? '' : ' celda-vacia'}`}
                data-formato={ratio}
                data-arrastrando={origenVisual === i}
                data-destino={sobre === i}
                draggable={reordenar}
                onDragStart={() => {
                  arrastrado.current = i
                  setOrigenVisual(i)
                }}
                onDragEnd={() => {
                  setOrigenVisual(null)
                  setSobre(null)
                }}
                onDragOver={(e) => {
                  if (!reordenar) return
                  e.preventDefault()
                  setSobre(i)
                }}
                onDragLeave={() => setSobre((s) => (s === i ? null : s))}
                onDrop={(e) => {
                  e.preventDefault()
                  soltar(i)
                }}
                onClick={() => {
                  if (reordenar) return
                  setSlide(0)
                  setAbierto(i)
                }}
              >
                {primera ? <Media item={primera} /> : <span>{p.titulo || 'Sin imagen'}</span>}
                {esCarrusel(p) && <IconoCarrusel />}
                {!esCarrusel(p) && esReel(p) && <IconoReel />}
                {p.estado && !/public/i.test(p.estado) && <span className="borrador">{p.estado}</span>}
              </button>
            )
          })}
        </div>
      )}

      {post && (
        <div className="velo" onClick={() => setAbierto(null)}>
          <button className="cerrar" onClick={() => setAbierto(null)} aria-label="Cerrar">
            &times;
          </button>
          <article className="post" onClick={(e) => e.stopPropagation()}>
            <div className="post-top">
              {avatar && !avatarRoto ? (
                <img src={avatar} alt="" onError={() => setAvatarRoto(true)} />
              ) : (
                <div className="avatar avatar-vacio" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {iniciales}
                </div>
              )}
              <div>
                <div className="post-handle">{(handle || 'tu_cuenta').replace('@', '')}</div>
                {post.musica && <div className="post-musica">&#9834; {post.musica}</div>}
              </div>
            </div>

            <div className="post-media">
              <Media item={mediaPost[slide]} />
              {mediaPost.length > 1 && (
                <div className="puntos">
                  {mediaPost.map((_, i) => (
                    <button
                      key={i}
                      className="punto"
                      data-activo={i === slide}
                      onClick={() => setSlide(i)}
                      aria-label={`Imagen ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="post-acciones">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 20.3 4.2 12.6a4.6 4.6 0 0 1 6.5-6.5l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 6.5L12 20.3Z" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5Z" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
              <svg className="derecha" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M19 21l-7-5-7 5V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17Z" />
              </svg>
            </div>

            <div className="post-cuerpo">
              <div className="post-likes">
                {(post.likes ?? 0).toLocaleString('es-CO')} me gusta
              </div>
              {post.caption && (
                <div className="post-caption">
                  <b>{(handle || 'tu_cuenta').replace('@', '')}</b> {post.caption}
                </div>
              )}
              {post.hashtags && <div className="post-tags">{post.hashtags}</div>}
              <div className="post-fecha">{fechaLarga(post.fecha)}</div>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}
