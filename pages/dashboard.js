import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getNegocios, guardarNegocio, eliminarNegocio } from '../lib/storage'
import { getPlanInfo, necesitaBorrado, puedeTenerMasNegocios } from '../lib/planes'
import { SITE_NAME, CODIGO_PROMO, DIAS_PRUEBA, DIAS_GRACIA, formatMoney } from '../lib/constants'
import { useRouter } from 'next/router'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setAuthReady(true)
      setLoading(false)
      return
    }
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!authReady || !user) {
      setLoading(false)
      return
    }
    async function cargar() {
      const data = await getNegocios()
      const propios = (data || []).filter(n => n.ownerId === user.uid || n.ownerEmail === user.email)
      setNegocios(propios)
      setLoading(false)
    }
    cargar()
  }, [authReady, user])

  const handleLogout = async () => {
    if (!auth) return
    await signOut(auth)
    router.push('/')
  }

  const stats = {
    total: negocios.length,
    vistas: negocios.reduce((acc, n) => acc + (n.views || 0), 0),
    whatsapp: negocios.reduce((acc, n) => acc + (n.whatsappClicks || 0), 0),
    diasMinimos: negocios.length > 0
      ? Math.min(...negocios.map(n => {
          const creado = new Date(n.fechaCreacion || n.createdAt || Date.now())
          return Math.floor((Date.now() - creado) / (1000 * 60 * 60 * 24))
        }))
      : 0
  }

  const handleEliminar = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      await eliminarNegocio(id)
      setNegocios(prev => prev.filter(n => n.id !== id))
    }
  }

  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: 'var(--text)',
    backgroundColor: 'transparent',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1
  }

  const headerStyle = {
    marginBottom: 32
  }

  const greetingStyle = {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--text)'
  }

  const subtitleStyle = {
    fontSize: 16,
    color: 'var(--text-secondary)',
    margin: '0 0 24px 0'
  }

  const headerActionsStyle = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  }

  const btnPrimaryStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 24px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity .2s'
  }

  const btnSecondaryStyle = {
    ...btnPrimaryStyle,
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '2px solid var(--accent)'
  }

  const promoStyle = {
    background: 'linear-gradient(135deg, var(--accent-bg), var(--secondary-bg))',
    border: '2px dashed var(--accent)',
    borderRadius: 16,
    padding: '28px 32px',
    marginBottom: 32,
    position: 'relative'
  }

  const promoHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  }

  const promoTituloStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--accent)',
    margin: 0
  }

  const promoDescStyle = {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    margin: '0 0 12px 0'
  }

  const codigoBoxStyle = {
    display: 'inline-block',
    padding: '8px 20px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 10
  }

  const promoSmallStyle = {
    fontSize: 12,
    color: 'var(--text-muted)',
    margin: '8px 0 0 0',
    fontStyle: 'italic'
  }

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 40
  }

  const statCardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 12,
    padding: '20px 24px',
    border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)'
  }

  const statIconStyle = {
    fontSize: 28,
    marginBottom: 8
  }

  const statNumberStyle = {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--accent)',
    margin: '0 0 4px 0'
  }

  const statLabelStyle = {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0
  }

  const sectionTitleStyle = {
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 20px 0',
    color: 'var(--text)'
  }

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 12,
    border: '1px solid var(--border)',
    marginBottom: 40
  }

  const emptyIconStyle = {
    fontSize: 48,
    marginBottom: 16
  }

  const emptyTextStyle = {
    fontSize: 18,
    color: 'var(--text-secondary)',
    margin: '0 0 6px 0'
  }

  const emptySubStyle = {
    fontSize: 14,
    color: 'var(--text-muted)',
    margin: '0 0 24px 0'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    marginBottom: 40
  }

  const thStyle = {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'var(--text-secondary)',
    borderBottom: '2px solid var(--border)',
    backgroundColor: 'var(--card-bg)'
  }

  const tdStyle = {
    padding: '14px 16px',
    fontSize: 14,
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle'
  }

  const photoStyle = {
    width: 44,
    height: 44,
    borderRadius: 8,
    objectFit: 'cover',
    backgroundColor: 'var(--border)'
  }

  const badgeBase = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600
  }

  const badgePrueba = { ...badgeBase, backgroundColor: '#d4edda', color: '#155724' }
  const badgeGratis = { ...badgeBase, backgroundColor: '#e2e3e5', color: '#383d41' }
  const badgePremium = { ...badgeBase, backgroundColor: '#fff3cd', color: '#856404' }
  const badgePremiumPlus = { ...badgeBase, backgroundColor: '#d1c4e9', color: '#4a148c' }

  const planBadge = (plan) => {
    if (plan === 'premium_plus') return <span style={badgePremiumPlus}>Premium Plus</span>
    if (plan === 'premium') return <span style={badgePremium}>Premium</span>
    return null
  }

  const actionBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    border: '1px solid var(--border)',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all .2s'
  }

  const actionDangerStyle = {
    ...actionBtnStyle,
    color: '#dc3545',
    borderColor: '#dc3545'
  }

  const planInfoCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    padding: '14px 16px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: 10,
    border: '1px solid var(--border)',
    marginBottom: 8
  }

  const planInfoTextStyle = {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0,
    flex: 1
  }

  const upgradeBtnStyle = {
    padding: '8px 18px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    flexShrink: 0
  }

  const tipsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
    marginBottom: 40
  }

  const tipCardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 12,
    padding: 24,
    border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,.04)'
  }

  const tipTitleStyle = {
    fontSize: 16,
    fontWeight: 600,
    margin: '0 0 6px 0',
    color: 'var(--text)'
  }

  const tipDescStyle = {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.5
  }

  const footerStyle = {
    textAlign: 'center',
    padding: '24px 0',
    fontSize: 13,
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border)',
    marginTop: 16
  }

  const mobileCardStyle = {
    backgroundColor: 'var(--card-bg)',
    borderRadius: 12,
    padding: 16,
    border: '1px solid var(--border)',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  }

  const mobileRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  }

  const mobileActionsStyle = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  }

  const renderPlanInfo = (negocio) => {
    const plan = getPlanInfo ? getPlanInfo(negocio) : { enPrueba: false, esGratis: true, diasRestantes: 0, plan: 'gratis' }
    const debeBorrar = necesitaBorrado ? necesitaBorrado(negocio) : false

    let texto = ''
    let accion = null

    if (plan.enPrueba) {
      texto = `Quedan ${plan.diasRestantesPrueba || 0} días de prueba gratuita con información completa`
    } else if (plan.enGracia) {
      texto = `La prueba terminó. Solo se muestra nombre y municipio. Quedan ${plan.diasRestantesGracia || 0} días antes de eliminar tu negocio. Activa un plan para mantenerlo completo.`
    } else if (plan.esGratis || plan.plan === 'gratis') {
      if (debeBorrar) {
        texto = 'Este negocio será eliminado. Activa un plan para mantenerlo.'
      } else {
        texto = `Período de prueba terminado. Solo se muestra nombre y foto. ${Math.max(0, plan.diasRestantes || 0)} días antes de eliminar.`
      }
    }

    if (plan.plan !== 'premium' && plan.plan !== 'premium_plus') {
      accion = (
        <Link href="/planes" style={upgradeBtnStyle}>
          Actualizar a Premium
        </Link>
      )
    }

    if (!texto && !accion) return null

    return (
      <div style={planInfoCardStyle}>
        <p style={planInfoTextStyle}>{texto}</p>
        {accion}
      </div>
    )
  }

  const renderPlanBadge = (negocio) => {
    const plan = getPlanInfo ? getPlanInfo(negocio) : { enPrueba: false, esGratis: true, diasRestantes: 0, plan: 'gratis' }

    if (plan.plan === 'premium_plus') return <span style={badgePremiumPlus}>Premium Plus</span>
    if (plan.plan === 'premium') return <span style={badgePremium}>Premium</span>
    if (plan.enPrueba) return <span style={badgePrueba}>Prueba {plan.diasRestantesPrueba || 0}d</span>
    return <span style={badgeGratis}>Gratuito - info limitada</span>
  }

  const renderDiasRestantes = (negocio) => {
    const plan = getPlanInfo ? getPlanInfo(negocio) : null
    if (!plan) return '-'
    if (plan.plan === 'premium' || plan.plan === 'premium_plus') {
      return plan.diasParaVencer > 0 ? `${plan.diasParaVencer} días` : 'Vencida'
    }
    if (plan.enPrueba) {
      return `${plan.diasRestantesPrueba} días de prueba`
    }
    if (plan.enGracia) {
      return `${plan.diasRestantesGracia} días de gracia`
    }
    return `${plan.diasRestantes} días para eliminar`
  }

  const renderFoto = (n) => {
    const url = n.fotos && n.fotos[0] ? n.fotos[0] : null
    if (!url) {
      return (
        <div style={{
          ...photoStyle, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--primary-bg)', color: 'var(--primary)',
          fontSize: 18
        }}>
          <i className="fas fa-store"></i>
        </div>
      )
    }
    return <img src={url} alt={n.nombre} style={photoStyle} />
  }

  const renderDesktopTable = () => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Foto</th>
          <th style={thStyle}>Nombre / Categoría</th>
          <th style={thStyle}>Plan</th>
          <th style={thStyle}>Días restantes</th>
          <th style={thStyle}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {negocios.map(n => (
          <tr key={n.id}>
            <td style={tdStyle}>
              {renderFoto(n)}
            </td>
            <td style={tdStyle}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{n.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.categoria || 'Sin categoría'}</div>
            </td>
            <td style={tdStyle}>{renderPlanBadge(n)}</td>
            <td style={tdStyle}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {renderDiasRestantes(n)}
              </span>
            </td>
            <td style={tdStyle}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Link href={`/negocio/${n.id}`} style={actionBtnStyle}>Ver</Link>
                <Link href={`/registro?id=${n.id}`} style={actionBtnStyle}>Editar</Link>
                <button
                  style={actionDangerStyle}
                  onClick={() => handleEliminar(n.id, n.nombre)}
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const renderMobileCards = () => (
    <div style={{ marginBottom: 40 }}>
      {negocios.map(n => (
        <div key={n.id} style={mobileCardStyle}>
          <div style={mobileRowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {renderFoto(n)}
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{n.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.categoria || 'Sin categoría'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {renderDiasRestantes(n)}
                </div>
              </div>
            </div>
            {renderPlanBadge(n)}
          </div>
          <div style={mobileActionsStyle}>
            <Link href={`/negocio/${n.id}`} style={actionBtnStyle}>Ver</Link>
            <Link href={`/registro?id=${n.id}`} style={actionBtnStyle}>Editar</Link>
            <button
              style={actionDangerStyle}
              onClick={() => handleEliminar(n.id, n.nombre)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <>
        <div style={containerStyle}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>
            Cargando panel...
          </p>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <div style={{ ...containerStyle, maxWidth: 520 }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '40px 32px', textAlign: 'center', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--primary-bg)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '2rem',
            }}>
              <i className="fas fa-user-lock"></i>
            </div>
            <h1 style={greetingStyle}>Inicia sesión para ver tu panel</h1>
            <p style={subtitleStyle}>
              Aquí podrás ver y gestionar tus negocios registrados.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={btnPrimaryStyle}>
                <i className="fas fa-sign-in-alt" style={{ marginRight: 6 }}></i>
                Iniciar sesión
              </Link>
              <Link href="/registro" style={btnSecondaryStyle}>
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={containerStyle}>
        <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={greetingStyle}>¡Hola, bienvenido a tu panel!</h1>
            <p style={{ ...subtitleStyle, marginBottom: 0 }}>
              Panel de control · Administra tus negocios locales
            </p>
          </div>
          <button onClick={handleLogout} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}>
            <i className="fas fa-sign-out-alt"></i>
            Cerrar sesión ({user.email})
          </button>
        </div>
        <div style={{ ...headerActionsStyle, marginTop: 24 }}>
          <Link href="/registro" style={btnPrimaryStyle}>
            + Nuevo negocio
          </Link>
          <Link href="/planes" style={btnSecondaryStyle}>
            Ver planes
          </Link>
        </div>
      </div>

      <div style={promoStyle}>
        <div style={promoHeaderStyle}>
          <span style={{ fontSize: 28 }}>🎁</span>
          <h2 style={promoTituloStyle}>¡10 días gratis con toda la información visible!</h2>
        </div>
        <p style={promoDescStyle}>
          Usa el código <strong>{CODIGO_PROMO}</strong> al registrarte y disfruta de{' '}
          <strong>{DIAS_PRUEBA}</strong> días completos. Después de este período, tu negocio
          mostrará solo el nombre y el municipio durante {DIAS_GRACIA} días de gracia hasta que actives un plan.
        </p>
        <div style={codigoBoxStyle}>{CODIGO_PROMO}</div>
        <p style={promoSmallTextStyle}>
          Si no activas un plan, el negocio será eliminado automáticamente el día {DIAS_PRUEBA + DIAS_GRACIA + 1}.
        </p>
      </div>

      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle}>📋</div>
          <p style={statNumberStyle}>{stats.total}</p>
          <p style={statLabelStyle}>Negocios registrados</p>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>👁️</div>
          <p style={statNumberStyle}>{stats.vistas}</p>
          <p style={statLabelStyle}>Vistas totales</p>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>💬</div>
          <p style={statNumberStyle}>{stats.whatsapp}</p>
          <p style={statLabelStyle}>Contactos WhatsApp</p>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>📅</div>
          <p style={statNumberStyle}>{stats.diasMinimos}</p>
          <p style={statLabelStyle}>Días en plataforma</p>
        </div>
      </div>

      <h2 style={sectionTitleStyle}>Mis Negocios</h2>

      {negocios.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>🏪</div>
          <p style={emptyTextStyle}>Aún no has registrado ningún negocio</p>
          <p style={emptySubStyle}>Comienza añadiendo tu primer negocio local</p>
          <Link href="/registro" style={btnPrimaryStyle}>
            + Registrar negocio
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
            {renderDesktopTable()}
          </div>
          <div>
            {renderMobileCards()}
          </div>

          <h2 style={{ ...sectionTitleStyle, marginTop: 8 }}>Información del Plan</h2>
          {negocios.map(n => (
            <div key={`plan-${n.id}`}>
              {renderPlanInfo(n)}
            </div>
          ))}
        </>
      )}

      <h2 style={sectionTitleStyle}>Consejos para atraer más clientes</h2>
      <div style={tipsGridStyle}>
        <div style={tipCardStyle}>
          <p style={tipTitleStyle}>📸 Añade fotos de calidad</p>
          <p style={tipDescStyle}>Los negocios con fotos reciben más visitas</p>
        </div>
        <div style={tipCardStyle}>
          <p style={tipTitleStyle}>📝 Completa toda la información</p>
          <p style={tipDescStyle}>Negocios con descripción y servicios tienen mejor rendimiento</p>
        </div>
        <div style={tipCardStyle}>
          <p style={tipTitleStyle}>🔗 Comparte tu perfil</p>
          <p style={tipDescStyle}>Comparte el enlace de tu negocio en redes sociales</p>
        </div>
      </div>

      <div style={footerStyle}>
        © 2026 {SITE_NAME} · Hecho en Colombia
      </div>
      </div>
    </>
  )
}

const promoSmallTextStyle = {
  fontSize: 12,
  color: 'var(--text-muted)',
  margin: '8px 0 0 0',
  fontStyle: 'italic'
}
