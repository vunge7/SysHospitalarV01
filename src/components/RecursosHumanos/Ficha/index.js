import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Modal, Checkbox, AutoComplete, message, Row, Col, DatePicker, Space, Table } from 'antd';
import 'antd/dist/reset.css';
import './Ficha.css';
import { api } from '../../../service/api';
import moment from 'moment';

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

const tiposDeContrato = [
  { value: 'TEMPO_INDETERMINADO', label: 'Tempo Indeterminado' },
  { value: 'TERMO_CERTO', label: 'Termo Certo' },
  { value: 'TERMO_INCERTO', label: 'Termo Incerto' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'PRESTACAO_SERVICOS', label: 'Prestação de Serviços' },
  { value: 'EVENTUAL', label: 'Eventual' },
  { value: 'APRENDIZ', label: 'Aprendiz' }
];

const segurancaSocialOpcoes = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NAO', label: 'Não' }
];

const fechoDeContasOpcoes = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'ANUAL', label: 'Anual' }
];

const estadosFuncionario = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' }
];

const estadosCivis = [
  { value: 'SOLTEIRO', label: 'Solteiro' },
  { value: 'CASADO', label: 'Casado' },
  { value: 'DIVORCIADO', label: 'Divorciado' },
  { value: 'VIUVO', label: 'Viúvo' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' },
];

const Ficha = () => {
  const [pessoas, setPessoas] = useState([]);
  const [subsidios, setSubsidios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubsidiosLoading, setIsSubsidiosLoading] = useState(false);
  const [isDepartamentosLoading, setIsDepartamentosLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState(null);
  const [isPessoaMarked, setIsPessoaMarked] = useState(false);
  const [form] = Form.useForm();
  const [funcionarioForm] = Form.useForm();
  const [subsidioTemp, setSubsidioTemp] = useState({ id: null, descricao: '', valor: '' });
  const [filtro, setFiltro] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [funcionarioId, setFuncionarioId] = useState(null);

  const generos = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMININO', label: 'Feminino' },
    { value: 'OUTRO', label: 'Outro' },
  ];

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

  const fetchPessoas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('pessoa/all');
      const cleanedData = Array.isArray(response.data)
        ? response.data.map(cleanObject)
        : [];
      setPessoas(cleanedData);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Erro ao carregar pessoas.');
      setPessoas([]);
    } finally {
      setIsLoading(false);
    }
  }, [cleanObject]);

  const fetchSubsidios = useCallback(async () => {
    setIsSubsidiosLoading(true);
    try {
      const response = await api.get('subsidio/all');
      const subsidiosData = Array.isArray(response.data)
        ? response.data.map(cleanObject)
        : [];
      setSubsidios(subsidiosData);
    } catch (error) {
      console.error('Erro ao carregar subsídios:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Erro ao carregar subsídios.');
      setSubsidios([]);
    } finally {
      setIsSubsidiosLoading(false);
    }
  }, [cleanObject]);

  const fetchDepartamentos = useCallback(async () => {
    setIsDepartamentosLoading(true);
    try {
      const response = await api.get('departamento/all');
      const departamentosData = Array.isArray(response.data)
        ? response.data.map(cleanObject)
        : [];
      setDepartamentos(departamentosData);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Erro ao carregar departamentos.');
      setDepartamentos([]);
    } finally {
      setIsDepartamentosLoading(false);
    }
  }, [cleanObject]);

  const fetchFuncionarioByPessoaId = useCallback(async (pessoaId) => {
    try {
      const response = await api.get(`funcionario/pessoa/${pessoaId}`);
      if (response.data && response.data.id) {
        const funcionario = response.data;
        const subsidiosConsolidados = [];
        const subsidiosMap = new Map();
        if (funcionario.subsidios) {
          funcionario.subsidios.forEach((s) => {
            const subsidio = subsidios.find((sub) => sub.id === s.subsidioId);
            const descricao = subsidio?.descricao || s.subsidioId;
            subsidiosMap.set(s.subsidioId, {
              subsidioId: s.subsidioId,
              descricao: descricao,
              valor: s.valor,
            });
          });
          subsidiosMap.forEach((value) => subsidiosConsolidados.push(value));
          if (subsidiosMap.size < funcionario.subsidios.length) {
            message.warning('Subsídios duplicados encontrados. Mantendo apenas o último valor para cada tipo.');
          }
        }
        console.log('Subsídios consolidados:', JSON.stringify(subsidiosConsolidados, null, 2));

        setEditMode(true);
        setFuncionarioId(funcionario.id);
        funcionarioForm.setFieldsValue({
          tipoDeContrato: funcionario.tipoDeContrato,
          salario: funcionario.salario,
          dataAdmissao: funcionario.dataAdmissao ? moment(funcionario.dataAdmito) : null,
          descricao: funcionario.descricao,
          cargo: funcionario.cargo,
          departamentoId: funcionario.departamentoId,
          segurancaSocial: funcionario.segurancaSocial,
          fechoContas: funcionario.fechoContas,
          estadoFuncionario: funcionario.estadoFuncionario,
          subsidios: subsidiosConsolidados,
        });
        message.info('Funcionário carregado para edição.');
      } else {
        setEditMode(false);
        setFuncionarioId(null);
        funcionarioForm.resetFields();
      }
    } catch (error) {
      console.error('Erro ao verificar funcionário:', error.response?.data || error);
      if (error.response?.status === 404) {
        setEditMode(false);
        setFuncionarioId(null);
        funcionarioForm.resetFields();
      } else {
        message.error(error.response?.data?.message || 'Erro ao verificar funcionário.');
      }
    }
  }, [funcionarioForm, subsidios]);

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
    fetchPessoas();
    fetchSubsidios();
    fetchDepartamentos();
  }, [fetchPessoas, fetchSubsidios, fetchDepartamentos]);

  const abrirModal = () => setIsModalOpen(true);
  const fecharModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSelectSugestao = async (value, option) => {
    try {
      const pessoa = option.pessoa;
      setSelectedPessoa(pessoa);
      setIsPessoaMarked(true);
      setFiltro('');
      setSugestoes([]);
      message.success('Pessoa selecionada com sucesso!');
      await fetchFuncionarioByPessoaId(pessoa.id);
    } catch (error) {
      console.error('Erro ao selecionar pessoa:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Erro ao selecionar pessoa.');
    }
  };

  const handleSubmitPessoa = async (values) => {
    try {
      const pessoaData = {
        nome: values.nome,
        apelido: values.apelido,
        nif: values.nif,
        dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : null,
        localNascimento: values.localNascimento,
        telefone: values.telefone,
        email: values.email,
        endereco: values.endereco,
        genero: values.genero,
        bairro: values.bairro,
        estadoCivil: values.estadoCivil,
        pai: values.pai,
        mae: values.mae,
        nacionalidade: values.nacionalidade,
        raca: values.raca,
        paisEndereco: values.paisEndereco,
        provinciaEndereco: values.provinciaEndereco,
        municipioEndereco: values.municipioEndereco,
        paisNascimento: values.paisNascimento,
        provinciaNascimento: values.provinciaNascimento,
        municipioNascimento: values.municipioNascimento,
        profissao: values.profissao,
        habilitacao: values.habilitacao,
        nomePhoto: values.nomePhoto,
      };

      console.log('Enviando pessoa para /pessoa/add:', JSON.stringify(pessoaData, null, 2));
      const response = await api.post('pessoa/add', pessoaData);
      const novaPessoa = cleanObject(response.data);
      setPessoas((prev) => [...prev, novaPessoa]);
      setSelectedPessoa(novaPessoa);
      setIsPessoaMarked(true);
      fecharModal();
      message.success('Pessoa cadastrada com sucesso!');
      await fetchPessoas();
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error.response?.data || error);
      const errorMessage = error.response?.data?.message;
      if (error.response?.status === 400 && typeof errorMessage === 'string') {
        if (errorMessage.includes('Nome')) {
          message.error('Nome é obrigatório.');
        } else if (errorMessage.includes('Gênero')) {
          message.error('Gênero inválido. Deve ser MASCULINO, FEMININO ou OUTRO.');
        } else if (errorMessage.includes('Apelido')) {
          message.error('Apelido é obrigatório.');
        } else if (errorMessage.includes('NIF')) {
          message.error('NIF é obrigatório.');
        } else {
          message.error(errorMessage || 'Falha ao cadastrar pessoa.');
        }
      } else {
        message.error(errorMessage || 'Falha ao cadastrar pessoa.');
      }
    }
  };

  const handleSubmitFuncionario = async (values) => {
    if (isSubmitting) return;
    if (!selectedPessoa || !selectedPessoa.id) {
      message.error('Nenhuma pessoa selecionada ou ID inválido.');
      return;
    }
    if (!isPessoaMarked) {
      message.warning('Por favor, marque a pessoa selecionada!');
      return;
    }

    setIsSubmitting(true);
    try {
      const salario = parseFloat(values.salario);
      if (isNaN(salario) || salario < 0) {
        message.error('O salário deve ser maior ou igual a zero.');
        return;
      }

      const formSubsidios = values.subsidios || [];
      console.log('Subsídios no formulário:', JSON.stringify(formSubsidios, null, 2));

      const funcionarioData = {
        pessoaId: Number(selectedPessoa.id),
        tipoDeContrato: values.tipoDeContrato,
        salario: salario,
        dataAdmissao: moment.utc(values.dataAdmissao).format('YYYY-MM-DD HH:mm:ss'),
        descricao: values.descricao || '',
        cargo: values.cargo,
        departamentoId: Number(values.departamentoId),
        fechoContas: values.fechoContas,
        segurancaSocial: values.segurancaSocial,
        estadoFuncionario: values.estadoFuncionario,
        subsidios: formSubsidios.map((s) => {
          const valor = parseFloat(s.valor);
          const subsidio = subsidios.find((sub) => sub.descricao === s.descricao);
          if (!subsidio?.id) {
            throw new Error(`Subsídio ${s.descricao} não encontrado.`);
          }
          if (isNaN(valor) || valor <= 0) {
            throw new Error(`Valor inválido para o subsídio ${s.descricao}. Deve ser maior que zero.`);
          }
          return {
            subsidioId: Number(subsidio.id),
            valor: valor,
            usuarioId: null,
          };
        }),
      };

      console.log(
        editMode
          ? `Enviando dados para /funcionario/update/${funcionarioId}:`
          : 'Enviando dados para /funcionario/add:',
        JSON.stringify(funcionarioData, null, 2)
      );

      const response = editMode
        ? await api.put(`funcionario/update/${funcionarioId}`, funcionarioData)
        : await api.post('funcionario/add', funcionarioData);

      console.log('Resposta do servidor:', JSON.stringify(response.data, null, 2));

      funcionarioForm.resetFields();
      setSelectedPessoa(null);
      setIsPessoaMarked(false);
      setEditMode(false);
      setFuncionarioId(null);
      message.success(editMode ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Falha ao cadastrar/atualizar funcionário.';
      if (error.response?.status === 400) {
        if (errorMessage.includes('obrigatório')) {
          message.error('Campos obrigatórios não preenchidos: ' + errorMessage);
        } else if (errorMessage.includes('Cannot deserialize')) {
          message.error('Formato de dados inválido (ex.: data ou enum). Verifique os campos e tente novamente.');
        } else if (errorMessage.includes('valor deve ser positivo')) {
          message.error('O valor de algum subsídio deve ser maior que zero.');
        } else {
          message.error(errorMessage);
        }
      } else if (error.response?.status === 404) {
        message.error('Recurso não encontrado (ex.: pessoa, subsídio ou departamento).');
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFuncionario = async () => {
    if (!funcionarioId) {
      message.error('Nenhum funcionário selecionado para deleção.');
      return;
    }
    try {
      await api.delete(`funcionario/delete/${funcionarioId}`);
      funcionarioForm.resetFields();
      setSelectedPessoa(null);
      setIsPessoaMarked(false);
      setEditMode(false);
      setFuncionarioId(null);
      message.success('Funcionário deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Falha ao deletar funcionário.');
    }
  };

  const handleDeleteSubsidio = async (record, index) => {
    const currentSubsidios = funcionarioForm.getFieldValue('subsidios') || [];
    funcionarioForm.setFieldsValue({
      subsidios: currentSubsidios.filter((_, i) => i !== index),
    });
    message.success('Subsídio removido da lista!');
  };

  const handleAddSubsidio = () => {
    const valor = parseFloat(subsidioTemp.valor);
    if (subsidioTemp.id && subsidioTemp.descricao && !isNaN(valor) && valor > 0) {
      const currentSubsidios = funcionarioForm.getFieldValue('subsidios') || [];
      const existingSubsidioIndex = currentSubsidios.findIndex((s) => s.descricao === subsidioTemp.descricao);
      let newSubsidios;
      if (existingSubsidioIndex !== -1) {
        newSubsidios = [...currentSubsidios];
        newSubsidios[existingSubsidioIndex] = {
          subsidioId: subsidioTemp.id,
          descricao: subsidioTemp.descricao,
          valor,
        };
        message.info(`Subsídio ${tipoSubsidioMap[subsidioTemp.descricao] || subsidioTemp.descricao} atualizado na lista!`);
      } else {
        newSubsidios = [...currentSubsidios, { subsidioId: subsidioTemp.id, descricao: subsidioTemp.descricao, valor }];
        message.success('Subsídio adicionado à lista!');
      }
      funcionarioForm.setFieldsValue({ subsidios: newSubsidios });
      setSubsidioTemp({ id: null, descricao: '', valor: '' });
    } else {
      message.warning('Preencha todos os campos do subsídio com valores válidos e positivos!');
    }
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
      render: (_, record, index) => (
        <Button danger onClick={() => handleDeleteSubsidio(record, index)}>
          Remover
        </Button>
      ),
    },
  ];

  return (
    <div className="form-container">
      {isLoading || isSubsidiosLoading || isDepartamentosLoading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          <h2>{editMode ? 'Editar Funcionário' : 'Ficha do Funcionário'}</h2>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={abrirModal}>
              + Nova Pessoa
            </Button>
            <AutoComplete
              style={{ width: 300 }}
              options={sugestoes}
              onSearch={filtrarPessoas}
              onSelect={handleSelectSugestao}
              value={filtro}
              onChange={setFiltro}
              placeholder="Pesquise por nome ou NIF"
              allowClear
            />
            {editMode && (
              <Button danger onClick={handleDeleteFuncionario}>
                Deletar Funcionário
              </Button>
            )}
          </Space>

          {selectedPessoa ? (
            <div className="pessoa-selecionada-container">
              <h3>Pessoa Selecionada</h3>
              <Form layout="vertical" disabled>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Nome">
                      <Input value={selectedPessoa.nome} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Apelido">
                      <Input value={selectedPessoa.apelido} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="NIF">
                      <Input value={selectedPessoa.nif} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Data de Nascimento">
                      <Input value={selectedPessoa.dataNascimento ? moment(selectedPessoa.dataNascimento).format('YYYY-MM-DD') : ''} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Local de Nascimento">
                      <Input value={selectedPessoa.localNascimento} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Telefone">
                      <Input value={selectedPessoa.telefone} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="E-mail">
                      <Input value={selectedPessoa.email} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Endereço">
                      <Input value={selectedPessoa.endereco} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Bairro">
                      <Input value={selectedPessoa.bairro} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Gênero">
                      <Input value={generos.find((g) => g.value === selectedPessoa.genero)?.label || selectedPessoa.genero} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Estado Civil">
                      <Input value={estadosCivis.find((ec) => ec.value === selectedPessoa.estadoCivil)?.label || selectedPessoa.estadoCivil} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nome do Pai">
                      <Input value={selectedPessoa.pai} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nome da Mãe">
                      <Input value={selectedPessoa.mae} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nacionalidade">
                      <Input value={selectedPessoa.nacionalidade} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Raça">
                      <Input value={selectedPessoa.raca} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="País (Endereço)">
                      <Input value={selectedPessoa.paisEndereco} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Província (Endereço)">
                      <Input value={selectedPessoa.provinciaEndereco} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Município (Endereço)">
                      <Input value={selectedPessoa.municipioEndereco} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="País (Nascimento)">
                      <Input value={selectedPessoa.paisNascimento} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Província (Nascimento)">
                      <Input value={selectedPessoa.provinciaNascimento} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Município (Nascimento)">
                      <Input value={selectedPessoa.municipioNascimento} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Profissão">
                      <Input value={selectedPessoa.profissao} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Habilitação">
                      <Input value={selectedPessoa.habilitacao} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Nome da Foto">
                      <Input value={selectedPessoa.nomePhoto} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Checkbox
                        checked={isPessoaMarked}
                        onChange={(e) => setIsPessoaMarked(e.target.checked)}
                      >
                        Confirmar seleção da pessoa
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          ) : (
            <p>Por favor, selecione uma pessoa para continuar.</p>
          )}

          <div className="funcionario-form">
            <h3>Dados do Funcionário</h3>
            <Form form={funcionarioForm} onFinish={handleSubmitFuncionario} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tipoDeContrato"
                    label="Tipo de Contrato"
                    rules={[{ required: true, message: 'Selecione o tipo de contrato.' }]}
                  >
                    <Select disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}>
                      {tiposDeContrato.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
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
                      { type: 'number', min: 0, message: 'O salário deve ser maior ou igual a zero.', transform: Number },
                    ]}
                  >
                    <Input type="number" step="0.01" disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cargo"
                    label="Cargo"
                    rules={[{ required: true, message: 'O cargo é obrigatório.' }]}
                  >
                    <Input disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="departamentoId"
                    label="Departamento"
                    rules={[{ required: true, message: 'Selecione o departamento.' }]}
                  >
                    <Select
                      loading={isDepartamentosLoading}
                      disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting || isDepartamentosLoading || departamentos.length === 0}
                      placeholder={isDepartamentosLoading ? 'Carregando...' : departamentos.length === 0 ? 'Nenhum departamento disponível' : 'Selecione um departamento'}
                    >
                      {departamentos.map((dep) => (
                        <Option key={dep.id} value={dep.id}>{dep.descricao}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="segurancaSocial"
                    label="Segurança Social"
                    rules={[{ required: true, message: 'Selecione a segurança social.' }]}
                  >
                    <Select disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}>
                      {segurancaSocialOpcoes.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fechoContas"
                    label="Fecho de Contas"
                    rules={[{ required: true, message: 'Selecione o fecho de contas.' }]}
                  >
                    <Select disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}>
                      {fechoDeContasOpcoes.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="estadoFuncionario"
                    label="Estado"
                    rules={[{ required: true, message: 'Selecione o estado.' }]}
                  >
                    <Select disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}>
                      {estadosFuncionario.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataAdmissao"
                    label="Data de Admissão"
                    rules={[{ required: true, message: 'Selecione a data de admissão.' }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="descricao"
                    label="Descrição"
                    rules={[{ required: true, message: 'A descrição é obrigatória.' }]}
                  >
                    <Input.TextArea disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Subsídios" name="subsidios">
                    <Space.Compact block>
                      <Select
                        value={subsidioTemp.descricao}
                        onChange={(value) => {
                          const subsidio = subsidios.find((sub) => sub.descricao === value);
                          setSubsidioTemp({ id: subsidio?.id || null, descricao: value, valor: '' });
                        }}
                        style={{ width: '50%' }}
                        loading={isSubsidiosLoading}
                        disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting || isSubsidiosLoading || subsidios.length === 0}
                        placeholder={isSubsidiosLoading ? 'Carregando...' : subsidios.length === 0 ? 'Nenhum subsídio disponível' : 'Selecione um subsídio'}
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
                        disabled={!subsidioTemp.descricao || !isPessoaMarked || !selectedPessoa?.id || isSubmitting || isSubsidiosLoading || subsidios.length === 0}
                      />
                      <Button
                        type="primary"
                        onClick={handleAddSubsidio}
                        disabled={!subsidioTemp.descricao || !subsidioTemp.valor || !isPessoaMarked || !selectedPessoa?.id || isSubmitting || isSubsidiosLoading || subsidios.length === 0}
                      >
                        Adicionar
                      </Button>
                    </Space.Compact>
                    <Table
                      dataSource={funcionarioForm.getFieldValue('subsidios') || []}
                      columns={subsidiosColumns}
                      rowKey={(record, index) => `${record.descricao}-${index}`}
                      pagination={false}
                      style={{ marginTop: 16 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting}
                      loading={isSubmitting}
                    >
                      {editMode ? 'Atualizar Funcionário' : 'Salvar Funcionário'}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <Modal title="Nova Pessoa" open={isModalOpen} onCancel={fecharModal} footer={null}>
            <Form
              form={form}
              onFinish={handleSubmitPessoa}
              onFinishFailed={(errorInfo) => {
                console.log('Erro de validação no formulário:', errorInfo);
                message.error('Por favor, corrija os erros no formulário.');
              }}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="nome"
                    label="Nome"
                    rules={[
                      { required: true, message: 'Insira o nome.' },
                      { max: 100, message: 'Máximo de 100 caracteres.' },
                    ]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="apelido"
                    label="Apelido"
                    rules={[
                      { required: true, message: 'Insira o apelido.' },
                      { max: 100, message: 'Máximo de 100 caracteres.' },
                    ]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nif"
                    label="NIF"
                    rules={[
                      { required: true, message: 'Insira o NIF.' },
                      { max: 50, message: 'Máximo de 50 caracteres.' },
                    ]}
                  >
                    <Input maxLength={50} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataNascimento"
                    label="Data de Nascimento"
                    rules={[{ required: true, message: 'Selecione a data de nascimento.' }]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      style={{ width: '100%' }}
                      disabledDate={(current) => current && current > moment().endOf('day')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="localNascimento"
                    label="Local de Nascimento"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="telefone"
                    label="Telefone"
                    rules={[
                      { required: true, message: 'Insira o telefone.' },
                      { max: 100, message: 'Máximo de 100 caracteres.' },
                    ]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Insira o email.' },
                      { type: 'email', message: 'Insira um email válido.' },
                      { max: 100, message: 'Máximo de 100 caracteres.' },
                    ]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endereco"
                    label="Endereço"
                    rules={[
                      { required: true, message: 'Insira o endereço.' },
                      { max: 150, message: 'Máximo de 150 caracteres.' },
                    ]}
                  >
                    <Input maxLength={150} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bairro"
                    label="Bairro"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="genero"
                    label="Gênero"
                    rules={[{ required: true, message: 'Selecione o gênero.' }]}
                  >
                    <Select>
                      {generos.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="estadoCivil"
                    label="Estado Civil"
                    rules={[{ required: false, message: 'Selecione o estado civil.' }]}
                  >
                    <Select allowClear>
                      {estadosCivis.map((tipo) => (
                        <Option key={tipo.value} value={tipo.value}>{tipo.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="pai"
                    label="Nome do Pai"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="mae"
                    label="Nome da Mãe"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nacionalidade"
                    label="Nacionalidade"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="raca"
                    label="Raça"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paisEndereco"
                    label="País (Endereço)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="provinciaEndereco"
                    label="Província (Endereço)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="municipioEndereco"
                    label="Município (Endereço)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paisNascimento"
                    label="País (Nascimento)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="provinciaNascimento"
                    label="Província (Nascimento)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="municipioNascimento"
                    label="Município (Nascimento)"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="profissao"
                    label="Profissão"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="habilitacao"
                    label="Habilitação"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nomePhoto"
                    label="Nome da Foto"
                    rules={[{ max: 100, message: 'Máximo de 100 caracteres.' }]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Salvar
                      </Button>
                      <Button onClick={fecharModal}>Fechar</Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Ficha;