// MenuLateral.js - CORRIGIDO
import React, { useEffect, useState, useContext } from 'react';
import { Menu, Alert } from 'antd';
import { fetchFiliaisByUsuarioId, fetchAllFiliais } from '../../service/api';
import { AuthContext } from '../../contexts/auth';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons';

const MenuLateral = ({ onSelectFilial }) => {
    const { user } = useContext(AuthContext);
    const usuarioId = user?.id;
    const [filiais, setFiliais] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (usuarioId) {
            // Busca todas as filiais e os IDs das filiais do usuário
            Promise.all([
                fetchAllFiliais(),
                fetchFiliaisByUsuarioId(usuarioId),
            ])
                .then(([allFiliaisResponse, userFiliaisResponse]) => {
                    console.log('Todas as filiais:', allFiliaisResponse.data);
                    console.log('IDs das filiais do usuário:', userFiliaisResponse.data);

                    // Garante que allFiliaisResponse.data é um array de objetos { id, nome }
                    const allFiliais = Array.isArray(allFiliaisResponse.data)
                        ? allFiliaisResponse.data.filter(filial => filial && filial.id && filial.nome)
                        : [];

                    // Garante que userFiliaisResponse.data é um array de IDs
                    const userFilialIds = Array.isArray(userFiliaisResponse.data)
                        ? userFiliaisResponse.data
                        : [];

                    // Filtra apenas as filiais que o usuário tem acesso
                    const filiaisFormatadas = allFiliais
                        .filter(filial => userFilialIds.includes(filial.id))
                        .map(filial => ({
                            id: filial.id,
                            nome: filial.nome || `Filial ${filial.id}`,
                        }));

                    setFiliais(filiaisFormatadas);
                    setError(null);
                })
                .catch(error => {
                    console.error('Erro ao carregar filiais:', error);
                    setError('Não foi possível carregar as filiais. Tente novamente.');
                });
        } else {
            setError('Usuário não autenticado.');
        }
    }, [usuarioId]);

    const menuItems = filiais.map(filial => ({
        key: filial.id.toString(),
        label: filial.nome,
        icon: <ShopOutlined />,
    }));

    return (
        <div>
            {error && <Alert message={error} type="error" showIcon style={{ margin: '16px' }} />}
            <Menu
                mode="inline"
                items={[
                    { key: 'home', label: 'Início', icon: <HomeOutlined /> },
                    ...menuItems,
                ]}
                onClick={(e) => {
                    const filialId = e.key === 'home' ? null : parseInt(e.key);
                    onSelectFilial(filialId);
                }}
                style={{ height: '100%', borderRight: 0 }}
            />
        </div>
    );
};

export default MenuLateral;