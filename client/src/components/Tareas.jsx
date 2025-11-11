import { useState, useEffect } from 'react'

const Tareas = () => {
  const [tareas, setTareas] = useState([])
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">✅ Gestión de Tareas</h1>
          <p className="text-gray-600">Organiza tus actividades y recordatorios</p>
        </div>
        <button className="btn-primary">+ Nueva Tarea</button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Módulo de tareas en desarrollo...</p>
      </div>
    </div>
  )
}

export default Tareas