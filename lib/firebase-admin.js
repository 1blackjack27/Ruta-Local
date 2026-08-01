import admin from 'firebase-admin'

const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT || ''

let adminApp = null
let adminDb = null
let adminBucket = null

export function getAdminApp() {
  if (!SERVICE_ACCOUNT_JSON) return null
  if (adminApp) return adminApp
  try {
    const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON)
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: serviceAccount.project_id
        ? `${serviceAccount.project_id}.firebasestorage.app`
        : undefined,
    })
    return adminApp
  } catch (e) {
    console.error('[admin][init]', e.message)
    return null
  }
}

export function getAdminDb() {
  if (adminDb) return adminDb
  const app = getAdminApp()
  if (!app) return null
  adminDb = admin.firestore(app)
  return adminDb
}

export function getAdminBucket() {
  if (adminBucket) return adminBucket
  const app = getAdminApp()
  if (!app) return null
  adminBucket = admin.storage(app).bucket()
  return adminBucket
}

export async function borrarImagenesAdmin(urls = []) {
  const bucket = getAdminBucket()
  if (!bucket) return false
  let borradas = 0
  for (const url of urls) {
    try {
      const name = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] || '')
      if (!name) continue
      await bucket.file(name).delete()
      borradas++
    } catch (e) {
      if (!String(e.code || '').includes('404')) {
        console.error('[admin][borrar-imagen]', e.message)
      }
    }
  }
  return borradas
}
