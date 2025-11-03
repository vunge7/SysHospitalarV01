import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { AuthContext } from '../contexts/auth';
import Cabecario from '../components/Cabecario';
import Rodape from '../components/Rodape';
import './MainLayout.css';

const { Header, Sider, Content, Footer } = Layout;

// Menu padrão que será usado quando nenhum menu for especificado
const defaultMenu = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Perfil',
    path: '/profile'
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Sair',
    danger: true
  }
];

const MainLayout = ({ children, menuItems, headerContent, footerContent }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Combina o menu padrão com os itens personalizados, se fornecidos
  const menuToRender = menuItems || defaultMenu;

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    const menuItem = menuToRender.find(item => item.key === key);
    if (menuItem?.path) {
      navigate(menuItem.path);
    }
  };

  // Encontra a chave do item ativo com base no caminho atual
  const findActiveKey = () => {
    const currentPath = location.pathname;
    const activeItem = menuToRender.find(item => 
      item.path && currentPath.startsWith(item.path)
    );
    return activeItem ? [activeItem.key] : [];
  };

  // Efeito para detectar mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Menu Lateral */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 10,
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.15)'
        }}
        className="site-layout-sider"
      >
        <div className="logo">
          {collapsed ? 'HP' : 'HOSPITAL PRO'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={findActiveKey()}
          items={menuToRender}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            marginTop: '16px'
          }}
        />
      </Sider>
      
      <Layout 
        className="site-layout"
        style={{ 
          marginLeft: collapsed ? 80 : 250,
          transition: 'all 0.2s',
          minHeight: '100vh',
          background: '#f0f2f5',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {/* Cabeçalho */}
        <Header className="main-header">
          <Cabecario />
        </Header>
        
        {/* Conteúdo */}
        <Content className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
        
        {/* Rodapé */}
        <Layout.Footer className="main-footer">
          <Rodape />
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
