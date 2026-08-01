import { SITE_NAME } from './constants'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = process.env.RESEND_FROM || 'Ruta Local <onboarding@resend.dev>'

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

export async function enviarCorreo({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log(`[correo][sin-key] A ${to}: ${subject}`)
    return { ok: true, enviado: false, motivo: 'sin-llave' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[correo][error]', err)
      return { ok: false, enviado: false, error: err }
    }
    return { ok: true, enviado: true }
  } catch (e) {
    console.error('[correo][error]', e.message)
    return { ok: false, enviado: false, error: e.message }
  }
}

export function getEnlacePago(negocioId) {
  return `${getBaseUrl()}/pagar/${negocioId}`
}

export function plantillaCorreo({ titulo, mensaje, enlace, enlaceTexto = 'Pagar ahora', botonColor = '#0D6B4E' }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1A1A2E;">
    <div style="border-bottom: 3px solid #0D6B4E; padding-bottom: 16px; margin-bottom: 20px;">
      <span style="font-size: 22px; font-weight: 800; color: #0D6B4E;">${SITE_NAME}</span>
    </div>
    <h2 style="font-size: 18px; margin: 0 0 12px;">${titulo}</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #374151;">${mensaje}</p>
    <div style="margin: 24px 0; text-align: center;">
      <a href="${enlace}" style="display: inline-block; background: ${botonColor}; color: #ffffff; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700;">${enlaceTexto}</a>
    </div>
    <p style="font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 14px; margin-top: 24px;">
      Este correo fue enviado automáticamente por ${SITE_NAME}. Si no deseas recibirlo o tienes dudas, responde este correo.
    </p>
  </div>
  `
}
