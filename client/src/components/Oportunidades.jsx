import { useState, useEffect } from 'react'

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([])
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💼 Oportunidades de Venta</h1>
          <p className="text-gray-600">Gestiona tu pipeline de ventas</p>
        </div>
        <button className="btn-primary">+ Nueva Oportunidad</button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Módulo de oportunidades en desarrollo...</p>
      </div>
    </div>
  )
}

export default Oportunidades