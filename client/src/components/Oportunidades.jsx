import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroEtapa, setFiltroEtapa] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [formData, setFormData] = useState({
    titulo: '', clienteId: '', valor: '', etapa: 'nuevo', probabilidad: 10,
    fechaCierre: '', descripcion: '', notas: '',
  });

  const etapas = [
    { id: 'nuevo', nombre: 'Nuevo', color: 'bg-blue-50 text-blue-700' },
    { id: 'calificado', nombre: 'Calificado', color: 'bg-green-50 text-green-700' },
    { id: 'propuesta', nombre: 'Propuesta', color: 'bg-amber-50 text-amber-700' },
    { id: 'negociacion', nombre: 'Negociacion', color: 'bg-purple-50 text-purple-700' },
    { id: 'ganado', nombre: 'Ganado', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'perdido', nombre: 'Perdido', color: 'bg-red-50 text-red-700' },
  ];

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [oppRes, cliRes] = await Promise.all([api.get('/oportunidades'), api.get('/clientes')]);
      setOportunidades(oppRes.data.oportunidades || []);
      setClientes(cliRes.data.clientes || []);
    } catch { toast.error('Error al cargar oportunidades'); }
    finally { setLoading(false); }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, valor: formData.valor ? parseFloat(formData.valor) : 0, probabilidad: parseInt(formData.probabilidad) };
      if (editando) {
        await api.put(`/oportunidades/${editando.id}`, payload);
        toast.success('Oportunidad actualizada');
      } else {
        await api.post('/oportunidades', payload);
        toast.success('Oportunidad creada');
      }
      await cargarDatos();
      limpiarForm();
    } catch (err) { toast.error(err.response?.data?.error); }
    finally { setLoading(false); }
  };

  const editar = (opp) => {
    setEditando(opp);
    setFormData({
      titulo: opp.titulo || '', clienteId: opp.clienteId || '', valor: opp.valor || '',
      etapa: opp.etapa || 'nuevo', probabilidad: opp.probabilidad || 10,
      fechaCierre: opp.fechaCierre?.split('T')[0] || '', descripcion: opp.descripcion || '', notas: opp.notas || '',
    });
    setMostrarForm(true);
  };

  const eliminar = async (id) => {
    try { await api.delete(`/oportunidades/${id}`); toast.success('Oportunidad eliminada'); await cargarDatos(); }
    catch (err) { toast.error(err.response?.data?.error); }
  };

  const confirmarEliminar = (id, titulo) => {
    if (window.confirm(`¿Estás seguro de eliminar la oportunidad "${titulo}"?`)) {
      eliminar(id);
    }
  };

  const moverEtapa = async (id, etapa) => {
    const etapaInfo = etapas.find(e => e.id === etapa);
    try { await api.put(`/oportunidades/${id}`, { etapa, probabilidad: etapaInfo?.probabilidad || 50 }); toast.success('Etapa actualizada'); await cargarDatos(); }
    catch { toast.error('Error al mover etapa'); }
  };

  const limpiarForm = () => {
    setFormData({ titulo: '', clienteId: '', valor: '', etapa: 'nuevo', probabilidad: 10, fechaCierre: '', descripcion: '', notas: '' });
    setEditando(null); setMostrarForm(false);
  };

  const filtradas = filtroEtapa === 'todas' ? oportunidades : oportunidades.filter(o => o.etapa === filtroEtapa);
  const valorTotal = oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa)).reduce((s, o) => s + (o.valor || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Oportunidades</h1>
          <p className="text-gray-500 mt-1">Pipeline: ${valorTotal.toLocaleString()}</p>
        </div>
        <button onClick={() => setMostrarForm(true)} className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 text-sm">
          + Nueva oportunidad
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {etapas.map(e => (
          <div key={e.id} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{oportunidades.filter(o => o.etapa === e.id).length}</p>
            <p className="text-xs text-gray-500 mt-1">{e.nombre}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <select value={filtroEtapa} onChange={(e) => setFiltroEtapa(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm">
          <option value="todas">Todas las etapas</option>
          {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={editando ? 'Editar oportunidad' : 'Nueva oportunidad'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo *</label>
              <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente</label>
              <select value={formData.clienteId} onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">Sin cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Valor ($)</label>
              <input type="number" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Etapa</label>
              <select value={formData.etapa} onChange={(e) => {
                const ei = etapas.find(x => x.id === e.target.value);
                setFormData({...formData, etapa: e.target.value, probabilidad: ei?.probabilidad || 10});
              }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha cierre</label>
              <input type="date" value={formData.fechaCierre} onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Probabilidad: {formData.probabilidad}%</label>
              <input type="range" min="0" max="100" step="10" value={formData.probabilidad}
                onChange={(e) => setFormData({...formData, probabilidad: parseInt(e.target.value)})}
                className="w-full accent-gray-900" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
              <textarea rows="2" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 text-sm flex-1">
              {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={limpiarForm} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      </Modal>

      {loading && oportunidades.length === 0 ? <TableSkeleton rows={5} cols={6} /> :
       filtradas.length === 0 ? <EmptyState icon="briefcase" title="Sin oportunidades" description="Crea tu primera oportunidad" actionLabel="Crear" onAction={() => setMostrarForm(true)} /> :
       (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oportunidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Prob.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map(o => {
                const etapa = etapas.find(e => e.id === o.etapa);
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4"><p className="text-sm font-medium text-gray-900">{o.titulo}</p><p className="text-xs text-gray-500 truncate max-w-xs hidden sm:block">{o.descripcion || 'Sin descripcion'}</p></td>
                    <td className="px-4 py-4 hidden sm:table-cell text-sm text-gray-900">{o.cliente?.nombre || '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">${o.valor?.toLocaleString() || '0'}</td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${etapa?.color}`}>{etapa?.nombre}</span></td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2"><div className="w-16 bg-gray-100 rounded-full h-1.5"><div className="bg-gray-900 h-1.5 rounded-full" style={{width: `${o.probabilidad}%`}}></div></div><span className="text-xs text-gray-500">{o.probabilidad}%</span></div>
                    </td>
                    <td className="px-4 py-4">
                      <select value={o.etapa} onChange={(e) => moverEtapa(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 mr-2 bg-gray-50">
                        {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                      </select>
                      <button onClick={() => editar(o)} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded">Editar</button>
                      <button onClick={() => confirmarEliminar(o.id, o.titulo)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded">Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Oportunidades;
