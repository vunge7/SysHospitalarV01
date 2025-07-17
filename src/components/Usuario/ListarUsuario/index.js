import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../service/api';
import { Modal, Input, Select } from 'antd';

const DynamicTable = ({ data, headers, detailHeaders, expandedRows, onToggleDetails, customActions, className }) => {
  return (
    <table className={className}>
      <thead>
        <tr>
          {Object.keys(headers).map((key) => (
            <th key={key}>{headers[key]}</th>
          ))}
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <React.Fragment key={row.id}>
            <tr>
              {Object.keys(headers).map((key) => (
                <td key={key}>{row[key]}</td>
              ))}
              <td>
                {customActions && customActions(row)}
              </td>
            </tr>
            {expandedRows[row.id] && (
              <tr className="details-row">
                <td colSpan={Object.keys(headers).length + 1}>
                  <div className="details-content">
                    <table className="details-table">
                      <thead>
                        <tr>
                          {Object.keys(detailHeaders).map((key) => (
                            <th key={key}>{detailHeaders[key]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {Object.keys(detailHeaders).map((key) => (
                            <td key={key}>{row[key]}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const ListarUsuario = () => {
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [editandoUsuarioId, setEditandoUsuarioId] = useState(null);
  const [usuarioEditado, setUsuarioEditado] = useState({
    userName: '',
    senha: '',
    numeroOrdem: '',
    estadoUsuario: 'ACTIVO',
    tipoUsuario: '',
    funcionarioId: '',
    funcaoId: '',
    ip: '',
  });
  const [filtros, setFiltros] = useState({ userName: '', numeroOrdem: '', status: 'todos' });
  const [mostrarSugestoes, setMostrarSugestoes] = useState({ userName: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const hasLoaded = useRef(false);
  const debounceRef = useRef(null);

  // Dados fixos
  const estadosUsuario = [
    { value: 'ACTIVO', label: 'Ativo' },
    { value: 'DESACTIVO', label: 'Inativo' },
  ];

  const tiposUsuario = [
    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
    { value: 'RECEPCIONISTA', label: 'Recepcionista' },
    { value: 'FARMACEUTICO', label: 'Farmacêutico' },
    { value: 'MEDICO', label: 'Médico' },
    { value: 'ENFERMEIRO', label: 'Enfermeiro' },
    { value: 'ANALISTA', label: 'Analista' },
    { value: 'DIVERSO', label: 'Diverso' },
  ];

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    setIsLoading(true);
    setError(null);
    setEmptyMessage('');
    try {
      const [usuariosRes, funcionariosRes, funcoesRes] = await Promise.all([
        api.get('/api/usuarios/listar'),
        api.get('funcionario/all'),
        api.get('funcao/all'),
      ]);
      const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];
      const funcionariosData = Array.isArray(funcionariosRes.data) ? funcionariosRes.data : [];
      const funcoesData = Array.isArray(funcoesRes.data) ? funcoesRes.data : [];

      setUsuarios(usuariosData);
      setFuncionarios(funcionariosData);
      setFuncoes(funcoesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar usuários por estado
  const fetchUsuarios = async (filtro = 'todos') => {
    setIsLoading(true);
    setError(null);
    setEmptyMessage('');
    try {
      let endpoint = '/api/usuarios/listar';
      if (filtro === 'ativos') {
        endpoint = 'usuario/ativos';
      } else if (filtro === 'inativos') {
        endpoint = 'usuario/inativos';
      }

      const response = await api.get(endpoint, { headers: { 'Cache-Control': 'no-cache' } });
      const usuariosData = Array.isArray(response.data) ? response.data : response.data?.usuarios || [];

      if (usuariosData.length === 0) {
        setEmptyMessage(
          filtro === 'inativos'
            ? 'Nenhum usuário inativo encontrado.'
            : filtro === 'ativos'
            ? 'Nenhum usuário ativo encontrado.'
            : 'Nenhum usuário encontrado.'
        );
      }

      setUsuarios(usuariosData);
    } catch (error) {
      console.error(`Erro ao carregar usuários (${filtro}):`, error);
      setError(`Erro ao carregar usuários: ${error.response?.data?.message || error.message}`);
      setUsuarios([]);
      setEmptyMessage('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manipular edição de usuário
  const handleEditUsuario = (row) => {
    console.log('Row recebido ao editar:', row);
    const usuario = usuarios.find((u) => Number(u.id) === Number(row.id));
    if (!usuario) {
      console.error('Usuário não encontrado para id:', row.id);
      alert('Erro: Usuário não encontrado.');
      return;
    }

    setEditandoUsuarioId(usuario.id);
    setUsuarioEditado({
      id: usuario.id,
      userName: usuario.userName || '',
      senha: '',
      numeroOrdem: usuario.numeroOrdem || '',
      estadoUsuario: usuario.estadoUsuario || 'ACTIVO',
      tipoUsuario: usuario.tipoUsuario || '',
      funcionarioId: usuario.funcionarioId || '',
      funcaoId: usuario.funcaoId || '',
      ip: usuario.ip || '',
    });
  };

  // Função de debounce para atualizar os filtros
  const debounceFiltrar = useCallback((userName, numeroOrdem) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, userName, numeroOrdem }));
    }, 300);
  }, []);

  // Manipular mudanças nos filtros
  const handleChangeFiltro = (e, field) => {
    const value = e.target.value;
    if (field === 'userName') {
      setMostrarSugestoes((prev) => ({ ...prev, userName: !!value }));
      debounceFiltrar(value, filtros.numeroOrdem);
    } else if (field === 'numeroOrdem') {
      debounceFiltrar(filtros.userName, value);
    }
  };

  // Manipular mudanças no formulário de edição
  const handleChangeEditado = (e) => {
    const { name, value } = e.target;
    setUsuarioEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectOption = (value) => {
    setFiltros((prev) => ({ ...prev, userName: value }));
    setMostrarSugestoes((prev) => ({ ...prev, userName: false }));
  };

  // Validar dados do usuário editado
  const validateEditado = async () => {
    if (!usuarioEditado.userName || usuarioEditado.userName.length < 3 || usuarioEditado.userName.length > 100) {
      alert('Username deve ter entre 3 e 100 caracteres.');
      return false;
    }
    if (usuarioEditado.senha && (usuarioEditado.senha.length < 8 || usuarioEditado.senha.length > 100)) {
      alert('Senha deve ter entre 8 e 100 caracteres.');
      return false;
    }
    if (!usuarioEditado.numeroOrdem || usuarioEditado.numeroOrdem.length < 1 || usuarioEditado.numeroOrdem.length > 100) {
      alert('Número de ordem deve ter entre 1 e 100 caracteres.');
      return false;
    }
    if (!usuarioEditado.estadoUsuario) {
      alert('Estado do usuário é obrigatório.');
      return false;
    }
    if (!usuarioEditado.tipoUsuario) {
      alert('Tipo de usuário é obrigatório.');
      return false;
    }
    if (!usuarioEditado.funcionarioId) {
      alert('Funcionário é obrigatório.');
      return false;
    }
    if (!usuarioEditado.funcaoId) {
      alert('Função é obrigatória.');
      return false;
    }
    if (usuarioEditado.ip && usuarioEditado.ip.length > 100) {
      alert('IP deve ter no máximo 100 caracteres.');
      return false;
    }
    // Verificar unicidade do username apenas se for alterado
    if (usuarioEditado.userName !== usuarios.find((u) => u.id === usuarioEditado.id)?.userName) {
      try {
        const response = await api.get(`usuario/${usuarioEditado.userName}`);
        if (response.data) {
          alert('Username já está associado a outro usuário.');
          return false;
        }
      } catch (error) {
        // Se o erro for 404, o username está disponível
        if (error.response?.status !== 404) {
          alert('Erro ao verificar username. Tente novamente.');
          return false;
        }
      }
    }
    return true;
  };

  // Salvar alterações do usuário
  const handleSaveUsuario = async (usuarioId) => {
    if (!(await validateEditado())) return;
    setIsSubmitting(true);

    try {
      const usuarioData = {
        userName: usuarioEditado.userName.trim(),
        senha: usuarioEditado.senha ? usuarioEditado.senha.trim() : undefined,
        numeroOrdem: usuarioEditado.numeroOrdem.trim(),
        estadoUsuario: usuarioEditado.estadoUsuario,
        tipoUsuario: usuarioEditado.tipoUsuario,
        funcionarioId: Number(usuarioEditado.funcionarioId),
        funcaoId: Number(usuarioEditado.funcaoId),
        ip: usuarioEditado.ip ? usuarioEditado.ip.trim() : undefined,
      };

      const response = await api.put(`usuario/${usuarioId}`, usuarioData);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === response.data.id ? { ...u, ...response.data } : u))
      );
      await fetchUsuarios(filtros.status);
      setEditandoUsuarioId(null);
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      let errorMessage = 'Erro ao atualizar usuário: ';
      if (error.message.includes('Network Error')) {
        errorMessage += 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else if (error.response) {
        errorMessage += error.response.data.message || `Erro ${error.response.status}`;
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir usuário
  const handleDeleteUsuario = async (row) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${row.userName}?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.delete(`usuario/${row.id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== row.id));
      await fetchUsuarios(filtros.status);
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      let errorMessage = 'Erro ao excluir usuário: ';
      if (error.response?.status === 404) {
        errorMessage += 'Usuário não encontrado no servidor.';
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipular clique no botão Detalhes
  const handleToggleDetails = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Preparar dados para a tabela
  console.log('Array de usuarios recebido do backend:', usuarios);
  const tableData = usuarios
    .map((usuario) => {
      const funcionario = funcionarios.find((f) => Number(f.id) === Number(usuario.funcionarioId));
      const funcao = funcoes.find((f) => Number(f.id) === Number(usuario.funcaoId));
      return {
        id: usuario.id,
        userName: usuario.userName,
        numeroOrdem: usuario.numeroOrdem,
        estadoUsuario: estadosUsuario.find((e) => e.value === usuario.estadoUsuario)?.label || usuario.estadoUsuario,
        tipoUsuario: tiposUsuario.find((t) => t.value === usuario.tipoUsuario)?.label || usuario.tipoUsuario,
        funcionarioNome: funcionario ? funcionario.nome : '-',
        funcaoDescricao: funcao ? funcao.descricao : '-',
        ip: usuario.ip || '-',
        isUsuarioAtivo: usuario.estadoUsuario === 'ACTIVO',
      };
    })
    .sort((a, b) => a.userName.localeCompare(b.userName));

  // Filtrar dados por nome de usuário, número de ordem e status
  const filteredTableData = tableData.filter((row) => {
    const matchesUserName = !filtros.userName || row.userName.toLowerCase().includes(filtros.userName.toLowerCase());
    const matchesNumeroOrdem = !filtros.numeroOrdem || row.numeroOrdem.includes(filtros.numeroOrdem);
    const matchesStatus =
      filtros.status === 'todos'
        ? true
        : filtros.status === 'ativos'
        ? row.isUsuarioAtivo
        : !row.isUsuarioAtivo;
    return matchesUserName && matchesNumeroOrdem && matchesStatus;
  });

  // Cabeçalhos da tabela
  const headers = {
    id: 'ID',
    userName: 'Username',
    numeroOrdem: 'Número de Ordem',
    estadoUsuario: 'Estado',
    tipoUsuario: 'Tipo de Usuário',
    funcionarioNome: 'Funcionário',
  };

  // Cabeçalhos para a seção de detalhes
  const detailHeaders = {
    funcaoDescricao: 'Função',
    ip: 'IP',
  };

  if (isLoading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <div className="list-container">
      {error && (
        <div>
          <p>{error}</p>
          <button
            onClick={() => {
              hasLoaded.current = false;
              loadData();
            }}
            disabled={isSubmitting}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <h2>Lista de Usuários</h2>
      <div className="filter-container">
        <div className="filter-input-container">
          <input
            type="text"
            value={filtros.userName}
            onChange={(e) => handleChangeFiltro(e, 'userName')}
            onFocus={() => setMostrarSugestoes((prev) => ({ ...prev, userName: true }))}
            onBlur={() =>
              setTimeout(() => setMostrarSugestoes((prev) => ({ ...prev, userName: false })), 200)
            }
            placeholder="Filtrar por username..."
            className="filter-input"
          />
          {mostrarSugestoes.userName && filteredTableData.length > 0 && (
            <ul className="suggestions">
              {filteredTableData.map((u) => (
                <li key={u.id} onClick={() => handleSelectOption(u.userName)}>
                  {u.userName}
                </li>
              ))}
            </ul>
          )}
          {mostrarSugestoes.userName && filteredTableData.length === 0 && (
            <ul className="suggestions">
              <li>Nenhum usuário encontrado</li>
            </ul>
          )}
        </div>
        <input
          type="text"
          value={filtros.numeroOrdem}
          onChange={(e) => handleChangeFiltro(e, 'numeroOrdem')}
          placeholder="Filtrar por número de ordem..."
          className="filter-input"
        />
        <select
          value={filtros.status}
          onChange={(e) => {
            const value = e.target.value;
            setFiltros((prev) => ({ ...prev, status: value }));
            hasLoaded.current = false;
            fetchUsuarios(value);
          }}
          className="filter-input"
        >
          <option value="todos">Todos</option>
          <option value="ativos">Usuários Ativos</option>
          <option value="inativos">Usuários Inativos</option>
        </select>
      </div>

      {emptyMessage && !error && <p>{emptyMessage}</p>}
      {filteredTableData.length === 0 && !emptyMessage && !error && (
        <p>Nenhum registro encontrado.</p>
      )}

      {filteredTableData.length > 0 && (
        <DynamicTable
          data={filteredTableData}
          headers={headers}
          detailHeaders={detailHeaders}
          expandedRows={expandedRows}
          onToggleDetails={handleToggleDetails}
          className="combined-table"
          customActions={(row) => (
            <div className="action-buttons">
              <button
                className="details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDetails(row.id);
                }}
                disabled={isSubmitting}
              >
                {expandedRows[row.id] ? 'Ocultar' : 'Detalhes'}
              </button>
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditUsuario(row);
                }}
                disabled={isSubmitting}
              >
                Editar
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUsuario(row);
                }}
                disabled={isSubmitting}
              >
                Excluir
              </button>
            </div>
          )}
        />
      )}

      {editandoUsuarioId && (
        <Modal
          title="Editar Usuário"
          visible={!!editandoUsuarioId}
          onCancel={() => setEditandoUsuarioId(null)}
          footer={null}
          destroyOnClose
        >
          <form className="agenda-form" onSubmit={e => { e.preventDefault(); handleSaveUsuario(usuarioEditado.id); }}>
            <div className="form-row">
              <div className="input-container">
                <label>Username</label>
                <Input
                  type="text"
                  name="userName"
                  value={usuarioEditado.userName || ''}
                  onChange={handleChangeEditado}
                  className="form-input"
                  required
                />
              </div>
              <div className="input-container">
                <label>Senha</label>
                <Input.Password
                  name="senha"
                  value={usuarioEditado.senha || ''}
                  onChange={handleChangeEditado}
                  className="form-input"
                  placeholder="Deixe em branco para manter a mesma"
                />
              </div>
              <div className="input-container">
                <label>Número de Ordem</label>
                <Input
                  type="text"
                  name="numeroOrdem"
                  value={usuarioEditado.numeroOrdem || ''}
                  onChange={handleChangeEditado}
                  className="form-input"
                  required
                />
              </div>
              <div className="input-container">
                <label>Estado</label>
                <Select
                  name="estadoUsuario"
                  value={usuarioEditado.estadoUsuario || ''}
                  onChange={value => setUsuarioEditado(prev => ({ ...prev, estadoUsuario: value }))}
                  className="form-input"
                  style={{ width: '100%' }}
                  required
                >
                  <Select.Option value="ACTIVO">Ativo</Select.Option>
                  <Select.Option value="DESACTIVO">Inativo</Select.Option>
                </Select>
              </div>
              <div className="input-container">
                <label>Tipo de Usuário</label>
                <Select
                  name="tipoUsuario"
                  value={usuarioEditado.tipoUsuario || ''}
                  onChange={value => setUsuarioEditado(prev => ({ ...prev, tipoUsuario: value }))}
                  className="form-input"
                  style={{ width: '100%' }}
                  required
                >
                  <Select.Option value="ADMINISTRATIVO">Administrativo</Select.Option>
                  <Select.Option value="RECEPCIONISTA">Recepcionista</Select.Option>
                  <Select.Option value="FARMACEUTICO">Farmacêutico</Select.Option>
                  <Select.Option value="MEDICO">Médico</Select.Option>
                  <Select.Option value="ENFERMEIRO">Enfermeiro</Select.Option>
                  <Select.Option value="ANALISTA">Analista</Select.Option>
                  <Select.Option value="DIVERSO">Diverso</Select.Option>
                </Select>
              </div>
              <div className="input-container">
                <label>Função</label>
                <Select
                  name="funcaoId"
                  value={usuarioEditado.funcaoId || ''}
                  onChange={value => setUsuarioEditado(prev => ({ ...prev, funcaoId: value }))}
                  className="form-input"
                  style={{ width: '100%' }}
                  required
                >
                  <Select.Option value="">Selecione</Select.Option>
                  {funcoes.map((f) => (
                    <Select.Option key={f.id} value={f.id}>{f.designacao}</Select.Option>
                  ))}
                </Select>
              </div>
              <div className="input-container">
                <label>Funcionário (ID)</label>
                <Input
                  type="number"
                  name="funcionarioId"
                  value={usuarioEditado.funcionarioId || ''}
                  onChange={handleChangeEditado}
                  className="form-input"
                  required
                />
              </div>
              <div className="input-container">
                <label>IP</label>
                <Input
                  type="text"
                  name="ip"
                  value={usuarioEditado.ip || ''}
                  onChange={handleChangeEditado}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={isSubmitting}
              >
                Salvar
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditandoUsuarioId(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ListarUsuario;