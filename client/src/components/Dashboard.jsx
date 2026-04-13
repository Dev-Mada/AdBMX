import { useState, useEffect, useRef } from 'react'
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
import { Users, CheckSquare, Briefcase, DollarSign, TrendingUp, Phone, Mail, UserCheck, CheckCircle, ArrowUp } from 'lucide-react'

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
    totalClientes: 124,
    tareasPendientes: 18,
    oportunidadesActivas: 32,
    ventasMes: 45280,
    tasaConversion: 24,
    clientesNuevos: 12
  })

  const [actividadReciente, setActividadReciente] = useState([
    { tipo: 'llamada', descripcion: 'Llamada con Maria Gonzalez de TechCorp', tiempo: new Date() },
    { tipo: 'email', descripcion: 'Email enviado a Juan Perez', tiempo: new Date(Date.now() - 3600000) },
    { tipo: 'reunion', descripcion: 'Reunion con equipo de ventas', tiempo: new Date(Date.now() - 7200000) },
    { tipo: 'tarea', descripcion: 'Tarea completada: Seguimiento cliente', tiempo: new Date(Date.now() - 10800000) }
  ])

  const getIconoActividad = (tipo) => {
    const iconos = {
      llamada: Phone,
      email: Mail,
      reunion: UserCheck,
      tarea: CheckCircle
    }
    const Icon = iconos[tipo] || CheckCircle
    return <Icon size={18} />
  }

  const getColorActividad = (tipo) => {
    const colores = {
      llamada: 'bg-blue-100 text-blue-600',
      email: 'bg-green-100 text-green-600',
      reunion: 'bg-purple-100 text-purple-600',
      tarea: 'bg-orange-100 text-orange-600'
    }
    return colores[tipo] || 'bg-gray-100 text-gray-600'
  }

  const barChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas Mensuales',
        data: [32000, 29000, 35000, 42000, 38000, 45280, 41000, 48000, 52000, 61000, 58000, 72000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Ventas: $${context.parsed.y.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'k'
          }
        },
        beginAtZero: true
      },
    },
  }

  const doughnutChartData = {
    labels: ['Nuevo', 'Calificado', 'Propuesta', 'Negociacion', 'Ganado'],
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
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
        borderRadius: 4,
        spacing: 2,
      },
    ],
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#64748b',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="text-gray-600 mt-1">Resumen de tu CRM ADBMX</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalClientes}</h3>
              <p className="text-gray-600 text-sm">Total Clientes</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp size={16} className="mr-1" />
              12%
            </span>
            <span className="text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.tareasPendientes}</h3>
              <p className="text-gray-600 text-sm">Tareas Pendientes</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <CheckSquare size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{width: '60%'}}></div>
            </div>
            <p className="text-gray-500 text-xs mt-1">12 completadas esta semana</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.oportunidadesActivas}</h3>
              <p className="text-gray-600 text-sm">Oportunidades Activas</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Briefcase size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUp size={16} className="mr-1" />
              8%
            </span>
            <span className="text-gray-500 ml-2">en progreso</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.ventasMes.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Ventas del Mes</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Meta: $75,000</span>
              <span className="text-gray-900 font-medium">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas Mensuales 2024</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {actividadReciente.map((actividad, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className={`p-2 rounded-lg ${getColorActividad(actividad.tipo)}`}>
                    {getIconoActividad(actividad.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{actividad.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(actividad.tiempo).toLocaleDateString()} - 
                      {new Date(actividad.tiempo).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              Ver toda la actividad
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades por Etapa</h3>
            <div className="h-48">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard