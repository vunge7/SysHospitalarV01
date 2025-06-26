import React, { useState, useRef, useEffect } from 'react';
import { api } from "../../../service/api";
import ListarAgenda from '../ListarAgenda';

const FormRow = ({ form, index, funcionarios, pessoas, pacientes, consultas, agendas, linhasAgenda = [], handleInputChange }) => {
  const [funcionarioFilter, setFuncionarioFilter] = useState(form.funcionarioFilter || '');
  const [pacienteFilter, setPacienteFilter] = useState(form.pacienteFilter || '');
  const [consultaFilter, setConsultaFilter] = useState(form.consultaFilter || '');
  const [agendaFilter, setAgendaFilter] = useState(form.agendaFilter || '');
  const [showFuncionarioDropdown, setShowFuncionarioDropdown] = useState(false);
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false);
  const [showConsultaDropdown, setShowConsultaDropdown] = useState(false);
  const [showAgendaDropdown, setShowAgendaDropdown] = useState(false);

  // Estados para os comboboxes de data e hora
  const [dia, setDia] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getDate().toString().padStart(2, '0') : '');
  const [mes, setMes] = useState(form.dataRealizacao ? (new Date(form.dataRealizacao).getMonth() + 1).toString().padStart(2, '0') : '');
  const [ano, setAno] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getFullYear().toString() : '');
  const [hora, setHora] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getHours().toString().padStart(2, '0') : '');
  const [minuto, setMinuto] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getMinutes().toString().padStart(2, '0') : '');

  useEffect(() => {
    console.log('Dados recebidos em FormRow:', { 
      formDataRealizacao: form.dataRealizacao, 
      funcionarios: funcionarios.map(f => ({ id: f.id, pessoaId: f.pessoaId })), 
      linhasAgenda 
    });
  }, [form.dataRealizacao, funcionarios, linhasAgenda]);

  const normalizeDate = (dateString) => {
    if (!dateString) return null;
    const normalized = dateString.replace('T', ' ').padEnd(19, ':00');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString, 'Normalizado:', normalized);
      return null;
    }
    return date;
  };

  const isMedicoDisponivel = (funcionarioId, dataRealizacao) => {
    const selectedDate = normalizeDate(dataRealizacao);
    if (!selectedDate) {
      console.log('Nenhuma data válida selecionada, todos médicos disponíveis');
      return true;
    }
    if (!Array.isArray(linhasAgenda) || linhasAgenda.length === 0) {
      console.log('Nenhuma linha de agenda existente, todos médicos disponíveis');
      return true;
    }

    const ONE_HOUR = 60 * 60 * 1000;
    console.log(`Verificando médico ${funcionarioId} em ${selectedDate.toISOString()}`);

    const medicoOcupado = linhasAgenda.some(linha => {
      const linhaDate = normalizeDate(linha.dataRealizacao);
      if (!linhaDate) {
        console.error('Data da linha inválida:', linha.dataRealizacao);
        return false;
      }

      const medicoIgual = Number(linha.funcionarioId) === Number(funcionarioId);
      const diffInMs = Math.abs(selectedDate.getTime() - linhaDate.getTime());
      const conflito = medicoIgual && diffInMs < ONE_HOUR;

      console.log(`- Médico: ${linha.funcionarioId}, Data: ${linhaDate.toISOString()}, Diferença: ${diffInMs / 60000} minutos, Conflito: ${conflito}`);
      return conflito;
    });

    console.log(`Resultado: Médico ${funcionarioId} está ${medicoOcupado ? 'ocupado' : 'disponível'}`);
    return !medicoOcupado;
  };

  const filteredFuncionarios = funcionarios.filter(func => {
    const pessoa = pessoas.find(p => p.id === func.pessoaId);
    const matchesFilter = pessoa?.nome.toLowerCase().includes(funcionarioFilter.toLowerCase());
    const isAvailable = isMedicoDisponivel(func.id, form.dataRealizacao);
    console.log(`Filtrando médico ${func.id} (${pessoa?.nome}): matchesFilter=${matchesFilter}, isAvailable=${isAvailable}`);
    return matchesFilter && isAvailable;
  });

  const filteredPacientes = pacientes.filter(pac =>
    pac.nome.toLowerCase().includes(pacienteFilter.toLowerCase())
  );

  const filteredConsultas = consultas.filter(cons =>
    cons.motivoConsulta.toLowerCase().includes(consultaFilter.toLowerCase())
  );

  const filteredAgendas = agendas.filter(ag =>
    ag.descricao.toLowerCase().includes(agendaFilter.toLowerCase())
  );

  // Função para atualizar dataRealizacao com base nos comboboxes
  const updateDataRealizacao = () => {
    if (dia && mes && ano && hora && minuto) {
      const newDateTime = `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
      console.log('Nova data/hora combinada:', newDateTime);
      handleInputChange(index, { target: { name: 'dataRealizacao', value: newDateTime } });
    }
  };

  useEffect(() => {
    updateDataRealizacao();
  }, [dia, mes, ano, hora, minuto]);

  // Opções para os comboboxes
  const dias = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
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
  ];
  const anos = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());
  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutos = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="form-row">
      <div className="date-time-container">
        <select
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Dia</option>
          {dias.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Mês</option>
          {meses.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Ano</option>
          {anos.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Hora</option>
          {horas.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select
          value={minuto}
          onChange={(e) => setMinuto(e.target.value)}
          required
          className="form-input"
        >
          <option value="">Minuto</option>
          {minutos.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Digite para buscar médico"
          value={funcionarioFilter}
          onChange={(e) => {
            setFuncionarioFilter(e.target.value);
            setShowFuncionarioDropdown(true);
          }}
          onFocus={() => setShowFuncionarioDropdown(true)}
          onBlur={() => setTimeout(() => setShowFuncionarioDropdown(false), 200)}
          className="dropdown-input"
          required
        />
        {showFuncionarioDropdown && filteredFuncionarios.length > 0 && (
          <ul className="dropdown-list">
            {filteredFuncionarios.map(func => {
              const pessoa = pessoas.find(p => p.id === func.pessoaId);
              return (
                <li
                  key={func.id}
                  onClick={() => {
                    handleInputChange(index, { target: { name: 'funcionarioId', value: func.id } });
                    setFuncionarioFilter(pessoa?.nome || `Funcionário ${func.id}`);
                    setShowFuncionarioDropdown(false);
                  }}
                >
                  {pessoa ? pessoa.nome : `Funcionário ${func.id}`}
                </li>
              );
            })}
          </ul>
        )}
        {showFuncionarioDropdown && filteredFuncionarios.length === 0 && (
          <ul className="dropdown-list">
            <li>Nenhum médico disponível</li>
          </ul>
        )}
      </div>
      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Digite para buscar paciente"
          value={pacienteFilter}
          onChange={(e) => {
            setPacienteFilter(e.target.value);
            setShowPacienteDropdown(true);
          }}
          onFocus={() => setShowPacienteDropdown(true)}
          onBlur={() => setTimeout(() => setShowPacienteDropdown(false), 200)}
          className="dropdown-input"
          required
        />
        {showPacienteDropdown && filteredPacientes.length > 0 && (
          <ul className="dropdown-list">
            {filteredPacientes.map(pac => (
              <li
                key={pac.id}
                onClick={() => {
                  handleInputChange(index, { target: { name: 'pacienteId', value: pac.id } });
                  setPacienteFilter(pac.nome);
                  setShowPacienteDropdown(false);
                }}
              >
                {pac.nome}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Digite para buscar consulta"
          value={consultaFilter}
          onChange={(e) => {
            setConsultaFilter(e.target.value);
            setShowConsultaDropdown(true);
          }}
          onFocus={() => setShowConsultaDropdown(true)}
          onBlur={() => setTimeout(() => setShowConsultaDropdown(false), 200)}
          className="dropdown-input"
          required
        />
        {showConsultaDropdown && filteredConsultas.length > 0 && (
          <ul className="dropdown-list">
            {filteredConsultas.map(consulta => (
              <li
                key={consulta.id}
                onClick={() => {
                  handleInputChange(index, { target: { name: 'consultaId', value: consulta.id } });
                  setConsultaFilter(consulta.motivoConsulta);
                  setShowConsultaDropdown(false);
                }}
              >
                {consulta.motivoConsulta}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Digite para buscar usuario"
          value={agendaFilter}
          onChange={(e) => {
            setAgendaFilter(e.target.value);
            setShowAgendaDropdown(true);
          }}
          onFocus={() => setShowAgendaDropdown(true)}
          onBlur={() => setTimeout(() => setShowAgendaDropdown(false), 200)}
          className="dropdown-input"
          required
        />
        {showAgendaDropdown && filteredAgendas.length > 0 && (
          <ul className="dropdown-list">
            {filteredAgendas.map(agenda => (
              <li
                key={agenda.id}
                onClick={() => {
                  handleInputChange(index, { target: { name: 'agendaId', value: agenda.id } });
                  setAgendaFilter(agenda.descricao);
                  setShowAgendaDropdown(false);
                }}
              >
                {agenda.descricao}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const NovaAgenda = () => {
  const [formularios, setFormularios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [linhasAgenda, setLinhasAgenda] = useState([]);
  const [activeTab, setActiveTab] = useState('nova-agenda');

  const fetchAllData = async () => {
    try {
      const [funcionariosRes, pessoasRes, pacientesRes, consultasRes, agendasRes, linhasAgendaRes] = await Promise.all([
        api.get('funcionario/all'),
        api.get('pessoa/all'),
        api.get('paciente/all'),
        api.get('consulta/all'),
        api.get('agenda/all'),
        api.get('linhaagenda/all')
      ]);

      setFuncionarios(funcionariosRes.data);
      setPessoas(pessoasRes.data);
      setPacientes(pacientesRes.data);
      setConsultas(consultasRes.data);
      setAgendas(agendasRes.data);
      setLinhasAgenda(linhasAgendaRes.data);
      console.log('Dados carregados em NovaAgenda:', {
        funcionarios: funcionariosRes.data,
        linhasAgenda: linhasAgendaRes.data
      });
    } catch (error) {
      console.error('Erro ao carregar dados em NovaAgenda:', error);
    }
  };

  const fetchLinhasAgenda = async () => {
    try {
      const response = await api.get('linhaagenda/list');
      setLinhasAgenda(response.data);
      console.log('LinhasAgenda atualizadas:', response.data);
    } catch (error) {
      console.error('Erro ao carregar linhasAgenda:', error);
    }
  };

  const fetchAgendas = async () => {
    try {
      const response = await api.get('agenda/all');
      setAgendas(response.data);
      console.log('Agendas atualizadas:', response.data);
    } catch (error) {
      console.error('Erro ao carregar agendas:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const adicionarFormulario = () => {
    const novoFormulario = {
      consultaId: '',
      funcionarioId: '',
      pacienteId: '',
      dataRealizacao: '',
      agendaId: '',
      uniqueKey: Date.now()
    };
    setFormularios([novoFormulario, ...formularios]);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const novosFormularios = [...formularios];
    novosFormularios[index] = { ...novosFormularios[index], [name]: value };
    setFormularios(novosFormularios);
    console.log('Formulários atualizados:', novosFormularios);
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString.replace('T', ' '));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const validateForm = (form) => {
    const requiredFields = ['consultaId', 'funcionarioId', 'pacienteId', 'dataRealizacao', 'agendaId'];
    return requiredFields.every(field => form[field] && form[field].toString().trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalidForms = formularios.filter(form => !validateForm(form));
    if (invalidForms.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios antes de salvar.');
      return;
    }

    try {
      for (const formulario of formularios) {
        const dataFormatada = formatDateForBackend(formulario.dataRealizacao);
        const linhaData = {
          consultaId: Number(formulario.consultaId),
          funcionarioId: Number(formulario.funcionarioId),
          pacienteId: Number(formulario.pacienteId),
          dataRealizacao: dataFormatada,
          agendaId: Number(formulario.agendaId),
          status: true
        };
        console.log('Enviando para POST linhaagenda/add:', linhaData);
        const response = await api.post('linhaagenda/add', linhaData);
        setLinhasAgenda(prev => [...prev, { ...linhaData, id: response.data.id }]);
      }
      setFormularios([]);
      setActiveTab('listar-agenda');
      fetchLinhasAgenda();
      alert('Linhas criadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar linhas da agenda:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert('Erro ao criar linhas. Verifique o console para mais detalhes.');
      await fetchLinhasAgenda();
    }
  };

  const handleUpdateLinha = async (e) => {
    e.preventDefault();
    const invalidForms = formularios.filter(form => !validateForm(form));
    if (invalidForms.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios antes de atualizar.');
      return;
    }

    try {
      for (const formulario of formularios) {
        const dataFormatada = formatDateForBackend(formulario.dataRealizacao);
        const linhaData = {
          id: Number(formulario.id),
          consultaId: Number(formulario.consultaId),
          funcionarioId: Number(formulario.funcionarioId),
          pacienteId: Number(formulario.pacienteId),
          dataRealizacao: dataFormatada,
          agendaId: Number(formulario.agendaId),
          status: true
        };
        console.log('Enviando para PUT linhaagenda/edit:', linhaData);
        await api.put('linhaagenda/edit', linhaData);
        setLinhasAgenda(prev =>
          prev.map(linha =>
            linha.id === formulario.id ? { ...linha, ...linhaData } : linha
          )
        );
      }
      setFormularios([]);
      setActiveTab('listar-agenda');
      fetchLinhasAgenda();
      alert('Linhas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar linha da agenda:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert('Erro ao atualizar linhas. Verifique o console para mais detalhes.');
      await fetchLinhasAgenda();
    }
  };

  return (
    <div className="form-container">
      {activeTab === 'nova-agenda' && (
        <>
          <h2>{formularios.length > 0 && formularios[0].id ? 'Editar Linha de Agenda' : 'Nova Linha de Agenda'}</h2>
          <div className="button-container">
            <button className="add-btn" onClick={adicionarFormulario}>+</button>
            {formularios.length > 0 && (
              <button type="submit" className="save-btn" onClick={formularios[0].id ? handleUpdateLinha : handleSubmit}>
                {formularios[0]?.id ? 'Atualizar' : 'Salvar Tudo'}
              </button>
            )}
          </div>
          {formularios.length > 0 && (
            <form className="agenda-form">
              {formularios.map((form, index) => (
                <FormRow
                  key={form.uniqueKey || index}
                  form={form}
                  index={index}
                  funcionarios={funcionarios}
                  pessoas={pessoas}
                  pacientes={pacientes}
                  consultas={consultas}
                  agendas={agendas}
                  linhasAgenda={linhasAgenda}
                  handleInputChange={handleInputChange}
                />
              ))}
            </form>
          )}
        </>
      )}

      {activeTab === 'listar-agenda' && (
        <ListarAgenda
          agendas={agendas}
          linhasAgenda={linhasAgenda}
          setAgendas={setAgendas}
          setLinhasAgenda={setLinhasAgenda}
          funcionarios={funcionarios}
          pessoas={pessoas}
          pacientes={pacientes}
          consultas={consultas}
          setFormularios={setFormularios}
          setActiveTab={setActiveTab}
          fetchAgendas={fetchAgendas}
          fetchLinhasAgenda={fetchLinhasAgenda}
          fetchAllData={fetchAllData}
        />
      )}
    </div>
  );
};

export default NovaAgenda;
