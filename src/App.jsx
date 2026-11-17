import { Navigate, Route, Routes } from 'react-router-dom'
import Plantilla from './components/Plantilla'
import RutaProtegida from './components/RutaProtegida'
import ListadoVacantes from './pages/ListadoVacantes'
import DetalleVacante from './pages/DetalleVacante'
import Login from './pages/Login'
import RegistroCandidato from './pages/RegistroCandidato'
import RegistroEmpresa from './pages/RegistroEmpresa'
import MisSolicitudes from './pages/MisSolicitudes'
import EmpresaVacantes from './pages/EmpresaVacantes'
import PublicarVacante from './pages/PublicarVacante'
import SolicitudesRecibidas from './pages/SolicitudesRecibidas'

export default function App() {
  return (
    <Routes>
      <Route element={<Plantilla />}>
        <Route index element={<ListadoVacantes />} />
        <Route path="vacantes/:id" element={<DetalleVacante />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<RegistroCandidato />} />
        <Route path="registro-empresa" element={<RegistroEmpresa />} />
        <Route
          path="mis-solicitudes"
          element={
            <RutaProtegida rol="candidato">
              <MisSolicitudes />
            </RutaProtegida>
          }
        />
        <Route
          path="empresa/vacantes"
          element={
            <RutaProtegida rol="empresa">
              <EmpresaVacantes />
            </RutaProtegida>
          }
        />
        <Route
          path="empresa/publicar"
          element={
            <RutaProtegida rol="empresa">
              <PublicarVacante />
            </RutaProtegida>
          }
        />
        <Route
          path="empresa/vacantes/:id/solicitudes"
          element={
            <RutaProtegida rol="empresa">
              <SolicitudesRecibidas />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
