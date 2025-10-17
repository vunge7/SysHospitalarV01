import React, { useEffect, useState } from 'react';
import { List, Button } from 'antd';
import { fetchUsersByFilialId } from '../../service/api';

const ListaUsuarios = ({ filialId, onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsersByFilialId(filialId)
            .then(response => setUsers(response.data))
            .catch(error => console.error('Erro ao carregar usuários:', error));
    }, [filialId]);

    return (
        <div>
            <h2>Usuários da Filial</h2>
            <List
                bordered
                dataSource={users}
                renderItem={(user) => (
                    <List.Item
                        actions={[
                            <Button type="primary" onClick={() => onSelectUser(user.id)}>
                                Gerenciar Permissões
                            </Button>,
                        ]}
                    >
                        {user.nome} {user.associado ? '(Associado)' : '(Não Associado)'}
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ListaUsuarios;
