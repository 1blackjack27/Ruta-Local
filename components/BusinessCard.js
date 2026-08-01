import Link from 'next/link'
import { getPlanInfo } from '../lib/planes'

export default function BusinessCard({ negocio }) {
  const plan = getPlanInfo(negocio)
  if (plan.debeBorrar) return null

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      overflow: 'hidden', display: 'flex', gap: 0,
      boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <Link href={`/negocio/${negocio.id}`} style={{ display: 'flex', width: '100%', textDecoration: 'none', color: 'inherit', flexDirection: 'row' }} className="biz-card-link">
        <div style={{
          width: 200, minHeight: 170, backgroundSize: 'cover', backgroundPosition: 'center',
          flexShrink: 0, position: 'relative',
          backgroundImage: negocio.fotos?.length
            ? `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${negocio.fotos[0]})`
            : 'linear-gradient(135deg, var(--muted), var(--border))',
        }}>
          {(negocio.plan === 'premium' || negocio.plan === 'plus') && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: 'var(--accent)', color: '#1A1A2E',
              fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50,
            }}>
              <i className="fas fa-crown"></i> Destacado
            </span>
          )}
          {plan.enPrueba && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'var(--primary)', color: '#fff',
              fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 50,
            }}>
              Prueba {plan.diasRestantesPrueba}d
            </span>
          )}
        </div>
        <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {negocio.categoria || 'Sin categoría'}
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '2px 0' }}>
            {negocio.nombre}
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <i className="fas fa-location-dot" style={{ color: 'var(--primary)', marginRight: 4 }}></i>
            {negocio.municipio}, {negocio.departamento}
          </span>

          {plan.mostrarServicios && negocio.servicios?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {negocio.servicios.slice(0, 3).map((s, i) => (
                <span key={i} style={{
                  fontSize: '0.68rem', background: 'var(--muted)', color: 'var(--text-secondary)',
                  padding: '2px 10px', borderRadius: 50, fontWeight: 500,
                }}>{s}</span>
              ))}
              {negocio.servicios.length > 3 && (
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{negocio.servicios.length - 3}</span>
              )}
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            {plan.mostrarWhatsapp && negocio.whatsapp && (
              <a href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                  background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            )}
            {plan.mostrarWhatsapp && negocio.telefono && (
              <a href={`tel:${negocio.telefono}`} onClick={e => e.stopPropagation()}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                  background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <i className="fas fa-phone"></i> Llamar
              </a>
            )}
          </div>
        </div>
      </Link>
      <style jsx>{`
        @media (max-width: 640px) {
          .biz-card-link { flex-direction: column !important; }
          .biz-card-link div:first-child { width: 100% !important; height: 160px; }
        }
      `}</style>
    </div>
  )
}
