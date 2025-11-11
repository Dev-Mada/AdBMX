import { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    tareasPendientes: 0,
    oportunidadesActivas: 0,
    ventasMes: 0
  })
  const [actividadReciente, setActividadReciente] = useState([])

  useEffect(() => {
    cargarDashboard()
  }, [])

  const cargarDashboard = async () => {
    try {
      const token = localStorage.getItem('adbmx_token')
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setActividadReciente(data.actividadReciente)
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    }
  }

  const chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  }

  const oportunidadesData = {
    labels: ['Nuevo', 'Calificado', 'Propuesta', 'Negociación', 'Ganado'],
    datasets: [
      {
        data: [12, 19, 8, 5, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600">Bienvenido de vuelta! Resumen de tu CRM ADBMX</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalClientes}</h3>
              <p className="text-gray-600">Total Clientes</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.tareasPendientes}</h3>
              <p className="text-gray-600">Tareas Pendientes</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.oportunidadesActivas}</h3>
              <p className="text-gray-600">Oportunidades Activas</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">${stats.ventasMes.toLocaleString()}</h3>
              <p className="text-gray-600">Ventas del Mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Mensuales</h3>
            <Bar data={chartData} options={{ responsive: true }} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades por Etapa</h3>
            <Doughnut data={oportunidadesData} options={{ responsive: true }} />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {actividadReciente.map((actividad, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <span>{actividad.tipo === 'llamada' ? '📞' : 
                           actividad.tipo === 'email' ? '✉️' : '✅'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{actividad.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(actividad.tiempo).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard