import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';
import { 
  Search, Plus, Filter, MoreVertical, Mail, Phone, 
  Building, MapPin, Edit2, Trash2, ChevronDown,
  Users, X, Check, Eye
} from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarVerCliente, setMostrarVerCliente] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteViendo, setClienteViendo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmData, setConfirmData] = useState(null);
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
    setConfirmData({ id, nombre, tipo: 'cliente' });
  };

  const verCliente = (cliente) => {
    setClienteViendo(cliente);
    setMostrarVerCliente(true);
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
    const map = { 
      prospecto: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      cliente: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      inactivo: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      perdido: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };
    return map[estado] || map.prospecto;
  };

  const getEstadoTexto = (estado) => ({ prospecto: 'Prospecto', cliente: 'Cliente', inactivo: 'Inactivo', perdido: 'Perdido' })[estado] || estado;

  const getIndustriaIcon = (industria) => {
    return <Building className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Clientes</h1>
          <p className="text-[var(--color-text-muted)] mt-1">{clientes.length} clientes en total</p>
        </div>
        <button 
          onClick={() => { limpiarForm(); setMostrarForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Agregar cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o empresa..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <select 
            value={estadoFiltro} 
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="prospecto">Prospecto</option>
            <option value="cliente">Cliente</option>
            <option value="inactivo">Inactivo</option>
            <option value="perdido">Perdido</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {loading && clientes.length === 0 ? (
          <TableSkeleton rows={5} cols={6} />
        ) : clientesFiltrados.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No hay clientes" 
            description="Agrega tu primer cliente para comenzar" 
            actionLabel="Agregar cliente" 
            onAction={() => setMostrarForm(true)} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Cliente</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4 hidden md:table-cell">Contacto</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4 hidden lg:table-cell">Empresa</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Estado</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4 hidden xl:table-cell">Valor</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {clientesFiltrados.map((c, i) => (
                  <tr key={c.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                          {c.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text-primary)]">{c.nombre}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">{c.industria || 'Sin industria'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-sm text-[var(--color-text-primary)]">{c.email}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">{c.telefono || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm text-[var(--color-text-primary)]">{c.empresa || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getEstadoBadge(c.estado)}`}>
                        {getEstadoTexto(c.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {c.valorPotencial ? `$${parseFloat(c.valorPotencial).toLocaleString()}` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => verCliente(c)} 
                          className="p-2 text-[var(--color-text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver cliente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => editarCliente(c)} 
                          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmarEliminar(c.id, c.nombre)} 
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={clienteEditando ? 'Editar cliente' : 'Nuevo cliente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Nombre *</label>
              <input 
                type="text" 
                required 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Email *</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Teléfono</label>
              <input 
                type="tel" 
                value={formData.telefono} 
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Empresa</label>
              <input 
                type="text" 
                value={formData.empresa} 
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Industria</label>
              <select 
                value={formData.industria} 
                onChange={(e) => setFormData({...formData, industria: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Seleccionar</option>
                <option value="Tecnologia">Tecnología</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Salud">Salud</option>
                <option value="Comercio">Comercio</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Estado</label>
              <select 
                value={formData.estado} 
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="inactivo">Inactivo</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Valor potencial</label>
              <input 
                type="number" 
                value={formData.valorPotencial} 
                onChange={(e) => setFormData({...formData, valorPotencial: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Fuente</label>
              <select 
                value={formData.fuente} 
                onChange={(e) => setFormData({...formData, fuente: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Seleccionar</option>
                <option value="web">Sitio Web</option>
                <option value="referencia">Referencia</option>
                <option value="redes">Redes Sociales</option>
                <option value="evento">Evento</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Dirección</label>
              <input 
                type="text" 
                value={formData.direccion} 
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Notas</label>
              <textarea 
                rows={3} 
                value={formData.notas} 
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : clienteEditando ? 'Actualizar cliente' : 'Crear cliente'}
            </button>
            <button 
              type="button" 
              onClick={limpiarForm}
              className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-xl font-semibold hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Cliente */}
      <Modal isOpen={mostrarVerCliente} onClose={() => setMostrarVerCliente(false)} title="Detalles del cliente" size="lg">
        {clienteViendo && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {clienteViendo.nombre?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{clienteViendo.nombre}</h3>
                <p className="text-[var(--color-text-muted)]">{clienteViendo.empresa || 'Sin empresa'}</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mt-1 ${getEstadoBadge(clienteViendo.estado)}`}>
                  {getEstadoTexto(clienteViendo.estado)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Email</p>
                <p className="text-[var(--color-text-primary)]">{clienteViendo.email}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-[var(--color-text-primary)]">{clienteViendo.telefono || '-'}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Industria</p>
                <p className="text-[var(--color-text-primary)]">{clienteViendo.industria || '-'}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Valor potencial</p>
                <p className="text-[var(--color-text-primary)] font-semibold">
                  {clienteViendo.valorPotencial ? `$${parseFloat(clienteViendo.valorPotencial).toLocaleString()}` : '-'}
                </p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl md:col-span-2">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Dirección</p>
                <p className="text-[var(--color-text-primary)]">{clienteViendo.direccion || '-'}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Fuente</p>
                <p className="text-[var(--color-text-primary)] capitalize">{clienteViendo.fuente || '-'}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Notas</p>
                <p className="text-[var(--color-text-primary)]">{clienteViendo.notas || '-'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
              <button 
                onClick={() => setMostrarVerCliente(false)}
                className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-xl font-semibold hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={() => confirmData && eliminarCliente(confirmData.id)}
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar el cliente "${confirmData?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Clientes;
