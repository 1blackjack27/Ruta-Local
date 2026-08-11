import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { getPerfil, getResenasDeUsuario, getFavoritos } from '../../lib/storage'
import { SITE_NAME } from '../../lib/constants'

const red = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 42, height: 42, borderRadius: '50%', color: '#fff',
  fontSize: '1rem', textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
  transition: 'transform 0.2s',
}

function RenderStars({ rating }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#E5E7EB', fontSize: '0.85rem' }}>
        ★
      </span>
    )
  }
  return <>{stars}</>
}

export default function PerfilPage() {
  const router = useRouter()
  const { uid } = router.query

  const [perfil, setPerfil] = useState(null)
  const [resenas, setResenas] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [negocios, setNegocios] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    let activo = true
    ;(async () => {
      const p = await getPerfil(uid)
      const r = await getResenasDeUsuario(uid)
      const f = await getFavoritos(uid)
      if (!activo) return
      setPerfil(p)
      setResenas(r)
      setFavoritos(f)
      setLoading(false)
    })()
    return () => { activo = false }
  }, [uid])

  const cargarNegocios = async () => {
    if (resenas.length === 0 && favoritos.length === 0) return
    const { getNegocioById } = await import('../../lib/storage')
    const ids = new Set([
      ...resenas.map(r => r.negocioId).filter(Boolean),
      ...favoritos.map(f => f.negocioId).filter(Boolean),
    ])
    const mapa = {}
    await Promise.all([...ids].map(async id => {
      const n = await getNegocioById(id)
      if (n) mapa[id] = n
    }))
    setNegocios(mapa)
  }

  useEffect(() => {
    if (loading) return
    cargarNegocios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const nombre = perfil?.nombre || 'Usuario'

  return (
    <>
      <Head>
        <title>{`${nombre} · Perfil de ${SITE_NAME}`}</title>
      </Head>
      <main style={{ minHeight: '70vh', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-body)' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 60 }}>
              Cargando perfil...
            </p>
          ) : !perfil ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Este usuario aún no tiene un perfil público.
              </p>
              <Link href="/" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              {/* Cabecera del perfil */}
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                textAlign: 'center', marginBottom: '1.5rem',
              }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', margin: '0 auto 1rem',
                  background: perfil.foto
                    ? `url(${perfil.foto}) center/cover`
                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '2.2rem', textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-sm)', border: '3px solid #fff',
                }}>
                  {!perfil.foto && (nombre.charAt(0) || 'U')}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                  {nombre}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                  {resenas.length} {resenas.length === 1 ? 'comentario' : 'comentarios'} · {favoritos.length} {favoritos.length === 1 ? 'lugar favorito' : 'lugares favoritos'}
                </p>
                {(perfil.instagram || perfil.tiktok || perfil.facebook) && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    {perfil.instagram && (
                      <a href={`https://instagram.com/${perfil.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"
                        aria-label="Instagram" onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        style={{ ...red, background: '#E4405F' }}>
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}
                    {perfil.tiktok && (
                      <a href={`https://tiktok.com/@${perfil.tiktok.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"
                        aria-label="TikTok" onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        style={{ ...red, background: '#000' }}>
                        <i className="fab fa-tiktok"></i>
                      </a>
                    )}
                    {perfil.facebook && (
                      <a href={perfil.facebook.startsWith('http') ? perfil.facebook : `https://facebook.com/${perfil.facebook}`} target="_blank" rel="noopener noreferrer"
                        aria-label="Facebook" onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        style={{ ...red, background: '#1877F2' }}>
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Comentarios del usuario */}
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>
                  Sus comentarios
                </h2>
                {resenas.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Aún no ha comentado en ningún negocio.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {resenas.map((r, i) => {
                      const neg = negocios[r.negocioId]
                      return (
                        <div key={i} style={{
                          display: 'flex', flexDirection: 'column', gap: '0.5rem',
                          padding: '1rem', borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg)', border: '1px solid var(--border)',
                        }}>
                          {neg ? (
                            <Link href={`/negocio/${neg.id}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                              {neg.nombre || r.negocioNombre}
                            </Link>
                          ) : r.negocioNombre ? (
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                              {r.negocioNombre}
                            </span>
                          ) : null}
                          <div>
                            <RenderStars rating={r.rating} />
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                            {r.comentario}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Lugares favoritos */}
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
              }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}>
                  Lugares favoritos
                </h2>
                {favoritos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Aún no ha guardado lugares favoritos.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.9rem' }}>
                    {favoritos.map((f, i) => {
                      const neg = negocios[f.negocioId] || f
                      return (
                        <Link key={i} href={`/negocio/${f.negocioId}`} style={{ textDecoration: 'none' }}>
                          <div style={{
                            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                            border: '1px solid var(--border)', background: 'var(--surface)',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                          }} onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                             onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                            <div style={{
                              height: 90, background: f.foto
                                ? `url(${f.foto}) center/cover`
                                : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            }}></div>
                            <div style={{ padding: '0.6rem 0.75rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>
                                {neg.nombre || f.nombre || 'Negocio'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {f.municipio || '—'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
