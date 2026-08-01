import { getAdminDb, borrarImagenesAdmin } from '../../lib/firebase-admin'
import { DIAS_PRUEBA, DIAS_GRACIA } from '../../lib/constants'

export default async function handler(req, res) {
  const DIAS_BORRADO = DIAS_PRUEBA + DIAS_GRACIA
  const ahora = Date.now()
  let eliminados = 0

  try {
    const db = getAdminDb()
    if (!db) {
      return res.status(200).json({ ok: true, eliminados: 0, aviso: 'Admin SDK no configurado' })
    }
    const snapshot = await db.collection('negocios').get()
    for (const d of snapshot.docs) {
      const data = d.data()
      const plan = data.plan || 'free'
      const esPremium = plan === 'premium' || plan === 'plus'
      const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : ahora
      const dias = (ahora - createdAt) / (1000 * 60 * 60 * 24)

      if (!esPremium && dias >= DIAS_BORRADO) {
        try {
          await borrarImagenesAdmin(data.fotos || [])
          await db.collection('negocios').doc(d.id).delete()
          eliminados++
        } catch (delErr) {
          console.error('No se pudo eliminar', d.id, delErr.message)
        }
      }
    }
    res.status(200).json({ ok: true, eliminados })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
}
