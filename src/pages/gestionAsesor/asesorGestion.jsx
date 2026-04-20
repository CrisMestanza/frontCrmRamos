import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiActivity, FiPhoneCall, FiSave, FiSearch, FiTrash2, FiTrendingUp, FiUsers } from 'react-icons/fi';
import styles from '../inicioAdmin/leads.module.css';
import styles2 from './asesorGestion.module.css';
import Aside from '../../templates/aside';

const ASESORES_ENDPOINTS = [
  'https://api.ramosgrupo.lat/api/getasesores',
  'https://api.ramosgrupo.lat/api/getasesores/',
];
const POST_ASESOR_ENDPOINT = 'https://api.ramosgrupo.lat/api/postasesores/';

const AVATAR_COLORS = ['#ff6b35', '#4d8dff', '#2ecc71', '#f5b700', '#8b5cf6', '#14b8a6'];

const obtenerIniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

const obtenerColorAvatar = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const formatearEstado = (estado) => (Number(estado) === 1 ? 'Activo' : 'Inactivo');
const FORMULARIO_ASESOR_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  password: '',
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';

  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) return 'Sin fecha';

  return fechaParseada.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const esDelMesActual = (fecha) => {
  if (!fecha) return false;

  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) return false;

  const hoy = new Date();

  return (
    fechaParseada.getMonth() === hoy.getMonth() &&
    fechaParseada.getFullYear() === hoy.getFullYear()
  );
};

const normalizarAsesores = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((usuario) => usuario.rol === 'ASESOR')
    .map((usuario) => ({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre || 'Sin nombre',
      email: usuario.email || 'Sin correo',
      telefono: usuario.telefono || 'Sin telefono',
      estado: Number(usuario.estado),
      fecha_creacion: usuario.fecha_creacion,
      fechaTexto: formatearFecha(usuario.fecha_creacion),
    }));

const obtenerMensajeError = (error, fallback = 'No se pudo completar la operacion.') => {
  const detalle = error?.response?.data;

  if (typeof detalle === 'string' && detalle.trim()) return detalle;

  if (detalle && typeof detalle === 'object') {
    const mensajes = Object.values(detalle)
      .flatMap((valor) => (Array.isArray(valor) ? valor : [valor]))
      .filter(Boolean);

    if (mensajes.length > 0) return mensajes.join(' ');
  }

  return fallback;
};

const obtenerAsesoresDesdeApi = async () => {
  let ultimoError = null;

  for (const endpoint of ASESORES_ENDPOINTS) {
    try {
      const response = await axios.get(endpoint);
      return normalizarAsesores(response.data);
    } catch (fetchError) {
      ultimoError = fetchError;
    }
  }

  throw ultimoError;
};

const crearAsesorEnApi = async (asesor) => {
  const payload = {
    ...asesor,
    rol: 'ASESOR',
    estado: 1,
  };

  return axios.post(POST_ASESOR_ENDPOINT, payload);
};

// --- NUEVO COMPONENTE: ModalConfirmarEliminar (ACTUALIZADO) ---
const ModalConfirmarEliminar = ({ isOpen, onClose, onConfirm, nombreAsesor, loading }) => {
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
          <button className={styles2.btnCloseX} style={{ color: '#000000' }} onClick={onClose}>&times;</button>
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
const ModalAgregarAsesor = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(FORMULARIO_ASESOR_INICIAL);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleClose = () => {
    if (saving) return;

    setFormData(FORMULARIO_ASESOR_INICIAL);
    setSubmitError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSubmitError('');

    try {
      await onSave({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
      });

      setFormData(FORMULARIO_ASESOR_INICIAL);
      onClose();
    } catch (saveError) {
      setSubmitError(obtenerMensajeError(saveError, 'No se pudo guardar el asesor.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles2.modalOverlay} onClick={handleClose}>
      <div className={styles2.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles2.modalHeader}>
          <div>
            <h2 className={styles2.modalTitle}>Registrar Nuevo Asesor</h2>
            <p className={styles2.modalSubtitle}>Vincula un nuevo miembro a tu equipo de trabajo</p>
          </div>
          <button className={styles2.btnCloseX} onClick={handleClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles2.modalForm}>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej. Juan Perez"
              className={styles2.formInput}
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles2.formRow}>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>CORREO ELECTRONICO *</label>
              <input
                type="text"
                name="email"
                placeholder="usuario@gmail.com"
                className={styles2.formInput}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>TELEFONO</label>
              <input
                type="tel"
                name="telefono"
                placeholder="+51..."
                className={styles2.formInput}
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>CONTRASENA *</label>
            <input
              type="password"
              name="password"
              placeholder="Ingresa una contraseña"
              className={styles2.formInput}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {submitError && <p className={styles2.formError}>{submitError}</p>}
          <div className={styles2.modalFooter}>
            <button type="button" className={styles2.btnCancel} onClick={handleClose} disabled={saving}>Cancelar</button>
            <button type="submit" className={styles2.btnSave} disabled={saving}>
              <FiSave size={16} />
              {saving ? 'Guardando...' : 'Guardar Asesor'}
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
  const [listaAsesores, setListaAsesores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const cargarAsesores = async () => {
      setLoading(true);
      setError('');

      try {
        const asesores = await obtenerAsesoresDesdeApi();
        if (!isMounted) return;
        setListaAsesores(asesores);
      } catch (fetchError) {
        if (!isMounted) return;
        console.error('Error al obtener asesores:', fetchError);
        setListaAsesores([]);
        setError('No se pudieron cargar los asesores desde la API.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarAsesores();

    return () => {
      isMounted = false;
    };
  }, []);

  const openDeleteModal = (asesor) => {
    setAsesorAEliminar(asesor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (asesorAEliminar) {
      setListaAsesores((prevState) =>
        prevState.filter((asesor) => asesor.id_usuario !== asesorAEliminar.id_usuario),
      );
      setIsDeleteModalOpen(false);
      setAsesorAEliminar(null);
    }
  };

  const handleGuardarAsesor = async (nuevoAsesor) => {
    await crearAsesorEnApi(nuevoAsesor);

    const asesoresActualizados = await obtenerAsesoresDesdeApi();
    setListaAsesores(asesoresActualizados);
    setError('');
  };

  const asesoresActivos = listaAsesores.filter((asesor) => asesor.estado === 1).length;
  const asesoresInactivos = listaAsesores.length - asesoresActivos;
  const asesoresConTelefono = listaAsesores.filter((asesor) => asesor.telefono !== 'Sin telefono').length;
  const asesoresNuevosMes = listaAsesores.filter((asesor) => esDelMesActual(asesor.fecha_creacion)).length;
  const porcentajeActivos = listaAsesores.length ? Math.round((asesoresActivos / listaAsesores.length) * 100) : 0;
  const porcentajeContactables = listaAsesores.length ? Math.round((asesoresConTelefono / listaAsesores.length) * 100) : 0;
  const porcentajeNuevos = listaAsesores.length ? Math.round((asesoresNuevosMes / listaAsesores.length) * 100) : 0;

  const asesoresFiltrados = listaAsesores.filter((asesor) => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return true;

    return [asesor.nombre, asesor.email, asesor.telefono]
      .some((valor) => valor.toLowerCase().includes(termino));
  });

  const metricas = [
    {
      label: 'Total Asesores',
      value: listaAsesores.length.toLocaleString('es-PE'),
      unit: 'equipo',
      description: `${asesoresActivos} asesores se encuentran activos en este momento.`,
      highlight: `${porcentajeActivos}% operativos`,
      progress: porcentajeActivos,
      icon: FiUsers,
      tone: 'Orange',
    },
    {
      label: 'Asesores Activos',
      value: asesoresActivos.toLocaleString('es-PE'),
      unit: 'activos',
      description: `${asesoresInactivos} asesores figuran como inactivos en el sistema.`,
      highlight: `${asesoresInactivos} inactivos`,
      progress: porcentajeActivos,
      icon: FiActivity,
      tone: 'Green',
    },
    {
      label: 'Con Telefono',
      value: asesoresConTelefono.toLocaleString('es-PE'),
      unit: 'contactables',
      description: `El ${porcentajeContactables}% del equipo tiene un telefono registrado.`,
      highlight: `${porcentajeContactables}% cobertura`,
      progress: porcentajeContactables,
      icon: FiPhoneCall,
      tone: 'Blue',
    },
    {
      label: 'Nuevos del Mes',
      value: asesoresNuevosMes.toLocaleString('es-PE'),
      unit: 'registros',
      description: 'Ingresos recientes al equipo comercial durante el mes actual.',
      highlight: `${porcentajeNuevos}% del equipo`,
      progress: porcentajeNuevos,
      icon: FiTrendingUp,
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
            <p className={styles2.subtitle}>Administra el equipo, revisa su estado y monitorea la informacion operativa.</p>
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
            <input
              type="text"
              placeholder="Buscar asesor por nombre, correo o telefono..."
              className={styles2.inputSearch}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className={styles2.tableContainer}>
          <table className={styles2.table}>
            <thead>
              <tr>
                <th>ASESOR</th>
                <th>CONTACTO</th>
                <th>TELEFONO</th>
                <th>ESTADO</th>
                <th>FECHA REG.</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>Cargando asesores...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>{error}</td>
                </tr>
              )}

              {!loading && !error && asesoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>No se encontraron asesores con esa busqueda.</td>
                </tr>
              )}

              {!loading && !error && asesoresFiltrados.map((asesor) => (
                <tr key={asesor.id_usuario}>
                  <td>
                    <div className={styles2.asesorCell}>
                      <div
                        className={styles2.avatar}
                        style={{ backgroundColor: obtenerColorAvatar(asesor.id_usuario) }}
                      >
                        {obtenerIniciales(asesor.nombre)}
                      </div>
                      <span>{asesor.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles2.contactCell}>
                      <span>{asesor.email}</span>
                      <small>ID #{asesor.id_usuario}</small>
                    </div>
                  </td>
                  <td className={asesor.telefono === 'Sin telefono' ? styles2.textGray : ''}>
                    {asesor.telefono}
                  </td>
                  <td>
                    <span className={asesor.estado === 1 ? styles2.statusActive : styles2.statusInactive}>
                      {formatearEstado(asesor.estado)}
                    </span>
                  </td>
                  <td className={styles2.textGray}>{asesor.fechaTexto}</td>
                  <td>
                    <button className={styles2.btnDelete} onClick={() => openDeleteModal(asesor)}>
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <ModalAgregarAsesor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleGuardarAsesor}
      />

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
