import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-xl font-bold text-gray-800">ADBMX</h2>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.rol || 'Usuario'}
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>🚪</span>
            {sidebarOpen && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

export default Layout