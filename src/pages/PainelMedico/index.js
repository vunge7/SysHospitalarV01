import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { AuthContext } from '../../contexts/auth';

import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';

import { HomeFilled, PoweroffOutlined } from '@ant-design/icons';

function PainelMedico({ children }) {
    const [menu, setmenu] = useState([]);

    useEffect(() => {
        let items;

        items = [
            {
                key: '/medico/dashboard',
                icon: <HomeFilled />,
                label: 'Dashboard',
            },
            {
                key: '/medico/consulta',
                icon: <HomeFilled />,
                label: 'Consultas',
            },
            {
                key: '/medico/bu',
                icon: <HomeFilled />,
                label: 'Banco de Urgência',
            },
            {
                key: '/medico/internamento',
                icon: <HomeFilled />,
                label: 'Internamento',
            },
            {
                key: '/medico/cirurgia',
                icon: <HomeFilled />,
                label: 'Cirurgia',
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
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onClick = ({ key }) => {
        if (key === '/logout') {
            logout();
        } else navigate(key);
    };

    return (
        <div
            style={{
                width: collapsed ? 80 : 250,
                transition: 'width 0.3s ease-in-out',
                padding: 10,
                height: 'auto',
                overflow: 'hidden',
            }}
        >
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

export default PainelMedico;
