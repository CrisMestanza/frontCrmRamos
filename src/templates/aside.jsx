import { useLocation, Link } from 'react-router-dom'; // Importa Link y useLocation
import styles from "./aside.module.css";
import { MdGroup, MdBadge, MdGroups, MdBarChart, MdHub } from "react-icons/md";

const Aside = ({ sidebarOpen, setSidebarOpen }) => {
  const rol = sessionStorage.getItem("rol");
  const nombre = sessionStorage.getItem("nombre");
  
  // Hook para obtener la ruta actual (ej: '/asesoresadmin')
  const location = useLocation();

  const menusPorRol = {
    ADMIN: [
      { icon: <MdGroup />, label: 'Leads', url: '/inicio' },
      { icon: <MdBadge />, label: 'Asesores', url: '/asesoresadmin' },
      
      { icon: <MdGroups />, label: 'Clientes', url: '/ventasadmin' },
      // { icon: <MdBarChart />, label: 'Estadística', url: '/stats' },
    ],
    ASESOR: [
      { icon: <MdBadge />, label: 'Mi panel', url: '/asesores' },
      { icon: <MdGroups />, label: 'Mis Clientes', url: '/asesores/ventas' },
    ],
  };

  const menuItems = menusPorRol[rol] || [{ icon: <MdGroup />, label: 'Leads', url: '/inicio' }];

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarInner}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <MdHub size="1.5em" color="#ffffff" />
          </div>
          <div>
            <h1 className={styles.logoTitle}>NexusCRM</h1>
            <p className={styles.logoSub}>Panel de Control</p>
          </div>
        </div>

        {/* Nav - Renderizado dinámico con detección de ruta */}
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            // LÓGICA DE ACTIVACIÓN:
            // Si la ruta actual coincide con la url del item, aplicamos la clase active
            const isActive = location.pathname === item.url;

            return (
              <Link
                key={item.label}
                to={item.url}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : styles.navItemInactive}`}
              >
                <span className={styles.iconWrapper}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Información del Usuario */}
        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatarWrapper}>
              <img
                className={styles.avatar}
                src={`https://ui-avatars.com/api/?name=${nombre || 'U'}&background=ec5b13&color=fff`} 
                alt="User avatar"
              />
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{nombre || "Usuario"}</p>
              <p className={styles.userEmail}>{rol || "Sin Rol"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Aside;