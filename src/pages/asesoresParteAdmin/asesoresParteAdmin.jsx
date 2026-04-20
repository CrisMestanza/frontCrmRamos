import React, { useState, useEffect } from 'react';
import { MdSearch, MdFilterList, MdMoreVert, MdChevronLeft, MdChevronRight } from "react-icons/md";
import axios from "axios";
import Aside from '../../templates/aside';
import styles from './asesoresParteAdmin.module.css';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate

const AsesoresParteAdmin = () => {
  const [dataAsesores, setDataAsesores] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate(); // 2. Inicializar navegación


  const handleRowClick = (id) => {
    navigate(`/asesoresadmin/detalle/${id}`);
  };


  // Obtener asesores desde la API
  useEffect(() => {
    const obtenerAsesores = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/getasesores/");
        setDataAsesores(response.data);
      } catch (error) {
        console.error("Error al obtener asesores:", error);
      }
    };
    obtenerAsesores();
  }, []);

  return (
    <div className={styles.wrapper}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={styles.main}>
        {/* Header móvil */}
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className={styles.mobileTitle}>NexusCRM</span>
          <div className={styles.mobileHeaderRight} />
        </div>

        {/* 2. PAGE HEADER */}
        <header className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Gestión de Asesores</h2>
            <p className={styles.pageSubtitle}>
              Administra el equipo de ventas y sus roles en la plataforma.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn}><MdSearch size="1.5em" /></button>
            <button className={styles.iconBtn}><MdFilterList size="1.5em" /></button>
          </div>
        </header>

        {/* 3. METRICS (Adaptadas a Asesores) */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Total Asesores</p>
              <span className={styles.metricBadge}>Activos</span>
            </div>
            <p className={styles.metricValue}>{dataAsesores.length}</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '100%' }} />
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Admins</p>
              <span className={styles.metricBadge}>Control</span>
            </div>
            <p className={styles.metricValue}>
              {dataAsesores.filter(a => a.rol === 'ADMIN').length}
            </p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '20%', backgroundColor: '#ef4444' }} />
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Asesores de Ventas</p>
              <span className={styles.metricBadge}>Ventas</span>
            </div>
            <p className={styles.metricValue}>
              {dataAsesores.filter(a => a.rol === 'ASESOR').length}
            </p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '80%', backgroundColor: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* 4. TABLE SECTION */}
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.th}>Nombre y Email</th>
                  <th className={styles.th}>Teléfono</th>
                  <th className={styles.th}>Rol</th>
                  <th className={styles.th}>Estado</th>
                  <th className={`${styles.th} ${styles.thHideMedium}`}>Fecha Registro</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dataAsesores.map((asesor) => (
                  <tr
                    // Cambiado lead.id_lead por asesor.id_usuario
                    key={asesor.id_usuario}
                    className={styles.tableRow}
                    // Ahora llamamos a la función handleRowClick correctamente
                    onClick={() => handleRowClick(asesor.id_usuario)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Nombre e Email */}
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <div className={styles.initials}>
                          {asesor.nombre?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className={styles.leadName}>{asesor.nombre}</p>
                          <p style={{ fontSize: '11px', opacity: 0.7 }}>{asesor.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className={styles.td}>
                      <p className={styles.tdMuted}>{asesor.telefono}</p>
                    </td>

                    {/* Rol con color dinámico */}
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${asesor.rol === 'ADMIN' ? styles.sourceRed : styles.sourceBlue}`}>
                        {asesor.rol}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${asesor.estado === 1 ? styles.statusNew : styles.sourceGray}`}>
                        {asesor.estado === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Fecha Registro */}
                    <td className={`${styles.td} ${styles.thHideMedium} ${styles.tdMuted}`}>
                      {asesor.fecha_creacion ? new Date(asesor.fecha_creacion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Sin fecha'}
                    </td>

                    {/* Acciones */}
                    <td className={`${styles.td} ${styles.thRight}`}>
                      {/* Usamos e.stopPropagation() para que el click en el botón no dispare el click de la fila */}
                      <button
                        className={styles.moreBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MdMoreVert size="1.5em" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación básica */}
          <div className={styles.pagination}>
            <p className={styles.paginationInfo}>
              Mostrando <strong>{dataAsesores.length}</strong> asesores
            </p>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn} disabled><MdChevronLeft size="1.5em" /></button>
              <button className={styles.pageBtn} disabled><MdChevronRight size="1.5em" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AsesoresParteAdmin;