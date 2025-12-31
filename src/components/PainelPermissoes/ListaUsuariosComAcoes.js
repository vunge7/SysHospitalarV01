// ListaUsuariosComAcoes.js - ATUALIZADO
import React, { useEffect, useState, useContext } from 'react';
import { List, Button, Spin, Alert, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { 
    fetchUsersByFilialId,
    fetchUsersNotInFilial,
    addUserToBranch,
    removeUserFromBranch,
    fetchPessoaById,
    fetchFuncionarioById,
    fetchAllFiliais,
    fetchUserPermissions,
} from '../../service/api';
import { AuthContext } from '../../contexts/auth';

const ListaUsuariosComAcoes = ({ filialId, filialNome, empresaId, onSelectUser, loading }) => {
    const [users, setUsers] = useState([]); // Usuários afiliados (enriquecidos)
    const [allUsers, setAllUsers] = useState([]); // Todos os usuários (enriquecidos)
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const { user: loggedUser } = useContext(AuthContext);
    const loggedUserId = loggedUser?.id;

    const resolveEmpresaId = async () => {
        let empresaIdToUse = empresaId;
        if (!empresaIdToUse) {
            try {
                const allFiliaisResponse = await fetchAllFiliais();
                const allFiliais = Array.isArray(allFiliaisResponse.data) ? allFiliaisResponse.data : [];
                console.log('ResolveEmpresaId - allFiliais length:', allFiliais.length, 'filialId alvo:', filialId);
                const filial = allFiliais.find(f => {
                    if (!f) return false;
                    const fid = f.id ?? f.filialId ?? f?.filial?.id;
                    return String(fid) === String(filialId);
                });
                empresaIdToUse = filial?.empresaId || filial?.empresa?.id || filial?.empresaID || filial?.empresaMatrizId;
                console.log('ResolveEmpresaId - empresaId:', empresaIdToUse, 'filial encontrada:', filial);
            } catch (e) {
                console.warn('ResolveEmpresaId - falha ao buscar filiais:', e);
            }
        }
        return empresaIdToUse;
    };

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
            const empresaIdResolved = await resolveEmpresaId();
            if (!empresaIdResolved) {
                throw new Error('Não foi possível determinar o ID da empresa para a filial selecionada');
            }
            console.log('Buscando usuários da filial...');
            const usersResponse = await fetchUsersByFilialId(empresaIdResolved);
            console.log('Resposta fetchUsersByFilialId:', usersResponse.data);
            const filialUsersRaw = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            console.log(`Total de usuários brutos da filial: ${filialUsersRaw.length}`);

            const enrichedFilialUsers = await enrichUserData(filialUsersRaw);
            console.log('Usuários afiliados enriquecidos:', enrichedFilialUsers);
            console.log(`Total de usuários afiliados enriquecidos: ${enrichedFilialUsers.length}`);
            setUsers(enrichedFilialUsers);

            console.log('Buscando todos os usuários...');
            const allUsersResponse = await fetchUsersNotInFilial(empresaIdResolved);
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
            let empresaIdToUse = await resolveEmpresaId();
            console.log(`Tentando adicionar usuário ${userId} à filial ${filialId} na empresa ${empresaIdToUse}`);
            
            if (!empresaIdToUse) {
                // Fallback: tentar resolver empresaId a partir do filialId
                try {
                    const allFiliaisResponse = await fetchAllFiliais();
                    const allFiliais = Array.isArray(allFiliaisResponse.data) ? allFiliaisResponse.data : [];
                    console.log('Fallback allFiliais length:', allFiliais.length, 'filialId alvo:', filialId);
                    const filial = allFiliais.find(f => {
                        if (!f) return false;
                        const fid = f.id ?? f.filialId ?? f?.filial?.id;
                        return String(fid) === String(filialId);
                    });
                    empresaIdToUse = filial?.empresaId || filial?.empresa?.id || filial?.empresaID || filial?.empresaMatrizId;
                    console.log('empresaId resolvido via fallback:', empresaIdToUse, 'filial encontrada:', filial);
                } catch (e) {
                    console.warn('Falha ao buscar filiais para resolver empresaId:', e);
                }

                if (!empresaIdToUse) {
                    throw new Error('ID da empresa não fornecido');
                }
            }
            
            await addUserToBranch(filialId, userId, empresaIdToUse);
            message.success('Usuário adicionado à filial com sucesso!');
            await loadUsers();
            setAddModalVisible(false);
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao adicionar usuário à filial';
            message.error(errorMessage);
        }
    };

    const handleRemoveUser = (userId, userName) => {
        if (String(userId) === String(loggedUserId)) {
            message.warning('Você não pode remover a si mesmo desta filial.');
            return;
        }

        Modal.confirm({
            title: 'Remover usuário da filial',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    Tem certeza que deseja remover <strong>{userName}</strong> desta filial?
                </div>
            ),
            okText: 'Remover',
            okType: 'danger',
            cancelText: 'Cancelar',
            centered: true,
            onOk: async () => {
                try {
                    const empresaIdResolved = await resolveEmpresaId();
                    if (!empresaIdResolved) {
                        throw new Error('Não foi possível determinar o ID da empresa para remoção');
                    }
                    console.log(`Removendo usuário ${userId} (${userName}) da filial ${filialId} (empresa ${empresaIdResolved})`);

                    // Buscar todas as permissões do usuário nesta empresa (filial)
                    const permsResp = await fetchUserPermissions(userId, empresaIdResolved);
                    const perms = Array.isArray(permsResp.data) ? permsResp.data : [];
                    if (!perms.length) {
                        throw new Error('Nenhuma permissão encontrada para este usuário nesta filial');
                    }

                    // Remover TODAS as permissões encontradas
                    const results = await Promise.allSettled(
                        perms
                            .map(p => p?.id)
                            .filter(id => !!id)
                            .map(id => removeUserFromBranch(id))
                    );

                    const successCount = results.filter(r => r.status === 'fulfilled').length;
                    const failCount = results.length - successCount;
                    if (successCount > 0 && failCount === 0) {
                        message.success(`Removido com sucesso (${successCount}) permissão(ões).`);
                    } else if (successCount > 0 && failCount > 0) {
                        message.warning(`Removidas ${successCount} permissão(ões), ${failCount} falha(s).`);
                    } else {
                        throw new Error('Falha ao remover permissões do usuário');
                    }
                    await loadUsers();
                } catch (error) {
                    console.error('Erro ao remover usuário:', error);
                    const errorMessage = error.response?.data?.message || error.message || 'Erro ao remover usuário da filial';
                    message.error(errorMessage);
                }
            }
        });
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
                    rowKey={(user) => String(user.id)}
                    locale={{ emptyText: 'Nenhum usuário afiliado' }}
                    renderItem={(user) => (
                        <List.Item
                            actions={[
                                <Button 
                                    key={`manage-${user.id}`}
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
                                    key={`remove-${user.id}`}
                                    type="danger" 
                                    onClick={() => handleRemoveUser(user.id, user.userName)}
                                    disabled={loading}
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
                    rowKey={(user) => String(user.id)}
                    locale={{ emptyText: 'Todos os usuários já estão nesta filial' }}
                    renderItem={(user) => (
                        <List.Item
                            actions={[
                                <Button
                                    key={`add-${user.id}`}
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