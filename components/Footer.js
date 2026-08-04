import Link from 'next/link'
import { SITE_NAME } from '../lib/constants'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--text)', color: 'rgba(255,255,255,0.7)',
      padding: '48px 0 24px', marginTop: 60,
    }}>
      <div className="container">
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32,
        }} className="f-grid">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: 8 }}>
              <i className="fas fa-map-marked-alt"></i> {SITE_NAME}
            </h3>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
              Conectamos viajeros con los mejores negocios locales de cada municipio de Colombia. Descubre, explora y apoya el comercio local.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Explorar</h4>
            <Link href="/" className="footer-link">Inicio</Link>
            <Link href="/planes" className="footer-link">Planes</Link>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Para negocios</h4>
            <Link href="/registro" className="footer-link">Registrar negocio</Link>
            <Link href="/dashboard" className="footer-link">Panel de control</Link>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Legal</h4>
            <a href="#" className="footer-link">Términos</a>
            <a href="#" className="footer-link">Privacidad</a>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 32, paddingTop: 20,
          textAlign: 'center', fontSize: '0.8rem',
        }}>
          © {new Date().getFullYear()} {SITE_NAME}. Hecho en Colombia con ♥ para los municipios del país.
        </div>
      </div>
      <style jsx>{`
        .footer-link { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.85rem; margin-bottom: 8px; display: block; }
        .footer-link:hover { color: #ffffff; }
        @media (max-width: 768px) {
          .f-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  )
}
