export const SITE_NAME = 'Ruta Local'
export const SITE_DESC = 'Descubre los negocios de cada municipio de Colombia'
export const PAIS = 'Colombia'
export const CODIGO_PROMO = 'MI-RUTA'
export const DIAS_PRUEBA = 10
export const DIAS_GRACIA = 5
export const DIAS_BORRADO = 15

export const COLORS = {
  primary: '#0D6B4E',
  primaryLight: '#1A8C6A',
  primaryDark: '#094F3A',
  primaryBg: '#E8F5F1',
  secondary: '#E8632E',
  secondaryLight: '#F07D4A',
  accent: '#F5A623',
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  muted: '#F3F4F6',
  success: '#10B981',
  error: '#EF4444',
}

export function formatMoney(n) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
