import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import departamentos from '../data/departamentos'
import categorias from '../data/categorias'
import { getNegocios } from '../lib/storage'
import { getPlanInfo } from '../lib/planes'
import { SITE_NAME, PAIS, DIAS_PRUEBA } from '../lib/constants'

const departments = Object.keys(departamentos).sort()

const countByCategoria = (negocios) => {
  const info = {}
  for (const n of negocios) {
    if (getPlanInfo(n).debeBorrar) continue
    info[n.categoria] = (info[n.categoria] || 0) + 1
  }
  return info
}

const testimonios = [
  {
    id: 1,
    nombre: 'María López',
    avatar: 'ML',
    cargo: 'Dueña de Hotel Colonial, Villa de Leyva',
    texto: 'Gracias a Ruta Local, mi hospedaje pasó de tener 2 reservas semanales a estar lleno cada fin de semana. La plataforma me conectó con viajeros que buscaban exactamente lo que ofrezco.',
    estrellas: 5,
    color: '#6366F1',
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    avatar: 'CM',
    cargo: 'Fundador de Artesanías Wayúu, Riohacha',
    texto: 'Registré mi negocio de artesanías y en menos de una semana recibí pedidos de todo el país. La visibilidad que da estar en un directorio organizado por municipios es increíble.',
    estrellas: 5,
    color: '#F59E0B',
  },
]

const s = {
  section: { padding: '80px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 20px' },
  sectionTitle: {
    fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
    textAlign: 'center', marginBottom: 12, color: 'var(--text)',
  },
  sectionSub: {
    textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.05rem',
    maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6,
  },
}

function Star({ filled }) {
  return (
    <span style={{ color: filled ? '#F5A623' : '#E5E7EB', fontSize: '1.1rem', marginRight: 2 }}>
      {filled ? '\u2605' : '\u2606'}
    </span>
  )
}

export default function Home() {
  const router = useRouter()
  const [dept, setDept] = useState('')
  const [mun, setMun] = useState('')
  const [negocios, setNegocios] = useState([])

  useEffect(() => {
    async function cargar() {
      const data = await getNegocios()
      setNegocios(data)
    }
    cargar()
  }, [])

  const municipios = dept ? (departamentos[dept] || []) : []
  const featured = negocios.filter(n => {
    const info = getPlanInfo(n)
    return !info.debeBorrar && (n.plan === 'premium' || n.plan === 'plus' || info.enPrueba)
  }).slice(0, 3)

  const catCounts = countByCategoria(negocios)

  const handleSearch = () => {
    if (!dept || !mun) return
    router.push(`/municipio/${encodeURIComponent(dept)}/${encodeURIComponent(mun)}`)
  }

  return (
    <>
      {/* HERO */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #094F3A 0%, #0D6B4E 40%, #1A8C6A 100%)',
        padding: '120px 0 100px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '60px 60px',
        }} />
        {/* Imagen de fondo difuminada: coloca tu foto en public/hero.png (webp, jpg o png) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.35, filter: 'blur(2px)',
        }} />
        <div style={{ ...s.container, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              color: '#fff', fontSize: '0.8rem', fontWeight: 600, padding: '6px 18px',
              borderRadius: 50, letterSpacing: '0.02em', marginBottom: 24,
            }}>
              {PAIS} · Municipios · Negocios locales
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16,
              maxWidth: 800, marginLeft: 'auto', marginRight: 'auto',
            }}>
              Descubre los negocios de cada rincón de Colombia
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)', color: 'rgba(255,255,255,0.85)',
              maxWidth: 640, margin: '0 auto', lineHeight: 1.7,
            }}>
              Encuentra hoteles, restaurantes, glamping, artesanías y más, en cualquier municipio del país.
            </p>
          </div>

          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px 36px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxWidth: 860, margin: '0 auto',
          }} className="search-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }} className="search-row">
              <div style={{ flex: 1 }} className="search-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  País
                </label>
                <select value={PAIS} disabled style={{
                  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500,
                  background: 'var(--muted)', color: 'var(--text)', outline: 'none',
                  appearance: 'none', cursor: 'not-allowed',
                }}>
                  <option>{PAIS}</option>
                </select>
              </div>
              <div style={{ flex: 1 }} className="search-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Departamento
                </label>
                <select value={dept} onChange={e => { setDept(e.target.value); setMun('') }} style={{
                  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500,
                  background: '#fff', color: 'var(--text)', outline: 'none', cursor: 'pointer',
                }}>
                  <option value="">Seleccionar</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }} className="search-field">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Municipio
                </label>
                <select value={mun} onChange={e => setMun(e.target.value)} disabled={!dept} style={{
                  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500,
                  background: dept ? '#fff' : 'var(--muted)', color: 'var(--text)', outline: 'none',
                  cursor: dept ? 'pointer' : 'not-allowed',
                }}>
                  <option value="">{dept ? 'Seleccionar' : 'Primero elige un depto'}</option>
                  {municipios.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} disabled={!dept || !mun} style={{
                padding: '12px 28px', borderRadius: 'var(--radius-sm)',
                background: !dept || !mun ? 'var(--muted)' : 'linear-gradient(135deg, #E8632E, #F07D4A)',
                color: !dept || !mun ? 'var(--text-muted)' : '#fff',
                border: 'none', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap',
                transition: 'all 0.2s', minHeight: 48, cursor: !dept || !mun ? 'not-allowed' : 'pointer',
              }} className="search-btn">
                <i className="fas fa-search" style={{ marginRight: 8 }}></i>
                Buscar negocios
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'transparent', borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...s.container, display: 'flex', justifyContent: 'center', gap: 0 }} className="stats-row">
          {[
            { num: '+33', label: 'Departamentos', icon: 'fas fa-map-marked-alt' },
            { num: '+1,000', label: 'Negocios', icon: 'fas fa-store' },
            { num: '+14', label: 'Categor\u00EDas', icon: 'fas fa-th-large' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '28px 16px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }} className="stat-item">
              <i className={stat.icon} style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 6 }}></i>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ ...s.section, background: 'transparent' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>{'\u00BFQu\u00E9 necesitas?'}</h2>
          <p style={s.sectionSub}>
            Explora las categorías disponibles y encuentra el servicio perfecto para ti.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }} className="cats-grid">
            {categorias.map(cat => (
              <Link key={cat.id} href={`/categoria/${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.3s', border: '1px solid var(--border)', height: '100%',
                }} className="cat-card"
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'transparent' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: cat.gradiente, margin: '0 auto 14px', fontSize: '1.4rem', color: '#fff',
                  }} className="cat-icon">
                    <i className={cat.icono}></i>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                    {cat.nombre}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {catCounts[cat.id] > 0 ? `${catCounts[cat.id]} disponible${catCounts[cat.id] === 1 ? '' : 's'}` : 'Disponible'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...s.section, background: 'transparent' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>{'\u00BFC\u00F3mo funciona?'}</h2>
          <p style={s.sectionSub}>
            En tres pasos sencillos podrás encontrar el negocio local perfecto.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }} className="steps-grid">
            {[
              { num: 1, titulo: 'Elige tu destino', desc: 'Selecciona el departamento y municipio que quieras explorar. Cada rinc\u00F3n de Colombia tiene algo \u00FAnico por descubrir.', icon: 'fas fa-location-dot' },
              { num: 2, titulo: 'Explora servicios', desc: 'Navega por las categor\u00EDas disponibles: hoteles, restaurantes, artesan\u00EDas y mucho m\u00E1s en un solo lugar.', icon: 'fas fa-compass' },
              { num: 3, titulo: 'Contacta directo', desc: 'Comunicate directamente con el negocio v\u00EDA WhatsApp o llamada. Sin intermediarios, sin comisiones.', icon: 'fas fa-phone-alt' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }} className="step-card">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: '#fff', fontSize: '1.5rem',
                  boxShadow: '0 8px 24px rgba(13,107,78,0.25)',
                }}>
                  <i className={step.icon}></i>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent)', color: '#1A1A2E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '-42px auto 16px', fontSize: '0.85rem', fontWeight: 800,
                  position: 'relative', zIndex: 2, border: '3px solid var(--surface)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                  {step.titulo}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section style={{ ...s.section, background: 'transparent' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Negocios destacados</h2>
          <p style={s.sectionSub}>
            Descubre algunos de los negocios locales que ya confían en {SITE_NAME}.
          </p>
          {featured.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="featured-grid">
              {featured.map(n => {
                const planInfo = getPlanInfo(n)
                return (
                  <Link key={n.id} href={`/negocio/${n.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      background: 'var(--surface)', borderRadius: 'var(--radius)',
                      overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s', height: '100%',
                    }} className="featured-card"
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{
                        height: 180, backgroundSize: 'cover', backgroundPosition: 'center',
                        position: 'relative',
                        backgroundImage: n.fotos?.length
                          ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${n.fotos[0]})`
                          : 'linear-gradient(135deg, #E8F5F1, #C8E6D9)',
                      }}>
                        {(n.plan === 'premium' || n.plan === 'plus') && (
                          <span style={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'var(--accent)', color: '#1A1A2E',
                            fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50,
                          }}>
                            <i className="fas fa-crown" style={{ marginRight: 4 }}></i>Destacado
                          </span>
                        )}
                        {planInfo.enPrueba && (
                          <span style={{
                            position: 'absolute', top: 12, right: 12,
                            background: 'rgba(13,107,78,0.9)', color: '#fff',
                            fontSize: '0.6rem', fontWeight: 600, padding: '3px 10px', borderRadius: 50,
                          }}>
                            Prueba
                          </span>
                        )}
                      </div>
                      <div style={{ padding: 16 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {n.categoria || 'Sin categor\u00EDa'}
                        </span>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '4px 0 2px', color: 'var(--text)' }}>
                          {n.nombre}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                          <i className="fas fa-location-dot" style={{ color: 'var(--primary)', marginRight: 4, fontSize: '0.75rem' }}></i>
                          {n.municipio}, {n.departamento}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {n.whatsapp && (
                            <a href={`https://wa.me/${n.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                                background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                              <i className="fab fa-whatsapp"></i> WhatsApp
                            </a>
                          )}
                          {n.telefono && (
                            <a href={`tel:${n.telefono}`} onClick={e => e.stopPropagation()}
                              style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                                background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                              <i className="fas fa-phone"></i> Llamar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--surface)',
              borderRadius: 'var(--radius)', border: '2px dashed var(--border)',
            }}>
              <i className="fas fa-store" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: 16 }}></i>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 8 }}>
                Sé el primero en registrar tu negocio
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
                {SITE_NAME} está creciendo. Publica tu negocio y pruébalo gratis por {DIAS_PRUEBA} días con toda la información visible. Sin permanencia, sin riesgo.
              </p>
              <Link href="/registro" style={{
                display: 'inline-block', padding: '12px 32px', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              }}>
                Empezar gratis por {DIAS_PRUEBA} días
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ ...s.section, background: 'transparent' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Lo que dicen nuestros usuarios</h2>
          <p style={s.sectionSub}>
            Historias reales de emprendedores que ya forman parte de {SITE_NAME}.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }} className="test-grid">
            {testimonios.map(t => (
              <div key={t.id} style={{
                background: '#fff', borderRadius: 'var(--radius)', padding: '32px 28px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} filled={i <= t.estrellas} />)}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', flex: 1, marginBottom: 18 }}>
                  {'\u201C'}{t.texto}{'\u201D'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{t.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0' }}>
        <div style={s.container}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(135deg, #094F3A 0%, #0D6B4E 50%, #1A8C6A 100%)',
            padding: '60px 48px', position: 'relative',
            boxShadow: '0 16px 48px rgba(9,79,58,0.25)',
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat', backgroundSize: '80px 80px',
            }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <i className="fas fa-store" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}></i>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800, color: '#fff', marginBottom: 12,
              }}>
                {'\u00BFTienes un negocio local?'}
              </h2>
              <p style={{
                fontSize: '1rem', color: 'rgba(255,255,255,0.85)',
                maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7,
              }}>
                Publica tu negocio y pruébalo gratis por {DIAS_PRUEBA} días con toda la información visible. Si te gusta cómo funcionamos, elige un plan desde $19.900/mes. Cancela cuando quieras.
              </p>
              <Link href="/registro" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 36px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)', color: '#1A1A2E',
                fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                boxShadow: '0 8px 24px rgba(245,166,35,0.35)',
              }}>
                <i className="fas fa-plus-circle"></i>
                Empezar gratis por {DIAS_PRUEBA} días
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .search-card { margin-left: 20px; margin-right: 20px; }
        @media (max-width: 768px) {
          .search-row { flex-direction: column; align-items: stretch !important; }
          .search-field { width: 100% !important; flex: none !important; }
          .search-btn { width: 100%; }
          .cats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .featured-grid { grid-template-columns: 1fr !important; }
          .test-grid { grid-template-columns: 1fr !important; }
          .stats-row { flex-direction: column !important; }
          .stat-item { border-right: none !important; border-bottom: 1px solid var(--border); }
          .stat-item:last-child { border-bottom: none; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .cats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        .cat-card:hover .cat-icon { transform: scale(1.1); }
      `}</style>
    </>
  )
}
