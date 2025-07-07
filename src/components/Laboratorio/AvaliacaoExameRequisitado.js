import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, notification, Typography, Popconfirm, InputNumber, Space } from 'antd';
import { CheckCircleOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';

const { Title, Text } = Typography;

function AvaliacaoExameRequisitado({ pacientes, medicos, tiposExame, setExames, updateExame, deleteExame, fetchAllData }) {
  const [form] = Form.useForm();
  const [exames, setExamesLocal] = useState([]);
  const [selectedExame, setSelectedExame] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState(null);
  const [valores, setValores] = useState([]);

  useEffect(() => {
    fetchRequisicoes();
  }, []);

  const fetchRequisicoes = async () => {
    try {
      const response = await api.get('requisicaoexame/all/composto');
      const requisicoes = response.data;
      setExamesLocal(requisicoes);
    } catch (error) {
      console.error('Erro ao buscar requisições:', error);
      notification.error({ message: 'Erro ao buscar requisições de exames!' });
    }
  };

  const handleRowClick = (record) => {
    setSelectedRequisicao(record);
  };

  const showResultModal = (exame) => {
    setSelectedExame(exame);
    setValores(exame.resultado?.valor || {});
    form.setFieldsValue({
      valores: exame.resultado?.valor || {},
      observacao: exame.resultado?.observacao || '',
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedExame(null);
    setValores({});
  };

  const handleFinishResult = async (values) => {
    setLoading(true);
    try {
      const referenciasKeys = Object.keys(selectedExame.referencias);
      const todosPreenchidos = referenciasKeys.every((key) => values.valores[key] !== undefined);
      if (!todosPreenchidos) {
        throw new Error('Preencha todos os valores dos componentes do exame.');
      }

      const updatedExame = {
        ...selectedExame,
        resultado: {
          valor: values.valores,
          observacao: values.observacao,
          finalizado: true,
          dataFinalizacao: new Date().toISOString(),
        },
        status: 'CONCLUIDO',
      };

      await updateExame(selectedExame.id, updatedExame);
      notification.success({ message: 'Resultado finalizado com sucesso!' });
      handleCancel();
      fetchRequisicoes();
      fetchAllData();
    } catch (error) {
      notification.error({ message: error.message || 'Erro ao finalizar resultado!' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExame = async (id) => {
    try {
      await deleteExame(id);
      notification.success({ message: 'Exame excluído com sucesso!' });
      setSelectedRequisicao(null);
      fetchRequisicoes();
    } catch (error) {
      notification.error({ message: 'Erro ao excluir exame!' });
    }
  };

  const handleReopenExame = async (exame) => {
    try {
      const updatedExame = {
        ...exame,
        resultado: null,
        status: 'PENDENTE',
      };
      await updateExame(exame.id, updatedExame);
      notification.success({ message: 'Exame reaberto com sucesso!' });
      fetchRequisicoes();
      fetchAllData();
    } catch (error) {
      notification.error({ message: 'Erro ao reabrir exame!' });
    }
  };

  const getValueStatus = (value, intervalo) => {
    if (!value || !intervalo) return 'normal';
    const [min, max] = intervalo.split('-').map(Number);
    const numValue = Number(value);
    if (isNaN(numValue)) return 'normal';
    if (numValue < min) return 'baixo';
    if (numValue > max) return 'alto';
    return 'normal';
  };

  const requisicoesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Paciente',
      dataIndex: 'pacienteId',
      key: 'pacienteId',
      render: (id) => pacientes.find((p) => p.id === id)?.nome || 'N/A',
    },
    {
      title: 'Médico',
      dataIndex: 'medicoId',
      key: 'medicoId',
      render: (id) => medicos.find((m) => m.id === id)?.nome || 'N/A',
    },
    {
      title: 'Data da Requisição',
      dataIndex: 'dataRequisicao',
      key: 'dataRequisicao',
      render: (data) => moment(data).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const examesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Exame',
      dataIndex: 'tipoExameId',
      key: 'tipoExameId',
      render: (id) => tiposExame.find((t) => t.id === id)?.nome || 'N/A',
    },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={record.resultado?.finalizado ? <CheckCircleOutlined /> : <EditOutlined />}
            onClick={() => showResultModal(record)}
          >
            {record.resultado?.finalizado ? 'Ver Resultado' : 'Inserir Resultado'}
          </Button>
          {record.resultado?.finalizado && (
            <Popconfirm
              title="Deseja reabrir este exame?"
              onConfirm={() => handleReopenExame(record)}
              okText="Sim"
              cancelText="Não"
            >
              <Button icon={<UndoOutlined />}>Reabrir</Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Deseja excluir este exame?"
            onConfirm={() => handleDeleteExame(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Avaliação de Exames Requisitados</Title>
      <Card title="Requisições de Exames">
        {exames.length === 0 ? (
          <Text>Nenhuma requisição disponível.</Text>
        ) : (
          <Table
            columns={requisicoesColumns}
            dataSource={exames}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            rowSelection={{
              type: 'radio',
              onChange: (_, selectedRows) => handleRowClick(selectedRows[0]),
            }}
          />
        )}
      </Card>
      {selectedRequisicao ? (
        <Card title="Detalhes do Exame">
          <Table
            columns={examesColumns}
            dataSource={selectedRequisicao.exames || []}
            rowKey="id"
          />
        </Card>
      ) : (
        <Card>
          <Text>Selecione uma requisição para ver os exames.</Text>
        </Card>
      )}

      <Modal
        title="Resultado do Exame"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedExame && (
          <Form form={form} layout="vertical" onFinish={handleFinishResult}>
            {selectedExame.composto ? (
              <Table
                dataSource={Object.entries(selectedExame.referencias).map(([key, ref]) => ({
                  key,
                  exame: key,
                  unidade: ref.unidade,
                  intervalo: ref.valor,
                }))}
                columns={[
                  { title: 'Exame', dataIndex: 'exame' },
                  { title: 'Unidade', dataIndex: 'unidade' },
                  { title: 'Intervalo de Referência', dataIndex: 'intervalo' },
                  {
                    title: 'Valor',
                    render: (_, record) => (
                      <Form.Item
                        name={['valores', record.exame]}
                        rules={[
                          { required: true, message: `Insira valor para ${record.exame}` },
                          {
                            validator: (_, value) =>
                              !value || !isNaN(value)
                                ? Promise.resolve()
                                : Promise.reject('Valor deve ser numérico'),
                          },
                        ]}
                        noStyle
                      >
                        <InputNumber
                          style={{
                            width: '100%',
                            borderColor:
                              getValueStatus(valores[record.exame], record.intervalo) === 'alto'
                                ? '#ff4d4f'
                                : getValueStatus(valores[record.exame], record.intervalo) === 'baixo'
                                ? '#fadb14'
                                : '#1890ff',
                          }}
                          onChange={(value) => setValores({ ...valores, [record.exame]: value })}
                        />
                      </Form.Item>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <>
                <Form.Item label="Intervalo de Referência">
                  <Input
                    disabled
                    value={Object.values(selectedExame.referencias)[0]?.valor}
                  />
                </Form.Item>
                <Form.Item
                  name={['valores', Object.keys(selectedExame.referencias)[0]]}
                  label="Valor"
                  rules={[
                    { required: true, message: 'Insira o valor' },
                    {
                      validator: (_, value) =>
                        !value || !isNaN(value) ? Promise.resolve() : Promise.reject('Valor inválido'),
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: '100%',
                      borderColor:
                        getValueStatus(
                          valores[Object.keys(selectedExame.referencias)[0]],
                          Object.values(selectedExame.referencias)[0]?.valor
                        ) === 'alto'
                          ? '#ff4d4f'
                          : getValueStatus(
                              valores[Object.keys(selectedExame.referencias)[0]],
                              Object.values(selectedExame.referencias)[0]?.valor
                            ) === 'baixo'
                          ? '#fadb14'
                          : '#1890ff',
                    }}
                    onChange={(value) =>
                      setValores({
                        ...valores,
                        [Object.keys(selectedExame.referencias)[0]]: value,
                      })
                    }
                  />
                </Form.Item>
              </>
            )}
            <Form.Item name="observacao" label="Observação">
              <Input.TextArea rows={4} placeholder="Observações sobre o exame" />
            </Form.Item>
            <Form.Item>
              <Popconfirm
                title="Finalizar resultado?"
                onConfirm={() => form.submit()}
                okText="Sim"
                cancelText="Não"
              >
                <Button type="primary" loading={loading}>
                  Finalizar
                </Button>
              </Popconfirm>
              <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default AvaliacaoExameRequisitado;
