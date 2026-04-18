import { useState } from 'react';
import { FiActivity, FiSave, FiSearch, FiTarget, FiTrash2, FiTrendingUp, FiUsers } from 'react-icons/fi';
import styles from '../inicioAdmin/leads.module.css';
import styles2 from './asesorGestion.module.css';
import Aside from '../../templates/aside';

// --- NUEVO COMPONENTE: ModalConfirmarEliminar (ACTUALIZADO) ---
const ModalConfirmarEliminar = ({ isOpen, onClose, onConfirm, nombreAsesor }) => {
  if (!isOpen) return null;

  return (
    <div className={styles2.modalOverlay} onClick={onClose}>
      <div
        className={styles2.modalContent}
        style={{ maxWidth: '450px', backgroundColor: '#111', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles2.modalHeader} style={{ backgroundColor: '#ff6b35', padding: '20px' }}>
          <div>
            <h2 className={styles2.modalTitle} style={{ color: '#ffffff' }}>Confirmar Eliminacion</h2>
            <p className={styles2.modalSubtitle} style={{ color: '#333' }}>Esta accion no se puede deshacer</p>
          </div>
          <button className={styles2.btnCloseX} style={{ color: '#000' }} onClick={onClose}>&times;</button>
        </div>

        <div className={styles2.modalBody} style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Estas seguro que deseas eliminar este asesor?<br />
            <span style={{ fontWeight: 'bold', display: 'block', marginTop: '10px' }}>{nombreAsesor}</span>
          </p>
        </div>

        <div
          className={styles2.modalFooter}
          style={{
            justifyContent: 'center',
            gap: '30px',
            borderTop: '1px solid #222',
            padding: '20px',
            backgroundColor: 'transparent',
          }}
        >
          <button
            type="button"
            className={styles2.btnCancel}
            style={{ backgroundColor: '#2a2a2e', border: '1px solid #444', width: '140px' }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles2.btnCancel}
            style={{ backgroundColor: '#2a2a2e', border: '1px solid #444', width: '140px', color: '#fff' }}
            onClick={onConfirm}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE: ModalAgregarAsesor (Se mantiene intacto) ---
const ModalAgregarAsesor = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className={styles2.modalOverlay} onClick={onClose}>
      <div className={styles2.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles2.modalHeader}>
          <div>
            <h2 className={styles2.modalTitle}>Registrar Nuevo Asesor</h2>
            <p className={styles2.modalSubtitle}>Vincula un nuevo miembro a tu equipo de trabajo</p>
          </div>
          <button className={styles2.btnCloseX} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles2.modalForm}>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>Nombre Completo *</label>
            <input type="text" placeholder="Ej. Juan Perez" className={styles2.formInput} required />
          </div>
          <div className={styles2.formRow}>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>CORREO ELECTRONICO *</label>
              <input type="email" placeholder="usuario@gmail.com" className={styles2.formInput} required />
            </div>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>TELEFONO</label>
              <input type="tel" placeholder="+51..." className={styles2.formInput} />
            </div>
          </div>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>ESPECIALIDAD *</label>
            <select className={styles2.formSelect} required defaultValue="">
              <option value="" disabled>Seleccionar especialidad</option>
              <option value="ventas">Ventas</option>
              <option value="postventa">Postventa</option>
              <option value="soporte">Soporte</option>
            </select>
          </div>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>OBSERVACIONES O NOTAS ADICIONALES</label>
            <textarea placeholder="Detalles sobre el perfil del asesor..." className={styles2.formTextarea}></textarea>
          </div>
          <div className={styles2.modalFooter}>
            <button type="button" className={styles2.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles2.btnSave}>
              <FiSave size={16} />
              Guardar Asesor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: GestionAsesores ---
const GestionAsesores = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [asesorAEliminar, setAsesorAEliminar] = useState(null);

  const [listaAsesores, setListaAsesores] = useState([
    { id: 'V', nombre: 'Verito', email: 'verito@nexus.com', tel: '123456789', esp: 'Ventas', meta: 50, asig: 25, cumpl: 50, estado: 'Activo', fecha: '2024-01-15' },
    { id: 'C', nombre: 'Carlos Martinez', email: 'carlos@nexus.com', tel: '987654321', esp: 'Postventa', meta: 40, asig: 15, cumpl: 37.5, estado: 'Activo', fecha: '2024-02-01' },
    { id: 'M', nombre: 'Maria Gonzalez', email: 'maria@nexus.com', tel: '555123456', esp: 'Soporte', meta: 35, asig: 30, cumpl: 85.7, estado: 'Inactivo', fecha: '2024-01-20' },
  ]);

  const openDeleteModal = (asesor) => {
    setAsesorAEliminar(asesor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (asesorAEliminar) {
      setListaAsesores(listaAsesores.filter((as) => as.id !== asesorAEliminar.id));
      setIsDeleteModalOpen(false);
      setAsesorAEliminar(null);
    }
  };

  const asesoresActivos = listaAsesores.filter((asesor) => asesor.estado === 'Activo').length;
  const asesoresEnPausa = listaAsesores.length - asesoresActivos;
  const metaTotal = listaAsesores.reduce((total, asesor) => total + asesor.meta, 0);
  const promedioMeta = listaAsesores.length ? Math.round(metaTotal / listaAsesores.length) : 0;
  const totalLeadsAsignados = listaAsesores.reduce((total, asesor) => total + asesor.asig, 0);
  const promedioCumplimiento = listaAsesores.length
    ? Math.round(listaAsesores.reduce((total, asesor) => total + asesor.cumpl, 0) / listaAsesores.length)
    : 0;
  const porcentajeActivos = listaAsesores.length ? Math.round((asesoresActivos / listaAsesores.length) * 100) : 0;
  const coberturaLeads = metaTotal ? Math.min(Math.round((totalLeadsAsignados / metaTotal) * 100), 100) : 0;

  const metricas = [
    {
      label: 'Total Asesores',
      value: listaAsesores.length.toLocaleString('es-PE'),
      unit: 'equipo',
      description: `${asesoresActivos} asesores activos impulsan la operacion comercial.`,
      highlight: `${porcentajeActivos}% activos`,
      progress: porcentajeActivos,
      icon: FiUsers,
      tone: 'Orange',
    },
    {
      label: 'Asesores Activos',
      value: asesoresActivos.toLocaleString('es-PE'),
      unit: 'online',
      description: `${asesoresEnPausa} asesores estan en pausa o pendientes de reactivacion.`,
      highlight: `${asesoresEnPausa} en pausa`,
      progress: porcentajeActivos,
      icon: FiActivity,
      tone: 'Green',
    },
    {
      label: 'Promedio Meta',
      value: promedioMeta.toLocaleString('es-PE'),
      unit: 'leads/mes',
      description: `El equipo mantiene un cumplimiento promedio de ${promedioCumplimiento}% sobre su meta.`,
      highlight: `${promedioCumplimiento}% cumplimiento`,
      progress: Math.min(promedioCumplimiento, 100),
      icon: FiTrendingUp,
      tone: 'Blue',
    },
    {
      label: 'Total Leads',
      value: totalLeadsAsignados.toLocaleString('es-PE'),
      unit: 'asignados',
      description: `La cobertura actual alcanza ${coberturaLeads}% frente a la meta global del equipo.`,
      highlight: `${coberturaLeads}% cobertura`,
      progress: coberturaLeads,
      icon: FiTarget,
      tone: 'Gold',
    },
  ];

  return (
    <div className={styles.wrapper}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={styles.main}>
        <div className={styles2.headerSection}>
          <div>
            <h1 className={styles2.title}>Gestion de Asesores</h1>
            <p className={styles2.subtitle}>Administra el equipo, asigna metas y monitorea su rendimiento en tiempo real.</p>
          </div>
        </div>

        <div className={styles2.metricsGrid}>
          {metricas.map((metrica) => {
            const Icon = metrica.icon;

            return (
              <article
                key={metrica.label}
                className={`${styles2.cardMetric} ${styles2[`metricTone${metrica.tone}`]}`}
              >
                <div className={styles2.metricTop}>
                  <div className={styles2.metricIdentity}>
                    <div className={styles2.iconBox}>
                      <Icon className={styles2.metricIcon} />
                    </div>
                    <div>
                      <p className={styles2.metricLabel}>{metrica.label}</p>
                      <span className={styles2.metricTag}>{metrica.highlight}</span>
                    </div>
                  </div>
                </div>

                <div className={styles2.metricValueRow}>
                  <h3 className={styles2.metricValue}>{metrica.value}</h3>
                  <span className={styles2.metricUnit}>{metrica.unit}</span>
                </div>

                <p className={styles2.metricDescription}>{metrica.description}</p>

                <div className={styles2.metricFooter}>
                  <div className={styles2.metricProgressTrack}>
                    <div
                      className={styles2.metricProgressFill}
                      style={{ width: `${metrica.progress}%` }}
                    ></div>
                  </div>
                  <span className={styles2.metricProgressValue}>{metrica.progress}%</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles2.filterBar}>
          <button className={styles2.btnAgregar} onClick={() => setIsModalOpen(true)}>+ Agregar Asesor</button>
          <div className={styles2.searchContainer}>
            <FiSearch size={18} color="#7b7b7b" />
            <input type="text" placeholder="Buscar asesor por nombre o email..." className={styles2.inputSearch} />
          </div>
        </div>

        <div className={styles2.tableContainer}>
          <table className={styles2.table}>
            <thead>
              <tr>
                <th>ASESOR</th>
                <th>CONTACTO</th>
                <th>ESPECIALIDAD</th>
                <th>META MENSUAL</th>
                <th>LEADS ASIGNADOS</th>
                <th>CUMPLIMIENTO</th>
                <th>ESTADO</th>
                <th>FECHA REG.</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {listaAsesores.map((as) => (
                <tr key={as.id}>
                  <td>
                    <div className={styles2.asesorCell}>
                      <div className={`${styles2.avatar} ${styles2[`avatar${as.id}`]}`}>{as.id}</div>
                      <span>{as.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles2.contactCell}>
                      <span>{as.email}</span>
                      <small>{as.tel}</small>
                    </div>
                  </td>
                  <td><span className={`${styles2.badge} ${styles2[as.esp.toLowerCase()]}`}>{as.esp}</span></td>
                  <td>{as.meta}</td>
                  <td>{as.asig}</td>
                  <td>
                    <div className={styles2.progressWrapper}>
                      <div className={styles2.progressBar}>
                        <div
                          className={styles2.progressFill}
                          style={{ width: `${as.cumpl}%`, backgroundColor: as.cumpl > 60 ? '#2ecc71' : '#ff6b35' }}
                        ></div>
                      </div>
                      <span className={styles2.progressText}>{as.cumpl}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={as.estado === 'Activo' ? styles2.statusActive : styles2.statusInactive}>
                      {as.estado}
                    </span>
                  </td>
                  <td className={styles2.textGray}>{as.fecha}</td>
                  <td>
                    <button className={styles2.btnDelete} onClick={() => openDeleteModal(as)}>
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <ModalAgregarAsesor isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ModalConfirmarEliminar
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        nombreAsesor={asesorAEliminar?.nombre}
      />
    </div>
  );
};

export default GestionAsesores;
