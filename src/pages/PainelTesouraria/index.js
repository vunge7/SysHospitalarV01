import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Button } from 'antd';
import { 
    DashboardOutlined, 
    SwapOutlined, 
    FileDoneOutlined, 
    FileTextOutlined, 
    PoweroffOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';
import DashboardTesouraria from './Dashboard';
import MovimentosTesouraria from './Movimentos';
import FechosTesouraria from './Fechos';
import RelatoriosTesouraria from './Relatorios';

function PainelTesouraria() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const menu = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'movimentos', icon: <SwapOutlined />, label: 'Movimentos' },
    { key: 'fechos', icon: <FileDoneOutlined />, label: 'Fechos' },
    { key: 'relatorios', icon: <FileTextOutlined />, label: 'Relatórios' },
    { key: 'sair', icon: <PoweroffOutlined />, label: 'Sair', danger: true },
  ];

  const handleTabClick = ({ key }) => {
    setActiveTab(key);
    if (key === 'sair') navigate('/logout');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTesouraria />;
      case 'movimentos':
        return <MovimentosTesouraria />;
      case 'fechos':
        return <FechosTesouraria />;
      case 'relatorios':
        return <RelatoriosTesouraria />;
      default:
        return <div>Selecione uma opção no menu.</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
      <Cabecario />
      <div style={{ width: 'auto', display: 'flex', flexDirection: 'row', flex: 1 }}>
        <SideMenu menu={menu} onClick={handleTabClick} />
        <Content>{renderContent()}</Content>
      </div>
      <Rodape />
    </div>
  );
}

function SideMenu({ menu, onClick }) {
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                onClick={onClick}
                defaultSelectedKeys={['dashboard']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="light"
                inlineCollapsed={collapsed}
                items={menu}
            />
        </div>
    );
}

function Content({ children }) {
    return <div style={{ marginTop: 10, marginLeft: 50, width: '100%' }}>{children}</div>;
}

export default PainelTesouraria; 