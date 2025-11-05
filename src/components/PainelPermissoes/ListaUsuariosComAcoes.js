// ListaUsuariosComAcoes.js - ATUALIZADO
import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Alert, Modal, message } from 'antd';
import { 
    fetchUsersByFilialId,
    fetchUsersNotInFilial,
    addUserToBranch,
    removeUserFromBranch,
    fetchPessoaById,
    fetchFuncionarioById,
} from '../../service/api';

const ListaUsuariosComAcoes = ({ filialId, filialNome, onSelectUser, loading }) => {
    const [users, setUsers] = useState([]); // Usuários afiliados (enriquecidos)
    const [allUsers, setAllUsers] = useState([]); // Todos os usuários (enriquecidos)
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);

    const loadUsers = async () => {
        if (!filialId) {
            console.log('filialId não fornecido, limpando listas');
            setUsers([]);
            setAllUsers([]);
            setError('Nenhuma filial selecionada');
            return;
        }

        setLoadingUsers(true);
        setError(null);
        
        try {
            console.log('Buscando usuários da filial...');
            const usersResponse = await fetchUsersByFilialId(filialId);
            console.log('Resposta fetchUsersByFilialId:', usersResponse.data);
            const filialUsersRaw = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            console.log(`Total de usuários brutos da filial: ${filialUsersRaw.length}`);

            const enrichedFilialUsers = await enrichUserData(filialUsersRaw);
            console.log('Usuários afiliados enriquecidos:', enrichedFilialUsers);
            console.log(`Total de usuários afiliados enriquecidos: ${enrichedFilialUsers.length}`);
            setUsers(enrichedFilialUsers);

            console.log('Buscando todos os usuários...');
            const allUsersResponse = await fetchUsersNotInFilial(filialId);
            console.log('Resposta fetchUsersNotInFilial:', allUsersResponse.data);
            const allUsersRaw = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
            console.log(`Total de usuários brutos (não afiliados): ${allUsersRaw.length}`);

            const enrichedAllUsers = await enrichUserData(allUsersRaw);
            console.log('Usuários não afiliados enriquecidos:', enrichedAllUsers);
            console.log(`Total de usuários não afiliados: ${enrichedAllUsers.length}`);
            setAllUsers(enrichedAllUsers);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            setError(`Erro ao carregar usuários: ${error.message}`);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Carrega os usuários quando o componente é montado ou quando o filialId muda
    useEffect(() => {
        loadUsers();
    }, [filialId]);

    const enrichUserData = async (userList) => {
        console.log('Usuários brutos recebidos para enriquecimento:', userList);
        if (!Array.isArray(userList) || userList.length === 0) {
            console.warn('Lista de usuários vazia ou inválida');
            return [];
        }

        return Promise.all(
            userList.map(async (user) => {
                try {
                    if (!user || !user.id) {
                        console.warn('Usuário inválido:', user);
                        return null;
                    }
                    if (!user.funcionarioId) {
                        console.warn(`Usuário ${user.id} sem funcionarioId`);
                        return {
                            id: user.id,
                            nome: 'Nome não disponível',
                            userName: user.userName || 'userName não disponível',
                            associado: true,
                            painelPermissoesId: user.painelPermissoesId,
                        };
                    }

                    const funcionario = await fetchFuncionarioById(user.funcionarioId);
                    console.log(`Funcionario para usuário ${user.id}:`, funcionario.data);
                    if (!funcionario.data || !funcionario.data.pessoaId) {
                        console.warn(`Funcionario ${user.funcionarioId} sem pessoaId`);
                        return {
                            id: user.id,
                            nome: 'Nome não disponível',
                            userName: user.userName || 'userName não disponível',
                            associado: true,
                            painelPermissoesId: user.painelPermissoesId,
                        };
                    }

                    const pessoa = await fetchPessoaById(funcionario.data.pessoaId);
                    console.log(`Pessoa para usuário ${user.id}:`, pessoa.data);

                    return {
                        id: user.id,
                        nome: pessoa.data.nome || 'Nome não disponível',
                        userName: user.userName || 'userName não disponível',
                        associado: true,
                        funcionarioId: user.funcionarioId,
                        painelPermissoesId: user.painelPermissoesId,
                    };
                } catch (err) {
                    console.error(`Erro ao enriquecer usuário ${user?.id || 'desconhecido'}:`, err);
                    return {
                        id: user.id,
                        nome: 'Erro ao carregar nome',
                        userName: user.userName || 'Erro ao carregar userName',
                        associado: true,
                        painelPermissoesId: user.painelPermissoesId,
                    };
                }
            })
        ).then(results => results.filter(user => user !== null));
    };


    const handleAddUser = async (userId) => {
        try {
            console.log(`Adicionando usuário ${userId} à filial ${filialId}`);
            await addUserToBranch(filialId, userId);
            message.success('Usuário adicionado à filial com sucesso!');
            await loadUsers();
            setAddModalVisible(false);
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao adicionar usuário à filial';
            message.error(errorMessage);
        }
    };

    const handleRemoveUser = async (userId, userName) => {
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${userName} desta filial?`)) {
            return;
        }
        
        try {
            console.log(`Removendo usuário ${userId} (${userName}) da filial ${filialId}`);
            // Aqui precisamos do painelPermissoesId, não do userId
            // Vamos encontrar o painelPermissoesId correspondente
            const user = users.find(u => u.id === userId);
            if (!user || !user.painelPermissoesId) {
                throw new Error('ID de permissão não encontrado para este usuário');
            }
            
            await removeUserFromBranch(user.painelPermissoesId);
            message.success('Usuário removido da filial com sucesso!');
            await loadUsers();
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao remover usuário da filial';
            message.error(errorMessage);
        }
    };

    return (
        <div>
            <h2>Usuários da Filial {filialNome || `Filial ${filialId}`}</h2>
            
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
            
            <div style={{ marginBottom: '20px' }}>
                <Button 
                    type="primary" 
                    onClick={() => setAddModalVisible(true)}
                    disabled={loadingUsers || loading}
                >
                    Adicionar Usuário
                </Button>
            </div>

            <h3>👥 Usuários Afiliados</h3>
            <Spin spinning={loadingUsers}>
                <List
                    bordered
                    dataSource={users}
                    locale={{ emptyText: 'Nenhum usuário afiliado' }}
                    renderItem={(user) => (
                        <List.Item
                            actions={[
                                <Button 
                                    type="primary" 
                                    onClick={() => {
                                        console.log(`Selecionando usuário ${user.id} para gerenciar permissões`, user);
                                        onSelectUser(user);
                                    }}
                                    disabled={loading}
                                >
                                    Gerenciar Permissões
                                </Button>,
                                <Button 
                                    type="danger" 
                                    onClick={() => handleRemoveUser(user.id, user.userName)}
                                    disabled={loading || !user.painelPermissoesId}
                                >
                                    Remover da Filial
                                </Button>,
                            ]}
                        >
                            <strong>{user.nome}</strong> (@{user.userName})
                            <span style={{ marginLeft: '8px', color: '#52c41a' }}>✓ Associado</span>
                        </List.Item>
                    )}
                />
            </Spin>

            <Modal
                title="Adicionar Usuário à Filial"
                open={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                footer={null}
            >
                <List
                    bordered
                    dataSource={allUsers}
                    locale={{ emptyText: 'Todos os usuários já estão nesta filial' }}
                    renderItem={(user) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="primary"
                                    onClick={() => handleAddUser(user.id)}
                                >
                                    Adicionar
                                </Button>,
                            ]}
                        >
                            <strong>{user.nome}</strong> (@{user.userName})
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default ListaUsuariosComAcoes;