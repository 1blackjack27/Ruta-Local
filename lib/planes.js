import { getEstadoSuscripcion, getDiasParaVencer } from './suscripciones'
import { DIAS_PRUEBA, DIAS_GRACIA } from './constants'

const PLANES = {
  FREE: {
    id: 'free',
    nombre: 'Gratuito',
    precio: 0,
    maxNegocios: 1,
    maxFotos: 1,
    diasPrueba: DIAS_PRUEBA,
    diasGracia: DIAS_GRACIA,
    caracteristicas: {
      whatsapp: false,
      ubicacion: false,
      horarios: false,
      servicios: false,
      redesSociales: false,
      estadisticas: false,
    }
  },
  PREMIUM: {
    id: 'premium',
    nombre: 'Premium',
    precio: 19900,
    maxNegocios: 1,
    maxFotos: 10,
    diasPrueba: 0,
    caracteristicas: {
      whatsapp: true,
      ubicacion: true,
      horarios: true,
      servicios: true,
      redesSociales: true,
      estadisticas: true,
    }
  },
  PLUS: {
    id: 'plus',
    nombre: 'Premium Plus',
    precio: 69900,
    maxNegocios: 10,
    maxFotos: 10,
    diasPrueba: 0,
    caracteristicas: {
      whatsapp: true,
      ubicacion: true,
      horarios: true,
      servicios: true,
      redesSociales: true,
      estadisticas: true,
    }
  }
}

export function getPlanInfo(negocio) {
  const ahora = new Date()
  const creado = new Date(negocio.createdAt)
  const diasTranscurridos = Math.floor((ahora - creado) / (1000 * 60 * 60 * 24))

  if (negocio.plan === 'free' || !negocio.plan) {
    const totalVida = DIAS_PRUEBA + DIAS_GRACIA
    const enPrueba = diasTranscurridos < DIAS_PRUEBA
    const enGracia = diasTranscurridos >= DIAS_PRUEBA && diasTranscurridos < totalVida
    const debeBorrar = diasTranscurridos >= totalVida

    return {
      plan: 'free',
      nombre: 'Gratuito',
      enPrueba,
      enGracia,
      debeBorrar,
      diasRestantesPrueba: Math.max(0, DIAS_PRUEBA - diasTranscurridos),
      diasRestantesGracia: Math.max(0, totalVida - diasTranscurridos),
      diasRestantes: Math.max(0, totalVida - diasTranscurridos),
      mostrarInfoCompleta: enPrueba,
      ...PLANES.FREE.caracteristicas,
      mostrarWhatsapp: enPrueba,
      mostrarUbicacion: enPrueba,
      mostrarHorarios: enPrueba,
      mostrarServicios: enPrueba,
      mostrarRedes: enPrueba,
    }
  }

  if (negocio.plan === 'premium' || negocio.plan === 'plus') {
    const estado = getEstadoSuscripcion(negocio)
    const activo = estado === 'activa' || estado === 'por-vencer'
    const diasVencer = getDiasParaVencer(negocio)
    const planDef = negocio.plan === 'plus' ? PLANES.PLUS : PLANES.PREMIUM

    return {
      plan: negocio.plan,
      nombre: planDef.nombre,
      enPrueba: false,
      debeBorrar: estado === 'por-eliminar',
      suscripcionVencida: !activo,
      estadoSuscripcion: estado,
      diasParaVencer: diasVencer,
      diasRestantesPrueba: 0,
      diasRestantes: activo ? diasVencer : 0,
      mostrarInfoCompleta: activo,
      ...planDef.caracteristicas,
      mostrarWhatsapp: activo,
      mostrarUbicacion: activo,
      mostrarHorarios: activo,
      mostrarServicios: activo,
      mostrarRedes: activo,
    }
  }

  return PLANES.FREE
}

export function necesitaBorrado(negocio) {
  if (!negocio) return false
  if (negocio.plan === 'premium' || negocio.plan === 'plus') {
    return getEstadoSuscripcion(negocio) === 'por-eliminar'
  }
  const ahora = new Date()
  const creado = new Date(negocio.createdAt)
  const dias = Math.floor((ahora - creado) / (1000 * 60 * 60 * 24))
  return dias >= DIAS_PRUEBA + DIAS_GRACIA
}

export function getMaxFotos(plan) {
  if (plan === 'plus' || plan === 'premium') return 10
  return 1
}

export function puedeTenerMasNegocios(plan, cantidadActual) {
  if (plan === 'plus') return cantidadActual < 10
  if (plan === 'premium') return cantidadActual < 1
  return cantidadActual < 1
}

export default PLANES
