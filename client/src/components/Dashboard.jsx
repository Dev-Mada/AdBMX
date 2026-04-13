import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../lib/api';
import { DashboardSkeleton } from './ui/Skeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClientes: 0,
    tareasPendientes: 0,
    oportunidadesActivas: 0,
    ventasMes: 0,
    tasaConversion: 0,
    clientesNuevos: 0,
  });
  const [actividadReciente, setActividadReciente] = useState([]);
  const [ventasData, setVentasData] = useState(Array(12).fill(0));
  const [oportunidadesPorEtapa, setOportunidadesPorEtapa] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [clientesRes, tareasRes, oportunidadesRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/tareas'),
        api.get('/oportunidades'),
      ]);

      const clientes = clientesRes.data.clientes || [];
      const tareas = tareasRes.data.tareas || [];
      const oportunidades = oportunidadesRes.data.oportunidades || [];

      setStats({
        totalClientes: clientes.length,
        tareasPendientes: tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length,
        oportunidadesActivas: oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa)).length,
        ventasMes: oportunidades.filter(o => o.etapa === 'ganado').reduce((sum, o) => sum + (o.valor || 0), 0),
        tasaConversion: oportunidades.length > 0 
          ? Math.round((oportunidades.filter(o => o.etapa === 'ganado').length / oportunidades.length) * 100) 
          : 0,
        clientesNuevos: clientes.filter(c => {
          const fecha = new Date(c.fechaCreacion || c.createdAt);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return fecha >= hace30Dias;
        }).length,
      });

      const etapasCount = {};
      ['nuevo', 'calificado', 'propuesta', 'negociacion', 'ganado', 'perdido'].forEach(etapa => {
        etapasCount[etapa] = oportunidades.filter(o => o.etapa === etapa).length;
      });
      setOportunidadesPorEtapa(etapasCount);

      setActividadReciente(tareas.slice(0, 5).map(t => ({
        tipo: t.tipo || 'tarea',
        descripcion: t.titulo,
        tiempo: t.fechaVencimiento || t.createdAt,
      })));

      const mesesData = Array(12).fill(0);
      oportunidades.filter(o => o.etapa === 'ganado').forEach(o => {
        const mes = new Date(o.fechaCierre || o.updatedAt).getMonth();
        if (mes >= 0 && mes < 12) mesesData[mes] += o.valor || 0;
      });
      setVentasData(mesesData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Ventas',
      data: ventasData,
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280' } },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', callback: (v) => '$' + (v/1000).toFixed(0) + 'k' },
        beginAtZero: true,
      },
    },
  };

  const doughnutData = {
    labels: ['Nuevo', 'Calificado', 'Propuesta', 'Negociacion', 'Ganado'],
    datasets: [{
      data: [
        oportunidadesPorEtapa.nuevo || 0,
        oportunidadesPorEtapa.calificado || 0,
        oportunidadesPorEtapa.propuesta || 0,
        oportunidadesPorEtapa.negociacion || 0,
        oportunidadesPorEtapa.ganado || 0,
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, color: '#6b7280', font: { size: 11 } },
      },
    },
  };

  const statCards = [
    { label: 'Total Clientes', value: stats.totalClientes, change: '+12%' },
    { label: 'Tareas Pendientes', value: stats.tareasPendientes, change: '-5%' },
    { label: 'Oportunidades', value: stats.oportunidadesActivas, change: '+8%' },
    { label: 'Ventas del Mes', value: `$${stats.ventasMes.toLocaleString()}`, change: '+15%' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tu actividad comercial</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-emerald-600 mt-2">{stat.change} vs mes anterior</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Ventas mensuales</h2>
            <span className="text-sm text-gray-500">Ano 2024</span>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Oportunidades por etapa</h2>
            <div className="h-48">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Actividad reciente</h2>
            {actividadReciente.length > 0 ? (
              <div className="space-y-3">
                {actividadReciente.map((act, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{act.descripcion}</p>
                      <p className="text-xs text-gray-500">{new Date(act.tiempo).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Tasa de conversion</h3>
          <div className="text-3xl font-semibold text-gray-900 mb-3">{stats.tasaConversion}%</div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${stats.tasaConversion}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Clientes nuevos (30d)</h3>
          <div className="text-3xl font-semibold text-gray-900">{stats.clientesNuevos}</div>
          <p className="text-sm text-gray-500 mt-2">Ultimos 30 dias</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Valor pipeline</h3>
          <div className="text-3xl font-semibold text-gray-900">
            ${(stats.oportunidadesActivas * 5000).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-2">Basado en oportunidades activas</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
