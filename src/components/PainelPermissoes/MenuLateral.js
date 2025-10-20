import React, { useEffect, useState, useContext } from 'react';
import { Menu } from 'antd';
import { fetchFiliaisByUsuarioId } from '../../service/api';
import { AuthContext } from '../../contexts/auth';
import { HomeOutlined, ShopOutlined } from '@ant-design/icons'; // Exemplos de ícones do Ant Design

const MenuLateral = ({ onSelectFilial }) => {
    const { user } = useContext(AuthContext);
    const usuarioId = user?.id;

    const [filiais, setFiliais] = useState([]);

    useEffect(() => {
        if (usuarioId) {
            fetchFiliaisByUsuarioId(usuarioId)
                .then(response => {
                    const filiaisFormatadas = response.data.map(filial =>
                        typeof filial === 'object'
                            ? filial
                            : { id: filial, nome: `Filial ${filial}` }
                    );
                    setFiliais(filiaisFormatadas);
                })
                .catch(error => console.error('Erro ao carregar filiais:', error));
        } else {
            console.error('Erro: usuarioId está indefinido.');
        }
    }, [usuarioId]);

    const menuItems = filiais.map(filial => ({
        key: filial.id.toString(), // Garante que o key seja uma string
        label: filial.nome,
        icon: <ShopOutlined />, // Ícone para cada filial
    }));

    return (
        <Menu
            mode="inline"
            items={[
                { key: 'home', label: 'Início', icon: <HomeOutlined /> }, // Item fixo para "Início"
                ...menuItems, // Adiciona as filiais com ícones
            ]}
            onClick={(e) => onSelectFilial(e.key)} // Passa o key (id da filial) como string
            style={{ height: '100%', borderRight: 0 }}
        />
    );
};

export default MenuLateral;
