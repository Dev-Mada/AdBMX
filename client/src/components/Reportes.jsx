import { useState, useEffect } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js'
import api from '../lib/api'
import { useToast } from './ui/Toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement
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

      console.log('Oportunidades response:', oportunidadesRes.data)
      
      const clientes = clientesRes.data.clientes || []
      const oportunidades = oportunidadesRes.data.oportunidades || []
      const tareas = tareasRes.data.tareas || []

      console.log('Oportunidades procesadas:', oportunidades)
      console.log('Oportunidades ganadas:', oportunidades.filter(o => o.etapa === 'ganado'))

      const ganadas = oportunidades.filter(o => o.etapa === 'ganado')
      const activas = oportunidades.filter(o => !['ganado', 'perdido'].includes(o.etapa))
      const totalOportunidades = oportunidades.length

      console.log('Ingresos ganadas:', ganadas.map(o => ({ etapa: o.etapa, valor: o.valor })))

      const ingresosTotales = ganadas.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0)
      const conversion = totalOportunidades > 0 ? Math.round((ganadas.length / totalOportunidades) * 100) : 0

      console.log('Ingresos totales calculados:', ingresosTotales)

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
      setConversionData({ labels: ['Leads', 'Calificado', 'Propuesta', 'Negociacion', 'Ganados'], data: etapasCount })

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
        { actividad: 'Nuevos Clientes', cantidad: nuevasClientes },
        { actividad: 'Oportunidades Creadas', cantidad: nuevasOportunidades },
        { actividad: 'Tareas Completadas', cantidad: tareasCompletadas },
        { actividad: 'Oportunidades Activas', cantidad: activas.length }
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
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      borderRadius: 4,
    }],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => '$' + (v/1000).toFixed(0) + 'k' } }
    },
  }

  const fuentesChartData = {
    labels: fuentesData.labels || ['Web', 'Referencia', 'Redes', 'Evento'],
    datasets: [{
      data: fuentesData.values || [10, 10, 10, 10],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
      borderWidth: 0,
    }],
  }

  const conversionChartData = {
    labels: conversionData.labels || [],
    datasets: [{
      label: 'Oportunidades',
      data: conversionData.data || [],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 4,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
        <p className="text-gray-500 mt-1">Metricas y analisis de rendimiento</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
          <p className="text-2xl font-semibold text-gray-900">${metricas.ingresosTotales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Conversion</p>
          <p className="text-2xl font-semibold text-gray-900">{metricas.conversion}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Clientes</p>
          <p className="text-2xl font-semibold text-gray-900">{metricas.clientesTotal}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Oportunidades Activas</p>
          <p className="text-2xl font-semibold text-gray-900">{metricas.oportunidadesActivas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ventas Mensuales</h3>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Fuentes de Clientes</h3>
          <div className="h-64">
            <Doughnut data={fuentesChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Oportunidades por Etapa</h3>
          <div className="h-64">
            <Bar 
              data={conversionChartData} 
              options={{ 
                ...barChartOptions, 
                indexAxis: 'y',
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de Actividad</h3>
          <div className="space-y-4">
            {actividadData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.actividad}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">{item.cantidad}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportes