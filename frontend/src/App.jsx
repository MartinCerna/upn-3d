import { useState, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import FormularioSolicitud from './pages/FormularioSolicitud'
import ConsultaTicket from './pages/ConsultaTicket'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Estado de autenticación y modal del Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [pinError, setPinError] = useState('')

  // Clave de acceso para el administrador
  const PIN_CORRECTO = '1234'

  // Lógica para el Easter Egg (8 Clics en el texto de créditos)
  const [creditClicks, setCreditClicks] = useState(0)
  const clickTimerRef = useRef(null)

  const handleCreditClick = () => {
    setCreditClicks((prev) => {
      const nextClicks = prev + 1

      // Reinicia el contador si hay más de 1.5s de pausa entre clics
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      clickTimerRef.current = setTimeout(() => {
        setCreditClicks(0)
      }, 1500)

      // Al completar 8 clics seguidos se activa el modal de admin
      if (nextClicks === 8) {
        setShowAdminModal(true)
        setCreditClicks(0)
      }

      return nextClicks
    })
  }

  const handleAdminAccess = (e) => {
    e.preventDefault()
    if (adminPin === PIN_CORRECTO) {
      setIsAdminAuthenticated(true)
      setShowAdminModal(false)
      setPinError('')
      setAdminPin('')
      navigate('/admin')
    } else {
      setPinError('Clave de acceso incorrecta')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Barra de Navegación */}
      <nav style={{ 
        padding: '12px 24px', 
        background: '#1e293b', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        {/* Logo UPN con redirección externa */}
        <a 
          href="https://www.upn.edu.pe/" 
          target="_blank" 
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center' }}
          title="Ir a UPN"
        >
          <img 
            src="https://www.upn.edu.pe/sites/default/files/logo-upn-nuevo.svg" 
            alt="Logo UPN" 
            style={{ height: '40px', objectFit: 'contain' }} 
          />
        </a>

        {/* Botones Dinámicos de Navegación */}
        <div>
          {location.pathname === '/' && (
            <Link 
              to="/consultar" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: '600', 
                background: '#2563eb', 
                padding: '8px 16px', 
                borderRadius: '6px' 
              }}
            >
              Consultar Ticket
            </Link>
          )}

          {location.pathname === '/consultar' && (
            <Link 
              to="/" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: '600', 
                background: '#475569', 
                padding: '8px 16px', 
                borderRadius: '6px' 
              }}
            >
              ⬅ Volver
            </Link>
          )}

          {location.pathname === '/admin' && (
            <Link 
              to="/" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: '600', 
                background: '#ef4444', 
                padding: '8px 16px', 
                borderRadius: '6px' 
              }}
              onClick={() => setIsAdminAuthenticated(false)}
            >
              Salir del Admin
            </Link>
          )}
        </div>
      </nav>

      {/* Contenido de Rutas */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<FormularioSolicitud />} />
          <Route path="/consultar" element={<ConsultaTicket />} />
          <Route 
            path="/admin" 
            element={
              isAdminAuthenticated ? (
                <AdminPanel />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>⛔ Acceso Restringido</h2>
                  <p>Usa la combinación secreta para acceder al panel de administración.</p>
                  <Link to="/" style={{ color: '#2563eb' }}>Volver al Inicio</Link>
                </div>
              )
            } 
          />
        </Routes>
      </div>

      {/* Modal Secreto de Clave de Seguridad */}
      {showAdminModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0 }}>🔐 Modo Administrador</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Ingresa el PIN de seguridad:</p>
            <form onSubmit={handleAdminAccess}>
              <input 
                type="password" 
                placeholder="Ingresa la clave" 
                value={adminPin} 
                onChange={(e) => setAdminPin(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                autoFocus
              />
              {pinError && <p style={{ color: 'red', fontSize: '0.85rem', marginTop: 0 }}>{pinError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>Entrar</button>
                <button type="button" onClick={() => setShowAdminModal(false)} style={{ padding: '8px 16px', cursor: 'pointer', background: '#e2e8f0', border: 'none', borderRadius: '4px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pie de página con créditos e Easter Egg secreto */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px 0', 
        fontSize: '0.85rem', 
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        marginTop: 'auto'
      }}>
        <span 
          onClick={handleCreditClick}
          style={{ 
            cursor: 'none', 
            userSelect: 'none'
          }}
        >
          Designed & Developed by Eclypse
        </span>
      </footer>
    </div>
  )
}