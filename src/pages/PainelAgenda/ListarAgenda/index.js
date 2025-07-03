import React, { useState, useRef, useEffect } from 'react';
import { api } from "../../../service/api";

const ListarAgenda = ({
  agendas,
  linhasAgenda,
  setAgendas,
  setLinhasAgenda,
  funcionarios,
  pessoas,
  pacientes,
  consultas,
  setFormularios,
  setActiveTab,
  fetchAgendas,
  fetchLinhasAgenda,
  fetchAllData,
}) => {
  const [editandoLinhaId, setEditandoLinhaId] = useState(null);
  const [linhaEditada, setLinhaEditada] = useState({});
  const [filtros, setFiltros] = useState({
    agenda: '',
    medico: '',
    paciente: '',
    consulta: '',
  });
  const [mostrarSugestoes, setMostrarSugestoes] = useState({
    agenda: false,
    medico: false,
    paciente: false,
    consulta: false,
  });
  const [filtroAtivo, setFiltroAtivo] = useState("todos"); // "todos", "emProcesso", "jaPassaram"

  // Estados para os comboboxes de data e hora
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [hora, setHora] = useState('');
  const [minuto, setMinuto] = useState('');

  const handleDeleteAgenda = async (agendaId) => {
    const confirmDelete = window.confirm("Tem certeza que deseja eliminar esta agenda?");
    if (confirmDelete) {
      try {
        await api.delete(`agenda/${agendaId}`);
        setAgendas(prev => prev.filter(agenda => agenda.id !== agendaId));
        setLinhasAgenda(prev => prev.filter(linha => linha.agendaId !== agendaId));
        alert('Agenda eliminada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar agenda:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        alert('Erro ao eliminar agenda. Verifique o console.');
        await fetchAgendas();
        await fetchLinhasAgenda();
      }
    }
  };

  const handleDeleteLinha = async (linhaId) => {
    const confirmDelete = window.confirm("Tem certeza que deseja eliminar esta linha da agenda?");
    if (confirmDelete) {
      try {
        await api.delete(`linhaagenda/${linhaId}`);
        setLinhasAgenda(prev => prev.filter(linha => linha.id !== linhaId));
      } catch (error) {
        console.error('Erro ao deletar linha da agenda:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        alert('Erro ao eliminar linha. Verifique o console.');
        await fetchLinhasAgenda();
      }
    }
  };

  const handleEditAgenda = (agenda) => {
    setFormularios([{ agendaId: agenda.id, dataRealizacao: '' }]);
    setActiveTab('nova-agenda');
  };

  const handleEditLinha = (linha) => {
    console.log('Linha original:', linha);
    const agenda = agendas.find(a => a.id === linha.agendaId);
    const pessoa = pessoas.find(p => p.id === funcionarios.find(f => f.id === Number(linha.funcionarioId))?.pessoaId);
    const paciente = pacientes.find(p => p.id === Number(linha.pacienteId));
    const consulta = consultas.find(c => c.id === Number(linha.consultaId));

    // Inicializa os estados dos comboboxes com base na dataRealizacao
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
      agendaId: linha.agendaId,
      status: linha.status,
      agendaDescricao: agenda?.descricao || '',
      medicoNome: pessoa?.nome || '',
      pacienteNome: paciente?.nome || '',
      consultaMotivo: consulta?.motivoConsulta || '',
    });
    setFiltros({
      agenda: agenda?.descricao || '',
      medico: pessoa?.nome || '',
      paciente: paciente?.nome || '',
      consulta: consulta?.motivoConsulta || '',
    });
    setMostrarSugestoes({
      agenda: false,
      medico: false,
      paciente: false,
      consulta: false,
    });
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    setFiltros(prev => ({ ...prev, [field]: value }));
    setLinhaEditada(prev => ({
      ...prev,
      [field === 'agenda' ? 'agendaDescricao' :
       field === 'medico' ? 'medicoNome' :
       field === 'paciente' ? 'pacienteNome' :
       field === 'consulta' ? 'consultaMotivo' :
       field === 'dataRealizacao' ? 'dataRealizacao' : field]: value,
    }));
    setMostrarSugestoes(prev => ({ ...prev, [field]: true }));
  };

  const handleSelectOption = (field, idField, value, id) => {
    setLinhaEditada(prev => ({
      ...prev,
      [field]: value,
      [idField]: id,
    }));
    setFiltros(prev => ({
      ...prev,
      [field === 'agendaDescricao' ? 'agenda' :
       field === 'medicoNome' ? 'medico' :
       field === 'pacienteNome' ? 'paciente' :
       'consulta']: value,
    }));
    setMostrarSugestoes(prev => ({
      ...prev,
      [field === 'agendaDescricao' ? 'agenda' :
       field === 'medicoNome' ? 'medico' :
       field === 'pacienteNome' ? 'paciente' :
       'consulta']: false,
    }));
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
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
      agendaId: 'Agenda',
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !linha[field] || linha[field].toString().trim() === '')
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}.`);
      return false;
    }
    return true;
  };

  // Atualiza dataRealizacao com base nos comboboxes
  const updateDataRealizacao = () => {
    if (dia && mes && ano && hora && minuto) {
      const newDateTime = `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
      console.log('Nova data/hora combinada:', newDateTime);
      setLinhaEditada(prev => ({ ...prev, dataRealizacao: newDateTime }));
    }
  };

  useEffect(() => {
    updateDataRealizacao();
  }, [dia, mes, ano, hora, minuto]);

  const handleSaveLinha = async (linhaId) => {
    if (!validateLinhaEditada(linhaEditada)) {
      return;
    }

    try {
      const dataFormatada = formatDateForBackend(linhaEditada.dataRealizacao);
      const linhaParaEnviar = {
        id: Number(linhaEditada.id),
        consultaId: Number(linhaEditada.consultaId),
        funcionarioId: Number(linhaEditada.funcionarioId),
        pacienteId: Number(linhaEditada.pacienteId),
        dataRealizacao: dataFormatada,
        agendaId: Number(linhaEditada.agendaId),
        status: linhaEditada.status,
      };
      console.log('Enviando para PUT linhaagenda/edit:', linhaParaEnviar);
      const response = await api.put('linhaagenda/edit', linhaParaEnviar);
      console.log('Resposta do backend:', response.status, response.data);
      setLinhasAgenda(prev =>
        prev.map(linha =>
          linha.id === linhaId ? { ...linha, ...linhaParaEnviar } : linha
        )
      );
      setEditandoLinhaId(null);
      setFiltros({ agenda: '', medico: '', paciente: '', consulta: '' });
      setMostrarSugestoes({ agenda: false, medico: false, paciente: false, consulta: false });
      alert('Linha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar linha editada:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert('Erro ao salvar a linha. Verifique o console para mais detalhes.');
      await fetchLinhasAgenda();
    }
  };

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

  const filteredAgendas = agendas.filter(a =>
    a.descricao.toLowerCase().includes(filtros.agenda.toLowerCase())
  );
  const filteredFuncionarios = funcionarios.filter(f => {
    const nome = pessoas.find(p => p.id === f.pessoaId)?.nome || '';
    return nome.toLowerCase().includes(filtros.medico.toLowerCase());
  });
  const filteredPacientes = pacientes.filter(p =>
    p.nome.toLowerCase().includes(filtros.paciente.toLowerCase())
  );
  const filteredConsultas = consultas.filter(c =>
    c.motivoConsulta.toLowerCase().includes(filtros.consulta.toLowerCase())
  );

  const getEstadoLinha = (linha) => {
    const now = new Date();
    const dataRealizacao = new Date(linha.dataRealizacao);
    if (!linha.status) {
      return "oculto";
    } else if (dataRealizacao > now) {
      return "emProcesso";
    } else {
      return "jaPassaram";
    }
  };

  const linhasFiltradas = linhasAgenda.filter(linha => {
    const estado = getEstadoLinha(linha);
    if (filtroAtivo === "todos") return true;
    return estado === filtroAtivo;
  });

  return (
    <div className="list-container">
      <h2>Lista de Agendas</h2>

      <div className="filtros-status">
        <button
          className={`filtro-btn ${filtroAtivo === "todos" ? "active" : ""}`}
          onClick={() => setFiltroAtivo("todos")}
        >
          Todas Agenda
        </button>
        <button
          className={`filtro-btn ${filtroAtivo === "emProcesso" ? "active" : ""}`}
          onClick={() => setFiltroAtivo("emProcesso")}
        >
          Agendas Em Processos
        </button>
        <button
          className={`filtro-btn ${filtroAtivo === "jaPassaram" ? "active" : ""}`}
          onClick={() => setFiltroAtivo("jaPassaram")}
        >
          Agendas passadas
        </button>
      </div>

      <table className="agenda-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Médico</th>
            <th>Paciente</th>
            <th>Consulta</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {linhasFiltradas.map(linha => {
            const agenda = agendas.find(a => a.id === linha.agendaId);
            const pessoa = pessoas.find(p => p.id === funcionarios.find(f => f.id === Number(linha.funcionarioId))?.pessoaId);
            const paciente = pacientes.find(p => p.id === Number(linha.pacienteId));
            const consulta = consultas.find(c => c.id === Number(linha.consultaId));

            return (
              <tr key={linha.id}>
                <td data-label="Agenda">
                  {editandoLinhaId === linha.id ? (
                    <div className="filter-input-container">
                      <input
                        type="text"
                        value={filtros.agenda}
                        onChange={(e) => handleChange(e, 'agenda')}
                        className="edit-field"
                        placeholder="Digite para filtrar agendas..."
                        required
                      />
                      {mostrarSugestoes.agenda && (
                        <ul className="suggestions">
                          {filteredAgendas.map(a => (
                            <li
                              key={a.id}
                              onClick={() => handleSelectOption('agendaDescricao', 'agendaId', a.descricao, a.id)}
                            >
                              {a.descricao}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    agenda?.descricao || 'Sem Agenda'
                  )}
                </td>
                <td data-label="Médico">
                  {editandoLinhaId === linha.id ? (
                    <div className="filter-input-container">
                      <input
                        type="text"
                        value={filtros.medico}
                        onChange={(e) => handleChange(e, 'medico')}
                        className="edit-field"
                        placeholder="Digite para filtrar médicos..."
                        required
                      />
                      {mostrarSugestoes.medico && (
                        <ul className="suggestions">
                          {filteredFuncionarios.map(f => {
                            const nome = pessoas.find(p => p.id === f.pessoaId)?.nome || f.id;
                            return (
                              <li
                                key={f.id}
                                onClick={() => handleSelectOption('medicoNome', 'funcionarioId', nome, f.id)}
                              >
                                {nome}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    pessoa?.nome || linha.funcionarioId
                  )}
                </td>
                <td data-label="Paciente">
                  {editandoLinhaId === linha.id ? (
                    <div className="filter-input-container">
                      <input
                        type="text"
                        value={filtros.paciente}
                        onChange={(e) => handleChange(e, 'paciente')}
                        className="edit-field"
                        placeholder="Digite para filtrar pacientes..."
                        required
                      />
                      {mostrarSugestoes.paciente && (
                        <ul className="suggestions">
                          {filteredPacientes.map(p => (
                            <li
                              key={p.id}
                              onClick={() => handleSelectOption('pacienteNome', 'pacienteId', p.nome, p.id)}
                            >
                              {p.nome}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    paciente?.nome || linha.pacienteId
                  )}
                </td>
                <td data-label="Consulta">
                  {editandoLinhaId === linha.id ? (
                    <div className="filter-input-container">
                      <input
                        type="text"
                        value={filtros.consulta}
                        onChange={(e) => handleChange(e, 'consulta')}
                        className="edit-field"
                        placeholder="Digite para filtrar consultas..."
                        required
                      />
                      {mostrarSugestoes.consulta && (
                        <ul className="suggestions">
                          {filteredConsultas.map(c => (
                            <li
                              key={c.id}
                              onClick={() => handleSelectOption('consultaMotivo', 'consultaId', c.motivoConsulta, c.id)}
                            >
                              {c.motivoConsulta}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    consulta?.motivoConsulta || linha.consultaId
                  )}
                </td>
                <td data-label="Data">
                  {editandoLinhaId === linha.id ? (
                    <div className="date-time-container">
                      <select
                        value={dia}
                        onChange={(e) => setDia(e.target.value)}
                        required
                        className="edit-field"
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
                        className="edit-field"
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
                        className="edit-field"
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
                        className="edit-field"
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
                        className="edit-field"
                      >
                        <option value="">Minuto</option>
                        {minutos.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    linha.dataRealizacao
                  )}
                </td>
                <td data-label="Ações" className="action-buttons">
                  {editandoLinhaId === linha.id ? (
                    <button
                      className="save-btn"
                      onClick={() => handleSaveLinha(linha.id)}
                    >
                      Atualizar
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleEditLinha(linha)}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteLinha(linha.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
          {agendas
            .filter(agenda => !linhasFiltradas.some(linha => linha.agendaId === agenda.id))
            .map(agenda => (
              <tr key={agenda.id}>
                <td data-label="Agenda">{agenda.descricao}</td>
                <td data-label="Médico" colSpan="4">Nenhuma linha cadastrada</td>
                <td data-label="Ações" className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditAgenda(agenda)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteAgenda(agenda.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {linhasFiltradas.length === 0 && agendas.length === 0 && (
        <p className="no-data">Nenhuma agenda ou linha cadastrada.</p>
      )}
    </div>
  );
};

export default ListarAgenda;