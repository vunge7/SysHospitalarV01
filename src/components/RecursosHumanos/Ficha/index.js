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

const Ficha = () => {
  const [pessoas, setPessoas] = useState([]);
  const [subsidios, setSubsidios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubsidiosLoading, setIsSubsidiosLoading] = useState(false);
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

  const fetchFuncionarioByPessoaId = useCallback(async (pessoaId) => {
    try {
      const response = await api.get(`funcionario/pessoa/${pessoaId}`);
      if (response.data && response.data.id) {
        const funcionario = response.data;
        setEditMode(true);
        setFuncionarioId(funcionario.id);
        funcionarioForm.setFieldsValue({
          tipoDeContrato: funcionario.tipoDeContrato,
          salario: funcionario.salario,
          dataAdmissao: moment(funcionario.dataAdmissao),
          descricao: funcionario.descricao,
          fechoDeContas: funcionario.fechoDeContas,
          estadoFuncionario: funcionario.estadoFuncionario,
          subsidios: funcionario.subsidios.map((s) => ({
            subsidioId: s.subsidioId,
            descricao: subsidios.find((sub) => sub.id === s.subsidioId)?.descricao || s.subsidioId,
            valor: s.valor,
          })),
        });
        message.info('Funcionário carregado para edição.');
      } else {
        setEditMode(false);
        setFuncionarioId(null);
        funcionarioForm.resetFields();
      }
    } catch (error) {
      console.error('Erro ao verificar funcionário:', error.response?.data || error);
      if (error.response?.status !== 404) {
        message.error(error.response?.data?.message || 'Erro ao verificar funcionário.');
      }
      setEditMode(false);
      setFuncionarioId(null);
      funcionarioForm.resetFields();
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
  }, [fetchPessoas, fetchSubsidios]);

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
        nif: values.nif,
        dataNascimento: values.dataNascimento ? values.dataNascimento.format('YYYY-MM-DD') : null,
        telefone: values.telefone,
        email: values.email,
        endereco: values.endereco,
        genero: values.genero,
      };

      console.log('Enviando pessoa para /pessoa/add:', JSON.stringify(pessoaData, null, 2));
      const response = await api.post('pessoa/add', pessoaData);
      const novaPessoa = cleanObject(response.data);
      setPessoas((prev) => [...prev, novaPessoa]);
      setSelectedPessoa(novaPessoa);
      setIsPessoaMarked(true);
      fecharModal();
      message.success('Pessoa cadastrada sucesso!');
      await fetchPessoas();
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error.response?.data || error);
      const errorMessage = error.response?.data?.message;
      if (error.response?.status === 400 && typeof errorMessage === 'string') {
        if (errorMessage.includes('Nome')) {
          message.error('Nome é obrigatório.');
        } else if (errorMessage.includes('Gênero')) {
          message.error('Gênero inválido. Deve ser MASCULINO, FEMININO ou OUTRO.');
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
      if (isNaN(salario) || salario <= 0) {
        message.error('O salário deve ser um número positivo.');
        return;
      }

      const formSubsidios = values.subsidios || [];
      console.log('Subsidios no formulário:', formSubsidios);

      const funcionarioData = {
        pessoaId: Number(selectedPessoa.id),
        tipoDeContrato: values.tipoDeContrato,
        salario: salario,
        dataAdmissao: moment.utc(values.dataAdmissao).format("YYYY-MM-DD'T'HH:mm:ss.SSS'Z'"),
        descricao: values.descricao || '',
        fechoDeContas: values.fechoDeContas,
        estadoFuncionario: values.estadoFuncionario,
        subsidios: formSubsidios.map((s) => {
          const valor = parseFloat(s.valor);
          const subsidio = subsidios.find((sub) => sub.descricao === s.descricao);
          if (!subsidio?.id) {
            throw new Error(`Subsídio ${s.descricao} não encontrado.`);
          }
          if (isNaN(valor) || valor <= 0) {
            throw new Error(`Valor inválido para o subsídio ${s.descricao}`);
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

      console.log('Resposta do servidor:', response.data);

      funcionarioForm.resetFields();
      setSelectedPessoa(null);
      setIsPessoaMarked(false);
      setEditMode(false);
      setFuncionarioId(null);
      message.success(editMode ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error.response?.data || error);
      const errorMessage = error.response?.data?.message;
      if (error.response?.status === 404) {
        message.error('Recurso não encontrado (pessoa, subsídio ou funcionário).');
      } else if (error.response?.status === 400 && typeof errorMessage === 'string') {
        if (errorMessage.includes('obrigatório')) {
          message.error(errorMessage || 'Campos obrigatórios não preenchidos.');
        } else if (errorMessage.includes('Cannot deserialize')) {
          message.error('Formato de data inválido. Tente novamente.');
        } else {
          message.error(errorMessage || 'Falha ao cadastrar/atualizar funcionário.');
        }
      } else {
        message.error(errorMessage || 'Falha ao cadastrar/atualizar funcionário. Verifique os dados e tente novamente.');
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
      {isLoading ? (
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
                    <Form.Item label="NIF">
                      <Input value={selectedPessoa.nif} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Data de Nascimento">
                      <Input value={moment(selectedPessoa.dataNascimento).format('YYYY-MM-DD')} />
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
                    <Form.Item label="Gênero">
                      <Input value={generos.find((g) => g.value === selectedPessoa.genero)?.label || selectedPessoa.genero} />
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
                      { type: 'number', min: 0.01, message: 'O salário deve ser maior que zero.', transform: Number },
                    ]}
                  >
                    <Input type="number" step="0.01" disabled={!isPessoaMarked || !selectedPessoa?.id || isSubmitting} />
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
                        onClick={() => {
                          const valor = parseFloat(subsidioTemp.valor);
                          if (subsidioTemp.id && subsidioTemp.descricao && !isNaN(valor) && valor > 0) {
                            const currentSubsidios = funcionarioForm.getFieldValue('subsidios') || [];
                            if (currentSubsidios.some((s) => s.descricao === subsidioTemp.descricao)) {
                              message.warning('Este subsídio já foi adicionado!');
                              return;
                            }
                            const newSubsidios = [...currentSubsidios, { subsidioId: subsidioTemp.id, descricao: subsidioTemp.descricao, valor }];
                            funcionarioForm.setFieldsValue({ subsidios: newSubsidios });
                            setSubsidioTemp({ id: null, descricao: '', valor: '' });
                            message.success('Subsídio adicionado à lista!');
                          } else {
                            message.warning('Preencha todos os campos do subsídio com valores válidos e positivos!');
                          }
                        }}
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
                <Col span={12}>
                  <Form.Item
                    name="fechoDeContas"
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
                      { max: 255, message: 'Máximo de 255 caracteres.' },
                    ]}
                  >
                    <Input maxLength={255} />
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
                    name="telefone"
                    label="Telefone"
                    rules={[
                      { required: true, message: 'Insira o telefone.' },
                      { max: 20, message: 'Máximo de 20 caracteres.' },
                    ]}
                  >
                    <Input maxLength={20} />
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
                      { max: 255, message: 'Máximo de 255 caracteres.' },
                    ]}
                  >
                    <Input maxLength={255} />
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