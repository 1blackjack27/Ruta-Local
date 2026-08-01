import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import departamentos from '../data/departamentos'
import categorias from '../data/categorias'
import { guardarNegocio, generarId, getNegocioById, getMunicipiosCreados, addMunicipio, subirImagen, eliminarNegocio } from '../lib/storage'
import { auth } from '../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { DIAS_PRUEBA, CODIGO_PROMO } from '../lib/constants'

const DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const DEFAULT_HOURS = {
  lunes: { open: '08:00', close: '20:00' },
  martes: { open: '08:00', close: '20:00' },
  miercoles: { open: '08:00', close: '20:00' },
  jueves: { open: '08:00', close: '20:00' },
  viernes: { open: '09:00', close: '22:00' },
  sabado: { open: '09:00', close: '22:00' },
  domingo: { open: '09:00', close: '18:00' },
}

const SUGGESTED_SERVICES = [
  'WiFi gratis', 'Parqueadero', 'Desayuno incluido', 'Aire acondicionado',
  'TV', 'Piscina', 'Mascotas permitidas', 'Seguridad 24/7', 'Terraza',
  'Accesibilidad', 'Comida típica', 'Opciones vegetarianas', 'Transporte incluido', 'Guía turístico',
]

const departments = Object.keys(departamentos).sort()

const sInput = {
  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500,
  background: 'var(--surface)', color: 'var(--text)', outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
}

const sLabel = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: 6, letterSpacing: '0.01em',
}

const sCard = {
  background: 'var(--surface)', borderRadius: 'var(--radius)',
  padding: '28px 32px', boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border)',
}

const sCardTitle = {
  fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700,
  color: 'var(--text)', marginBottom: 20, paddingBottom: 14,
  borderBottom: '1px solid var(--border)',
}

export default function Registro() {
  const router = useRouter()

  const [dept, setDept] = useState('')
  const [mun, setMun] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [direccion, setDireccion] = useState('')
  const [googleMaps, setGoogleMaps] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [sitioWeb, setSitioWeb] = useState('')
  const [fotos, setFotos] = useState([])
  const [fotoUrl, setFotoUrl] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [fotoError, setFotoError] = useState('')
  const [nombreDueno, setNombreDueno] = useState('')
  const [fotoDueno, setFotoDueno] = useState('')
  const [fotoDuenoUrl, setFotoDuenoUrl] = useState('')
  const [subiendoFotoDueno, setSubiendoFotoDueno] = useState(false)
  const [fotoDuenoError, setFotoDuenoError] = useState('')
  const [servicios, setServicios] = useState([])
  const [servicioInput, setServicioInput] = useState('')
  const [horario, setHorario] = useState(DEFAULT_HOURS)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [customMunis, setCustomMunis] = useState([])

  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountError, setAccountError] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)

  const [editId, setEditId] = useState('')
  const [cargandoEdicion, setCargandoEdicion] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    const qid = router.query.id
    if (!qid) return
    setEditId(qid)
    setCargandoEdicion(true)
    getNegocioById(qid).then(n => {
      if (!n) {
        setCargandoEdicion(false)
        return
      }
      setDept(n.departamento || '')
      setMun(n.municipio || '')
      setCategoria(n.categoria || '')
      setNombre(n.nombre || '')
      setDescripcion(n.descripcion || '')
      setTelefono(n.telefono || '')
      setWhatsapp(n.whatsapp || '')
      setDireccion(n.direccion || '')
      setGoogleMaps(n.googleMaps || '')
      setFacebook(n.facebook || '')
      setInstagram(n.instagram || '')
      setTiktok(n.tiktok || '')
      setSitioWeb(n.sitioWeb || '')
      setFotos(Array.isArray(n.fotos) ? n.fotos : [])
      setServicios(Array.isArray(n.servicios) ? n.servicios : [])
      setNombreDueno(n.nombreDueno || '')
      setFotoDueno(n.fotoDueno || '')
      if (n.horario && typeof n.horario === 'object') {
        setHorario({ ...DEFAULT_HOURS, ...n.horario })
      }
      setCargandoEdicion(false)
    })
  }, [router.isReady, router.query.id])


  useEffect(() => {
    if (!auth) return
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u)
      if (u && u.email) setEmail(u.email)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    async function cargarMunis() {
      const munis = await getMunicipiosCreados()
      setCustomMunis(munis)
    }
    cargarMunis()
  }, [])

  const [showCreateMun, setShowCreateMun] = useState(false)
  const [nuevoDept, setNuevoDept] = useState('')
  const [nuevoMun, setNuevoMun] = useState('')
  const [munCreated, setMunCreated] = useState(false)

  const municipios = dept ? (departamentos[dept] || []) : []
  const customMuns = customMunis
  const customForDept = customMuns.filter(m => m.departamento === dept).map(m => m.nombre)
  const allMuns = dept ? [...new Set([...municipios, ...customForDept])].sort() : []

  const handleCreateMunicipio = async () => {
    if (!nuevoDept.trim() || !nuevoMun.trim()) return
    await addMunicipio({ departamento: nuevoDept.trim(), nombre: nuevoMun.trim() })
    const municipiosActualizados = await getMunicipiosCreados()
    setCustomMunis(municipiosActualizados)
    setNuevoDept('')
    setNuevoMun('')
    setShowCreateMun(false)
    setMunCreated(true)
    setTimeout(() => setMunCreated(false), 3000)
  }

  const handleAddService = (svc) => {
    const val = svc || servicioInput.trim()
    if (!val || servicios.includes(val)) return
    setServicios([...servicios, val])
    setServicioInput('')
  }

  const handleRemoveService = (idx) => {
    setServicios(servicios.filter((_, i) => i !== idx))
  }

  const handleAddFoto = () => {
    if (!fotoUrl.trim() || fotos.length >= 10) return
    setFotos([...fotos, fotoUrl.trim()])
    setFotoUrl('')
  }

  const handleFileFoto = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (fotos.length >= 10) {
      setFotoError('Ya alcanzaste el máximo de 10 fotos.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setFotoError('El archivo debe ser una imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('La imagen debe pesar máximo 5 MB.')
      return
    }
    setFotoError('')
    if (!user) {
      if (!auth) {
        setFotoError('Servicio de autenticación no disponible. Intenta más tarde.')
        return
      }
      if (!email.trim() || !email.includes('@')) {
        setFotoError('Para subir fotos primero llena tu correo y contraseña en la sección "Crea tu cuenta" (al final del formulario).')
        return
      }
      if (password.length < 6) {
        setFotoError('Para subir fotos primero crea tu cuenta: escribe una contraseña de mínimo 6 caracteres en la sección "Crea tu cuenta".')
        return
      }
      if (confirmPassword !== password) {
        setFotoError('Las contraseñas no coinciden. Revísalas en la sección "Crea tu cuenta" para subir fotos.')
        return
      }
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        setUser(cred.user)
      } catch (err) {
        const code = err.code || ''
        if (code === 'auth/email-already-in-use') {
          setFotoError('Ese correo ya tiene una cuenta. Inicia sesión para poder subir fotos.')
        } else if (code === 'auth/invalid-email') {
          setFotoError('Ingresa un correo válido en la sección "Crea tu cuenta".')
        } else if (code === 'auth/weak-password') {
          setFotoError('La contraseña debe tener al menos 6 caracteres.')
        } else {
          setFotoError(err.message)
        }
        return
      }
    }
    setSubiendoFoto(true)
    const url = await subirImagen(file)
    setSubiendoFoto(false)
    if (url) {
      setFotos(prev => [...prev, url])
    } else {
      setFotoError('No se pudo subir la imagen. Verifica tu conexión e inténtalo de nuevo.')
    }
  }

  const handleRemoveFoto = (idx) => {
    setFotos(fotos.filter((_, i) => i !== idx))
  }

  const handleFileFotoDueno = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFotoDuenoError('El archivo debe ser una imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFotoDuenoError('La imagen debe pesar máximo 5 MB.')
      return
    }
    setFotoDuenoError('')
    if (!user) {
      setFotoDuenoError('Para subir la foto primero crea tu cuenta con correo y contraseña.')
      return
    }
    setSubiendoFotoDueno(true)
    const url = await subirImagen(file)
    setSubiendoFotoDueno(false)
    if (url) {
      setFotoDueno(url)
    } else {
      setFotoDuenoError('No se pudo subir la imagen. Verifica tu conexión e inténtalo de nuevo.')
    }
  }

  const handleAddFotoDuenoUrl = () => {
    if (!fotoDuenoUrl.trim()) return
    setFotoDueno(fotoDuenoUrl.trim())
    setFotoDuenoUrl('')
  }

  const handleHourChange = (day, field, value) => {
    setHorario(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const validate = () => {
    const errs = {}
    if (!dept) errs.dept = 'Selecciona un departamento'
    if (!mun) errs.mun = 'Selecciona un municipio'
    if (!categoria) errs.categoria = 'Selecciona una categoría'
    if (!nombre.trim()) errs.nombre = 'Ingresa el nombre del negocio'
    if (!descripcion.trim()) errs.descripcion = 'Ingresa una descripción'
    if (!telefono.trim()) errs.telefono = 'Ingresa un teléfono'
    if (!direccion.trim()) errs.direccion = 'Ingresa una dirección'
    if (!user) {
      if (!email.trim()) errs.email = 'Ingresa tu correo electrónico'
      if (password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres'
      if (confirmPassword !== password) errs.confirmPassword = 'Las contraseñas no coinciden'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAccountError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    let currentUser = user
    if (!currentUser) {
      if (!auth) {
        setAccountError('Servicio de autenticación no disponible. Intenta más tarde.')
        return
      }
      setCreatingAccount(true)
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        currentUser = cred.user
        setUser(currentUser)
      } catch (err) {
        const code = err.code || ''
        if (code === 'auth/email-already-in-use') {
          setAccountError('Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.')
        } else if (code === 'auth/invalid-email') {
          setAccountError('Ingresa un correo válido.')
        } else if (code === 'auth/weak-password') {
          setAccountError('La contraseña debe tener al menos 6 caracteres.')
        } else {
          setAccountError(err.message)
        }
        setCreatingAccount(false)
        return
      }
    }

    const negocio = {
      id: editId || generarId(),
      ownerId: currentUser ? currentUser.uid : '',
      ownerEmail: currentUser ? currentUser.email : email.trim(),
      departamento: dept,
      municipio: mun,
      categoria,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      telefono: telefono.trim(),
      whatsapp: whatsapp.trim(),
      direccion: direccion.trim(),
      googleMaps: googleMaps.trim(),
      facebook: facebook.trim(),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
      sitioWeb: sitioWeb.trim(),
      fotos,
      servicios,
      horario,
      nombreDueno: nombreDueno.trim(),
      fotoDueno: fotoDueno.trim(),
      plan: 'free',
      createdAt: new Date().toISOString(),
      views: 0,
      whatsappClicks: 0,
      callClicks: 0,
    }

    await guardarNegocio(negocio)
    setCreatingAccount(false)
    setSubmitted(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const handleEliminarDesdeEdicion = async () => {
    if (!editId) return
    const ok = confirm(`¿Seguro que quieres eliminar este negocio? Esta acción no se puede deshacer.`)
    if (!ok) return
    await eliminarNegocio(editId)
    router.push('/dashboard')
  }

  const requiredMark = <span style={{ color: 'var(--error)' }}> *</span>

  const containerStyle = {
    maxWidth: 820, margin: '0 auto', padding: '40px 20px 80px',
  }

  const fieldStyle = {
    marginBottom: 20,
  }

  const rowStyle = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
  }

  return (
    <div style={containerStyle}>
      {submitted ? (
        <div style={{
          ...sCard, textAlign: 'center', padding: '60px 32px',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--success)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem', color: '#fff',
          }}>
            <i className="fas fa-check"></i>
          </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800,
              color: 'var(--text)', marginBottom: 12,
            }}>
              {editId ? '¡Cambios guardados!' : '¡Negocio registrado con éxito!'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
              {editId ? (
                'Los cambios se guardaron correctamente.'
              ) : (
                <>
                  Disfruta de {DIAS_PRUEBA} días de prueba gratuita con toda la información visible.
                  Usa el código <strong style={{ color: 'var(--primary)', letterSpacing: '0.04em' }}>{CODIGO_PROMO}</strong> para acceder.
                </>
              )}
            </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 20 }}>
            Redirigiendo al dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800, color: 'var(--text)', marginBottom: 8,
            }}>
              {editId ? 'Edita tu negocio' : 'Registra tu negocio gratis por 10 días'}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              {editId
                ? 'Actualiza la información de tu negocio. Los cambios se guardan al pulsar "Guardar cambios".'
                : 'Completa los datos y empieza a recibir clientes en tu municipio. Sin permanencia, sin riesgo.'}
            </p>
          </div>

          {/* CREATE MUNICIPIO */}
          <div style={{ ...sCard, marginBottom: 24, padding: '16px 24px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }} onClick={() => setShowCreateMun(!showCreateMun)}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                <i className="fas fa-plus-circle" style={{ marginRight: 8 }}></i>
                ¿No encuentras tu municipio?
              </span>
              <i className={`fas fa-chevron-${showCreateMun ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
            </div>
            {showCreateMun && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={rowStyle}>
                  <div>
                    <label style={sLabel}>País</label>
                    <input type="text" value="Colombia" readOnly style={{ ...sInput, background: 'var(--muted)', cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={sLabel}>Departamento</label>
                    <input type="text" value={nuevoDept} onChange={e => setNuevoDept(e.target.value)}
                      placeholder="Ej: Antioquia" style={sInput} />
                  </div>
                </div>
                <div>
                  <label style={sLabel}>Municipio</label>
                  <input type="text" value={nuevoMun} onChange={e => setNuevoMun(e.target.value)}
                    placeholder="Ej: Jericó" style={sInput} />
                </div>
                <button type="button" onClick={handleCreateMunicipio}
                  disabled={!nuevoDept.trim() || !nuevoMun.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: !nuevoDept.trim() || !nuevoMun.trim() ? 'var(--muted)' : 'var(--primary)',
                    color: !nuevoDept.trim() || !nuevoMun.trim() ? 'var(--text-muted)' : '#fff',
                    fontWeight: 600, fontSize: '0.85rem', alignSelf: 'flex-start',
                  }}>
                  Guardar municipio
                </button>
                {munCreated && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                    <i className="fas fa-check-circle" style={{ marginRight: 4 }}></i>
                    Municipio creado correctamente
                  </span>
                )}
              </div>
            )}
          </div>

          {/* MAIN FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* MUNICIPIO + CATEGORIA */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Ubicación y categoría</h3>
              <div style={rowStyle}>
                <div style={fieldStyle}>
                  <label style={sLabel}>Departamento{requiredMark}</label>
                  <select value={dept} onChange={e => { setDept(e.target.value); setMun('') }}
                    style={{ ...sInput, cursor: 'pointer' }}>
                    <option value="">Seleccionar departamento</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.dept && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.dept}</span>}
                </div>
                <div style={fieldStyle}>
                  <label style={sLabel}>Municipio{requiredMark}</label>
                  <select value={mun} onChange={e => setMun(e.target.value)} disabled={!dept}
                    style={{ ...sInput, cursor: dept ? 'pointer' : 'not-allowed', background: dept ? 'var(--surface)' : 'var(--muted)' }}>
                    <option value="">{dept ? 'Seleccionar municipio' : 'Primero elige depto'}</option>
                    {allMuns.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.mun && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.mun}</span>}
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={sLabel}>Categoría{requiredMark}</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}
                  style={{ ...sInput, cursor: 'pointer', marginBottom: 14 }}>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {errors.categoria && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.categoria}</span>}

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 10, marginTop: 4,
                }}>
                  {categorias.map(c => {
                    const isSelected = categoria === c.id
                    return (
                      <div key={c.id} onClick={() => setCategoria(c.id)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 6, padding: '14px 8px', borderRadius: 'var(--radius-sm)',
                          background: isSelected ? c.gradiente : 'var(--muted)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          border: isSelected ? '2px solid transparent' : '2px solid transparent',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        }}>
                        <i className={c.icono} style={{ fontSize: '1.2rem' }}></i>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                          {c.nombre}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* BASIC INFO */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Información del negocio</h3>
              <div style={fieldStyle}>
                <label style={sLabel}>Nombre del negocio{requiredMark}</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Hotel Colonial" style={sInput} />
                {errors.nombre && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.nombre}</span>}
              </div>
              <div style={fieldStyle}>
                <label style={sLabel}>Descripción{requiredMark}</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe tu negocio, qué ofreces y por qué los viajeros deberían visitarte..."
                  rows={4} style={{ ...sInput, resize: 'vertical', minHeight: 100 }} />
                {errors.descripcion && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.descripcion}</span>}
              </div>
              <div style={rowStyle}>
                <div style={fieldStyle}>
                  <label style={sLabel}>Teléfono{requiredMark}</label>
                  <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)}
                    placeholder="+57 300 123 4567" style={sInput} />
                  {errors.telefono && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.telefono}</span>}
                </div>
                <div style={fieldStyle}>
                  <label style={sLabel}>WhatsApp</label>
                  <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                    placeholder="El número donde recibirás mensajes" style={sInput} />
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={sLabel}>Dirección{requiredMark}</label>
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                  placeholder="Cra 5 # 10-20, Centro" style={sInput} />
                {errors.direccion && <span style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 4, display: 'block' }}>{errors.direccion}</span>}
              </div>
              <div style={fieldStyle}>
                <label style={sLabel}>Google Maps <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                <input type="text" value={googleMaps} onChange={e => setGoogleMaps(e.target.value)}
                  placeholder="Pega el enlace de Google Maps de tu ubicación" style={sInput} />
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Redes Sociales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={fieldStyle}>
                  <label style={sLabel}>Facebook</label>
                  <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..." style={sInput} />
                </div>
                <div style={fieldStyle}>
                  <label style={sLabel}>Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..." style={sInput} />
                </div>
                <div style={fieldStyle}>
                  <label style={sLabel}>TikTok</label>
                  <input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/..." style={sInput} />
                </div>
                <div style={fieldStyle}>
                  <label style={sLabel}>Sitio web</label>
                  <input type="text" value={sitioWeb} onChange={e => setSitioWeb(e.target.value)}
                    placeholder="https://..." style={sInput} />
                </div>
              </div>
            </div>

            {/* PHOTOS */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Foto de portada</h3>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '32px 20px', textAlign: 'center', background: 'var(--surface)',
                marginBottom: 16,
              }}>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: 12 }}></i>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Haz clic para subir la foto de portada
                </p>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: subiendoFoto ? 'var(--muted)' : 'var(--primary)',
                  color: subiendoFoto ? 'var(--text-muted)' : '#fff',
                  fontWeight: 600, fontSize: '0.88rem', cursor: subiendoFoto ? 'wait' : 'pointer',
                }}>
                  <i className={`fas ${subiendoFoto ? 'fa-spinner fa-spin' : 'fa-images'}`}></i>
                  {subiendoFoto ? 'Subiendo imagen...' : 'Elegir desde el computador / galería'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileFoto}
                    disabled={subiendoFoto}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  o pega una URL:
                </p>
                <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                  <input type="text" value={fotoUrl} onChange={e => setFotoUrl(e.target.value)}
                    placeholder="Pega la URL de la imagen" style={sInput} />
                  <button type="button" onClick={handleAddFoto}
                    disabled={!fotoUrl.trim() || fotos.length >= 10}
                    style={{
                      padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
                      background: !fotoUrl.trim() || fotos.length >= 10 ? 'var(--muted)' : 'var(--primary)',
                      color: !fotoUrl.trim() || fotos.length >= 10 ? 'var(--text-muted)' : '#fff',
                      fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
                    }}>
                    Agregar
                  </button>
                </div>
                {fotoError && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: 8 }}>
                    <i className="fas fa-circle-exclamation" style={{ marginRight: 5 }}></i>
                    {fotoError}
                  </p>
                )}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  {fotos.length}/10 fotos · Plan free: 1 foto · Premium/Plus: hasta 10
                </p>
              </div>
              {fotos.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {fotos.map((url, i) => (
                    <div key={i} style={{
                      position: 'relative', width: 100, height: 80, borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden', border: '1px solid var(--border)',
                    }}>
                      <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.7rem">Error</div>' }} />
                      <button type="button" onClick={() => handleRemoveFoto(i)}
                        style={{
                          position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                          borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)',
                          color: '#fff', fontSize: '0.65rem', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SERVICES */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Servicios ofrecidos</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input type="text" value={servicioInput} onChange={e => setServicioInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                  placeholder="Escribe un servicio y presiona Enter" style={sInput} />
                <button type="button" onClick={() => handleAddService()}
                  disabled={!servicioInput.trim()}
                  style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: !servicioInput.trim() ? 'var(--muted)' : 'var(--primary)',
                    color: !servicioInput.trim() ? 'var(--text-muted)' : '#fff',
                    fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
                  }}>
                  Agregar servicio
                </button>
              </div>
              {servicios.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {servicios.map((svc, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 50, fontSize: '0.82rem',
                      fontWeight: 500, background: 'var(--primary-bg)', color: 'var(--primary)',
                    }}>
                      {svc}
                      <span onClick={() => handleRemoveService(i)}
                        style={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.75rem' }}>
                        <i className="fas fa-times"></i>
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
                  Sugerencias:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_SERVICES.filter(s => !servicios.includes(s)).map(s => (
                    <span key={s} onClick={() => handleAddService(s)}
                      style={{
                        padding: '5px 12px', borderRadius: 50, fontSize: '0.78rem',
                        fontWeight: 500, background: 'var(--muted)', color: 'var(--text-secondary)',
                        cursor: 'pointer', border: '1px solid var(--border)',
                        transition: 'all 0.15s',
                      }}>
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* HOURS */}
            <div style={sCard}>
              <h3 style={sCardTitle}>Horario de atención</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DAYS.map(day => {
                  const h = horario[day.key] || { open: '08:00', close: '20:00' }
                  return (
                    <div key={day.key} style={{
                      display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 10,
                      alignItems: 'center', padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                        {day.label}
                      </span>
                      <input type="time" value={h.open}
                        onChange={e => handleHourChange(day.key, 'open', e.target.value)}
                        style={{ ...sInput, padding: '8px 10px', fontSize: '0.85rem' }} />
                      <input type="time" value={h.close}
                        onChange={e => handleHourChange(day.key, 'close', e.target.value)}
                        style={{ ...sInput, padding: '8px 10px', fontSize: '0.85rem' }} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DATOS DEL DUEÑO */}
            <div style={sCard}>
              <h3 style={sCardTitle}>
                <i className="fas fa-user-circle" style={{ marginRight: 8 }}></i>
                Datos del dueño
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Estos datos se muestran en la página de tu negocio. La foto es opcional.
              </p>
              <div style={fieldStyle}>
                <label style={sLabel}>Nombre del dueño</label>
                <input type="text" value={nombreDueno} onChange={e => setNombreDueno(e.target.value)}
                  placeholder="Ej: Carlos Rodríguez" style={sInput} />
              </div>
              <label style={sLabel}>Foto del dueño (opcional)</label>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '24px 20px', textAlign: 'center', background: 'var(--surface)',
                marginBottom: 16,
              }}>
                {fotoDueno ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <img src={fotoDueno} alt="Foto del dueño"
                      style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-bg)' }} />
                    <button type="button" onClick={() => setFotoDueno('')}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--error)',
                        background: 'transparent', color: 'var(--error)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      }}>
                      <i className="fas fa-trash-alt" style={{ marginRight: 6 }}></i>
                      Quitar foto
                    </button>
                  </div>
                ) : (
                  <>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
                      background: subiendoFotoDueno ? 'var(--muted)' : 'var(--primary)',
                      color: subiendoFotoDueno ? 'var(--text-muted)' : '#fff',
                      fontWeight: 600, fontSize: '0.88rem', cursor: subiendoFotoDueno ? 'wait' : 'pointer',
                    }}>
                      <i className={`fas ${subiendoFotoDueno ? 'fa-spinner fa-spin' : 'fa-user'}`}></i>
                      {subiendoFotoDueno ? 'Subiendo imagen...' : 'Elegir foto desde el computador / galería'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileFotoDueno}
                        disabled={subiendoFotoDueno}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
                      o pega una URL:
                    </p>
                    <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                      <input type="text" value={fotoDuenoUrl} onChange={e => setFotoDuenoUrl(e.target.value)}
                        placeholder="Pega la URL de la foto" style={sInput} />
                      <button type="button" onClick={handleAddFotoDuenoUrl}
                        disabled={!fotoDuenoUrl.trim()}
                        style={{
                          padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
                          background: !fotoDuenoUrl.trim() ? 'var(--muted)' : 'var(--primary)',
                          color: !fotoDuenoUrl.trim() ? 'var(--text-muted)' : '#fff',
                          fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
                        }}>
                        Agregar
                      </button>
                    </div>
                    {fotoDuenoError && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: 8 }}>
                        <i className="fas fa-circle-exclamation" style={{ marginRight: 5 }}></i>
                        {fotoDuenoError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* CUENTA */}
            <div style={sCard}>
              <h3 style={sCardTitle}>
                <i className="fas fa-user-lock" style={{ marginRight: 8 }}></i>
                {user ? 'Tu cuenta' : 'Crea tu cuenta para publicar'}
              </h3>
              {user ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--primary-bg)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', fontWeight: 700,
                    }}>
                      {(user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Conectado correctamente
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', background: '#DCFCE7', color: '#166534',
                    padding: '4px 12px', borderRadius: 50, fontWeight: 600,
                  }}>
                    <i className="fas fa-check-circle" style={{ marginRight: 4 }}></i> Sesión activa
                  </span>
                </div>
              ) : (
                <>
                  {accountError && (
                    <div style={{
                      background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: 16,
                    }}>{accountError}</div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <label style={sLabel}>Correo electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      style={sInput}
                      required
                    />
                    {errors.email && <div style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</div>}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={sLabel}>Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={sInput}
                      required
                    />
                    {errors.password && <div style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: 4 }}>{errors.password}</div>}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={sLabel}>Confirmar contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      style={sInput}
                      required
                    />
                    {errors.confirmPassword && <div style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: 4 }}>{errors.confirmPassword}</div>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
                    Al crear tu cuenta podrás editar y eliminar tu negocio desde tu panel.
                    Ya tienes cuenta?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      Inicia sesión
                    </Link>
                  </p>
                </>
              )}
            </div>

            {/* SUBMIT */}
            <button type="submit" disabled={creatingAccount} style={{
              width: '100%', padding: '16px 32px', borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: creatingAccount
                ? 'var(--border)'
                : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              color: creatingAccount ? 'var(--text-muted)' : '#fff',
              fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 8px 24px rgba(13,107,78,0.3)',
              transition: 'all 0.2s', letterSpacing: '0.01em',
              cursor: creatingAccount ? 'wait' : 'pointer',
            }}>
              <i className="fas fa-paper-plane" style={{ marginRight: 10 }}></i>
              {creatingAccount
                ? 'Creando tu cuenta y publicando...'
                : user
                  ? (editId ? 'Guardar cambios' : 'Publicar negocio gratis por 10 días')
                  : 'Crear cuenta y publicar gratis por 10 días'}
            </button>

            {editId && (
              <button type="button" onClick={handleEliminarDesdeEdicion} style={{
                width: '100%', padding: '14px 32px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--error)', background: 'transparent',
                color: 'var(--error)', fontSize: '0.95rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', marginTop: 12,
              }}>
                <i className="fas fa-trash-alt" style={{ marginRight: 10 }}></i>
                Eliminar negocio
              </button>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Al publicar aceptas nuestros{' '}
              <Link href="/terminos" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                términos y condiciones
              </Link>
            </p>
          </div>
        </form>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-bg) !important;
        }
      `}</style>
    </div>
  )
}
