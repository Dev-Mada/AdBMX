import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    industria: '',
    direccion: '',
    estado: 'prospecto',
    valorPotencial: '',
    fuente: '',
    notas: ''
  })

  const { user } = useAuth()

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    setLoading(true)
    // Simulación de datos
    setTimeout(() => {
      setClientes([
        {
          id: 1,
          nombre: 'María González',
          email: 'maria@techcorp.com',
          telefono: '+34 612 345 678',
          empresa: 'TechCorp SA',
          industria: 'Tecnología',
          estado: 'cliente',
          valorPotencial: 50000,
          fuente: 'Referencia',
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Carlos Rodríguez',
          email: 'carlos@innovate.com',
          telefono: '+34 623 456 789',
          empresa: 'Innovate Labs',
          industria: 'Consultoría',
          estado: 'prospecto',
          valorPotencial: 75000,
          fuente: 'Web',
          fechaCreacion: new Date('2024-02-20')
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (clienteEditando) {
      // Editar cliente
      setClientes(prev => prev.map(cliente => 
        cliente.id === clienteEditando.id 
          ? { ...cliente, ...formData }
          : cliente
      ))
    } else {
      // Nuevo cliente
      const nuevoCliente = {
        id: Date.now(),
        ...formData,
        fechaCreacion: new Date(),
        creadoPor: user?.nombre
      }
      setClientes(prev => [nuevoCliente, ...prev])
    }
    limpiarForm()
  }

  const editarCliente = (cliente) => {
    setClienteEditando(cliente)
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      empresa: cliente.empresa,
      industria: cliente.industria,
      direccion: cliente.direccion || '',
      estado: cliente.estado,
      valorPotencial: cliente.valorPotencial || '',
      fuente: cliente.fuente || '',
      notas: cliente.notas || ''
    })
    setMostrarForm(true)
  }

  const eliminarCliente = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      setClientes(prev => prev.filter(cliente => cliente.id !== id))
    }
  }

  const limpiarForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      industria: '',
      direccion: '',
      estado: 'prospecto',
      valorPotencial: '',
      fuente: '',
      notas: ''
    })
    setClienteEditando(null)
    setMostrarForm(false)
  }

  const clientesFiltrados = clientes.filter(cliente => {
    const coincideBusqueda = cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                            cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
                            cliente.empresa.toLowerCase().includes(filtro.toLowerCase())
    const coincideEstado = estadoFiltro === 'todos' || cliente.estado === estadoFiltro
    return coincideBusqueda && coincideEstado
  })

  const getEstadoColor = (estado) => {
    const colores = {
      prospecto: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      perdido: 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoTexto = (estado) => {
    const textos = {
      prospecto: 'Prospecto',
      cliente: 'Cliente Activo',
      inactivo: 'Inactivo',
      perdido: 'Perdido'
    }
    return textos[estado] || estado
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Gestiona tu cartera de clientes</p>
        </div>
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base"
        >
          Agregar Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o empresa..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select 
          value={estadoFiltro} 
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="perdido">Perdido</option>
        </select>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border text-center">
          Total: {clientesFiltrados.length}
        </div>
      </div>

      {/* Modal Form */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button 
                  onClick={limpiarForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
                  <input
                    type="text"
                    value={formData.industria}
                    onChange={(e) => setFormData({...formData, industria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="prospecto">Prospecto</option>
                    <option value="cliente">Cliente Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Potencial</label>
                  <input
                    type="number"
                    value={formData.valorPotencial}
                    onChange={(e) => setFormData({...formData, valorPotencial: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
                  <select
                    value={formData.fuente}
                    onChange={(e) => setFormData({...formData, fuente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Seleccionar fuente</option>
                    <option value="web">Sitio Web</option>
                    <option value="referencia">Referencia</option>
                    <option value="redes">Redes Sociales</option>
                    <option value="evento">Evento</option>
                    <option value="publicidad">Publicidad</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    rows="3"
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex-1">
                  {clienteEditando ? 'Actualizar Cliente' : 'Crear Cliente'}
                </button>
                <button 
                  type="button" 
                  onClick={limpiarForm}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Valor Potencial</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                        <div className="text-sm text-gray-500 hidden sm:block">{cliente.industria}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{cliente.empresa}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(cliente.estado)}`}>
                        {getEstadoTexto(cliente.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <div className="text-sm text-gray-900">
                        {cliente.valorPotencial ? `$${cliente.valorPotencial.toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => editarCliente(cliente)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarCliente(cliente.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clientesFiltrados.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay clientes</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primer cliente</p>
          <button 
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Agregar Primer Cliente
          </button>
        </div>
      )}
    </div>
  )
}

export default Clientes