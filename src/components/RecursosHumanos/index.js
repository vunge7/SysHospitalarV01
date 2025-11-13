import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, Card, Typography } from 'antd';
import { api } from '../../service/api';
import Ficha from './Ficha';
import ListarRecursosHumanos from './ListarRecursosHumanos';
import './RecursosHumanos.css';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UnorderedListOutlined,
  UserOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../contexts/auth';

const { Title } = Typography;

function RecursosHumanos() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recursosHumanos, setRecursosHumanos] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [menu, setMenu] = useState([]);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const fetchRecursosHumanos = async () => {
    // Endpoint ainda não existe; evitar 404
    setRecursosHumanos([]);
  };

  const fetchPerfis = async () => {
    // Endpoint ainda não existe; evitar 404
    setPerfis([]);
  };

  const fetchPessoas = async () => {
    try {
      const response = await api.get('pessoa/all');
      setPessoas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
    }
  };

  const fetchAllData = async () => {
    // Temporariamente, só busca pessoas; demais endpoints ainda não existem no backend
    try {
      await fetchPessoas();
    } finally {
      setRecursosHumanos([]);
      setPerfis([]);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const items = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: 'ficha',
        icon: <UserAddOutlined />,
        label: 'Ficha',
      },
      {
        key: 'listar-recursos-humanos',
        icon: <UnorderedListOutlined />,
        label: 'Listar Recursos Humanos',
      },
      {
        key: 'perfil',
        icon: <UserOutlined />,
        label: 'Perfil',
      },
      {
        key: 'sair',
        icon: <PoweroffOutlined />,
        label: 'Sair',
        className: 'menu-item-danger',
      },
    ];
    setMenu(items);
  }, []);

  const handleTabClick = ({ key }) => {
    setActiveTab(key);
    if (key === 'sair') {
      logout();
    }
  };

  return (
    <div className="rh-master">
      <Cabecario />

      <div className="rh-body">
        <SideMenu
          menu={menu}
          activeTab={activeTab}
          onClick={handleTabClick}
        />

        <div className="rh-content-wrapper">
          <Card className="rh-card-principal">
            <div className="rh-header">
              <Title level={2} className="rh-titulo">
                <DashboardOutlined style={{ marginRight: 12, color: '#2563eb' }} />
                Recursos Humanos
              </Title>
            </div>

            <div className="rh-content">
              {activeTab === 'ficha' && (
                <Ficha
                  recursosHumanos={recursosHumanos}
                  perfis={perfis}
                  pessoas={pessoas}
                  setRecursosHumanos={setRecursosHumanos}
                  setActiveTab={setActiveTab}
                  fetchAllData={fetchAllData}
                />
              )}
              {activeTab === 'listar-recursos-humanos' && (
                <ListarRecursosHumanos
                  recursosHumanos={recursosHumanos}
                  perfis={perfis}
                  pessoas={pessoas}
                  setRecursosHumanos={setRecursosHumanos}
                  setActiveTab={setActiveTab}
                  fetchRecursosHumanos={fetchRecursosHumanos}
                  fetchAllData={fetchAllData}
                />
              )}
              {activeTab === 'perfil' && (
                <div className="rh-placeholder">
                  <Title level={3}>Seu Perfil</Title>
                  <p>Em desenvolvimento...</p>
                </div>
              )}
              {activeTab === 'dashboard' && (
                <div className="rh-placeholder">
                  <Title level={3}>Dashboard</Title>
                  <p>Em desenvolvimento...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Rodape />
    </div>
  );
}

// === MENU LATERAL 100% IGUAL TRIAGEM (COMPACTO, ALTURA EXATA, CORES MELHORADAS) ===
function SideMenu({ menu, activeTab, onClick }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`rh-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <Button
        type="primary"
        onClick={() => setCollapsed(!collapsed)}
        className="rh-toggle-btn"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>

      <Menu
        onClick={onClick}
        selectedKeys={[activeTab]}
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        items={menu}
        className="rh-sidebar-menu"
      />
    </div>
  );
}

export default RecursosHumanos;