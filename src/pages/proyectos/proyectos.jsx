import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
} from 'react-icons/fi';
import styles from '../inicioAdmin/leads.module.css';
import styles2 from './proyectos.module.css';
import Aside from '../../templates/aside';

const API_BASE = 'https://api.ramosgrupo.lat/api';
const FORMULARIO_PROYECTO_INICIAL = {
  nombre_proyecto: '',
  descripcion: '',
  ciudad: '',
  pais: '',
  precio_desde: '',
};

const normalizarProyecto = (proyecto) => ({
  id_proyecto: proyecto.id_proyecto,
  nombre_proyecto: proyecto.nombre_proyecto || 'Sin nombre',
  descripcion: proyecto.descripcion || '',
  ciudad: proyecto.ciudad || 'Sin ciudad',
  pais: proyecto.pais || 'Sin pais',
  precio_desde: proyecto.precio_desde,
  estado: Number(proyecto.estado ?? 1),
});

const normalizarProyectos = (data) =>
  (Array.isArray(data) ? data : [])
    .map(normalizarProyecto)
    .filter((proyecto) => proyecto.estado === 1);

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

const formatearPrecio = (valor) => {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) return 'Sin precio';

  return numero.toLocaleString('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const obtenerInicialesProyecto = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

const obtenerProyectosDesdeApi = async () => {
  const response = await axios.get(`${API_BASE}/getpoyectos/`);
  return normalizarProyectos(response.data);
};

const guardarProyectoEnApi = (proyecto, idProyecto) => {
  const payload = {
    ...proyecto,
    precio_desde: proyecto.precio_desde === '' ? null : proyecto.precio_desde,
    estado: 1,
  };

  if (idProyecto) {
    return axios.patch(`${API_BASE}/updateproyecto/${idProyecto}/`, payload);
  }

  return axios.post(`${API_BASE}/postproyectos/`, payload);
};

const eliminarProyectoEnApi = (idProyecto) =>
  axios.patch(`${API_BASE}/deleteproyecto/${idProyecto}/`);

const ModalProyecto = ({ isOpen, onClose, onSave, proyectoEditar }) => {
  const [formData, setFormData] = useState(FORMULARIO_PROYECTO_INICIAL);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (proyectoEditar) {
      setFormData({
        nombre_proyecto: proyectoEditar.nombre_proyecto || '',
        descripcion: proyectoEditar.descripcion || '',
        ciudad: proyectoEditar.ciudad === 'Sin ciudad' ? '' : proyectoEditar.ciudad || '',
        pais: proyectoEditar.pais === 'Sin pais' ? '' : proyectoEditar.pais || '',
        precio_desde: proyectoEditar.precio_desde ?? '',
      });
      return;
    }

    setFormData(FORMULARIO_PROYECTO_INICIAL);
  }, [isOpen, proyectoEditar]);

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
        nombre_proyecto: formData.nombre_proyecto.trim(),
        descripcion: formData.descripcion.trim(),
        ciudad: formData.ciudad.trim(),
        pais: formData.pais.trim(),
        precio_desde: formData.precio_desde,
      });

      handleClose();
    } catch (saveError) {
      setSubmitError(obtenerMensajeError(saveError, 'No se pudo guardar el proyecto.'));
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
              {proyectoEditar ? 'Editar Proyecto' : 'Registrar Proyecto'}
            </h2>
            <p className={styles2.modalSubtitle}>
              Mantiene actualizada la informacion comercial del inventario.
            </p>
          </div>
          <button type="button" className={styles2.btnCloseX} onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles2.modalForm}>
          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>Nombre del proyecto *</label>
            <input
              type="text"
              name="nombre_proyecto"
              placeholder="Ej. Torre Central"
              className={styles2.formInput}
              value={formData.nombre_proyecto}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles2.formRow}>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>Ciudad</label>
              <input
                type="text"
                name="ciudad"
                placeholder="Ej. Lima"
                className={styles2.formInput}
                value={formData.ciudad}
                onChange={handleChange}
              />
            </div>
            <div className={styles2.formGroup}>
              <label className={styles2.formLabel}>Pais</label>
              <input
                type="text"
                name="pais"
                placeholder="Ej. Peru"
                className={styles2.formInput}
                value={formData.pais}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>Precio desde</label>
            <input
              type="number"
              name="precio_desde"
              min="0"
              step="0.01"
              placeholder="Ej. 120000"
              className={styles2.formInput}
              value={formData.precio_desde}
              onChange={handleChange}
            />
          </div>

          <div className={styles2.formGroupFull}>
            <label className={styles2.formLabel}>Descripcion</label>
            <textarea
              name="descripcion"
              placeholder="Detalles generales del proyecto"
              className={styles2.formTextarea}
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {submitError && <p className={styles2.formError}>{submitError}</p>}

          <div className={styles2.modalFooter}>
            <button type="button" className={styles2.btnCancel} onClick={handleClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className={styles2.btnSave} disabled={saving}>
              <FiSave size={16} />
              {saving ? 'Guardando...' : 'Guardar Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalConfirmarEliminar = ({ isOpen, onClose, onConfirm, proyecto, loading }) => {
  if (!isOpen) return null;

  return (
    <div className={styles2.modalOverlay} onClick={onClose}>
      <div className={styles2.confirmModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles2.confirmIcon}>
          <FiTrash2 />
        </div>
        <h2 className={styles2.confirmTitle}>Eliminar proyecto</h2>
        <p className={styles2.confirmText}>
          El proyecto pasara a estado inactivo y no aparecera en la gestion.
        </p>
        <strong className={styles2.confirmName}>{proyecto?.nombre_proyecto}</strong>

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

const GestionProyecto = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proyectoEditar, setProyectoEditar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [proyectoEliminar, setProyectoEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resultado, setResultado] = useState(null);

  const cargarProyectos = async () => {
    setLoading(true);
    setError('');

    try {
      const proyectosApi = await obtenerProyectosDesdeApi();
      setProyectos(proyectosApi);
    } catch (fetchError) {
      console.error('Error al obtener proyectos:', fetchError);
      setProyectos([]);
      setError('No se pudieron cargar los proyectos desde la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const proyectosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return proyectos;

    return proyectos.filter((proyecto) =>
      [
        proyecto.nombre_proyecto,
        proyecto.descripcion,
        proyecto.ciudad,
        proyecto.pais,
        formatearPrecio(proyecto.precio_desde),
      ].some((valor) => valor.toLowerCase().includes(termino)),
    );
  }, [busqueda, proyectos]);

  const ciudades = new Set(proyectos.map((proyecto) => proyecto.ciudad).filter((ciudad) => ciudad !== 'Sin ciudad'));
  const proyectosConPrecio = proyectos.filter((proyecto) => Number(proyecto.precio_desde) > 0);
  const precioPromedio = proyectosConPrecio.length
    ? proyectosConPrecio.reduce((total, proyecto) => total + Number(proyecto.precio_desde), 0) / proyectosConPrecio.length
    : 0;
  const proyectosConDescripcion = proyectos.filter((proyecto) => proyecto.descripcion.trim()).length;
  const porcentajeDescripcion = proyectos.length
    ? Math.round((proyectosConDescripcion / proyectos.length) * 100)
    : 0;

  const metricas = [
    {
      label: 'Proyectos Activos',
      value: proyectos.length.toLocaleString('es-PE'),
      unit: 'inventario',
      description: 'Proyectos disponibles para leads, ventas y seguimiento comercial.',
      highlight: 'Estado activo',
      icon: FiBriefcase,
      tone: 'Orange',
    },
    {
      label: 'Ciudades',
      value: ciudades.size.toLocaleString('es-PE'),
      unit: 'ubicaciones',
      description: 'Cobertura geografica registrada dentro del portafolio actual.',
      highlight: `${ciudades.size} zonas`,
      icon: FiMapPin,
      tone: 'Blue',
    },
    {
      label: 'Precio Promedio',
      value: formatearPrecio(precioPromedio),
      unit: 'desde',
      description: 'Referencia promedio calculada con proyectos que tienen precio.',
      highlight: `${proyectosConPrecio.length} con precio`,
      icon: FiTrendingUp,
      tone: 'Green',
    },
    {
      label: 'Ficha Completa',
      value: `${porcentajeDescripcion}%`,
      unit: 'descripcion',
      description: `${proyectosConDescripcion} proyectos tienen descripcion comercial registrada.`,
      highlight: 'Contenido',
      icon: FiSave,
      tone: 'Gold',
    },
  ];

  const abrirCrear = () => {
    setProyectoEditar(null);
    setIsModalOpen(true);
  };

  const abrirEditar = (proyecto) => {
    setProyectoEditar(proyecto);
    setIsModalOpen(true);
  };

  const abrirEliminar = (proyecto) => {
    setProyectoEliminar(proyecto);
    setIsDeleteModalOpen(true);
  };

  const handleGuardarProyecto = async (proyecto) => {
    const esEdicion = Boolean(proyectoEditar?.id_proyecto);
    await guardarProyectoEnApi(proyecto, proyectoEditar?.id_proyecto);
    await cargarProyectos();
    setProyectoEditar(null);
    setResultado({
      title: esEdicion ? 'Proyecto actualizado correctamente' : 'Proyecto registrado correctamente',
      message: esEdicion
        ? 'Los cambios del proyecto ya quedaron guardados.'
        : 'El proyecto ya esta disponible en la gestion.',
    });
  };

  const handleConfirmDelete = async () => {
    if (!proyectoEliminar) return;

    setDeleting(true);

    try {
      await eliminarProyectoEnApi(proyectoEliminar.id_proyecto);
      setProyectos((prevState) =>
        prevState.filter((proyecto) => proyecto.id_proyecto !== proyectoEliminar.id_proyecto),
      );
      setIsDeleteModalOpen(false);
      setResultado({
        title: 'Proyecto eliminado correctamente',
        message: 'El proyecto paso a estado inactivo mediante eliminado logico.',
      });
      setProyectoEliminar(null);
    } catch (deleteError) {
      setError(obtenerMensajeError(deleteError, 'No se pudo eliminar el proyecto.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <Aside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={styles.main}>
        <div className={styles.mobileHeader}>
          <button type="button" onClick={() => setSidebarOpen(true)} className={styles.menuBtn}>
            <FiBriefcase size="1.5em" />
          </button>
          <span className={styles.mobileTitle}>Gestion de Proyectos</span>
          <span className={styles.mobileHeaderRight} />
        </div>

        <div className={styles2.headerSection}>
          <div>
            <h1 className={styles2.title}>Gestion de Proyectos</h1>
            <p className={styles2.subtitle}>
              Administra el portafolio comercial, sus ubicaciones y precios de referencia.
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
              </article>
            );
          })}
        </div>

        <div className={styles2.filterBar}>
          <button type="button" className={styles2.btnAgregar} onClick={abrirCrear}>
            <FiPlus size={17} />
            Agregar Proyecto
          </button>
          <div className={styles2.searchContainer}>
            <FiSearch size={18} color="#7b7b7b" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, pais o precio..."
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
                <th>PROYECTO</th>
                <th>UBICACION</th>
                <th>PRECIO DESDE</th>
                <th>DESCRIPCION</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>Cargando proyectos...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>{error}</td>
                </tr>
              )}

              {!loading && !error && proyectosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles2.tableMessage}>No se encontraron proyectos.</td>
                </tr>
              )}

              {!loading && !error && proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id_proyecto}>
                  <td>
                    <div className={styles2.projectCell}>
                      <div className={styles2.projectAvatar}>
                        {obtenerInicialesProyecto(proyecto.nombre_proyecto)}
                      </div>
                      <div className={styles2.projectIdentity}>
                        <span>{proyecto.nombre_proyecto}</span>
                        <small>ID #{proyecto.id_proyecto}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles2.locationCell}>
                      <span>{proyecto.ciudad}</span>
                      <small>{proyecto.pais}</small>
                    </div>
                  </td>
                  <td className={Number(proyecto.precio_desde) > 0 ? '' : styles2.textGray}>
                    {formatearPrecio(proyecto.precio_desde)}
                  </td>
                  <td className={styles2.descriptionCell}>
                    {proyecto.descripcion || 'Sin descripcion'}
                  </td>
                  <td>
                    <span className={styles2.statusActive}>Activo</span>
                  </td>
                  <td>
                    <div className={styles2.actionGroup}>
                      <button
                        type="button"
                        className={styles2.btnIcon}
                        onClick={() => abrirEditar(proyecto)}
                        title="Editar proyecto"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles2.btnDelete}
                        onClick={() => abrirEliminar(proyecto)}
                        title="Eliminar proyecto"
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

      <ModalProyecto
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProyectoEditar(null);
        }}
        onSave={handleGuardarProyecto}
        proyectoEditar={proyectoEditar}
      />

      <ModalConfirmarEliminar
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        proyecto={proyectoEliminar}
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

export default GestionProyecto;
