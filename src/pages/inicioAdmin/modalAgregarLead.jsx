import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdClose, MdSave } from 'react-icons/md';
import styles from './modalAgregarLead.module.css';

const ModalLead = ({ isOpen, onClose, onLeadAdded }) => {
    const [origenes, setOrigenes] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        id_origen: '',
        id_proyecto_interes: '',
        observacion: ''
    });

    // Cargar catálogos desde Django al abrir el modal
    useEffect(() => {
        if (isOpen) {
            const fetchCatalogos = async () => {
                setLoading(true);
                try {
                    const [resOrigen, resProyectos] = await Promise.all([
                        axios.get('https://api.ramosgrupo.lat/api/getorigen/'),
                        axios.get('https://api.ramosgrupo.lat/api/getpoyectos/')
                    ]);
                    setOrigenes(resOrigen.data);
                    setProyectos(resProyectos.data);
                } catch (error) {
                    console.error("Error cargando catálogos:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCatalogos();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
    e.preventDefault();
    const idAsesor = sessionStorage.getItem("id_usuario");
    const nombreAsesor = sessionStorage.getItem("nombre");
    // Convertimos a número los IDs de los selectores para asegurar compatibilidad
    const payload = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        observacion: formData.observacion,
        id_origen: parseInt(formData.id_origen), // Convertir a entero
        id_proyecto_interes: parseInt(formData.id_proyecto_interes), // Convertir a entero
        id_asesor: 11,
        id_estado: 5, // ID del estado "Nuevo"
        fecha_registro: new Date().toISOString(),
        fecha_asignacion: new Date().toISOString(),
        nombreAsesor :nombreAsesor
    };

    try {
        const response = await axios.post('https://api.ramosgrupo.lat/api/savelead/', payload);
        console.log("Guardado con éxito:", response.data);
        onLeadAdded?.();
        window.dispatchEvent(new Event("leads:updated"));
        onClose();
        // Reset...
        setFormData({
            nombre: '',
            telefono: '',
            email: '',
            id_origen: '',
            id_proyecto_interes: '',
            observacion: ''
        });

        alert("Lead guardado exitosamente");
    } catch (error) {
        // MUY IMPORTANTE: Imprime el error para ver qué campo falla
        console.error("Error de validación en Django:", error.response?.data);
        alert("Error al guardar: " + JSON.stringify(error.response?.data));
    }
};

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.modalTitle}>Registrar Nuevo Lead</h3>
                        <p className={styles.modalSubtitle}>Vincula un nuevo prospecto a un proyecto</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Nombre Completo *</label>
                        <input 
                            type="text" required
                            placeholder="Ej. Juan Pérez"
                            value={formData.nombre}
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        />
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Teléfono</label>
                            <input 
                                type="text"
                                placeholder="+51..."
                                value={formData.telefono}
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Correo Electrónico</label>
                            <input 
                                type="email"
                                placeholder="usuario@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Origen del Lead *</label>
                            <select 
                                required
                                value={formData.id_origen}
                                onChange={(e) => setFormData({...formData, id_origen: e.target.value})}
                            >
                                <option value="">{loading ? 'Cargando...' : 'Seleccionar origen'}</option>
                                {origenes.map(o => (
                                    <option key={o.id_origen} value={o.id_origen}>{o.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Proyecto de Interés *</label>
                            <select 
                                required
                                value={formData.id_proyecto_interes}
                                onChange={(e) => setFormData({...formData, id_proyecto_interes: e.target.value})}
                            >
                                <option value="">{loading ? 'Cargando...' : 'Seleccionar proyecto'}</option>
                                {proyectos.map(p => (
                                    <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre_proyecto}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Observaciones</label>
                        <textarea 
                            rows="3"
                            placeholder="Detalles adicionales del prospecto..."
                            value={formData.observacion}
                            onChange={(e) => setFormData({...formData, observacion: e.target.value})}
                        ></textarea>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
                        <button type="submit" className={styles.btnSave}>
                            <MdSave size={20} /> Guardar Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalLead;
