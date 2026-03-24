import { useState, useEffect } from 'react';
import styles from './parteAsesor.module.css';
import Aside from '../../templates/aside';
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";
import {
  MdMoreVert, MdSearch, MdFilterList, MdChevronLeft,
  MdChevronRight,
  MdGroup,
  MdBadge,
  MdGroups,
  MdBarChart,
  MdHub,
  MdPhone,
  MdChat,
  MdPersonAdd
} from "react-icons/md";
import ModalLead from './modalAgregarLead';

const tabs = ['Todos los Leads', 'Pendientes', 'Contactados', 'Perdidos'];

const metrics = [
  { label: 'Total Leads', value: '1,284', badge: '+8.2%', progress: 70 },
  { label: 'Tasa de Conversión', value: '12.5%', badge: '+2.1%', progress: 45 },
  { label: 'Leads Hoy', value: '+42', badge: '+15%', progress: 90 },
];

const ParteAsesor = () => {

  // Modal agregar lead
  const [isModalOpen, setIsModalOpen] = useState(false);


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
        const response = await axios.get(`https://api.ramosgrupo.lat/api/getleads/${idUsuario}/`);

        setDataLeads(response.data);

      } catch (error) {
        console.log(error);
      }
    };

    obtenerLeads();
  }, []);

  // Para obtener total leads hoy de un asesor

  const [totalLeadsHoy, setTotalLeadsHoy] = useState(0);

  useEffect(() => {
    const totalLeadsHoyF = async () => {
      const idUsuario = sessionStorage.getItem("id_usuario");

      // Validación de seguridad
      if (!idUsuario) return;

      try {
        const response = await axios.get(`https://api.ramosgrupo.lat/api/totalleadsgeneralAsesor/${idUsuario}/`);
        console.log(response.data);
        // Si tu API devuelve un número directo:
        setTotalLeadsHoy(response.data.total);

        // SI TU API DEVUELVE UN OBJETO (ej: { total: 5 }), usa:
        // setTotalLeadsHoy(response.data.total);

      } catch (error) {
        console.error("Error al obtener leads de hoy:", error);
      }
    };

    // LLAMADA CORRECTA A LA FUNCIÓN ASÍNCRONA
    totalLeadsHoyF();
  }, []);


  // Para obtener total leads vendidos de un asesor

  const [totalLeadsVendidos, setTotalLeadsVendidos] = useState(0);

  useEffect(() => {
    const totalLeadsVendidosF = async () => {
      const idUsuario = sessionStorage.getItem("id_usuario");

      // Validación de seguridad
      if (!idUsuario) return;

      try {
        const response = await axios.get(`https://api.ramosgrupo.lat/api/totalleadsVendidosAsesor/${idUsuario}/`);
        console.log("Total leads vendidos:", response.data);
        // Si tu API devuelve un número directo:
        setTotalLeadsVendidos(response.data.total_vendidos);

        // SI TU API DEVUELVE UN OBJETO (ej: { total: 5 }), usa:
        // setTotalLeadsVendidos(response.data.total);

      } catch (error) {
        console.error("Error al obtener leads vendidos:", error);
      }
    };

    // LLAMADA CORRECTA A LA FUNCIÓN ASÍNCRONA
    totalLeadsVendidosF();
  }, []);


  // Obtener estados

  const [dataEstados, setDataEstados] = useState([]);

  useEffect(() => {
    const obtenerEstados = async () => {
      try {
        const response = await axios.get(`https://api.ramosgrupo.lat/api/getestados/`);
        console.log(response.data)
        setDataEstados(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerEstados();
  }, []);

  // Obtener sub-estados
  const [dataSubEstados, setDataSubEstados] = useState([]);
  // Estados para el modal de venta
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [idLeadSeleccionado, setIdLeadSeleccionado] = useState(null);
  const [datosVenta, setDatosVenta] = useState({
    monto: "",
    descripcion: "Venta realizada desde el CRM"
  });


  const clickEstado = async (id_estado, id_lead) => {
    const nuevoEstadoId = Number(id_estado);
    if (nuevoEstadoId === 4) {
      setIdLeadSeleccionado(id_lead); // Guardamos qué lead se está vendiendo
      setIsVentaModalOpen(true);      // Abrimos el modal
      return; // Detenemos aquí para que no actualice el estado sin el monto
    }

    try {

      await axios.patch(
        `https://api.ramosgrupo.lat/api/updateleadestado/${id_lead}/`,
        {
          id_estado: Number(id_estado)
        }
      );

      const estadoSeleccionado = dataEstados.find(
        (e) => e.id_estado === Number(id_estado)
      );

      setDataLeads(prev =>
        prev.map(lead =>
          lead.id_lead === id_lead
            ? {
              ...lead,
              id_estado: {
                id_estado: Number(id_estado),
                nombre: estadoSeleccionado?.nombre
              }
            }
            : lead
        )
      );

      const response = await axios.get(
        `https://api.ramosgrupo.lat/api/getsubestados/${id_estado}/`
      );

      setDataSubEstados(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  // Estado de venta
  const confirmarVenta = async () => {
    try {
      // 1. Guardar la venta en tu nuevo endpoint
      await axios.post(`https://api.ramosgrupo.lat/api/saveventas/${idLeadSeleccionado}/`, {
        monto: Number(datosVenta.monto),
        descripcion_venta: datosVenta.descripcion
      });


      // 3. Limpiar y cerrar
      setIsVentaModalOpen(false);
      setDatosVenta({ monto: "", descripcion: "Venta realizada desde el CRM" });
      alert("Venta registrada con éxito");

      // Aquí podrías recargar los leads para ver el cambio
    } catch (error) {
      console.error("Error al registrar venta:", error);
      alert("Hubo un error al procesar la venta.");
    }
  };

  //Cambiar sub estado
  const [comentario, setComentario] = useState("");

  const cambiarComentario = (id_lead, nuevoValor) => {
    setDataLeads(prev =>
      prev.map(lead =>
        lead.id_lead === id_lead
          ? { ...lead, comentario_temporal: nuevoValor }
          : lead
      )
    );
  }

  const clickSubEstado = async (id_subestado, id_lead) => {
    const leadActual = dataLeads.find(l => l.id_lead === id_lead);
    const comentarioAEnviar = leadActual?.comentario_temporal || "";
    try {

      await axios.patch(
        `https://api.ramosgrupo.lat/api/updateleadsubestado/${id_lead}/`,
        {
          id_subestado: Number(id_subestado),
          comentario: comentarioAEnviar
        }
      );

      const subestadoSeleccionado = dataSubEstados.find(
        (s) => s.id_subestado === Number(id_subestado)
      );

      setDataLeads(prev =>
        prev.map(lead =>
          lead.id_lead === id_lead
            ? {
              ...lead,
              id_subestado: {
                id_subestado: Number(id_subestado),
                nombre: subestadoSeleccionado?.nombre
              }
            }
            : lead
        )
      );

    } catch (error) {
      console.log(error);
    }
  };

  // Get Tipo iteraciones
  const [dataTipoIteraciones, setDataTipoIteraciones] = useState([]);

  useEffect(() => {
    const obtenerTipoIteraciones = async () => {
      try {
        const response = await axios.get(`https://api.ramosgrupo.lat/api/gettipointeraccion/`);
        console.log(response.data)
        setDataTipoIteraciones(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    obtenerTipoIteraciones();
  }, []);


  // Enviar tipo iteracion
// Enviar tipo iteracion
  const enviarTipoIteracion = async (tipo, id_lead) => {
    const idUsuario = sessionStorage.getItem("id_usuario");

    // 1. Si NO es llamada (ej. WhatsApp), enviamos directamente
    if (tipo !== 2) {
      try {
        await axios.post("https://api.ramosgrupo.lat/api/saveiteracion/", {
          id_lead: id_lead,
          id_usuario: idUsuario,
          id_tipo_interaccion: tipo,
          duracion_segundos: null,
          fecha: new Date().toISOString()
        });
      } catch (error) {
        console.log(error);
      }
      return;
    }

    // 2. Si ES llamada (tipo === 2)
    // Usamos setTimeout para que el navegador primero procese el 'href tel:' 
    // y luego ejecute el prompt de los segundos.
    setTimeout(async () => {
      const duracion = prompt("¿Cuántos segundos duró la llamada?");
      
      // Solo guardamos si el usuario no canceló el prompt
      if (duracion !== null) {
        try {
          await axios.post("https://api.ramosgrupo.lat/api/saveiteracion/", {
            id_lead: id_lead,
            id_usuario: idUsuario,
            id_tipo_interaccion: 2,
            duracion_segundos: duracion,
            fecha: new Date().toISOString()
          });
        } catch (error) {
          console.log("Error al guardar iteración de llamada:", error);
        }
      }
    }, 1000); // 1000ms (1 segundo) de espera para asegurar que el celular reaccione
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
            <p className={styles.metricValue}>{dataLeads.length}</p>
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
              {dataLeads.length > 0
                ? ((totalLeadsVendidos / dataLeads.length) * 100).toFixed(1)
                : 0}%
            </p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${dataLeads.length > 0 ? (totalLeadsVendidos / dataLeads.length) * 100 : 0}%`
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
        >
          <MdPersonAdd className={styles.icon} />
          <span>Agregar Lead</span>
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
                  <th className={styles.th}>Estado</th>
                  <th className={styles.th}>Observaciones </th>
                  <th className={styles.th}>Sub-estado </th>
                  <th className={styles.th}>Acciones</th>
                  <th className={styles.th}>Fecha asignada</th>

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



                      {/* Estado y Sub-estado */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`${styles.badge} ${styles.statusNew}`}>
                            {lead.id_estado?.nombre}
                          </span>

                          <select
                            className={styles.selectTable}
                            value={lead.id_estado?.id_estado || ""}
                            onChange={(e) => clickEstado(e.target.value, lead.id_lead)}
                          >
                            <option value="">Seleccione</option>
                            {dataEstados.map((estado) => (
                              <option key={estado.id_estado} value={estado.id_estado}>
                                {estado.nombre}
                              </option>
                            ))}
                          </select>

                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <input
                            type="text"
                            className={styles.inputTable}
                            // Si no existe comentario_temporal, mostramos vacío
                            value={lead.comentario_temporal || ""}
                            onChange={(e) => cambiarComentario(lead.id_lead, e.target.value)}
                          // placeholder="Escribir observación..."
                          />
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`${styles.badge} ${styles.statusNew}`}>
                            {lead.id_subestado?.nombre}
                          </span>

                          <select
                            className={styles.selectTable}
                            value={lead.id_subestado?.id_subestado || ""}
                            onChange={(e) => clickSubEstado(e.target.value, lead.id_lead)}
                          >
                            <option value="">Seleccione</option>
                            {dataSubEstados.map((sub) => (
                              <option key={sub.id_subestado} value={sub.id_subestado}>
                                {sub.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>



                      {/* Asignado (Selector) */}

                      <td className={styles.td}>
                        <div className={styles.actionsContact}>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/51${lead.telefono}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnWhatsapp}
                            onClick={() => enviarTipoIteracion(1, lead.id_lead)}
                          >
                            <FaWhatsapp size={18} />
                          </a>

                          {/* Llamada */}
                          <a
                            href={`tel:${lead.telefono}`}
                            className={styles.btnCall}
                            title="Llamar"
                            onClick={() => enviarTipoIteracion(2, lead.id_lead)}
                          >
                            <MdPhone size={18} />
                          </a>

                        </div>
                      </td>

                      {/* Fecha formateada */}
                      <td className={`${styles.td}  ${styles.tdMuted}`}>
                        {new Date(lead.fecha_asignacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* EL COMPONENTE MODAL AL FINAL DEL RENDER */}
          {/* ... dentro de ParteAsesor.js ... */}

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

export default ParteAsesor;
