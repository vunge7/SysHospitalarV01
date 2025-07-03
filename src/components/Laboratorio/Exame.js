import React, { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Card,
  notification,
  DatePicker,
  Table,
  Space,
  Popconfirm,
  InputNumber,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { Text } = Typography;

function Exame({ exames, tiposExame, pacientes, medicos, setExames, fetchAllData, createExame, updateExame, deleteExame }) {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExame, setEditingExame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isComposto, setIsComposto] = useState(false);
  const [referencias, setReferencias] = useState([]);
  const [selectedExame, setSelectedExame] = useState(null);

  const showModal = (exame = null) => {
    setIsModalVisible(true);
    setIsEditMode(!!exame);
    setEditingExame(exame);
    setIsComposto(exame?.composto || false);
    setReferencias(
      exame && exame.composto
        ? Object.entries(exame.referencias).map(([nome, ref]) => ({
            nome,
            intervalo: ref.valor,
            unidade: ref.unidade,
          }))
        : []
    );
    if (exame) {
      form.setFieldsValue({
        tipoExameId: exame.tipoExameId,
        pacienteId: exame.pacienteId,
        medicoId: exame.medicoId,
        estado: exame.estado,
        designacao: exame.designacao,
        unidade: exame.unidade,
        composto: exame.composto,
        dataColeta: exame.dataColeta ? moment(exame.dataColeta) : null,
      });
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setIsComposto(false);
    setReferencias([]);
    setEditingExame(null);
    setIsEditMode(false);
  };

  const showDetailsModal = (exame) => {
    setSelectedExame(exame);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedExame(null);
  };

  const addReferencia = () => {
    setReferencias([...referencias, { nome: '', intervalo: '', unidade: '' }]);
  };

  const removeReferencia = (index) => {
    setReferencias(referencias.filter((_, i) => i !== index));
  };

  const updateReferencia = (index, field, value) => {
    const newReferencias = [...referencias];
    newReferencias[index][field] = value;
    setReferencias(newReferencias);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const referenciasObj = {};
      if (values.composto) {
        referencias.forEach((ref, index) => {
          if (!ref.nome || !ref.intervalo || !ref.unidade) {
            throw new Error(`Preencha todos os campos da referência ${index + 1}`);
          }
          if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(ref.intervalo)) {
            throw new Error(`Intervalo inválido na referência ${ref.nome}. Use o formato "min-max" (ex.: 4.5-5.9)`);
          }
          referenciasObj[ref.nome] = { valor: ref.intervalo, unidade: ref.unidade };
        });
      } else {
        referenciasObj[values.designacao] = { valor: '0-0', unidade: values.unidade };
      }

      const exameData = {
        tipoExameId: values.tipoExameId,
        estado: values.estado,
        designacao: values.designacao,
        unidade: values.unidade,
        composto: values.composto || false,
        referencias: referenciasObj,
        pacienteId: values.pacienteId,
        medicoId: values.medicoId,
        status: 'PENDENTE',
        dataSolicitacao: new Date().toISOString(),
        dataColeta: values.dataColeta ? values.dataColeta.toISOString() : null,
      };

      let exameResponse;
      if (isEditMode) {
        exameResponse = await updateExame(editingExame.id, exameData);
      } else {
        exameResponse = await createExame(exameData);
      }

      setExames(
        isEditMode
          ? exames.map((e) => (e.id === editingExame.id ? exameResponse.data : e))
          : [...exames, exameResponse.data]
      );
      notification.success({ message: isEditMode ? 'Exame atualizado com sucesso!' : 'Exame criado com sucesso!' });
      handleCancel();
      fetchAllData();
    } catch (error) {
      notification.error({ message: error.message || 'Erro ao salvar exame!' });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExame(id);
      notification.success({ message: 'Exame excluído com sucesso!' });
      fetchAllData();
    } catch (error) {
      notification.error({ message: 'Erro ao excluir exame!' });
      console.error('Erro:', error);
    }
  };

  const handleDuplicate = async (exame) => {
    try {
      const newExame = { ...exame, id: exames.length + 1, dataSolicitacao: new Date().toISOString(), resultado: null, status: 'PENDENTE' };
      await createExame(newExame);
      notification.success({ message: 'Exame duplicado com sucesso!' });
      fetchAllData();
    } catch (error) {
      notification.error({ message: 'Erro ao duplicar exame!' });
      console.error('Erro:', error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    {
      title: 'Tipo',
      dataIndex: 'tipoExameId',
      key: 'tipoExameId',
      render: (id) => tiposExame.find((t) => t.id === id)?.nome || 'N/A',
    },
    { title: 'Unidade', dataIndex: 'unidade', key: 'unidade' },
    {
      title: 'Referências',
      key: 'referencias',
      render: (_, record) =>
        record.composto
          ? `Múltiplos (${Object.keys(record.referencias).length})`
          : Object.values(record.referencias)[0]?.valor || 'N/A',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetailsModal(record)}>
            Detalhes
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Editar
          </Button>
          <Popconfirm
            title="Deseja excluir este exame?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button icon={<DeleteOutlined />} danger>
              Excluir
            </Button>
          </Popconfirm>
         
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="section-title">Gestão de Exames</h2>
      <Card className="card-custom">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
          Adicionar Exame
        </Button>
        <Table columns={columns} dataSource={exames} rowKey="id" className="table-custom" />
      </Card>
      <Modal
        title={isEditMode ? 'Editar Exame' : 'Criar Novo Exame'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="modal-custom"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="tipoExameId"
            label="Tipo de Exame"
            rules={[{ required: true, message: 'Selecione um tipo de exame' }]}
          >
            <Select placeholder="Selecione um tipo de exame">
              {tiposExame.map((tipo) => (
                <Option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="pacienteId"
            label="Paciente"
            rules={[{ required: true, message: 'Selecione um paciente' }]}
          >
            <Select placeholder="Selecione um paciente">
              {pacientes.map((paciente) => (
                <Option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="medicoId"
            label="Médico"
            rules={[{ required: true, message: 'Selecione um médico' }]}
          >
            <Select placeholder="Selecione um médico">
              {medicos.map((medico) => (
                <Option key={medico.id} value={medico.id}>
                  {medico.nome}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Selecione o estado' }]}
          >
            <Select placeholder="Selecione o estado">
              <Option value="ATIVO">Ativo</Option>
              <Option value="INATIVO">Inativo</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="designacao"
            label="Designação"
            rules={[{ required: true, message: 'Insira a designação' }]}
          >
            <Input placeholder="Nome do exame" />
          </Form.Item>
          <Form.Item
            name="unidade"
            label="Unidade"
            rules={[{ required: true, message: 'Selecione a unidade' }]}
          >
            <Select placeholder="Selecione a unidade">
              <Option value="mL">mL</Option>
              <Option value="mg">mg</Option>
              <Option value="unidade">Unidade</Option>
              <Option value="mil/mm³">mil/mm³</Option>
              <Option value="g/dL">g/dL</Option>
              <Option value="mIU/L">mIU/L</Option>
              <Option value="mg/dL">mg/dL</Option>
              <Option value="ng/dL">ng/dL</Option>
              <Option value="outro">Outro</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="composto" valuePropName="checked">
            <Checkbox onChange={(e) => setIsComposto(e.target.checked)}>Exame Composto</Checkbox>
          </Form.Item>
          {isComposto && (
            <div>
              <Text strong>Referências Médicas</Text>
              {referencias.map((ref, index) => (
                <Card key={index} style={{ marginBottom: 16 }} size="small">
                  <Space style={{ width: '100%' }}>
                    <Input
                      placeholder="Nome do componente (ex.: Hemácias)"
                      value={ref.nome}
                      onChange={(e) => updateReferencia(index, 'nome', e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Input
                      placeholder="Intervalo (ex.: 4.5-5.9)"
                      value={ref.intervalo}
                      onChange={(e) => updateReferencia(index, 'intervalo', e.target.value)}
                      style={{ width: 150 }}
                    />
                    <Input
                      placeholder="Unidade (ex.: milhões/mm³)"
                      value={ref.unidade}
                      onChange={(e) => updateReferencia(index, 'unidade', e.target.value)}
                      style={{ width: 150 }}
                    />
                    <Button danger onClick={() => removeReferencia(index)}>
                      Remover
                    </Button>
                  </Space>
                </Card>
              ))}
              <Button type="dashed" onClick={addReferencia} block>
                Adicionar Referência
              </Button>
            </div>
          )}
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? 'Atualizar Exame' : 'Criar Exame'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Detalhes do Exame"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="close" onClick={handleDetailsCancel}>
            Fechar
          </Button>,
        ]}
        className="modal-custom"
      >
        {selectedExame && (
          <div>
            <Text strong>Designação:</Text> <Text>{selectedExame.designacao}</Text>
            <br />
            <Text strong>Tipo:</Text>{' '}
            <Text>{tiposExame.find((t) => t.id === selectedExame.tipoExameId)?.nome || 'N/A'}</Text>
            <br />
            <Text strong>Unidade:</Text> <Text>{selectedExame.unidade}</Text>
            <br />
            <Text strong>Composto:</Text> <Text>{selectedExame.composto ? 'Sim' : 'Não'}</Text>
            <br />
            <Text strong>Referências Médicas:</Text>
            {selectedExame.composto ? (
              <Table
                dataSource={Object.entries(selectedExame.referencias).map(([nome, ref]) => ({
                  nome,
                  intervalo: ref.valor,
                  unidade: ref.unidade,
                }))}
                columns={[
                  { title: 'Componente', dataIndex: 'nome', key: 'nome' },
                  { title: 'Intervalo', dataIndex: 'intervalo', key: 'intervalo' },
                  { title: 'Unidade', dataIndex: 'unidade', key: 'unidade' },
                ]}
                pagination={false}
                size="small"
                className="table-custom"
              />
            ) : (
              <Text>
                {Object.values(selectedExame.referencias)[0]?.valor} (
                {Object.values(selectedExame.referencias)[0]?.unidade})
              </Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Exame;