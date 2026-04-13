import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, Search, X, Phone, Mail, Users, RefreshCw, CheckCircle, Trash2, Calendar } from 'lucide-react'

const Tareas = () => {
  const [tareas, setTareas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [prioridadFiltro, setPrioridadFiltro] = useState('todas')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    prioridad: 'media',
    estado: 'pendiente',
    fechaVencimiento: '',
  })

  const { user } = useAuth()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    setTareas([
      {
        id: 1,
        titulo: 'Seguimiento con TechCorp',
        descripcion: 'Llamar para discutir nueva propuesta comercial',
        tipo: 'llamada',
        prioridad: 'alta',
        estado: 'pendiente',
        fechaVencimiento: '2024-11-15',
        cliente: { nombre: 'TechCorp SA' },
      },
      {
        id: 2,
        titulo: 'Preparar dokumentacion contrato',
        descripcion: 'Preparar contrato para nuevo cliente',
        tipo: 'otro',
        prioridad: 'media',
        estado: 'en_progreso',
        fechaVencimiento: '2024-11-18',
        cliente: { nombre: 'Innovate Labs' },
      },
    ])

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const agregarTarea = async (e) => {
    e.preventDefault()
    const nuevaTareaCompleta = {
      id: Date.now(),
      ...nuevaTarea,
      usuario: { nombre: user?.nombre || 'Usuario' },
      cliente: { nombre: 'Cliente General' },
    }
    
    setTareas(prev => [nuevaTareaCompleta, ...prev])
    setNuevaTarea({
      titulo: '',
      descripcion: '',
      tipo: 'otro',
      prioridad: 'media',
      estado: 'pendiente',
      fechaVencimiento: '',
    })
    setMostrarForm(false)
  }

  const actualizarEstadoTarea = (id, nuevoEstado) => {
    setTareas(prev => prev.map(tarea => 
      tarea.id === id ? { ...tarea, estado: nuevoEstado } : tarea
    ))
  }

  const eliminarTarea = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setTareas(prev => prev.filter(tarea => tarea.id !== id))
    }
  }

  const tareasFiltradas = tareas.filter(tarea => {
    const coincideBusqueda = tarea.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                            tarea.descripcion.toLowerCase().includes(filtro.toLowerCase())
    const coincideEstado = estadoFiltro === 'todos' || tarea.estado === estadoFiltro
    const coincidePrioridad = prioridadFiltro === 'todas' || tarea.prioridad === prioridadFiltro
    
    return coincideBusqueda && coincideEstado && coincidePrioridad
  })

  const getPrioridadColor = (prioridad) => {
    const colores = {
      baja: 'bg-green-100 text-green-800 border border-green-200',
      media: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      alta: 'bg-orange-100 text-orange-800 border border-orange-200',
      urgente: 'bg-red-100 text-red-800 border border-red-200'
    }
    return colores[prioridad] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-gray-100 text-gray-800 border border-gray-200',
      en_progreso: 'bg-blue-100 text-blue-800 border border-blue-200',
      completada: 'bg-green-100 text-green-800 border border-green-200',
      cancelada: 'bg-red-100 text-red-800 border border-red-200'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  const getTipoIcono = (tipo) => {
    const iconos = {
      llamada: Phone,
      email: Mail,
      reunion: Users,
      seguimiento: RefreshCw,
      otro: CheckCircle
    }
    const Icon = iconos[tipo] || CheckCircle
    return <Icon size={16} />
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isMobile ? 'Tareas' : 'Gestion de Tareas'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            {isMobile ? 'Organiza actividades' : 'Organiza y gestiona tus actividades'}
          </p>
        </div>
        <button 
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          onClick={() => setMostrarForm(true)}
        >
          <Plus size={18} />
          {isMobile ? 'Nueva' : 'Nueva Tarea'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
          />
        </div>
        <select 
          value={estadoFiltro} 
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>
        <select 
          value={prioridadFiltro} 
          onChange={(e) => setPrioridadFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
        >
          <option value="todas">Todas</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Nueva Tarea</h2>
                <button 
                  onClick={() => setMostrarForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={agregarTarea} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Titulo de la tarea *"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    placeholder="Descripcion..."
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <select
                    value={nuevaTarea.tipo}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, tipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                  >
                    <option value="llamada">Llamada</option>
                    <option value="email">Email</option>
                    <option value="reunion">Reunion</option>
                    <option value="otro">Otro</option>
                  </select>
                  
                  <select
                    value={nuevaTarea.prioridad}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, prioridad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <select
                    value={nuevaTarea.estado}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                  
                  <input
                    type="date"
                    value={nuevaTarea.fechaVencimiento}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, fechaVencimiento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button type="submit" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-1 text-sm sm:text-base">
                  Crear Tarea
                </button>
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-gray-200">
            {tareasFiltradas.map(tarea => (
              <div key={tarea.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
                    {tarea.titulo}
                  </h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button 
                      onClick={() => actualizarEstadoTarea(tarea.id, 
                        tarea.estado === 'completada' ? 'pendiente' : 'completada'
                      )}
                      className={`text-xs px-2 py-1 rounded ${
                        tarea.estado === 'completada' 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {tarea.estado === 'completada' ? 'Reabrir' : 'Hecho'}
                    </button>
                    <button 
                      onClick={() => eliminarTarea(tarea.id)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {tarea.descripcion}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPrioridadColor(tarea.prioridad)}`}>
                    {tarea.prioridad}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(tarea.estado)}`}>
                    {tarea.estado.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full flex items-center gap-1">
                    {getTipoIcono(tarea.tipo)} {tarea.tipo}
                  </span>
                </div>
                
                {tarea.fechaVencimiento && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar size={12} />
                    Vence: {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Vencimiento
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tareasFiltradas.map(tarea => (
                  <tr key={tarea.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tarea.titulo}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{tarea.descripcion}</div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{getTipoIcono(tarea.tipo)}</span>
                        <span className="text-sm text-gray-900 capitalize">{tarea.tipo}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(tarea.estado)}`}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleDateString() : 'Sin fecha'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => actualizarEstadoTarea(tarea.id, 
                            tarea.estado === 'completada' ? 'pendiente' : 'completada'
                          )}
                          className={`text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1 ${
                            tarea.estado === 'completada' 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <CheckCircle size={12} />
                          {tarea.estado === 'completada' ? 'Reabrir' : 'Completar'}
                        </button>
                        <button 
                          onClick={() => eliminarTarea(tarea.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors duration-200 flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tareasFiltradas.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tareas</h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Comienza agregando tu primera tarea</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base inline-flex items-center gap-2"
            onClick={() => setMostrarForm(true)}
          >
            <Plus size={18} />
            Agregar Primera Tarea
          </button>
        </div>
      )}
    </div>
  )
}

export default Tareas