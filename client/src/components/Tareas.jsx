import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [prioridadFiltro, setPrioridadFiltro] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmData, setConfirmData] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', tipo: 'otro', prioridad: 'media', estado: 'pendiente', fechaVencimiento: '',
  });

  const prioridades = [
    { id: 'baja', nombre: 'Baja', color: 'bg-green-50 text-green-700' },
    { id: 'media', nombre: 'Media', color: 'bg-amber-50 text-amber-700' },
    { id: 'alta', nombre: 'Alta', color: 'bg-orange-50 text-orange-700' },
    { id: 'urgente', nombre: 'Urgente', color: 'bg-red-50 text-red-700' },
  ];

  const estados = [
    { id: 'pendiente', nombre: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
    { id: 'en_progreso', nombre: 'En Progreso', color: 'bg-blue-50 text-blue-700' },
    { id: 'completada', nombre: 'Completada', color: 'bg-green-50 text-green-700' },
    { id: 'cancelada', nombre: 'Cancelada', color: 'bg-red-50 text-red-700' },
  ];

  const tipos = [
    { id: 'llamada', nombre: 'Llamada' },
    { id: 'email', nombre: 'Email' },
    { id: 'reunion', nombre: 'Reunion' },
    { id: 'seguimiento', nombre: 'Seguimiento' },
    { id: 'otro', nombre: 'Otro' },
  ];

  useEffect(() => { cargarTareas(); }, []);

  const cargarTareas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/tareas');
      setTareas(response.data.tareas || []);
    } catch { toast.error('Error al cargar tareas'); }
    finally { setLoading(false); }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/tareas/${editando.id}`, formData);
        toast.success('Tarea actualizada');
      } else {
        await api.post('/tareas', formData);
        toast.success('Tarea creada');
      }
      await cargarTareas();
      limpiarForm();
    } catch (err) { toast.error(err.response?.data?.error); }
    finally { setLoading(false); }
  };

  const editar = (tarea) => {
    setEditando(tarea);
    setFormData({
      titulo: tarea.titulo || '', descripcion: tarea.descripcion || '',
      tipo: tarea.tipo || 'otro', prioridad: tarea.prioridad || 'media',
      estado: tarea.estado || 'pendiente',
      fechaVencimiento: tarea.fechaVencimiento?.split('T')[0] || '',
    });
    setMostrarForm(true);
  };

  const eliminar = async (id) => {
    try { await api.delete(`/tareas/${id}`); toast.success('Tarea eliminada'); await cargarTareas(); }
    catch (err) { toast.error(err.response?.data?.error); }
  };

  const confirmarEliminar = (id, titulo) => {
    setConfirmData({ id, titulo });
  };

  const cambiarEstado = async (id, estado) => {
    try { await api.put(`/tareas/${id}`, { estado }); toast.success('Estado actualizado'); await cargarTareas(); }
    catch { toast.error('Error al cambiar estado'); }
  };

  const limpiarForm = () => {
    setFormData({ titulo: '', descripcion: '', tipo: 'otro', prioridad: 'media', estado: 'pendiente', fechaVencimiento: '' });
    setEditando(null); setMostrarForm(false);
  };

  const filtradas = tareas.filter(t => {
    const matchSearch = (t.titulo?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
                       (t.descripcion?.toLowerCase() || '').includes(filtro.toLowerCase());
    return matchSearch && (estadoFiltro === 'todos' || t.estado === estadoFiltro) && (prioridadFiltro === 'todas' || t.prioridad === prioridadFiltro);
  });

  const stats = {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    completadas: tareas.filter(t => t.estado === 'completada').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tareas</h1>
          <p className="text-gray-500 mt-1">{stats.completadas} de {stats.total} completadas</p>
        </div>
        <button onClick={() => setMostrarForm(true)} className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 text-sm">
          + Nueva tarea
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pendientes', value: stats.pendientes },
          { label: 'Completadas', value: stats.completadas },
          { label: 'Total', value: stats.total },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Buscar tareas..." value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
          <option value="todos">Todos</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <select value={prioridadFiltro} onChange={(e) => setPrioridadFiltro(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
          <option value="todas">Todas</option>
          {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={editando ? 'Editar tarea' : 'Nueva tarea'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo *</label>
            <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="¿Que necesitas hacer?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
            <textarea rows="2" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Prioridad</label>
              <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {prioridades.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha vencimiento</label>
              <input type="date" value={formData.fechaVencimiento}
                onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex-1">
              {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Crear tarea'}
            </button>
            <button type="button" onClick={limpiarForm} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      </Modal>

      {loading && tareas.length === 0 ? <TableSkeleton rows={5} cols={5} /> :
       filtradas.length === 0 ? <EmptyState icon="tasks" title="Sin tareas" description="Crea tu primera tarea" actionLabel="Crear" onAction={() => setMostrarForm(true)} /> :
       (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarea</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Vencimiento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map(t => {
                const prio = prioridades.find(p => p.id === t.prioridad);
                const est = estados.find(e => e.id === t.estado);
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className={`text-sm font-medium ${t.estado === 'completada' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.titulo}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs hidden sm:block">{t.descripcion || 'Sin descripcion'}</p>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-600">{tipos.find(x => x.id === t.tipo)?.nombre || 'Otro'}</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${prio?.color}`}>{prio?.nombre}</span></td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${est?.color}`}>{est?.nombre}</span></td>
                    <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-500">{t.fechaVencimiento ? new Date(t.fechaVencimiento).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {t.estado !== 'completada' ? (
                          <button onClick={() => cambiarEstado(t.id, 'completada')}
                            className="text-xs text-green-600 hover:text-green-700 px-2 py-1 hover:bg-green-50 rounded">Completar</button>
                        ) : (
                          <button onClick={() => cambiarEstado(t.id, 'pendiente')}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded">Reabrir</button>
                        )}
                        <button onClick={() => editar(t)} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded">Editar</button>
                        <button onClick={() => confirmarEliminar(t.id, t.titulo)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={() => confirmData && eliminar(confirmData.id)}
        title="Eliminar tarea"
        message={`¿Estás seguro de eliminar la tarea "${confirmData?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Tareas;
