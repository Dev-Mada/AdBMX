import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Users, CheckSquare, Briefcase, DollarSign, TrendingUp, Phone, Mail, UserCheck, CheckCircle, ArrowUp, ArrowDown, Clock, Target } from 'lucide-react';
import api from '../lib/api';
import { DashboardSkeleton } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  const [ventasData, setVentasData] = useState([]);
  const [oportunidadesPorEtapa, setOportunidadesPorEtapa] = useState([]);

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

      const clientes = clientesRes.data.clientes || clientesRes.data || [];
      const tareas = tareasRes.data.tareas || tareasRes.data || [];
      const oportunidades = oportunidadesRes.data.oportunidades || oportunidadesRes.data || [];

      const tareasPendientes = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length;
      const oportunidadesActivas = oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa)).length;
      const valorTotal = oportunidades.filter(o => o.etapa === 'ganado').reduce((sum, o) => sum + (o.valor || 0), 0);

      setStats({
        totalClientes: clientes.length,
        tareasPendientes,
        oportunidadesActivas,
        ventasMes: valorTotal,
        tasaConversion: oportunidades.length > 0 
          ? Math.round((oportunidades.filter(o => o.etapa === 'ganado').length / oportunidades.length) * 100) 
          : 0,
        clientesNuevos: clientes.filter(c => {
          const fechaCreacion = new Date(c.fechaCreacion || c.createdAt);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return fechaCreacion >= hace30Dias;
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
        if (mes >= 0 && mes < 12) {
          mesesData[mes] += o.valor || 0;
        }
      });
      setVentasData(mesesData);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: ventasData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Ventas: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: {
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: { color: '#64748b', callback: (value) => '$' + (value / 1000).toFixed(0) + 'k' },
        beginAtZero: true,
      },
    },
  };

  const doughnutChartData = {
    labels: ['Nuevo', 'Calificado', 'Propuesta', 'Negociacion', 'Ganado'],
    datasets: [
      {
        data: [
          oportunidadesPorEtapa.nuevo || 0,
          oportunidadesPorEtapa.calificado || 0,
          oportunidadesPorEtapa.propuesta || 0,
          oportunidadesPorEtapa.negociacion || 0,
          oportunidadesPorEtapa.ganado || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, color: '#64748b', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  const statCards = [
    { label: 'Total Clientes', value: stats.totalClientes, icon: Users, color: 'blue', trend: '+12%', positive: true },
    { label: 'Tareas Pendientes', value: stats.tareasPendientes, icon: CheckSquare, color: 'orange', trend: '-5%', positive: false },
    { label: 'Oportunidades', value: stats.oportunidadesActivas, icon: Briefcase, color: 'green', trend: '+8%', positive: true },
    { label: 'Ventas del Mes', value: `$${stats.ventasMes.toLocaleString()}`, icon: DollarSign, color: 'purple', trend: '+15%', positive: true },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-l-blue-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-l-orange-500' },
    green: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-l-emerald-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-l-purple-500' },
  };

  const getIconoActividad = (tipo) => {
    const iconos = { llamada: Phone, email: Mail, reunion: UserCheck, tarea: CheckCircle };
    const Icon = iconos[tipo] || CheckCircle;
    return <Icon size={18} />;
  };

  const getColorActividad = (tipo) => {
    const colores = {
      llamada: 'bg-blue-100 text-blue-600',
      email: 'bg-emerald-100 text-emerald-600',
      reunion: 'bg-purple-100 text-purple-600',
      tarea: 'bg-orange-100 text-orange-600',
    };
    return colores[tipo] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Resumen de tu CRM ADBMX</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar datos"
          >
            <Clock size={20} />
          </button>
          <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const colors = colorMap[stat.color];
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200 border-l-4 ${colors.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <p className="text-slate-600 text-sm">{stat.label}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon size={24} className={colors.text} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                  {stat.trend}
                </span>
                <span className="text-slate-500 ml-2">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ventas Mensuales</h3>
                <p className="text-sm text-slate-500">Rendimiento del ano en curso</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Target className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">Meta: $75,000</span>
            </div>
          </div>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actividad Reciente</h3>
            {actividadReciente.length > 0 ? (
              <div className="space-y-3">
                {actividadReciente.map((actividad, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${getColorActividad(actividad.tipo)}`}>
                      {getIconoActividad(actividad.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{actividad.descripcion}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(actividad.tiempo).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Oportunidades por Etapa</h3>
            <div className="h-48">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Tasa de Conversion</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">{stats.tasaConversion}%</div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${stats.tasaConversion}%` }}></div>
          </div>
          <p className="text-sm text-slate-500 mt-2">Oportunidades ganadas vs totales</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Clientes Nuevos</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">{stats.clientesNuevos}</div>
          <p className="text-sm text-slate-500">En los ultimos 30 dias</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Valor Pipeline</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            ${((stats.oportunidadesActivas * 5000)).toLocaleString()}
          </div>
          <p className="text-sm text-slate-500">Basado en oportunidades activas</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
