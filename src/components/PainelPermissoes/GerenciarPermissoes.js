// GerenciarPermissoes.js - MELHORADO
import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Alert, Card } from 'antd';
import {
    fetchPermissions,
    fetchUserPermissions,
    assignPermissionToUser,
    removePermissionFromUser,
} from '../../service/api';

const GerenciarPermissoes = ({ filialId, userId, onBack }) => {
    const [permissions, setPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId && filialId) {
            loadPermissions();
        }
    }, [userId, filialId]);

    const loadPermissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const [permissionsRes, userPermissionsRes] = await Promise.all([
                fetchPermissions(),
                fetchUserPermissions(userId, filialId)
            ]);
            
            setPermissions(Array.isArray(permissionsRes.data) ? permissionsRes.data : []);
            setUserPermissions(Array.isArray(userPermissionsRes.data) ? userPermissionsRes.data : []);
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            setError('Erro ao carregar permissões');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignPermission = async (permissionId) => {
        setLoading(true);
        try {
            await assignPermissionToUser(userId, filialId, permissionId);
            await loadPermissions(); // Recarrega para sincronizar
        } catch (error) {
            console.error('Erro ao atribuir permissão:', error);
            setError('Erro ao atribuir permissão');
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePermission = async (permissionId) => {
        setLoading(true);
        try {
            await removePermissionFromUser(userId, filialId, permissionId);
            await loadPermissions(); // Recarrega para sincronizar
        } catch (error) {
            console.error('Erro ao remover permissão:', error);
            setError('Erro ao remover permissão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading}>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Button onClick={onBack}>← Voltar para Usuários</Button>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Permissões Disponíveis */}
                <Card title="➕ Permissões Disponíveis" style={{ flex: 1 }}>
                    <List
                        bordered
                        dataSource={permissions.filter(p => 
                            !userPermissions.some(up => up.id === p.id)
                        )}
                        locale={{ emptyText: 'Nenhuma permissão disponível para adicionar' }}
                        renderItem={(permission) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        onClick={() => handleAssignPermission(permission.id)}
                                    >
                                        Adicionar
                                    </Button>,
                                ]}
                            >
                                {permission.name || `Permissão ${permission.id}`}
                            </List.Item>
                        )}
                    />
                </Card>

                {/* Permissões do Usuário */}
                <Card title="✅ Permissões Ativas" style={{ flex: 1 }}>
                    <List
                        bordered
                        dataSource={userPermissions}
                        locale={{ emptyText: 'Nenhuma permissão atribuída' }}
                        renderItem={(permission) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="danger"
                                        onClick={() => handleRemovePermission(permission.id)}
                                    >
                                        Remover
                                    </Button>,
                                ]}
                            >
                                {permission.name || `Permissão ${permission.id}`}
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </Spin>
    );
};

export default GerenciarPermissoes;