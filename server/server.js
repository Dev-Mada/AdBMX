// server/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 ¡Backend AdBMX funcionando correctamente!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Ruta para productos (simulados por ahora)
app.get('/api/productos', (req, res) => {
  const productos = [
    { id: 1, nombre: 'BMX Race Pro', precio: 450, categoria: 'Carrera' },
    { id: 2, nombre: 'BMX Freestyle', precio: 380, categoria: 'Freestyle' },
    { id: 3, nombre: 'BMX Junior', precio: 220, categoria: 'Niños' }
  ];
  res.json(productos);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎯 Servidor backend ejecutándose en: http://localhost:${PORT}`);
  console.log(`📡 Ruta de prueba: http://localhost:${PORT}/api`);
});