import React, { useState, useEffect } from 'react';
import axios from "axios";
import styles from "../inicioAdmin/leads.module.css";

// Componentes internos
import Aside from '../../templates/aside';
import ModalLead from '../inicioAdmin/modalAgregarLead';
import AsignarAsesorModal from '../inicioAdmin/modalAsignar';

// Iconos
import { MdSearch, MdFilterList, MdPersonAdd, MdMoreVert, MdChevronLeft, MdChevronRight, MdMenu } from "react-icons/md";

const LeadsPageMain = () => {
  // 1. ESTADOS GLOBALES DE LA PÁGINA
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLeads, setDataLeads] = useState([]);
  const [dataAsesores, setDataAsesores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para asignación
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpenAsignar, setIsModalOpenAsignar] = useState(false);
  const [tempAsesorId, setTempAsesorId] = useState("");

  // 2. CARGA DE DATOS (useEffect)
  const obtenerLeads = async () => {
    const idUsuario = sessionStorage.getItem("id_usuario");
    try {
      const res = await axios.get(`https://api.ramosgrupo.lat/api/getleads/${idUsuario}/`);
      setDataLeads(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    obtenerLeads();
    // Cargar asesores también...
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* CAPA 1: EL ASIDE (Menú Lateral) */}
      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* CAPA 2: EL CONTENIDO PRINCIPAL (Leads) */}
      <main className={styles.main}>
        
        {/* Header para Móvil (Solo visible en pantallas pequeñas) */}
        <div className={styles.mobileHeader}>
          <button onClick={() => setSidebarOpen(true)} className={styles.menuBtn}>
            <MdMenu size="2em" />
          </button>
          <span className={styles.mobileTitle}>NexusCRM</span>
        </div>

        {/* Encabezado de la página */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTextGroup}> 
            <h2 className={styles.pageTitle}>Gestión de Proyectos</h2>
            <p className={styles.pageSubtitle}>Control del Proyectos</p>
    
            {/* El botón ahora vive aquí, debajo del subtítulo */}
            <button className={styles.btnPrimaryUnderText} onClick={() => setIsModalOpen(true)}>
            <MdPersonAdd /> Agregar Proyecto
            </button>
            </div>
  
            {/* Si tenías otros iconos de búsqueda o filtro, se quedan aquí a la derecha */}
            <div className={styles.headerActions}>
                {/* Iconos de búsqueda/filtro si los necesitas */}
            </div>
        </header>

        {/* Sección de la Tabla */}
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>nombre</th>
                </tr>
              </thead>
              <tbody>
                {dataLeads.map((lead) => (
                  <tr key={lead.id_lead} className={styles.tableRow}>
                    <td className={styles.td}>{lead.nombre}</td>
                    <td className={styles.td}>
                      <span className={styles.badge}>{lead.id_estado?.nombre}</span>
                    </td>
                    <td className={styles.td}>
                      {/* Select de asesores que ya tienes */}
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      <MdMoreVert size="1.5em" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODALES */}
      <ModalLead 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLeadAdded={obtenerLeads} 
      />
    </div>
  );
};

export default LeadsPageMain;
