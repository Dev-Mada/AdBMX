import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Clientes from './components/Clientes'
import Oportunidades from './components/Oportunidades'
import Tareas from './components/Tareas'
import Contactos from './components/Contactos'
import Reportes from './components/Reportes'
import Configuracion from './components/Configuracion'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
          <Route path="/oportunidades" element={<ProtectedRoute><Layout><Oportunidades /></Layout></ProtectedRoute>} />
          <Route path="/tareas" element={<ProtectedRoute><Layout><Tareas /></Layout></ProtectedRoute>} />
          <Route path="/contactos" element={<ProtectedRoute><Layout><Contactos /></Layout></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Layout><Reportes /></Layout></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><Layout><Configuracion /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">Cargando ADBMX...</div>
  }
  
  return user ? children : <Navigate to="/login" />
}

export default App