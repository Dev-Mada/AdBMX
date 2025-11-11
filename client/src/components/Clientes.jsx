import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [nuevoCliente, setNuevoCliente] = useState({
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
    try {
      setLoading(true)
      const token = localStorage.getItem('adbmx_token')
      const response = await fetch(`http://localhost:5000/api/clientes?search=${filtro}&estado=${estadoFiltro}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const agregarCliente = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('adbmx_token')
      const response = await fetch('http://localhost:5000/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoCliente)
      })
      
      if (response.ok) {
        setNuevoCliente({
          nombre: '', email: '', telefono: '', empresa: '', industria: '', 
          direccion: '', estado: 'prospecto', valorPotencial: '', fuente: '', notas: ''
        })
        setMostrarForm(false)
        cargarClientes()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const eliminarCliente = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const token = localStorage.getItem('adbmx_token')
        await fetch(`http://localhost:5000/api/clientes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        cargarClientes()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [filtro, estadoFiltro])

  const getEstadoColor = (estado) => {
    const colores = {
      prospecto: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      perdido: 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Clientes</h1>
          <p className="text-gray-600">Administra tu cartera de clientes y prospectos</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setMostrarForm(true)}
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar clientes por nombre, empresa o email..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="form-input flex-1"
        />
        <select 
          value={estadoFiltro} 
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="form-input w-48"
        >
          <option value="todos">Todos los estados</option>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Modal de formulario */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Nuevo Cliente</h2>
                <button 
                  onClick={() => setMostrarForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={agregarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                  className="form-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  value={nuevoCliente.empresa}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, empresa: e.target.value})}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Industria"
                  value={nuevoCliente.industria}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, industria: e.target.value})}
                  className="form-input"
                />
                <select
                  value={nuevoCliente.estado}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, estado: e.target.value})}
                  className="form-input"
                >
                  <option value="prospecto">Prospecto</option>
                  <option value="cliente">Cliente Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="perdido">Perdido</option>
                </select>
                <input
                  type="number"
                  placeholder="Valor Potencial"
                  value={nuevoCliente.valorPotencial}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, valorPotencial: e.target.value})}
                  className="form-input"
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Fuente"
                  value={nuevoCliente.fuente}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, fuente: e.target.value})}
                  className="form-input"
                />
              </div>
              <textarea
                placeholder="Notas adicionales..."
                value={nuevoCliente.notas}
                onChange={(e) => setNuevoCliente({...nuevoCliente, notas: e.target.value})}
                rows="4"
                className="form-input"
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Crear Cliente
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando clientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clientes.map(cliente => (
            <div key={cliente.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{cliente.nombre}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cliente.estado)}`}>
                  {cliente.estado}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="w-6">📧</span>
                  {cliente.email}
                </p>
                {cliente.telefono && (
                  <p className="flex items-center">
                    <span className="w-6">📞</span>
                    {cliente.telefono}
                  </p>
                )}
                {cliente.empresa && (
                  <p className="flex items-center">
                    <span className="w-6">🏢</span>
                    {cliente.empresa}
                  </p>
                )}
                {cliente.valorPotencial && (
                  <p className="flex items-center">
                    <span className="w-6">💰</span>
                    ${parseFloat(cliente.valorPotencial).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button className="btn-secondary text-xs py-1 flex-1">📅 Reunión</button>
                <button className="btn-secondary text-xs py-1 flex-1">✉️ Email</button>
                <button 
                  className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded hover:bg-red-200 transition-colors"
                  onClick={() => eliminarCliente(cliente.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {clientes.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay clientes</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primer cliente</p>
          <button 
            className="btn-primary"
            onClick={() => setMostrarForm(true)}
          >
            + Agregar Primer Cliente
          </button>
        </div>
      )}
    </div>
  )
}

export default Clientes