import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';
import { 
  Plus, Filter, MoreVertical, Edit2, Trash2, ChevronRight,
  Target, DollarSign, Calendar, User, ArrowRight
} from 'lucide-react';

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroEtapa, setFiltroEtapa] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmData, setConfirmData] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    titulo: '', clienteId: '', valor: '', etapa: 'nuevo', probabilidad: 10,
    fechaCierre: '', descripcion: '', notas: '',
  });

  const etapas = [
    { id: 'nuevo', nombre: 'Nuevo', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    { id: 'calificado', nombre: 'Calificado', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    { id: 'propuesta', nombre: 'Propuesta', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    { id: 'negociacion', nombre: 'Negociación', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' },
    { id: 'ganado', nombre: 'Ganado', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    { id: 'perdido', nombre: 'Perdido', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
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
    setConfirmData({ id, titulo });
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
  const valorTotal = oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa)).reduce((s, o) => s + (parseFloat(o.valor) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Oportunidades</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Pipeline: <span className="font-bold text-[var(--color-text-primary)]">${valorTotal.toLocaleString()}</span>
          </p>
        </div>
        <button 
          onClick={() => { limpiarForm(); setMostrarForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva oportunidad
        </button>
      </div>

      {/* Etapas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {etapas.map(e => {
          const count = oportunidades.filter(o => o.etapa === e.id).length;
          const valor = oportunidades.filter(o => o.etapa === e.id).reduce((s, o) => s + (parseFloat(o.valor) || 0), 0);
          return (
            <div key={e.id} className="flex-1">
              <div 
                className={`relative rounded-2xl p-5 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${filtroEtapa === e.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                style={{ 
                  backgroundColor: e.color.includes('blue') ? '#dbeafe' : e.color.includes('emerald') ? '#d1fae5' : e.color.includes('amber') ? '#fef3c7' : e.color.includes('violet') ? '#ede9fe' : e.color.includes('red') ? '#fee2e2' : 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => setFiltroEtapa(e.id === filtroEtapa ? 'todas' : e.id)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${e.color.split(' ')[0].replace('bg-', 'bg-opacity-80 ')}`}>
                  {e.id === 'ganado' && <span className="text-2xl text-emerald-700">✓</span>}
                  {e.id === 'perdido' && <span className="text-2xl text-red-700">✗</span>}
                  {e.id === 'nuevo' && <span className="text-2xl text-blue-700">✦</span>}
                  {e.id === 'calificado' && <span className="text-2xl text-emerald-700">◎</span>}
                  {e.id === 'propuesta' && <span className="text-2xl text-amber-700">◈</span>}
                  {e.id === 'negociacion' && <span className="text-2xl text-violet-700">◆</span>}
                </div>
                <p className="text-3xl font-bold" style={{ color: e.color.includes('blue') ? '#1e40af' : e.color.includes('emerald') ? '#065f46' : e.color.includes('amber') ? '#92400e' : e.color.includes('violet') ? '#5b21b6' : e.color.includes('red') ? '#991b1b' : 'var(--color-text-primary)' }}>{count}</p>
                <p className="text-sm font-medium" style={{ color: e.color.includes('blue') ? '#1e40af' : e.color.includes('emerald') ? '#065f46' : e.color.includes('amber') ? '#92400e' : e.color.includes('violet') ? '#5b21b6' : e.color.includes('red') ? '#991b1b' : 'var(--color-text-muted)' }}>{e.nombre}</p>
                <p className="text-sm font-semibold" style={{ color: e.color.includes('blue') ? '#1e40af' : e.color.includes('emerald') ? '#065f46' : e.color.includes('amber') ? '#92400e' : e.color.includes('violet') ? '#5b21b6' : e.color.includes('red') ? '#991b1b' : 'var(--color-text-primary)' }}>${valor.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-3 p-4 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]">
        <select 
          value={filtroEtapa} 
          onChange={(e) => setFiltroEtapa(e.target.value)}
          className="px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]"
        >
          <option value="todas">Todas las etapas</option>
          {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {loading && oportunidades.length === 0 ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtradas.length === 0 ? (
          <EmptyState icon={Target} title="No hay oportunidades" description="Crea tu primera oportunidad comercial" actionLabel="Crear oportunidad" onAction={() => setMostrarForm(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Oportunidad</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4 hidden sm:table-cell">Cliente</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Valor</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Etapa</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4 hidden md:table-cell">Probabilidad</th>
                  <th className="text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {filtradas.map(o => {
                  const etapa = etapas.find(e => e.id === o.etapa);
                  return (
                    <tr key={o.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[var(--color-text-primary)]">{o.titulo}</p>
                          <p className="text-sm text-[var(--color-text-muted)] hidden sm:block line-clamp-1">{o.descripcion || 'Sin descripción'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                            {o.cliente?.nombre?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-[var(--color-text-primary)]">{o.cliente?.nombre || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[var(--color-text-primary)]">${parseFloat(o.valor)?.toLocaleString() || '0'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <select
                            value={o.etapa}
                            onChange={(e) => moverEtapa(o.id, e.target.value)}
                            className="appearance-none px-4 py-2 pr-8 rounded-xl text-sm font-semibold cursor-pointer transition-all border-0"
                            style={{ 
                              backgroundColor: o.etapa === 'nuevo' ? '#dbeafe' : o.etapa === 'calificado' ? '#d1fae5' : o.etapa === 'propuesta' ? '#fef3c7' : o.etapa === 'negociacion' ? '#ede9fe' : o.etapa === 'ganado' ? '#d1fae5' : o.etapa === 'perdido' ? '#fee2e2' : 'var(--color-bg-secondary)',
                              color: o.etapa === 'nuevo' ? '#1e40af' : o.etapa === 'calificado' ? '#065f46' : o.etapa === 'propuesta' ? '#92400e' : o.etapa === 'negociacion' ? '#5b21b6' : o.etapa === 'ganado' ? '#065f46' : o.etapa === 'perdido' ? '#991b1b' : 'var(--color-text-primary)'
                            }}
                          >
                            {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${o.probabilidad}%` }}></div>
                          </div>
                          <span className="text-sm text-[var(--color-text-muted)]">{o.probabilidad}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => editar(o)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmarEliminar(o.id, o.titulo)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={mostrarForm} onClose={limpiarForm} title={editando ? 'Editar oportunidad' : 'Nueva oportunidad'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Título *</label>
              <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Cliente</label>
              <select value={formData.clienteId} onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]">
                <option value="">Sin cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Valor ($)</label>
              <input type="number" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Etapa</label>
              <select value={formData.etapa} onChange={(e) => {
                const ei = etapas.find(x => x.id === e.target.value);
                setFormData({...formData, etapa: e.target.value, probabilidad: ei?.probabilidad || 10});
              }}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]">
                {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Fecha cierre</label>
              <input type="date" value={formData.fechaCierre} onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Descripción</label>
              <textarea rows={3} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
            <button type="submit" disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Crear oportunidad'}
            </button>
            <button type="button" onClick={limpiarForm} className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-xl font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={() => confirmData && eliminar(confirmData.id)}
        title="Eliminar oportunidad"
        message={`¿Estás seguro de eliminar la oportunidad "${confirmData?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Oportunidades;
