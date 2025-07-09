import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import PainelAdmissao from '../pages/PainelAdmissao';
import PainelEnfermeiro from '../pages/PainelEnfermeiro';
import PainelMedico from '../pages/PainelMedico';
import PainelAgendamento from '../pages/PainelAgendamento';
import Agenda from '../components/Agenda';
import Triagem from '../components/Enfermeiro/Triagem';
import Consulta from '../components/Medico/Consulta';
import Private from '../contexts/Private';
import Dashboard from '../components/Dashboard';
import DashboardMedico from '../components/Medico/DashboardMedico';
import TriagemManchester from '../components/TriagemManchester';
import TextToSpeech from '../components/TextToSpeech';

import PainelPrincipal from '../components/PainelPrincipal';
import PainelFacturacao from '../pages/PainelFacturacao';
import Facturacao from '../components/Facturacao';
import PainelAgenda from '../pages/PainelAgenda';
import PainelProduto from '../pages/PainelProduto';
import PacienteForm from '../pages/PainelAdmissao/PacienteForm';
import Paciente from '../components/Paciente';
import Stock from '../components/Stock';
import Laboratorio from '../components/Laboratorio';
import PainelRecursos from '../components/RecursosHumanos';
import FormularioQRCode from '../util/FormularioQRCode';
import Html5QrcodeScanner from '../util/Html5QrcodeScanner';
import RotaTest from '../util/RotaTest';

function RoutesApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/tts" element={<TextToSpeech />} />
            <Route path="/tm" element={<TriagemManchester />} />
            <Route path="/formqrcode" element={<FormularioQRCode />} />
            <Route path="/qrcode" element={<Html5QrcodeScanner />} />
            <Route path="/rota" element={<RotaTest />} />
            <Route path="/admissao/home" element={<PainelAdmissao />} />

            <Route
                path="/admin"
                element={
                    <Private>
                        <PainelPrincipal />
                    </Private>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <Private>
                        <PainelAdmissao page="admin">
                            <Dashboard />
                        </PainelAdmissao>
                    </Private>
                }
            />
            <Route
                path="/admin/paciente"
                element={
                    <Private>
                        <PainelAdmissao page="admin">
                            <PacienteForm />
                        </PainelAdmissao>
                    </Private>
                }
            />

            <Route
                path="/enf"
                element={
                    <Private>
                        <PainelEnfermeiro />
                    </Private>
                }
            />

            <Route
                path="/enf/triagem"
                element={
                    <Private>
                        <PainelEnfermeiro>
                            <Triagem />
                        </PainelEnfermeiro>
                    </Private>
                }
            />

            <Route
                path="/medico/home"
                element={
                    <Private>
                        <PainelMedico>
                            <DashboardMedico />
                        </PainelMedico>
                    </Private>
                }
            />

            <Route
                path="/medico/consulta"
                element={
                    <Private>
                        <PainelMedico>
                            <Consulta />
                        </PainelMedico>
                    </Private>
                }
            />

            <Route
                path="/facturacao"
                element={
                    <Private>
                        <PainelFacturacao></PainelFacturacao>
                    </Private>
                }
            />
            <Route
                path="/facturacao/criar"
                element={
                    <Private>
                        <PainelFacturacao>
                            <Facturacao />
                        </PainelFacturacao>
                    </Private>
                }
            />

            <Route
                path="/agenda"
                element={
                    <Private>
                        <Agenda />
                    </Private>
                }
            />
            <Route
                path="/artigo"
                element={
                    <Private>
                        <PainelProduto />
                    </Private>
                }
            />

            <Route
                path="/stock"
                element={
                    <Private>
                        <Stock />
                    </Private>
                }
            />
            <Route
                path="/lab"
                element={
                    <Private>
                        <Laboratorio />
                    </Private>
                }
            />
            <Route
                path="/rh"
                element={
                    <Private>
                        <PainelRecursos />
                    </Private>
                }
            />

            <Route path="*" element={<div>Página não existente</div>} />
        </Routes>
    );
}
export default RoutesApp;
