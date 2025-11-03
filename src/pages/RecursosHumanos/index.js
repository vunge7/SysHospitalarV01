import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../service/api';
import Ficha from '../../components/RecursosHumanos/Ficha';
import ListarRecursosHumanos from '../../components/RecursosHumanos/ListarRecursosHumanos';
import MainLayout from '../../layout/MainLayout';
import { 
  TeamOutlined, 
  UserAddOutlined, 
  UnorderedListOutlined, 
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../contexts/auth';
import RecursosHumanos from '../../components/RecursosHumanos';

function RecursosHumanosPage() {
  const [activeTab, setActiveTab] = useState('ficha');
  const [recursosHumanos, setRecursosHumanos] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Configuração do menu específico para Recursos Humanos
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/recursos-humanos/dashboard'
    },
    {
      key: 'ficha',
      icon: <UserAddOutlined />,
      label: 'Ficha de Colaborador',
      path: '/recursos-humanos/ficha'
    },
    {
      key: 'listar',
      icon: <UnorderedListOutlined />,
      label: 'Listar Colaboradores',
      path: '/recursos-humanos/listar'
    },
    {
      key: 'documentos',
      icon: <FileTextOutlined />,
      label: 'Documentos',
      children: [
        {
          key: 'contratos',
          label: 'Contratos',
          path: '/recursos-humanos/documentos/contratos'
        },
        {
          key: 'holerites',
          label: 'Holerites',
          path: '/recursos-humanos/documentos/holerites'
        },
        {
          key: 'avaliacoes',
          label: 'Avaliações',
          path: '/recursos-humanos/documentos/avaliacoes'
        }
      ]
    },
    {
      key: 'financeiro',
      icon: <DollarOutlined />,
      label: 'Financeiro',
      children: [
        {
          key: 'folha-pagamento',
          label: 'Folha de Pagamento',
          path: '/recursos-humanos/financeiro/folha-pagamento'
        },
        {
          key: 'beneficios',
          label: 'Benefícios',
          path: '/recursos-humanos/financeiro/beneficios'
        },
        {
          key: 'descontos',
          label: 'Descontos',
          path: '/recursos-humanos/financeiro/descontos'
        }
      ]
    },
    {
      key: 'ferias',
      icon: <CalendarOutlined />,
      label: 'Férias e Afastamentos',
      path: '/recursos-humanos/ferias'
    },
    {
      key: 'treinamentos',
      icon: <FileDoneOutlined />,
      label: 'Treinamentos',
      path: '/recursos-humanos/treinamentos'
    },
    {
      key: 'banco-horas',
      icon: <BankOutlined />,
      label: 'Banco de Horas',
      path: '/recursos-humanos/banco-horas'
    },
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      path: '/perfil'
    }
  ];

  // Funções de busca de dados
  const fetchRecursosHumanos = async () => {
    try {
      const response = await api.get('recursoHumano/all');
      setRecursosHumanos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar recursos humanos:', error);
    }
  };

  const fetchPerfis = async () => {
    try {
      const response = await api.get('perfil/all');
      setPerfis(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
    }
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
    await Promise.all([
      fetchRecursosHumanos(),
      fetchPerfis(),
      fetchPessoas(),
    ]);
  };

  // Carrega os dados iniciais
  useEffect(() => {
    fetchAllData();
    
    // Define a aba ativa com base na URL
    const path = location.pathname;
    if (path.includes('listar')) {
      setActiveTab('listar');
    } else if (path.includes('ficha')) {
      setActiveTab('ficha');
    } else if (path.includes('perfil')) {
      setActiveTab('perfil');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Função para renderizar o conteúdo com base na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'ficha':
        return (
          <Ficha
            recursosHumanos={recursosHumanos}
            perfis={perfis}
            pessoas={pessoas}
            setRecursosHumanos={setRecursosHumanos}
            setActiveTab={setActiveTab}
            fetchAllData={fetchAllData}
          />
        );
      case 'listar':
        return (
          <ListarRecursosHumanos
            recursosHumanos={recursosHumanos}
            perfis={perfis}
            pessoas={pessoas}
            setRecursosHumanos={setRecursosHumanos}
            setActiveTab={setActiveTab}
            fetchRecursosHumanos={fetchRecursosHumanos}
            fetchAllData={fetchAllData}
          />
        );
      default:
        return (
          <div className="dashboard-content">
            <h2>Bem-vindo ao Painel de Recursos Humanos</h2>
            <p>Selecione uma opção no menu ao lado para começar.</p>
          </div>
        );
    }
  };

  // Manipulador de clique no menu
  const handleMenuClick = ({ key, keyPath, item }) => {
    // Se o item tiver um caminho, navegue para ele
    const menuItem = findMenuItemByKey(menuItems, key);
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
    }
    setActiveTab(key);
  };

  // Função auxiliar para encontrar um item de menu pela chave
  const findMenuItemByKey = (items, key) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findMenuItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <MainLayout 
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
      defaultSelectedKeys={[activeTab]}
      defaultOpenKeys={['documentos', 'financeiro']}
    >
      <RecursosHumanos 
        activeTab={activeTab}
        onTabChange={handleMenuClick}
      />
    </MainLayout>
  );
}

export default RecursosHumanosPage;
