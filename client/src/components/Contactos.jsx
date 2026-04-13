import { useState, useEffect } from 'react'
import { Plus, Search, X, Edit2, Trash2, User, Mail, Phone, Building, Star } from 'lucide-react'

const Contactos = () => {
  const [contactos, setContactos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [contactoEditando, setContactoEditando] = useState(null)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    puesto: '',
    departamento: '',
    clienteId: '',
    esPrincipal: false,
    notas: ''
  })

  useEffect(() => {
    setContactos([
      {
        id: 1,
        nombre: 'Ana Martinez',
        email: 'ana.martinez@techcorp.com',
        telefono: '+34 611 223 344',
        puesto: 'Directora de Marketing',
        departamento: 'Marketing',
        cliente: { nombre: 'TechCorp SA', id: 1 },
        esPrincipal: true,
        fechaCreacion: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'David Lopez',
        email: 'david.lopez@innovate.com',
        telefono: '+34 622 334 455',
        puesto: 'CTO',
        departamento: 'Tecnologia',
        cliente: { nombre: 'Innovate Labs', id: 2 },
        esPrincipal: true,
        fechaCreacion: new Date('2024-02-20')
      }
    ])
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (contactoEditando) {
      setContactos(prev => prev.map(contacto => 
        contacto.id === contactoEditando.id ? { ...contacto, ...formData } : contacto
      ))
    } else {
      const nuevoContacto = {
        id: Date.now(),
        ...formData,
        cliente: { nombre: 'Cliente', id: 1 },
        fechaCreacion: new Date()
      }
      setContactos(prev => [nuevoContacto, ...prev])
    }
    limpiarForm()
  }

  const eliminarContacto = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contacto?')) {
      setContactos(prev => prev.filter(contacto => contacto.id !== id))
    }
  }

  const limpiarForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      puesto: '',
      departamento: '',
      clienteId: '',
      esPrincipal: false,
      notas: ''
    })
    setContactoEditando(null)
    setMostrarForm(false)
  }

  const contactosFiltrados = contactos.filter(contacto =>
    contacto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    contacto.email.toLowerCase().includes(filtro.toLowerCase()) ||
    contacto.cliente.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Gestion de contactos comerciales</p>
        </div>
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Nuevo Contacto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border text-center">
          Total: {contactosFiltrados.length}
        </div>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {contactoEditando ? 'Editar Contacto' : 'Nuevo Contacto'}
                </h2>
                <button onClick={limpiarForm} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.puesto}
                        onChange={(e) => setFormData({...formData, puesto: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <select
                      value={formData.departamento}
                      onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option value="Direccion">Direccion</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Operaciones">Operaciones</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="esPrincipal"
                      checked={formData.esPrincipal}
                      onChange={(e) => setFormData({...formData, esPrincipal: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="esPrincipal" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      Contacto principal
                    </label>
                  </div>
                </div>
                
                <div>
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
                  {contactoEditando ? 'Actualizar Contacto' : 'Crear Contacto'}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Informacion</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactosFiltrados.map(contacto => (
                <tr key={contacto.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contacto.nombre}</div>
                        <div className="text-sm text-gray-500">{contacto.puesto}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {contacto.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {contacto.telefono}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Building size={14} className="text-gray-400" />
                      {contacto.cliente.nombre}
                    </div>
                    <div className="text-sm text-gray-500">{contacto.departamento}</div>
                  </td>
                  <td className="px-4 py-4">
                    {contacto.esPrincipal ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Star size={12} className="mr-1" />
                        Principal
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Secundario
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarContacto(contacto.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={14} />
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

      {contactosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contactos</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primer contacto comercial</p>
          <button 
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Agregar Primer Contacto
          </button>
        </div>
      )}
    </div>
  )
}

export default Contactos