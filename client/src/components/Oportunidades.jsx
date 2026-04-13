import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Edit2, Trash2, TrendingUp, DollarSign, Calendar, Users, CheckCircle, RefreshCw, ChevronRight, Target } from 'lucide-react';
import api from '../lib/api';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/Skeleton';

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState('todas');
  const [oportunidadEditando, setOportunidadEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    clienteId: '',
    valor: '',
    etapa: 'nuevo',
    probabilidad: 10,
    fechaCierre: '',
    descripcion: '',
    notas: '',
  });

  const etapas = [
    { id: 'nuevo', nombre: 'Nuevo', probabilidad: 10, color: 'bg-blue-100 text-blue-800 border-blue-200', bar: 'bg-blue-500' },
    { id: 'calificado', nombre: 'Calificado', probabilidad: 30, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', bar: 'bg-emerald-500' },
    { id: 'propuesta', nombre: 'Propuesta', probabilidad: 50, color: 'bg-amber-100 text-amber-800 border-amber-200', bar: 'bg-amber-500' },
    { id: 'negociacion', nombre: 'Negociacion', probabilidad: 70, color: 'bg-orange-100 text-orange-800 border-orange-200', bar: 'bg-orange-500' },
    { id: 'ganado', nombre: 'Ganado', probabilidad: 100, color: 'bg-purple-100 text-purple-800 border-purple-200', bar: 'bg-purple-500' },
    { id: 'perdido', nombre: 'Perdido', probabilidad: 0, color: 'bg-red-100 text-red-800 border-red-200', bar: 'bg-red-500' },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, clientesRes] = await Promise.all([
        api.get('/oportunidades'),
        api.get('/clientes'),
      ]);
      setOportunidades(oppRes.data.oportunidades || oppRes.data || []);
      setClientes(clientesRes.data.clientes || clientesRes.data || []);
    } catch (err) {
      setError('Error al cargar oportunidades');
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
        clienteId: formData.clienteId || null,
        valor: formData.valor ? parseFloat(formData.valor) : 0,
        probabilidad: parseInt(formData.probabilidad),
      };

      if (oportunidadEditando) {
        const response = await api.put(`/oportunidades/${oportunidadEditando.id}`, payload);
        if (response.data.success) {
          await cargarDatos();
          limpiarForm();
        }
      } else {
        const response = await api.post('/oportunidades', payload);
        if (response.data.success) {
          await cargarDatos();
          limpiarForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar oportunidad');
    } finally {
      setLoading(false);
    }
  };

  const editarOportunidad = (opp) => {
    setOportunidadEditando(opp);
    setFormData({
      titulo: opp.titulo || '',
      clienteId: opp.clienteId || opp.cliente?.id || '',
      valor: opp.valor || '',
      etapa: opp.etapa || 'nuevo',
      probabilidad: opp.probabilidad || 10,
      fechaCierre: opp.fechaCierre ? opp.fechaCierre.split('T')[0] : '',
      descripcion: opp.descripcion || '',
      notas: opp.notas || '',
    });
    setMostrarForm(true);
  };

  const eliminarOportunidad = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta oportunidad?')) {
      setLoading(true);
      try {
        await api.delete(`/oportunidades/${id}`);
        await cargarDatos();
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const moverEtapa = async (id, nuevaEtapa) => {
    const etapaInfo = etapas.find((e) => e.id === nuevaEtapa);
    try {
      await api.put(`/oportunidades/${id}`, {
        etapa: nuevaEtapa,
        probabilidad: etapaInfo?.probabilidad || 50,
      });
      await cargarDatos();
    } catch (err) {
      console.error('Error al mover etapa:', err);
    }
  };

  const limpiarForm = () => {
    setFormData({
      titulo: '',
      clienteId: '',
      valor: '',
      etapa: 'nuevo',
      probabilidad: 10,
      fechaCierre: '',
      descripcion: '',
      notas: '',
    });
    setOportunidadEditando(null);
    setMostrarForm(false);
    setError(null);
  };

  const oportunidadesFiltradas =
    filtroEtapa === 'todas'
      ? oportunidades
      : oportunidades.filter((op) => op.etapa === filtroEtapa);

  const getValorTotalPorEtapa = (etapa) => {
    return oportunidades
      .filter((op) => op.etapa === etapa)
      .reduce((sum, op) => sum + (op.valor || 0), 0);
  };

  const valorTotalPipeline = oportunidades
    .filter((op) => !['ganado', 'perdido'].includes(op.etapa))
    .reduce((sum, op) => sum + (op.valor || 0), 0);

  const valorGanado = oportunidades
    .filter((op) => op.etapa === 'ganado')
    .reduce((sum, op) => sum + (op.valor || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Oportunidades</h1>
          <p className="text-slate-600 text-sm mt-1">
            Pipeline de ventas: ${valorTotalPipeline.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={cargarDatos}
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
            Nueva Oportunidad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {etapas.map((etapa) => (
          <div
            key={etapa.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl font-bold text-slate-900">
              {oportunidades.filter((op) => op.etapa === etapa.id).length}
            </div>
            <div className="text-sm text-slate-600 mt-1 font-medium">{etapa.nombre}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
              <DollarSign size={12} />
              {getValorTotalPorEtapa(etapa.id).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white flex-1"
        >
          <option value="todas">Todas las etapas</option>
          {etapas.map((etapa) => (
            <option key={etapa.id} value={etapa.id}>
              {etapa.nombre}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-xl border border-blue-100">
          <TrendingUp size={18} className="text-blue-600" />
          <div>
            <span className="text-xs text-slate-500">Pipeline activo: </span>
            <span className="text-sm font-bold text-slate-900">${valorTotalPipeline.toLocaleString()}</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
          <div>
            <span className="text-xs text-slate-500">Ganado: </span>
            <span className="text-sm font-bold text-emerald-600">${valorGanado.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={mostrarForm}
        onClose={limpiarForm}
        title={oportunidadEditando ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titulo *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Nombre de la oportunidad"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">Sin cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.empresa ? `(${cliente.empresa})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valor ($)</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Etapa</label>
                <select
                  value={formData.etapa}
                  onChange={(e) => {
                    const nuevaEtapa = etapas.find((et) => et.id === e.target.value);
                    setFormData({
                      ...formData,
                      etapa: e.target.value,
                      probabilidad: nuevaEtapa?.probabilidad || 10,
                    });
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {etapas.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {etapa.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de cierre</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.fechaCierre}
                    onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Probabilidad: {formData.probabilidad}%
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={formData.probabilidad}
                  onChange={(e) => setFormData({ ...formData, probabilidad: parseInt(e.target.value) })}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-600 w-12">{formData.probabilidad}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripcion</label>
              <textarea
                rows="3"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Descripcion de la oportunidad..."
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
              ) : oportunidadEditando ? (
                'Actualizar'
              ) : (
                'Crear Oportunidad'
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

      {loading && oportunidades.length === 0 ? (
        <TableSkeleton rows={5} cols={6} />
      ) : oportunidadesFiltradas.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No hay oportunidades"
          description="Agrega tu primera oportunidad para comenzar a gestionar tu pipeline de ventas"
          actionLabel="Agregar Oportunidad"
          onAction={() => setMostrarForm(true)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Oportunidad</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase hidden sm:table-cell">Cliente</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Valor</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Etapa</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Prob.</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase hidden lg:table-cell">Cierre</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {oportunidadesFiltradas.map((opp) => {
                  const etapa = etapas.find((e) => e.id === opp.etapa);
                  return (
                    <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{opp.titulo}</div>
                          <div className="text-sm text-slate-500 line-clamp-1 hidden sm:block">
                            {opp.descripcion || 'Sin descripcion'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="text-sm text-slate-900 flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          {opp.cliente?.nombre || opp.cliente?.empresa || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                          <DollarSign size={14} className="text-slate-400" />
                          {opp.valor?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${etapa?.color}`}>
                          {etapa?.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                              className={`${etapa?.bar} h-2 rounded-full transition-all`}
                              style={{ width: `${opp.probabilidad}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600">{opp.probabilidad}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="text-sm text-slate-900 flex items-center gap-1">
                          <Calendar size={14} className="text-slate-400" />
                          {opp.fechaCierre ? new Date(opp.fechaCierre).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={opp.etapa}
                            onChange={(e) => moverEtapa(opp.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            {etapas.map((etapa) => (
                              <option key={etapa.id} value={etapa.id}>
                                {etapa.nombre}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => editarOportunidad(opp)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => eliminarOportunidad(opp.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
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

export default Oportunidades;
