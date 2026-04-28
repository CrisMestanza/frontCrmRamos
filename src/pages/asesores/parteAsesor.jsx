import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MdPersonAdd,
  MdEvent,
  MdHistory,
  MdTrendingUp,
  MdAlarm,
  MdCancel,
  MdClose
} from "react-icons/md";
import ModalLead from './modalAgregarLead';

const tabs = ['Todos los Leads', 'Pendientes', 'Contactados', 'Perdidos'];

const metrics = [
  { label: 'Total Leads', value: '1,284', badge: '+8.2%', progress: 70 },
  { label: 'Tasa de Conversión', value: '12.5%', badge: '+2.1%', progress: 45 },
  { label: 'Leads Hoy', value: '+42', badge: '+15%', progress: 90 },
];

const LEADS_REFRESH_MS = 30000;
const CALL_REMINDERS_REFRESH_MS = 15000;

const ParteAsesor = () => {
  const navigate = useNavigate();
  // Nuevo estado para controlar el modal de duración de llamada
  const [showCallModal, setShowCallModal] = useState(false);
  const [callLeadId, setCallLeadId] = useState(null);
  const [callDurationMinutos, setCallDurationMinutos] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleLead, setScheduleLead] = useState(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [reminderAvisos, setReminderAvisos] = useState([]);
  const [cancelLead, setCancelLead] = useState(null);
  const [cancelSaving, setCancelSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());
  // Modal agregar lead
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleLeadAdded = () => {
    // Aquí llamas a tu función obtenerLeads() para refrescar la tabla
    console.log("Nuevo lead agregado, refrescando tabla...");
  };

  // Para obtener los leads

  const [dataLeads, setDataLeads] = useState([]);

  const obtenerLeads = async () => {
    const idUsuario = sessionStorage.getItem("id_usuario");
    try {
      const response = await axios.get(`https://api.ramosgrupo.lat/api/getleads/${idUsuario}/`);

      setDataLeads(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerLeads();
    const intervalId = window.setInterval(obtenerLeads, LEADS_REFRESH_MS);

    const refrescarAlVolver = () => obtenerLeads();
    window.addEventListener("focus", refrescarAlVolver);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refrescarAlVolver);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const revisarRecordatorios = async () => {
      const idUsuario = sessionStorage.getItem("id_usuario");
      if (!idUsuario) return;

      try {
        const response = await axios.get(`https://api.ramosgrupo.lat/api/recordatoriosllamadas/${idUsuario}/`);
        const avisos = response.data?.avisos || [];

        if (avisos.length > 0) {
          setReminderAvisos(avisos);
          obtenerLeads();
        }
      } catch (error) {
        console.error("Error al revisar recordatorios:", error);
      }
    };

    revisarRecordatorios();
    const intervalId = window.setInterval(revisarRecordatorios, CALL_REMINDERS_REFRESH_MS);
    return () => window.clearInterval(intervalId);
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

  const enviarTipoIteracion = async (tipo, id_lead) => {
    const idUsuario = sessionStorage.getItem("id_usuario");

    if (tipo === 1) { // WhatsApp
      try {
        await axios.post("https://api.ramosgrupo.lat/api/saveiteracion/", {
          id_lead: id_lead,
          id_usuario: idUsuario,
          id_tipo_interaccion: 1,
          duracion_segundos: null,
          duracion_minutos: null,
          fecha: new Date().toISOString()
        });
      } catch (error) { console.log(error); }
    }

    if (tipo === 2) { // Llamada
      // 1. Guardamos el ID para saber a quién estamos llamando
      setCallLeadId(id_lead);
      // 2. Abrimos nuestro modal de React (que sobrevive al cambio de app)
      setShowCallModal(true);
      // 3. El navegador lanzará la app de teléfono automáticamente por el href del <a>
    }
  };

 const finalizarRegistroLlamada = async () => {
  const idUsuario = sessionStorage.getItem("id_usuario");
  try {
    await axios.post("https://api.ramosgrupo.lat/api/saveiteracion/", {
      id_lead: callLeadId,
      id_usuario: idUsuario,
      id_tipo_interaccion: 2,
      // Convertimos a número o enviamos 0 si está vacío
      duracion_segundos: Number(callDuration) || 0,
      duracion_minutos: Number(callDurationMinutos) || 0,
      fecha: new Date().toISOString()
    });

    setShowCallModal(false);
    setCallDuration("");
    setCallDurationMinutos("");
    setCallLeadId(null);
    alert("Llamada registrada con éxito");
  } catch (error) {
    console.error("Error al guardar la interacción:", error);
    alert("No se pudo guardar el registro.");
  }
}
  const formatearFechaLlamada = (fecha) => {
    if (!fecha) return "Sin llamada programada";
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const convertirADatetimeLocal = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const abrirProgramarLlamada = (lead) => {
    setScheduleLead(lead);
    setScheduleDateTime(convertirADatetimeLocal(lead.fecha_llamada));
    setShowScheduleModal(true);
  };

  const getCallStatus = (fecha) => {
    if (!fecha) return "sin_llamada";
    const fechaLlamada = new Date(fecha);
    return fechaLlamada.getTime() < now.getTime() ? "vencida" : "pendiente";
  };

  const getCallStatusLabel = (fecha) => {
    const estado = getCallStatus(fecha);
    if (estado === "vencida") return "Hora vencida";
    return "Pendiente";
  };

  const getMinutesToCall = (fecha) => {
    if (!fecha) return null;
    return Math.ceil((new Date(fecha).getTime() - now.getTime()) / 60000);
  };

  const llamadasAgendadas = useMemo(() => {
    return dataLeads
      .filter((lead) => Boolean(lead.fecha_llamada))
      .sort((a, b) => new Date(a.fecha_llamada) - new Date(b.fecha_llamada));
  }, [dataLeads]);

  const llamadasPendientes = useMemo(() => {
    return llamadasAgendadas.filter((lead) => new Date(lead.fecha_llamada).getTime() >= now.getTime());
  }, [llamadasAgendadas, now]);

  const llamadasVencidas = useMemo(() => {
    return llamadasAgendadas.filter((lead) => new Date(lead.fecha_llamada).getTime() < now.getTime());
  }, [llamadasAgendadas, now]);

  const getAsesorNombre = (lead) => lead?.id_asesor?.nombre || sessionStorage.getItem("nombre") || "Asesor";

  const cancelarProgramacionLlamada = async () => {
    if (!cancelLead) return;

    setCancelSaving(true);
    try {
      const response = await axios.patch(
        `https://api.ramosgrupo.lat/api/programarllamada/${cancelLead.id_lead}/`,
        { fecha_llamada: null }
      );
      const leadActualizado = response.data?.lead || response.data;
      setDataLeads(prev =>
        prev.map(lead =>
          lead.id_lead === cancelLead.id_lead
            ? { ...lead, ...leadActualizado, fecha_llamada: null, recordatorio_proximo_enviado: 0 }
            : lead
        )
      );
      setCancelLead(null);
      obtenerLeads();
    } catch (error) {
      console.error("Error al cancelar llamada:", error);
      alert("No se pudo cancelar la llamada.");
    } finally {
      setCancelSaving(false);
    }
  };

  const guardarProgramacionLlamada = async () => {
    if (!scheduleLead) return;

    setScheduleSaving(true);
    try {
      const fechaIso = scheduleDateTime ? new Date(scheduleDateTime).toISOString() : null;
      const response = await axios.patch(
        `https://api.ramosgrupo.lat/api/programarllamada/${scheduleLead.id_lead}/`,
        { fecha_llamada: fechaIso }
      );

      const leadActualizado = response.data?.lead || response.data;
      setDataLeads(prev =>
        prev.map(lead =>
          lead.id_lead === scheduleLead.id_lead
            ? { ...lead, ...leadActualizado }
            : lead
        )
      );
      setShowScheduleModal(false);
      setScheduleLead(null);
      setScheduleDateTime("");
      obtenerLeads();
      const minutosAntes = response.data?.aviso_whatsapp_minutos_antes || 5;
      alert(`Llamada programada. El WhatsApp al asesor se enviara ${minutosAntes} minutos antes.`);
    } catch (error) {
      console.error("Error al programar llamada:", error);
      alert("No se pudo programar la llamada.");
    } finally {
      setScheduleSaving(false);
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

        <section className={styles.callsSection}>
          <div className={styles.callsHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Agenda de llamadas</p>
              <h3 className={styles.sectionTitle}>Seguimiento telefonico</h3>
            </div>
            <div className={styles.callsStats}>
              <div className={styles.callStat}>
                <span>{llamadasAgendadas.length}</span>
                <p>Agendadas</p>
              </div>
              <div className={styles.callStat}>
                <span>{llamadasPendientes.length}</span>
                <p>Pendientes</p>
              </div>
              <div className={`${styles.callStat} ${llamadasVencidas.length > 0 ? styles.callStatDanger : ""}`}>
                <span>{llamadasVencidas.length}</span>
                <p>Vencidas</p>
              </div>
            </div>
          </div>

          <div className={styles.callsPanelGrid}>
            <div className={styles.callsPanel}>
              <div className={styles.panelTitleRow}>
                <MdAlarm />
                <h4>Llamadas pendientes</h4>
              </div>
              <div className={styles.callList}>
                {llamadasPendientes.length === 0 ? (
                  <div className={styles.emptyCalls}>No hay llamadas pendientes.</div>
                ) : (
                  llamadasPendientes.map((lead) => {
                    const minutos = getMinutesToCall(lead.fecha_llamada);
                    return (
                      <div key={`pendiente-${lead.id_lead}`} className={styles.callItem}>
                        <div className={styles.callItemMain}>
                          <div className={styles.callIcon}><MdPhone /></div>
                          <div>
                            <p className={styles.callLeadName}>{lead.nombre}</p>
                            <p className={styles.callMeta}>
                              {formatearFechaLlamada(lead.fecha_llamada)} - {getAsesorNombre(lead)}
                            </p>
                            <p className={styles.callMeta}>Cliente: {lead.telefono || "Sin telefono"}</p>
                          </div>
                        </div>
                        <div className={styles.callActions}>
                          <span className={`${styles.callStatus} ${minutos <= 5 ? styles.callStatusSoon : ""}`}>
                            {minutos <= 0 ? "Ahora" : `Faltan ${minutos} min`}
                          </span>
                          <a className={styles.actionBtn} href={`tel:${lead.telefono}`} title="Llamar">
                            <MdPhone size="1.1rem" />
                          </a>
                          <button className={styles.actionBtn} type="button" title="Reprogramar" onClick={() => abrirProgramarLlamada(lead)}>
                            <MdEvent size="1.1rem" />
                          </button>
                          <button className={styles.cancelIconBtn} type="button" title="Cancelar llamada" onClick={() => setCancelLead(lead)}>
                            <MdCancel size="1.1rem" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={styles.callsPanel}>
              <div className={styles.panelTitleRow}>
                <MdHistory />
                <h4>Agendadas y vencidas</h4>
              </div>
              <div className={styles.callList}>
                {llamadasAgendadas.length === 0 ? (
                  <div className={styles.emptyCalls}>Todavia no hay llamadas agendadas.</div>
                ) : (
                  llamadasAgendadas.map((lead) => {
                    const estado = getCallStatus(lead.fecha_llamada);
                    return (
                      <div key={`agendada-${lead.id_lead}`} className={`${styles.callItem} ${estado === "vencida" ? styles.callItemExpired : ""}`}>
                        <div className={styles.callItemMain}>
                          <div className={styles.callIcon}><MdEvent /></div>
                          <div>
                            <p className={styles.callLeadName}>{lead.nombre}</p>
                            <p className={styles.callMeta}>
                              {formatearFechaLlamada(lead.fecha_llamada)} - {getAsesorNombre(lead)}
                            </p>
                          </div>
                        </div>
                        <div className={styles.callActions}>
                          <span className={`${styles.callStatus} ${estado === "vencida" ? styles.callStatusExpired : ""}`}>
                            {getCallStatusLabel(lead.fecha_llamada)}
                          </span>
                          <button className={styles.actionBtn} type="button" title="Reprogramar" onClick={() => abrirProgramarLlamada(lead)}>
                            <MdEvent size="1.1rem" />
                          </button>
                          <button className={styles.cancelIconBtn} type="button" title="Cancelar llamada" onClick={() => setCancelLead(lead)}>
                            <MdCancel size="1.1rem" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

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
                  <th className={styles.th}>Proxima llamada</th>
                  <th className={styles.th}>Historial</th>
                  <th className={styles.th}>Rendimiento</th>
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
                            href={`https://wa.me/${lead.telefono}`}
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

                          <button
                            type="button"
                            className={styles.btnCall}
                            title="Programar llamada"
                            onClick={() => abrirProgramarLlamada(lead)}
                          >
                            <MdEvent size={18} />
                          </button>

                        </div>
                      </td>

                      <td className={`${styles.td} ${styles.tdMuted}`}>
                        {formatearFechaLlamada(lead.fecha_llamada)}
                      </td>

                      <td className={styles.td}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => navigate(`/admin/lead-historial/${lead.id_lead}`)}
                          title="Ver historial de estados"
                        >
                          <MdHistory size="1.2rem" />
                        </button>
                      </td>

                      <td className={styles.td}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => navigate(`/admin/asesor-interacciones/${lead.id_asesor?.id_usuario}/${lead.id_lead}`)}
                          title="Ver rendimiento del lead"
                        >
                          <MdTrendingUp size="1.2rem" />
                        </button>
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


      {showCallModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>📞 Llamada en curso...</h3>
            <p>Cuando termines la llamada, ingresa la duración:</p>

            <div className={styles.formGroup}>
              <label>Duración (Minutos)</label>
              <input
                type="number"
                className={styles.inputTable}
                value={callDurationMinutos}
                onChange={(e) => setCallDurationMinutos(e.target.value)}
                placeholder="Ej: 20"
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>Duración (segundos)</label>
              <input
                type="number"
                className={styles.inputTable}
                value={callDuration}
                onChange={(e) => setCallDuration(e.target.value)}
                placeholder="Ej: 5"
                autoFocus
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowCallModal(false)}
              >
                Cancelar
              </button>
        
              <button
                className={styles.btnPrimary}
                onClick={finalizarRegistroLlamada}
                // Se habilita si hay minutos O segundos
                disabled={!callDuration && !callDurationMinutos}
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {reminderAvisos.length > 0 && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.reminderModal}`}>
            <div className={styles.modalTopRow}>
              <div>
                <h3>Llamadas por atender</h3>
                <p>Estas llamadas estan dentro de la ventana de aviso.</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setReminderAvisos([])}
                title="Cerrar"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className={styles.reminderList}>
              {reminderAvisos.map((aviso) => {
                const leadAviso = dataLeads.find((lead) => lead.id_lead === aviso.id_lead);
                return (
                  <div key={aviso.id_lead} className={styles.reminderItem}>
                    <div className={styles.callIcon}><MdAlarm /></div>
                    <div className={styles.reminderBody}>
                      <p className={styles.callLeadName}>{aviso.nombre}</p>
                      <p className={styles.callMeta}>{formatearFechaLlamada(aviso.fecha_llamada)}</p>
                      {leadAviso?.telefono && <p className={styles.callMeta}>Cliente: {leadAviso.telefono}</p>}
                      {!aviso.aviso_whatsapp_enviado && aviso.aviso_whatsapp_error && (
                        <p className={styles.callError}>WhatsApp no enviado: {aviso.aviso_whatsapp_error}</p>
                      )}
                    </div>
                    {leadAviso?.telefono && (
                      <a className={styles.btnCallWide} href={`tel:${leadAviso.telefono}`}>
                        <MdPhone />
                        Llamar
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnPrimary} type="button" onClick={() => setReminderAvisos([])}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelLead && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalTopRow}>
              <div>
                <h3>Cancelar llamada</h3>
                <p>La llamada saldra de pendientes y ya no se enviara el recordatorio.</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setCancelLead(null)}
                title="Cerrar"
                disabled={cancelSaving}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className={styles.cancelSummary}>
              <p className={styles.callLeadName}>{cancelLead.nombre}</p>
              <p className={styles.callMeta}>{formatearFechaLlamada(cancelLead.fecha_llamada)}</p>
              <p className={styles.callMeta}>Asesor: {getAsesorNombre(cancelLead)}</p>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setCancelLead(null)}
                disabled={cancelSaving}
              >
                Volver
              </button>
              <button
                className={styles.btnDanger}
                onClick={cancelarProgramacionLlamada}
                disabled={cancelSaving}
              >
                {cancelSaving ? "Cancelando..." : "Cancelar llamada"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Programar llamada</h3>
            <p>{scheduleLead?.nombre}</p>

            <div className={styles.formGroup}>
              <label>Dia y hora de contacto</label>
              <input
                type="datetime-local"
                className={styles.inputTable}
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowScheduleModal(false)}
                disabled={scheduleSaving}
              >
                Cancelar
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => setScheduleDateTime("")}
                disabled={scheduleSaving}
              >
                Limpiar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={guardarProgramacionLlamada}
                disabled={scheduleSaving}
              >
                {scheduleSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParteAsesor;
