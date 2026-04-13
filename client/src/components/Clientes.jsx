import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', empresa: '', industria: '', direccion: '', estado: 'prospecto', valorPotencial: '', fuente: '', notas: '',
  });

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data.clientes || []);
    } catch {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, valorPotencial: formData.valorPotencial ? parseFloat(formData.valorPotencial) : null };
      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando.id}`, payload);
        toast.success('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', payload);
        toast.success('Cliente creado correctamente');
      }
      await cargarClientes();
      limpiarForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const editarCliente = (cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre || '', email: cliente.email || '', telefono: cliente.telefono || '',
      empresa: cliente.empresa || '', industria: cliente.industria || '', direccion: cliente.direccion || '',
      estado: cliente.estado || 'prospecto', valorPotencial: cliente.valorPotencial || '',
      fuente: cliente.fuente || '', notas: cliente.notas || '',
    });
    setMostrarForm(true);
  };

  const eliminarCliente = async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente eliminado');
      await cargarClientes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const confirmarEliminar = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente "${nombre}"?`)) {
      eliminarCliente(id);
    }
  };

  const limpiarForm = () => {
    setFormData({ nombre: '', email: '', telefono: '', empresa: '', industria: '', direccion: '', estado: 'prospecto', valorPotencial: '', fuente: '', notas: '' });
    setClienteEditando(null);
    setMostrarForm(false);
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchSearch = (c.nombre?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
                       (c.email?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
                       (c.empresa?.toLowerCase() || '').includes(filtro.toLowerCase());
    return matchSearch && (estadoFiltro === 'todos' || c.estado === estadoFiltro);
  });

  const getEstadoBadge = (estado) => {
    const map = { prospecto: 'bg-blue-50 text-blue-700', cliente: 'bg-green-50 text-green-700', inactivo: 'bg-gray-100 text-gray-600', perdido: 'bg-red-50 text-red-700' };
    return map[estado] || map.prospecto;
  };

  const getEstadoTexto = (estado) => ({ prospecto: 'Prospecto', cliente: 'Cliente', inactivo: 'Inactivo', perdido: 'Perdido' })[estado] || estado;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{clientes.length} clientes en total</p>
        </div>
        <button onClick={() => setMostrarForm(true)} className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm">
          + Agregar cliente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Buscar por nombre, email o empresa..." value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm">
          <option value="todos">Todos</option>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente</option>
          <option value="inactivo">Inactivo</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={clienteEditando ? 'Editar cliente' : 'Nuevo cliente'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
              <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
              <input type="text" value={formData.empresa} onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Industria</label>
              <select value={formData.industria} onChange={(e) => setFormData({...formData, industria: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">Seleccionar</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Salud">Salud</option>
                <option value="Comercio">Comercio</option>
                <option value="Otro">Otro</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="inactivo">Inactivo</option>
                <option value="perdido">Perdido</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Valor potencial</label>
              <input type="number" value={formData.valorPotencial} onChange={(e) => setFormData({...formData, valorPotencial: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Fuente</label>
              <select value={formData.fuente} onChange={(e) => setFormData({...formData, fuente: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">Seleccionar</option>
                <option value="web">Sitio Web</option>
                <option value="referencia">Referencia</option>
                <option value="redes">Redes Sociales</option>
                <option value="evento">Evento</option>
              </select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Direccion</label>
              <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
              <textarea rows="2" value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex-1">
              {loading ? 'Guardando...' : clienteEditando ? 'Actualizar' : 'Crear cliente'}
            </button>
            <button type="button" onClick={limpiarForm} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      </Modal>

      {loading && clientes.length === 0 ? <TableSkeleton rows={5} cols={5} /> :
       clientesFiltrados.length === 0 ? <EmptyState icon="users" title="No hay clientes" description="Agrega tu primer cliente para comenzar" actionLabel="Agregar cliente" onAction={() => setMostrarForm(true)} /> :
       (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientesFiltrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {c.nombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div><p className="text-sm font-medium text-gray-900">{c.nombre}</p><p className="text-xs text-gray-500">{c.industria || 'Sin industria'}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell"><p className="text-sm text-gray-900">{c.email}</p><p className="text-xs text-gray-500">{c.telefono || '-'}</p></td>
                  <td className="px-4 py-4 hidden lg:table-cell text-sm text-gray-900">{c.empresa || '-'}</td>
                  <td className="px-4 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getEstadoBadge(c.estado)}`}>{getEstadoTexto(c.estado)}</span></td>
                  <td className="px-4 py-4 hidden xl:table-cell text-sm font-medium text-gray-900">{c.valorPotencial ? `$${parseFloat(c.valorPotencial).toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => editarCliente(c)} className="text-gray-500 hover:text-gray-900 text-sm px-2 py-1 hover:bg-gray-100 rounded">Editar</button>
                      <button onClick={() => confirmarEliminar(c.id, c.nombre)} className="text-red-600 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Clientes;
