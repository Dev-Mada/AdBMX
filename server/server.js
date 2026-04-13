import { Op } from 'sequelize';
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

// Test endpoint sin api
app.get('/test', (req, res) => {
  res.json({ message: 'test ok' });
});

// 📍 Endpoint para poblar datos de prueba
app.post('/seed', async (req, res) => {
  try {
    console.log('SEED START');

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

// 📍 Endpoint para poblar datos de prueba (sin auth, fuera de /api para evitar middleware)
app.post('/seed', async (req, res) => {
  try {
    const t = await sequelize.transaction();
    
    try {
      await Tarea.destroy({ where: {}, transaction: t, force: true });
      await Oportunidad.destroy({ where: {}, transaction: t, force: true });
      await Contacto.destroy({ where: {}, transaction: t, force: true });
      await Cliente.destroy({ where: {}, transaction: t, force: true });
      await Usuario.destroy({ where: { email: { [Op.ne]: 'admin@adbmx.com' } }, transaction: t, force: true });
      
      await t.commit();
    } catch (innerError) {
      await t.rollback();
      console.error('Error en destroy:', innerError);
      throw innerError;
    }
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('demo123', 10);
    
    await Usuario.bulkCreate([
      { nombre: 'Administrador', email: 'admin@adbmx.com', password: hashedPassword, rol: 'admin', activo: true },
      { nombre: 'Carlos Martinez', email: 'carlos@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
      { nombre: 'Laura Fernandez', email: 'laura@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
      { nombre: 'Miguel Lopez', email: 'miguel@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
      { nombre: 'Sara Gomez', email: 'sara@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
      { nombre: 'David Rodriguez', email: 'david@adbmx.com', password: hashedPassword, rol: 'usuario', activo: true },
      { nombre: 'Elena Sanchez', email: 'elena@adbmx.com', password: hashedPassword, rol: 'usuario', activo: true },
      { nombre: 'Javier Torres', email: 'javier@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
      { nombre: 'Maria Perez', email: 'maria@adbmx.com', password: hashedPassword, rol: 'usuario', activo: true },
      { nombre: 'Roberto Diaz', email: 'roberto@adbmx.com', password: hashedPassword, rol: 'vendedor', activo: true },
    ]);

    const clientesData = [
      { nombre: 'Ana Rodriguez', email: 'ana.rodriguez@techcorp.es', telefono: '+34 612 345 678', empresa: 'TechCorp Solutions', industria: 'Tecnologia', direccion: 'Calle Gran Via 28, Madrid', estado: 'cliente', valorPotencial: 85000, fuente: 'referencia', notas: 'Cliente enterprise - contrato activo' },
      { nombre: 'Carlos Vila', email: 'carlos.vila@innovatelabs.com', telefono: '+34 933 123 456', empresa: 'Innovate Labs', industria: 'Consultoria', direccion: 'Av. Diagonal 456, Barcelona', estado: 'cliente', valorPotencial: 125000, fuente: 'web', notas: 'Interesados en CRM enterprise' },
      { nombre: 'Elena Fuentes', email: 'elena@globalfinance.es', telefono: '+34 915 678 901', empresa: 'Global Finance', industria: 'Finanzas', direccion: 'Paseo Castellana 89, Madrid', estado: 'cliente', valorPotencial: 220000, fuente: 'evento', notas: 'Contrato renovado hasta 2026' },
      { nombre: 'Miguel Sanchez', email: 'm.sanchez@healthplus.es', telefono: '+34 963 456 789', empresa: 'HealthPlus Medical', industria: 'Salud', direccion: 'Calle Colon 12, Valencia', estado: 'cliente', valorPotencial: 95000, fuente: 'referencia', notas: 'Expansion a 3 sedes' },
      { nombre: 'Laura Ruiz', email: 'laura.ruiz@edulearn.io', telefono: '+34 972 234 567', empresa: 'EduLearn Platform', industria: 'Educacion', direccion: 'Rambla Catalunya 78, Barcelona', estado: 'cliente', valorPotencial: 78000, fuente: 'redes', notas: 'Startup en crecimiento - 2 año contrato' },
      { nombre: 'Jorge Chen', email: 'j.chen@datadriven.es', telefono: '+34 911 234 567', empresa: 'DataDriven Analytics', industria: 'Tecnologia', direccion: 'Calle Serrano 210, Madrid', estado: 'prospecto', valorPotencial: 145000, fuente: 'referencia', notas: 'Gran oportunidad B2B - decision en febrero' },
      { nombre: 'Sofia Martinez', email: 'sofia@greenenergy.es', telefono: '+34 955 789 012', empresa: 'GreenEnergy Co', industria: 'Energia', direccion: 'Av. de la Palmera 34, Sevilla', estado: 'cliente', valorPotencial: 112000, fuente: 'evento', notas: 'Contrato anual' },
      { nombre: 'Antonio Garcia', email: 'antonio.g@constructoranorte.es', telefono: '+34 942 123 456', empresa: 'Constructora del Norte', industria: 'Construccion', direccion: 'Calle Hurtado de Ameztoy 15, Bilbao', estado: 'prospecto', valorPotencial: 89000, fuente: 'publicidad', notas: 'Campana digital - seguimiento mensual' },
      { nombre: 'Patricia Lopez', email: 'p.lopez@mediahub.es', telefono: '+34 917 456 789', empresa: 'MediaHub Productions', industria: 'Medios', direccion: 'Calle Fuencarral 112, Madrid', estado: 'cliente', valorPotencial: 62000, fuente: 'web', notas: 'Cliente fiel - renovacion pendiente' },
      { nombre: 'Oscar Moreno', email: 'oscar.m@logifast.es', telefono: '+34 968 567 890', empresa: 'LogiFast Transport', industria: 'Logistica', direccion: 'Calle Cartagena 89, Murcia', estado: 'perdido', valorPotencial: 48000, fuente: 'referencia', notas: 'Competencia gano - mantener contacto' },
      { nombre: 'Cristina Gomez', email: 'c.gomez@agrotech.es', telefono: '+34 975 678 901', empresa: 'AgroTech Solutions', industria: 'Agricultura', direccion: 'Paseo de la Castellana 150, Soria', estado: 'prospecto', valorPotencial: 72000, fuente: 'web', notas: 'Proyecto digitalizacion - presupuesto aprobado' },
      { nombre: 'Fernando Torres', email: 'f.torres@cybersecure.es', telefono: '+34 910 345 678', empresa: 'CyberSecure IT', industria: 'Tecnologia', direccion: 'Calle Jose Ortega y Gasset 22, Madrid', estado: 'cliente', valorPotencial: 185000, fuente: 'evento', notas: 'Contrato enterprise - 3 años' },
      { nombre: 'Isabel Ramirez', email: 'i.ramirez@foodchain.es', telefono: '+34 976 789 012', empresa: 'FoodChain Distribution', industria: 'Alimentacion', direccion: 'Av. Navarra 45, Zaragoza', estado: 'prospecto', valorPotencial: 95000, fuente: 'redes', notas: 'Reunion enero - necesita propuesta' },
      { nombre: 'Alejandro Castro', email: 'a.castro@travelway.es', telefono: '+34 922 456 789', empresa: 'TravelWay Agency', industria: 'Turismo', direccion: 'Calle La Haya 8, Tenerife', estado: 'inactivo', valorPotencial: 35000, fuente: 'web', notas: 'Sin respuesta - recontactar en Q2' },
      { nombre: 'Monica Herrera', email: 'm.herrera@retailmax.es', telefono: '+34 985 345 678', empresa: 'RetailMax', industria: 'Comercio', direccion: 'Calle Sierra de Gredos 5, Asturias', estado: 'inactivo', valorPotencial: 42000, fuente: 'web', notas: 'En pausa - presupuesto 2025' },
      { nombre: 'Victor Salazar', email: 'v.salazar@fintechpro.es', telefono: '+34 932 456 789', empresa: 'FinTech Pro', industria: 'Finanzas', direccion: 'Av. Catalonia 55, Barcelona', estado: 'prospecto', valorPotencial: 165000, fuente: 'evento', notas: 'Demo scheduled - enero' },
      { nombre: 'Lucia Fernandez', email: 'l.fernandez@cloudsafe.io', telefono: '+34 914 567 890', empresa: 'CloudSafe', industria: 'Tecnologia', direccion: 'Calle Alcala 180, Madrid', estado: 'cliente', valorPotencial: 54000, fuente: 'referencia', notas: 'Contrato anual - upsell potencial' },
      { nombre: 'Ricardo Gomez', email: 'r.gomez@autologistics.es', telefono: '+34 943 678 901', empresa: 'AutoLogistics', industria: 'Logistica', direccion: 'Poligono Industrial Basauri, Vizcaya', estado: 'prospecto', valorPotencial: 78000, fuente: 'web', notas: 'Implementacion 2025' },
      { nombre: 'Natalia Jimenez', email: 'n.jimenez@solarwave.es', telefono: '+34 956 789 012', empresa: 'SolarWave Energy', industria: 'Energia', direccion: 'Carretera Cadiz-Malaga, Jerez', estado: 'prospecto', valorPotencial: 110000, fuente: 'evento', notas: 'Proyecto renovable - 2 fases' },
      { nombre: 'Alberto Munoz', email: 'a.munoz@medtechspain.es', telefono: '+34 964 890 123', empresa: 'MedTech Spain', industria: 'Salud', direccion: 'Av. Valencia 45, Valencia', estado: 'cliente', valorPotencial: 88000, fuente: 'referencia', notas: 'Expandiendo a Valencia' },
      { nombre: 'Beatriz Sanchez', email: 'b.sanchez@urbanfood.es', telefono: '+34 977 901 234', empresa: 'UrbanFood', industria: 'Alimentacion', direccion: 'Plaza Central 12, Zaragoza', estado: 'prospecto', valorPotencial: 63000, fuente: 'redes', notas: 'Startup foodtech' },
      { nombre: 'Daniel Ortega', email: 'd.ortega@buildsmart.es', telefono: '+34 948 012 345', empresa: 'BuildSmart', industria: 'Construccion', direccion: 'Calle Tudela 8, Pamplona', estado: 'prospecto', valorPotencial: 94000, fuente: 'publicidad', notas: 'Obra nueva 2025' },
      { nombre: 'Carmen Velasco', email: 'c.velasco@luxehotels.es', telefono: '+34 928 123 456', empresa: 'Luxe Hotels', industria: 'Turismo', direccion: 'Av. Martinez 88, Gran Canaria', estado: 'cliente', valorPotencial: 47000, fuente: 'web', notas: 'Cadena hotelera - 5 hoteles' },
      { nombre: 'Juan Manuel Ruiz', email: 'j.ruiz@retailsolutions.es', telefono: '+34 981 234 567', empresa: 'Retail Solutions', industria: 'Comercio', direccion: 'Calle San Andres 150, La Coruña', estado: 'prospecto', valorPotencial: 56000, fuente: 'referencia', notas: 'Franchise chain' },
      { nombre: 'Sandra Castillo', email: 's.castillo@smartfactory.es', telefono: '+34 935 345 678', empresa: 'Smart Factory', industria: 'Manufactura', direccion: 'Carrer Catalunya 200, Barcelona', estado: 'cliente', valorPotencial: 135000, fuente: 'evento', notas: 'Digitalizacion industrial' },
      { nombre: 'Francisco Soto', email: 'f.soto@legalcorp.es', telefono: '+34 913 456 789', empresa: 'LegalCorp Spain', industria: 'Servicios', direccion: 'Paseo Recoletos 23, Madrid', estado: 'cliente', valorPotencial: 38000, fuente: 'web', notas: 'Firma legal - renew Q1' },
      { nombre: 'Marta Delgado', email: 'm.delgado@educare.es', telefono: '+34 923 567 890', empresa: 'EduCare', industria: 'Educacion', direccion: 'Calle Universidad 45, Salamanca', estado: 'prospecto', valorPotencial: 42000, fuente: 'redes', notas: 'Colegio privado - 3 sedes' },
      { nombre: 'Antonio Ruiz', email: 'a.ruiz@securhome.es', telefono: '+34 954 678 901', empresa: 'SecurHome', industria: 'Seguridad', direccion: 'Av. Principal 78, Sevilla', estado: 'prospecto', valorPotencial: 67000, fuente: 'referencia', notas: 'Alarmas residenciales' },
      { nombre: 'Luisa Perez', email: 'l.perez@biopharma.es', telefono: '+34 965 789 012', empresa: 'BioPharma Labs', industria: 'Salud', direccion: 'Parque Cientifico 23, Alicante', estado: 'cliente', valorPotencial: 102000, fuente: 'evento', notas: 'I+D farmaceutico' },
      { nombre: 'Mario Fernandez', email: 'm.fernandez@videogamestudios.es', telefono: '+34 912 890 123', empresa: 'VideoGame Studios', industria: 'Entretenimiento', direccion: 'Calle Bravo 30, Madrid', estado: 'prospecto', valorPotencial: 55000, fuente: 'web', notas: 'Estudio indie games' },
      { nombre: 'Elvira Navarro', email: 'e.navarro@cleanworld.es', telefono: '+34 976 901 234', empresa: 'CleanWorld', industria: 'Medio Ambiente', direccion: 'Poligono recycle 10, Zaragoza', estado: 'prospecto', valorPotencial: 81000, fuente: 'evento', notas: 'Reciclaje industrial' },
      { nombre: 'Pedro Martinez', email: 'p.martinez@autodealer.es', telefono: '+34 982 012 345', empresa: 'AutoDealer Plus', industria: 'Automocion', direccion: 'Carretera national 120, Burgos', estado: 'prospecto', valorPotencial: 43000, fuente: 'publicidad', notas: 'Concesionario multMarca' },
    ];

    const clientes = await Cliente.bulkCreate(clientesData);

    const hoy = new Date();
    
    const usuarios = await Usuario.findAll();
    const getRandomUsuario = () => usuarios[Math.floor(Math.random() * usuarios.length)]?.id || 1;
    
    const getRandomDate = (minDays, maxDays) => new Date(hoy.getTime() + (Math.random() * (maxDays - minDays) + minDays) * 24 * 60 * 60 * 1000);
    const getPastDate = (minDays, maxDays) => new Date(hoy.getTime() - (Math.random() * (maxDays - minDays) + minDays) * 24 * 60 * 60 * 1000);

    const oportunidadesData = [
      { titulo: 'Implementacion CRM Enterprise', descripcion: 'Despliegue completo del sistema CRM', valor: 85000, etapa: 'propuesta', probabilidad: 60, fechaCierre: getRandomDate(20, 40), clienteId: clientes[0].id, usuarioId: getRandomUsuario() },
      { titulo: 'Soporte Tecnico Premium', descripcion: 'Contrato anual de soporte 24/7', valor: 36000, etapa: 'negociacion', probabilidad: 75, fechaCierre: getRandomDate(10, 20), clienteId: clientes[0].id, usuarioId: getRandomUsuario() },
      { titulo: 'Expansion Global Finance', descripcion: 'Extension del contrato a nueva sede Barcelona', valor: 125000, etapa: 'negociacion', probabilidad: 80, fechaCierre: getRandomDate(5, 15), clienteId: clientes[2].id, usuarioId: getRandomUsuario() },
      { titulo: 'Licencias HealthPlus', descripcion: '50 licencias para nueva sede Valencia', valor: 45000, etapa: 'ganado', probabilidad: 100, fechaCierre: getPastDate(2, 8), clienteId: clientes[3].id, usuarioId: getRandomUsuario() },
      { titulo: 'Formacion equipo comercial', descripcion: 'Programa de formacion para 15 vendedores', valor: 18000, etapa: 'calificado', probabilidad: 35, fechaCierre: getRandomDate(40, 60), clienteId: clientes[1].id, usuarioId: getRandomUsuario() },
      { titulo: 'Dashboard Analytics Premium', descripcion: 'Modulo de reporting personalizado', valor: 52000, etapa: 'nuevo', probabilidad: 15, fechaCierre: getRandomDate(80, 100), clienteId: clientes[5].id, usuarioId: getRandomUsuario() },
      { titulo: 'Renovacion contrato anual', descripcion: 'Renovacion de licencia para 2026', valor: 42000, etapa: 'negociacion', probabilidad: 85, fechaCierre: getRandomDate(3, 10), clienteId: clientes[6].id, usuarioId: getRandomUsuario() },
      { titulo: 'Integracion con SAP', descripcion: 'Conector API para SAP Business One', valor: 78000, etapa: 'propuesta', probabilidad: 45, fechaCierre: getRandomDate(50, 70), clienteId: clientes[7].id, usuarioId: getRandomUsuario() },
      { titulo: 'Modulo automatizacion marketing', descripcion: 'Campanas automaticas para EduLearn', valor: 28000, etapa: 'calificado', probabilidad: 40, fechaCierre: getRandomDate(30, 45), clienteId: clientes[4].id, usuarioId: getRandomUsuario() },
      { titulo: 'Backup cloud enterprise', descripcion: 'Solucion de backup con DR', valor: 65000, etapa: 'nuevo', probabilidad: 20, fechaCierre: getRandomDate(90, 120), clienteId: clientes[11].id, usuarioId: getRandomUsuario() },
      { titulo: 'Consultoria estrategia digital', descripcion: 'Auditoria y plan de transformacion', valor: 35000, etapa: 'perdido', probabilidad: 0, fechaCierre: getPastDate(5, 15), clienteId: clientes[9].id, usuarioId: getRandomUsuario() },
      { titulo: 'Plataforma e-learning', descripcion: 'Sistema de formacion online completo', valor: 58000, etapa: 'propuesta', probabilidad: 55, fechaCierre: getRandomDate(25, 35), clienteId: clientes[10].id, usuarioId: getRandomUsuario() },
      { titulo: 'Actualizacion sistema CRM', descripcion: 'Migracion a nueva version 2024', valor: 22000, etapa: 'ganado', probabilidad: 100, fechaCierre: getPastDate(1, 5), clienteId: clientes[8].id, usuarioId: getRandomUsuario() },
      { titulo: 'Gestion de inventario', descripcion: 'Modulo de inventario para FoodChain', valor: 48000, etapa: 'nuevo', probabilidad: 25, fechaCierre: getRandomDate(70, 90), clienteId: clientes[12].id, usuarioId: getRandomUsuario() },
      { titulo: 'App movil ventas', descripcion: 'Aplicacion movil para equipo comercial', valor: 38000, etapa: 'calificado', probabilidad: 50, fechaCierre: getRandomDate(35, 50), clienteId: clientes[15].id, usuarioId: getRandomUsuario() },
      { titulo: 'API de pagos', descripcion: 'Integracion pasarela de pagos Stripe', valor: 25000, etapa: 'propuesta', probabilidad: 40, fechaCierre: getRandomDate(40, 55), clienteId: clientes[16].id, usuarioId: getRandomUsuario() },
      { titulo: 'Contrato soporte 3 años', descripcion: 'Soporte premium para CloudSafe', valor: 48000, etapa: 'negociacion', probabilidad: 90, fechaCierre: getRandomDate(7, 14), clienteId: clientes[17].id, usuarioId: getRandomUsuario() },
      { titulo: 'Sistema trazabilidad', descripcion: 'Modulo de rastreo para logistica', valor: 62000, etapa: 'nuevo', probabilidad: 15, fechaCierre: getRandomDate(80, 100), clienteId: clientes[18].id, usuarioId: getRandomUsuario() },
      { titulo: 'Panel solar monitoring', descripcion: 'Dashboard para instalaciones solares', valor: 35000, etapa: 'propuesta', probabilidad: 45, fechaCierre: getRandomDate(30, 45), clienteId: clientes[19].id, usuarioId: getRandomUsuario() },
      { titulo: 'CRM para cadenas retail', descripcion: 'Sistema multi-sucursal', valor: 95000, etapa: 'calificado', probabilidad: 30, fechaCierre: getRandomDate(50, 70), clienteId: clientes[23].id, usuarioId: getRandomUsuario() },
      { titulo: 'Auditoria seguridad informatica', descripcion: 'Penetration testing + informe', valor: 28000, etapa: 'ganado', probabilidad: 100, fechaCierre: getPastDate(3, 10), clienteId: clientes[11].id, usuarioId: getRandomUsuario() },
      { titulo: 'Implementacion IA客户服务', descripcion: 'Chatbot con IA para atención al cliente', valor: 42000, etapa: 'nuevo', probabilidad: 20, fechaCierre: getRandomDate(60, 80), clienteId: clientes[1].id, usuarioId: getRandomUsuario() },
      { titulo: 'Migracion a la nube', descripcion: 'Migracion completa AWS/Azure', valor: 145000, etapa: 'propuesta', probabilidad: 50, fechaCierre: getRandomDate(45, 60), clienteId: clientes[24].id, usuarioId: getRandomUsuario() },
      { titulo: 'Sistema gestion hotelera', descripcion: 'PMS completo para cadena hotelera', valor: 72000, etapa: 'calificado', probabilidad: 35, fechaCierre: getRandomDate(40, 55), clienteId: clientes[22].id, usuarioId: getRandomUsuario() },
      { titulo: 'Warehouse management', descripcion: 'Sistema de gestion de almacenes', valor: 88000, etapa: 'nuevo', probabilidad: 10, fechaCierre: getRandomDate(90, 120), clienteId: clientes[18].id, usuarioId: getRandomUsuario() },
      { titulo: 'Renovacion licencias BioPharma', descripcion: 'Renovacion anual - 100 licencias', valor: 68000, etapa: 'negociacion', probabilidad: 70, fechaCierre: getRandomDate(15, 25), clienteId: clientes[28].id, usuarioId: getRandomUsuario() },
      { titulo: 'Gamification plataforma', descripcion: 'Sistema de puntos para clientes', valor: 32000, etapa: 'propuesta', probabilidad: 35, fechaCierre: getRandomDate(35, 50), clienteId: clientes[29].id, usuarioId: getRandomUsuario() },
      { titulo: 'BI para retail', descripcion: 'Business Intelligence para tiendas', valor: 45000, etapa: 'calificado', probabilidad: 45, fechaCierre: getRandomDate(25, 40), clienteId: clientes[23].id, usuarioId: getRandomUsuario() },
      { titulo: 'Portal clientes Self-Service', descripcion: 'Portal web para gestion de casos', valor: 38000, etapa: 'nuevo', probabilidad: 15, fechaCierre: getRandomDate(70, 90), clienteId: clientes[2].id, usuarioId: getRandomUsuario() },
      { titulo: 'Automatizacion RRHH', descripcion: 'Modulo de nominas y vacaciones', valor: 26000, etapa: 'propuesta', probabilidad: 55, fechaCierre: getRandomDate(20, 35), clienteId: clientes[25].id, usuarioId: getRandomUsuario() },
    ];

    await Oportunidad.bulkCreate(oportunidadesData);

    const generarTareas = () => {
      const tareas = [];
      const tipos = ['llamada', 'email', 'reunion', 'seguimiento', 'otro'];
      const prioridades = ['baja', 'media', 'alta', 'urgente'];
      const estados = ['pendiente', 'en_progreso', 'completada'];
      
      const textos = [
        { titulo: 'Llamada de seguimiento', desc: 'Confirmar disponibilidad para reunion' },
        { titulo: 'Enviar propuesta comercial', desc: 'Adjuntar dokumentacion y pricing' },
        { titulo: 'Reunion de presentacion', desc: 'Demostracion del producto' },
        { titulo: 'Preparar presupuesto', desc: 'Detalle de servicios y costos' },
        { titulo: 'Seguimiento post-reunion', desc: 'Enviar resumen y siguientes pasos' },
        { titulo: 'Llamada de cierre', desc: 'Confirmar decision final' },
        { titulo: 'Enviar contrato', desc: 'Preparar dokumentacion legal' },
        { titulo: 'Review con equipo', desc: 'Evaluar estrategia comercial' },
        { titulo: 'Actualizar CRM', desc: 'Registrar actividad y notas' },
        { titulo: 'Preparar presentacion', desc: 'Slides para proxima reunion' },
        { titulo: 'Verificar requisitos', desc: 'Revisar checklist con el cliente' },
        { titulo: 'Coordinar implementacion', desc: 'Planificar rollout' },
        { titulo: 'Llamada de descubriendo', desc: 'Entender necesidades del cliente' },
        { titulo: 'Enviar caso de exito', desc: 'Compartir referencias de otros clientes' },
        { titulo: 'Seguimiento perdido', desc: 'Contactar razones de perdida' },
      ];

      for (let i = 0; i < 45; i++) {
        const texto = textos[Math.floor(Math.random() * textos.length)];
        const clienteRand = clientes[Math.floor(Math.random() * clientes.length)];
        const tieneCliente = Math.random() > 0.3;
        
        tareas.push({
          titulo: `${texto.titulo} ${clienteRand.empresa.split(' ')[0]}`,
          descripcion: texto.desc,
          tipo: tipos[Math.floor(Math.random() * tipos.length)],
          prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
          estado: estados[Math.floor(Math.random() * estados.length)],
          fechaVencimiento: Math.random() > 0.3 ? (Math.random() > 0.5 ? getRandomDate(-5, 5) : getRandomDate(5, 20)) : null,
          clienteId: tieneCliente ? clienteRand.id : null,
          usuarioId: getRandomUsuario(),
        });
      }
      return tareas;
    };

    const tareasData = generarTareas();
    await Tarea.bulkCreate(tareasData);

    const generarContactos = () => {
      const contactos = [];
      const puestos = ['CEO', 'CTO', 'Director Comercial', 'Gerente de Ventas', 'Responsable IT', 'Director Marketing', 'COO', 'CFO', 'Director RRHH', 'Jefe de Proyectos', 'Responsable Compras'];
      const departamentos = ['Direccion', 'Ventas', 'Marketing', 'Tecnologia', 'Operaciones', 'Finanzas', 'RRHH', 'Compras', 'Produccion'];
      
      clientes.forEach(cliente => {
        const numContactos = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numContactos; i++) {
          contactos.push({
            nombre: `${['Ana', 'Carlos', 'Elena', 'Miguel', 'Laura', 'Jorge', 'Sofia', 'Antonio', 'Patricia', 'Oscar', 'Cristina', 'Fernando', 'Isabel', 'Alejandro'][Math.floor(Math.random() * 15)]} ${['Rodriguez', 'Garcia', 'Martinez', 'Lopez', 'Fernandez', 'Sanchez', 'Torres', 'Perez', 'Gomez', 'Ruiz', 'Vega', 'Castro', 'Navarro', 'Jimenez'][Math.floor(Math.random() * 14)]}`,
            email: `${['ana', 'carlos', 'elena', 'miguel', 'laura', 'jorge', 'sofia', 'antonio', 'patricia', 'oscar', 'cristina', 'fernando', 'isabel', 'alejandro'][Math.floor(Math.random() * 14)]}.${['rodriguez', 'garcia', 'martinez', 'lopez', 'fernandez', 'sanchez', 'torres', 'perez', 'gomez', 'ruiz'][Math.floor(Math.random() * 10)]}@${cliente.email.split('@')[1]}`,
            telefono: `+34 6${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
            puesto: puestos[Math.floor(Math.random() * puestos.length)],
            departamento: departamentos[Math.floor(Math.random() * departamentos.length)],
            esPrincipal: i === 0,
            clienteId: cliente.id,
          });
        }
      });
      return contactos;
    };

    const contactosData = generarContactos();
    await Contacto.bulkCreate(contactosData);

    res.json({ success: true, message: `Cargados: ${usuarios.length} usuarios, ${clientes.length} clientes, ${oportunidadesData.length} oportunidades, ${tareasData.length} tareas, ${contactosData.length} contactos` });
  } catch (error) {
    console.error('Error al poblar datos:', error);
    res.status(500).json({ success: false, error: error.message });
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
