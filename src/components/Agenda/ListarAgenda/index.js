import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Button, Input, Select, Spin, Alert, message, Modal, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import './style.css';
import {viewPdfGenerico} from '../../util/utilitarios';

const { confirm } = Modal;

const ListarAgenda = React.memo(({
  agendas: initialAgendas,
  linhasAgenda: initialLinhasAgenda,
  setAgendas,
  setLinhasAgenda,
  funcionarios: initialFuncionarios,
  pessoas: initialPessoas,
  pacientes: initialPacientes,
  consultas: initialConsultas, 
  setFormularios,
  setActiveTab,
  fetchAgendas,
  fetchLinhasAgenda,
  fetchAllData,
  tipoAgendamento, // NOVO: tipo de agendamento
  renderExtraButtons, // NOVO: botão extra
}) => {
  const [editandoLinhaId, setEditandoLinhaId] = useState(null);
  const [linhaEditada, setLinhaEditada] = useState({});
  const [filtros, setFiltros] = useState({
    usuario: '',
    medico: '',
    paciente: '',
    consulta: '',
  });
  const [mostrarSugestoes, setMostrarSugestoes] = useState({
    usuario: false,
    medico: false,
    paciente: false,
    consulta: false,
  });
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [filtroConsulta, setFiltroConsulta] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [hora, setHora] = useState('');
  const [minuto, setMinuto] = useState('');
  const [consultasCarregadas, setConsultasCarregadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localData, setLocalData] = useState({
    agendas: [],
    linhasAgenda: [],
    funcionarios: [],
    pessoas: [],
    pacientes: [],
  });

  const hasLoaded = useRef(false);

  const fetchConsultas = async () => {
    try {
      const response = await api.get('produto/all');
      let produtosConsultas;
      if (tipoAgendamento && tipoAgendamento !== 'consulta') {
        produtosConsultas = response.data.filter(produto =>
          produto.productGroup &&
          produto.productGroup.toLowerCase().includes(tipoAgendamento) &&
          produto.productDescription
        );
        // fallback: se não houver nenhum, pega todos
        if (produtosConsultas.length === 0) {
          produtosConsultas = response.data.filter(produto => produto.productDescription);
        }
      } else {
        produtosConsultas = response.data.filter(produto =>
          produto.productGroup &&
          produto.productGroup.toLowerCase().includes('consulta') &&
          produto.productDescription
        );
      }
      if (produtosConsultas.length === 0) {
        setError('Nenhum agendamento encontrado. Verifique o backend.');
      }
      return produtosConsultas;
    } catch (error) {
      setError('Erro ao carregar agendamentos: ' + error.message);
      return [];
    }
  };

  const fetchLinhaAgenda = async () => {
    try {
      const res = await api.get('linhaagenda/all');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      setError('Erro ao carregar linhas da agenda: ' + (e.message || 'Erro desconhecido'));
      return [];
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const res = await api.get('funcionario/all');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      setError('Erro ao carregar funcionários: ' + (e.message || 'Erro desconhecido'));
      return [];
    }
  };
  const fetchPessoas = async () => {
    try {
      const res = await api.get('pessoa/all');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      setError('Erro ao carregar pessoas: ' + (e.message || 'Erro desconhecido'));
      return [];
    }
  };
  const fetchPacientes = async () => {
    try {
      const res = await api.get('paciente/all');
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      setError('Erro ao carregar pacientes: ' + (e.message || 'Erro desconhecido'));
      return [];
    }
  };

  const loadData = useCallback(async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    setIsLoading(true);
    setError(null);
    try {
      if (typeof fetchAllData === 'function') {
        await fetchAllData();
      }
      const consultasData = await fetchConsultas();
      const linhasAgendaData = await fetchLinhaAgenda();
      const funcionariosData = await fetchFuncionarios();
      const pessoasData = await fetchPessoas();
      const pacientesData = await fetchPacientes();
      const newLocalData = {
        agendas: initialAgendas || [],
        linhasAgenda: linhasAgendaData,
        funcionarios: funcionariosData,
        pessoas: pessoasData,
        pacientes: pacientesData,
      };
      setLocalData(newLocalData);
      setConsultasCarregadas(consultasData);
      if (!consultasData.length) {
        setError('Nenhuma consulta carregada. Verifique a API.');
      }
      setIsLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      setIsLoading(false);
    }
  }, [fetchAllData, initialAgendas, initialLinhasAgenda, initialFuncionarios, initialPessoas, initialPacientes, tipoAgendamento]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setLocalData(prev => ({
      agendas: initialAgendas || prev.agendas,
      linhasAgenda: initialLinhasAgenda || prev.linhasAgenda,
      funcionarios: initialFuncionarios || prev.funcionarios,
      pessoas: initialPessoas || prev.pessoas,
      pacientes: initialPacientes || prev.pacientes,
    }));
    if (initialConsultas && initialConsultas.length > 0 && consultasCarregadas.length === 0) {
      setConsultasCarregadas(initialConsultas);
    }
  }, [initialAgendas, initialLinhasAgenda, initialFuncionarios, initialPessoas, initialPacientes, initialConsultas]);

  const normalizeDate = (dateString) => {
    if (!dateString) return null;
    const normalized = dateString.replace('T', ' ').padEnd(19, ':00');
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  };

  const isMedicoDisponivel = (funcionarioId, dataRealizacao, linhaId) => {
    const selectedDate = normalizeDate(dataRealizacao);
    if (!selectedDate) return true;
    const ONE_HOUR = 60 * 60 * 1000;
    return !localData.linhasAgenda.some(linha => {
      if (linha.id === linhaId) return false;
      const linhaDate = normalizeDate(linha.dataRealizacao);
      if (!linhaDate) return false;
      const medicoIgual = Number(linha.funcionarioId) === Number(funcionarioId);
      const diffInMs = Math.abs(selectedDate.getTime() - linhaDate.getTime());
      return medicoIgual && diffInMs < ONE_HOUR;
    });
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const getDaysInMonth = (month, year) => {
    const daysInMonth = {
      '01': 31,
      '02': isLeapYear(Number(year)) ? 29 : 28,
      '03': 31,
      '04': 30,
      '05': 31,
      '06': 30,
      '07': 31,
      '08': 31,
      '09': 30,
      '10': 31,
      '11': 30,
      '12': 31
    };
    return daysInMonth[month] || 31;
  };

  const handleDeleteAgenda = async (agendaId) => {
    try {
      await api.delete(`agenda/delete/${agendaId}`);
      setLocalData(prev => ({
        ...prev,
        agendas: prev.agendas.filter(agenda => agenda.id !== agendaId),
        linhasAgenda: prev.linhasAgenda.filter(linha => linha.agendaId !== agendaId),
      }));
      setAgendas(prev => prev.filter(agenda => agenda.id !== agendaId));
      setLinhasAgenda(prev => prev.filter(linha => linha.agendaId !== agendaId));
      message.success({
        content: 'Agenda eliminada com sucesso!',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } catch (error) {
      message.error({
        content: 'Erro ao eliminar agenda.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      await fetchAgendas();
      await fetchLinhasAgenda();
    }
  };

  const handleDeleteLinha = (linhaId) => {
    confirm({
      title: 'Confirmar Exclusão',
      content: 'Tem certeza que deseja eliminar esta linha da agenda?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',

      onOk: async () => {
        try {
          await api.delete(`linhaagenda/${linhaId}`);
          setLocalData(prev => ({
            ...prev,
            linhasAgenda: prev.linhasAgenda.filter(linha => linha.id !== linhaId),
          }));
          setLinhasAgenda(prev => prev.filter(linha => linha.id !== linhaId));
          message.success({
            content: 'Linha eliminada com sucesso!',
            className: 'custom-message',
            style: { top: '20px', right: '20px' }
          });
        } catch (error) {
          let errorMessage = 'Erro ao eliminar a linha.';
          if (error.response?.status === 404) {
            errorMessage = 'Linha não encontrada.';
          } else if (error.response?.status === 400) {
            errorMessage = error.response.data.message || 'Requisição inválida.';
          }
          message.error({
            content: errorMessage,
            className: 'custom-message',
            style: { top: '20px', right: '20px' }
          });
          await fetchLinhasAgenda();
        }
      },
      onCancel() {
        // Não faz nada se o usuário cancelar
      },
    });
  };

  const handleConfirmarLinha = async (linhaId) => {
    try {
      const linha = localData.linhasAgenda.find(l => l.id === linhaId);
      if (!linha) throw new Error('Linha não encontrada localmente');
      const updatedLinha = { ...linha, confirmacao: true };
      await api.put('linhaagenda/edit', updatedLinha);
      setLocalData(prev => ({
        ...prev,
        linhasAgenda: prev.linhasAgenda.map(l => l.id === linhaId ? updatedLinha : l),
      }));
      setLinhasAgenda(prev => prev.map(l => l.id === linhaId ? updatedLinha : l));
      message.success({
        content: 'Linha confirmada com sucesso!',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } catch (error) {
      let errorMessage = 'Erro ao confirmar a linha.';
      if (error.response?.status === 404) {
        errorMessage = 'Linha não encontrada.';
      }
      message.error({
        content: errorMessage,
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    }
  };

  const handleDesconfirmarLinha = async (linhaId) => {
    try {
      const linha = localData.linhasAgenda.find(l => l.id === linhaId);
      if (!linha) throw new Error('Linha não encontrada localmente');
      const updatedLinha = { ...linha, confirmacao: false };
      await api.put('linhaagenda/edit', updatedLinha);
      setLocalData(prev => ({
        ...prev,
        linhasAgenda: prev.linhasAgenda.map(l => l.id === linhaId ? updatedLinha : l),
      }));
      setLinhasAgenda(prev => prev.map(l => l.id === linhaId ? updatedLinha : l));
      message.success({
        content: 'Linha desconfirmada com sucesso!',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } catch (error) {
      let errorMessage = 'Erro ao desconfirmar a linha.';
      if (error.response?.status === 404) {
        errorMessage = 'Linha não encontrada.';
      }
      message.error({
        content: errorMessage,
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    }
  };

  const handleEditAgenda = (agenda) => {
    setFormularios([{ agendaId: agenda.id, dataRealizacao: '' }]);
    setActiveTab('nova-agenda');
  };

  const handleEditLinha = (linha) => {
    const funcionario = localData.funcionarios.find(f => f.id === Number(linha.funcionarioId));
    const pessoa = localData.pessoas.find(p => p.id === funcionario?.pessoaId);
    const paciente = localData.pacientes.find(p => p.id === Number(linha.pacienteId));
    const consulta = consultasCarregadas.find(c => c.id === Number(linha.consultaId));
    const data = new Date(linha.dataRealizacao);
    setDia(data.getDate().toString().padStart(2, '0'));
    setMes((data.getMonth() + 1).toString().padStart(2, '0'));
    setAno(data.getFullYear().toString());
    setHora(data.getHours().toString().padStart(2, '0'));
    setMinuto(data.getMinutes().toString().padStart(2, '0'));
    setEditandoLinhaId(linha.id);
    setLinhaEditada({
      id: linha.id,
      consultaId: linha.consultaId,
      funcionarioId: linha.funcionarioId,
      pacienteId: linha.pacienteId,
      dataRealizacao: linha.dataRealizacao,
      agendaId: linha.agendaId || null,
      status: linha.status,
      confirmacao: linha.confirmacao || false,
      usuarioNome: pessoa?.nome || '',
      medicoNome: pessoa?.nome || '',
      pacienteNome: paciente?.nome || '',
      consultaMotivo: consulta?.productDescription || '',
    });
    setFiltros({
      usuario: pessoa?.nome || '',
      medico: pessoa?.nome || '',
      paciente: paciente?.nome || '',
      consulta: consulta?.productDescription || '',
    });
  };

  const handleChange = (value, field, idField) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setLinhaEditada(prev => ({
      ...prev,
      [field === 'usuario' ? 'usuarioNome' :
       field === 'medico' ? 'medicoNome' :
       field === 'paciente' ? 'pacienteNome' :
       'consultaMotivo']: value,
      ...(idField && { [idField]: value ? prev[idField] : '' }),
    }));
    setMostrarSugestoes(prev => ({ ...prev, [field]: !!value }));
  };

  const handleSelectOption = (field, idField, value, id) => {
    setLinhaEditada(prev => ({
      ...prev,
      [field]: value,
      [idField]: id,
    }));
    setFiltros(prev => ({
      ...prev,
      [field === 'usuarioNome' ? 'usuario' :
       field === 'medicoNome' ? 'medico' :
       field === 'pacienteNome' ? 'paciente' :
       'consulta']: value,
    }));
    setMostrarSugestoes(prev => ({
      ...prev,
      [field === 'usuarioNome' ? 'usuario' :
       field === 'medicoNome' ? 'medico' :
       field === 'pacienteNome' ? 'paciente' :
       'consulta']: false,
    }));
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const validateLinhaEditada = (linha) => {
    const requiredFields = {
      consultaId: 'Consulta',
      funcionarioId: 'Médico',
      pacienteId: 'Paciente',
      dataRealizacao: 'Data de Realização',
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !linha[field] || linha[field].toString().trim() === '' || Number(linha[field]) === 0)
      .map(([, label]) => label);
    if (missingFields.length > 0) {
      message.error({
        content: `Preencha: ${missingFields.join(', ')}.`,
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      return false;
    }
    const dataValida = new Date(linha.dataRealizacao);
    if (isNaN(dataValida.getTime())) {
      message.error({
        content: 'Data de realização inválida.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      return false;
    }
    const now = new Date();
    if (dataValida < now) {
      message.error({
        content: 'Não é possível selecionar uma data passada.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      return false;
    }
    if (!isMedicoDisponivel(linha.funcionarioId, linha.dataRealizacao, linha.id)) {
      message.error({
        content: 'Médico não disponível no horário escolhido.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      return false;
    }
    return true;
  };

  const updateDataRealizacao = useCallback(() => {
    if (dia && mes && ano && hora && minuto) {
      const newDateTime = `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
      setLinhaEditada(prev => ({ ...prev, dataRealizacao: newDateTime }));
    }
  }, [dia, mes, ano, hora, minuto]);

  useEffect(() => {
    updateDataRealizacao();
  }, [updateDataRealizacao]);

  const handleSaveLinha = async (linhaId) => {
    if (!validateLinhaEditada(linhaEditada)) return;
    try {
      const dataFormatada = formatDateForBackend(linhaEditada.dataRealizacao);
      if (!dataFormatada) {
        message.error({
          content: 'Data inválida.',
          className: 'custom-message',
          style: { top: '20px', right: '20px' }
        });
        return;
      }
      const linhaParaEnviar = {
        id: Number(linhaEditada.id),
        consultaId: Number(linhaEditada.consultaId),
        funcionarioId: Number(linhaEditada.funcionarioId),
        pacienteId: Number(linhaEditada.pacienteId),
        dataRealizacao: dataFormatada,
        agendaId: linhaEditada.agendaId || null,
        status: linhaEditada.status,
        confirmacao: linhaEditada.confirmacao || false,
      };
      await api.put('linhaagenda/edit', linhaParaEnviar);
      setLocalData(prev => ({
        ...prev,
        linhasAgenda: prev.linhasAgenda.map(linha =>
          linha.id === linhaId ? { ...linha, ...linhaParaEnviar } : linha
        ),
      }));
      setLinhasAgenda(prev =>
        prev.map(linha =>
          linha.id === linhaId ? { ...linha, ...linhaParaEnviar } : linha
        )
      );
      setEditandoLinhaId(null);
      setFiltros({ usuario: '', medico: '', paciente: '', consulta: '' });
      setMostrarSugestoes({ usuario: false, medico: false, paciente: false, consulta: false });
      message.success({
        content: 'Linha atualizada com sucesso!',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } catch (error) {
      let errorMessage = 'Erro ao salvar a linha.';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Dados inválidos.';
      }
      message.error({
        content: errorMessage,
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    }
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentDay = currentDate.getDate().toString().padStart(2, '0');

  const anos = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ].filter(m => Number(ano) > currentYear || (Number(ano) === currentYear && m.value >= currentMonth));

  const dias = Array.from({ length: getDaysInMonth(mes, ano) }, (_, i) => (i + 1).toString().padStart(2, '0'))
    .filter(d => Number(ano) > currentYear ||
      (Number(ano) === currentYear && mes > currentMonth) ||
      (Number(ano) === currentYear && mes === currentMonth && d >= currentDay));

  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutos = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    if (dia && mes && ano) {
      const maxDays = getDaysInMonth(mes, ano);
      if (Number(dia) > maxDays) {
        setDia(maxDays.toString().padStart(2, '0'));
      }
    }
  }, [mes, ano]);

  const filteredPessoas = (localData.pessoas || []).filter(p =>
    p?.nome?.toLowerCase().includes(filtros.usuario.toLowerCase())
  );
  const filteredFuncionarios = (localData.funcionarios || []).filter(f => {
    const nome = localData.pessoas.find(p => p.id === f.pessoaId)?.nome || '';
    return nome.toLowerCase().includes(filtros.medico.toLowerCase());
  });
  const filteredPacientes = (localData.pacientes || []).filter(p =>
    p?.nome?.toLowerCase().includes(filtros.paciente.toLowerCase())
  );
  const filteredConsultas = (consultasCarregadas || []).filter(cons =>
    cons?.productDescription?.toLowerCase().includes(filtros.consulta.toLowerCase())
  );

  const getEstadoLinha = (linha) => {
    const now = new Date();
    const dataRealizacao = new Date(linha.dataRealizacao);
    if (!linha.status) {
      return 'oculta';
    } else if (linha.confirmacao) {
      return dataRealizacao > now ? 'confirmadaFutura' : 'confirmadaPassada';
    } else {
      return dataRealizacao > now ? 'emProcesso' : 'jaPassaram';
    }
  };

  const linhasFiltradas = (localData.linhasAgenda || []).filter(linha => {
    const estado = getEstadoLinha(linha);
    const consulta = consultasCarregadas.find(c => c.id === Number(linha.consultaId));
    const consultaDescricao = consulta?.productDescription?.toLowerCase() || '';
    const matchesStatus = filtroAtivo === 'todos' || estado === filtroAtivo;
    const matchesConsulta = !filtroConsulta || consultaDescricao.includes(filtroConsulta.toLowerCase());
    return matchesStatus && matchesConsulta;
  });

  const columns = [
    {
      title: 'Médico',
      dataIndex: 'funcionarioId',
      key: 'medico',
      render: (funcionarioId, linha) => {
        const funcionario = localData.funcionarios.find(f => f.id === Number(funcionarioId));
        const pessoa = funcionario ? localData.pessoas.find(p => p.id === funcionario.pessoaId) : null;
        return pessoa?.nome || 'Médico não encontrado';
      },
    },
    {
      title: 'Paciente',
      dataIndex: 'pacienteId',
      key: 'paciente',
      render: (pacienteId, linha) => {
        if (editandoLinhaId === linha.id) {
          return (
            <Select
              showSearch
              value={linhaEditada.pacienteId || undefined}
              placeholder="Buscar paciente"
              onSearch={value => setFiltros(prev => ({ ...prev, paciente: value }))}
              onChange={(value, option) => {
                setLinhaEditada(prev => ({ ...prev, pacienteId: value }));
                setFiltros(prev => ({ ...prev, paciente: option.children }));
              }}
              filterOption={false}
              style={{ width: 180 }}
            >
              {filteredPacientes.length > 0 ? (
                filteredPacientes.map(pac => (
                  <Select.Option key={pac.id} value={pac.id}>{pac.nome}</Select.Option>
                ))
              ) : (
                <Select.Option disabled>Nenhum paciente encontrado</Select.Option>
              )}
            </Select>
          );
        }
        const paciente = localData.pacientes.find(p => p.id === Number(pacienteId));
        const pessoa = paciente ? localData.pessoas.find(p => p.id === paciente.pessoaId) : null;
        return pessoa?.nome || 'Paciente não encontrado';
      },
    },
    {
      title: 'Consulta',
      dataIndex: 'consultaId',
      key: 'consulta',
      render: (consultaId, linha) => {
        const consulta = consultasCarregadas.find(c => c.id === Number(consultaId));
        return consulta?.productDescription || '';
      },
    },
    {
      title: 'Data',
      dataIndex: 'dataRealizacao',
      key: 'data',
      render: (data, linha) => {
        return new Date(data).toLocaleString();
      },
    },
    {
      title: 'Responsavel',
      dataIndex: 'funcionarioId',
      key: 'nome',
      render: (funcionarioId, linha) => {
        const funcionario = localData.funcionarios.find(f => f.id === Number(funcionarioId));
        const pessoa = funcionario ? localData.pessoas.find(p => p.id === funcionario.pessoaId) : null;
        return pessoa?.nome || 'Responsavel não encontrado';
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, linha) => {
        const isFuture = new Date(linha.dataRealizacao) > new Date();
        return (
          <div className="action-buttons">
            {editandoLinhaId === linha.id ? (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => handleSaveLinha(linha.id)}
                size="small"
                style={{ marginRight: 8 }}
              >
                Atualizar
              </Button>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEditLinha(linha)}
                size="small"
                style={{ marginRight: 8 }}
              >
                Editar
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteLinha(linha.id)}
              size="small"
              style={{ marginRight: 8 }}
            >
              Eliminar
            </Button>
            {linha.confirmacao ? (
              <Button
                type="default"
                icon={<CloseOutlined />}
                onClick={() => handleDesconfirmarLinha(linha.id)}
                size="small"
              >
                Desconfirmar
              </Button>
            ) : (
              isFuture && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirmarLinha(linha.id)}
                  size="small"
                >
                  Confirmar
                </Button>
              )
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="listar-agenda-container">
      <h2>Lista de Agendas</h2>
      <div className="filtros-status" style={{ alignItems: 'center' }}>
        {renderExtraButtons}
        <Button
          type={filtroAtivo === 'todos' ? 'primary' : 'default'}
          onClick={() => setFiltroAtivo('todos')}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          Todas Agendas
        </Button>
        <Button
          type={filtroAtivo === 'emProcesso' ? 'primary' : 'default'}
          onClick={() => setFiltroAtivo('emProcesso')}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          Em Processo
        </Button>
        <Button
          type={filtroAtivo === 'jaPassaram' ? 'primary' : 'default'}
          onClick={() => setFiltroAtivo('jaPassaram')}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          Passadas
        </Button>
        <Button
          type={filtroAtivo === 'confirmadaFutura' ? 'primary' : 'default'}
          onClick={() => setFiltroAtivo('confirmadaFutura')}
          style={{ marginRight: 8, marginBottom: 8 }}
        >
          Confirmadas Futuras
        </Button>
        <Button
          type={filtroAtivo === 'confirmadaPassada' ? 'primary' : 'default'}
          onClick={() => setFiltroAtivo('confirmadaPassada')}
          style={{ marginBottom: 8 }}
        >
          Confirmadas Passadas
        </Button>
      </div>
      <div className="filter-container">
        <Input
          placeholder="Filtrar por consulta..."
          value={filtroConsulta}
          onChange={e => setFiltroConsulta(e.target.value)}
          style={{ width: 200, marginBottom: 16 }}
        />
      </div>
      {isLoading ? (
        <Spin tip="Carregando dados..." className="spinner" />
      ) : (
        <>
          {error && (
            <Alert
              message="Erro"
              description={error}
              type="error"
              showIcon
              closable
              action={
                <Button
                  size="small"
                  onClick={() => { hasLoaded.current = false; loadData(); }}
                >
                  Tentar novamente
                </Button>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          <Table
            columns={columns}
            dataSource={linhasFiltradas}
            rowKey="id"
            locale={{ emptyText: 'Nenhuma linha cadastrada ou nenhuma corresponde ao filtro.' }}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            className="agenda-table"
          />
        </>
      )}
    </div>
  );
});

export default ListarAgenda;