import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getNegocioById } from '../../lib/storage'
import { getPlanInfo } from '../../lib/planes'
import { getEstadoSuscripcion, getDiasParaVencer, getDiasEnGracia } from '../../lib/suscripciones'
import { SITE_NAME, formatMoney } from '../../lib/constants'

export default function PagarPage() {
  const router = useRouter()
  const { id } = router.query

  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
      setLoading(false)
    }
    cargar()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text-secondary)' }}>
        Cargando...
      </div>
    )
  }

  if (error || !negocio) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Negocio no encontrado</h1>
        <p style={{ color: 'var(--text-secondary)' }}>El negocio no existe o ya fue eliminado.</p>
        <Link href="/" style={{ color: 'var(--primary)', fontWeight: 700 }}>Volver al inicio</Link>
      </div>
    )
  }

  const plan = getPlanInfo(negocio)
  const estado = getEstadoSuscripcion(negocio)
  const diasVencer = getDiasParaVencer(negocio)
  const diasGracia = getDiasEnGracia(negocio)
  const precio = negocio.plan === 'plus' ? 69900 : 19900
  const nombrePlan = negocio.plan === 'plus' ? 'Premium Plus' : 'Premium'

  const estadoInfo = {
    activa: { label: 'Suscripción activa', color: '#166534', bg: '#DCFCE7', icono: 'fa-circle-check' },
    'por-vencer': { label: `Vence en ${diasVencer} día${diasVencer === 1 ? '' : 's'}`, color: '#B45309', bg: '#FEF3C7', icono: 'fa-clock' },
    gracia: { label: `En período de gracia · día ${diasGracia} de 10`, color: '#B91C1C', bg: '#FEE2E2', icono: 'fa-triangle-exclamation' },
    'por-eliminar': { label: 'Será eliminado', color: '#991B1B', bg: '#FEE2E2', icono: 'fa-ban' },
    'pendiente-activacion': { label: 'Pendiente de activación', color: '#374151', bg: '#F3F4F6', icono: 'fa-hourglass-half' },
    'sin-suscripcion': { label: 'Sin suscripción activa', color: '#374151', bg: '#F3F4F6', icono: 'fa-hourglass-half' },
  }[estado] || { label: estado, color: '#374151', bg: '#F3F4F6', icono: 'fa-info-circle' }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
          Renueva tu suscripción
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {SITE_NAME} · {negocio.nombre}
        </p>
      </div>

      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        padding: '28px 32px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
            Plan {nombrePlan}
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatMoney(precio)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mes</span>
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: estadoInfo.bg, color: estadoInfo.color,
          padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20,
          fontSize: '0.88rem', fontWeight: 600,
        }}>
          <i className={`fas ${estadoInfo.icono}`}></i>
          {estadoInfo.label}
        </div>

        <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <li style={{ padding: '6px 0' }}>
            <i className="fas fa-check" style={{ color: 'var(--success)', marginRight: 8 }}></i>
            Tu negocio sigue visible con toda la información
          </li>
          <li style={{ padding: '6px 0' }}>
            <i className="fas fa-check" style={{ color: 'var(--success)', marginRight: 8 }}></i>
            Botón de WhatsApp, ubicación, horarios y redes sociales
          </li>
          <li style={{ padding: '6px 0' }}>
            <i className="fas fa-check" style={{ color: 'var(--success)', marginRight: 8 }}></i>
            Estadísticas de visitas y clics
          </li>
        </ul>

        <div style={{ textAlign: 'center' }}>
          <button disabled style={{
            width: '100%', padding: '15px', borderRadius: 'var(--radius-sm)',
            background: 'var(--border)', color: 'var(--text-muted)',
            border: 'none', fontSize: '0.95rem', fontWeight: 700, cursor: 'not-allowed',
          }}>
            <i className="fas fa-lock" style={{ marginRight: 8 }}></i>
            Pago habilitado próximamente (Wompi)
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
            Estamos conectando nuestra pasarela de pagos. Mientras tanto, si necesitas renovar,
            escríbenos y te ayudamos.
          </p>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <Link href={`/negocio/${negocio.id}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Volver a mi negocio
        </Link>
      </p>
    </div>
  )
}
