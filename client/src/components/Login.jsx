import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('admin@adbmx.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error)
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold text-white">A</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">ADBMX</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Business Management eXpress</p>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">Inicia sesión en tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm sm:text-base"
                placeholder="admin@adbmx.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-br from-blue-600 to-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Credenciales por defecto */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-800 text-center">
              <strong className="text-xs sm:text-sm">Credenciales por defecto:</strong><br />
              <span className="text-xs">admin@adbmx.com / admin123</span>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 ADBMX CRM. Sistema de gestión empresarial.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login