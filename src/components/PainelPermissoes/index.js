// PainelPermissoes.js - CORRIGIDO
import React, { useState, useEffect, useContext } from 'react';
import { Layout, Spin, Alert, Card } from 'antd';
import { AuthContext } from '../../contexts/auth';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import MenuLateral from './MenuLateral';
import ListaUsuariosComAcoes from './ListaUsuariosComAcoes'; // NOVO
import GerenciarPermissoes from './GerenciarPermissoes'; // USAR O COMPONENTE EXISTENTE
import {
    fetchFiliaisByUsuarioId,
} from '../../service/api';

const { Content } = Layout;

const PainelPermissoes = () => {
    const { user } = useContext(AuthContext);
    const usuarioId = user?.id;

    const [selectedFilial, setSelectedFilial] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carrega filiais apenas uma vez
    useEffect(() => {
        if (usuarioId) {
            setLoading(true);
            fetchFiliaisByUsuarioId(usuarioId)
                .then(() => setError(null))
                .catch((error) => {
                    console.error('Erro ao carregar filiais:', error);
                    setError('Falha ao carregar filiais');
                })
                .finally(() => setLoading(false));
        }
    }, [usuarioId]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Cabecario />
            <Layout>
                <MenuLateral onSelectFilial={setSelectedFilial} />
                <Content style={{ padding: '20px', margin: '0 16px' }}>
                    <Spin spinning={loading} tip="Carregando...">
                        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}
                        
                        {!selectedFilial ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h2>👋 Bem-vindo ao Painel de Permissões</h2>
                                <p>Selecione uma filial no menu lateral para começar</p>
                            </div>
                        ) : (
                            <div>
                                <h1>🏢 Filial Selecionada: {selectedFilial}</h1>
                                
                                {/* PASSO 1: Lista de usuários da filial */}
                                {!selectedUser && (
                                    <ListaUsuariosComAcoes
                                        filialId={selectedFilial}
                                        onSelectUser={setSelectedUser}
                                        loading={loading}
                                    />
                                )}
                                
                                {/* PASSO 2: Gerenciar permissões do usuário selecionado */}
                                {selectedUser && (
                                    <Card title={`👤 Gerenciar Permissões - Usuário ${selectedUser}`}>
                                        <GerenciarPermissoes 
                                            filialId={selectedFilial}
                                            userId={selectedUser}
                                            onBack={() => setSelectedUser(null)} // Botão voltar
                                        />
                                    </Card>
                                )}
                            </div>
                        )}
                    </Spin>
                </Content>
            </Layout>
            <Rodape />
        </Layout>
    );
};

export default PainelPermissoes;