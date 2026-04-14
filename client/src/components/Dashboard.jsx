import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import api from '../lib/api';
import { 
  Users, DollarSign, TrendingUp, Target, 
  Activity, CheckCircle, Clock, AlertCircle,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
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
        ventasMes: oportunidades.filter(o => o.etapa === 'ganado').reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0),
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
        if (mes >= 0 && mes < 12) mesesData[mes] += parseFloat(o.valor) || 0;
      });
      setVentasData(mesesData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-[var(--color-bg-card)] rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-[var(--color-bg-card)] rounded-2xl"></div>
            <div className="h-80 bg-[var(--color-bg-card)] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Clientes', 
      value: stats.totalClientes, 
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    { 
      label: 'Tareas Pendientes', 
      value: stats.tareasPendientes, 
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'amber'
    },
    { 
      label: 'Oportunidades', 
      value: stats.oportunidadesActivas, 
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'violet'
    },
    { 
      label: 'Ventas del Mes', 
      value: `$${stats.ventasMes.toLocaleString()}`, 
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald'
    },
  ];

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Ventas',
      data: ventasData,
      backgroundColor: (context) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
        return gradient;
      },
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b' } 
      },
      y: {
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#64748b', 
          callback: (v) => '$' + (v/1000).toFixed(0) + 'k' 
        },
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
      hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          usePointStyle: true, 
          padding: 20, 
          color: '#64748b', 
          font: { size: 12 } 
        },
      },
    },
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Resumen de tu actividad comercial</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-transparent transition-all duration-300 hover:shadow-xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className={`w-full h-full rounded-full bg-${stat.color}-500`}></div>
              </div>
              
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${getIconColor(stat.color)} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <p className="text-sm font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{stat.value}</p>
                
                <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 
                  stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                  'text-[var(--color-text-muted)]'
                }`}>
                  {getTrendIcon(stat.trend)}
                  <span>{stat.change}</span>
                  <span className="text-[var(--color-text-muted)] font-normal">vs mes anterior</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Ventas Mensuales</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Ingresos por mes</p>
            </div>
            <select className="px-3 py-2 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)]">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Pipeline Chart */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Pipeline</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Oportunidades por etapa</p>
          </div>
          <div className="h-52">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversion Rate */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Tasa de Conversión</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.tasaConversion / 100) * 440} 440`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[var(--color-text-primary)]">{stats.tasaConversion}%</span>
                <span className="text-sm text-[var(--color-text-muted)]">Conversión</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clientes Nuevos */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Clientes Nuevos</h3>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="w-10 h-10 text-white" />
            </div>
            <p className="text-4xl font-bold text-[var(--color-text-primary)]">{stats.clientesNuevos}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Últimos 30 días</p>
          </div>
        </div>

        {/* Valor Pipeline */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Valor Pipeline</h3>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <p className="text-4xl font-bold text-[var(--color-text-primary)]">
              ${(stats.oportunidadesActivas * 5000).toLocaleString()}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Basado en oportunidades activas</p>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Actividad Reciente</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Ver todas
          </button>
        </div>
        {actividadReciente.length > 0 ? (
          <div className="space-y-4">
            {actividadReciente.map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text-primary)] truncate">{act.descripcion}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {new Date(act.tiempo).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-3" />
            <p className="text-[var(--color-text-muted)]">No hay actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
