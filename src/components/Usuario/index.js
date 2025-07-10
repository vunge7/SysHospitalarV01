import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, Input, Select, Radio, Modal, Form, Table } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { api } from '../../service/api';
import ListarUsuario from './ListarUsuario';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import './Usuario.css';
import { format } from 'date-fns';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserAddOutlined as MenuUserAddOutlined,
  UnorderedListOutlined,
  UserOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';

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
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    genero: '',
    nif: '',
    dataNascimento: '',
  });
  const [funcoes, setFuncoes] = useState([]);
  const [userName, setUserName] = useState('');
  const [senha, setSenha] = useState('');
  const [numeroOrdem, setNumeroOrdem] = useState('');
  const [estadoUsuario, setEstadoUsuario] = useState('ACTIVO');
  const [funcaoId, setFuncaoId] = useState('');
  const [ip, setIp] = useState('127.0.0.1');
  const [status, setStatus] = useState(true);
  const [usuarioId, setUsuarioId] = useState(1); // Ajuste conforme o usuário logado
  const navigate = useNavigate();

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

  const fetchAllData = async () => {
    await Promise.all([fetchUsuarios(), fetchPessoas(), fetchFuncoes()]);
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
    const filtered = pessoas.filter((pessoa) => {
      const query = searchQuery.toLowerCase();
      return (
        pessoa.nome.toLowerCase().includes(query) ||
        pessoa.nif.includes(query)
      );
    });
    setFilteredPessoas(filtered);
  }, [searchQuery, pessoas]);

  const handleTabClick = ({ key }) => {
    setActiveTab(key);
    if (key === 'sair') {
      navigate('/logout');
    }
  };

  const abrirModal = () => {
    setForm({ nome: '', telefone: '', email: '', endereco: '', genero: '', nif: '', dataNascimento: '' });
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const abrirSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const fecharSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectPessoa = async (pessoa) => {
    try {
      const pessoaData = await verificarNifExistente(pessoa.nif);
      if (!pessoaData || !pessoaData.id) {
        alert('Erro: Pessoa não encontrada no backend.');
        return;
      }
      setSelectedPessoa(pessoaData);
      setIsPessoaMarked(true);
      setIsSearchModalOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Erro ao verificar pessoa:', error);
      alert('Erro ao verificar pessoa no backend.');
    }
  };

  const validateModalForm = () => {
    const requiredFields = ['nome', 'telefone', 'email', 'endereco', 'genero', 'nif', 'dataNascimento'];
    const isValid = requiredFields.every((field) => form[field] && form[field].trim() !== '');
    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      alert('Por favor, insira um email válido.');
      return false;
    }
    if (!/^\d{8,9}$/.test(form.nif.trim())) {
      alert('NIF deve conter 8 ou 9 dígitos numéricos.');
      return false;
    }
    if (!/^\d{9,15}$/.test(form.telefone.trim())) {
      alert('Telefone deve conter entre 9 e 15 dígitos numéricos.');
      return false;
    }
    const dataNascimentoDate = new Date(form.dataNascimento);
    const today = new Date();
    if (isNaN(dataNascimentoDate.getTime()) || dataNascimentoDate > today) {
      alert('Data de nascimento inválida ou no futuro.');
      return false;
    }
    return true;
  };

  const handleSubmitPessoa = async (e) => {
    e.preventDefault();
    if (!validateModalForm()) return;

    const nif = form.nif.trim();
    const nifExiste = await verificarNifExistente(nif);
    if (nifExiste) {
      alert('Erro: O NIF informado já está cadastrado.');
      return;
    }

    try {
      const pessoaData = {
        nome: form.nome.trim(),
        dataNascimento: form.dataNascimento,
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        endereco: form.endereco.trim(),
        genero: form.genero,
        nif: nif,
      };
      const response = await api.post('pessoa/add', pessoaData);
      if (!response.data.id) {
        alert('Erro: ID da pessoa não retornado pelo backend.');
        return;
      }
      const newPessoa = { ...response.data };
      setPessoas((prev) => [...prev, newPessoa]);
      setSelectedPessoa(newPessoa);
      setIsPessoaMarked(true);
      alert('Pessoa cadastrada com sucesso!');
      fecharModal();
      if (isSearchModalOpen) {
        fecharSearchModal();
      }
    } catch (error) {
      console.error('Erro ao cadastrar pessoa:', error);
      alert('Erro ao cadastrar pessoa.');
    }
  };

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();
    if (!selectedPessoa || !isPessoaMarked) {
      alert('Selecione e marque uma pessoa antes de cadastrar o usuário.');
      return;
    }
    if (!tipoUsuario) {
      alert('Selecione um tipo de usuário.');
      return;
    }
    if (!userName || !senha || !numeroOrdem || !funcaoId) {
      alert('Preencha todos os campos obrigatórios do usuário.');
      return;
    }
    try {
      const usuarioData = {
        userName,
        senha,
        numeroOrdem,
        estadoUsuario,
        tipoUsuario,
        funcaoId: Number(funcaoId),
        funcionarioId: selectedPessoa.id,
        ip,
        usuarioId, // ajuste conforme o usuário logado
      };
      console.log('Payload enviado para cadastro de usuário:', usuarioData);
      const response = await api.post('usuario/add', usuarioData);
      setUsuarios((prev) => [...prev, response.data]);
      alert('Usuário cadastrado com sucesso!');
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
      alert('Erro ao cadastrar usuário.');
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
              <h2>Cadastrar Usuário</h2>
              {selectedPessoa && (
                <div className="pessoa-selecionada-container">
                  <h3>Dados Pessoais</h3>
                  <div className="pessoa-inputs">
                    <div className="input-container">
                      <label>Nome</label>
                      <Input value={selectedPessoa.nome} readOnly />
                    </div>
                    <div className="input-container">
                      <label>NIF</label>
                      <Input value={selectedPessoa.nif} readOnly />
                    </div>
                    <div className="input-container">
                      <label>Data de Nascimento</label>
                      <Input value={selectedPessoa.dataNascimento} readOnly />
                    </div>
                    <div className="input-container">
                      <label>Telefone</label>
                      <Input value={selectedPessoa.telefone} readOnly />
                    </div>
                    <div className="input-container">
                      <label>E-mail</label>
                      <Input value={selectedPessoa.email} readOnly />
                    </div>
                    <div className="input-container">
                      <label>Endereço</label>
                      <Input value={selectedPessoa.endereco} readOnly />
                    </div>
                    <div className="input-container">
                      <label>Gênero</label>
                      <Input value={generos.find((g) => g.value === selectedPessoa.genero)?.label || selectedPessoa.genero} readOnly />
                    </div>
                  </div>
                </div>
              )}
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
                  <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="IP" disabled={!selectedPessoa} />
                </div>
                <div className="input-container">
                  <label>Status</label>
                  <Select value={status} onChange={value => setStatus(value === true || value === 'true')} style={{ width: '100%' }} disabled={!selectedPessoa}>
                    <Option value={true}>Ativo</Option>
                    <Option value={false}>Inativo</Option>
                  </Select>
                </div>
              </div>
              <div className="tipo-usuario-container">
                <h3>Tipo de Usuário</h3>
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
              </div>
              <div className="search-container">
                <Input
                  placeholder="Pesquisar por nome ou NIF"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  suffix={<SearchOutlined onClick={abrirSearchModal} className="search-icon" />}
                />
              </div>
              <div className="button-container">
                <Button
                  type="primary"
                  onClick={handleSubmitUsuario}
                  disabled={!isPessoaMarked || !selectedPessoa?.id || !tipoUsuario}
                >
                  Salvar Usuário
                </Button>
              </div>
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

      {/* Modal de Nova Pessoa */}
      <Modal
        title="Nova Pessoa"
        visible={isModalOpen}
        onCancel={fecharModal}
        footer={null}
      >
        <Form onFinish={handleSubmitPessoa} layout="vertical">
          <Form.Item label="Nome" required>
            <Input name="nome" value={form.nome} onChange={handleInputChange} />
          </Form.Item>
          <Form.Item label="NIF" required>
            <Input name="nif" value={form.nif} onChange={handleInputChange} />
          </Form.Item>
          <Form.Item label="Data de Nascimento" required>
            <Input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Telefone" required>
            <Input name="telefone" value={form.telefone} onChange={handleInputChange} />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input name="email" value={form.email} onChange={handleInputChange} />
          </Form.Item>
          <Form.Item label="Endereço" required>
            <Input name="endereco" value={form.endereco} onChange={handleInputChange} />
          </Form.Item>
          <Form.Item label="Gênero" required>
            <Select
              name="genero"
              value={form.genero}
              onChange={(value) => setForm((prev) => ({ ...prev, genero: value }))}
            >
              <Option value="">Selecione o Gênero</Option>
              {generos.map((g) => (
                <Option key={g.value} value={g.value}>
                  {g.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Salvar
            </Button>
            <Button onClick={fecharModal} style={{ marginLeft: 8 }}>
              Fechar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Pesquisa */}
      <Modal
        title="Pesquisar Pessoa"
        visible={isSearchModalOpen}
        onCancel={fecharSearchModal}
        footer={[
          <Button key="cancel" onClick={fecharSearchModal}>
            Cancelar
          </Button>,
        ]}
        className="search-modal"
      >
        <div className="add-person-icon-container">
          <UserAddOutlined onClick={abrirModal} className="add-person-icon" title="Cadastrar Nova Pessoa" />
        </div>
        <Table
          columns={columns}
          dataSource={filteredPessoas}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

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

function Header() {
  return (
    <div
      style={{
        height: 80,
        backgroundColor: '#506175',
        color: '#FFF',
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}
    >
      Painel de Usuários
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        height: 60,
        backgroundColor: 'lightskyblue',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
      }}
    >
      Footer
    </div>
  );
}

export default Usuario;