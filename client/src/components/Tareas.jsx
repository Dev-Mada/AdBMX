import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Phone, Mail, Users, RefreshCw, CheckCircle, Trash2, Calendar, Edit2 } from 'lucide-react';
import api from '../lib/api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [prioridadFiltro, setPrioridadFiltro] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    prioridad: 'media',
    estado: 'pendiente',
    fechaVencimiento: '',
  });

  const prioridades = [
    { id: 'baja', nombre: 'Baja', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'media', nombre: 'Media', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'alta', nombre: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'urgente', nombre: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const estados = [
    { id: 'pendiente', nombre: 'Pendiente', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { id: 'en_progreso', nombre: 'En Progreso', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'completada', nombre: 'Completada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'cancelada', nombre: 'Cancelada', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const tipos = [
    { id: 'llamada', nombre: 'Llamada', icon: Phone },
    { id: 'email', nombre: 'Email', icon: Mail },
    { id: 'reunion', nombre: 'Reunion', icon: Users },
    { id: 'seguimiento', nombre: 'Seguimiento', icon: RefreshCw },
    { id: 'otro', nombre: 'Otro', icon: CheckCircle },
  ];

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tareas');
      setTareas(response.data.tareas || response.data || []);
    } catch (err) {
      setError('Error al cargar tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };

      if (tareaEditando) {
        const response = await api.put(`/tareas/${tareaEditando.id}`, payload);
        if (response.data.success) {
          await cargarTareas();
          limpiarForm();
        }
      } else {
        const response = await api.post('/tareas', payload);
        if (response.data.success) {
          await cargarTareas();
          limpiarForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar tarea');
    } finally {
      setLoading(false);
    }
  };

  const editarTarea = (tarea) => {
    setTareaEditando(tarea);
    setFormData({
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || '',
      tipo: tarea.tipo || 'otro',
      prioridad: tarea.prioridad || 'media',
      estado: tarea.estado || 'pendiente',
      fechaVencimiento: tarea.fechaVencimiento ? tarea.fechaVencimiento.split('T')[0] : '',
    });
    setMostrarForm(true);
  };

  const eliminarTarea = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setLoading(true);
      try {
        await api.delete(`/tareas/${id}`);
        await cargarTareas();
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/tareas/${id}`, { estado: nuevoEstado });
      await cargarTareas();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const limpiarForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'otro',
      prioridad: 'media',
      estado: 'pendiente',
      fechaVencimiento: '',
    });
    setTareaEditando(null);
    setMostrarForm(false);
    setError(null);
  };

  const tareasFiltradas = tareas.filter((tarea) => {
    const coincideBusqueda =
      (tarea.titulo?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
      (tarea.descripcion?.toLowerCase() || '').includes(filtro.toLowerCase());
    const coincideEstado = estadoFiltro === 'todos' || tarea.estado === estadoFiltro;
    const coincidePrioridad = prioridadFiltro === 'todas' || tarea.prioridad === prioridadFiltro;
    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  const getPrioridadInfo = (prioridad) => prioridades.find((p) => p.id === prioridad) || prioridades[1];
  const getEstadoInfo = (estado) => estados.find((e) => e.id === estado) || estados[0];
  const getTipoInfo = (tipo) => tipos.find((t) => t.id === tipo) || tipos[4];

  const estadisticas = {
    total: tareas.length,
    pendientes: tareas.filter((t) => t.estado === 'pendiente').length,
    enProgreso: tareas.filter((t) => t.estado === 'en_progreso').length,
    completadas: tareas.filter((t) => t.estado === 'completada').length,
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tareas</h1>
          <p className="text-slate-600 text-sm mt-1">
            {estadisticas.completadas} de {estadisticas.total} completadas
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={cargarTareas}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm flex-1 sm:flex-initial justify-center"
          >
            <Plus size={18} />
            Nueva Tarea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', value: estadisticas.pendientes, color: 'slate' },
          { label: 'En Progreso', value: estadisticas.enProgreso, color: 'blue' },
          { label: 'Completadas', value: estadisticas.completadas, color: 'emerald' },
          { label: 'Total', value: estadisticas.total, color: 'purple' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between`}
          >
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
              <div className={`w-2 h-2 rounded-full bg-${stat.color}-500`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="todos">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>{estado.nombre}</option>
          ))}
        </select>
        <select
          value={prioridadFiltro}
          onChange={(e) => setPrioridadFiltro(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="todas">Todas las prioridades</option>
          {prioridades.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <Modal
        isOpen={mostrarForm}
        onClose={limpiarForm}
        title={tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Titulo *</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="¿Que necesitas hacer?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripcion</label>
            <textarea
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {prioridades.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Vencimiento</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
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
              ) : tareaEditando ? (
                'Actualizar'
              ) : (
                'Crear Tarea'
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

      {loading && tareas.length === 0 ? (
        <TableSkeleton rows={5} cols={5} />
      ) : tareasFiltradas.length === 0 ? (
        <EmptyState
          icon="tasks"
          title="No hay tareas"
          description="Crea tu primera tarea para organizar tus actividades"
          actionLabel="Crear Tarea"
          onAction={() => setMostrarForm(true)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Tarea</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase hidden sm:table-cell">Tipo</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Prioridad</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Estado</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Vencimiento</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tareasFiltradas.map((tarea) => {
                  const prioridad = getPrioridadInfo(tarea.prioridad);
                  const estado = getEstadoInfo(tarea.estado);
                  const tipo = getTipoInfo(tarea.tipo);
                  const TipoIcon = tipo.icon;

                  return (
                    <tr key={tarea.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className={`text-sm font-medium ${tarea.estado === 'completada' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {tarea.titulo}
                          </div>
                          <div className="text-sm text-slate-500 truncate max-w-xs hidden sm:block">
                            {tarea.descripcion || 'Sin descripcion'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-slate-600">
                          <TipoIcon size={16} />
                          <span className="text-sm">{tipo.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${prioridad.color}`}>
                          {prioridad.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${estado.color}`}>
                          {estado.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {tarea.fechaVencimiento
                            ? new Date(tarea.fechaVencimiento).toLocaleDateString()
                            : 'Sin fecha'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {tarea.estado !== 'completada' ? (
                            <button
                              onClick={() => cambiarEstado(tarea.id, 'completada')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Marcar como completada"
                            >
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => cambiarEstado(tarea.id, 'pendiente')}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Reabrir"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => editarTarea(tarea)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => eliminarTarea(tarea.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tareas;
