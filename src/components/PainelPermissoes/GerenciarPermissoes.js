// GerenciarPermissoes.js - MELHORADO
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { 
    List, 
    Button, 
    Spin, 
    Alert, 
    Card, 
    Input, 
    Modal, 
    Tag, 
    Typography, 
    Tabs
} from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    SearchOutlined, 
    InfoCircleOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import {
    fetchAllPainels,
    fetchUserPermissions,
    addPanelPermission,
    removePanelPermission,
    updatePanelPermission
} from '../../service/api';

const { Text } = Typography;
const { TabPane } = Tabs;

const GerenciarPermissoes = ({ filialId, filialNome, userId, onBack }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [permissions, setPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        action: null,
        permission: null,
        title: '',
        content: ''
    });

    useEffect(() => {
        if (userId && filialId) {
            loadPermissions();
        }
    }, [userId, filialId]);

    const loadPermissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const [panelsRes, userPermissionsRes] = await Promise.all([
                fetchAllPainels(),
                fetchUserPermissions(userId, filialId)
            ]);
            
            // Cria um mapa de painéis para acesso rápido
            const panelsMap = {};
            const formattedPanels = [];
            
            if (Array.isArray(panelsRes.data)) {
                panelsRes.data.forEach(painel => {
                    const panelData = {
                        id: painel.id,
                        name: painel.descricao || `Painel ${painel.id}`,
                        description: painel.observacao || 'Sem descrição fornecida',
                        category: painel.categoria || 'Geral',
                        isAdmin: painel.admin || false,
                        nomePainel: painel.descricao || `Painel ${painel.id}`
                    };
                    panelsMap[painel.id] = panelData;
                    formattedPanels.push(panelData);
                });
            }
            
            setPermissions(formattedPanels);
            
            // Formata as permissões do usuário com as informações completas do painel
            let userPerms = [];
            
            if (Array.isArray(userPermissionsRes.data)) {
                // Primeiro mapeamos as permissões com as informações básicas
                userPerms = userPermissionsRes.data.map(perm => {
                    const painelInfo = panelsMap[perm.painelId] || {};
                    return {
                        ...perm,
                        name: painelInfo.name || `Painel ${perm.painelId}`,
                        description: painelInfo.description || 'Sem descrição',
                        category: painelInfo.category || 'Geral',
                        nomePainel: painelInfo.nomePainel || `Painel: ${perm.painelId}`,
                        isAdmin: painelInfo.isAdmin || false
                    };
                });
            }
                
            setUserPermissions(userPerms);
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            setError('Erro ao carregar permissões. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const showConfirmModal = (action, permission) => {
        const isAdding = action === 'add';
        const permissionName = permission.nomePainel || permission.descricao || `Painel ${permission.id || permission.painelId}`;
        const permissionDescription = permission.description || 'Sem descrição';
        
        setConfirmModal({
            visible: true,
            action,
            permission,
            title: isAdding ? 'Confirmar Adição' : 'Confirmar Remoção',
            content: (
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        {isAdding 
                            ? 'Deseja adicionar a permissão para o usuário?'
                            : 'Deseja remover a permissão do usuário?'
                        }
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{permissionName}</div>
                        {permissionDescription !== 'Sem descrição' && (
                            <div style={{ color: '#666' }}>{permissionDescription}</div>
                        )}
                    </div>
                    <div style={{ marginTop: '16px', color: '#666' }}>
                        {isAdding 
                            ? 'Esta ação concederá acesso ao painel para o usuário.'
                            : 'Esta ação removerá o acesso ao painel do usuário.'
                        }
                    </div>
                </div>
            )
        });
    };

    const handleConfirm = async () => {
        const { action, permission } = confirmModal;
        setConfirmModal({ ...confirmModal, visible: false });
        
        setLoading(true);
        try {
            if (action === 'add') {
                // Adiciona uma nova permissão
                const permissaoDTO = {
                    painelId: permission.id,
                    usuarioId: userId,
                    empresaId: filialId,
                    filialId: filialId, // Adicionando filialId explicitamente
                    ativo: true
                };
                await addPanelPermission(permissaoDTO, currentUser?.id);
            } else {
                // Remove uma permissão existente
                await removePanelPermission(permission.id);
            }
            await loadPermissions();
        } catch (error) {
            console.error(`Erro ao ${action === 'add' ? 'adicionar' : 'remover'} permissão:`, error);
            const errorMessage = error.response?.data?.mensagem || 
                               `Erro ao ${action === 'add' ? 'adicionar' : 'remover'} permissão`;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setConfirmModal({ ...confirmModal, visible: false });
    };

    // Filtra permissões baseado no texto de busca e remove as já atribuídas
    const filteredPermissions = useMemo(() => {
        // Filtra as permissões que ainda não foram atribuídas ao usuário
        const filtered = permissions.filter(p => 
            !userPermissions.some(up => up.painelId === p.id) &&
            (p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
             p.description?.toLowerCase().includes(searchText.toLowerCase()))
        );
        
        // Agrupa por categoria
        const grouped = {};
        filtered.forEach(permission => {
            const category = permission.category || 'Geral';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(permission);
        });
        
        return grouped;
    }, [permissions, userPermissions, searchText]);

    // Agrupa permissões ativas por categoria
    const groupedUserPermissions = useMemo(() => {
        const grouped = {};
        userPermissions.forEach(permission => {
            const category = permission.category || 'Geral';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(permission);
        });
        return grouped;
    }, [userPermissions]);

    const renderPermissionItem = (permission, isAssigned = false) => {
        const permissionName = permission.nomePainel || permission.name || `Painel ${permission.id || permission.painelId}`;
        
        return (
            <List.Item
                actions={[
                    <Button
                        key={permission.id}
                        type={isAssigned ? 'danger' : 'primary'}
                        icon={isAssigned ? <DeleteOutlined /> : <PlusOutlined />}
                        onClick={() => showConfirmModal(
                            isAssigned ? 'remove' : 'add', 
                            permission
                        )}
                        disabled={loading}
                    >
                        {isAssigned ? 'Remover' : 'Adicionar'}
                    </Button>
                ]}
            >
                <List.Item.Meta
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAssigned ? 
                                <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            }
                            <span>{permissionName}</span>
                            {permission.isAdmin && <Tag color="red" style={{ marginLeft: '8px' }}>Admin</Tag>}
                        </div>
                    }
                    description={
                        permission.description && permission.description !== 'Sem descrição' ? (
                            <Text type="secondary" ellipsis={{ rows: 2, expandable: true }}>
                                {permission.description}
                            </Text>
                        ) : null
                    }
                />
            </List.Item>
        );
    };

    return (
        <Spin spinning={loading}>
            {error && (
                <Alert 
                    message="Erro" 
                    description={error} 
                    type="error" 
                    showIcon 
                    style={{ marginBottom: 16 }} 
                />
            )}
            
            <div style={{ marginBottom: 16 }}>
                <Button 
                    type="default" 
                    onClick={onBack}
                    icon={<ArrowLeftOutlined />}
                >
                    Voltar para a lista de usuários
                </Button>
            </div>

            <Tabs defaultActiveKey="1">
                <TabPane tab="Permissões Ativas" key="1">
                    <List
                        itemLayout="horizontal"
                        dataSource={Object.entries(groupedUserPermissions)}
                        renderItem={([category, perms]) => (
                            <div key={category} style={{ marginBottom: 24 }}>
                                <h3>{category}</h3>
                                <List
                                    dataSource={perms}
                                    renderItem={perm => renderPermissionItem(perm, true)}
                                />
                            </div>
                        )}
                        locale={{ emptyText: 'Nenhuma permissão ativa' }}
                    />
                </TabPane>
                <TabPane tab="Adicionar Permissões" key="2">
                    <Input
                        placeholder="Buscar painéis..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    {Object.entries(filteredPermissions).map(([category, perms]) => (
                        <div key={category} style={{ marginBottom: 24 }}>
                            <h3>{category}</h3>
                            <List
                                dataSource={perms}
                                renderItem={perm => renderPermissionItem(perm, false)}
                            />
                        </div>
                    ))}
                    {Object.keys(filteredPermissions).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                            <Text type="secondary">
                                Nenhum painel encontrado. Tente alterar o termo de busca.
                            </Text>
                        </div>
                    )}
                </TabPane>
            </Tabs>

            <Modal
                title={confirmModal.title}
                visible={confirmModal.visible}
                onOk={handleConfirm}
                onCancel={handleCancel}
                okText={confirmModal.action === 'add' ? 'Adicionar' : 'Remover'}
                cancelText="Cancelar"
                confirmLoading={loading}
                okButtonProps={{
                    type: confirmModal.action === 'add' ? 'primary' : 'danger',
                    icon: confirmModal.action === 'add' ? <PlusOutlined /> : <DeleteOutlined />
                }}
            >
                {confirmModal.content}
                {confirmModal.action === 'remove' && (
                    <div style={{ color: '#ff4d4f', marginTop: 16 }}>
                        <InfoCircleOutlined /> Esta ação removerá a permissão do usuário.
                    </div>
                )}
            </Modal>
        </Spin>
    );
};

export default GerenciarPermissoes;