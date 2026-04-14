import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, CheckSquare, Phone, 
  BarChart3, Settings, LogOut, Menu, X, ChevronDown,
  Bell, Search, Moon, Sun, Plus, Check, XCircle, Clock, AlertCircle
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adbmx_darkMode') === 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, tipo: 'tarea', titulo: 'Tarea pendiente', descripcion: 'Llamada de seguimiento con TechCorp', tiempo: new Date(Date.now() - 3600000), leida: false },
    { id: 2, tipo: 'oportunidad', titulo: 'Nueva oportunidad', descripcion: 'CyberSecure IT avanzó a negociación', tiempo: new Date(Date.now() - 7200000), leida: false },
    { id: 3, tipo: 'cliente', titulo: 'Cliente nuevo', descripcion: 'Global Finance renovó contrato', tiempo: new Date(Date.now() - 86400000), leida: true },
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/oportunidades', label: 'Oportunidades', icon: Briefcase },
    { path: '/tareas', label: 'Tareas', icon: CheckSquare },
    { path: '/contactos', label: 'Contactos', icon: Phone },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('adbmx_darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && !e.target.closest('.notifications-menu')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full
        bg-[var(--color-sidebar)] transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">ADBMX</span>
            </Link>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          )}
          {!isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                  ${!sidebarOpen ? 'lg:justify-center' : ''}
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button
            onClick={() => sidebarOpen ? setSidebarOpen(false) : setSidebarOpen(true)}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all
              ${!sidebarOpen ? 'lg:justify-center' : ''}
            `}
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Top Header */}
        <header className="h-20 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-xl"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-[var(--color-bg-secondary)] px-4 py-2.5 rounded-xl border border-[var(--color-border)] w-80">
              <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Buscar clientes, oportunidades..." 
                className="bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] w-full"
              />
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-card)] rounded border border-[var(--color-border)]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-xl transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative notifications-menu">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="relative p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificaciones.some(n => !n.leida) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Notificaciones</h3>
                    <button 
                      onClick={() => setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Marcar todo leído
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-4 text-center text-[var(--color-text-muted)]">
                        No hay notificaciones
                      </div>
                    ) : (
                      notificaciones.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`px-4 py-3 border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${!notif.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              notif.tipo === 'tarea' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                              notif.tipo === 'oportunidad' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' :
                              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            }`}>
                              {notif.tipo === 'tarea' ? <Clock className="w-4 h-4" /> :
                               notif.tipo === 'oportunidad' ? <Briefcase className="w-4 h-4" /> :
                               <Users className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[var(--color-text-primary)]">{notif.titulo}</p>
                              <p className="text-xs text-[var(--color-text-muted)] truncate">{notif.descripcion}</p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                {notif.tiempo.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.leida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-[var(--color-border)]">
                    <button className="w-full text-center text-sm text-blue-600 hover:underline">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative user-menu">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(user?.nombre)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.rol || 'Usuario'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] hidden md:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-[var(--color-border)]">
                    <p className="font-semibold text-[var(--color-text-primary)]">{user?.nombre}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                  </div>
                  <Link 
                    to="/configuracion"
                    className="flex items-center gap-3 px-4 py-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Configuración</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
