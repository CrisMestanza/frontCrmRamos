import { useState } from 'react';
import axios from 'axios';
import { MdClose, MdSave } from 'react-icons/md';
import styles from './modalAgregarLead.module.css';

const ModalAgregarNumero = ({ isOpen, onClose }) => {
    const [numero, setNumero] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (loading) return;
        setNumero('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://127.0.0.1:8000/api/agregarnumero/', {
                numero: numero.trim()
            });

            alert('Numero agregado exitosamente');
            handleClose();
        } catch (error) {
            console.error('Error al agregar numero:', error.response?.data || error);
            alert('Error al agregar numero: ' + JSON.stringify(error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div>
                        <h3 className={styles.modalTitle}>Agregar Numero</h3>
                        <p className={styles.modalSubtitle}>Registra un numero para la campana seleccionada</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className={styles.closeBtn}
                        disabled={loading}
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Numero *</label>
                        <input
                            type="tel"
                            required
                            placeholder="Ej. 999888777"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={styles.btnCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={loading || !numero.trim()}
                        >
                            <MdSave size={20} />
                            {loading ? 'Guardando...' : 'Guardar Numero'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAgregarNumero;
