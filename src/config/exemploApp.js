// 📋 Exemplo de como configurar o App.js com rotas baseadas em painéis
// Copie este exemplo e adapte para o seu App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/auth';
import Login from '../pages/Login';
import SelecionarFilial from '../pages/SelecionarFilial';
import PermissaoRoute from '../components/PermissaoRoute';
import Private from '../contexts/Private';
import { AuthContext } from '../contexts/auth';
import { ROTAS_CONFIG } from './rotasConfig';

// Importe seus componentes aqui
// import AdminPanel from '../pages/AdminPanel';
// import MedicoPanel from '../pages/MedicoPanel';
// import EnfermeiroPanel from '../pages/EnfermeiroPanel';
// import ProdutoPanel from '../pages/ProdutoPanel';

function App() {
    // Componente para verificar se o usuário tem filial selecionada
    const RequireFilial = ({ children }) => {
        const { user } = React.useContext(AuthContext);
        
        if (!user?.filialSelecionada) {
            return <Navigate to="/selecionar-filial" replace />;
        }
        
        return children;
    };

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rotas públicas */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Rota de seleção de filial */}
                    <Route 
                        path="/selecionar-filial" 
                        element={
                            <Private>
                                <SelecionarFilial />
                            </Private>
                        } 
                    />
                    
                    {/* 🏥 Rotas de Processos Clínicos */}
                    
                    {/* Admissão */}
                    <Route 
                        path="/admissao/home" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.admissao.painelId}
                                        descricaoPainel={ROTAS_CONFIG.admissao.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.admissao.tipoPainel}
                                        permissao={ROTAS_CONFIG.admissao.permissao}
                                    >
                                        <div>Painel de Admissão</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* Enfermaria */}
                    <Route 
                        path="/enf" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.enfermaria.painelId}
                                        descricaoPainel={ROTAS_CONFIG.enfermaria.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.enfermaria.tipoPainel}
                                        permissao={ROTAS_CONFIG.enfermaria.permissao}
                                    >
                                        <div>Painel de Enfermaria</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* Consultório Médico */}
                    <Route 
                        path="/medico/consulta" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.consultorio.painelId}
                                        descricaoPainel={ROTAS_CONFIG.consultorio.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.consultorio.tipoPainel}
                                        permissao={ROTAS_CONFIG.consultorio.permissao}
                                    >
                                        <div>Painel de Consultório</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* Laboratório */}
                    <Route 
                        path="/lab" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.laboratorio.painelId}
                                        descricaoPainel={ROTAS_CONFIG.laboratorio.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.laboratorio.tipoPainel}
                                        permissao={ROTAS_CONFIG.laboratorio.permissao}
                                    >
                                        <div>Painel de Laboratório</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* 🏢 Rotas de Processos Administrativos */}
                    
                    {/* Gestão de Produtos */}
                    <Route 
                        path="/artigo" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.servicos.painelId}
                                        descricaoPainel={ROTAS_CONFIG.servicos.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.servicos.tipoPainel}
                                        permissao={ROTAS_CONFIG.servicos.permissao}
                                    >
                                        <div>Gestão de Produtos</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* Gestão de Usuários */}
                    <Route 
                        path="/admin/usuario" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <PermissaoRoute 
                                        painelId={ROTAS_CONFIG.usuarios.painelId}
                                        descricaoPainel={ROTAS_CONFIG.usuarios.descricaoPainel}
                                        tipoPainel={ROTAS_CONFIG.usuarios.tipoPainel}
                                        permissao={ROTAS_CONFIG.usuarios.permissao}
                                    >
                                        <div>Gestão de Usuários</div>
                                    </PermissaoRoute>
                                </RequireFilial>
                            </Private>
                        } 
                    />
                    
                    {/* Rota padrão para usuários logados */}
                    <Route 
                        path="*" 
                        element={
                            <Private>
                                <RequireFilial>
                                    <Navigate to="/admin" replace />
                                </RequireFilial>
                            </Private>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App; 