import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import { DashboardOutlined, SwapOutlined, FileDoneOutlined, FileTextOutlined, PoweroffOutlined } from '@ant-design/icons';
import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';
import DashboardTesouraria from './Dashboard';
import MovimentosTesouraria from './Movimentos';
import FechosTesouraria from './Fechos';
import RelatoriosTesouraria from './Relatorios';

const { Sider, Content } = Layout;

function PainelTesouraria() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Cabecario />
      <Layout style={{ flex: 1 }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={220} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            theme="light"
            items={menu}
            selectedKeys={[activeTab]}
            onClick={handleTabClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ padding: 24, background: '#fff', flex: 1, minHeight: 0 }}>{renderContent()}</Content>
      </Layout>
      <Rodape />
    </div>
  );
}

export default PainelTesouraria; 