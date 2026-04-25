import { useEffect, useState } from 'react';
import {
  MdAnalytics,
  MdAttachMoney,
  MdFilterList,
  MdHome,
  MdPerson,
  MdSearch,
  MdTrendingUp,
} from 'react-icons/md';
import axios from 'axios';
import Aside from '../../templates/aside';
import styles from '../asesoresParteAdmin/asesoresParteAdmin.module.css';

const VentasPageAdmin = () => {
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, vendidos: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVentas, resTotal, resVendidos] = await Promise.all([
          axios.get('https://api.ramosgrupo.lat/api/getventas/'),
          axios.get('https://api.ramosgrupo.lat/api/totalleadsgeneral/'),
          axios.get('https://api.ramosgrupo.lat/api/totalleadsVendidos/'),
        ]);

        setVentas(resVentas.data);
        setStats({
          totalLeads: resTotal.data.total,
          vendidos: resVendidos.data.total_vendidos,
        });
      } catch (error) {
        console.error('Error cargando datos de ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tasaTransformacion = stats.totalLeads > 0
    ? ((stats.vendidos / stats.totalLeads) * 100).toFixed(1)
    : 0;
  const progresoCierres = stats.totalLeads > 0 ? (stats.vendidos / stats.totalLeads) * 100 : 0;
  const ingresoTotal = ventas.reduce((acc, venta) => acc + Number(venta.precio_venta || 0), 0);

  if (loading) return <div className={styles.wrapper}>Cargando panel de ventas...</div>;

  return (
    <div className={styles.wrapper}>
      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={styles.main}>
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className={styles.mobileTitle}>NexusCRM</span>
          <div className={styles.mobileHeaderRight} />
        </div>

        <header className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Panel de Ventas Realizadas</h2>
            <p className={styles.pageSubtitle}>
              Seguimiento de cierres y rendimiento comercial de GeoHabita.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn}><MdSearch size="1.5em" /></button>
            <button className={styles.iconBtn}><MdFilterList size="1.5em" /></button>
          </div>
        </header>

        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.metricToneGreen}`}>
            <div className={styles.metricTop}>
              <div>
                <p className={styles.metricLabel}>Ingresos Totales</p>
                <span className={styles.metricBadge}>Ventas</span>
              </div>
              <div className={styles.metricIconBox}>
                <MdAttachMoney size="1.25em" />
              </div>
            </div>
            <p className={styles.metricValue}>S/ {ingresoTotal.toLocaleString()}</p>
            <p className={styles.metricDescription}>Monto acumulado por cierres registrados.</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '100%' }} />
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.metricToneBlue}`}>
            <div className={styles.metricTop}>
              <div>
                <p className={styles.metricLabel}>Tasa de Transformacion</p>
                <span className={styles.metricBadge}>Eficiencia</span>
              </div>
              <div className={styles.metricIconBox}>
                <MdAnalytics size="1.25em" />
              </div>
            </div>
            <p className={styles.metricValue}>{tasaTransformacion}%</p>
            <p className={styles.metricDescription}>Leads convertidos a clientes.</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${tasaTransformacion}%` }} />
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.metricToneOrange}`}>
            <div className={styles.metricTop}>
              <div>
                <p className={styles.metricLabel}>Cierres / Total</p>
                <span className={styles.metricBadge}>Pipeline</span>
              </div>
              <div className={styles.metricIconBox}>
                <MdTrendingUp size="1.25em" />
              </div>
            </div>
            <p className={styles.metricValue}>{stats.vendidos} / {stats.totalLeads}</p>
            <p className={styles.metricDescription}>Relacion entre ventas cerradas y leads totales.</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progresoCierres}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.th}>Cliente / Lead</th>
                  <th className={styles.th}>Proyecto</th>
                  <th className={styles.th}>Asesor Responsable</th>
                  <th className={styles.th}>Monto Cierre</th>
                  <th className={`${styles.th} ${styles.thHideMedium}`}>Fecha Venta</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id_venta} className={styles.tableRow}>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <div className={styles.initials} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                          <MdPerson />
                        </div>
                        <div>
                          <p className={styles.leadName}>{venta.id_lead.nombre}</p>
                          <p style={{ fontSize: '11px', opacity: 0.7 }}>{venta.id_lead.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdHome color="var(--primary)" />
                        <div>
                          <p style={{ margin: 0, fontWeight: '500' }}>{venta.id_proyecto.nombre_proyecto}</p>
                          <p style={{ margin: 0, fontSize: '10px', opacity: 0.6 }}>{venta.id_proyecto.ciudad}</p>
                        </div>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.tdMuted}>{venta.id_usuario.nombre}</span>
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                        S/ {Number(venta.precio_venta || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className={`${styles.td} ${styles.thHideMedium} ${styles.tdMuted}`}>
                      {new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VentasPageAdmin;
