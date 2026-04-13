import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Edit2, Trash2, Star } from 'lucide-react'
import api from '../lib/api'
import Modal from './ui/Modal'
import EmptyState from './ui/EmptyState'
import { TableSkeleton } from './ui/Skeleton'
import { useToast } from './ui/Toast'

const Contactos = () => {
  const [contactos, setContactos] = useState([])
  const [clientes, setClientes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [contactoEditando, setContactoEditando] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    puesto: '',
    departamento: '',
    clienteId: '',
    esPrincipal: false,
  })

  useEffect(() => { cargarDatos(); }, [])

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [contactosRes, clientesRes] = await Promise.all([
        api.get('/contactos'),
        api.get('/clientes')
      ])
      setContactos(contactosRes.data.contactos || [])
      setClientes(clientesRes.data.clientes || [])
    } catch { toast.error('Error al cargar contactos') }
    finally { setLoading(false) }
  }, [toast])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...formData, clienteId: formData.clienteId ? parseInt(formData.clienteId) : null }
      if (contactoEditando) {
        await api.put(`/contactos/${contactoEditando.id}`, payload)
        toast.success('Contacto actualizado')
      } else {
        await api.post('/contactos', payload)
        toast.success('Contacto creado')
      }
      await cargarDatos()
      limpiarForm()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al guardar') }
    finally { setLoading(false) }
  }

  const editar = (contacto) => {
    setContactoEditando(contacto)
    setFormData({
      nombre: contacto.nombre || '',
      email: contacto.email || '',
      telefono: contacto.telefono || '',
      puesto: contacto.puesto || '',
      departamento: contacto.departamento || '',
      clienteId: contacto.clienteId || '',
      esPrincipal: contacto.esPrincipal || false,
    })
    setMostrarForm(true)
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/contactos/${id}`)
      toast.success('Contacto eliminado')
      await cargarDatos()
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar') }
  }

  const confirmarEliminar = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el contacto "${nombre}"?`)) {
      eliminar(id);
    }
  };

  const limpiarForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      puesto: '',
      departamento: '',
      clienteId: '',
      esPrincipal: false,
    })
    setContactoEditando(null)
    setMostrarForm(false)
  }

  const contactosFiltrados = contactos.filter(contacto => {
    const matchSearch = (contacto.nombre?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
                       (contacto.email?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
                       (contacto.cliente?.nombre?.toLowerCase() || '').includes(filtro.toLowerCase())
    return matchSearch
  })

  const departamentos = ['Direccion', 'Ventas', 'Marketing', 'Tecnologia', 'Operaciones', 'Finanzas', 'Recursos Humanos']

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
          <p className="text-gray-500 mt-1">{contactos.length} contactos en total</p>
        </div>
        <button 
          onClick={() => setMostrarForm(true)}
          className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 text-sm"
        >
          + Nuevo Contacto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
        />
      </div>

      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={contactoEditando ? 'Editar Contacto' : 'Nuevo Contacto'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Puesto</label>
              <input
                type="text"
                value={formData.puesto}
                onChange={(e) => setFormData({...formData, puesto: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Departamento</label>
              <select
                value={formData.departamento}
                onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Seleccionar</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente</label>
              <select
                value={formData.clienteId}
                onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Sin cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="esPrincipal"
                checked={formData.esPrincipal}
                onChange={(e) => setFormData({...formData, esPrincipal: e.target.checked})}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="esPrincipal" className="text-sm text-gray-700 flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                Contacto principal
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex-1">
              {loading ? 'Guardando...' : contactoEditando ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={limpiarForm} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      </Modal>

      {loading && contactos.length === 0 ? <TableSkeleton rows={5} cols={5} /> :
       contactosFiltrados.length === 0 ? <EmptyState icon="users" title="No hay contactos" description="Agrega tu primer contacto" actionLabel="Crear" onAction={() => setMostrarForm(true)} /> :
       (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contactosFiltrados.map(contacto => (
                <tr key={contacto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {contacto.nombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contacto.nombre}</p>
                        <p className="text-xs text-gray-500">{contacto.puesto || 'Sin puesto'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-900">{contacto.email || '-'}</p>
                    <p className="text-xs text-gray-500">{contacto.telefono || '-'}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-900">
                    {contacto.cliente?.nombre || '-'}
                  </td>
                  <td className="px-4 py-4">
                    {contacto.esPrincipal ? (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 flex items-center gap-1 w-fit">
                        <Star size={12} /> Principal
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Secundario</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => editar(contacto)} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded">Editar</button>
                      <button onClick={() => confirmarEliminar(contacto.id, contacto.nombre)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Contactos