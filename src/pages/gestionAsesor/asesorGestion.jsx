import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiCheckCircle,
  FiEdit2,
  FiPieChart,
  FiSave,
  FiSearch,
  FiShield,
  FiTrash2,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import styles from '../inicioAdmin/leads.module.css';
import styles2 from './asesorGestion.module.css';
import Aside from '../../templates/aside';

const API_BASE = 'https://api.ramosgrupo.lat/api';
const FORMULARIO_ASESOR_INICIAL = {
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  rol: 'ASESOR',
};

const AVATAR_COLORS = ['#ff6b35', '#4d8dff', '#2ecc71', '#f5b700', '#8b5cf6', '#14b8a6'];

const normalizarRol = (rol = '') => rol.toString().trim().toUpperCase();
const esAsesorVentas = (rol = '') => ['ASESOR', 'VENTAS', 'ASESOR_VENTAS'].includes(normalizarRol(rol));
const esAdmin = (rol = '') => normalizarRol(rol) === 'ADMIN';

const obtenerIniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

const obtenerColorAvatar = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];

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

const normalizarUsuarios = (data) =>
  (Array.isArray(data) ? data : []).map((usuario) => ({
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre || 'Sin nombre',
    email: usuario.email || 'Sin correo',
    telefono: usuario.telefono || 'Sin telefono',
    rol: normalizarRol(usuario.rol),
    estado: Number(usuario.estado ?? 1),
    fecha_creacion: usuario.fecha_creacion,
    fechaTexto: formatearFecha(usuario.fecha_creacion),
  }));

const obtenerUsuariosDesdeApi = async () => {
  const response = await axios.get(`${API_BASE}/getasesores/`);
  return normalizarUsuarios(response.data);
};

const obtenerMetricasDesdeApi = async () => {
  const [totalLeads, totalVendidos, leadsHoy] = await Promise.all([
    axios.get(`${API_BASE}/totalleadsgeneral/`),
    axios.get(`${API_BASE}/totalleadsVendidos/`),
    axios.get(`${API_BASE}/totalleadshoy/`),
  ]);

  return {
    totalLeads: Number(totalLeads.data?.total ?? 0),
    totalVendidos: Number(totalVendidos.data?.total_vendidos ?? 0),
    leadsHoy: Number(leadsHoy.data?.total ?? 0),
  };
};

const guardarAsesorEnApi = (asesor, idUsuario) => {
  const payload = {
    nombre: asesor.nombre,
    email: asesor.email,
    telefono: asesor.telefono,
    rol: asesor.rol,
    estado: 1,
  };

  if (asesor.password) payload.password = asesor.password;

  if (idUsuario) {
    return axios.patch(`${API_BASE}/updateasesor/${idUsuario}/`, payload);
  }

  return axios.post(`${API_BASE}/postasesores/`, payload);
};

const eliminarAsesorEnApi = (idUsuario) =>
  axios.patch(`${API_BASE}/deleteasesor/${idUsuario}/`);

const ModalResultado = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles2.modalOverlay} onClick={onClose}>
      <div className={styles2.resultModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles2.resultIcon}>
          <FiCheckCircle />
        </div>
        <h2 className={styles2.confirmTitle}>{title}</h2>
        <p className={styles2.confirmText}>{message}</p>
        <button type="button" className={styles2.btnSave} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

const ModalConfirmarEliminar = ({ isOpen, onClose, onConfirm, asesor, loading }) => {
  if (!isOpen) return null;

  return (
    <div className={styles2.modalOverlay} onClick={onClose}>
      <div className={styles2.confirmModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles2.confirmIcon}>
          <FiTrash2 />
        </div>
        <h2 className={styles2.confirmTitle}>Eliminar asesor</h2>
        <p className={styles2.confirmText}>
          El asesor pasara a estado inactivo y no aparecera en la gestion.
        </p>
        <strong className={styles2.confirmName}>{asesor?.nombre}</strong>
        <div className={styles2.confirmActions}>
          <button type="button" className={styles2.btnCancel} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className={styles2.btnDanger} onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalAsesor = ({ isOpen, onClose, onSave, asesorEditar }) => {
  const [formData, setFormData] = useState(FORMULARIO_ASESOR_INICIAL);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (asesorEditar) {
      setFormData({
        nombre: asesorEditar.nombre || '',
        email: asesorEditar.email === 'Sin correo' ? '' : asesorEditar.email || '',
        telefono: asesorEditar.telefono === 'Sin telefono' ? '' : asesorEditar.telefono || '',
        password: '',
        rol: asesorEditar.rol || 'ASESOR',
      });
      return;
    }

    setFormData(FORMULARIO_ASESOR_INICIAL);
  }, [asesorEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleClose = () => {
    if (saving) return;
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
        rol: formData.rol,
      });
      handleClose();
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
            <h2 className={styles2.modalTitle}>
              {asesorEditar ? 'Editar Asesor' : 'Registrar Nuevo Asesor'}
            </h2>
            <p className={styles2.modalSubtitle}>
              Actualiza los datos del equipo comercial y administrativo.
            </p>
          </div>
          <button type="button" className={styles2.btnCloseX} onClick={handleClose}>
            &times;
          </button>
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
              <label className={styles2.formLabel}>Correo Electronico *</label>
              <input
                type="email"
                name="email"
                placeholder="usuario@gmail.com"
                className={styles2.formInput}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>Telefono</label>
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
          <div className={styles2.formRow}>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>Rol</label>
              <select
                name="rol"
                className={styles2.formSelect}
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="ASESOR">Asesor de Ventas</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>
                {asesorEditar ? 'Nueva contrasena' : 'Contrasena *'}
              </label>
              <input
                type="password"
                name="password"
                placeholder={asesorEditar ? 'Dejar vacio para no cambiar' : 'Ingresa una contrasena'}
                className={styles2.formInput}
                value={formData.password}
                onChange={handleChange}
                required={!asesorEditar}
              />
            </div>
          </div>
          {submitError && <p className={styles2.formError}>{submitError}</p>}
          <div className={styles2.modalFooter}>
            <button type="button" className={styles2.btnCancel} onClick={handleClose} disabled={saving}>
              Cancelar
            </button>
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

const GestionAsesores = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asesorEditar, setAsesorEditar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [asesorAEliminar, setAsesorAEliminar] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [metricasApi, setMetricasApi] = useState({ totalLeads: 0, totalVendidos: 0, leadsHoy: 0 });
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      const [usuarios, metricas] = await Promise.all([
        obtenerUsuariosDesdeApi(),
        obtenerMetricasDesdeApi(),
      ]);
      setListaUsuarios(usuarios);
      setMetricasApi(metricas);
    } catch (fetchError) {
      console.error('Error al obtener datos de gestion:', fetchError);
      setListaUsuarios([]);
      setError('No se pudieron cargar los datos desde la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const usuariosActivos = listaUsuarios.filter((usuario) => usuario.estado === 1);
  const admins = usuariosActivos.filter((usuario) => esAdmin(usuario.rol));
  const asesoresVentas = usuariosActivos.filter((usuario) => esAsesorVentas(usuario.rol));
  const tasaConversion = metricasApi.totalLeads
    ? Math.round((metricasApi.totalVendidos / metricasApi.totalLeads) * 100)
    : 0;

  const asesoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const base = usuariosActivos.filter((usuario) => esAsesorVentas(usuario.rol));

    if (!termino) return base;

    return base.filter((asesor) =>
      [asesor.nombre, asesor.email, asesor.telefono, asesor.rol]
        .some((valor) => valor.toLowerCase().includes(termino)),
    );
  }, [busqueda, listaUsuarios]);

  const metricas = [
    {
      label: 'Total Asesores',
      value: usuariosActivos.length.toLocaleString('es-PE'),
      unit: 'usuarios',
      description: 'Usuarios activos disponibles dentro del equipo operativo.',
      highlight: `${usuariosActivos.length} activos`,
      progress: 100,
      icon: FiUsers,
      tone: 'Orange',
    },
    {
      label: 'Admins',
      value: admins.length.toLocaleString('es-PE'),
      unit: 'gestion',
      description: 'Usuarios con permisos administrativos activos.',
      highlight: `${admins.length} admins`,
      progress: usuariosActivos.length ? Math.round((admins.length / usuariosActivos.length) * 100) : 0,
      icon: FiShield,
      tone: 'Blue',
    },
    {
      label: 'Asesores de Ventas',
      value: asesoresVentas.length.toLocaleString('es-PE'),
      unit: 'ventas',
      description: 'Equipo comercial activo para gestion y seguimiento de leads.',
      highlight: `${asesoresVentas.length} comerciales`,
      progress: usuariosActivos.length ? Math.round((asesoresVentas.length / usuariosActivos.length) * 100) : 0,
      icon: FiUserCheck,
      tone: 'Green',
    },
    {
      label: 'Total Leads',
      value: metricasApi.totalLeads.toLocaleString('es-PE'),
      unit: 'leads',
      description: 'Leads registrados en el sistema para medicion general.',
      highlight: 'Base total',
      progress: 100,
      icon: FiActivity,
      tone: 'Gold',
    },
    {
      label: 'Tasa de Conversion',
      value: `${tasaConversion}%`,
      unit: 'ventas',
      description: `${metricasApi.totalVendidos} ventas sobre ${metricasApi.totalLeads} leads registrados.`,
      highlight: `${metricasApi.totalVendidos} vendidos`,
      progress: tasaConversion,
      icon: FiPieChart,
      tone: 'Purple',
    },
    {
      label: 'Leads Hoy',
      value: metricasApi.leadsHoy.toLocaleString('es-PE'),
      unit: 'hoy',
      description: 'Nuevos leads captados durante la fecha actual.',
      highlight: 'Actividad diaria',
      progress: metricasApi.totalLeads ? Math.min(Math.round((metricasApi.leadsHoy / metricasApi.totalLeads) * 100), 100) : 0,
      icon: FiTrendingUp,
      tone: 'Teal',
    },
  ];

  const abrirCrear = () => {
    setAsesorEditar(null);
    setIsModalOpen(true);
  };

  const abrirEditar = (asesor) => {
    setAsesorEditar(asesor);
    setIsModalOpen(true);
  };

  const openDeleteModal = (asesor) => {
    setAsesorAEliminar(asesor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!asesorAEliminar) return;
    setDeleting(true);

    try {
      await eliminarAsesorEnApi(asesorAEliminar.id_usuario);
      setListaUsuarios((prevState) =>
        prevState.filter((asesor) => asesor.id_usuario !== asesorAEliminar.id_usuario),
      );
      setIsDeleteModalOpen(false);
      setResultado({
        title: 'Asesor eliminado correctamente',
        message: 'El asesor paso a estado inactivo mediante eliminado logico.',
      });
      setAsesorAEliminar(null);
    } catch (deleteError) {
      setError(obtenerMensajeError(deleteError, 'No se pudo eliminar el asesor.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleGuardarAsesor = async (asesor) => {
    const esEdicion = Boolean(asesorEditar?.id_usuario);
    await guardarAsesorEnApi(asesor, asesorEditar?.id_usuario);
    await cargarDatos();
    setAsesorEditar(null);
    setResultado({
      title: esEdicion ? 'Asesor actualizado correctamente' : 'Asesor registrado correctamente',
      message: esEdicion
        ? 'Los cambios del asesor ya quedaron guardados.'
        : 'El asesor ya esta disponible en la gestion.',
    });
  };

  return (
    <div className={styles.wrapper}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={styles.main}>
        <div className={styles2.headerSection}>
          <div>
            <h1 className={styles2.title}>Gestion de Asesores</h1>
            <p className={styles2.subtitle}>
              Administra el equipo, revisa indicadores clave y mantiene actualizada la fuerza comercial.
            </p>
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
                    />
                  </div>
                  <span className={styles2.metricProgressValue}>{metrica.progress}%</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles2.filterBar}>
          <button type="button" className={styles2.btnAgregar} onClick={abrirCrear}>
            + Agregar Asesor
          </button>
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
                <th>ROL</th>
                <th>ESTADO</th>
                <th>FECHA REG.</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className={styles2.tableMessage}>Cargando asesores...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="7" className={styles2.tableMessage}>{error}</td>
                </tr>
              )}

              {!loading && !error && asesoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className={styles2.tableMessage}>No se encontraron asesores con esa busqueda.</td>
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
                    <span className={styles2.badge}>Asesor de Ventas</span>
                  </td>
                  <td>
                    <span className={styles2.statusActive}>Activo</span>
                  </td>
                  <td className={styles2.textGray}>{asesor.fechaTexto}</td>
                  <td>
                    <div className={styles2.actionGroup}>
                      <button
                        type="button"
                        className={styles2.btnIcon}
                        onClick={() => abrirEditar(asesor)}
                        title="Editar asesor"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles2.btnDelete}
                        onClick={() => openDeleteModal(asesor)}
                        title="Eliminar asesor"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <ModalAsesor
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAsesorEditar(null);
        }}
        onSave={handleGuardarAsesor}
        asesorEditar={asesorEditar}
      />

      <ModalConfirmarEliminar
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        asesor={asesorAEliminar}
        loading={deleting}
      />

      <ModalResultado
        isOpen={Boolean(resultado)}
        onClose={() => setResultado(null)}
        title={resultado?.title}
        message={resultado?.message}
      />
    </div>
  );
};

export default GestionAsesores;
