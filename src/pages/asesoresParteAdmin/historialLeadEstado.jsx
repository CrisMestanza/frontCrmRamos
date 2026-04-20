import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdHistory, MdEvent, MdComment, MdPerson, MdCalendarMonth } from "react-icons/md";
import axios from 'axios';
import Aside from '../../templates/aside';
import styles from './historial.module.css';

const HistorialLead = () => {
    const { idLead } = useParams();
    const navigate = useNavigate();
    const [historial, setHistorial] = useState([]);
    const [filteredHistorial, setFilteredHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros de fecha
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/gethistorialestadolead/${idLead}/`);
                setHistorial(res.data);
                setFilteredHistorial(res.data);
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, [idLead]);

    // Lógica de filtrado en tiempo real
    useEffect(() => {
        let filtered = historial;
        if (startDate) {
            filtered = filtered.filter(h => new Date(h.fecha) >= new Date(startDate));
        }
        if (endDate) {
            // Se suma un día o se ajusta a las 23:59 para incluir el día final
            filtered = filtered.filter(h => new Date(h.fecha) <= new Date(endDate + 'T23:59:59'));
        }
        setFilteredHistorial(filtered);
    }, [startDate, endDate, historial]);

    if (loading) return <div className={styles.wrapper}>Cargando historial Nexus...</div>;

    const leadInfo = historial[0]?.id_lead;

    return (
        <div className={styles.wrapper}>
            <Aside />
            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <button onClick={() => navigate(-1)} className={styles.iconBtn}>
                        <MdChevronLeft size="1.4em" /> Volver
                    </button>
                    <h2 className={styles.pageTitle}>
                        <MdHistory style={{ color: 'var(--primary)', marginRight: '10px' }} />
                        Historial de {leadInfo?.nombre || 'Lead'}
                    </h2>
                    <p className={styles.pageSubtitle}>Visualizando {filteredHistorial.length} movimientos en la línea de tiempo.</p>
                </header>

                {/* MÉTRICAS RÁPIDAS */}
                <div className={styles.metricsGrid}>
                    <div className={styles.metricCard}>
                        <p className={styles.metricLabel}>Total Gestiones</p>
                        <p className={styles.metricValue}>{filteredHistorial.length}</p>
                    </div>
                    <div className={styles.metricCard}>
                        <p className={styles.metricLabel}>Última Actividad</p>
                        <p className={styles.metricValue} style={{ fontSize: '1.2rem' }}>
                            {filteredHistorial.length > 0 
                                ? new Date(filteredHistorial[0].fecha).toLocaleDateString() 
                                : 'Sin registros'}
                        </p>
                    </div>
                    <div className={styles.metricCard}>
                        <p className={styles.metricLabel}>Asesor Actual</p>
                        <p className={styles.metricValue} style={{ fontSize: '1.2rem' }}>
                            {filteredHistorial[0]?.id_usuario?.nombre || 'No asignado'}
                        </p>
                    </div>
                </div>

                {/* BARRA DE FILTROS */}
                <div className={styles.filterCard}>
                    <div className={styles.filterGroup}>
                        <label><MdCalendarMonth /> Desde</label>
                        <input 
                            type="date" 
                            className={styles.inputDate}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Hasta</label>
                        <input 
                            type="date" 
                            className={styles.inputDate}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button 
                        className={styles.iconBtn} 
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                    >
                        Resetear Filtros
                    </button>
                </div>

                {/* TIMELINE */}
                <div className={styles.timelineCard}>
                    {filteredHistorial.length > 0 ? (
                        [...filteredHistorial].reverse().map((item) => (
                            <div key={item.id_historial} className={styles.timelineItem}>
                                <div className={styles.dot} />
                                <div className={styles.historyHeader}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className={styles.badge}>{item.id_estado?.nombre}</span>
                                            <span className={styles.badge} style={{ borderColor: '#475569', color: '#94a3b8', background: 'transparent' }}>
                                                {item.id_subestado?.nombre}
                                            </span>
                                        </div>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <MdPerson size="1.1em" /> {item.id_usuario?.nombre}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>
                                            {new Date(item.fecha).toLocaleDateString()}
                                        </span>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {item.comentario && (
                                    <div className={styles.commentBox}>
                                        <MdComment style={{ color: 'var(--primary)', marginRight: '8px' }} />
                                        {item.comentario}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            No hay registros para mostrar con los filtros aplicados.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HistorialLead;