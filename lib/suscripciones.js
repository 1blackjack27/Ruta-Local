import { SITE_NAME } from './constants.js'

export const SUBSCRIPTION_DIAS = 30
export const DIAS_AVISO_PREVIO = 5
export const DIAS_GRACIA = 10

export function getSubscriptionEnd(negocio) {
  if (!negocio.subscriptionStart) return null
  const start = new Date(negocio.subscriptionStart)
  start.setDate(start.getDate() + SUBSCRIPTION_DIAS)
  return start
}

export function getDiasParaVencer(negocio, ahora = new Date()) {
  const fin = getSubscriptionEnd(negocio)
  if (!fin) return null
  return Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24))
}

export function getDiasEnGracia(negocio, ahora = new Date()) {
  const fin = getSubscriptionEnd(negocio)
  if (!fin) return 0
  const dif = ahora - fin
  if (dif <= 0) return 0
  return Math.floor(dif / (1000 * 60 * 60 * 24)) + 1
}

export function getEstadoSuscripcion(negocio, ahora = new Date()) {
  if (!negocio || (negocio.plan !== 'premium' && negocio.plan !== 'plus')) {
    return 'sin-suscripcion'
  }
  if (!negocio.subscriptionStart) return 'pendiente-activacion'

  const diasParaVencer = getDiasParaVencer(negocio, ahora)
  if (diasParaVencer === null) return 'sin-suscripcion'

  if (diasParaVencer > 0) {
    return diasParaVencer <= DIAS_AVISO_PREVIO ? 'por-vencer' : 'activa'
  }

  const diasGracia = getDiasEnGracia(negocio, ahora)
  if (diasGracia <= DIAS_GRACIA) return 'gracia'
  return 'por-eliminar'
}

export function getRecordatorioPrueba(negocio, ahora = new Date()) {
  if (negocio.plan && negocio.plan !== 'free') return null
  if (!negocio.createdAt) return null

  const hoy = ahora.toISOString().slice(0, 10)
  if (negocio.lastReminderDate === hoy) return null

  const creado = new Date(negocio.createdAt)
  const diasTranscurridos = Math.floor((ahora - creado) / (1000 * 60 * 60 * 24))
  const diasRestantes = Math.max(0, 10 - diasTranscurridos)

  if (diasTranscurridos >= 7 && diasTranscurridos <= 8) {
    return {
      tipo: 'prueba-vence',
      dias: diasRestantes,
      asunto: `¡Tus días de prueba en ${SITE_NAME} se están terminando!`,
      mensaje: `Quedan solo ${diasRestantes} día${diasRestantes === 1 ? '' : 's'} de prueba gratuita. Actualiza tu plan para seguir disfrutando de todos los servicios: WhatsApp, mapa, horarios, fotos y más.`,
    }
  }

  if (diasTranscurridos === 9) {
    return {
      tipo: 'prueba-ultimo-dia',
      dias: 1,
      asunto: `⚠️ ${SITE_NAME}: ¡Último día de prueba!`,
      mensaje: 'Mañana tu negocio cambiará a información limitada (solo nombre y municipio). Activa un plan Premium hoy para mantener toda tu información visible.',
    }
  }

  if (diasTranscurridos >= 11 && diasTranscurridos <= 14) {
    return {
      tipo: 'gracia-prueba',
      dias: 15 - diasTranscurridos,
      asunto: `${SITE_NAME}: tu negocio está ocultando información`,
      mensaje: `Tu período de prueba terminó. Solo se muestra nombre y municipio. Quedan ${15 - diasTranscurridos} día${(15 - diasTranscurridos) === 1 ? '' : 's'} antes de eliminar tu negocio. Activa un plan para recuperarlo.`,
    }
  }

  if (diasTranscurridos === 14) {
    return {
      tipo: 'prueba-eliminacion',
      dias: 1,
      asunto: `⚠️ ${SITE_NAME}: tu negocio será eliminado mañana`,
      mensaje: 'Tu negocio será eliminado mañana si no activas un plan. Haz clic ahora para mantenerlo visible.',
    }
  }

  return null
}

export function getTipoRecordatorioHoy(negocio, ahora = new Date()) {
  const estado = getEstadoSuscripcion(negocio, ahora)
  const hoy = ahora.toISOString().slice(0, 10)
  if (negocio.lastReminderDate === hoy) return null

  if (estado === 'por-vencer') {
    const dias = getDiasParaVencer(negocio, ahora)
    return {
      tipo: 'por-vencer',
      dias,
      asunto: `Tu suscripción en ${SITE_NAME} vence en ${dias} día${dias === 1 ? '' : 's'}`,
      mensaje: `Tu suscripción vence en ${dias} día${dias === 1 ? '' : 's'}. Renueva hoy para no perder tu negocio.`,
    }
  }

  if (estado === 'gracia') {
    const diasGracia = getDiasEnGracia(negocio, ahora)
    if (diasGracia >= DIAS_GRACIA) {
      return {
        tipo: 'aviso-final',
        dias: diasGracia,
        asunto: `⚠️ ${SITE_NAME}: tu negocio será eliminado mañana`,
        mensaje: 'Tu negocio será eliminado mañana si no renuevas tu suscripción. Haz el pago hoy para mantenerlo.',
      }
    }
    return {
      tipo: 'gracia',
      dias: diasGracia,
      asunto: `${SITE_NAME}: renueva tu suscripción, quedan pocos días`,
      mensaje: `Llevas ${diasGracia} de ${DIAS_GRACIA} días de gracia. Renueva hoy para evitar la eliminación de tu negocio.`,
    }
  }

  return null
}
