import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
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
import PermissaoRoute from './PermissaoRoute';
import { getRotaConfig } from '../config/rotasConfig';
import PainelPermissoes from '../components/PainelPermissoes';

const RotaProtegidaPorChave = ({ chave, children }) => {
    const config = getRotaConfig(chave);
    // Se a chave não existir na configuração, NEGAR acesso (em vez de liberar)
    if (!config) {
        return (
            <>{children}</>
            /*
            <PermissaoRoute>
                {children}
            </PermissaoRoute>*/
        );
    }
    return (
        <>{children}</>
        /*
        <PermissaoRoute 
            painelId={config.painelId}
            descricaoPainel={config.descricaoPainel}
            permissao={config.permissao}
        >
            
        </PermissaoRoute>
        */
    );
};

function RoutesApp() {
    const { user } = useContext(AuthContext); // Obtém o usuário autenticado
    const usuarioId = user?.id; // Extrai o ID do usuário

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            {/*Outras rotas comentadas para depuração*/}
            {<Route path="/tts" element={<TextToSpeech />} />}
            {<Route path="/gt" element={<GraficoTriagem />} />}
            {<Route path="/tm" element={<TriagemManchester />} />}
            {<Route path="/formqrcode" element={<FormularioQRCode />} />}
            {<Route path="/qrcode" element={<Html5QrcodeScanner />} />}
            {<Route path="/rota" element={<RotaTest />} />}
            {
                <Route
                    path="/admissao/home"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="admissao">
                                <PainelAdmissao />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/admin"
                    element={
                        <Private>
                            <PainelPrincipal />
                        </Private>
                    }
                />
            }

            {
                <Route
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
                />
            }
            {
                <Route
                    path="/admin/paciente"
                    element={
                        <Private>
                            <RoleRoute
                                allowed={[
                                    'administrativo',
                                    'medico',
                                    'enfermeiro',
                                ]}
                            >
                                <PainelAdmissao page="admin">
                                    <PacienteForm />
                                </PainelAdmissao>
                            </RoleRoute>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/enf"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="enfermaria">
                                <PainelEnfermeiro />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/enf/triagem"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="enfermaria">
                                <PainelEnfermeiro>
                                    <Triagem />
                                </PainelEnfermeiro>
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
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
                />
            }

            {
                <Route
                    path="/medico/consulta"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="consultorio">
                                <PainelMedico>
                                    <Consulta />
                                </PainelMedico>
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/facturacao"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="facturacao">
                                <PainelFacturacao></PainelFacturacao>
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="/facturacao/criar"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="facturacao">
                                <PainelFacturacao>
                                    <Facturacao />
                                </PainelFacturacao>
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/agenda"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="agendamento">
                                <Agenda />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="/artigo"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="servicos">
                                <PainelProduto />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }

            {
                <Route
                    path="/stock"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="stock">
                                <Stock />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="admin/usuario"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="usuarios">
                                <Usuarios />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="/lab"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="laboratorio">
                                <Laboratorio />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="/rh"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="rh">
                                <PainelRecursos />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {
                <Route
                    path="/admin/permissoes"
                    element={
                        <Private>
                            <RotaProtegidaPorChave chave="permissoes">
                                <PainelPermissoes usuarioId={usuarioId} />
                            </RotaProtegidaPorChave>
                        </Private>
                    }
                />
            }
            {<Route path="/*" element={<div>Página não existente</div>} />}
        </Routes>
    );
}
export default RoutesApp;
