import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateProforma from "./pages/CreateProforma";
import ProformaHistory from "./pages/ProformaHistory";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal de Inicio */}
        <Route path="/" element={<Dashboard />} /> 
        {/* Ruta para crear proforma */}
        <Route path="/create" element={<CreateProforma />} />
        {/* Ruta para historial */}
        <Route path="/history" element={<ProformaHistory />} />
        {/* Ruta para reportes */}
        <Route path="/reports" element={<Reports />} />
      </Routes>  
    </BrowserRouter>
  );
}

export default App;