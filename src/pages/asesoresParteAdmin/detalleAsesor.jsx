import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdEmail, MdPhone, MdBadge, MdPerson, MdTrendingUp, MdHistory } from "react-icons/md";
import axios from 'axios';
import Aside from '../../templates/aside';
import styles from './asesoresParteAdmin.module.css';
import * as XLSX from 'xlsx';

const DetalleAsesor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para datos
  const [asesor, setAsesor] = useState(null);
  const [leadsAsesor, setLeadsAsesor] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para la pestaña activa (Filtro por id_estado)
  // Por defecto 5 (Estado "Nuevo" según tu imagen)
  const [activeEstado, setActiveEstado] = useState(5);
  const idUsuario = sessionStorage.getItem("id_usuario");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener info del asesor
        const resAsesores = await axios.get(`https://api.ramosgrupo.lat/api/getasesores/`);
        const encontrado = resAsesores.data.find(u => u.id_usuario === parseInt(id));
        setAsesor(encontrado);

        // 2. Obtener Leads del asesor específico usando tu nueva ruta
        const resLeads = await axios.get(`https://api.ramosgrupo.lat/api/getleads/${id}/`);
        setLeadsAsesor(resLeads.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Definición de estados según tu captura de pantalla
  const estadosMenu = [
    { id: 5, nombre: 'Nuevo' },
    { id: 1, nombre: 'Frío' },
    { id: 2, nombre: 'Tibio' },
    { id: 3, nombre: 'Caliente' },
    { id: 4, nombre: 'Vendido' },
    { id: 6, nombre: 'Programado' },
  ];

  // Filtrar leads según la pestaña seleccionada
  const leadsFiltrados = leadsAsesor.filter(lead => lead.id_estado?.id_estado === activeEstado);

  const handleDownloadExcel = async () => {
    try {
      // Usamos el 'id' de la URL que es el del asesor que estamos viendo
      const res = await axios.get(`https://api.ramosgrupo.lat/api/getexcel/${id}/`);
      const data = res.data;

      if (data.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      // Creamos el libro de trabajo (Workbook)
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

      // Generamos el archivo y disparamos la descarga
      XLSX.writeFile(workbook, `Reporte_Leads_${asesor.nombre}.xlsx`);

    } catch (error) {
      console.error("Error al descargar Excel:", error);
      alert("Hubo un error al generar el archivo");
    }
  };

  if (loading) return <div className={styles.wrapper}>Cargando...</div>;
  if (!asesor) return <div className={styles.wrapper}>Asesor no encontrado</div>;

  return (
    <div className={styles.wrapper}>
      <Aside />
      <main className={styles.main}>
        {/* BOTÓN VOLVER Y HEADER */}
        <header className={styles.pageHeader}>
          <button onClick={() => navigate(-1)} className={styles.iconBtn}>
            <MdChevronLeft size="1.5em" /> Volver
          </button>
          <div style={{ marginTop: '1rem' }}>
            <h2 className={styles.pageTitle}>{asesor.nombre}</h2>
            <p className={styles.pageSubtitle}>Gestión de cartera del asesor</p>
          </div>
        </header>

        {/* TARJETA DE INFO DEL ASESOR */}
        <div className={styles.tableCard} style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <p><MdEmail color="var(--primary)" /> {asesor.email}</p>
            <p><MdPhone color="var(--primary)" /> {asesor.telefono}</p>
            <p><MdBadge color="var(--primary)" /> Rol: {asesor.rol}</p>
          </div>
        </div>

        <button
          className={styles.btnPrimary}
          onClick={handleDownloadExcel}
        >
          <span>Descargar Excel</span>
        </button>

        {/* SISTEMA DE TABS (ESTADOS) */}
        <div className={styles.tabs}>
          {estadosMenu.map((est) => (
            <button
              key={est.id}
              className={`${styles.tabBtn} ${activeEstado === est.id ? styles.tabBtnActive : styles.tabBtnInactive}`}
              onClick={() => setActiveEstado(est.id)}
            >
              {est.nombre}
              <span style={{ marginLeft: '8px', opacity: 0.5 }}>
                {/* Cambiado l.id_estado a l.id_estado.id_estado */}
                ({leadsAsesor.filter(l => l.id_estado?.id_estado === est.id).length})
              </span>
            </button>
          ))}
        </div>
        {/* TABLA DE LEADS FILTRADOS */}
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.th}>Lead</th>
                  <th className={styles.th}>Proyecto de interés</th>
                  <th className={styles.th}>Teléfono</th>
                  <th className={styles.th}>Sub-Estado</th>
                  <th className={styles.th}>Fecha Registro</th>
                  <th className={styles.th}>Historial de estados</th>
                  <th className={styles.th}>Historial de iteraciones</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.length > 0 ? (
                  leadsFiltrados.map((lead) => (
                    <tr
                      key={lead.id_lead}
                      className={styles.tableRow}

                      style={{ cursor: 'pointer' }}
                    >
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <div className={styles.initials} style={{ background: '#333' }}>
                            <MdPerson size="1.2em" />
                          </div>
                          <p className={styles.leadName}>{lead.nombre}</p>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {lead.id_proyecto_interes?.nombre_proyecto}
                        </p>
                      </td>

                      <td className={styles.td}>{lead.telefono}</td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${styles.statusFollowUp}`}>
                          {/* Accedemos al nombre dentro del objeto id_subestado */}
                          {lead.id_subestado?.nombre || "Sin subestado"}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {new Date(lead.fecha_registro).toLocaleDateString()}
                      </td>
                      <td className={styles.td}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/admin/lead-historial/${lead.id_lead}`)}
                          title="Ver historial de estados"
                        >
                          <MdHistory size="1.2rem" />
                          <span className={styles.btnText}>Historial</span>
                        </button>
                      </td>

                      <td className={styles.td}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => navigate(`/admin/asesor-interacciones/${lead.id_asesor?.id_usuario}/${lead.id_lead}`)}
                          title="Ver historial de estados"
                        >
                          <MdTrendingUp size="1.2rem" />
                          <span className={styles.btnText}>Rendimiento</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No hay leads en este estado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalleAsesor;