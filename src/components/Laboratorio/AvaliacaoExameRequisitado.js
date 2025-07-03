import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, notification, Typography, Popconfirm, InputNumber, Space } from 'antd';
import { CheckCircleOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

function AvaliacaoExameRequisitado({ exames, pacientes, medicos, tiposExame, setExames, fetchAllData, updateExame, deleteExame }) {
  const [form] = Form.useForm();
  const [selectedExame, setSelectedExame] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState(null);
  const [valores, setValores] = useState({});

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
      if (selectedExame.composto) {
        const referenciasKeys = Object.keys(selectedExame.referencias);
        if (!referenciasKeys.every((key) => values.valores[key])) {
          throw new Error('Preencha todos os valores dos componentes do exame.');
        }
      } else {
        const key = Object.keys(selectedExame.referencias)[0];
        if (!values.valores[key]) {
          throw new Error('Preencha o valor do exame.');
        }
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
      setExames(exames.map((e) => (e.id === selectedExame.id ? updatedExame : e)));
      notification.success({ message: 'Resultado do exame finalizado com sucesso!' });
      handleCancel();
      fetchAllData();
    } catch (error) {
      notification.error({ message: error.message || 'Erro ao finalizar resultado!' });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExame = async (id) => {
    try {
      await deleteExame(id);
      notification.success({ message: 'Exame excluído com sucesso!' });
      setSelectedRequisicao(null);
      fetchAllData();
    } catch (error) {
      notification.error({ message: 'Erro ao excluir exame!' });
      console.error('Erro:', error);
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
      setExames(exames.map((e) => (e.id === exame.id ? updatedExame : e)));
      notification.success({ message: 'Exame reaberto com sucesso!' });
      fetchAllData();
    } catch (error) {
      notification.error({ message: 'Erro ao reabrir exame!' });
      console.error('Erro:', error);
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
      title: 'Médico',
      dataIndex: 'medicoId',
      key: 'medicoId',
      render: (id) => medicos.find((m) => m.id === id)?.nome || 'N/A',
    },
    {
      title: 'Paciente',
      dataIndex: 'pacienteId',
      key: 'pacienteId',
      render: (id) => pacientes.find((p) => p.id === id)?.nome || 'N/A',
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
              <Button type="default" icon={<UndoOutlined />}>
                Reabrir
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Deseja excluir este exame?"
            onConfirm={() => handleDeleteExame(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="danger" icon={<DeleteOutlined />}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const requisicoesData = exames.map((exame) => ({
    id: exame.id,
    medicoId: exame.medicoId || null,
    pacienteId: exame.pacienteId,
  }));

  const examesFiltrados = selectedRequisicao
    ? exames.filter((exame) => exame.id === selectedRequisicao.id)
    : [];

  return (
    <div>
      <Title level={2} className="section-title">
        Avaliação de Exames Requisitados
      </Title>
      <Card title="Requisições de Exames" className="card-custom">
        {requisicoesData.length === 0 ? (
          <Text>Nenhuma requisição de exame disponível.</Text>
        ) : (
          <Table
            columns={requisicoesColumns}
            dataSource={requisicoesData}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            rowSelection={{
              type: 'radio',
              onChange: (_, selectedRows) => handleRowClick(selectedRows[0]),
            }}
            className="table-custom"
          />
        )}
      </Card>
      {selectedRequisicao ? (
        <Card title="Detalhes do Exame" className="card-custom">
          <Table columns={examesColumns} dataSource={examesFiltrados} rowKey="id" className="table-custom" />
        </Card>
      ) : (
        <Card className="card-custom">
          <Text>Selecione uma requisição para visualizar os detalhes.</Text>
        </Card>
      )}
      <Modal
        title="Resultado do Exame"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="modal-custom"
      >
        {selectedExame && (
          <Form form={form} layout="vertical" onFinish={handleFinishResult}>
            {selectedExame.composto && Object.keys(selectedExame.referencias).length > 0 ? (
              <div>
                <Text strong>Componentes do Exame</Text>
                <Table
                  dataSource={Object.entries(selectedExame.referencias).map(([key, ref]) => ({
                    key,
                    exame: key,
                    unidade: ref.unidade,
                    intervalo: ref.valor,
                  }))}
                  columns={[
                    { title: 'Exame', dataIndex: 'exame', key: 'exame' },
                    { title: 'Unidade', dataIndex: 'unidade', key: 'unidade' },
                    { title: 'Intervalo de Referência', dataIndex: 'intervalo', key: 'intervalo' },
                    {
                      title: 'Valor do Resultado',
                      key: 'valor',
                      render: (_, record) => (
                        <Form.Item
                          name={['valores', record.exame]}
                          rules={[
                            { required: true, message: `Insira o valor para ${record.exame}` },
                            {
                              validator: (_, value) =>
                                !value || !isNaN(value)
                                  ? Promise.resolve()
                                  : Promise.reject('Insira um valor numérico válido'),
                            },
                          ]}
                          noStyle
                        >
                          <InputNumber
                            placeholder="Insira o resultado"
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
                  className="table-custom"
                />
              </div>
            ) : (
              <>
                <Form.Item
                  label="Intervalo de Referência"
                  style={{ marginBottom: 8 }}
                >
                  <Input
                    value={selectedExame.referencias[Object.keys(selectedExame.referencias)[0]]?.valor}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  name={['valores', Object.keys(selectedExame.referencias)[0] || 'valor']}
                  label="Valor do Resultado"
                  rules={[
                    { required: true, message: 'Insira o valor do resultado' },
                    {
                      validator: (_, value) =>
                        !value || !isNaN(value) ? Promise.resolve() : Promise.reject('Insira um valor numérico válido'),
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Insira o resultado"
                    style={{
                      width: '100%',
                      borderColor:
                        getValueStatus(
                          valores[Object.keys(selectedExame.referencias)[0]],
                          selectedExame.referencias[Object.keys(selectedExame.referencias)[0]]?.valor
                        ) === 'alto'
                          ? '#ff4d4f'
                          : getValueStatus(
                              valores[Object.keys(selectedExame.referencias)[0]],
                              selectedExame.referencias[Object.keys(selectedExame.referencias)[0]]?.valor
                            ) === 'baixo'
                          ? '#fadb14'
                          : '#1890ff',
                    }}
                    onChange={(value) =>
                      setValores({ ...valores, [Object.keys(selectedExame.referencias)[0]]: value })
                    }
                  />
                </Form.Item>
              </>
            )}
            <Form.Item name="observacao" label="Observação">
              <Input.TextArea rows={4} placeholder="Observações sobre o resultado" />
            </Form.Item>
            <Form.Item>
              <Popconfirm
                title="Deseja finalizar o resultado deste exame?"
                onConfirm={() => form.submit()}
                okText="Sim"
                cancelText="Não"
              >
                <Button type="primary" loading={loading}>
                  Finalizar
                </Button>
              </Popconfirm>
              <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
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