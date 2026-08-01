import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { getAdminDb, borrarImagenesAdmin } from '../../lib/firebase-admin'
import { getEstadoSuscripcion, getTipoRecordatorioHoy } from '../../lib/suscripciones'
import { enviarCorreo, getEnlacePago, plantillaCorreo } from '../../lib/email'

const firebaseConfig = {
  apiKey: "AIzaSyD7QWoSjxILKSezjILdxtDOi3P8msnMR18",
  authDomain: "ruta-local-c77c2.firebaseapp.com",
  projectId: "ruta-local-c77c2",
  storageBucket: "ruta-local-c77c2.firebasestorage.app",
  messagingSenderId: "507304665915",
  appId: "1:507304665915:web:a7e867fd061c9fe7dccd1e",
  measurementId: "G-GMBCLWN8GZ"
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

export default async function handler(req, res) {
  const ahora = new Date()
  const hoy = ahora.toISOString().slice(0, 10)
  const resultado = { correosEnviados: 0, negociosEliminados: 0, correosPendientes: 0, errores: 0 }

  try {
    const snapshot = await getDocs(collection(db, 'negocios'))

    for (const d of snapshot.docs) {
      const data = d.data()
      if (data.plan !== 'premium' && data.plan !== 'plus') continue
      if (!data.subscriptionStart) continue

      const estado = getEstadoSuscripcion(data, ahora)

      // 1. Enviar recordatorio si toca hoy
      const recordatorio = getTipoRecordatorioHoy(data, ahora)
      if (recordatorio && data.ownerEmail) {
        const enlace = getEnlacePago(d.id)
        const html = plantillaCorreo({
          titulo: recordatorio.asunto,
          mensaje: `${recordatorio.mensaje} Tu plan ${data.plan === 'plus' ? 'Premium Plus' : 'Premium'} está activo.`,
          enlace,
          enlaceTexto: 'Pagar y renovar',
        })
        const r = await enviarCorreo({ to: data.ownerEmail, subject: recordatorio.asunto, html })
        if (r.enviado) {
          resultado.correosEnviados++
          await updateDoc(doc(db, 'negocios', d.id), { lastReminderDate: hoy })
        } else if (!r.enviado && r.motivo !== 'sin-llave') {
          resultado.errores++
        } else {
          resultado.correosPendientes++
          await updateDoc(doc(db, 'negocios', d.id), { lastReminderDate: hoy })
        }
      }

      // 2. Eliminar si superó los días de gracia
      if (estado === 'por-eliminar') {
        const adminDb = getAdminDb()
        if (adminDb) {
          await borrarImagenesAdmin(data.fotos || [])
          await adminDb.collection('negocios').doc(d.id).delete()
          resultado.negociosEliminados++
        }
      }
    }

    res.status(200).json({ ok: true, ...resultado, fecha: ahora.toISOString() })
  } catch (error) {
    console.error('[suscripciones][error]', error.message)
    res.status(500).json({ ok: false, error: error.message })
  }
}
