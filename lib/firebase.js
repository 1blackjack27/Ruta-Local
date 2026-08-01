import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD7QWoSjxILKSezjILdxtDOi3P8msnMR18",
  authDomain: "ruta-local-c77c2.firebaseapp.com",
  projectId: "ruta-local-c77c2",
  storageBucket: "ruta-local-c77c2.firebasestorage.app",
  messagingSenderId: "507304665915",
  appId: "1:507304665915:web:a7e867fd061c9fe7dccd1e",
  measurementId: "G-GMBCLWN8GZ"
}

let app
if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig)
}

export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
export const storage = app ? getStorage(app) : null
