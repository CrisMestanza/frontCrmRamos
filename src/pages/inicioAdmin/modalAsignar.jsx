import React, { useState, useEffect } from 'react';
import styles from './modalCambiar.module.css';
import { MdAssignmentInd } from "react-icons/md";
// Importamos el hook useNavigate en lugar del componente Navigate
import { useNavigate } from 'react-router-dom';

const AsignarAsesorModal = ({ isOpen, onClose, lead, asesores, onConfirm, tempAsesorId }) => {
  const [selectedAsesor, setSelectedAsesor] = useState(tempAsesorId);
  
  // Inicializamos la función de navegación
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedAsesor(tempAsesorId);
  }, [tempAsesorId, isOpen]);

  if (!isOpen) return null;

const handleConfirm = async () => { // Añadimos async
  try {
    // 1. Esperamos a que la función de API termine
    await onConfirm(lead, selectedAsesor);
    
    // 2. Cerramos el modal
    onClose();
    
    // 3. Opción A: Refrescar la página actual (fuerza bruta pero funciona 100%)
    window.location.reload(); 

    // Opción B: Si prefieres ir a inicio y que se vea actualizado:
    // navigate("/inicio"); 
  } catch (error) {
    console.error("No se pudo actualizar:", error);
  }
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <MdAssignmentInd className={styles.titleIcon} />
            <h3>Asignar Asesor Comercial</h3>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.leadInfo}>
            Vas a reasignar al prospecto: <strong>{lead.nombre}</strong>
          </p>
          
          <div className={styles.formGroup}>
            <label>Responsable seleccionado:</label>
            <select 
              className={styles.select}
              value={selectedAsesor} 
              onChange={(e) => setSelectedAsesor(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {asesores.map(as => (
                <option key={as.id_usuario} value={as.id_usuario}>
                  {as.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>Confirmar Cambio</button>
        </div>
      </div>
    </div>
  );
};

export default AsignarAsesorModal;