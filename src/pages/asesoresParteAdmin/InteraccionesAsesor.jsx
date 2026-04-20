import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdChevronLeft, MdMessage, MdCall, MdHistory, MdFilterList, MdTrendingUp, MdTimer } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import axios from 'axios';
import Aside from '../../templates/aside';
import styles from './historial.module.css'; // Reutilizamos tu base de estilos dark

const InteraccionesAsesor = () => {
    const { idAsesor } = useParams();
    const { idLead } = useParams();
    const navigate = useNavigate();
    const [interacciones, setInteracciones] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [tipoFiltro, setTipoFiltro] = useState('todos');

    useEffect(() => {
        const fetchInteracciones = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/getiteraciones/${idAsesor}/${idLead}/`);
                setInteracciones(res.data);
                setFiltered(res.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInteracciones();
    }, [idAsesor]);

    useEffect(() => {
        if (tipoFiltro === 'todos') {
            setFiltered(interacciones);
        } else {
            setFiltered(interacciones.filter(i => i.id_tipo_interaccion.nombre.toLowerCase().includes(tipoFiltro)));
        }
    }, [tipoFiltro, interacciones]);

    // Estadísticas rápidas
    // Estadísticas rápidas con suma de min y seg
    const stats = {
        total: filtered.length,
        llamadas: filtered.filter(i => i.id_tipo_interaccion.nombre.toLowerCase().includes('lamada')).length,
        whatsapp: filtered.filter(i => i.id_tipo_interaccion.nombre.toLowerCase().includes('whatsaap')).length,

        // Cálculo de tiempo total
        get tiempoFormateado() {
            const totalSegundosRaw = filtered.reduce((acc, curr) => acc + (Number(curr.duracion_segundos) || 0), 0);
            const totalMinutosRaw = filtered.reduce((acc, curr) => acc + (Number(curr.duracion_minutos) || 0), 0);

            // Convertimos los segundos a minutos sobrantes
            const minutosExtra = Math.floor(totalSegundosRaw / 60);
            const segundosFinales = totalSegundosRaw % 60;
            const minutosFinales = totalMinutosRaw + minutosExtra;

            return `${minutosFinales} min ${segundosFinales} seg`;
        }
    };

    if (loading) return <div className={styles.wrapper}>Cargando Nexus CRM...</div>;

    const nombreAsesor = interacciones[0]?.id_usuario?.nombre || "Asesor";

    return (
        <div className={styles.wrapper}>
            <Aside />
            <main className={styles.main}>
                <header className={styles.pageHeader}>
                    <button onClick={() => navigate(-1)} className={styles.iconBtn}>
                        <MdChevronLeft size="1.4em" /> Volver
                    </button>
                    <h2 className={styles.pageTitle}>Actividad de {nombreAsesor}</h2>
                    <p className={styles.pageSubtitle}>Registro detallado de comunicaciones con leads</p>
                </header>

                {/* DASHBOARD DE MÉTRICAS */}
                <div className={styles.metricsGrid}>
                    <div className={styles.metricCard}>
                        <p className={styles.metricLabel}>Total Interacciones</p>
                        <p className={styles.metricValue}>{stats.total}</p>
                    </div>
                    <div className={styles.metricCard} style={{ borderBottomColor: '#25d366' }}>
                        <p className={styles.metricLabel}>WhatsApp / Mensajes</p>
                        <p className={styles.metricValue}>{stats.whatsapp}</p>
                    </div>
                    <div className={styles.metricCard} style={{ borderBottomColor: '#3b82f6' }}>
                        <p className={styles.metricLabel}>Llamadas Realizadas</p>
                        <p className={styles.metricValue}>{stats.llamadas}</p>
                    </div>
                    <div className={styles.metricCard} style={{ borderBottomColor: '#ec5b13' }}>
                        <p className={styles.metricLabel}>Tiempo en Llamada</p>
                        <p className={styles.metricValue} style={{ fontSize: '1.4rem' }}>
                            {stats.tiempoFormateado}
                        </p>
                    </div>
                </div>

                {/* FILTROS RÁPIDOS */}
                <div className={styles.filterCard} style={{ gap: '10px' }}>
                    <button
                        className={tipoFiltro === 'todos' ? styles.iconBtnActive : styles.iconBtn}
                        onClick={() => setTipoFiltro('todos')}
                    >Todos</button>
                    <button
                        className={tipoFiltro === 'lamada' ? styles.iconBtnActive : styles.iconBtn}
                        onClick={() => setTipoFiltro('lamada')}
                    ><MdCall /> Llamadas</button>
                    <button
                        className={tipoFiltro === 'whatsaap' ? styles.iconBtnActive : styles.iconBtn}
                        onClick={() => setTipoFiltro('whatsaap')}
                    ><FaWhatsapp /> WhatsApp</button>
                </div>

                {/* LISTA DE INTERACCIONES */}
                <div className={styles.timelineCard}>
                    {filtered.length > 0 ? (
                        filtered.map((inter) => (
                            <div key={inter.id_interaccion} className={styles.timelineItem} style={{ borderLeftColor: inter.id_tipo_interaccion.nombre.includes('Lamada') ? '#3b82f6' : '#25d366' }}>
                                <div className={styles.dot} style={{ backgroundColor: inter.id_tipo_interaccion.nombre.includes('Lamada') ? '#3b82f6' : '#25d366' }} />
                                <div className={styles.historyHeader}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                                Lead: {inter.id_lead.nombre}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                ID #{inter.id_lead.id_lead}
                                            </span>
                                        </div>
                                        <p style={{ margin: '10px 0', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {inter.id_tipo_interaccion.nombre.includes('Lamada') ? <MdCall color="#3b82f6" /> : <FaWhatsapp color="#25d366" />}
                                            {inter.id_tipo_interaccion.nombre}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(inter.fecha).toLocaleDateString()}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(inter.fecha).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <div className={styles.commentBox} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{inter.nota || "Sin notas adicionales."}</span>

                                    {(inter.duracion_segundos > 0 || inter.duracion_minutos > 0) && (
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MdTimer />
                                            {inter.duracion_minutos > 0 && `${inter.duracion_minutos}m `}
                                            {inter.duracion_segundos > 0 && `${inter.duracion_segundos}s`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay interacciones registradas.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InteraccionesAsesor;