// MenuLateral.js - CORRIGIDO
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Menu, Alert, Button } from 'antd';
import { fetchFiliaisByUsuarioId, fetchAllFiliais } from '../../service/api';
import { AuthContext } from '../../contexts/auth';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons';

const MenuLateral = ({ onSelectFilial, selectedFilial }) => {
    const { user } = useContext(AuthContext);
    const isAdmin = String(user?.tipo).toUpperCase() === 'ADMINISTRATIVO';
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

                    // Garante que allFiliaisResponse.data é um array de objetos com id (nome pode faltar)
                    const allFiliais = Array.isArray(allFiliaisResponse.data)
                        ? allFiliaisResponse.data.filter(filial => filial && filial.id)
                        : [];

                    // Normaliza userFiliaisResponse para array de IDs (pode vir como objetos ou números/strings)
                    const userFilialIds = Array.isArray(userFiliaisResponse.data)
                        ? userFiliaisResponse.data
                            .map(item => (typeof item === 'object' ? (item.id ?? item.filialId ?? item.empresaId ?? item?.filial?.id) : item))
                            .filter(id => id !== undefined && id !== null)
                            .map(id => String(id))
                        : [];

                    // Mapeia todas as filiais, marcando acesso do usuário
                    const filiaisFormatadas = allFiliais
                        .map(filial => ({
                            id: filial.id,
                            nome: filial.nome || filial.descricao || `Filial ${filial.id}`,
                            // empresaId nos endpoints é o id da própria filial
                            empresaId: filial.id,
                            hasAccess: isAdmin ? true : userFilialIds.includes(String(filial.id))
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

    // Reordena para colocar a filial selecionada no topo
    const orderedFiliais = useMemo(() => {
        if (!selectedFilial) return filiais;
        const sel = filiais.find(f => f.id === selectedFilial.id);
        const rest = filiais.filter(f => f.id !== selectedFilial.id);
        return sel ? [sel, ...rest] : filiais;
    }, [filiais, selectedFilial]);

    const menuItems = orderedFiliais.map(filial => ({
        key: filial.id.toString(),
        label: (isAdmin || filial.hasAccess) ? filial.nome : `${filial.nome} (sem acesso)`,
        icon: <ShopOutlined />,
        disabled: isAdmin ? false : !filial.hasAccess,
        filial: filial // Adiciona o objeto filial completo
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
                selectedKeys={selectedFilial?.id ? [String(selectedFilial.id)] : []}
                onClick={(e) => {
                    if (e.key === 'home') {
                        onSelectFilial(null);
                    } else {
                        const filialSelecionada = filiais.find(f => f.id.toString() === e.key);
                        onSelectFilial(filialSelecionada);
                    }
                }}
                style={{ height: '100%', borderRight: 0 }}
            />
        </div>
    );
};

export default MenuLateral;