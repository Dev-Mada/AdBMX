import { useState, useEffect } from 'react'
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '../lib/api'
import { useToast } from './ui/Toast'
import { 
  TrendingUp, TrendingDown, Users, Target, DollarSign, 
  Activity, PieChart, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

const Reportes = () => {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState({
    ingresosTotales: 0,
    conversion: 0,
    clientesTotal: 0,
    oportunidadesActivas: 0,
  })
  const [ventasMensuales, setVentasMensuales] = useState(Array(12).fill(0))
  const [fuentesData, setFuentesData] = useState({ labels: [], values: [] })
  const [conversionData, setConversionData] = useState({ labels: [], data: [] })
  const [actividadData, setActividadData] = useState([])
  const toast = useToast()

  useEffect(() => { cargarDatos(); }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [clientesRes, oportunidadesRes, tareasRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/oportunidades'),
        api.get('/tareas')
      ])

      const clientes = clientesRes.data.clientes || []
      const oportunidades = oportunidadesRes.data.oportunidades || []
      const tareas = tareasRes.data.tareas || []

      const ganadas = oportunidades.filter(o => o.etapa === 'ganado')
      const activas = oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa))
      const totalOportunidades = oportunidades.length

      const ingresosTotales = ganadas.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0)
      const conversion = totalOportunidades > 0 ? Math.round((ganadas.length / totalOportunidades) * 100) : 0

      setMetricas({
        ingresosTotales,
        conversion,
        clientesTotal: clientes.length,
        oportunidadesActivas: activas.length,
      })

      const meses = Array(12).fill(0)
      const anioActual = new Date().getFullYear()
      ganadas.forEach(o => {
        const fecha = new Date(o.fechaCierre || o.updatedAt)
        if (fecha.getFullYear() === anioActual) {
          meses[fecha.getMonth()] += parseFloat(o.valor) || 0
        }
      })
      setVentasMensuales(meses)

      const fuentesCount = {}
      clientes.forEach(c => {
        const fuente = c.fuente || 'otros'
        fuentesCount[fuente] = (fuentesCount[fuente] || 0) + 1
      })
      const labels = Object.keys(fuentesCount)
      const values = Object.values(fuentesCount)
      setFuentesData({ labels, values })

      const etapas = ['nuevo', 'calificado', 'propuesta', 'negociacion', 'ganado']
      const etapasCount = etapas.map(e => oportunidades.filter(o => o.etapa === e).length)
      setConversionData({ labels: ['Leads', 'Calificado', 'Propuesta', 'Negociación', 'Ganados'], data: etapasCount })

      const nuevasClientes = clientes.filter(c => {
        const fecha = new Date(c.fechaCreacion || c.createdAt)
        const hace30d = new Date()
        hace30d.setDate(hace30d.getDate() - 30)
        return fecha >= hace30d
      }).length

      const nuevasOportunidades = oportunidades.filter(o => {
        const fecha = new Date(o.createdAt)
        const hace30d = new Date()
        hace30d.setDate(hace30d.getDate() - 30)
        return fecha >= hace30d
      }).length

      const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length

      setActividadData([
        { actividad: 'Nuevos Clientes', cantidad: nuevasClientes, icono: Users, color: 'blue' },
        { actividad: 'Oportunidades Creadas', cantidad: nuevasOportunidades, icono: Target, color: 'violet' },
        { actividad: 'Tareas Completadas', cantidad: tareasCompletadas, icono: Activity, color: 'emerald' },
        { actividad: 'Oportunidades Activas', cantidad: activas.length, icono: TrendingUp, color: 'amber' }
      ])

    } catch (error) {
      console.error('Error cargando reportes:', error)
      toast.error('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      label: 'Ventas Mensuales',
      data: ventasMensuales,
      backgroundColor: (context) => {
        const chart = context.chart
        const {ctx, chartArea} = chart
        if (!chartArea) return null
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)')
        return gradient
      },
      borderRadius: 8,
    }],
  }

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
        padding: 12,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#e2e8f0' },
        ticks: { color: '#64748b', callback: (v) => '$' + (v/1000).toFixed(0) + 'k' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    },
  }

  const fuentesChartData = {
    labels: fuentesData.labels?.length ? fuentesData.labels : ['Web', 'Referencia', 'Redes', 'Evento'],
    datasets: [{
      data: fuentesData.values?.length ? fuentesData.values : [10, 10, 10, 10],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  }

  const conversionChartData = {
    labels: conversionData.labels || [],
    datasets: [{
      label: 'Oportunidades',
      data: conversionData.data || [],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderRadius: 8,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, color: '#64748b', font: { size: 12 } }
      },
    },
  }

  const getCardColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      violet: 'from-violet-500 to-violet-600',
      emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
    }
    return colors[color] || colors.blue
  }

  const getIconBg = (color) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    }
    return colors[color] || colors.blue
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--color-bg-card)] rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-[var(--color-bg-card)] rounded-2xl"></div>
            <div className="h-80 bg-[var(--color-bg-card)] rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Reportes</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Métricas y análisis de rendimiento</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <DollarSign className="w-full h-full" />
          </div>
          <div className="relative">
            <p className="text-blue-100 text-sm font-medium">Ingresos Totales</p>
            <p className="text-3xl font-bold mt-2">${metricas.ingresosTotales.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+12% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Target className="w-full h-full" />
          </div>
          <div className="relative">
            <p className="text-emerald-100 text-sm font-medium">Conversión</p>
            <p className="text-3xl font-bold mt-2">{metricas.conversion}%</p>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+5% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Users className="w-full h-full" />
          </div>
          <div className="relative">
            <p className="text-violet-100 text-sm font-medium">Total Clientes</p>
            <p className="text-3xl font-bold mt-2">{metricas.clientesTotal}</p>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+8% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Activity className="w-full h-full" />
          </div>
          <div className="relative">
            <p className="text-amber-100 text-sm font-medium">Oportunidades Activas</p>
            <p className="text-3xl font-bold mt-2">{metricas.oportunidadesActivas}</p>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+15% vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Ventas Mensuales */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Ventas Mensuales</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Ingresos por mes</p>
            </div>
            <select className="px-3 py-2 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)]">
              <option>2026</option>
            </select>
          </div>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Fuentes de Clientes */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Fuentes de Clientes</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Distribución por origen</p>
          </div>
          <div className="h-72">
            <Doughnut data={fuentesChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oportunidades por Etapa */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Oportunidades por Etapa</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Funnel de ventas</p>
          </div>
          <div className="h-64">
            <Bar data={conversionChartData} options={{
              ...barChartOptions,
              indexAxis: 'y',
            }} />
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="rounded-2xl p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Actividad Reciente</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Últimos 30 días</p>
          </div>
          <div className="space-y-4">
            {actividadData.map((item, i) => {
              const Icon = item.icono
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)]">
                  <div className={`w-12 h-12 rounded-xl ${getIconBg(item.color)} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text-primary)]">{item.actividad}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Últimos 30 días</p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{item.cantidad}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportes
