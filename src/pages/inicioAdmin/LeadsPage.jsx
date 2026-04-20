import { useState, useEffect } from 'react';
import styles from './leads.module.css';
import Aside from '../../templates/aside';
import axios from "axios";
import AsignarAsesorModal from './modalAsignar'; // Importa el nuevo archivo
import ModalLead from './modalAgregarLead';
import ModalAgregarNumero from './modalAgregarNumero';

import {
  MdMoreVert, MdSearch, MdFilterList, MdChevronLeft,
  MdChevronRight,
  MdGroup,
  MdBadge,
  MdGroups,
  MdBarChart,
  MdHub,
  MdPersonAdd
} from "react-icons/md";

const leads = [
  {
    initials: 'JP',
    name: 'Juan Pérez',
    source: 'Facebook Ads',
    sourceStyle: 'sourceBlue',
    status: 'Nuevo',
    statusStyle: 'statusNew',
    assigned: 'Carlos Ruiz',
    date: '12 Oct 2023',
  },
  {
    initials: 'MG',
    name: 'María García',
    source: 'Google Search',
    sourceStyle: 'sourceRed',
    status: 'En Seguimiento',
    statusStyle: 'statusFollowUp',
    assigned: 'Ana Belén',
    date: '11 Oct 2023',
  },
  {
    initials: 'RS',
    name: 'Roberto Soul',
    source: 'Referido Directo',
    sourceStyle: 'sourceGray',
    status: 'Cerrado',
    statusStyle: 'statusClosed',
    assigned: 'Carlos Ruiz',
    date: '10 Oct 2023',
  },
  {
    initials: 'LF',
    name: 'Lucía Fernández',
    source: 'LinkedIn',
    sourceStyle: 'sourceLinkedIn',
    status: 'Sin Contactar',
    statusStyle: 'statusUncontacted',
    assigned: 'Ana Belén',
    date: '10 Oct 2023',
  },
];

const tabs = ['Todos los Leads', 'Pendientes', 'Contactados', 'Perdidos'];

const metrics = [
  { label: 'Total Leads', value: '1,284', badge: '+8.2%', progress: 70 },
  { label: 'Tasa de Conversión', value: '12.5%', badge: '+2.1%', progress: 45 },
  { label: 'Leads Hoy', value: '+42', badge: '+15%', progress: 90 },
];


const LeadsPage = () => {
  
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  // Obtener datos de los asesores
  const [dataAsesores, setDataAsesores] = useState([]);
  useEffect(() => {
    const obtenerAsesores = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/getasesores/"
        );
        console.log(response.data)
        setDataAsesores(response.data);

      } catch (error) {
        console.log(error);
      }
    };

    obtenerAsesores();
  }, []);

  const handleLeadAdded = () => {
    // Aquí llamas a tu función obtenerLeads() para refrescar la tabla
    console.log("Nuevo lead agregado, refrescando tabla...");
  };
  // Para obtener los leads

  const [dataLeads, setDataLeads] = useState([]);

  useEffect(() => {
    const obtenerLeads = async () => {
      const idUsuario = sessionStorage.getItem("id_usuario");
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/getleads/${idUsuario}/`);
        console.log(response.data)
        setDataLeads(response.data);

      } catch (error) {
        console.log(error);
      }
    };

    obtenerLeads();
  }, []);
  /// Para la tasa de conversión
  const [totalVendidos, setTotalVendidos] = useState(0);

  useEffect(() => {
    const obtenerTotalVendidos = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/totalleadsVendidos/");
        // IMPORTANTE: Usamos .total_vendidos porque así lo envía tu backend
        setTotalVendidos(response.data.total_vendidos || 0);
      } catch (error) {
        console.error("Error al obtener total vendidos:", error);
      }
    };
    obtenerTotalVendidos();
  }, []);

  const [totalLeadsGenerales, setTotalLeadsGenerales] = useState(0);

  useEffect(() => {
    const obtenerTotalLeadsGenerales = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/totalleadsgeneral/");
        // IMPORTANTE: Usamos .total_vendidos porque así lo envía tu backend
        setTotalLeadsGenerales(response.data.total || 0);
      } catch (error) {
        console.error("Error al obtener total vendidos:", error);
      }
    };
    obtenerTotalLeadsGenerales();
  }, []);

  // Total de leads 
  const [totalLeads, setTotalLeads] = useState(0);
  useEffect(() => {
    const totalLeads = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/totalleads/"
        );

        setTotalLeads(response.data.total);

      } catch (error) {
        console.log(error);
      }
    };

    totalLeads();
  }, []);

  // Total de leads hoy
  const [totalLeadsHoy, setTotalLeadsHoy] = useState(0);
  useEffect(() => {
    const totalLeadsHoy = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/totalleadshoy/"
        );

        setTotalLeadsHoy(response.data.total);

      } catch (error) {
        console.log(error);
      }
    };

    totalLeadsHoy();
  }, []);


  // Designar asesor
  const [tempAsesorId, setTempAsesorId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNumeroModalOpen, setIsNumeroModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null)
  
  const [isModalOpenAsignar, setIsModalOpenAsignar] = useState(false);


  const handleSelectChange = (lead, id_usuario) => {
    setSelectedLead(lead);      // Guardamos el lead actual
    setTempAsesorId(id_usuario); // Guardamos el ID del asesor seleccionado en el select
    setIsModalOpenAsignar(true);       // Abrimos el modal
  };
  const cambiarAsesor = async (lead, id_usuario) => {
    try {
      const idFinal = id_usuario === "" ? null : id_usuario;
      await axios.patch(`http://127.0.0.1:8000/api/updatelead/${lead.id_lead}/`, {
        id_asesor: idFinal
      });

      setIsModalOpenAsignar(false); // Cerramos el modal
      alert(`Asesor asignado correctamente`);

      // Aquí podrías volver a llamar a obtenerLeads() para refrescar la tabla
    } catch (error) {
      console.error("Error al asignar", error);
    }
  };


  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}


      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main */}
      <main className={styles.main}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className={styles.mobileTitle}>NexusCRM</span>
          <div className={styles.mobileHeaderRight} />
        </div>

        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Gestión de Leads</h2>
            <p className={styles.pageSubtitle}>
              Supervisa y organiza tus prospectos comerciales en tiempo real.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn}>
              <MdSearch size="1.5em" className="icon-style" />
            </button>
            <button className={styles.iconBtn}>
              <MdFilterList size="1.5em" className="icon-style" />
            </button>
          </div>
        </header>

        {/* Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Total Leads</p>
              <span className={styles.metricBadge}>Global</span>
            </div>
            <p className={styles.metricValue}>{totalLeads}</p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: '100%' }} // O calcula (totalLeads / meta) * 100
              />
            </div>
          </div>
          {/* Tarjeta 2: Tasa de Conversión Dinámica */}
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Tasa de Conversión</p>
              <span className={styles.metricBadge}>Eficiencia</span>
            </div>
            <p className={styles.metricValue}>
              {totalLeadsGenerales > 0
                ? ((totalVendidos / totalLeadsGenerales) * 100).toFixed(1)
                : "0"}%
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${totalLeadsGenerales > 0 ? (totalVendidos / totalLeadsGenerales) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Tarjeta 3: Leads Hoy (Estática o podrías crear otro estado) */}
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <p className={styles.metricLabel}>Leads Hoy</p>
              <span className={styles.metricBadge}>Nuevo</span>
            </div>
            <p className={styles.metricValue}>{totalLeadsHoy}</p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: '10%' }}
              />
            </div>
          </div>

        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setIsModalOpen(true)}
          style={{ marginRight: '12px' }}
        >
          <MdPersonAdd className={styles.icon} />
          <span>Agregar Lead</span>
        </button>

        <button
          className={styles.btnPrimary}
          onClick={() => setIsNumeroModalOpen(true)}
        >
          <MdPersonAdd className={styles.icon} />
          <span>Agregar Número</span>
        </button>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === i ? styles.tabBtnActive : styles.tabBtnInactive}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.th}>Nombre</th>
                  <th className={styles.th}>Fuente</th>
                  <th className={styles.th}>Proyecto</th>
                  <th className={styles.th}>Observaciones</th>
                  <th className={styles.th}>Estado / Sub-estado</th>
                  <th className={`${styles.th}`}>Asignado</th>
                  <th className={`${styles.th} ${styles.thHideMedium}`}>Fecha</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dataLeads.map((lead) => {
                  // Lógica de colores dinámica
                  const fuenteNombre = lead.id_origen?.nombre || "";
                  const fuenteClass = fuenteNombre.includes("Facebook")
                    ? styles.sourceBlue
                    : fuenteNombre.includes("Google")
                      ? styles.sourceRed
                      : styles.sourceGray;

                  return (
                    <tr key={lead.id_lead} className={styles.tableRow}>
                      {/* Nombre */}
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <div className={styles.initials}>
                            {lead.nombre?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className={styles.leadName}>{lead.nombre}</p>
                            <p style={{ fontSize: '11px', opacity: 0.7 }}>{lead.telefono}</p>
                          </div>
                        </div>
                      </td>

                      {/* Fuente con color dinámico */}
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${fuenteClass}`}>
                          {fuenteNombre}
                        </span>
                      </td>

                      {/* Proyecto */}
                      <td className={styles.td}>
                        <p className={styles.tdMuted} style={{ fontSize: '13px' }}>
                          {lead.id_proyecto_interes?.nombre_proyecto}
                        </p>
                      </td>
                      <td className={styles.td}>
                        <p className={styles.tdMuted} style={{ fontSize: '13px' }}>
                          {lead.observacion}
                        </p>
                      </td>

                      {/* Estado y Sub-estado */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`${styles.badge} ${styles.statusNew}`}>
                            {lead.id_estado?.nombre}
                          </span>

                        </div>
                      </td>

                      {/* Asignado (Selector) */}
                      <td className={`${styles.td}`}>
                        <select
                          className={styles.select}
                          value={lead.id_asesor?.id_usuario || ""}
                          onChange={(e) => handleSelectChange(lead, e.target.value)} // <--- Cambio aquí
                        >
                          <option value="">Seleccionar asesor</option>
                          {dataAsesores.map((asesor) => (
                            <option key={asesor.id_usuario} value={asesor.id_usuario}>
                              {asesor.nombre}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Fecha formateada */}
                      <td className={`${styles.td} ${styles.tdHideMedium} ${styles.tdMuted}`}>
                        {new Date(lead.fecha_registro).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>

                      {/* Acciones */}
                      <td className={`${styles.td} ${styles.tdRight}`}>
                        <button className={styles.moreBtn}>
                          <MdMoreVert size="1.5em" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* EL COMPONENTE MODAL AL FINAL DEL RENDER */}
          {/* ... dentro de LeadsPage.js ... */}
          {selectedLead && (
            <AsignarAsesorModal
             isOpen={isModalOpenAsignar}
             onClose={() => setIsModalOpenAsignar(false)}
              lead={selectedLead}
              asesores={dataAsesores}
              tempAsesorId={tempAsesorId} // <--- AÑADE ESTA LÍNEA
              onConfirm={cambiarAsesor}
            />
          )}
          {/* Pagination */}
          <div className={styles.pagination}>
            <p className={styles.paginationInfo}>
              Mostrando <strong>1 - 4</strong> de <strong>1,284</strong>
            </p>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn} disabled>
                <span className="material-symbols-outlined"><MdChevronLeft size="1.5em" className="tu-clase-css" /></span>
              </button>
              <button className={styles.pageBtn}>
                <span className="material-symbols-outlined"><MdChevronRight size="1.5em" className="tu-clase-css" /></span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <ModalLead
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
      <ModalAgregarNumero
        isOpen={isNumeroModalOpen}
        onClose={() => setIsNumeroModalOpen(false)}
      />
      {/*  Modal de ventas */}

      {isVentaModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Registrar Venta</h3>
            <p>Ingresa los detalles finales de la transacción:</p>

            <div className={styles.formGroup}>
              <label>Precio de Venta (S/.)</label>
              <input
                type="number"
                className={styles.inputTable}
                value={datosVenta.monto}
                onChange={(e) => setDatosVenta({ ...datosVenta, monto: e.target.value })}
                placeholder="Ej: 150000"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descripción / Notas</label>
              <textarea
                className={styles.inputTable}
                style={{ minHeight: '80px', paddingTop: '10px' }}
                value={datosVenta.descripcion}
                onChange={(e) => setDatosVenta({ ...datosVenta, descripcion: e.target.value })}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setIsVentaModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={confirmarVenta}
                disabled={!datosVenta.monto}
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
