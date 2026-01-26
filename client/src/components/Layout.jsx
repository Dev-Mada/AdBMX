import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/clientes', icon: '👥', label: 'Clientes' },
    { path: '/oportunidades', icon: '💼', label: 'Oportunidades' },
    { path: '/tareas', icon: '✅', label: 'Tareas' },
    { path: '/contactos', icon: '📞', label: 'Contactos' },
    { path: '/reportes', icon: '📈', label: 'Reportes' },
    { path: '/configuracion', icon: '⚙️', label: 'Configuración' }
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        bg-gray-900 shadow-xl transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
        ${isMobile ? 'w-64' : 'w-64'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-white truncate">ADBMX CRM</h2>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 transition-colors duration-200 lg:hidden"
          >
            ✕
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`
                flex items-center p-3 rounded-lg transition-colors duration-200
                ${location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {sidebarOpen && (
                <span className="ml-3 font-medium truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400 capitalize truncate">
                  {user?.rol || 'Usuario'}
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            <span>🚪</span>
            {sidebarOpen && <span className="ml-3 truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-900">ADBMX</h1>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout