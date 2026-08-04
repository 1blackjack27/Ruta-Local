import { useState } from 'react'
import Link from 'next/link'
import { formatMoney, CODIGO_PROMO, DIAS_PRUEBA, DIAS_GRACIA } from '../lib/constants'

export default function PlanesPage() {
  const [anual, setAnual] = useState(false)

  const planes = [
    {
      id: 'free',
      nombre: 'Gratuito',
      icono: 'fas fa-store',
      gradiente: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
      precio: 0,
      precioAnual: 0,
      descripcion: 'Perfecto para empezar y probar la plataforma',
      badge: null,
      caracteristicas: [
        { texto: '1 negocio registrado', incluido: true },
        { texto: 'Foto de portada', incluido: true },
        { texto: 'Nombre y categoría visibles', incluido: true },
        { texto: '10 días de prueba con info completa', incluido: true, destacado: true },
        { texto: 'Después de prueba: solo nombre + foto', incluido: true },
        { texto: 'WhatsApp y ubicación visibles', incluido: false },
        { texto: 'Servicios y horarios visibles', incluido: false },
        { texto: 'Estadísticas de visitas', incluido: false },
        { texto: 'Soporte', incluido: false },
      ],
      cta: 'Tu plan actual',
      color: 'secondary',
      popular: false,
    },
    {
      id: 'premium',
      nombre: 'Premium',
      icono: 'fas fa-crown',
      gradiente: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
      precio: 19900,
      precioAnual: 191000,
      descripcion: 'Destaca entre la competencia y atrae más clientes',
      badge: 'Más popular',
      caracteristicas: [
        { texto: '1 negocio registrado', incluido: true },
        { texto: 'Hasta 10 fotos por negocio', incluido: true },
        { texto: 'Badge "Destacado" visible', incluido: true, destacado: true },
        { texto: 'WhatsApp visible', incluido: true },
        { texto: 'Ubicación en Google Maps', incluido: true },
        { texto: 'Horario de atención visible', incluido: true },
        { texto: 'Servicios ofrecidos visibles', incluido: true },
        { texto: 'Redes sociales visibles', incluido: true },
        { texto: 'Estadísticas de vistas y contactos', incluido: true },
        { texto: 'Soporte prioritario', incluido: true },
      ],
      cta: 'Elegir Premium',
      color: 'primary',
      popular: true,
    },
    {
      id: 'plus',
      nombre: 'Premium Plus',
      icono: 'fas fa-gem',
      gradiente: 'linear-gradient(135deg, var(--secondary), var(--secondary-light))',
      precio: 69900,
      precioAnual: 670000,
      descripcion: 'Para dueños de múltiples negocios y agencias locales',
      badge: null,
      caracteristicas: [
        { texto: 'Hasta 10 negocios', incluido: true, destacado: true },
        { texto: 'Hasta 10 fotos por negocio', incluido: true },
        { texto: 'Badge "Destacado" visible', incluido: true },
        { texto: 'WhatsApp visible', incluido: true },
        { texto: 'Ubicación en Google Maps', incluido: true },
        { texto: 'Horario de atención visible', incluido: true },
        { texto: 'Servicios ofrecidos visibles', incluido: true },
        { texto: 'Redes sociales visibles', incluido: true },
        { texto: 'Estadísticas de vistas y contactos', incluido: true },
        { texto: 'Soporte prioritario', incluido: true },
      ],
      cta: 'Elegir Premium Plus',
      color: 'primary',
      popular: false,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '48px 20px 12px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-bg)', color: '#B8860B',
          padding: '4px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, marginBottom: 16,
        }}>
          <i className="fas fa-rocket"></i> Lanzamiento · Precios especiales
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.2rem)',
          fontWeight: 800, marginBottom: 8,
        }}>
          Planes para tu negocio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
          Empieza gratis con {DIAS_PRUEBA} días de prueba y escala cuando estés listo
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0 40px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: anual ? 500 : 600, color: anual ? 'var(--text-secondary)' : 'var(--text)' }}>Mensual</span>
          <div onClick={() => setAnual(!anual)} style={{
            width: 48, height: 26, background: anual ? 'var(--primary)' : 'var(--border)',
            borderRadius: 50, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: anual ? 25 : 3, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}></div>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: anual ? 600 : 500, color: anual ? 'var(--text)' : 'var(--text-secondary)' }}>
            Anual <span style={{
              background: 'var(--secondary-bg)', color: 'var(--secondary)',
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: 50, marginLeft: 6,
            }}>Ahorra 20%</span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        }} className="plans-grid">
          {planes.map(plan => (
            <div key={plan.id} style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: 32, border: `2px solid ${plan.popular ? 'var(--primary)' : 'var(--border)'}`,
              position: 'relative', display: 'flex', flexDirection: 'column',
              boxShadow: plan.popular ? '0 0 0 1px var(--primary), var(--shadow-lg)' : 'var(--shadow-sm)',
              transition: 'all 0.3s',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#fff', fontSize: '0.7rem',
                  fontWeight: 700, padding: '4px 16px', borderRadius: 50,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: plan.gradiente, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.3rem', color: '#fff', marginBottom: 16,
              }}>
                <i className={plan.icono}></i>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>{plan.nombre}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>{plan.descripcion}</p>

              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                {plan.precio === 0 ? 'Gratis' : `${formatMoney(anual ? plan.precioAnual : plan.precio)}`}
                {plan.precio > 0 && (
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {' '}/ {anual ? 'año' : 'mes'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                {plan.precio === 0 ? 'Sin compromiso, sin tarjeta' : `${anual ? 'Facturado anualmente' : 'Cancela cuando quieras'}`}
              </p>

              {/* Features */}
              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.caracteristicas.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', fontSize: '0.85rem',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <i className={`fas ${c.incluido ? 'fa-check-circle' : 'fa-times-circle'}`}
                      style={{ color: c.incluido ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}></i>
                    <span style={{
                      fontWeight: c.destacado ? 600 : 400,
                      color: c.incluido ? 'var(--text)' : 'var(--text-muted)',
                    }}>
                      {c.texto}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {plan.id === 'free' ? (
                <div style={{
                  width: '100%', padding: 14, borderRadius: 'var(--radius-sm)',
                  textAlign: 'center', background: 'var(--muted)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: '0.9rem',
                }}>
                  {plan.cta}
                </div>
              ) : (
                <Link href="/registro" style={{
                  width: '100%', padding: 14, borderRadius: 'var(--radius-sm)',
                  textAlign: 'center', background: 'var(--primary)', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                  display: 'block', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.background = 'var(--primary-dark)'; e.target.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.target.style.background = 'var(--primary)'; e.target.style.transform = 'translateY(0)' }}
                >
                  <i className={plan.icono}></i> {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{
          background: 'var(--accent-bg)', border: '2px dashed var(--accent)',
          borderRadius: 'var(--radius)', padding: '28px 32px', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
            🎁 ¿Ya conoces Ruta Local?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 16px' }}>
            Los primeros {DIAS_PRUEBA} días son completamente gratis con toda la información visible. Usa el código promocional:
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: '#fff', padding: '12px 28px', borderRadius: 'var(--radius-sm)',
            border: '2px dashed var(--primary)', marginBottom: 12,
          }}>
            <i className="fas fa-ticket-alt" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem',
              letterSpacing: '0.1em', color: 'var(--primary)',
            }}>
              {CODIGO_PROMO}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Después de los {DIAS_PRUEBA} días, tu negocio mostrará solo el nombre y el municipio durante {DIAS_GRACIA} días de gracia.
            Si no activas un plan, el negocio será eliminado el día {DIAS_PRUEBA + DIAS_GRACIA + 1}.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="container" style={{ paddingBottom: 60, maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800,
          textAlign: 'center', marginBottom: 28,
        }}>
          Preguntas frecuentes
        </h2>
        {[
          { p: '¿Puedo empezar con el plan gratuito y luego actualizar?', r: 'Sí, puedes empezar gratis. Cuando estés listo, actualiza a Premium desde tu panel de control.' },
          { p: '¿Hay período de prueba para planes pagos?', r: `Sí, como en todos los planes, los primeros ${DIAS_PRUEBA} días son de prueba gratuita. Si no te convence, cancela sin costo.` },
          { p: '¿Qué pasa cuando terminan los 10 días gratis?', r: `Tu negocio seguirá visible en la plataforma, pero solo mostrará el nombre y el municipio durante ${DIAS_GRACIA} días de gracia. Para mostrar toda la información, activa un plan Premium.` },
          { p: '¿Cómo funciona la eliminación automática?', r: `Si después de ${DIAS_PRUEBA + DIAS_GRACIA} días desde el registro no has activado ningún plan pago, el negocio será eliminado automáticamente del sistema.` },
          { p: '¿Qué medios de pago aceptan?', r: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), Nequi, Daviplata y consignación bancaria.' },
        ].map((faq, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
            padding: '18px 24px', marginBottom: 10, boxShadow: 'var(--shadow-sm)',
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.p}
              <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.r}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
        }
      `}</style>
    </div>
  )
}
