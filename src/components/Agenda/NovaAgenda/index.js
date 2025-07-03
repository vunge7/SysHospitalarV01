import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Select, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import './style.css';
import {viewPdfGenerico} from "../../util/utilitarios";

const FormRow = ({ form, index, funcionarios, pessoas, pacientes, consultas, agendas, linhasAgenda = [], handleInputChange }) => {
  const [funcionarioFilter, setFuncionarioFilter] = useState(form.funcionarioFilter || '');
  const [pacienteFilter, setPacienteFilter] = useState(form.pacienteFilter || '');
  const [consultaFilter, setConsultaFilter] = useState(form.consultaFilter || '');
  const [dia, setDia] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getDate().toString().padStart(2, '0') : '');
  const [mes, setMes] = useState(form.dataRealizacao ? (new Date(form.dataRealizacao).getMonth() + 1).toString().padStart(2, '0') : '');
  const [ano, setAno] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getFullYear().toString() : '');
  const [hora, setHora] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getHours().toString().padStart(2, '0') : '');
  const [minuto, setMinuto] = useState(form.dataRealizacao ? new Date(form.dataRealizacao).getMinutes().toString().padStart(2, '0') : '');

  useEffect(() => {
    console.log('Dados recebido em FormRow:', {
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
    pac && pac.nome && pac.nome.toLowerCase().includes(pacienteFilter.toLowerCase())
  );

  const filteredConsultas = consultas.filter(cons =>
    cons && cons.productDescription &&
    cons.productDescription.toLowerCase().includes(consultaFilter.toLowerCase())
  );

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

  return (
    <div className="form-row">
      <Form.Item label="Data e Hora" required style={{ width: '100%' }}>
        <div className="date-time-container">
          <Select
            value={ano || undefined}
            onChange={(value) => setAno(value)}
            placeholder="Ano"
            style={{ width: 100 }}
          >
            <Select.Option value="">Ano</Select.Option>
            {anos.map(a => (
              <Select.Option key={a} value={a}>{a}</Select.Option>
            ))}
          </Select>
          <Select
            value={mes || undefined}
            onChange={(value) => setMes(value)}
            placeholder="Mês"
            style={{ width: 120 }}
          >
            <Select.Option value="">Mês</Select.Option>
            {meses.map(m => (
              <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
            ))}
          </Select>
          <Select
            value={dia || undefined}
            onChange={(value) => setDia(value)}
            placeholder="Dia"
            style={{ width: 80 }}
          >
            <Select.Option value="">Dia</Select.Option>
            {dias.map(d => (
              <Select.Option key={d} value={d}>{d}</Select.Option>
            ))}
          </Select>
          <Select
            value={hora || undefined}
            onChange={(value) => setHora(value)}
            placeholder="Hora"
            style={{ width: 80 }}
          >
            <Select.Option value="">Hora</Select.Option>
            {horas.map(h => (
              <Select.Option key={h} value={h}>{h}</Select.Option>
            ))}
          </Select>
          <Select
            value={minuto || undefined}
            onChange={(value) => setMinuto(value)}
            placeholder="Minuto"
            style={{ width: 80 }}
          >
            <Select.Option value="">Minuto</Select.Option>
            {minutos.map(m => (
              <Select.Option key={m} value={m}>{m}</Select.Option>
            ))}
          </Select>
        </div>
      </Form.Item>
      <Form.Item label="Médico" name={`funcionarioId_${index}`} rules={[{ required: true, message: 'Selecione um médico' }]} style={{ width: '100%' }}>
        <Select
          showSearch
          value={funcionarioFilter || undefined}
          placeholder="Buscar médico"
          onSearch={(value) => setFuncionarioFilter(value)}
          onChange={(value, option) => {
            handleInputChange(index, { target: { name: 'funcionarioId', value } });
            setFuncionarioFilter(option.children);
          }}
          filterOption={false}
          style={{ width: '100%' }}
        >
          {filteredFuncionarios.length > 0 ? (
            filteredFuncionarios.map(func => {
              const pessoa = pessoas.find(p => p.id === func.pessoaId);
              return (
                <Select.Option key={func.id} value={func.id}>
                  {pessoa ? pessoa.nome : `Funcionário ${func.id}`}
                </Select.Option>
              );
            })
          ) : (
            <Select.Option disabled>Nenhum médico disponível</Select.Option>
          )}
        </Select>
      </Form.Item>
      <Form.Item label="Paciente" name={`pacienteId_${index}`} rules={[{ required: true, message: 'Selecione um paciente' }]} style={{ width: '100%' }}>
        <Select
          showSearch
          value={pacienteFilter || undefined}
          placeholder="Buscar paciente"
          onSearch={(value) => setPacienteFilter(value)}
          onChange={(value, option) => {
            handleInputChange(index, { target: { name: 'pacienteId', value } });
            setPacienteFilter(option.children);
          }}
          filterOption={false}
          style={{ width: '100%' }}
        >
          {filteredPacientes.length > 0 ? (
            filteredPacientes.map(pac => (
              <Select.Option key={pac.id} value={pac.id}>{pac.nome}</Select.Option>
            ))
          ) : (
            <Select.Option disabled>Nenhum paciente encontrado</Select.Option>
          )}
        </Select>
      </Form.Item>
      <Form.Item label="Consulta" name={`consultaId_${index}`} rules={[{ required: true, message: 'Selecione uma consulta' }]} style={{ width: '100%' }}>
        <Select
          showSearch
          value={consultaFilter || undefined}
          placeholder="Buscar consulta"
          onSearch={(value) => setConsultaFilter(value)}
          onChange={(value, option) => {
            handleInputChange(index, { target: { name: 'consultaId', value } });
            setConsultaFilter(option.children);
          }}
          filterOption={false}
          style={{ width: '100%' }}
        >
          {filteredConsultas.length > 0 ? (
            filteredConsultas.map(consulta => (
              <Select.Option key={consulta.id} value={consulta.id}>
                {consulta.productDescription}
              </Select.Option>
            ))
          ) : (
            <Select.Option disabled>Nenhuma consulta encontrada</Select.Option>
          )}
        </Select>
      </Form.Item>
    </div>
  );
};

const NovaAgenda = () => {
  const [form] = Form.useForm();
  const [formularios, setFormularios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [linhasAgenda, setLinhasAgenda] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [funcionariosRes, pessoasRes, pacientesRes, produtosRes, agendasRes, linhasAgendaRes] = await Promise.all([
        api.get('funcionario/all'),
        api.get('pessoa/all'),
        api.get('paciente/all'),
        api.get('produto/all'),
        api.get('agenda/all'),
        api.get('linhaagenda/all')
      ]);

      console.log('Produtos recebidos:', produtosRes.data);
      const produtosConsultas = produtosRes.data.filter(produto =>
        produto.productGroup &&
        produto.productGroup.toLowerCase() === 'consultas' &&
        produto.productDescription
      );
      console.log('Consultas filtradas:', produtosConsultas);

      setFuncionarios(funcionariosRes.data || []);
      setPessoas(pessoasRes.data || []);
      setPacientes(pacientesRes.data || []);
      setConsultas(produtosConsultas || []);
      setAgendas(agendasRes.data || []);
      setLinhasAgenda(linhasAgendaRes.data || []);

      console.log('Dados carregados em NovaAgenda:', {
        funcionarios: funcionariosRes.data,
        linhasAgenda: linhasAgendaRes.data,
        consultas: produtosConsultas,
        pessoas: pessoasRes.data
      });

      if (produtosConsultas.length === 0) {
        console.warn('Nenhuma consulta válida encontrada. Verifique o backend.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados em NovaAgenda:', error);
      message.error({
        content: 'Erro ao carregar dados. Tente novamente.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } finally {
      setIsLoading(false);
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
      agendaId: agendas[0]?.id || '',
      uniqueKey: Date.now()
    };
    setFormularios([novoFormulario]);
    setIsModalVisible(true);
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

  const prepareEmailData = (form, pacientes, pessoas, funcionarios, consultas) => {
    const paciente = pacientes.find(p => p.id === Number(form.pacienteId));
    const funcionario = funcionarios.find(f => f.id === Number(form.funcionarioId));
    const pessoaMedico = pessoas.find(p => p.id === funcionario?.pessoaId);
    const pessoaPaciente = pessoas.find(p => p.id === paciente?.pessoaId);
    const consulta = consultas.find(c => c.id === Number(form.consultaId));

    const dataRealizacao = new Date(form.dataRealizacao.replace('T', ' '));
    const data = `${dataRealizacao.getDate().toString().padStart(2, '0')}/${(dataRealizacao.getMonth() + 1).toString().padStart(2, '0')}/${dataRealizacao.getFullYear()}`;
    const hora = `${dataRealizacao.getHours().toString().padStart(2, '0')}:${dataRealizacao.getMinutes().toString().padStart(2, '0')}`;

    return {
      pacienteEmail: pessoaPaciente?.email || '',
      dotorEmail: pessoaMedico?.email || '',
      pacienteNome: pessoaPaciente?.nome || 'Paciente Desconhecido',
      dotorNome: pessoaMedico?.nome || 'Médico Desconhecido',
      data,
      hora,
      consulta: consulta?.productDescription || 'Consulta Desconhecida',
      funcionarioId: funcionario?.id || ''
    };
  };

  const sendEmailInBackground = async (formulario) => {
    try {
      const emailData = prepareEmailData(formulario, pacientes, pessoas, funcionarios, consultas);
      console.log('Enviando e-mail em segundo plano:', emailData);
      message.loading({
        content: 'Enviando e-mail de confirmação...',
        key: 'emailSending',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
      if (!emailData.pacienteEmail || !emailData.dotorEmail) {
        console.warn('E-mails do paciente ou médico não disponíveis, e-mail não enviado:', emailData);
        message.warning({
          content: 'E-mails do paciente ou médico não disponíveis.',
          key: 'emailSending',
          className: 'custom-message',
          style: { top: '20px', right: '20px' }
        });
        return;
      }
      await api.post('enviar-email', emailData);
      message.success({
        content: 'E-mail de confirmação enviado com sucesso!',
        key: 'emailSending',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      message.error({
        content: 'Erro ao enviar e-mail de confirmação.',
        key: 'emailSending',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    }
  };

  const handleOk = async () => {
    try {
      await form.validateFields();
      setIsSaving(true);
      const createdForms = [];
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
        createdForms.push(formulario);
      }
      setFormularios([]);
      setIsModalVisible(false);
      form.resetFields();
      await fetchAllData();
      message.success({
        content: 'Linha de agenda criada com sucesso!',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });

      // Enviar e-mails em segundo plano
      createdForms.forEach(formulario => {
        sendEmailInBackground(formulario);
      });
    } catch (error) {
      console.error('Erro ao salvar linha de agenda:', error);
      message.error({
        content: 'Erro ao criar linha de agenda. Verifique os dados e tente novamente.',
        className: 'custom-message',
        style: { top: '20px', right: '20px' }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormularios([]);
    setIsModalVisible(false);
  };

  return (
    <div className="nova-agenda-container">
      {isLoading ? (
        <Spin tip="Carregando dados..." className="spinner" />
      ) : (
        <>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={adicionarFormulario}
            className="add-btn"
          >
            Adicionar Novo Agendamento
          </Button>
          <Button onClick={() => viewPdfGenerico('agendamento', 1)}>Teste PDF</Button>   
          <Modal
            title="Novo Agendamento"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Salvar"
            cancelText="Cancelar"
            confirmLoading={isSaving}
            width={800}
            className="agenda-modal"
          >
            <Form form={form} layout="vertical" className="agenda-form">
              {formularios.map((formItem, index) => (
                <FormRow
                  key={formItem.uniqueKey || index}
                  form={formItem}
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
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default NovaAgenda;