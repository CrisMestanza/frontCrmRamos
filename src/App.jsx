import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import LeadsPage from "./pages/inicioAdmin/LeadsPage";
import ParteAsesor from "./pages/asesores/parteAsesor";
import VentasPageAsesor from "./pages/asesores/VentasPageAsesor";
import ParteAsesorAdmin from "./pages/asesoresParteAdmin/asesoresParteAdmin";
import DetalleAsesor from "./pages/asesoresParteAdmin/detalleAsesor";
import HistorialLead from "./pages/asesoresParteAdmin/historialLeadEstado";
import InteraccionesAsesor from "./pages/asesoresParteAdmin/InteraccionesAsesor";
import VentasPageAdmin from "./pages/ventas/VentasPage";
import GestionAsesor from "./pages/gestionAsesor/asesorGestion"
import GestionProyecto from "./pages//proyectos/proyectos"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<LeadsPage />} />
        <Route path="/asesores" element={<ParteAsesor />} />
        <Route path="/gestionasesor" element={<GestionAsesor />} />
        <Route path="/ventasadmin" element={<VentasPageAdmin />} />
        <Route path="/asesoresadmin" element={<ParteAsesorAdmin />} />
        <Route path="/asesoresadmin/detalle/:id" element={<DetalleAsesor />} />
        <Route path="/admin/lead-historial/:idLead" element={<HistorialLead />} />
        <Route path="/admin/asesor-interacciones/:idAsesor/:idLead" element={<InteraccionesAsesor />} />
        <Route path="/asesores/ventas" element={<VentasPageAsesor />} />
        <Route path="/proyectos" element={< GestionProyecto/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
