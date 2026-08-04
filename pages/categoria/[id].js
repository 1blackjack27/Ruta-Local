import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import categorias from '../../data/categorias'
import { getNegocios, getNegociosByCategoria } from '../../lib/storage'
import { getPlanInfo } from '../../lib/planes'
import { SITE_NAME } from '../../lib/constants'
import BusinessCard from '../../components/BusinessCard'

export default function CategoriaPage() {
  const router = useRouter()
  const { id: catId } = router.query
  const [negocios, setNegocios] = useState([])
  const [cuentasPorMunicipio, setCuentasPorMunicipio] = useState({})

  const categoria = categorias.find(c => c.id === catId)
  const validos = negocios.filter(n => !getPlanInfo(n).debeBorrar)

  useEffect(() => {
    if (!catId) return
    async function cargar() {
      let data
      try {
        data = await getNegociosByCategoria(catId)
      } catch (e) {
        data = []
      }
      if (!data || data.length === 0) {
        const todos = (await getNegocios()) || []
        data = todos.filter(n => n.categoria === catId)
      }
      setNegocios(data.filter(n => n.categoria === decodeURIComponent(String(catId))))
      setCuentasPorMunicipio({})
    }
    cargar()
  }, [catId])

  useEffect(() => {
    async function contar() {
      const cuenta = {}
      for (const n of validos) {
        cuenta[n.municipio] = (cuenta[n.municipio] || 0) + 1
      }
      setCuentasPorMunicipio(cuenta)
    }
    contar()
  }, [negocios])

  if (!catId || !categoria) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'var(--font-body)' }}>
        <h2>Categoría no encontrada</h2>
        <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Volver al inicio</Link>
      </div>
    )
  }

  const municipios = [...new Set(validos.map(n => n.municipio))].sort()

  return (
    <>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #094F3A, #1A8C6A)`,
        padding: '40px 20px 32px', color: '#fff',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ opacity: 0.85, fontSize: '0.8rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <i className="fas fa-th-large"></i> {SITE_NAME} · Categoría
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.2rem)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 44, height: 44, borderRadius: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                background: categoria.gradiente, color: '#fff', flexShrink: 0,
              }}>
                <i className={categoria.icono}></i>
              </span>
              {categoria.nombre}
            </h1>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>
              {validos.length} negocio{validos.length === 1 ? '' : 's'} en todo el país
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

      {/* Content */}
      <div className="container" style={{ padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }} className="cat-layout">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700 }}>
              Todos los negocios de {categoria.nombre}
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{validos.length} resultados</span>
          </div>

          {validos.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px', background: 'var(--surface)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
            }}>
              <i className={categoria.icono} style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: 12 }}></i>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
                Aún no hay negocios registrados en {categoria.nombre}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                Sé el primero en registrar un negocio de esta categoría.
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
              {validos.map(n => (
                <BusinessCard key={n.id} negocio={n} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {municipios.length > 0 && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)' }}></i> Municipios
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {municipios.map(m => (
                  <Link key={m} href={`/municipio/${encodeURIComponent(validos.find(n => n.municipio === m)?.departamento || '')}/${encodeURIComponent(m)}`} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.85rem', textDecoration: 'none', color: 'inherit',
                    padding: '6px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span>{m}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cuentasPorMunicipio[m] || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-info-circle" style={{ color: 'var(--primary)' }}></i> ¿Tienes este negocio?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
              Registra tu negocio de {categoria.nombre} y muéstralo a clientes de todo el país. Prueba gratis por 10 días.
            </p>
            <Link href="/registro" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--primary)', color: '#fff', padding: '10px 20px',
              borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem',
            }}>
              <i className="fas fa-plus-circle"></i> Registrar
            </Link>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .cat-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}