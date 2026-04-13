import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Building, Bell, Shield, Plug, Save, Phone, Mail, Database, Upload } from 'lucide-react'
import api from '../lib/api'
import { useToast } from './ui/Toast'

const Configuracion = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(false)

  const [perfil, setPerfil] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: '',
    puesto: 'Administrador',
    departamento: 'Gestion'
  })

  const [empresa, setEmpresa] = useState({
    nombre: 'ADBMX CRM',
    industria: 'Tecnologia',
    tamaño: '10-50',
    moneda: 'USD',
    zonaHoraria: 'Europe/Madrid'
  })

  const [notificaciones, setNotificaciones] = useState({
    email: true,
    tareas: true,
    oportunidades: true,
    reportes: false
  })

  const handleGuardarPerfil = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Perfil actualizado correctamente')
    }, 1000)
  }

  const handleGuardarEmpresa = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Configuracion de empresa guardada')
    }, 1000)
  }

  const cargarDatosPrueba = async () => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      await fetch(`${apiUrl}/seed`, { method: 'POST' })
      toast.success('Datos de prueba cargados correctamente')
    } catch (err) {
      toast.error('Error al cargar datos de prueba')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'empresa', label: 'Empresa', icon: Building },
    { id: 'datos', label: 'Datos', icon: Database },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 mt-1">Personaliza tu experiencia ADBMX</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'perfil' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Perfil de Usuario</h2>
              <form onSubmit={handleGuardarPerfil} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={perfil.nombre}
                        onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={perfil.email}
                        onChange={(e) => setPerfil({...perfil, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={perfil.telefono}
                        onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Puesto</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={perfil.puesto}
                        onChange={(e) => setPerfil({...perfil, puesto: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Configuracion de Empresa</h2>
              <form onSubmit={handleGuardarEmpresa} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la empresa</label>
                    <input
                      type="text"
                      value={empresa.nombre}
                      onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Industria</label>
                    <select
                      value={empresa.industria}
                      onChange={(e) => setEmpresa({...empresa, industria: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Manufactura">Manufactura</option>
                      <option value="Retail">Retail</option>
                      <option value="Salud">Salud</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tamano de empresa</label>
                    <select
                      value={empresa.tamaño}
                      onChange={(e) => setEmpresa({...empresa, tamaño: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="1-10">1-10 empleados</option>
                      <option value="10-50">10-50 empleados</option>
                      <option value="50-200">50-200 empleados</option>
                      <option value="200-1000">200-1000 empleados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Moneda</label>
                    <select
                      value={empresa.moneda}
                      onChange={(e) => setEmpresa({...empresa, moneda: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dolar</option>
                      <option value="GBP">GBP - Libra</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Datos de Prueba</h2>
              <p className="text-gray-500 text-sm mb-6">
                Carga datos de ejemplo para probar la aplicacion. Esto eliminara los datos actuales.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  Esta accion eliminara todos los datos actuales y los reemplazara con datos de prueba.
                </p>
              </div>
              <button
                onClick={cargarDatosPrueba}
                disabled={loading}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex items-center gap-2"
              >
                <Upload size={16} />
                {loading ? 'Cargando...' : 'Cargar datos de prueba'}
              </button>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Preferencias de Notificaciones</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notificaciones por Email', desc: 'Recibe alertas importantes por correo' },
                  { key: 'tareas', label: 'Recordatorios de Tareas', desc: 'Alertas de tareas pendientes' },
                  { key: 'oportunidades', label: 'Cambios en Oportunidades', desc: 'Notificaciones de estado' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotificaciones(prev => ({...prev, [item.key]: !prev[item.key]}))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notificaciones[item.key] ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificaciones[item.key] ? 'left-5.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Seguridad</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Cambiar Contrasena</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Contrasena actual"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contrasena"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar contrasena"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                    <button className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
                      Actualizar Contrasena
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configuracion
