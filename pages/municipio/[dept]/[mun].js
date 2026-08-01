import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import categorias from '../../../data/categorias'
import { getNegociosByMunicipio, getNegocios } from '../../../lib/storage'
import { getPlanInfo } from '../../../lib/planes'
import BusinessCard from '../../../components/BusinessCard'

export default function MunicipioPage() {
  const router = useRouter()
  const { dept, mun } = router.query
  const [activo, setActivo] = useState('todos')
  const [negocios, setNegocios] = useState([])
  const [topPicks, setTopPicks] = useState([])

  useEffect(() => {
    if (!dept || !mun) return
    async function cargar() {
      const todos = (await getNegociosByMunicipio(decodeURIComponent(dept), decodeURIComponent(mun)))
        .filter(n => !getPlanInfo(n).debeBorrar)
      setNegocios(todos)
      setTopPicks(todos.slice(0, 3))
    }
    cargar()
  }, [dept, mun])

  if (!dept || !mun) return null

  const deptNombre = decodeURIComponent(dept)
  const munNombre = decodeURIComponent(mun)
  const filtrados = activo === 'todos' ? negocios : negocios.filter(n => n.categoria === activo)

  const categoriasUnicas = [...new Set(negocios.map(n => n.categoria))]

  return (
    <>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #094F3A, #1A8C6A)`,
        padding: '40px 20px 32px', color: '#fff',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.2rem)' }}>{munNombre}</h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
              <i className="fas fa-location-dot"></i> {deptNombre}, Colombia · {negocios.length} negocios · {categoriasUnicas.length} categorías
            </p>
          </div>
          <Link href="/registro" style={{
            background: 'var(--accent)', color: '#1A1A2E', padding: '10px 20px',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="fas fa-plus"></i> Agregar negocio
          </Link>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '14px 0', position: 'sticky', top: 64, zIndex: 50,
      }}>
        <div className="container" style={{
          display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          <button onClick={() => setActivo('todos')} style={{
            flexShrink: 0, padding: '7px 16px', borderRadius: 50,
            border: `2px solid ${activo === 'todos' ? 'var(--primary)' : 'var(--border)'}`,
            fontSize: '0.82rem', fontWeight: 500,
            background: activo === 'todos' ? 'var(--primary)' : 'var(--surface)',
            color: activo === 'todos' ? '#fff' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>
            <i className="fas fa-th-large"></i> Todos
          </button>
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => setActivo(cat.id)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 50,
              border: `2px solid ${activo === cat.id ? 'var(--primary)' : 'var(--border)'}`,
              fontSize: '0.82rem', fontWeight: 500,
              background: activo === cat.id ? 'var(--primary)' : 'var(--surface)',
              color: activo === cat.id ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <i className={cat.icono}></i> {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }} className="main-layout">
        {/* List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700 }}>
              {activo === 'todos' ? 'Todos los negocios' : categorias.find(c => c.id === activo)?.nombre || 'Negocios'}
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtrados.length} resultados</span>
          </div>

          {filtrados.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px', background: 'var(--surface)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
            }}>
              <i className="fas fa-store" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: 12 }}></i>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
                Aún no hay negocios registrados en {munNombre}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                Sé el primero en registrar un negocio en este municipio.
              </p>
              <Link href="/registro" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--primary)', color: '#fff', padding: '10px 24px',
                borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.9rem',
              }}>
                <i className="fas fa-plus"></i> Registrar negocio
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtrados.map(negocio => (
                <BusinessCard key={negocio.id} negocio={negocio} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topPicks.length > 0 && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-star" style={{ color: 'var(--accent)' }}></i> Más visitados
              </h3>
              {topPicks.map(n => (
                <Link key={n.id} href={`/negocio/${n.id}`} style={{
                  display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 10,
                    background: n.fotos?.[0] ? `url(${n.fotos[0]}) center/cover` : 'var(--muted)',
                    flexShrink: 0,
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{n.nombre}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{n.categoria}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-info-circle" style={{ color: 'var(--primary)' }}></i> Información
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {munNombre} es un municipio del departamento de {deptNombre}, Colombia. Encuentra aquí todos los negocios y servicios locales disponibles para tu visita.
            </p>
          </div>
        </aside>
      </div>

      {/* Create Municipality CTA */}
      <div className="container" style={{ paddingBottom: 40 }}>
        <div style={{
          background: 'var(--primary-bg)', border: '2px dashed var(--primary)',
          borderRadius: 'var(--radius)', padding: 28, textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
            ¿No encuentras tu municipio?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Puedes crearlo y empezar a registrar negocios de tu zona. Es rápido y gratuito.
          </p>
          <Link href="/registro" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--primary)', color: '#fff', padding: '10px 24px',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.88rem',
          }}>
            <i className="fas fa-plus-circle"></i> Crear nuevo municipio
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
