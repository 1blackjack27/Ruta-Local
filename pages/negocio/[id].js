import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getNegocioById, getNegocios, incrementContador, getResenas, agregarResena, getPerfil, getFavoritos, toggleFavorito } from '../../lib/storage'
import { getPlanInfo } from '../../lib/planes'
import { DIAS_PRUEBA } from '../../lib/constants'
import { auth } from '../../lib/firebase'

export default function NegocioPage() {
  const router = useRouter()
  const { id } = router.query

  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [plan, setPlan] = useState(null)
  const [similar, setSimilar] = useState([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(-1)
  const [diasRestantes, setDiasRestantes] = useState(30)
  const [compartido, setCompartido] = useState(false)
  const [resenas, setResenas] = useState([])
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [meRating, setMeRating] = useState(0)
  const [meComentario, setMeComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeResena, setMensajeResena] = useState('')
  const [esFavorito, setEsFavorito] = useState(false)
  const [favoritosCargando, setFavoritosCargando] = useState(false)

  const handleCompartir = async () => {
    const url = window.location.href
    const titulo = negocio ? negocio.nombre : 'Ruta Local'
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, text: `Mira ${titulo} en Ruta Local`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCompartido(true)
        setTimeout(() => setCompartido(false), 2000)
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url)
        setCompartido(true)
        setTimeout(() => setCompartido(false), 2000)
      } catch (e2) {
        alert('No se pudo compartir. Copia la URL de la página manualmente.')
      }
    }
  }

  useEffect(() => {
    if (!id) return
    async function cargar() {
      const data = await getNegocioById(id)
      if (!data) {
        setError(true)
        setLoading(false)
        return
      }
      setNegocio(data)

      const p = getPlanInfo(data)
      setPlan(p)

      if (p.enPrueba && data.createdAt) {
        const creado = new Date(data.createdAt)
        const ahora = new Date()
        const diff = Math.floor((ahora - creado) / (1000 * 60 * 60 * 24))
        setDiasRestantes(Math.max(0, DIAS_PRUEBA - diff))
      }

      const todos = await getNegocios()
      const similares = todos
        .filter(n => n.municipio === data.municipio && n.id !== data.id)
        .slice(0, 4)
      setSimilar(similares)

      incrementContador(id, 'views')

      setLoading(false)

      const r = await getResenas(id)
      setResenas(r)
    }
    cargar()
  }, [id])

  useEffect(() => {
    if (!auth) {
      setAuthReady(true)
      return
    }
    const unsub = auth.onAuthStateChanged(async u => {
      setUser(u)
      setAuthReady(true)
      if (u && id) {
        const favs = await getFavoritos(u.uid)
        setEsFavorito(favs.some(f => f.negocioId === id))
      }
    })
    return () => unsub()
  }, [id])

  const handleFavorito = async () => {
    if (!user) {
      router.push(`/login?next=/negocio/${id}`)
      return
    }
    setFavoritosCargando(true)
    const activo = await toggleFavorito(user.uid, negocio)
    if (activo !== null) {
      setEsFavorito(activo)
    }
    setFavoritosCargando(false)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', color: 'var(--text-secondary)',
        fontFamily: 'var(--font-body)', fontSize: '0.95rem'
      }}>
        Cargando...
      </div>
    )
  }

  if (error || (plan && plan.debeBorrar) || !negocio) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', minHeight: '60vh', textAlign: 'center',
        padding: '2rem', fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text)' }}>
          {error ? 'Negocio no encontrado' : 'Este negocio ya no está disponible'}
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
          {error
            ? 'El negocio que buscas no existe o ha sido eliminado.'
            : 'El plan de este negocio ha expirado.'}
        </p>
        <Link href="/">
          <span style={{
            display: 'inline-block', padding: '0.75rem 1.5rem',
            background: 'var(--primary)', color: '#fff',
            borderRadius: 'var(--radius)', textDecoration: 'none',
            fontWeight: 600, cursor: 'pointer'
          }}>
            Volver al inicio
          </span>
        </Link>
      </div>
    )
  }

  if (!plan.mostrarInfoCompleta) {
    return (
      <div style={{
        fontFamily: 'var(--font-body)', minHeight: '100vh',
        background: 'transparent', color: 'var(--text)'
      }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)'
        }}>
          <Link href="/">
            <span style={{
              color: 'var(--primary)', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.9rem', textDecoration: 'none'
            }}>
              ← Volver
            </span>
          </Link>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '70vh', padding: '2rem 1rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.75rem',
            fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text)'
          }}>
            {negocio.nombre}
          </h1>
          {negocio.municipio && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
              📍 {negocio.municipio}
              {negocio.departamento ? `, ${negocio.departamento}` : ''}
            </p>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
            Este negocio está renovando su plan. La información completa vuelve a estar disponible pronto.
          </p>
        </div>
      </div>
    )
  }

  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const hoy = new Date()
  const diaActual = diasSemana[hoy.getDay()]
  const horaActual = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`

  let abiertoAhora = false
  if (negocio.horarios?.[diaActual]) {
    const { abierto, cerrado } = negocio.horarios[diaActual]
    if (abierto && cerrado) {
      abiertoAhora = horaActual >= abierto && horaActual <= cerrado
    }
  }

  const horariosDias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

  const rating = resenas.length
    ? resenas.reduce((a, r) => a + Number(r.rating || 0), 0) / resenas.length
    : 0
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  const renderStars = (r) => {
    const f = Math.floor(r)
    const h = r % 1 >= 0.5
    let s = ''
    for (let i = 1; i <= 5; i++) {
      s += i <= f ? '★' : i === f + 1 && h ? '★' : '☆'
    }
    return s
  }

  const isPremium = plan.esPremium || plan.esPlus

  const handleEnviarResena = async (e) => {
    e.preventDefault()
    setMensajeResena('')
    if (!user) {
      setMensajeResena('Debes iniciar sesión para dejar un comentario.')
      return
    }
    if (meRating === 0) {
      setMensajeResena('Selecciona una calificación de 1 a 5 estrellas.')
      return
    }
    if (!meComentario.trim()) {
      setMensajeResena('Escribe tu comentario.')
      return
    }
    const nombre = (user.displayName || user.email || '').split('@')[0]
    setEnviando(true)
    let fotoAutor = user.photoURL || ''
    const perfil = await getPerfil(user.uid)
    if (perfil?.foto) fotoAutor = perfil.foto
    const nuevo = await agregarResena(id, {
      usuarioId: user.uid,
      nombre,
      fotoAutor,
      rating: meRating,
      comentario: meComentario.trim(),
    })
    setEnviando(false)
    if (nuevo) {
      const r2 = await getResenas(id)
      setResenas(r2)
      setMeRating(0)
      setMeComentario('')
      setMensajeResena('¡Gracias por tu comentario!')
    } else {
      setMensajeResena('No se pudo guardar tu comentario. Intenta de nuevo.')
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', fontSize: '0.85rem',
    background: 'var(--surface)', color: 'var(--text)',
    outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }

  return (
    <div style={{
      fontFamily: 'var(--font-body)', minHeight: '100vh',
      background: 'transparent', color: 'var(--text)'
    }}>
      <style>{`
        .two-col-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .similar-scroll {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.5rem;
        }
        .similar-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .similar-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 2px;
        }
        .similar-scroll > * {
          flex: 0 0 220px;
          scroll-snap-align: start;
        }
        .day-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .day-row:last-child {
          border-bottom: none;
        }
        @media (max-width: 768px) {
          .two-col-layout {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          .similar-scroll > * {
            flex: 0 0 160px;
          }
        }
      `}</style>

      {/* Sticky top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href={`/municipio/${negocio.departamento || ''}/${negocio.municipio || ''}`}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            color: 'var(--primary)', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.9rem', textDecoration: 'none'
          }}>
            ← Volver a {negocio.municipio || 'inicio'}
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleFavorito} disabled={!authReady || favoritosCargando}
            style={{
              background: 'none', border: `1px solid ${esFavorito ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem',
              color: esFavorito ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 500
            }}>
            {esFavorito ? '♥ Guardado' : '♡ Guardar'}
          </button>
          <button onClick={handleCompartir} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem',
            color: compartido ? 'var(--success)' : 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 500
          }}>
            {compartido ? '¡Enlace copiado!' : 'Compartir'}
          </button>
        </div>
      </div>

      {/* Business Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 0' }}>
        <p style={{
          color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: '0 0 0.35rem'
        }}>
          {negocio.categoria}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
          margin: '0 0 0.5rem', color: 'var(--text)', lineHeight: 1.2
        }}>
          {negocio.nombre}
        </h1>
        {negocio.municipio && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
            📍 {negocio.municipio}
            {negocio.departamento ? `, ${negocio.departamento}` : ''}
          </p>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem'
        }}>
          <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
            {renderStars(rating)}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{rating}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '1rem 1rem 0',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap'
      }}>
        {plan.mostrarWhatsapp && negocio.whatsapp && (
          <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            onClick={() => incrementContador(negocio.id, 'whatsappClicks')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', background: '#25D366', color: '#fff',
              borderRadius: 'var(--radius-sm)', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.118 1.516 5.849L0 24l6.342-1.48A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
            WhatsApp
          </a>
        )}
        {plan.mostrarTelefono && negocio.telefono && (
          <a href={`tel:${negocio.telefono}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', background: 'var(--primary)', color: '#fff',
              borderRadius: 'var(--radius-sm)', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Llamar
          </a>
        )}
        {plan.mostrarUbicacion && negocio.direccion && (
          <a href={negocio.googleMaps || `https://www.google.com/maps/search/${encodeURIComponent(negocio.direccion)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', background: 'var(--surface)',
              color: 'var(--text)', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              border: '1px solid var(--border)'
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Cómo llegar
          </a>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="two-col-layout">
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* About Card */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.15rem',
              fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text)'
            }}>
              Acerca de
            </h2>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              lineHeight: 1.7, margin: 0
            }}>
              {negocio.descripcion || 'No hay descripción disponible.'}
            </p>
          </div>

          {/* Services Card */}
          {plan.mostrarServicios && negocio.servicios?.length > 0 && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text)'
              }}>
                Servicios ofrecidos
              </h2>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem'
              }}>
                {negocio.servicios.map((s, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'var(--surface)', padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                    color: 'var(--text)', border: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>✓</span>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hours Card */}
          {plan.mostrarHorarios && negocio.horarios && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text)'
              }}>
                Horario de atención
              </h2>
              {abiertoAhora && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'var(--success)', color: '#fff',
                  padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem',
                  width: 'fit-content'
                }}>
                  <span style={{ fontSize: '0.7rem' }}>⬤</span> Abierto ahora
                </div>
              )}
              {horariosDias.map(dia => {
                const info = negocio.horarios[dia]
                const cap = dia.charAt(0).toUpperCase() + dia.slice(1)
                const isHoy = dia === diaActual
                return (
                  <div key={dia} className="day-row"
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: isHoy ? 700 : 400
                    }}
                  >
                    <span style={{
                      color: isHoy ? 'var(--text)' : 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      {cap}
                    </span>
                    <span style={{
                      color: isHoy ? 'var(--text)' : 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}>
                      {info ? `${info.abierto} - ${info.cerrado}` : 'Cerrado'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Location Card */}
          {plan.mostrarUbicacion && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text)'
              }}>
                Ubicación
              </h2>
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.9rem',
                margin: '0 0 0.75rem'
              }}>
                {negocio.direccion || 'Dirección no especificada'}
              </p>
            </div>
          )}

          {/* Gallery Card */}
          {negocio.fotos?.length > 0 && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                fontWeight: 700, margin: '0 0 1rem', color: 'var(--text)'
              }}>
                Galería de fotos
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: negocio.fotos.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}>
                {negocio.fotos.map((f, i) => (
                  <div key={i} onClick={() => setCurrentPhotoIndex(i)} style={{
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    cursor: 'pointer', aspectRatio: '4/3', border: '1px solid var(--border)'
                  }}>
                    <img src={f} alt={`${negocio.nombre} - foto ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Card */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.15rem',
              fontWeight: 700, margin: '0 0 1rem', color: 'var(--text)'
            }}>
              Reseñas de clientes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resenas.length === 0 ? (
                <p style={{
                  color: 'var(--text-muted)', fontSize: '0.85rem',
                  textAlign: 'center', padding: '1rem 0', margin: 0
                }}>
                  Aún no hay comentarios. ¡Sé el primero en dejar uno!
                </p>
              ) : (
                resenas.map((review, i) => {
                  const nombre = review.nombre || 'Usuario'
                  const perfilUrl = review.usuarioId ? `/perfil/${review.usuarioId}` : null
                  const inner = (
                    <>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: review.fotoAutor
                          ? `url(${review.fotoAutor}) center/cover`
                          : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, textTransform: 'uppercase'
                      }}>
                        {!review.fotoAutor && nombre.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '0.25rem'
                        }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                            {nombre}
                          </span>
                          <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                            {renderStars(review.rating)}
                          </span>
                        </div>
                        <p style={{
                          color: 'var(--text-secondary)', fontSize: '0.85rem',
                          lineHeight: 1.5, margin: 0
                        }}>
                          {review.comentario}
                        </p>
                      </div>
                    </>
                  )
                  return perfilUrl ? (
                    <Link key={i} href={perfilUrl} style={{
                      display: 'flex', gap: '0.75rem', padding: '1rem',
                      background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', textDecoration: 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                       onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={i} style={{
                      display: 'flex', gap: '0.75rem', padding: '1rem',
                      background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)'
                    }}>
                      {inner}
                    </div>
                  )
                })
              )}
            </div>

            {/* Deja tu comentario */}
            <div style={{
              marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '1rem',
                fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text)'
              }}>
                Deja tu comentario
              </h3>

              {!authReady ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
              ) : !user ? (
                <div style={{
                  background: 'var(--muted)', borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem', textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                    Para dejar un comentario necesitas iniciar sesión o crear una cuenta.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login">
                      <span style={{
                        display: 'inline-block', padding: '0.55rem 1.25rem',
                        background: 'var(--primary)', color: '#fff',
                        borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem'
                      }}>
                        Iniciar sesión
                      </span>
                    </Link>
                    <Link href={`/registro-persona?next=${encodeURIComponent(`/negocio/${id}`)}`}>
                      <span style={{
                        display: 'inline-block', padding: '0.55rem 1.25rem',
                        background: 'var(--surface)', color: 'var(--primary)',
                        borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem',
                        border: '1.5px solid var(--primary)'
                      }}>
                        Crear cuenta gratis
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviarResena} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setMeRating(n)}
                        style={{
                          background: 'none', border: 'none', fontSize: '1.5rem',
                          color: n <= meRating ? '#f59e0b' : 'var(--border)', cursor: 'pointer', padding: 0
                        }}>
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                      {meRating ? `${meRating}/5` : 'Califica'}
                    </span>
                  </div>
                  <textarea
                    value={meComentario}
                    onChange={e => setMeComentario(e.target.value)}
                    placeholder="Cuéntanos tu experiencia..."
                    rows="3"
                    style={{ ...inputStyle, resize: 'vertical', maxWidth: '100%' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button type="submit" disabled={enviando} style={{
                      padding: '0.6rem 1.5rem', background: 'var(--primary)', color: '#fff',
                      borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem',
                      border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', opacity: enviando ? 0.7 : 1
                    }}>
                      {enviando ? 'Enviando...' : 'Publicar comentario'}
                    </button>
                  </div>
                  {mensajeResena && (
                    <p style={{
                      fontSize: '0.85rem', margin: 0,
                      color: mensajeResena === '¡Gracias por tu comentario!' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {mensajeResena}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Contact Card */}
          {(plan.mostrarWhatsapp || plan.mostrarUbicacion) && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '1rem',
                fontWeight: 700, margin: '0 0 1rem', color: 'var(--text)'
              }}>
                Contacto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.mostrarWhatsapp && negocio.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#25D366', fontSize: '1.1rem', display: 'flex' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.118 1.516 5.849L0 24l6.342-1.48A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                      {negocio.whatsapp}
                    </span>
                  </div>
                )}
                {plan.mostrarTelefono && negocio.telefono && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)', display: 'flex' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                      {negocio.telefono}
                    </span>
                  </div>
                )}
                {negocio.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>✉</span>
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>
                      {negocio.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media Card */}
          {plan.mostrarRedes && (
            (() => {
              const hasSocial = negocio.facebook || negocio.instagram || negocio.tiktok || negocio.website
              if (!hasSocial) return null
              return (
                <div style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1rem',
                    fontWeight: 700, margin: '0 0 1rem', color: 'var(--text)'
                  }}>
                    Redes sociales
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {negocio.facebook && (
                      <a href={negocio.facebook} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: '#1877F2', textDecoration: 'none',
                          fontSize: '0.9rem', fontWeight: 500
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                    {negocio.instagram && (
                      <a href={negocio.instagram} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: '#E4405F', textDecoration: 'none',
                          fontSize: '0.9rem', fontWeight: 500
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                    {negocio.tiktok && (
                      <a href={negocio.tiktok} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: 'var(--text)', textDecoration: 'none',
                          fontSize: '0.9rem', fontWeight: 500
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                        TikTok
                      </a>
                    )}
                    {negocio.website && (
                      <a href={negocio.website} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: 'var(--primary)', textDecoration: 'none',
                          fontSize: '0.9rem', fontWeight: 500
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        Sitio web
                      </a>
                    )}
                  </div>
                </div>
              )
            })()
          )}

          {/* Owner Card */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)', textAlign: 'center'
          }}>
            {negocio.fotoDueno ? (
              <img src={negocio.fotoDueno} alt="Foto del dueño"
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  objectFit: 'cover', margin: '0 auto 0.75rem',
                  border: '3px solid var(--primary-bg)', display: 'block'
                }} />
            ) : (
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--sky), var(--primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.5rem',
                margin: '0 auto 0.75rem'
              }}>
                {(negocio.nombreDueno || negocio.nombre || 'D').charAt(0)}
              </div>
            )}
            <p style={{
              fontWeight: 700, margin: '0 0 0.25rem',
              color: 'var(--text)', fontSize: '0.95rem'
            }}>
              {negocio.nombreDueno || 'Dueño del negocio'}
            </p>
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.8rem',
              margin: '0 0 1rem'
            }}>
              {negocio.nombre}
            </p>
            {plan.mostrarWhatsapp && negocio.whatsapp ? (
              <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${negocio.nombreDueno || 'del negocio'} ${negocio.nombre}, vi tu negocio en Ruta Local y me gustaría más información.`)}`}
                target="_blank" rel="noopener noreferrer"
                onClick={() => incrementContador(negocio.id, 'whatsappClicks')}
                style={{
                  width: '100%', padding: '0.6rem', background: '#25D366',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.4rem', textDecoration: 'none'
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.118 1.516 5.849L0 24l6.342-1.48A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Enviar mensaje
              </a>
            ) : (
              <button style={{
                width: '100%', padding: '0.6rem', background: 'var(--primary)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'not-allowed',
                opacity: 0.6
              }}>
                Enviar mensaje
              </button>
            )}
          </div>

          {/* Report Button */}
          <button style={{
            width: '100%', padding: '0.75rem', background: 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)', fontSize: '0.8rem',
            cursor: 'pointer', textAlign: 'center'
          }}>
            Reportar información incorrecta
          </button>
        </div>
      </div>

      {/* Similar Businesses */}
      {similar.length > 0 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1rem 2rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.25rem',
            fontWeight: 700, margin: '0 0 1rem', color: 'var(--text)'
          }}>
            Negocios similares en {negocio.municipio}
          </h2>
          <div className="similar-scroll">
            {similar.map(s => (
              <Link key={s.id} href={`/negocio/${s.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)', cursor: 'pointer'
                }}>
                  <div style={{
                    width: '100%', height: '130px',
                    background: s.fotos?.[0]
                      ? `url(${s.fotos[0]}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--primary-bg), var(--secondary))'
                  }} />
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{
                      color: 'var(--success)', fontSize: '0.65rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      margin: '0 0 0.25rem'
                    }}>
                      {s.categoria}
                    </p>
                    <p style={{
                      fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)',
                      margin: 0, whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {s.nombre}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer Note */}
      {plan.enPrueba && (
        <div style={{
          background: 'var(--sky-light)', borderTop: '1px solid var(--sky)',
          padding: '1rem', textAlign: 'center', fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          Este negocio está en período de prueba gratuita. Quedan {diasRestantes} días.
        </div>
      )}
      {/* Lightbox */}
      {currentPhotoIndex >= 0 && negocio.fotos?.[currentPhotoIndex] && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', zIndex: 1000,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <button onClick={() => setCurrentPhotoIndex(-1)} style={{
            position: 'absolute', top: 16, right: 16, width: 44, height: 44,
            borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: '1.3rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            ✕
          </button>
          <img src={negocio.fotos[currentPhotoIndex]} alt={`${negocio.nombre} - foto ${currentPhotoIndex + 1}`}
            style={{
              maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain',
              borderRadius: 'var(--radius)', display: 'block'
            }} />
          <div style={{
            display: 'flex', gap: '0.75rem', marginTop: '1rem',
            alignItems: 'center'
          }}>
            <button onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + negocio.fotos.length) % negocio.fotos.length)}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                fontSize: '1.1rem', cursor: 'pointer'
              }}>
              ‹
            </button>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, minWidth: 60, textAlign: 'center' }}>
              {currentPhotoIndex + 1} / {negocio.fotos.length}
            </span>
            <button onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % negocio.fotos.length)}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                fontSize: '1.1rem', cursor: 'pointer'
              }}>
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
