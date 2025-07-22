import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Select, Spin, message, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import './style.css';
import {viewPdfGenerico} from "../../util/utilitarios";
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const FormRow = ({ form, index, funcionarios, pessoas, pacientes, consultas, agendas, linhasAgenda = [], handleInputChange }) => {
  const [funcionarioFilter, setFuncionarioFilter] = useState(form.funcionarioFilter || '');
  const [pacienteFilter, setPacienteFilter] = useState(form.pacienteFilter || '');
  const [consultaFilter, setConsultaFilter] = useState(form.consultaFilter || '');
  const [dateTime, setDateTime] = useState(form.dataRealizacao ? (typeof form.dataRealizacao === 'string' ? dayjs(form.dataRealizacao) : form.dataRealizacao) : null);

  useEffect(() => {
    setDateTime(form.dataRealizacao ? (typeof form.dataRealizacao === 'string' ? dayjs(form.dataRealizacao) : form.dataRealizacao) : null);
  }, [form.dataRealizacao]);

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
      return true;
    }
    if (!Array.isArray(linhasAgenda) || linhasAgenda.length === 0) {
      return true;
    }
    const ONE_HOUR = 60 * 60 * 1000;
    const medicoOcupado = linhasAgenda.some(linha => {
      const linhaDate = normalizeDate(linha.dataRealizacao);
      if (!linhaDate) return false;
      const medicoIgual = Number(linha.funcionarioId) === Number(funcionarioId);
      const diffInMs = Math.abs(selectedDate.getTime() - linhaDate.getTime());
      return medicoIgual && diffInMs < ONE_HOUR;
    });
    return !medicoOcupado;
  };

  const filteredFuncionarios = funcionarios.filter(func => {
    const pessoa = pessoas.find(p => p.id === func.pessoaId);
    const matchesFilter = pessoa?.nome.toLowerCase().includes(funcionarioFilter.toLowerCase());
    const isAvailable = isMedicoDisponivel(func.id, form.dataRealizacao);
    return matchesFilter && isAvailable;
  });

  const filteredPacientes = pacientes.filter(pac =>
    pac && pac.nome && pac.nome.toLowerCase().includes(pacienteFilter.toLowerCase())
  );

  const filteredConsultas = consultas.filter(cons =>
    cons && cons.productDescription &&
    cons.productDescription.toLowerCase().includes(consultaFilter.toLowerCase())
  );

  const handleDateChange = (value) => {
    setDateTime(value);
    handleInputChange(index, { target: { name: 'dataRealizacao', value: value ? value.format('YYYY-MM-DD HH:mm:ss') : '' } });
  };

  return (
    <div className="form-row">
      <Form.Item label="Data e Hora" required style={{ width: '100%' }}>
        <DatePicker
          showTime
          value={dateTime}
          onChange={handleDateChange}
          format="YYYY-MM-DD HH:mm"
          style={{ width: '100%' }}
          placeholder="Selecione data e hora"
        />
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

const NovaAgenda = ({ isModalVisible, setIsModalVisible, tipoAgendamento = 'consultas', onAgendamentoCriado }) => {
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

      let produtosConsultas = produtosRes.data.filter(produto =>
        produto.productGroup &&
        produto.productGroup.toLowerCase() === tipoAgendamento &&
        produto.productDescription
      );
      if (produtosConsultas.length === 0 && tipoAgendamento === 'cirurgia') {
        // fallback: se não houver grupo 'cirurgia', pega todos
        produtosConsultas = produtosRes.data.filter(produto => produto.productDescription);
      }

      setFuncionarios(funcionariosRes.data || []);
      setPessoas(pessoasRes.data || []);
      setPacientes(pacientesRes.data || []);
      setConsultas(produtosConsultas || []);
      setAgendas(agendasRes.data || []);
      setLinhasAgenda(linhasAgendaRes.data || []);
    } catch (error) {
      message.error('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      fetchAllData();
      // Ao abrir, já prepara um formulário vazio
      setFormularios([{
        consultaId: '',
        funcionarioId: '',
        pacienteId: '',
        dataRealizacao: '',
        agendaId: agendas[0]?.id || '',
        uniqueKey: uuidv4()
      }]);
    }
  }, [isModalVisible, tipoAgendamento]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const novosFormularios = [...formularios];
    novosFormularios[index] = { ...novosFormularios[index], [name]: value };
    setFormularios(novosFormularios);
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

  const handleOk = async () => {
    try {
      await form.validateFields();
      setIsSaving(true);
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
        await api.post('linhaagenda/add', linhaData);
      }
      setFormularios([]);
      setIsModalVisible(false);
      form.resetFields();
      if (onAgendamentoCriado) onAgendamentoCriado();
      message.success('Linha de agenda criada com sucesso!');
    } catch (error) {
      message.error('Erro ao criar linha de agenda. Verifique os dados e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      form.resetFields();
      setFormularios([]);
    }, 300);
  };

  return (
    <Modal
      title={tipoAgendamento === 'cirurgia' ? 'Nova Cirurgia' : 'Novo Agendamento'}
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={isSaving}
      width={800}
      className="agenda-modal"
    >
      {isLoading ? (
        <Spin tip="Carregando dados..." className="spinner" />
      ) : (
        <Form form={form} layout="vertical" className="agenda-form">
          {formularios.map((formItem, index) => (
            <FormRow
              key={formItem.uniqueKey}
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
      )}
    </Modal>
  );
};

export default NovaAgenda;