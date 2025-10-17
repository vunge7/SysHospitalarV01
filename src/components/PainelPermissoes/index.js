import React, { useState, useEffect, useContext } from 'react';
import { Layout, Select, List, Button, Spin, Alert } from 'antd';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import MenuLateral from './MenuLateral';
import {
    fetchFiliaisByUsuarioId,
    fetchUsersByFilialId,
    fetchPermissions,
    fetchUserPermissions,
    assignPermissionToUser,
    removePermissionFromUser,
} from '../../service/api';
import { AuthContext } from '../../contexts/auth';

const { Sider, Content } = Layout;
const { Option } = Select;

const PainelPermissoes = () => {
    const { user } = useContext(AuthContext);
    const usuarioId = user?.id;

    const [filiais, setFiliais] = useState([]);
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [selectedFilial, setSelectedFilial] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch branches on mount
    useEffect(() => {
        if (usuarioId) {
            setLoading(true);
            fetchFiliaisByUsuarioId(usuarioId)
                .then((response) => {
                    console.log('Filiais carregadas:', response.data); // Log para depuração
                    // Mapeia os dados para garantir que sejam objetos com id e nome
                    const filiaisFormatadas = response.data.map((filial) =>
                        typeof filial === 'object'
                            ? filial
                            : { id: filial, nome: `Filial ${filial}` } // Cria um nome genérico se for apenas um número
                    );
                    setFiliais(filiaisFormatadas);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Erro ao carregar filiais:', error);
                    setError('Falha ao carregar filiais. Tente novamente.');
                })
                .finally(() => setLoading(false));
        } else {
            console.error('Erro: usuarioId está indefinido.');
            setError('Erro: usuário não está autenticado.');
        }
    }, [usuarioId]);

    // Fetch users when a branch is selected
    useEffect(() => {
        if (selectedFilial) {
            setLoading(true);
            console.log('Filial selecionada:', selectedFilial); // Log para depuração
            fetchUsersByFilialId(selectedFilial)
                .then((response) => {
                    console.log('Usuários carregados:', response.data); // Log para depuração
                    setUsers(response.data);
                    setSelectedUser(null);
                    setUserPermissions([]);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Erro ao carregar usuários:', error);
                    setError('Falha ao carregar usuários. Tente novamente.');
                })
                .finally(() => setLoading(false));
        }
    }, [selectedFilial]);

    // Fetch permissions and user permissions when a user is selected
    useEffect(() => {
        if (selectedUser && selectedFilial) {
            setLoading(true);
            Promise.all([
                fetchPermissions(),
                fetchUserPermissions(selectedUser, selectedFilial),
            ])
                .then(([permissionsResponse, userPermissionsResponse]) => {
                    console.log('Permissões carregadas:', permissionsResponse.data); // Log para depuração
                    console.log('Permissões do usuário carregadas:', userPermissionsResponse.data); // Log para depuração
                    setPermissions(permissionsResponse.data);
                    setUserPermissions(userPermissionsResponse.data);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Erro ao carregar permissões:', error);
                    setError('Falha ao carregar permissões. Tente novamente.');
                })
                .finally(() => setLoading(false));
        }
    }, [selectedUser, selectedFilial]);

    const handleAssignPermission = (permissionId) => {
        setLoading(true);
        assignPermissionToUser(selectedUser, selectedFilial, permissionId)
            .then(() => {
                const permission = permissions.find((p) => p.id === permissionId);
                setUserPermissions([...userPermissions, permission]);
                setError(null);
            })
            .catch((error) => {
                console.error('Erro ao atribuir permissão:', error);
                setError('Falha ao atribuir permissão. Tente novamente.');
            })
            .finally(() => setLoading(false));
    };

    const handleRemovePermission = (permissionId) => {
        setLoading(true);
        removePermissionFromUser(selectedUser, selectedFilial, permissionId)
            .then(() => {
                setUserPermissions(userPermissions.filter((p) => p.id !== permissionId));
                setError(null);
            })
            .catch((error) => {
                console.error('Erro ao remover permissão:', error);
                setError('Falha ao remover permissão. Tente novamente.');
            })
            .finally(() => setLoading(false));
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Cabecario />
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <MenuLateral onSelectFilial={setSelectedFilial} />
                </Sider>
                <Content style={{ padding: '20px' }}>
                    <Spin spinning={loading} tip="Carregando...">
                        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}
                        {!selectedFilial ? (
                            <h2>Selecione uma filial no menu lateral "TEM BUG"</h2>
                        ) : (
                            <>
                                <h1>Gerenciador de Permissões</h1>
                                <div style={{ marginBottom: '20px' }}>
                                    <label>Filial:</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Selecione uma filial"
                                        onChange={(value) => setSelectedFilial(value)}
                                        value={selectedFilial || undefined}
                                    >
                                        {filiais.map((filial) => (
                                            <Option key={filial.id} value={filial.id}>
                                                {filial.nome}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                {selectedFilial && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label>Usuário:</label>
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione um usuário"
                                            onChange={(value) => setSelectedUser(value)}
                                            value={selectedUser || undefined}
                                        >
                                            {users.map((user) => (
                                                <Option key={user.id} value={user.id}>
                                                    {user.nome}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                                {selectedUser && (
                                    <div>
                                        <h2>Permissões Disponíveis</h2>
                                        <List
                                            bordered
                                            dataSource={permissions}
                                            renderItem={(permission) => (
                                                <List.Item
                                                    actions={[
                                                        !userPermissions.some((p) => p.id === permission.id) && (
                                                            <Button
                                                                type="primary"
                                                                onClick={() => handleAssignPermission(permission.id)}
                                                                disabled={loading}
                                                            >
                                                                Adicionar
                                                            </Button>
                                                        ),
                                                    ]}
                                                >
                                                    {permission.name}
                                                </List.Item>
                                            )}
                                        />
                                        <h2 style={{ marginTop: '20px' }}>Permissões do Usuário</h2>
                                        <List
                                            bordered
                                            dataSource={userPermissions}
                                            renderItem={(permission) => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            type="danger"
                                                            onClick={() => handleRemovePermission(permission.id)}
                                                            disabled={loading}
                                                        >
                                                            Remover
                                                        </Button>,
                                                    ]}
                                                >
                                                    {permission.name}
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </Spin>
                </Content>
            </Layout>
            <Rodape />
        </Layout>
    );
};

export default PainelPermissoes;