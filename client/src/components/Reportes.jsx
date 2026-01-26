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
  const [filtroFecha, setFiltroFecha] = useState('30d')
  const [datosReportes, setDatosReportes] = useState({})

  useEffect(() => {
    // Datos de ejemplo para reportes
    setDatosReportes({
      ventasMensuales: [32000, 29000, 35000, 42000, 38000, 45280, 41000, 48000, 52000, 61000, 58000, 72000],
      leadsFuentes: [45, 28, 15, 8, 4],
      conversionEtapas: [100, 65, 42, 28, 15],
      rendimientoVendedores: [85, 72, 68, 61, 55]
    })
  }, [filtroFecha])

  const ventasChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: datosReportes.ventasMensuales || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const ventasChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'k'
          }
        }
      }
    },
  }

  const fuentesChartData = {
    labels: ['Sitio Web', 'Referencias', 'Redes Sociales', 'Eventos', 'Publicidad'],
    datasets: [
      {
        data: datosReportes.leadsFuentes || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  }

  const conversionChartData = {
    labels: ['Leads', 'Calificados', 'Propuesta', 'Negociación', 'Ganados'],
    datasets: [
      {
        label: 'Tasa de Conversión',
        data: datosReportes.conversionEtapas || [],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
    ],
  }

  const metricas = [
    { titulo: 'Ingresos Totales', valor: '$452,800', cambio: '+12%', tendencia: 'up' },
    { titulo: 'Conversión', valor: '24%', cambio: '+3%', tendencia: 'up' },
    { titulo: 'CAC', valor: '$1,250', cambio: '-5%', tendencia: 'down' },
    { titulo: 'LTV', valor: '$8,450', cambio: '+8%', tendencia: 'up' }
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Métricas y análisis de rendimiento</p>
        </div>
        <select 
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricas.map((metrica, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-xl font-bold text-gray-900">{metrica.valor}</div>
            <div className="text-sm text-gray-600 mt-1">{metrica.titulo}</div>
            <div className={`text-xs mt-2 ${
              metrica.tendencia === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrica.cambio} vs periodo anterior
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Ventas Mensuales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Mensuales</h3>
          <div className="h-64 sm:h-80">
            <Bar data={ventasChartData} options={ventasChartOptions} />
          </div>
        </div>

        {/* Fuentes de Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Leads</h3>
          <div className="h-64 sm:h-80">
            <Doughnut 
              data={fuentesChartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Gráficos Secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Tasa de Conversión */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasa de Conversión</h3>
          <div className="h-64">
            <Line 
              data={conversionChartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        </div>

        {/* Resumen de Actividad */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Actividad</h3>
          <div className="space-y-4">
            {[
              { actividad: 'Nuevos Clientes', cantidad: 12, cambio: '+20%' },
              { actividad: 'Oportunidades Creadas', cantidad: 28, cambio: '+15%' },
              { actividad: 'Tareas Completadas', cantidad: 156, cambio: '+8%' },
              { actividad: 'Reuniones Realizadas', cantidad: 45, cambio: '+25%' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.actividad}</div>
                  <div className="text-xs text-gray-500">{item.cambio}</div>
                </div>
                <div className="text-lg font-bold text-blue-600">{item.cantidad}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Rendimiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Vendedor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oportunidades</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Conversión</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Promedio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { nombre: 'Ana García', ventas: 8, oportunidades: 12, conversion: '67%', valorPromedio: '$45,200' },
                { nombre: 'Carlos Ruiz', ventas: 6, oportunidades: 10, conversion: '60%', valorPromedio: '$38,500' },
                { nombre: 'María López', ventas: 5, oportunidades: 8, conversion: '63%', valorPromedio: '$52,100' },
                { nombre: 'David Chen', ventas: 7, oportunidades: 11, conversion: '64%', valorPromedio: '$41,800' }
              ].map((vendedor, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{vendedor.nombre}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{vendedor.ventas}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{vendedor.oportunidades}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-green-600">{vendedor.conversion}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{vendedor.valorPromedio}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reportes