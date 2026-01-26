import { useState, useEffect } from 'react'

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroEtapa, setFiltroEtapa] = useState('todas')
  const [oportunidadEditando, setOportunidadEditando] = useState(null)

  const [formData, setFormData] = useState({
    titulo: '',
    clienteId: '',
    valor: '',
    etapa: 'nuevo',
    probabilidad: 10,
    fechaCierre: '',
    descripcion: '',
    notas: ''
  })

  const etapas = [
    { id: 'nuevo', nombre: 'Nuevo', probabilidad: 10, color: 'bg-blue-100 text-blue-800' },
    { id: 'calificado', nombre: 'Calificado', probabilidad: 30, color: 'bg-green-100 text-green-800' },
    { id: 'propuesta', nombre: 'Propuesta', probabilidad: 50, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'negociacion', nombre: 'Negociación', probabilidad: 70, color: 'bg-orange-100 text-orange-800' },
    { id: 'ganado', nombre: 'Ganado', probabilidad: 100, color: 'bg-purple-100 text-purple-800' },
    { id: 'perdido', nombre: 'Perdido', probabilidad: 0, color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    // Datos de ejemplo
    setOportunidades([
      {
        id: 1,
        titulo: 'Implementación CRM Enterprise',
        cliente: { nombre: 'TechCorp SA', id: 1 },
        valor: 50000,
        etapa: 'propuesta',
        probabilidad: 50,
        fechaCierre: '2024-12-15',
        descripcion: 'Implementación completa del sistema CRM',
        fechaCreacion: new Date('2024-10-01')
      },
      {
        id: 2,
        titulo: 'Soporte Técnico Anual',
        cliente: { nombre: 'Innovate Labs', id: 2 },
        valor: 25000,
        etapa: 'negociacion',
        probabilidad: 70,
        fechaCierre: '2024-11-30',
        descripcion: 'Contrato de soporte técnico premium',
        fechaCreacion: new Date('2024-09-15')
      }
    ])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (oportunidadEditando) {
      setOportunidades(prev => prev.map(op => 
        op.id === oportunidadEditando.id ? { ...op, ...formData } : op
      ))
    } else {
      const nuevaOportunidad = {
        id: Date.now(),
        ...formData,
        cliente: { nombre: 'Cliente', id: 1 }, // En una app real, buscaría el cliente
        fechaCreacion: new Date()
      }
      setOportunidades(prev => [nuevaOportunidad, ...prev])
    }
    limpiarForm()
  }

  const moverEtapa = (id, nuevaEtapa) => {
    setOportunidades(prev => prev.map(op => 
      op.id === id ? { 
        ...op, 
        etapa: nuevaEtapa,
        probabilidad: etapas.find(e => e.id === nuevaEtapa)?.probabilidad || op.probabilidad
      } : op
    ))
  }

  const eliminarOportunidad = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta oportunidad?')) {
      setOportunidades(prev => prev.filter(op => op.id !== id))
    }
  }

  const limpiarForm = () => {
    setFormData({
      titulo: '',
      clienteId: '',
      valor: '',
      etapa: 'nuevo',
      probabilidad: 10,
      fechaCierre: '',
      descripcion: '',
      notas: ''
    })
    setOportunidadEditando(null)
    setMostrarForm(false)
  }

  const oportunidadesFiltradas = filtroEtapa === 'todas' 
    ? oportunidades 
    : oportunidades.filter(op => op.etapa === filtroEtapa)

  const getValorTotalPorEtapa = (etapa) => {
    return oportunidades
      .filter(op => op.etapa === etapa)
      .reduce((sum, op) => sum + (op.valor || 0), 0)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Oportunidades</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Pipeline de ventas y seguimiento</p>
        </div>
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base"
        >
          Nueva Oportunidad
        </button>
      </div>

      {/* Resumen del Pipeline */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {etapas.map(etapa => (
          <div key={etapa.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {oportunidades.filter(op => op.etapa === etapa.id).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">{etapa.nombre}</div>
            <div className="text-xs text-gray-500 mt-1">
              ${getValorTotalPorEtapa(etapa.id).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="todas">Todas las etapas</option>
          {etapas.map(etapa => (
            <option key={etapa.id} value={etapa.id}>{etapa.nombre}</option>
          ))}
        </select>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border flex-1 text-center">
          Valor total del pipeline: ${oportunidades.reduce((sum, op) => sum + (op.valor || 0), 0).toLocaleString()}
        </div>
      </div>

      {/* Modal Form */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {oportunidadEditando ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
                </h2>
                <button onClick={limpiarForm} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                    <select
                      value={formData.etapa}
                      onChange={(e) => setFormData({...formData, etapa: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {etapas.map(etapa => (
                        <option key={etapa.id} value={etapa.id}>{etapa.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probabilidad</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={formData.probabilidad}
                        onChange={(e) => setFormData({...formData, probabilidad: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{formData.probabilidad}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cierre</label>
                    <input
                      type="date"
                      value={formData.fechaCierre}
                      onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    rows="2"
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex-1">
                  {oportunidadEditando ? 'Actualizar' : 'Crear Oportunidad'}
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

      {/* Lista de Oportunidades */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oportunidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etapa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Probabilidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cierre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {oportunidadesFiltradas.map(oportunidad => {
                const etapa = etapas.find(e => e.id === oportunidad.etapa)
                return (
                  <tr key={oportunidad.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{oportunidad.titulo}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{oportunidad.descripcion}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{oportunidad.cliente.nombre}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${oportunidad.valor?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${etapa?.color}`}>
                        {etapa?.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${oportunidad.probabilidad}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{oportunidad.probabilidad}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-900">
                        {oportunidad.fechaCierre ? new Date(oportunidad.fechaCierre).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <select 
                          value={oportunidad.etapa}
                          onChange={(e) => moverEtapa(oportunidad.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {etapas.map(etapa => (
                            <option key={etapa.id} value={etapa.id}>Mover a {etapa.nombre}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => eliminarOportunidad(oportunidad.id)}
                          className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {oportunidadesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay oportunidades</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primera oportunidad de venta</p>
          <button 
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Agregar Primera Oportunidad
          </button>
        </div>
      )}
    </div>
  )
}

export default Oportunidades