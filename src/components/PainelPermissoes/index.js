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
    fetchAllFiliais
} from '../../service/api';

const { Content, Sider } = Layout;

const PainelPermissoes = () => {
    const { user } = useContext(AuthContext);
    const usuarioId = user?.id;

    const [selectedFilial, setSelectedFilial] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Log quando o selectedFilial mudar
    useEffect(() => {
        console.log('selectedFilial atualizado:', selectedFilial);
    }, [selectedFilial]);

    // Carrega filiais apenas uma vez
    useEffect(() => {
        if (usuarioId) {
            setLoading(true);
            // Primeiro, busca as filiais do usuário
            fetchFiliaisByUsuarioId(usuarioId)
                .then(response => {
                    const filiais = response.data || [];
                    console.log('Filiais do usuário:', filiais);
                    
                    // Se houver filiais, busca os detalhes completos da primeira filial
                    if (filiais.length > 0) {
                        return fetchAllFiliais().then(allFiliaisResponse => {
                            const filialCompleta = allFiliaisResponse.data.find(f => f.id === filiais[0].id);
                            if (filialCompleta) {
                                setSelectedFilial({
                                    ...filialCompleta,
                                    // Padroniza: empresaId usado nos endpoints é o id da própria filial
                                    empresaId: filialCompleta.id
                                });
                            }
                            return filiais;
                        });
                    }
                    return filiais;
                })
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
                <Sider
                    width={260}
                    style={{
                        background: '#fff',
                        borderRight: '1px solid #f0f0f0',
                        height: '100vh',
                        position: 'sticky',
                        top: 0,
                        overflow: 'auto'
                    }}
                >
                    <MenuLateral onSelectFilial={setSelectedFilial} selectedFilial={selectedFilial} />
                </Sider>
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
                                <h1>🏢 {selectedFilial?.nome || `Filial ${selectedFilial?.id}`}</h1>
                                
                                {/* PASSO 1: Lista de usuários da filial */}
                                {!selectedUser && (
                                    (() => { 
                                        console.log('Dados do usuário:', { user, selectedFilial, empresaId: user?.empresaId || selectedFilial?.empresaId });
                                        return <ListaUsuariosComAcoes 
                                    
                                        filialId={selectedFilial?.id}
                                        filialNome={selectedFilial?.nome}
                                        empresaId={selectedFilial?.id}
                                        onSelectUser={(user) => {
                                            setSelectedUser(user);
                                            setSelectedUserName(`${user.nome} (${user.userName})`);
                                        }}
                                        loading={loading}
                                    />;
                                    })()
                                )}
                                
                                {/* PASSO 2: Gerenciar permissões do usuário selecionado */}
                                {selectedUser && (
                                    <Card title={`👤 Gerenciar Permissões - ${selectedUserName || 'Usuário'}`}>
                                        <GerenciarPermissoes 
                                            filialId={selectedFilial?.id}
                                            filialNome={selectedFilial?.nome}
                                            userId={selectedUser?.id}
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