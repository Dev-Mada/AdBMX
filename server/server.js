import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Importar modelos y configuración de la base de datos
import { sequelize, Usuario, Cliente, Oportunidad, Tarea, Contacto, syncDB } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const isDefaultJwtSecret = JWT_SECRET === 'change-me';
const isProduction = process.env.NODE_ENV === 'production';

let isDatabaseReady = false;
const DB_RETRY_INTERVAL_MS = Number(process.env.DB_RETRY_INTERVAL_MS || 30000);

const isDatabaseConnectionError = (error) => {
  if (!error) return false;

  const sequelizeErrorNames = new Set([
    'SequelizeConnectionError',
    'SequelizeConnectionRefusedError',
    'SequelizeHostNotFoundError',
    'SequelizeHostNotReachableError',
    'SequelizeAccessDeniedError'
  ]);

  return (
    sequelizeErrorNames.has(error.name)
    || error.code === 'ECONNREFUSED'
    || error?.parent?.code === 'ECONNREFUSED'
    || error?.original?.code === 'ECONNREFUSED'
  );
};

const runDbCheck = async () => {
  const synced = await syncDB();

  if (synced && !isDatabaseReady) {
    console.log('✅ Base de datos lista para recibir peticiones');
  }

  if (!synced && isDatabaseReady) {
    console.warn('⚠️ Se perdió la conexión con la base de datos. Reintentando...');
  }

  isDatabaseReady = synced;
  return synced;
};

const scheduleDbRetries = () => {
  setInterval(async () => {
    if (!isDatabaseReady) {
      await runDbCheck();
    }
  }, DB_RETRY_INTERVAL_MS).unref();
};

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api', (req, res, next) => {
  if (isDatabaseReady) {
    return next();
  }

  return res.status(503).json({
    success: false,
    error: 'Base de datos no disponible. Intenta nuevamente en unos segundos.'
  });
});

if (isDefaultJwtSecret) {
  if (isProduction) {
    console.error('❌ JWT_SECRET no configurado. Debes definirlo en producción.');
    process.exit(1);
  }
  console.warn('⚠️ JWT_SECRET no configurado. Usa una clave segura en el entorno.');
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

// ✅ Ruta raíz - Para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor ADBMX funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/login',
      clientes: '/api/clientes',
      oportunidades: '/api/oportunidades',
      tareas: '/api/tareas',
      usuarios: '/api/usuarios',
      contactos: '/api/contactos'
    }
  });
});

// 🔐 RUTAS DE AUTENTICACIÓN

// Registro de usuarios
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos los campos son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'La contrasena debe tener al menos 6 caracteres' 
      });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false,
        error: 'El email ya esta registrado' 
      });
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);
    
    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || 'usuario',
      activo: true
    });

    const { password: _, ...usuarioSinPassword } = usuario.toJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: usuarioSinPassword
    });

  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible'
      });
    }

    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email y contraseña son requeridos' 
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario desactivado' 
      });
    }

    const bcrypt = await import('bcryptjs');
    const passwordValido = await bcrypt.default.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas' 
      });
    }

    const { password: _, ...usuarioSinPassword } = usuario.toJSON();

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      user: usuarioSinPassword,
      token
    });

  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Error en login: base de datos no disponible');
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible. Intenta nuevamente en unos segundos.'
      });
    }

    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.use('/api', authMiddleware);

// Verificar token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user?.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    res.json(usuario);

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
});

// 📍 Rutas de Usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(req.body.password, 10);
    
    const usuario = await Usuario.create({
      ...req.body,
      password: hashedPassword
    });
    
    const { password, ...usuarioSinPassword } = usuario.toJSON();
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📍 Rutas de Clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [Oportunidad, Contacto, Tarea]
    });
    res.json({ success: true, clientes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json({ success: true, cliente });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [Oportunidad, Contacto, Tarea]
    });
    if (!cliente) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    res.json({ success: true, cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    
    await cliente.update(req.body);
    res.json({ success: true, cliente });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    
    await cliente.destroy();
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📍 Rutas de Oportunidades
app.get('/api/oportunidades', async (req, res) => {
  try {
    const oportunidades = await Oportunidad.findAll({
      include: [Cliente]
    });
    res.json({ success: true, oportunidades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/oportunidades', async (req, res) => {
  try {
    const oportunidad = await Oportunidad.create(req.body);
    res.status(201).json({ success: true, oportunidad });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/oportunidades/:id', async (req, res) => {
  try {
    const oportunidad = await Oportunidad.findByPk(req.params.id);
    if (!oportunidad) return res.status(404).json({ success: false, error: 'Oportunidad no encontrada' });
    
    await oportunidad.update(req.body);
    res.json({ success: true, oportunidad });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/oportunidades/:id', async (req, res) => {
  try {
    const oportunidad = await Oportunidad.findByPk(req.params.id);
    if (!oportunidad) return res.status(404).json({ success: false, error: 'Oportunidad no encontrada' });
    
    await oportunidad.destroy();
    res.json({ success: true, message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📍 Rutas de Tareas
app.get('/api/tareas', async (req, res) => {
  try {
    const tareas = await Tarea.findAll({
      include: [Cliente, Usuario]
    });
    res.json({ success: true, tareas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tareas', async (req, res) => {
  try {
    const tarea = await Tarea.create(req.body);
    res.status(201).json({ success: true, tarea });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
    
    await tarea.update(req.body);
    res.json({ success: true, tarea });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/tareas/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
    
    await tarea.destroy();
    res.json({ success: true, message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📍 Rutas de Contactos
app.get('/api/contactos', async (req, res) => {
  try {
    const contactos = await Contacto.findAll({
      include: [Cliente]
    });
    res.json({ success: true, contactos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contactos', async (req, res) => {
  try {
    const contacto = await Contacto.create(req.body);
    res.status(201).json({ success: true, contacto });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/contactos/:id', async (req, res) => {
  try {
    const contacto = await Contacto.findByPk(req.params.id);
    if (!contacto) return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
    
    await contacto.destroy();
    res.json({ success: true, message: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🏁 Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ADBMX corriendo en puerto ${PORT}`);
  console.log(`📧 Endpoint de login: http://localhost:${PORT}/api/auth/login`);

  await runDbCheck();
  scheduleDbRetries();
});

export default app;
