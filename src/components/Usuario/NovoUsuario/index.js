import React, { useState, useEffect } from 'react';
import { api } from '../../../service/api';

const CadastrarUsuario = ({ usuarioId, onClose }) => {
  // Estados principais
  const [form, setForm] = useState({
    userName: '',
    numeroOrdem: '',
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
      const response = await api.get(`usuario/${usuarioId}`);
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
              {selectedPessoaDados && (
                <>
                  <div className="input-container">
                    <label>Nome</label>
                    <input
                      value={selectedPessoaDados.nome || 'N/A'}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                  <div className="input-container">
                    <label>NIF</label>
                    <input
                      value={selectedPessoaDados.nif || 'N/A'}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                  <div className="input-container">
                    <label>Telefone</label>
                    <input
                      value={selectedPessoaDados.telefone || 'N/A'}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                  <div className="input-container">
                    <label>Endereço</label>
                    <input
                      value={selectedPessoaDados.endereco || 'N/A'}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                  <div className="input-container">
                    <label>Email</label>
                    <input
                      value={selectedPessoaDados.email || 'N/A'}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>
                </>
              )}
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
                className="cancel-btn"
                onClick={() => setIsSearchFuncionarioModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarUsuario;