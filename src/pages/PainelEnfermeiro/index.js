import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { AuthContext } from '../../contexts/auth';

import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeFilled,
    PoweroffOutlined,
} from '@ant-design/icons';

function PainelEnfermeiro({ children }) {
    const [menu, setmenu] = useState([]);

    useEffect(() => {
        let items;

        items = [
            {
                key: '/enf',
                icon: <HomeFilled />,
                label: 'Home',
            },
            {
                key: '/enf/triagem',
                icon: <HomeFilled />,
                label: 'Triagem',
            },
            {
                key: '/enf/so',
                icon: <HomeFilled />,
                label: 'Sala de Obersavação',
            },
            {
                key: '/enf/bo',
                icon: <HomeFilled />,
                label: 'Bloco Operatório',
            },
            {
                key: '/enf/ce',
                icon: <HomeFilled />,
                label: 'Consultas Externas',
            },
            {
                key: '/enf/pc',
                icon: <HomeFilled />,
                label: 'Permanência de Cirurgua',
            },
            {
                key: '/logout',
                icon: <PoweroffOutlined />,
                label: 'Signout',
                danger: true,
            },
        ];

        setmenu([...items]);
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                height: '100vh',
            }}
        >
            <Cabecario />
            <div
                style={{
                    width: 'auto',
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                }}
            >
                <SideMenu menu={menu} />
                <Content>{children}</Content>
            </div>
            <Rodape />
        </div>
    );
}

function SideMenu(props) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const onClick = ({ key }) => {
        if (key === '/logout') {
            logout();
        } else navigate(key);
    };
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div style={{ width: collapsed ? 80 : 250, transition: 'width 0.3s ease-in-out', padding: 10, height: 'auto', overflow: 'hidden' }}>
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{
                    marginBottom: 16,
                }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>

            <Menu
                onClick={({ key }) => onClick({ key })}
                defaultSelectedKeys={[window.location.pathname]}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="light"
                inlineCollapsed={collapsed}
                items={props.menu}
            />
        </div>
    );
}

function Content({ children }) {
    return <div style={{ marginTop: 10, marginLeft: 50 }}>{children}</div>;
}

export default PainelEnfermeiro;
