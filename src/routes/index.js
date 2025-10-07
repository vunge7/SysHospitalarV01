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
import Usuarios from '../components/Usuario';
import Laboratorio from '../components/Laboratorio';
import PainelRecursos from '../components/RecursosHumanos';
import FormularioQRCode from '../util/FormularioQRCode';
import Html5QrcodeScanner from '../util/Html5QrcodeScanner';
import RotaTest from '../util/RotaTest';
import GraficoTriagem from '../components/GraficoTriagem';
import RoleRoute from '../contexts/RoleRoute';

function RoutesApp() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            { /*Outras rotas comentadas para depuração*/ }
            { <Route path="/tts" element={<TextToSpeech />} /> }
            { <Route path="/gt" element={<GraficoTriagem />} /> }
            { <Route path="/tm" element={<TriagemManchester />} /> }
            { <Route path="/formqrcode" element={<FormularioQRCode />} />}
            { <Route path="/qrcode" element={<Html5QrcodeScanner />} />}
            { <Route path="/rota" element={<RotaTest />} />}
            { <Route path="/admissao/home" element={<PainelAdmissao />} />}
            

            { <Route
                path="/admin"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', "medico", "analista"]}>
                            <PainelPrincipal />
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/admin/dashboard"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <PainelAdmissao page="admin">
                                <Dashboard />
                            </PainelAdmissao>
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="/admin/paciente"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', "medico", "enfermeiro"]}>
                            <PainelAdmissao page="admin">
                                <PacienteForm />
                            </PainelAdmissao>
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/enf"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', 'enfermeiro', "medico", "ADMINISTRATIVO", "admin"]}>
                            <PainelEnfermeiro />
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/enf/triagem"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', 'enfermeiro', "medico", "ADMINISTRATIVO", "admin"]}>
                            <PainelEnfermeiro>
                                <Triagem />
                            </PainelEnfermeiro>
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/medico/home"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', 'medico']}>
                            <PainelMedico>
                                <DashboardMedico />
                            </PainelMedico>
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/medico/consulta"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', 'medico']}>
                            <PainelMedico>
                                <Consulta />
                            </PainelMedico>
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/facturacao"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <PainelFacturacao></PainelFacturacao>
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="/facturacao/criar"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <PainelFacturacao>
                                <Facturacao />
                            </PainelFacturacao>
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/agenda"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', 'enfermeiro', "medico"]}>
                            <Agenda />
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="/artigo"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', "analista"]}>
                            <PainelProduto />
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route
                path="/stock"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <Stock />
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="admin/usuario"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <Usuarios />
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="/lab"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo', "analista"]}>
                            <Laboratorio />
                        </RoleRoute>
                    </Private>
                }
            />}
            { <Route
                path="/rh"
                element={
                    <Private>
                        <RoleRoute allowed={['administrativo']}>
                            <PainelRecursos />
                        </RoleRoute>
                    </Private>
                }
            />}

            { <Route path="/*" element={<div>Página não existente</div>} />}
        </Routes>
    );
}
export default RoutesApp;
