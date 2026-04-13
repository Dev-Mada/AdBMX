import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Mail, Phone, Building, User, Filter, Download, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    notas: '',
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/clientes');
      const data = response.data.clientes || response.data || [];
      setClientes(data);
    } catch (err) {
      setError('Error al cargar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        valorPotencial: formData.valorPotencial ? parseFloat(formData.valorPotencial) : null,
      };

      if (clienteEditando) {
        const response = await api.put(`/clientes/${clienteEditando.id}`, payload);
        if (response.data.success) {
          await cargarClientes();
          setMostrarForm(false);
          limpiarForm();
        }
      } else {
        const response = await api.post('/clientes', payload);
        if (response.data.success) {
          await cargarClientes();
          setMostrarForm(false);
          limpiarForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  const editarCliente = (cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      empresa: cliente.empresa || '',
      industria: cliente.industria || '',
      direccion: cliente.direccion || '',
      estado: cliente.estado || 'prospecto',
      valorPotencial: cliente.valorPotencial || '',
      fuente: cliente.fuente || '',
      notas: cliente.notas || '',
    });
    setMostrarForm(true);
  };

  const eliminarCliente = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      setLoading(true);
      try {
        const response = await api.delete(`/clientes/${id}`);
        if (response.data.success) {
          await cargarClientes();
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar cliente');
      } finally {
        setLoading(false);
      }
    }
  };

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
      notas: '',
    });
    setClienteEditando(null);
    setMostrarForm(false);
    setError(null);
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const coincideBusqueda =
      (cliente.nombre?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      (cliente.email?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      (cliente.empresa?.toLowerCase() || '').includes(filtro.toLowerCase());
    const coincideEstado = estadoFiltro === 'todos' || cliente.estado === estadoFiltro;
    return coincideBusqueda && coincideEstado;
  });

  const getEstadoColor = (estado) => {
    const colores = {
      prospecto: 'bg-blue-100 text-blue-800 border-blue-200',
      cliente: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      inactivo: 'bg-slate-100 text-slate-800 border-slate-200',
      perdido: 'bg-red-100 text-red-800 border-red-200',
    };
    return colores[estado] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      prospecto: 'Prospecto',
      cliente: 'Cliente',
      inactivo: 'Inactivo',
      perdido: 'Perdido',
    };
    return textos[estado] || estado;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            {clientes.length} clientes en tu cartera
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={cargarClientes}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
          >
            <Plus size={18} />
            Agregar Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente</option>
          <option value="inactivo">Inactivo</option>
          <option value="perdido">Perdido</option>
        </select>
        <div className="flex items-center justify-center gap-2 bg-slate-100 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700">
          <span>Total:</span>
          <span className="text-blue-600 font-bold">{clientesFiltrados.length}</span>
        </div>
      </div>

      <Modal
        isOpen={mostrarForm}
        onClose={limpiarForm}
        title={clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Juan Perez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="juan@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefono</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Industria</label>
              <select
                value={formData.industria}
                onChange={(e) => setFormData({ ...formData, industria: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Seleccionar industria</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Salud">Salud</option>
                <option value="Educacion">Educacion</option>
                <option value="Comercio">Comercio</option>
                <option value="Manufactura">Manufactura</option>
                <option value="Servicios">Servicios</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="inactivo">Inactivo</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Valor Potencial</label>
              <input
                type="number"
                value={formData.valorPotencial}
                onChange={(e) => setFormData({ ...formData, valorPotencial: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fuente</label>
              <select
                value={formData.fuente}
                onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Direccion</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Calle, numero, ciudad"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
              <textarea
                rows="3"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Notas adicionales sobre el cliente..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : clienteEditando ? (
                'Actualizar Cliente'
              ) : (
                'Crear Cliente'
              )}
            </button>
            <button
              type="button"
              onClick={limpiarForm}
              className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {loading && clientes.length === 0 ? (
        <TableSkeleton rows={5} cols={5} />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState
          icon="users"
          title="No hay clientes"
          description="Comienza agregando tu primer cliente para gestionar tu cartera"
          actionLabel="Agregar Cliente"
          onAction={() => setMostrarForm(true)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Empresa</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell">Valor</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {cliente.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{cliente.nombre}</div>
                          <div className="text-sm text-slate-500 hidden sm:block">{cliente.industria || 'Sin industria'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-slate-900">{cliente.email}</div>
                      <div className="text-sm text-slate-500">{cliente.telefono || '-'}</div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-slate-900">{cliente.empresa || '-'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEstadoColor(cliente.estado)}`}>
                        {getEstadoTexto(cliente.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <div className="text-sm font-semibold text-slate-900">
                        {cliente.valorPotencial ? `$${parseFloat(cliente.valorPotencial).toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarCliente(cliente)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => eliminarCliente(cliente.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default Clientes;
