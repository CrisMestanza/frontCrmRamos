import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAlarm, MdChevronLeft, MdEvent, MdPerson, MdPhone } from "react-icons/md";
import axios from 'axios';
import Aside from '../../templates/aside';
import styles from './historial.module.css';

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const HistorialLlamadasAsesor = () => {
  const { idAsesor, idLead } = useParams();
  const navigate = useNavigate();
  const [asesor, setAsesor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAsesores, resLeads] = await Promise.all([
          axios.get('https://api.ramosgrupo.lat/api/getasesores/'),
          axios.get(`https://api.ramosgrupo.lat/api/getleads/${idAsesor}/`)
        ]);

        setAsesor(resAsesores.data.find((usuario) => usuario.id_usuario === Number(idAsesor)));
        setLeads(resLeads.data || []);
      } catch (error) {
        console.error('Error cargando llamadas programadas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idAsesor]);

  const llamadas = useMemo(() => {
    return leads
      .filter((lead) => !idLead || String(lead.id_lead) === String(idLead))
      .filter((lead) => Boolean(lead.fecha_llamada))
      .sort((a, b) => new Date(b.fecha_llamada) - new Date(a.fecha_llamada));
  }, [leads, idLead]);

  const leadSeleccionado = leads.find((lead) => String(lead.id_lead) === String(idLead));
  const pendientes = llamadas.filter((lead) => new Date(lead.fecha_llamada) >= now).length;
  const vencidas = llamadas.filter((lead) => new Date(lead.fecha_llamada) < now).length;
  const nombreAsesor = asesor?.nombre || leadSeleccionado?.id_asesor?.nombre || 'Asesor';

  if (loading) return <div className={styles.wrapper}>Cargando llamadas programadas...</div>;

  return (
    <div className={styles.wrapper}>
      <Aside />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <button onClick={() => navigate(-1)} className={styles.iconBtn}>
            <MdChevronLeft size="1.4em" /> Volver
          </button>
          <h2 className={styles.pageTitle}>Llamadas programadas</h2>
          <p className={styles.pageSubtitle}>
            {idLead
              ? `${nombreAsesor} con ${leadSeleccionado?.nombre || 'este lead'}`
              : `${nombreAsesor} con todos sus leads`}
          </p>
        </header>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Total programadas</p>
            <p className={styles.metricValue}>{llamadas.length}</p>
          </div>
          <div className={styles.metricCard} style={{ borderBottomColor: '#3b82f6' }}>
            <p className={styles.metricLabel}>Pendientes</p>
            <p className={styles.metricValue}>{pendientes}</p>
          </div>
          <div className={styles.metricCard} style={{ borderBottomColor: '#ef4444' }}>
            <p className={styles.metricLabel}>Vencidas</p>
            <p className={styles.metricValue}>{vencidas}</p>
          </div>
        </div>

        <div className={styles.timelineCard}>
          {llamadas.length > 0 ? (
            llamadas.map((lead) => {
              const vencida = new Date(lead.fecha_llamada) < now;
              return (
                <div
                  key={`${lead.id_lead}-${lead.fecha_llamada}`}
                  className={styles.timelineItem}
                  style={{ borderLeftColor: vencida ? '#ef4444' : '#3b82f6' }}
                >
                  <div className={styles.dot} style={{ backgroundColor: vencida ? '#ef4444' : '#3b82f6' }} />
                  <div className={styles.historyHeader}>
                    <div>
                      <span className={styles.badge}>
                        {vencida ? 'Vencida' : 'Pendiente'}
                      </span>
                      <p style={{ margin: '10px 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdEvent color={vencida ? '#ef4444' : '#3b82f6'} />
                        {formatearFecha(lead.fecha_llamada)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>Lead #{lead.id_lead}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem' }}>{lead.id_estado?.nombre || 'Sin estado'}</p>
                    </div>
                  </div>

                  <div className={styles.commentBox}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdPerson /> {lead.nombre}
                    </p>
                    <p style={{ margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdPhone /> {lead.telefono || 'Sin telefono'}
                    </p>
                    <p style={{ margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdAlarm /> Proyecto: {lead.id_proyecto_interes?.nombre_proyecto || 'Sin proyecto'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              {idLead
                ? 'Este lead no tiene llamadas programadas registradas.'
                : 'Este asesor no tiene llamadas programadas registradas.'}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistorialLlamadasAsesor;
