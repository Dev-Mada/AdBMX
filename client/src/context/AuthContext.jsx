import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adbmx_token')
    const savedUser = localStorage.getItem('adbmx_user')
    
    console.log('🔄 AuthProvider iniciando...') // Debug
    console.log('🔑 Token en localStorage:', token) // Debug
    console.log('👤 Usuario en localStorage:', savedUser) // Debug
    
    if (token && savedUser) {
      try {
        // Usar el usuario guardado en localStorage para evitar verificación
        setUser(JSON.parse(savedUser))
        console.log('✅ Usuario cargado desde localStorage') // Debug
      } catch (error) {
        console.error('❌ Error parsing saved user:', error)
        localStorage.removeItem('adbmx_token')
        localStorage.removeItem('adbmx_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🌐 Haciendo request a /api/auth/login...') // Debug
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Response status:', response.status) // Debug
      const data = await response.json()
      console.log('📦 Response data:', data) // Debug

      if (data.success) {
        localStorage.setItem('adbmx_token', data.token)
        localStorage.setItem('adbmx_user', JSON.stringify(data.user))
        setUser(data.user)
        console.log('✅ Login exitoso, usuario guardado') // Debug
        return { success: true }
      } else {
        console.log('❌ Login fallido:', data.error) // Debug
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error) // Debug
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }

  const logout = () => {
    localStorage.removeItem('adbmx_token')
    localStorage.removeItem('adbmx_user')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}