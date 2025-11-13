import React, { useState, useEffect, useContext } from 'react';
import { Button, Menu, Input, Select, Radio, Modal, Typography, Card, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { api } from '../../service/api';
import ListarUsuario from './ListarUsuario';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import NovaPessoaModal from './components/NovaPessoaModal';
import PessoaSearchModal from './components/PessoaSearchModal';
import './Usuario.css';
import { format } from 'date-fns';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserAddOutlined as MenuUserAddOutlined,
  UnorderedListOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../contexts/auth';

const { Option } = Select;

function Usuario() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [menu, setMenu] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de nova pessoa
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Modal de pesquisa
  const [selectedPessoa, setSelectedPessoa] = useState(null);
  const [isPessoaMarked, setIsPessoaMarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPessoas, setFilteredPessoas] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState('');
  // Form state da antiga NovaPessoa foi substituído por NovaPessoaModal reutilizável
  const [funcoes, setFuncoes] = useState([]);
  const [userName, setUserName] = useState('');
  const [senha, setSenha] = useState('');
  const [numeroOrdem, setNumeroOrdem] = useState('');
  const [estadoUsuario, setEstadoUsuario] = useState('ACTIVO');
  const [funcaoId, setFuncaoId] = useState('');
  const [ip, setIp] = useState('127.0.0.1');
  const [status, setStatus] = useState(true);
  const [usuarioId, setUsuarioId] = useState(1); // Ajuste conforme o usuário logado
  const [funcionarios, setFuncionarios] = useState([]);
  const { logout, user } = useContext(AuthContext);

  const safeText = (val) => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) {
      try { return format(val, 'yyyy-MM-dd'); } catch (_) { return String(val); }
    }
    if (typeof val === 'object') {
      // Caso backend envie objeto de data {year, month, day} ou estruturas aninhadas
      if (typeof val.year === 'number' && typeof val.month === 'number' && typeof val.day === 'number') {
        const pad = (n) => String(n).padStart(2, '0');
        return `${val.year}-${pad(val.month)}-${pad(val.day)}`;
      }
      return '';
    }
    return String(val);
  };

  const generos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  const tiposUsuario = [
    'ADMINISTRATIVO',
    'RECEPCIONISTA',
    'FARMACEUTICO',
    'MEDICO',
    'ENFERMEIRO',
    'ANALISTA',
    'DIVERSO',
  ];

  // Funções de busca de dados
  const fetchUsuarios = async () => {
    try {
      const response = await api.get('usuario/all');
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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

  const fetchFuncoes = async () => {
    try {
      const response = await api.get('funcao/all');
      setFuncoes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar funções:', error);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('funcionario/all');
      setFuncionarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchUsuarios(), fetchPessoas(), fetchFuncoes(), fetchFuncionarios()]);
  };

  const verificarNifExistente = async (nif) => {
    try {
      const response = await api.get(`pessoa/nif/${nif}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar NIF:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchAllData();
    // Buscar IP real do usuário
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('127.0.0.1'));
  }, []);

  // Configuração do menu com ícones
  useEffect(() => {
    const items = [
      { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: 'novo-usuario', icon: <MenuUserAddOutlined />, label: 'Novo Usuário' },
      { key: 'listar-usuario', icon: <UnorderedListOutlined />, label: 'Listar Usuários' },
      { key: 'sair', icon: <PoweroffOutlined />, label: 'Sair', danger: true },
    ];
    setMenu([...items]);
  }, []);

  // Filtragem de pessoas para a modal de pesquisa
  useEffect(() => {
    // 1. Pega todos os funcionarioId já usados em usuários
    const funcionarioIdsComUsuario = usuarios.map(u => Number(u.funcionarioId));

    // 2. Filtra pessoas que são funcionários e ainda não têm usuário
    const pessoasQueSaoFuncionariosSemUsuario = pessoas.filter(pessoa =>
      funcionarios.some(func =>
        Number(func.pessoaId) === Number(pessoa.id) &&
        !funcionarioIdsComUsuario.includes(Number(func.id))
      )
    );

    const filtered = pessoasQueSaoFuncionariosSemUsuario.filter((pessoa) => {
      const query = searchQuery.toLowerCase();
      return (
        pessoa.nome.toLowerCase().includes(query) ||
        pessoa.nif.includes(query)
      );
    });
    setFilteredPessoas(filtered);
  }, [searchQuery, pessoas, funcionarios, usuarios]);

  const handleTabClick = ({ key }) => {
    setActiveTab(key);
    if (key === 'sair') {
      logout();
    }
  };

  const abrirModal = () => {
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const abrirSearchModal = () => {
    fetchUsuarios();
    fetchPessoas();
    fetchFuncionarios();
    fetchFuncoes();
    setIsSearchModalOpen(true);
  };

  const fecharSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
  };

  // Handlers do formulário interno removidos; NovaPessoaModal gerencia seu próprio formulário

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectPessoa = async (pessoa) => {
    try {
      const pessoaData = await verificarNifExistente(pessoa.nif);
      if (!pessoaData || !pessoaData.id) {
        Modal.error({ title: 'Erro', content: 'Pessoa não encontrada no backend.' });
        return;
      }
      // Encontre o funcionário correspondente
      const funcionario = funcionarios.find(f => Number(f.pessoaId) === Number(pessoaData.id));
      if (!funcionario) {
        Modal.error({ title: 'Erro', content: 'Funcionário não encontrado para esta pessoa.' });
        return;
      }
      setSelectedPessoa({ ...pessoaData, funcionarioId: funcionario.id });
      setIsPessoaMarked(true);
      setIsSearchModalOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Erro ao verificar pessoa:', error);
      Modal.error({ title: 'Erro', content: 'Erro ao verificar pessoa no backend.' });
    }
  };

  // Fluxo de cadastro de pessoa agora é tratado por NovaPessoaModal e retorna via onSuccess

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();
    if (!selectedPessoa || !isPessoaMarked) {
      Modal.warning({ title: 'Atenção', content: 'Selecione e marque uma pessoa antes de cadastrar o usuário.' });
      return;
    }
    if (!tipoUsuario) {
      Modal.warning({ title: 'Atenção', content: 'Selecione um tipo de usuário.' });
      return;
    }
    if (!userName || !senha || !numeroOrdem || !funcaoId) {
      Modal.warning({ title: 'Atenção', content: 'Preencha todos os campos obrigatórios do usuário.' });
      return;
    }
    if (!user?.filialSelecionada?.id) {
      Modal.warning({ title: 'Atenção', content: 'Nenhuma filial selecionada. Selecione uma filial após o login.' });
      return;
    }
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const usuarioData = {
        userName,
        senha,
        numeroOrdem: Number(numeroOrdem),
        estadoUsuario,
        tipoUsuario,
        funcaoId: Number(funcaoId),
        funcionarioId: Number(selectedPessoa.funcionarioId),
        ip,
        usuarioId,
        dataCadastro: today,
        dataAtualizacao: today,
        empresaId: Number(user.filialSelecionada.id),
      };
      console.log('Payload enviado para cadastro de usuário:', usuarioData);
      const response = await api.post('usuario/add', usuarioData);
      setUsuarios((prev) => [...prev, response.data]);
      Modal.success({ title: 'Sucesso', content: 'Usuário cadastrado com sucesso!' });
      // Limpar campos do formulário
      setSelectedPessoa(null);
      setIsPessoaMarked(false);
      setTipoUsuario('');
      setUserName('');
      setSenha('');
      setNumeroOrdem('');
      setEstadoUsuario('ACTIVO');
      setFuncaoId('');
      setIp('127.0.0.1');
      setStatus(true);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      Modal.error({ title: 'Erro', content: 'Erro ao cadastrar usuário.' });
    }
  };

  // Colunas da tabela na modal de pesquisa
  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'NIF',
      dataIndex: 'nif',
      key: 'nif',
    },
    {
      title: 'Ação',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleSelectPessoa(record)}>
          Selecionar
        </Button>
      ),
    },
  ];

  return (
    <div className="usuario-container">
      <Cabecario />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideMenu menu={menu} onClick={handleTabClick} />
        <Content>
          {activeTab === 'dashboard' && <h2 className="section-title">Dashboard</h2>}
          {activeTab === 'novo-usuario' && (
            <div className="novo-usuario-container">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>Cadastrar Usuário Teste Novo</Typography.Title>

                <Card title="Tipo de Usuário">
                  <Radio.Group
                    onChange={(e) => setTipoUsuario(e.target.value)}
                    value={tipoUsuario}
                    disabled={!isPessoaMarked || !selectedPessoa?.id}
                  >
                    {tiposUsuario.map((tipo) => (
                      <Radio key={tipo} value={tipo}>
                        {tipo}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Card>

                <Card title="Pesquisar/Selecionar Pessoa">
                  <Input
                    placeholder="Pesquisar por nome ou NIF"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    suffix={<SearchOutlined onClick={abrirSearchModal} className="search-icon" />}
                  />
                </Card>

                {selectedPessoa && (
                  <Card title="Dados Pessoais">
                    <div className="pessoa-inputs">
                      <div className="input-container">
                        <label>Nome</label>
                        <Input value={safeText(selectedPessoa.nome)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>NIF</label>
                        <Input value={safeText(selectedPessoa.nif)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>Data de Nascimento</label>
                        <Input value={safeText(selectedPessoa.dataNascimento)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>Telefone</label>
                        <Input value={safeText(selectedPessoa.telefone)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>E-mail</label>
                        <Input value={safeText(selectedPessoa.email)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>Endereço</label>
                        <Input value={safeText(selectedPessoa.endereco)} readOnly />
                      </div>
                      <div className="input-container">
                        <label>Gênero</label>
                        <Input value={safeText(generos.find((g) => g.value === selectedPessoa.genero)?.label || selectedPessoa.genero)} readOnly />
                      </div>
                    </div>
                  </Card>
                )}

                <Card title="Dados de Acesso">
                  <div className="usuario-form">
                    <div className="input-container">
                      <label>Nome de Usuário</label>
                      <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nome de usuário" disabled={!selectedPessoa} />
                    </div>
                    <div className="input-container">
                      <label>Senha</label>
                      <Input.Password value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" disabled={!selectedPessoa} />
                    </div>
                    <div className="input-container">
                      <label>Número de Ordem</label>
                      <Input value={numeroOrdem} onChange={e => setNumeroOrdem(e.target.value)} placeholder="Número de ordem" disabled={!selectedPessoa} />
                    </div>
                    <div className="input-container">
                      <label>Estado do Usuário</label>
                      <Select value={estadoUsuario} onChange={setEstadoUsuario} style={{ width: '100%' }} disabled={!selectedPessoa}>
                        <Option value="ACTIVO">Ativo</Option>
                        <Option value="DESACTIVO">Inativo</Option>
                      </Select>
                    </div>
                    <div className="input-container">
                      <label>Função</label>
                      <Select value={funcaoId} onChange={setFuncaoId} style={{ width: '100%' }} disabled={!selectedPessoa}>
                        {funcoes.map(f => (
                          <Option key={f.id} value={f.id}>{f.designacao}</Option>
                        ))}
                      </Select>
                    </div>
                    <div className="input-container">
                      <label>IP</label>
                      <Input value={ip} placeholder="IP" readOnly />
                    </div>
                    <div className="input-container">
                      <label>Status</label>
                      <Select value={status} onChange={value => setStatus(value === true || value === 'true')} style={{ width: '100%' }} disabled={!selectedPessoa}>
                        <Option value={true}>Ativo</Option>
                        <Option value={false}>Inativo</Option>
                      </Select>
                    </div>
                  </div>
                </Card>

                <div className="button-container">
                  <Button
                    type="primary"
                    onClick={handleSubmitUsuario}
                    disabled={!isPessoaMarked || !selectedPessoa?.id || !tipoUsuario}
                  >
                    Salvar Usuário
                  </Button>
                </div>
              </Space>
            </div>
          )}
          {activeTab === 'listar-usuario' && (
            <ListarUsuario
              usuarios={usuarios}
              pessoas={pessoas}
              setUsuarios={setUsuarios}
              setActiveTab={setActiveTab}
              fetchUsuarios={fetchUsuarios}
              fetchAllData={fetchAllData}
            />
          )}
          {activeTab === 'sair' && <h2 className="section-title">Logout</h2>}
        </Content>
      </div>

      {/* Modal de Nova Pessoa (padronizada) */}
      <NovaPessoaModal
        open={isModalOpen}
        onCancel={fecharModal}
        user={user}
        onSuccess={(newPessoa) => {
          if (!newPessoa?.id) {
            Modal.error({ title: 'Erro', content: 'ID da pessoa não retornado pelo backend.' });
            return;
          }
          setPessoas((prev) => [...prev, newPessoa]);
          const normalized = {
            ...newPessoa,
            nome: safeText(newPessoa.nome),
            nif: safeText(newPessoa.nif),
            telefone: safeText(newPessoa.telefone),
            email: safeText(newPessoa.email),
            endereco: safeText(newPessoa.endereco),
            genero: safeText(newPessoa.genero),
            dataNascimento: safeText(newPessoa.dataNascimento),
          };
          setSelectedPessoa(normalized);
          setIsPessoaMarked(true);
          fecharModal();
          if (isSearchModalOpen) fecharSearchModal();
        }}
      />

      {/* Modal de Pesquisa */}
      <PessoaSearchModal
        open={isSearchModalOpen}
        onCancel={fecharSearchModal}
        columns={columns}
        dataSource={filteredPessoas}
        onClickAddNovaPessoa={abrirModal}
      />

      <Rodape />
    </div>
  );
}

function SideMenu({ menu, onClick }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="sidebar">
      <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      <Menu
        onClick={onClick}
        defaultSelectedKeys={['dashboard']}
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        items={menu}
        className="sidebar-menu"
      />
    </div>
  );
}

function Content({ children }) {
  return <div className="main-content">{children}</div>;
}

export default Usuario;