import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'adbmx',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// Modelos
const Usuario = sequelize.define('Usuario', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  rol: {
    type: Sequelize.ENUM('admin', 'usuario', 'vendedor'),
    defaultValue: 'usuario'
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

const Cliente = sequelize.define('Cliente', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  telefono: {
    type: Sequelize.STRING
  },
  empresa: {
    type: Sequelize.STRING
  },
  industria: {
    type: Sequelize.STRING
  },
  direccion: {
    type: Sequelize.TEXT
  },
  estado: {
    type: Sequelize.ENUM('prospecto', 'cliente', 'inactivo', 'perdido'),
    defaultValue: 'prospecto'
  },
  valorPotencial: {
    type: Sequelize.DECIMAL(10, 2)
  },
  fuente: {
    type: Sequelize.STRING
  },
  notas: {
    type: Sequelize.TEXT
  }
});

const Oportunidad = sequelize.define('Oportunidad', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descripcion: {
    type: Sequelize.TEXT
  },
  valor: {
    type: Sequelize.DECIMAL(10, 2)
  },
  etapa: {
    type: Sequelize.ENUM('nuevo', 'calificado', 'propuesta', 'negociacion', 'ganado', 'perdido'),
    defaultValue: 'nuevo'
  },
  probabilidad: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  fechaCierre: {
    type: Sequelize.DATE
  },
  notas: {
    type: Sequelize.TEXT
  }
});

const Tarea = sequelize.define('Tarea', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descripcion: {
    type: Sequelize.TEXT
  },
  tipo: {
    type: Sequelize.ENUM('llamada', 'email', 'reunion', 'seguimiento', 'otro'),
    defaultValue: 'otro'
  },
  prioridad: {
    type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  estado: {
    type: Sequelize.ENUM('pendiente', 'en_progreso', 'completada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  fechaVencimiento: {
    type: Sequelize.DATE
  },
  fechaRecordatorio: {
    type: Sequelize.DATE
  }
});

const Contacto = sequelize.define('Contacto', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING
  },
  telefono: {
    type: Sequelize.STRING
  },
  puesto: {
    type: Sequelize.STRING
  },
  departamento: {
    type: Sequelize.STRING
  },
  esPrincipal: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

// Relaciones
Cliente.hasMany(Oportunidad, { foreignKey: 'clienteId' });
Oportunidad.belongsTo(Cliente, { foreignKey: 'clienteId' });

Cliente.hasMany(Tarea, { foreignKey: 'clienteId' });
Tarea.belongsTo(Cliente, { foreignKey: 'clienteId' });

Cliente.hasMany(Contacto, { foreignKey: 'clienteId' });
Contacto.belongsTo(Cliente, { foreignKey: 'clienteId' });

Usuario.hasMany(Tarea, { foreignKey: 'usuarioId' });
Tarea.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Usuario.hasMany(Oportunidad, { foreignKey: 'usuarioId' });
Oportunidad.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Sincronizar base de datos
const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');
    
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    
    // Crear usuario admin por defecto
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@adbmx.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const bcrypt = await import('bcryptjs');
    const adminExists = await Usuario.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.default.hash(adminPassword, 10);
      await Usuario.create({
        nombre: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        rol: 'admin'
      });
      console.log(`✅ Usuario admin creado (${adminEmail} / ${adminPassword})`);
    }
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
  }
};

export { sequelize, Usuario, Cliente, Oportunidad, Tarea, Contacto, syncDB };
