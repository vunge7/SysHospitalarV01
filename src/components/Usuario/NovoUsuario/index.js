import React, { useState, useEffect } from 'react';
import { api } from '../../../service/api';

const CadastrarUsuario = ({ usuarioId, onClose }) => {
  // Estados principais
  const [form, setForm] = useState({
    userName: '',
    numeroOrdem: '',
    // Pessoa obrigatórios
    nome: '',
    apelido: '',
    nif: '',
    dataNascimento: '',
    genero: '',
    telefone: '',
    endereco: '',
    nacionalidade: '',
    // Pessoa opcionais
    localNascimento: '',
    email: '',
    bairro: '',
    estadoCivil: '',
    pai: '',
    mae: '',
    raca: '',
    paisEndereco: '',
    provinciaEndereco: '',
    municipioEndereco: '',
    paisNascimento: '',
    provinciaNascimento: '',
    municipioNascimento: '',
    profissao: '',
    habilitacao: '',
    nomePhoto: '',
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedPessoaDados, setSelectedPessoaDados] = useState(null);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchFuncionarioModalOpen, setIsSearchFuncionarioModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [sugestoesFuncionarios, setSugestoesFuncionarios] = useState([]);
  const [dataErrors, setDataErrors] = useState({
    funcionarios: '',
    pessoas: '',
  });
  const [isNovoPessoaModalOpen, setIsNovoPessoaModalOpen] = useState(false);
  const [novaPessoa, setNovaPessoa] = useState({
    nome: '',
    apelido: '',
    nif: '',
    dataNascimento: '',
    genero: '',
    telefone: '',
    endereco: '',
    nacionalidade: '',
    localNascimento: '',
    email: '',
    bairro: '',
    estadoCivil: '',
    pai: '',
    mae: '',
    raca: '',
    paisEndereco: '',
    provinciaEndereco: '',
    municipioEndereco: '',
    paisNascimento: '',
    provinciaNascimento: '',
    municipioNascimento: '',
    profissao: '',
    habilitacao: '',
    nomePhoto: '',
  });
  const [isSavingPessoa, setIsSavingPessoa] = useState(false);

  // Funções utilitárias para API
  const logApiResponse = (endpoint, data) => {
    console.log(`[API Response] ${endpoint}:`, JSON.stringify(data, null, 2));
  };

  const logApiError = (message, error) => {
    console.error(`[API Error] ${message}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('funcionario/all');
      logApiResponse('funcionario/all', response.data);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.funcionarios || response.data?.data || [];
      if (!data.length) {
        setDataErrors((prev) => ({ ...prev, funcionarios: 'Nenhum funcionário encontrado.' }));
      }
      setSugestoesFuncionarios(data); // Inicializa com todos os funcionários
      return data;
    } catch (error) {
      logApiError('Erro ao buscar funcionários', error);
      setDataErrors((prev) => ({
        ...prev,
        funcionarios: `Erro ao carregar funcionários: ${error.message}`,
      }));
      return [];
    }
  };

  const fetchPessoaById = async (pessoaId) => {
    try {
      const response = await api.get(`pessoa/${pessoaId}`);
      logApiResponse(`pessoa/${pessoaId}`, response.data);
      return response.data;
    } catch (error) {
      logApiError('Erro ao buscar dados da pessoa', error);
      setErrorMessage('Erro ao carregar dados da pessoa. Tente novamente.');
      setIsModalOpen(true);
      return null;
    }
  };

  const fetchUsuario = async () => {
    if (!usuarioId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/api/auth/usuario/cadastrar/${usuarioId}`);
      logApiResponse(`usuario/${usuarioId}`, response.data);
      setForm({
        userName: response.data.userName || '',
        numeroOrdem: response.data.numeroOrdem || '',
      });
      if (response.data.funcionarioId) {
        setSelectedFuncionarioId(response.data.funcionarioId);
        const funcResponse = await api.get(`funcionario/${response.data.funcionarioId}`);
        const pessoaData = await fetchPessoaById(funcResponse.data.pessoaId);
        if (pessoaData) {
          setSelectedPessoaDados({
            nome: pessoaData.nome || 'N/A',
            nif: pessoaData.nif || 'N/A',
            telefone: pessoaData.telefone || 'N/A',
            endereco: pessoaData.endereco || 'N/A',
            email: pessoaData.email || 'N/A',
          });
        }
      }
    } catch (error) {
      logApiError('Erro ao carregar usuário', error);
      setErrorMessage('Erro ao carregar dados do usuário. Tente novamente.');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const verificarUserName = async (userName) => {
    try {
      const response = await api.get(`usuario/${userName}`);
      return response.data;
    } catch (error) {
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('[DEBUG] Iniciando carregamento de dados...');
        const funcionariosData = await fetchFuncionarios();
        setFuncionarios(funcionariosData);
        console.log('[DEBUG] Funcionários carregados:', funcionariosData.length);
      } catch (error) {
        logApiError('Erro geral ao carregar dados', error);
        setErrorMessage('Erro ao carregar dados. Verifique a conexão ou tente novamente.');
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    if (usuarioId) fetchUsuario();
  }, [usuarioId]);

  // Manipuladores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFuncionario = async (funcionario) => {
    try {
      const pessoaData = await fetchPessoaById(funcionario.pessoaId);
      if (pessoaData) {
        setSelectedPessoaDados({
          nome: pessoaData.nome || 'N/A',
          nif: pessoaData.nif || 'N/A',
          telefone: pessoaData.telefone || 'N/A',
          endereco: pessoaData.endereco || 'N/A',
          email: pessoaData.email || 'N/A',
        });
        setSelectedFuncionarioId(funcionario.id);
      } else {
        setSelectedPessoaDados(null);
        setSelectedFuncionarioId(null);
        setErrorMessage('Nenhuma pessoa associada encontrada para este funcionário.');
        setIsModalOpen(true);
      }
    } catch (error) {
      logApiError('Erro ao buscar pessoa após selecionar funcionário', error);
      setErrorMessage('Erro ao carregar dados da pessoa. Tente novamente.');
      setIsModalOpen(true);
    }
    setFiltroFuncionario('');
    setSugestoesFuncionarios([]);
    setIsSearchFuncionarioModalOpen(false);
  };

  const handleNovaPessoaChange = (e) => {
    const { name, value } = e.target;
    setNovaPessoa((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarNovaPessoa = async (e) => {
    e.preventDefault();
    setIsSavingPessoa(true);
    try {
      // Validação básica dos obrigatórios
      if (!novaPessoa.nome || !novaPessoa.apelido || !novaPessoa.nif || !novaPessoa.dataNascimento || !novaPessoa.genero || !novaPessoa.telefone || !novaPessoa.endereco || !novaPessoa.nacionalidade) {
        setErrorMessage('Preencha todos os campos obrigatórios da pessoa.');
        setIsModalOpen(true);
        setIsSavingPessoa(false);
        return;
      }
      // Salvar pessoa na API
      const response = await api.post('pessoa/add', novaPessoa);
      logApiResponse('pessoa/add', response.data);
      // Atualizar lista de funcionários (caso necessário)
      await fetchFuncionarios();
      setIsNovoPessoaModalOpen(false);
      setNovaPessoa({
        nome: '', apelido: '', nif: '', dataNascimento: '', genero: '', telefone: '', endereco: '', nacionalidade: '',
        localNascimento: '', email: '', bairro: '', estadoCivil: '', pai: '', mae: '', raca: '', paisEndereco: '', provinciaEndereco: '', municipioEndereco: '', paisNascimento: '', provinciaNascimento: '', municipioNascimento: '', profissao: '', habilitacao: '', nomePhoto: '',
      });
      setSuccessMessage('Pessoa cadastrada com sucesso! Agora associe-a ao usuário.');
      setIsModalOpen(true);
    } catch (error) {
      logApiError('Erro ao salvar nova pessoa', error);
      setErrorMessage('Erro ao cadastrar pessoa. Tente novamente.');
      setIsModalOpen(true);
    } finally {
      setIsSavingPessoa(false);
    }
  };

  // Validações
  const validateUsuarioForm = async () => {
    if (!form.userName || form.userName.length < 3 || form.userName.length > 100) {
      setErrorMessage('Username deve ter entre 3 e 100 caracteres.');
      return false;
    }
    if (!form.numeroOrdem || form.numeroOrdem.length < 1 || form.numeroOrdem.length > 100) {
      setErrorMessage('Número de ordem deve ter entre 1 e 100 caracteres.');
      return false;
    }
    // Validação dos campos obrigatórios de Pessoa
    if (!form.nome || form.nome.length < 3) {
      setErrorMessage('Nome é obrigatório e deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (!form.apelido || form.apelido.length < 2) {
      setErrorMessage('Apelido é obrigatório e deve ter pelo menos 2 caracteres.');
      return false;
    }
    if (!form.nif || form.nif.length < 3) {
      setErrorMessage('NIF é obrigatório e deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (!form.dataNascimento) {
      setErrorMessage('Data de nascimento é obrigatória.');
      return false;
    }
    if (!form.genero) {
      setErrorMessage('Gênero é obrigatório.');
      return false;
    }
    if (!form.telefone || form.telefone.length < 5) {
      setErrorMessage('Telefone é obrigatório e deve ter pelo menos 5 caracteres.');
      return false;
    }
    if (!form.endereco || form.endereco.length < 3) {
      setErrorMessage('Endereço é obrigatório e deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (!form.nacionalidade || form.nacionalidade.length < 2) {
      setErrorMessage('Nacionalidade é obrigatória e deve ter pelo menos 2 caracteres.');
      return false;
    }
    if (!usuarioId && (await verificarUserName(form.userName))) {
      setErrorMessage('Username já está associado a outro usuário.');
      return false;
    }
    return true;
  };

  // Manipulador de submissão
  const handleSubmitUsuario = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!(await validateUsuarioForm())) {
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const usuarioData = {
        userName: form.userName.trim(),
        numeroOrdem: form.numeroOrdem.trim(),
        funcionarioId: selectedFuncionarioId ? Number(selectedFuncionarioId) : undefined,
      };

      let response;
      if (usuarioId) {
        response = await api.put(`usuario/${usuarioId}`, usuarioData);
        setSuccessMessage(`Usuário com ID ${usuarioId} editado com sucesso!`);
      } else {
        response = await api.post('usuario/add', usuarioData);
        setSuccessMessage('Usuário cadastrado com sucesso!');
      }

      setIsModalOpen(true);
      setForm({
        userName: '',
        numeroOrdem: '',
      });
      setSelectedPessoaDados(null);
      setSelectedFuncionarioId(null);
    } catch (error) {
      logApiError('Erro ao salvar usuário', error);
      setErrorMessage(
        error.response?.data?.message || error.response?.data || 'Erro ao salvar usuário. Tente novamente.'
      );
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização
  return (
    <div className="form-container">
      {isLoading ? (
        <p>Carregando dados...</p>
      ) : dataErrors.funcionarios ? (
        <div>
          <p>Problemas ao carregar dados:</p>
          <p>Funcionários: {dataErrors.funcionarios}</p>
          {dataErrors.pessoas && <p>Pessoas: {dataErrors.pessoas}</p>}
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      ) : (
        <>
          <h2>{usuarioId ? 'Editar Usuário' : 'Cadastrar Usuário'}</h2>
          <div className="button-container">
            <button
              className="search-btn"
              onClick={() => setIsSearchFuncionarioModalOpen(true)}
              title="Pesquisar Funcionários"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {/* Adicionar o ícone de pessoa/cabeça para abrir o modal de nova pessoa */}
            <button
              className="user-btn"
              type="button"
              title="Cadastrar Nova Pessoa"
              onClick={() => setIsNovoPessoaModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmitUsuario} className="agenda-form">
            <div className="form-row">
              <div className="input-container">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="userName"
                  value={form.userName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o username"
                  required
                />
              </div>
              <div className="input-container">
                <label htmlFor="numeroOrdem">Número de Ordem</label>
                <input
                  type="text"
                  name="numeroOrdem"
                  value={form.numeroOrdem}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o número de ordem"
                  required
                />
              </div>
              {/* Campos de Pessoa obrigatórios */}
              <div className="input-container">
                <label>Nome <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o nome"
                  required
                />
              </div>
              <div className="input-container">
                <label>Apelido <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="apelido"
                  value={form.apelido}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o apelido"
                  required
                />
              </div>
              <div className="input-container">
                <label>NIF <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="nif"
                  value={form.nif}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o NIF"
                  required
                />
              </div>
              <div className="input-container">
                <label>Data de Nascimento <span style={{color: 'red'}}>*</span></label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={form.dataNascimento}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="input-container">
                <label>Gênero <span style={{color: 'red'}}>*</span></label>
                <select
                  name="genero"
                  value={form.genero}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div className="input-container">
                <label>Telefone <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o telefone"
                  required
                />
              </div>
              <div className="input-container">
                <label>Endereço <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o endereço"
                  required
                />
              </div>
              <div className="input-container">
                <label>Nacionalidade <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  name="nacionalidade"
                  value={form.nacionalidade}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a nacionalidade"
                  required
                />
              </div>
              {/* Campos de Pessoa opcionais */}
              <div className="input-container">
                <label>Local de Nascimento</label>
                <input
                  type="text"
                  name="localNascimento"
                  value={form.localNascimento}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o local de nascimento"
                />
              </div>
              <div className="input-container">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o email"
                />
              </div>
              <div className="input-container">
                <label>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o bairro"
                />
              </div>
              <div className="input-container">
                <label>Estado Civil</label>
                <input
                  type="text"
                  name="estadoCivil"
                  value={form.estadoCivil}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o estado civil"
                />
              </div>
              <div className="input-container">
                <label>Pai</label>
                <input
                  type="text"
                  name="pai"
                  value={form.pai}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o nome do pai"
                />
              </div>
              <div className="input-container">
                <label>Mae</label>
                <input
                  type="text"
                  name="mae"
                  value={form.mae}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o nome da mãe"
                />
              </div>
              <div className="input-container">
                <label>Raça</label>
                <input
                  type="text"
                  name="raca"
                  value={form.raca}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a raça"
                />
              </div>
              <div className="input-container">
                <label>País do Endereço</label>
                <input
                  type="text"
                  name="paisEndereco"
                  value={form.paisEndereco}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o país do endereço"
                />
              </div>
              <div className="input-container">
                <label>Província do Endereço</label>
                <input
                  type="text"
                  name="provinciaEndereco"
                  value={form.provinciaEndereco}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a província do endereço"
                />
              </div>
              <div className="input-container">
                <label>Município do Endereço</label>
                <input
                  type="text"
                  name="municipioEndereco"
                  value={form.municipioEndereco}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o município do endereço"
                />
              </div>
              <div className="input-container">
                <label>País de Nascimento</label>
                <input
                  type="text"
                  name="paisNascimento"
                  value={form.paisNascimento}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o país de nascimento"
                />
              </div>
              <div className="input-container">
                <label>Província de Nascimento</label>
                <input
                  type="text"
                  name="provinciaNascimento"
                  value={form.provinciaNascimento}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a província de nascimento"
                />
              </div>
              <div className="input-container">
                <label>Município de Nascimento</label>
                <input
                  type="text"
                  name="municipioNascimento"
                  value={form.municipioNascimento}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o município de nascimento"
                />
              </div>
              <div className="input-container">
                <label>Profissão</label>
                <input
                  type="text"
                  name="profissao"
                  value={form.profissao}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a profissão"
                />
              </div>
              <div className="input-container">
                <label>Habilitação</label>
                <input
                  type="text"
                  name="habilitacao"
                  value={form.habilitacao}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite a habilitação"
                />
              </div>
              <div className="input-container">
                <label>Nome da Foto</label>
                <input
                  type="text"
                  name="nomePhoto"
                  value={form.nomePhoto}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Digite o nome da foto"
                />
              </div>
            </div>
            <div className="button-container">
              <button type="submit" className="save-btn" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
              {onClose && (
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* Modal de mensagens */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{successMessage ? 'Sucesso' : 'Erro'}</h3>
            <p>{successMessage || errorMessage}</p>
            <button className="save-btn" onClick={() => setIsModalOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Busca de Funcionários */}
      {isSearchFuncionarioModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Pesquisar Funcionários</h3>
            <input
              type="text"
              placeholder="Digite o nome ou NIF"
              value={filtroFuncionario}
              onChange={(e) => {
                setFiltroFuncionario(e.target.value);
                if (e.target.value) {
                  const filtered = funcionarios.filter(
                    (func) =>
                      (func.nome || '').toLowerCase().includes(e.target.value.toLowerCase()) ||
                      (func.nif || '').toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setSugestoesFuncionarios(filtered);
                } else {
                  setSugestoesFuncionarios(funcionarios); // Mostra todos os funcionários se o filtro estiver vazio
                }
              }}
              className="form-input"
            />
            <table className="search-modal-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>NIF</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {sugestoesFuncionarios.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      {filtroFuncionario
                        ? 'Nenhum funcionário encontrado.'
                        : 'Nenhum funcionário disponível.'}
                    </td>
                  </tr>
                ) : (
                  sugestoesFuncionarios.map((funcionario) => (
                    <tr
                      key={funcionario.id}
                      onClick={() => handleSelectFuncionario(funcionario)}
                    >
                      <td>{funcionario.nome || 'N/A'}</td>
                      <td>{funcionario.nif || 'N/A'}</td>
                      <td>
                        <button
                          type="button"
                          className="select-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFuncionario(funcionario);
                          }}
                        >
                          Selecionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="button-container">
              <button
                type="button"
                className="save-btn"
                onClick={() => setIsNovoPessoaModalOpen(true)}
              >
                Nova Pessoa
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsSearchFuncionarioModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
            {/* Modal de Nova Pessoa */}
            {isNovoPessoaModalOpen && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Cadastrar Nova Pessoa</h3>
                  <form onSubmit={handleSalvarNovaPessoa} className="agenda-form">
                    <div className="form-row">
                      {/* Campos obrigatórios */}
                      <div className="input-container">
                        <label>Nome <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="nome" value={novaPessoa.nome} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>Apelido <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="apelido" value={novaPessoa.apelido} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>NIF <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="nif" value={novaPessoa.nif} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>Data de Nascimento <span style={{color: 'red'}}>*</span></label>
                        <input type="date" name="dataNascimento" value={novaPessoa.dataNascimento} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>Gênero <span style={{color: 'red'}}>*</span></label>
                        <select name="genero" value={novaPessoa.genero} onChange={handleNovaPessoaChange} className="form-input" required>
                          <option value="">Selecione</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="FEMININO">Feminino</option>
                          <option value="OUTRO">Outro</option>
                        </select>
                      </div>
                      <div className="input-container">
                        <label>Telefone <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="telefone" value={novaPessoa.telefone} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>Endereço <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="endereco" value={novaPessoa.endereco} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      <div className="input-container">
                        <label>Nacionalidade <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="nacionalidade" value={novaPessoa.nacionalidade} onChange={handleNovaPessoaChange} className="form-input" required />
                      </div>
                      {/* Campos opcionais */}
                      <div className="input-container">
                        <label>Local de Nascimento</label>
                        <input type="text" name="localNascimento" value={novaPessoa.localNascimento} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Email</label>
                        <input type="email" name="email" value={novaPessoa.email} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Bairro</label>
                        <input type="text" name="bairro" value={novaPessoa.bairro} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Estado Civil</label>
                        <input type="text" name="estadoCivil" value={novaPessoa.estadoCivil} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Pai</label>
                        <input type="text" name="pai" value={novaPessoa.pai} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Mae</label>
                        <input type="text" name="mae" value={novaPessoa.mae} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Raça</label>
                        <input type="text" name="raca" value={novaPessoa.raca} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>País do Endereço</label>
                        <input type="text" name="paisEndereco" value={novaPessoa.paisEndereco} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Província do Endereço</label>
                        <input type="text" name="provinciaEndereco" value={novaPessoa.provinciaEndereco} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Município do Endereço</label>
                        <input type="text" name="municipioEndereco" value={novaPessoa.municipioEndereco} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>País de Nascimento</label>
                        <input type="text" name="paisNascimento" value={novaPessoa.paisNascimento} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Província de Nascimento</label>
                        <input type="text" name="provinciaNascimento" value={novaPessoa.provinciaNascimento} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Município de Nascimento</label>
                        <input type="text" name="municipioNascimento" value={novaPessoa.municipioNascimento} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Profissão</label>
                        <input type="text" name="profissao" value={novaPessoa.profissao} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Habilitação </label>
                        <input type="text" name="habilitacao" value={novaPessoa.habilitacao} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                      <div className="input-container">
                        <label>Nome da Foto</label>
                        <input type="text" name="nomePhoto" value={novaPessoa.nomePhoto} onChange={handleNovaPessoaChange} className="form-input" />
                      </div>
                    </div>
                    <div className="button-container">
                      <button type="submit" className="save-btn" disabled={isSavingPessoa}>
                        {isSavingPessoa ? 'Salvando...' : 'Salvar Pessoa'}
                      </button>
                      <button type="button" className="cancel-btn" onClick={() => setIsNovoPessoaModalOpen(false)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarUsuario;