import React, { useEffect, useState } from 'react';
import { List, Button } from 'antd';
import {
    fetchPermissions,
    fetchUserPermissions,
    assignPermissionToUser,
    removePermissionFromUser,
} from '../../service/api';

const GerenciarPermissoes = ({ filialId, userId }) => {
    const [permissions, setPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);

    useEffect(() => {
        fetchPermissions()
            .then(response => setPermissions(response.data))
            .catch(error => console.error('Erro ao carregar permissões:', error));

        fetchUserPermissions(userId, filialId)
            .then(response => setUserPermissions(response.data))
            .catch(error => console.error('Erro ao carregar permissões do usuário:', error));
    }, [userId, filialId]);

    const handleAssignPermission = (permissionId) => {
        assignPermissionToUser(userId, filialId, permissionId)
            .then(() => setUserPermissions([...userPermissions, { id: permissionId }]))
            .catch(error => console.error('Erro ao atribuir permissão:', error));
    };

    const handleRemovePermission = (permissionId) => {
        removePermissionFromUser(userId, filialId, permissionId)
            .then(() => setUserPermissions(userPermissions.filter(p => p.id !== permissionId)))
            .catch(error => console.error('Erro ao remover permissão:', error));
    };

    return (
        <div>
            <h2>Permissões Disponíveis</h2>
            <List
                bordered
                dataSource={permissions}
                renderItem={(permission) => (
                    <List.Item
                        actions={[
                            !userPermissions.some(p => p.id === permission.id) && (
                                <Button
                                    type="primary"
                                    onClick={() => handleAssignPermission(permission.id)}
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
    );
};

export default GerenciarPermissoes;
