import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { AuthContext } from '../../contexts/auth';

import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';

import {
    DashboardOutlined,
    UserOutlined,
    UserAddOutlined,
    CalendarOutlined,
    OrderedListOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';

function PainelAdmissao({ children }) {
    const [menu, setmenu] = useState([]);

    useEffect(() => {
        let items = [
            {
                key: '/admin/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashbord',
            },
            {
                key: '/admin/paciente',
                icon: <UserAddOutlined />,
                label: 'Paciente',
            },
            {
                key: '/agenda',
                icon: <CalendarOutlined />,
                label: 'Agendamento',
            },
            {
                key: '#',
                icon: <OrderedListOutlined />,
                label: 'Relatorios',
            },
            {
                key: '6',
                icon: <UserOutlined />,
                label: 'Perfil',
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

export default PainelAdmissao;
