import { db, storage } from './firebase'
import { collection, addDoc, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export function getNegociosRef() {
  return collection(db, 'negocios')
}

export async function getNegocios() {
  if (!db) return []
  try {
    const snap = await getDocs(getNegociosRef())
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error cargando negocios:', e)
    return []
  }
}

export async function getNegocioById(id) {
  if (!db) return null
  try {
    const docRef = doc(db, 'negocios', id)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch (e) {
    console.error('Error cargando negocio:', e)
    return null
  }
}

export async function getNegociosByMunicipio(departamento, municipio) {
  if (!db) return []
  try {
    const q = query(getNegociosRef(),
      where('departamento', '==', departamento),
      where('municipio', '==', municipio)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error cargando negocios del municipio:', e)
    return []
  }
}

export async function getNegociosByCategoria(categoria) {
  if (!db) return []
  try {
    const q = query(getNegociosRef(), where('categoria', '==', categoria))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error cargando negocios por categoría:', e)
    return []
  }
}

export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export async function guardarNegocio(negocio) {
  if (!db) return negocio
  try {
    if (negocio.id) {
      const docRef = doc(db, 'negocios', negocio.id)
      const { id, ...datos } = negocio
      await setDoc(docRef, datos, { merge: true })
      return negocio
    }
    const { id, ...datos } = negocio
    const docRef = await addDoc(getNegociosRef(), {
      ...datos,
      createdAt: negocio.createdAt || new Date().toISOString(),
      views: 0,
      whatsappClicks: 0,
      callClicks: 0,
    })
    return { ...negocio, id: docRef.id }
  } catch (e) {
    console.error('Error guardando negocio:', e)
    return negocio
  }
}

export async function eliminarNegocio(id) {
  if (!db) return
  try {
    const docRef = doc(db, 'negocios', id)
    const snap = await getDoc(docRef)
    const fotos = (snap.exists() && snap.data().fotos) || []
    if (storage && Array.isArray(fotos)) {
      for (const url of fotos) {
        try {
          const imgRef = ref(storage, url)
          await deleteObject(imgRef)
        } catch (e) {
          console.error('Error borrando imagen:', e)
        }
      }
    }
    await deleteDoc(docRef)
  } catch (e) {
    console.error('Error eliminando negocio:', e)
  }
}

export async function incrementContador(id, campo) {
  if (!db) return
  try {
    const docRef = doc(db, 'negocios', id)
    await updateDoc(docRef, { [campo]: increment(1) })
  } catch (e) {
    console.error('Error incrementando contador:', e)
  }
}

export async function getMunicipiosCreados() {
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'municipios'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Error cargando municipios:', e)
    return []
  }
}

export async function addMunicipio(municipio) {
  if (!db) return
  try {
    const q = query(collection(db, 'municipios'),
      where('departamento', '==', municipio.departamento),
      where('nombre', '==', municipio.nombre)
    )
    const snap = await getDocs(q)
    if (snap.empty) {
      await addDoc(collection(db, 'municipios'), {
        ...municipio,
        creado: new Date().toISOString(),
      })
    }
  } catch (e) {
    console.error('Error creando municipio:', e)
  }
}

export async function activarSuscripcion(id, plan) {
  if (!db) return null
  try {
    const docRef = doc(db, 'negocios', id)
    await setDoc(docRef, {
      plan,
      subscriptionStart: new Date().toISOString(),
      lastReminderDate: '',
      subscriptionPaidAt: new Date().toISOString(),
    }, { merge: true })
    return true
  } catch (e) {
    console.error('Error activando suscripción:', e)
    return null
  }
}

export async function renovarSuscripcion(id) {
  if (!db) return null
  try {
    const docRef = doc(db, 'negocios', id)
    await setDoc(docRef, {
      subscriptionStart: new Date().toISOString(),
      lastReminderDate: '',
      subscriptionPaidAt: new Date().toISOString(),
    }, { merge: true })
    return true
  } catch (e) {
    console.error('Error renovando suscripción:', e)
    return null
  }
}

export async function subirImagen(file) {
  if (!storage) return null
  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const nombre = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}.${ext}`
    const storageRef = ref(storage, `fotos/${nombre}`)
    const snap = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snap.ref)
    return url
  } catch (e) {
    console.error('Error subiendo imagen:', e)
    return null
  }
}
