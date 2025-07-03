import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Table, AutoComplete } from 'antd';
import { api } from '../../../service/api';
import moment from 'moment';
import './Listar.css';

const { Option } = Select;

const tipoSubsidioMap = {
  ALIMENTACAO: 'Alimentação',
  TRANSPORTE: 'Transporte',
  ESPECIALIZADO: 'Especializado',
  FORMACAO: 'Formação',
  RESPONSABILIDADE: 'Responsabilidade',
  PERMANENCIA: 'Permanência',
  FUNCAO: 'Função',
  RISCO: 'Risco',
  INSALUBRIDADE: 'Insalubridade',
  TURNO: 'Turno',
  HABITACAO: 'Habitação',
  REPRESENTACAO: 'Representação',
  FERIAS: 'Férias',
  NATAL: 'Natal',
  DESEMPENHO: 'Desempenho',
};

const DynamicTable = ({ data, headers, detailHeaders, expandedRows, onToggleDetails, customActions, className }) => (
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
            <td>{customActions && customActions(row)}</td>
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

const Listar = () => {
  const [pessoas, setPessoas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [editandoFuncionarioId, setEditandoFuncionarioId] = useState(null);
  const [funcionarioEditado, setFuncionarioEditado] = useState({
    pessoa: {
      id: null,
      nome: '',
      nif: '',
      dataNascimento: null,
      telefone: '',
      email: '',
      endereco: '',
      genero: 'MASCULINO',
    },
    id: null,
    pessoaId: null,
    tipoDeContrato: '',
    salario: '',
    dataAdmissao: null,
    subsidios: [],
    descricao: '',
    fechoDeContas: '',
    estadoFuncionario: '',
  });
  const [filtros, setFiltros] = useState({ busca: '', status: 'todos' });
  const [inputBusca, setInputBusca] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [subsidioTemp, setSubsidioTemp] = useState({ id: null, descricao: '', valor: '' });
  const [isNovaPessoaModalOpen, setIsNovaPessoaModalOpen] = useState(false);
  const [isNovoFuncionarioModalOpen, setIsNovoFuncionarioModalOpen] = useState(false);
  const [novaPessoa, setNovaPessoa] = useState(null);
  const [novaPessoaForm] = Form.useForm();
  const [editFuncionarioForm] = Form.useForm();
  const [novoFuncionarioForm] = Form.useForm();
  const [subsidios, setSubsidios] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [filtroPessoa, setFiltroPessoa] = useState('');

  const generos = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMININO', label: 'Feminino' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  const tiposDeContrato = [
    { value: 'EFETIVO', label: 'Efetivo' },
    { value: 'TEMPORARIO', label: 'Temporário' },
    { value: 'ESTAGIO', label: 'Estágio' },
    { value: 'FREELANCE', label: 'Freelance' },
  ];

  const fechoDeContasOpcoes = [
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'QUINZENAL', label: 'Quinzenal' },
    { value: 'ANUAL', label: 'Anual' },
  ];

  const estadosFuncionario = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' },
    { value: 'SUSPENSO', label: 'Suspenso' },
  ];

  const hasLoaded = React.useRef(false);

  const cleanObject = useCallback((obj) => {
    if (!obj) return {};
    const seen = new Set();
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => {
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    );
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setEmptyMessage('');
    try {
      const [pessoasRes, funcionariosRes, subsidiosRes] = await Promise.all([
        api.get('pessoa/all'),
        api.get('funcionario/all'),
        api.get('subsidio/all'),
      ]);
      const pessoasData = Array.isArray(pessoasRes.data) ? pessoasRes.data.map(cleanObject) : [];
      const funcionariosData = Array.isArray(funcionariosRes.data) ? funcionariosRes.data.map(cleanObject) : [];
      const subsidiosData = Array.isArray(subsidiosRes.data) ? subsidiosRes.data.map(cleanObject) : [];
      setPessoas(pessoasData);
      setFuncionarios(funcionariosData);
      setSubsidios(subsidiosData);
      if (funcionariosData.length === 0) {
        setEmptyMessage('Nenhum funcionário encontrado.');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados: ' + (err.response?.data?.message || 'Falha na conexão com o servidor.'));
      setPessoas([]);
      setFuncionarios([]);
      setSubsidios([]);
    } finally {
      setIsLoading(false);
      hasLoaded.current = true;
    }
  }, [cleanObject]);

  const filtrarPessoas = useCallback(
    (value) => {
      const filtered = pessoas.filter((pessoa) => {
        const matchesNome = !value || pessoa.nome.toLowerCase().includes(value.toLowerCase());
        const matchesNif = !value || pessoa.nif.includes(value);
        return matchesNome || matchesNif;
      });
      setSugestoes(
        filtered.map((pessoa) => ({
          value: pessoa.nif,
          label: `${pessoa.nome} (NIF: ${pessoa.nif})`,
          pessoa,
        }))
      );
    },
    [pessoas]
  );

  useEffect(() => {
    if (!hasLoaded.current) {
      loadData();
    }
  }, [loadData]);

  const fetchFuncionarios = useCallback(
    async (filtro = 'todos') => {
      setIsLoading(true);
      setError(null);
      setEmptyMessage('');
      try {
        const response = await api.get('funcionario/all', { headers: { 'Cache-Control': 'no-cache' } });
        let funcionariosData = Array.isArray(response.data) ? response.data.map(cleanObject) : [];
        if (filtro === 'ativos') {
          funcionariosData = funcionariosData.filter((f) => f.estadoFuncionario === 'ATIVO');
        } else if (filtro === 'inativos') {
          funcionariosData = funcionariosData.filter(
            (f) => f.estadoFuncionario === 'INATIVO' || f.estadoFuncionario === 'SUSPENSO'
          );
        }
        setFuncionarios(funcionariosData);
        if (funcionariosData.length === 0) {
          setEmptyMessage(
            filtro === 'ativos'
              ? 'Nenhum funcionário ativo encontrado.'
              : filtro === 'inativos'
              ? 'Nenhum funcionário inativo ou suspenso encontrado.'
              : 'Nenhum funcionário encontrado.'
          );
        }
      } catch (error) {
        console.error(`Erro ao carregar funcionários (${filtro}):`, error);
        setError(`Erro ao carregar funcionários: ${error.response?.data?.message || 'Falha na conexão com o servidor.'}`);
        setFuncionarios([]);
        setEmptyMessage('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [cleanObject]
  );

  const handleEditFuncionario = (row) => {
    const funcionario = funcionarios.find((f) => Number(f.pessoaId) === Number(row.id));
    if (!funcionario) {
      message.error('Funcionário não encontrado.');
      return;
    }
    const pessoaAssociada = pessoas.find((p) => Number(p.id) === Number(funcionario.pessoaId));
    if (!pessoaAssociada) {
      message.error('Pessoa associada ao funcionário não encontrada.');
      return;
    }
    setEditandoFuncionarioId(funcionario.id);
    editFuncionarioForm.setFieldsValue({
      nome: pessoaAssociada.nome || '',
      nif: pessoaAssociada.nif || '',
      dataNascimento: pessoaAssociada.dataNascimento ? moment(pessoaAssociada.dataNascimento) : null,
      telefone: pessoaAssociada.telefone || '',
      email: pessoaAssociada.email || '',
      endereco: pessoaAssociada.endereco || '',
      genero: pessoaAssociada.genero || 'MASCULINO',
      tipoDeContrato: funcionario.tipoDeContrato || '',
      salario: funcionario.salario || '',
      dataAdmissao: funcionario.dataAdmissao ? moment(funcionario.dataAdmissao) : null,
      subsidios: Array.isArray(funcionario.subsidios)
        ? funcionario.subsidios.map((s) => ({
            subsidioId: s.subsidioId,
            descricao: subsidios.find((sub) => sub.id === s.subsidioId)?.descricao || '',
            valor: s.valor || 0,
          }))
        : [],
      descricao: funcionario.descricao || '',
      fechoDeContas: funcionario.fechoDeContas || '',
      estadoFuncionario: funcionario.estadoFuncionario || '',
    });
    setFuncionarioEditado({
      id: funcionario.id,
      pessoaId: funcionario.pessoaId,
      pessoa: cleanObject(pessoaAssociada),
      tipoDeContrato: funcionario.tipoDeContrato || '',
      salario: funcionario.salario ? funcionario.salario.toString() : '',
      dataAdmissao: funcionario.dataAdmissao || null,
      subsidios: Array.isArray(funcionario.subsidios) ? funcionario.subsidios : [],
      descricao: funcionario.descricao || '',
      fechoDeContas: funcionario.fechoDeContas || '',
      estadoFuncionario: funcionario.estadoFuncionario || '',
    });
    setSubsidioTemp({ id: null, descricao: '', valor: '' });
    message.info('Funcionário carregado para edição.');
  };

  const handleFiltroBuscaChange = (e) => {
    const value = e.target.value;
    setInputBusca(value);
    setMostrarSugestoes(!!value);
  };

  const handleFiltroBuscaKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFiltros((prev) => ({ ...prev, busca: inputBusca.trim() }));
      setMostrarSugestoes(false);
    }
  };

  const handleSelectOption = (value) => {
    setFiltros((prev) => ({ ...prev, busca: value }));
    setInputBusca(value);
    setMostrarSugestoes(false);
  };

  const handleSaveFuncionario = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const salario = parseFloat(values.salario);
      if (isNaN(salario) || salario <= 0) {
        throw new Error('O salário deve ser um número positivo maior que zero.');
      }
      const pessoaData = {
        id: funcionarioEditado.pessoa.id,
        nome: values.nome.trim(),
        nif: values.nif.trim(),
        dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : null,
        telefone: values.telefone.trim(),
        email: values.email.trim(),
        endereco: values.endereco.trim(),
        genero: values.genero,
      };
      const funcionarioData = {
        id: editandoFuncionarioId,
        pessoaId: funcionarioEditado.pessoaId,
        tipoDeContrato: values.tipoDeContrato,
        salario,
        dataAdmissao: values.dataAdmissao ? moment.utc(values.dataAdmissao).format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null,
        subsidios: (values.subsidios || []).map((s) => {
          const subsidio = subsidios.find((sub) => sub.descricao === s.descricao);
          if (!subsidio) {
            throw new Error(`Subsídio "${s.descricao}" não encontrado.`);
          }
          const valor = parseFloat(s.valor);
          if (isNaN(valor) || valor <= 0) {
            throw new Error(`Valor inválido para o subsídio "${s.descricao}". Deve ser positivo.`);
          }
          return {
            subsidioId: Number(subsidio.id),
            valor,
          };
        }),
        descricao: values.descricao.trim(),
        fechoDeContas: values.fechoDeContas,
        estadoFuncionario: values.estadoFuncionario,
      };
      await Promise.all([
        api.put(`pessoa/${funcionarioEditado.pessoa.id}`, pessoaData),
        api.put(`funcionario/${editandoFuncionarioId}`, funcionarioData),
      ]);
      setEditandoFuncionarioId(null);
      editFuncionarioForm.resetFields();
      setFuncionarioEditado({
        pessoa: { id: null, nome: '', nif: '', dataNascimento: null, telefone: '', email: '', endereco: '', genero: 'MASCULINO' },
        id: null,
        pessoaId: null,
        tipoDeContrato: '',
        salario: '',
        dataAdmissao: null,
        subsidios: [],
        descricao: '',
        fechoDeContas: '',
        estadoFuncionario: '',
      });
      message.success('Funcionário atualizado com sucesso!');
      hasLoaded.current = false;
      await fetchFuncionarios(filtros.status);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 400) {
        if (errorMessage.includes('obrigatório')) {
          message.error('Campos obrigatórios não preenchidos.');
        } else if (errorMessage.includes('dataAdmissao')) {
          message.error('Formato de data inválido para a data de admissão.');
        } else if (errorMessage.includes('salario')) {
          message.error('O salário é inválido ou menor que zero.');
        } else if (errorMessage.includes('subsídio')) {
          message.error(errorMessage);
        } else if (errorMessage.includes('NIF')) {
          message.error('O NIF já existe ou é inválido.');
        } else if (errorMessage.includes('Email')) {
          message.error('O email já existe ou é inválido.');
        } else {
          message.error(errorMessage || 'Dados inválidos. Verifique os campos.');
        }
      } else if (error.response?.status === 404) {
        message.error('Recurso não encontrado (pessoa ou funcionário).');
      } else if (error.response?.status === 500) {
        message.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        message.error(errorMessage || 'Erro ao atualizar funcionário.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFuncionario = async (row) => {
    const funcionario = funcionarios.find((f) => Number(f.pessoaId) === Number(row.id));
    if (!funcionario) {
      message.error('Funcionário não encontrado.');
      return;
    }
    Modal.confirm({
      title: `Tem certeza que deseja excluir o funcionário "${row.nome}"?`,
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Excluir',
      cancelText: 'Cancelar',
      onOk: async () => {
        setIsSubmitting(true);
        try {
          await api.delete(`funcionario/${funcionario.id}`);
          setFuncionarios((prev) => prev.filter((f) => Number(f.id) !== Number(funcionario.id)));
          message.success('Funcionário excluído com sucesso!');
          hasLoaded.current = false;
          await fetchFuncionarios(filtros.status);
        } catch (error) {
          console.error('Erro ao excluir:', error);
          const errorMessage = error.response?.data?.message || 'Erro ao excluir funcionário.';
          if (error.response?.status === 404) {
            message.error('Funcionário não encontrado.');
          } else if (error.response?.status === 500) {
            message.error('Erro interno do servidor. Tente novamente mais tarde.');
          } else {
            message.error(errorMessage);
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleToggleDetails = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleNovoFuncionario = () => {
    setIsNovaPessoaModalOpen(true);
    novaPessoaForm.resetFields();
    setNovaPessoa(null);
    setFiltroPessoa('');
    setSugestoes([]);
    novoFuncionarioForm.resetFields();
    setSubsidioTemp({ id: null, descricao: '', valor: '' });
  };

  const handleSelectPessoa = (value, option) => {
    const pessoa = cleanObject(option.pessoa);
    if (!pessoa.id) {
      message.error('Pessoa selecionada inválida.');
      return;
    }
    setNovaPessoa(pessoa);
    setFiltroPessoa(option.label);
    setIsNovaPessoaModalOpen(false);
    setIsNovoFuncionarioModalOpen(true);
    novoFuncionarioForm.resetFields();
    setSubsidioTemp({ id: null, descricao: '', valor: '' });
    message.success('Pessoa selecionada com sucesso!');
  };

  const handleSubmitNovaPessoa = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const pessoaData = {
        nome: values.nome.trim(),
        nif: values.nif.trim(),
        dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : null,
        telefone: values.telefone.trim(),
        email: values.email.trim(),
        endereco: values.endereco.trim(),
        genero: values.genero,
      };
      const response = await api.post('pessoa/add', pessoaData);
      const novaPessoaData = cleanObject(response.data);
      setPessoas((prev) => [...prev, novaPessoaData]);
      setNovaPessoa(novaPessoaData);
      setIsNovaPessoaModalOpen(false);
      setIsNovoFuncionarioModalOpen(true);
      novaPessoaForm.resetFields();
      setFiltroPessoa('');
      setSugestoes([]);
      message.success('Pessoa cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar pessoa.';
      if (error.response?.status === 400) {
        if (errorMessage.includes('Nome')) {
          message.error('O nome é obrigatório ou inválido.');
        } else if (errorMessage.includes('NIF')) {
          message.error('O NIF já existe ou é inválido.');
        } else if (errorMessage.includes('Email')) {
          message.error('O email já existe ou é inválido.');
        } else if (errorMessage.includes('Telefone')) {
          message.error('O telefone é inválido.');
        } else if (errorMessage.includes('Gênero')) {
          message.error('O gênero deve ser MASCULINO, FEMININO ou OUTRO.');
        } else {
          message.error(errorMessage);
        }
      } else if (error.response?.status === 500) {
        message.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFuncionario = async (values) => {
    if (isSubmitting) return;
    if (!novaPessoa || !novaPessoa.id) {
      message.error('Nenhuma pessoa selecionada ou ID inválido.');
      return;
    }
    setIsSubmitting(true);
    try {
      const salario = parseFloat(values.salario);
      if (isNaN(salario) || salario <= 0) {
        throw new Error('O salário deve ser um número positivo maior que zero.');
      }
      const funcionarioData = {
        pessoaId: Number(novaPessoa.id),
        tipoDeContrato: values.tipoDeContrato,
        salario,
        dataAdmissao: values.dataAdmissao ? moment.utc(values.dataAdmissao).format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null,
        descricao: values.descricao.trim(),
        fechoDeContas: values.fechoDeContas,
        estadoFuncionario: values.estadoFuncionario,
        subsidios: (values.subsidios || []).map((s) => {
          const subsidio = subsidios.find((sub) => sub.descricao === s.descricao);
          if (!subsidio) {
            throw new Error(`Subsídio "${s.descricao}" não encontrado.`);
          }
          const valor = parseFloat(s.valor);
          if (isNaN(valor) || valor <= 0) {
            throw new Error(`Valor inválido para o subsídio "${s.descricao}". Deve ser positivo.`);
          }
          return {
            subsidioId: Number(subsidio.id),
            valor,
          };
        }),
      };
      await api.post('funcionario/add', funcionarioData);
      novoFuncionarioForm.resetFields();
      setNovaPessoa(null);
      setIsNovoFuncionarioModalOpen(false);
      setSubsidioTemp({ id: null, descricao: '', valor: '' });
      hasLoaded.current = false;
      await fetchFuncionarios(filtros.status);
      message.success('Funcionário cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 400) {
        if (errorMessage.includes('obrigatório')) {
          message.error('Campos obrigatórios não preenchidos.');
        } else if (errorMessage.includes('dataAdmissao')) {
          message.error('Formato de data inválido para a data de admissão.');
        } else if (errorMessage.includes('salario')) {
          message.error('O salário é inválido ou menor que zero.');
        } else if (errorMessage.includes('subsídio')) {
          message.error(errorMessage);
        } else {
          message.error(errorMessage || 'Dados inválidos. Verifique os campos.');
        }
      } else if (error.response?.status === 404) {
        message.error('Pessoa não encontrada.');
      } else if (error.response?.status === 500) {
        message.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        message.error(errorMessage || 'Erro ao cadastrar funcionário.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubsidio = (index, form) => {
    const currentSubsidios = form.getFieldValue('subsidios') || [];
    form.setFieldsValue({
      subsidios: currentSubsidios.filter((_, i) => i !== index),
    });
    message.success('Subsídio removido da lista!');
  };

  const subsidiosColumns = [
    {
      title: 'Tipo',
      dataIndex: 'descricao',
      key: 'descricao',
      render: (text) => tipoSubsidioMap[text] || text,
    },
    {
      title: 'Valor (Kz)',
      dataIndex: 'valor',
      key: 'valor',
      render: (text) => (text ? Number(text).toFixed(2) : '0.00'),
    },
    {
      title: 'Ação',
      key: 'acao',
      render: (_, __, index) => (
        <Button
          danger
          size="small"
          onClick={() => handleDeleteSubsidio(index, editandoFuncionarioId ? editFuncionarioForm : novoFuncionarioForm)}
          disabled={isSubmitting}
        >
          Remover
        </Button>
      ),
    },
  ];

  const tableData = pessoas
    .map((pessoa) => {
      const funcionario = funcionarios.find((f) => Number(f.pessoaId) === Number(pessoa.id));
      return {
        id: pessoa.id,
        nome: pessoa.nome || '-',
        nif: pessoa.nif || '-',
        dataNascimento: pessoa.dataNascimento ? moment(pessoa.dataNascimento).format('YYYY-MM-DD') : '-',
        telefone: pessoa.telefone || '-',
        email: pessoa.email || '-',
        endereco: pessoa.endereco || '-',
        genero: generos.find((g) => g.value === pessoa.genero)?.label || pessoa.genero || '-',
        tipoDeContrato: funcionario
          ? tiposDeContrato.find((t) => t.value === funcionario.tipoDeContrato)?.label || funcionario.tipoDeContrato || '-'
          : '-',
        salario: funcionario && funcionario.salario ? Number(funcionario.salario).toFixed(2) : '-',
        dataAdmissao: funcionario && funcionario.dataAdmissao ? moment(funcionario.dataAdmissao).format('YYYY-MM-DD') : '-',
        subsidios: funcionario && Array.isArray(funcionario.subsidios) && funcionario.subsidios.length
          ? funcionario.subsidios
              .map((s) => {
                const subsidio = subsidios.find((sub) => sub.id === s.subsidioId);
                return (
                  subsidio
                    ? `${tipoSubsidioMap[subsidio.descricao] || subsidio.descricao}: ${Number(s.valor).toFixed(2)}`
                    : `Desconhecido: ${Number(s.valor).toFixed(2)}`
                );
              })
              .join(', ')
          : '-',
        descricao: funcionario ? funcionario.descricao || '-' : '-',
        isFuncionarioAtivo: funcionario && funcionario.estadoFuncionario === 'ATIVO',
      };
    })
    .filter((row) => row.tipoDeContrato !== '-')
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  const filteredTableData = tableData.filter((row) => {
    const buscaLower = filtros.busca.toLowerCase();
    const matchesBusca =
      !filtros.busca ||
      (row.nome && row.nome.toLowerCase().includes(buscaLower)) ||
      (row.nif && row.nif.includes(buscaLower));
    const matchesStatus =
      filtros.status === 'todos'
        ? true
        : filtros.status === 'ativos'
        ? row.isFuncionarioAtivo
        : !row.isFuncionarioAtivo;
    return matchesBusca && matchesStatus;
  });

  return (
    <div className="list-container">
      <Spin spinning={isLoading}>
        {error && (
          <div>
            <p>{error}</p>
            <Button
              onClick={() => {
                hasLoaded.current = false;
                loadData();
              }}
              disabled={isSubmitting}
            >
              Tentar novamente
            </Button>
          </div>
        )}
        <h2>Lista de Funcionários</h2>
        <div className="filter-container">
          <div className="filter-input-container">
            <Input
              value={inputBusca}
              onChange={handleFiltroBuscaChange}
              onKeyDown={handleFiltroBuscaKeyDown}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              placeholder="Filtrar por nome ou NIF..."
              className="filter-input"
              disabled={isSubmitting}
            />
            {mostrarSugestoes && filteredTableData.length > 0 && inputBusca && (
              <ul className="suggestions">
                {filteredTableData
                  .filter(
                    (row) =>
                      (row.nome && row.nome.toLowerCase().includes(inputBusca.toLowerCase())) ||
                      (row.nif && row.nif.includes(inputBusca))
                  )
                  .map((p) => (
                    <li key={p.id} onClick={() => handleSelectOption(p.nome)}>
                      {p.nome} ({p.nif})
                    </li>
                  ))}
              </ul>
            )}
            {mostrarSugestoes && filteredTableData.length === 0 && inputBusca && (
              <ul className="suggestions">
                <li>Nenhum funcionário encontrado</li>
              </ul>
            )}
          </div>
          <Select
            value={filtros.status}
            onChange={(value) => {
              setFiltros((prev) => ({ ...prev, status: value }));
              hasLoaded.current = false;
              fetchFuncionarios(value);
            }}
            className="filter-select"
            style={{ width: 200 }}
            disabled={isSubmitting}
          >
            <Option value="todos">Todos</Option>
            <Option value="ativos">Funcionários Ativos</Option>
            <Option value="inativos">Funcionários Inativos/Suspensos</Option>
          </Select>
          <Button type="primary" onClick={handleNovoFuncionario} disabled={isSubmitting}>
            Novo Funcionário
          </Button>
        </div>

        {emptyMessage && !error && <p>{emptyMessage}</p>}
        {filteredTableData.length === 0 && !emptyMessage && !error && <p>Nenhum funcionário encontrado.</p>}

        {filteredTableData.length > 0 && (
          <DynamicTable
            data={filteredTableData}
            headers={{
              id: 'ID',
              nome: 'Nome',
              nif: 'NIF',
              email: 'Email',
              telefone: 'Telefone',
              endereco: 'Endereço',
              genero: 'Gênero',
            }}
            detailHeaders={{
              dataNascimento: 'Data de Nascimento',
              tipoDeContrato: 'Tipo de Contrato',
              salario: 'Salário (Kz)',
              dataAdmissao: 'Data de Admissão',
              subsidios: 'Subsídios (Kz)',
              descricao: 'Descrição',
            }}
            expandedRows={expandedRows}
            onToggleDetails={handleToggleDetails}
            className="combined-table"
            customActions={(row) => (
              <div className="action-buttons">
                <Button
                  className="details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDetails(row.id);
                  }}
                  disabled={isSubmitting}
                  size="small"
                >
                  {expandedRows[row.id] ? 'Ocultar' : 'Detalhes'}
                </Button>
                <Button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditFuncionario(row);
                  }}
                  disabled={isSubmitting}
                  size="small"
                >
                  Editar
                </Button>
                <Button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFuncionario(row);
                  }}
                  disabled={isSubmitting}
                  danger
                  size="small"
                >
                  Excluir
                </Button>
              </div>
            )}
          />
        )}

        {/* Modal de Nova Pessoa */}
        <Modal
          title="Cadastrar ou Selecionar Pessoa"
          open={isNovaPessoaModalOpen}
          onCancel={() => {
            setIsNovaPessoaModalOpen(false);
            novaPessoaForm.resetFields();
            setFiltroPessoa('');
            setSugestoes([]);
          }}
          footer={null}
          maskClosable={false}
        >
          <h3>Selecionar Pessoa Existente</h3>
          <AutoComplete
            value={filtroPessoa}
            options={sugestoes}
            onSearch={filtrarPessoas}
            onSelect={handleSelectPessoa}
            placeholder="Digite o nome ou NIF da pessoa"
            style={{ width: '100%', marginBottom: 16 }}
            disabled={isSubmitting}
          />
          <h3>Cadastrar Nova Pessoa</h3>
          <Form
            form={novaPessoaForm}
            onFinish={handleSubmitNovaPessoa}
            onFinishFailed={() => message.error('Por favor, corrija os erros no formulário de pessoa.')}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nome"
                  label="Nome"
                  rules={[
                    { required: true, message: 'O nome é obrigatório.' },
                    { max: 100, message: 'O nome deve ter no máximo 100 caracteres.' },
                    { pattern: /^[a-zA-Z\s]+$/, message: 'O nome deve conter apenas letras e espaços.' },
                  ]}
                >
                  <Input maxLength={100} disabled={isSubmitting} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nif"
                  label="NIF"
                  rules={[
                    { required: true, message: 'O NIF é obrigatório.' },
                    { pattern: /^\d{8,9}$/, message: 'O NIF deve conter 8 ou 9 dígitos numéricos.' },
                  ]}
                >
                  <Input maxLength={9} disabled={isSubmitting} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dataNascimento"
                  label="Data de Nascimento"
                  rules={[
                    { required: true, message: 'A data de nascimento é obrigatória.' },
                    {
                      validator: (_, value) =>
                        value && moment(value).isValid() && value.isBefore(moment())
                          ? Promise.resolve()
                          : Promise.reject(new Error('Selecione uma data válida no passado.')),
                    },
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current > moment().endOf('day')}
                    disabled={isSubmitting}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="telefone"
                  label="Telefone"
                  rules={[
                    { required: true, message: 'O telefone é obrigatório.' },
                    { pattern: /^\d{9,15}$/, message: 'O telefone deve conter 9 a 15 dígitos numéricos.' },
                  ]}
                >
                  <Input maxLength={15} disabled={isSubmitting} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'O email é obrigatório.' },
                    { type: 'email', message: 'Insira um email válido.' },
                    { max: 100, message: 'O email deve ter no máximo 100 caracteres.' },
                  ]}
                >
                  <Input maxLength={100} disabled={isSubmitting} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endereco"
                  label="Endereço"
                  rules={[
                    { required: true, message: 'O endereço é obrigatório.' },
                    { max: 255, message: 'O endereço deve ter no máximo 255 caracteres.' },
                  ]}
                >
                  <Input maxLength={255} disabled={isSubmitting} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="genero"
                  label="Gênero"
                  rules={[
                    { required: true, message: 'O gênero é obrigatório.' },
                    {
                      validator: (_, value) =>
                        generos.some((g) => g.value === value)
                          ? Promise.resolve()
                          : Promise.reject(new Error('Selecione um gênero válido: Masculino, Feminino ou Outro.')),
                    },
                  ]}
                  initialValue="MASCULINO"
                >
                  <Select disabled={isSubmitting}>
                    {generos.map((tipo) => (
                      <Option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitting}>
                      Salvar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsNovaPessoaModalOpen(false);
                        novaPessoaForm.resetFields();
                        setFiltroPessoa('');
                        setSugestoes([]);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Modal de Novo Funcionário */}
        <Modal
          title="Cadastrar Funcionário"
          open={isNovoFuncionarioModalOpen}
          onCancel={() => {
            setIsNovoFuncionarioModalOpen(false);
            setNovaPessoa(null);
            novoFuncionarioForm.resetFields();
            setSubsidioTemp({ id: null, descricao: '', valor: '' });
          }}
          footer={null}
          maskClosable={false}
          width={800}
        >
          {novaPessoa && (
            <div className="pessoa-selecionada-container">
              <h3>Pessoa Selecionada</h3>
              <Form layout="vertical" disabled>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Nome">
                      <Input value={novaPessoa.nome || '-'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="NIF">
                      <Input value={novaPessoa.nif || '-'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Data de Nascimento">
                      <Input
                        value={novaPessoa.dataNascimento ? moment(novaPessoa.dataNascimento).format('YYYY-MM-DD') : '-'}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Telefone">
                      <Input value={novaPessoa.telefone || '-'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email">
                      <Input value={novaPessoa.email || '-'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Endereço">
                      <Input value={novaPessoa.endereco || '-'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Gênero">
                      <Input value={generos.find((g) => g.value === novaPessoa.genero)?.label || novaPessoa.genero || '-'} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
          <div className="funcionario-form">
            <h3>Dados do Funcionário</h3>
            <Form
              form={novoFuncionarioForm}
              onFinish={handleSubmitFuncionario}
              onFinishFailed={() => message.error('Por favor, corrija os erros no formulário de funcionário.')}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tipoDeContrato"
                    label="Tipo de Contrato"
                    rules={[
                      { required: true, message: 'Selecione o tipo de contrato.' },
                      {
                        validator: (_, value) =>
                          tiposDeContrato.some((t) => t.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Tipo de contrato inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {tiposDeContrato.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="salario"
                    label="Salário (Kz)"
                    rules={[
                      { required: true, message: 'O salário é obrigatório.' },
                      {
                        type: 'number',
                        min: 0.01,
                        max: 9999999999999.99,
                        message: 'O salário deve ser um número positivo entre 0,01 e 9.999.999.999.999,99.',
                        transform: Number,
                      },
                    ]}
                  >
                    <Input type="number" step="0.01" min="0.01" disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataAdmissao"
                    label="Data de Admissão"
                    rules={[
                      { required: true, message: 'Selecione a data de admissão.' },
                      {
                        validator: (_, value) =>
                          value && moment(value).isValid()
                            ? Promise.resolve()
                            : Promise.reject(new Error('Data de admissão inválida.')),
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="descricao"
                    label="Descrição"
                    rules={[
                      { required: true, message: 'A descrição é obrigatória.' },
                      { max: 1000, message: 'A descrição deve ter no máximo 1000 caracteres.' },
                    ]}
                  >
                    <Input.TextArea rows={4} maxLength={1000} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fechoDeContas"
                    label="Fecho de Contas"
                    rules={[
                      { required: true, message: 'Selecione o fecho de contas.' },
                      {
                        validator: (_, value) =>
                          fechoDeContasOpcoes.some((f) => f.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Fecho de contas inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {fechoDeContasOpcoes.map((opcao) => (
                        <Option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="estadoFuncionario"
                    label="Estado"
                    rules={[
                      { required: true, message: 'Selecione o estado.' },
                      {
                        validator: (_, value) =>
                          estadosFuncionario.some((e) => e.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Estado inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {estadosFuncionario.map((estado) => (
                        <Option key={estado.value} value={estado.value}>
                          {estado.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Subsídios"
                    name="subsidios"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value.length === 0) return Promise.resolve();
                          const seen = new Set();
                          for (const s of value) {
                            if (!s.descricao || !s.valor) {
                              return Promise.reject(new Error('Todos os subsídios devem ter tipo e valor válidos.'));
                            }
                            if (seen.has(s.descricao)) {
                              return Promise.reject(new Error(`Subsídio "${tipoSubsidioMap[s.descricao] || s.descricao}" está duplicado.`));
                            }
                            seen.add(s.descricao);
                            const valor = parseFloat(s.valor);
                            if (isNaN(valor) || valor <= 0) {
                              return Promise.reject(new Error(`Valor do subsídio "${tipoSubsidioMap[s.descricao] || s.descricao}" deve ser positivo.`));
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Space.Compact block>
                      <Select
                        value={subsidioTemp.descricao}
                        onChange={(value) => {
                          const subsidio = subsidios.find((sub) => sub.descricao === value);
                          setSubsidioTemp({ id: subsidio?.id || null, descricao: value, valor: '' });
                        }}
                        style={{ width: '50%' }}
                        placeholder={subsidios.length === 0 ? 'Nenhum subsídio disponível' : 'Selecione um subsídio'}
                        disabled={subsidios.length === 0 || isSubmitting}
                      >
                        {subsidios.map((sub) => (
                          <Option key={sub.id} value={sub.descricao}>
                            {tipoSubsidioMap[sub.descricao] || sub.descricao}
                          </Option>
                        ))}
                      </Select>
                      <Input
                        type="number"
                        placeholder="Valor (Kz)"
                        value={subsidioTemp.valor}
                        onChange={(e) => setSubsidioTemp({ ...subsidioTemp, valor: e.target.value })}
                        style={{ width: '30%' }}
                        disabled={!subsidioTemp.descricao || subsidios.length === 0 || isSubmitting}
                        min="0.01"
                        step="0.01"
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          const valor = parseFloat(subsidioTemp.valor);
                          if (!subsidioTemp.id || !subsidioTemp.descricao) {
                            message.error('Selecione um tipo de subsídio válido.');
                            return;
                          }
                          if (isNaN(valor) || valor <= 0) {
                            message.error('O valor do subsídio deve ser um número positivo maior que zero.');
                            return;
                          }
                          const currentSubsidios = novoFuncionarioForm.getFieldValue('subsidios') || [];
                          if (currentSubsidios.some((s) => s.descricao === subsidioTemp.descricao)) {
                            message.error(`O subsídio "${tipoSubsidioMap[subsidioTemp.descricao] || subsidioTemp.descricao}" já foi adicionado.`);
                            return;
                          }
                          novoFuncionarioForm.setFieldsValue({
                            subsidios: [
                              ...currentSubsidios,
                              { subsidioId: subsidioTemp.id, descricao: subsidioTemp.descricao, valor },
                            ],
                          });
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                          message.success('Subsídio adicionado à lista!');
                        }}
                        disabled={!subsidioTemp.descricao || !subsidioTemp.valor || isSubmitting || subsidios.length === 0}
                      >
                        Adicionar
                      </Button>
                    </Space.Compact>
                    <Table
                      dataSource={novoFuncionarioForm.getFieldValue('subsidios') || []}
                      columns={subsidiosColumns}
                      rowKey={(record, index) => `${record.descricao}-${index}`}
                      pagination={false}
                      style={{ marginTop: 16 }}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitting}>
                        Salvar Funcionário
                      </Button>
                      <Button
                        onClick={() => {
                          setIsNovoFuncionarioModalOpen(false);
                          setNovaPessoa(null);
                          novoFuncionarioForm.resetFields();
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                        }}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          novoFuncionarioForm.resetFields();
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                        }}
                        disabled={isSubmitting}
                      >
                        Limpar
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal>

        {/* Modal de Edição */}
        {editandoFuncionarioId && (
          <Modal
            title="Editar Funcionário"
            open={true}
            onCancel={() => {
              setEditandoFuncionarioId(null);
              editFuncionarioForm.resetFields();
              setSubsidioTemp({ id: null, descricao: '', valor: '' });
            }}
            footer={null}
            maskClosable={false}
            width={800}
          >
            <Form
              form={editFuncionarioForm}
              onFinish={handleSaveFuncionario}
              onFinishFailed={() => message.error('Por favor, corrija os erros no formulário de edição.')}
              layout="vertical"
            >
              <h3>Dados da Pessoa</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="nome"
                    label="Nome"
                    rules={[
                      { required: true, message: 'O nome é obrigatório.' },
                      { max: 100, message: 'O nome deve ter no máximo 100 caracteres.' },
                      { pattern: /^[a-zA-Z\s]+$/, message: 'O nome deve conter apenas letras e espaços.' },
                    ]}
                  >
                    <Input maxLength={100} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nif"
                    label="NIF"
                    rules={[
                      { required: true, message: 'O NIF é obrigatório.' },
                      { pattern: /^\d{8,9}$/, message: 'O NIF deve conter 8 ou 9 dígitos numéricos.' },
                    ]}
                  >
                    <Input maxLength={9} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataNascimento"
                    label="Data de Nascimento"
                    rules={[
                      { required: true, message: 'A data de nascimento é obrigatória.' },
                      {
                        validator: (_, value) =>
                          value && moment(value).isValid() && value.isBefore(moment())
                            ? Promise.resolve()
                            : Promise.reject(new Error('Selecione uma data válida no passado.')),
                      },
                    ]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current > moment().endOf('day')}
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="telefone"
                    label="Telefone"
                    rules={[
                      { required: true, message: 'O telefone é obrigatório.' },
                      { pattern: /^\d{9,15}$/, message: 'O telefone deve conter 9 a 15 dígitos numéricos.' },
                    ]}
                  >
                    <Input maxLength={15} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'O email é obrigatório.' },
                      { type: 'email', message: 'Insira um email válido.' },
                      { max: 100, message: 'O email deve ter no máximo 100 caracteres.' },
                    ]}
                  >
                    <Input maxLength={100} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endereco"
                    label="Endereço"
                    rules={[
                      { required: true, message: 'O endereço é obrigatório.' },
                      { max: 255, message: 'O endereço deve ter no máximo 255 caracteres.' },
                    ]}
                  >
                    <Input maxLength={255} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="genero"
                    label="Gênero"
                    rules={[
                      { required: true, message: 'O gênero é obrigatório.' },
                      {
                        validator: (_, value) =>
                          generos.some((g) => g.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Selecione um gênero válido: Masculino, Feminino ou Outro.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {generos.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <h3>Dados do Funcionário</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tipoDeContrato"
                    label="Tipo de Contrato"
                    rules={[
                      { required: true, message: 'Selecione o tipo de contrato.' },
                      {
                        validator: (_, value) =>
                          tiposDeContrato.some((t) => t.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Tipo de contrato inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {tiposDeContrato.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="salario"
                    label="Salário (Kz)"
                    rules={[
                      { required: true, message: 'O salário é obrigatório.' },
                      {
                        type: 'number',
                        min: 0.01,
                        max: 9999999999999.99,
                        message: 'O salário deve ser um número positivo entre 0,01 e 9.999.999.999.999,99.',
                        transform: Number,
                      },
                    ]}
                  >
                    <Input type="number" step="0.01" min="0.01" disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataAdmissao"
                    label="Data de Admissão"
                    rules={[
                      { required: true, message: 'Selecione a data de admissão.' },
                      {
                        validator: (_, value) =>
                          value && moment(value).isValid()
                            ? Promise.resolve()
                            : Promise.reject(new Error('Data de admissão inválida.')),
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="descricao"
                    label="Descrição"
                    rules={[
                      { required: true, message: 'A descrição é obrigatória.' },
                      { max: 1000, message: 'A descrição deve ter no máximo 1000 caracteres.' },
                    ]}
                  >
                    <Input.TextArea rows={4} maxLength={1000} disabled={isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fechoDeContas"
                    label="Fecho de Contas"
                    rules={[
                      { required: true, message: 'Selecione o fecho de contas.' },
                      {
                        validator: (_, value) =>
                          fechoDeContasOpcoes.some((f) => f.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Fecho de contas inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {fechoDeContasOpcoes.map((opcao) => (
                        <Option key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="estadoFuncionario"
                    label="Estado"
                    rules={[
                      { required: true, message: 'Selecione o estado.' },
                      {
                        validator: (_, value) =>
                          estadosFuncionario.some((e) => e.value === value)
                            ? Promise.resolve()
                            : Promise.reject(new Error('Estado inválido.')),
                      },
                    ]}
                  >
                    <Select disabled={isSubmitting}>
                      {estadosFuncionario.map((estado) => (
                        <Option key={estado.value} value={estado.value}>
                          {estado.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Subsídios"
                    name="subsidios"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value.length === 0) return Promise.resolve();
                          const seen = new Set();
                          for (const s of value) {
                            if (!s.descricao || !s.valor) {
                              return Promise.reject(new Error('Todos os subsídios devem ter tipo e valor válidos.'));
                            }
                            if (seen.has(s.descricao)) {
                              return Promise.reject(new Error(`Subsídio "${tipoSubsidioMap[s.descricao] || s.descricao}" está duplicado.`));
                            }
                            seen.add(s.descricao);
                            const valor = parseFloat(s.valor);
                            if (isNaN(valor) || valor <= 0) {
                              return Promise.reject(new Error(`Valor do subsídio "${tipoSubsidioMap[s.descricao] || s.descricao}" deve ser positivo.`));
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Space.Compact block>
                      <Select
                        value={subsidioTemp.descricao}
                        onChange={(value) => {
                          const subsidio = subsidios.find((sub) => sub.descricao === value);
                          setSubsidioTemp({ id: subsidio?.id || null, descricao: value, valor: '' });
                        }}
                        style={{ width: '50%' }}
                        placeholder={subsidios.length === 0 ? 'Nenhum subsídio disponível' : 'Selecione um subsídio'}
                        disabled={subsidios.length === 0 || isSubmitting}
                      >
                        {subsidios.map((sub) => (
                          <Option key={sub.id} value={sub.descricao}>
                            {tipoSubsidioMap[sub.descricao] || sub.descricao}
                          </Option>
                        ))}
                      </Select>
                      <Input
                        type="number"
                        placeholder="Valor (Kz)"
                        value={subsidioTemp.valor}
                        onChange={(e) => setSubsidioTemp({ ...subsidioTemp, valor: e.target.value })}
                        style={{ width: '30%' }}
                        disabled={!subsidioTemp.descricao || subsidios.length === 0 || isSubmitting}
                        min="0.01"
                        step="0.01"
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          const valor = parseFloat(subsidioTemp.valor);
                          if (!subsidioTemp.id || !subsidioTemp.descricao) {
                            message.error('Selecione um tipo de subsídio válido.');
                            return;
                          }
                          if (isNaN(valor) || valor <= 0) {
                            message.error('O valor do subsídio deve ser um número positivo maior que zero.');
                            return;
                          }
                          const currentSubsidios = editFuncionarioForm.getFieldValue('subsidios') || [];
                          if (currentSubsidios.some((s) => s.descricao === subsidioTemp.descricao)) {
                            message.error(`O subsídio "${tipoSubsidioMap[subsidioTemp.descricao] || subsidioTemp.descricao}" já foi adicionado.`);
                            return;
                          }
                          editFuncionarioForm.setFieldsValue({
                            subsidios: [
                              ...currentSubsidios,
                              { subsidioId: subsidioTemp.id, descricao: subsidioTemp.descricao, valor },
                            ],
                          });
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                          message.success('Subsídio adicionado à lista!');
                        }}
                        disabled={!subsidioTemp.descricao || !subsidioTemp.valor || isSubmitting || subsidios.length === 0}
                      >
                        Adicionar
                      </Button>
                    </Space.Compact>
                    <Table
                      dataSource={editFuncionarioForm.getFieldValue('subsidios') || []}
                      columns={subsidiosColumns}
                      rowKey={(record, index) => `${record.descricao}-${index}`}
                      pagination={false}
                      style={{ marginTop: 16 }}
                      size="small"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitting}>
                        Salvar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditandoFuncionarioId(null);
                          editFuncionarioForm.resetFields();
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                        }}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          editFuncionarioForm.resetFields();
                          setSubsidioTemp({ id: null, descricao: '', valor: '' });
                        }}
                        disabled={isSubmitting}
                      >
                        Limpar
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        )}
      </Spin>
    </div>
  );
};

export default Listar;