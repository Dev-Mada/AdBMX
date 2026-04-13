import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Building, Bell, Shield, Plug, Save, Phone, Mail, MapPin, Calendar } from 'lucide-react'

const Configuracion = () => {
  const { user } = useAuth()
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
      alert('Perfil actualizado correctamente')
    }, 1000)
  }

  const handleGuardarEmpresa = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Configuracion de empresa guardada')
    }, 1000)
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil de Usuario', icon: User },
    { id: 'empresa', label: 'Empresa', icon: Building },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'integraciones', label: 'Integraciones', icon: Plug }
  ]

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuracion</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Personaliza tu experiencia ADBMX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Perfil de Usuario
              </h2>
              <form onSubmit={handleGuardarPerfil} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={perfil.nombre}
                        onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={perfil.email}
                        onChange={(e) => setPerfil({...perfil, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={perfil.telefono}
                        onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={perfil.puesto}
                        onChange={(e) => setPerfil({...perfil, puesto: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button 
                    type="button" 
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building size={20} className="text-blue-600" />
                Configuracion de Empresa
              </h2>
              <form onSubmit={handleGuardarEmpresa} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la empresa</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={empresa.nombre}
                        onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industria</label>
                    <select
                      value={empresa.industria}
                      onChange={(e) => setEmpresa({...empresa, industria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Manufactura">Manufactura</option>
                      <option value="Retail">Retail</option>
                      <option value="Salud">Salud</option>
                      <option value="Educacion">Educacion</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamano de empresa</label>
                    <select
                      value={empresa.tamaño}
                      onChange={(e) => setEmpresa({...empresa, tamaño: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1-10">1-10 empleados</option>
                      <option value="10-50">10-50 empleados</option>
                      <option value="50-200">50-200 empleados</option>
                      <option value="200-1000">200-1000 empleados</option>
                      <option value="1000+">1000+ empleados</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                    <select
                      value={empresa.moneda}
                      onChange={(e) => setEmpresa({...empresa, moneda: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD - Dolar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - Libra Esterlina</option>
                      <option value="JPY">JPY - Yen Japones</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zona horaria</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={empresa.zonaHoraria}
                        onChange={(e) => setEmpresa({...empresa, zonaHoraria: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Guardando...' : 'Guardar Configuracion'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Preferencias de Notificaciones
              </h2>
              <div className="space-y-6">
                {Object.entries(notificaciones).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {key === 'email' && 'Notificaciones por Email'}
                        {key === 'tareas' && 'Recordatorios de Tareas'}
                        {key === 'oportunidades' && 'Cambios en Oportunidades'}
                        {key === 'reportes' && 'Reportes Semanales'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {key === 'email' && 'Recibe notificaciones importantes por email'}
                        {key === 'tareas' && 'Alertas de tareas pendientes y vencidas'}
                        {key === 'oportunidades' && 'Notificaciones cuando cambia el estado de oportunidades'}
                        {key === 'reportes' && 'Resumen semanal de metricas y rendimiento'}
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificaciones(prev => ({...prev, [key]: !value}))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Seguridad y Acceso
              </h2>
              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cambiar Contrasena</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Contrasena actual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contrasena"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nueva contrasena"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                      <Shield size={18} />
                      Actualizar Contrasena
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sesiones Activas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">Chrome - Windows</div>
                        <div className="text-xs text-gray-500">Ultima actividad: hace 2 horas</div>
                      </div>
                      <button className="text-red-600 text-sm font-medium hover:text-red-800 flex items-center gap-1">
                        Cerrar sesion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integraciones' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Plug size={20} className="text-blue-600" />
                Integraciones
              </h2>
              <div className="space-y-4">
                {[
                  { nombre: 'Google Calendar', descripcion: 'Sincroniza tus eventos y reuniones', estado: 'Conectado' },
                  { nombre: 'Slack', descripcion: 'Recibe notificaciones en tus canales', estado: 'Desconectado' },
                  { nombre: 'MailChimp', descripcion: 'Sincroniza tus listas de contactos', estado: 'Desconectado' },
                  { nombre: 'Stripe', descripcion: 'Procesa pagos y gestiona facturas', estado: 'Desconectado' }
                ].map((integracion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{integracion.nombre}</div>
                      <div className="text-sm text-gray-500">{integracion.descripcion}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        integracion.estado === 'Conectado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {integracion.estado}
                      </span>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1">
                        <Plug size={14} />
                        {integracion.estado === 'Conectado' ? 'Gestionar' : 'Conectar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configuracion