import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Button, Modal, Form, Select, Space, notification, Spin, Popconfirm, Tooltip, Card, Row, Col, Typography, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SaveOutlined, CloseOutlined, ExportOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import { StockContext } from '../../../contexts/StockContext';
import moment from 'moment';
import 'moment-timezone';
import './Armazem.css';

const { Title } = Typography;

const Armazem = () => {
  const { armazens, setArmazens, filiais, loading: contextLoading, error: contextError } = useContext(StockContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [armazemSearch, setArmazemSearch] = useState('');
  const [showArmazemModal, setShowArmazemModal] = useState(false);
  const [selectedArmazem, setSelectedArmazem] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!armazens.length && !contextLoading) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const armazensRes = await api.get('/armazem/all');
          setArmazens(Array.isArray(armazensRes.data) ? armazensRes.data : []);
          setErrorMessage(null);
        } catch (error) {
          const errorMsg = error.response?.data?.message || `Erro ao carregar armazéns: ${error.message}`;
          setErrorMessage(errorMsg);
          notification.error({
            message: 'Erro',
            description: errorMsg,
            placement: 'topRight',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [armazens, contextLoading, setArmazens]);

  const enrichedArmazens = useMemo(() => {
    return armazens.map((armazem) => {
      const filial = filiais.find((f) => f.id === armazem.filialId);
      return {
        ...armazem,
        filialNome: filial ? filial.nome : 'Sem filial associada',
      };
    });
  }, [armazens, filiais]);

  const filteredArmazens = useMemo(
    () =>
      Array.isArray(enrichedArmazens)
        ? enrichedArmazens.filter((a) => a.designacao?.toLowerCase().includes(armazemSearch.toLowerCase()))
        : [],
    [enrichedArmazens, armazemSearch]
  );

  const openNotification = useCallback((message, type = 'success') => {
    notification[type]({
      message: 'Notificação',
      description: message,
      placement: 'topRight',
    });
  }, []);

  const logAudit = useCallback(async (action, armazemId, armazemName) => {
    try {
      await api.post('/audit/log', {
        userId: 'SYSTEM', // Ajustar conforme autenticação
        action,
        entity: 'ARMAZEM',
        entityId: armazemId,
        details: `${action} armazém: ${armazemName}`,
        timestamp: moment().tz('Africa/Luanda').toISOString(),
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }, []);

  const handleArmazemSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const armazemData = {
          designacao: values.designacao.trim(),
          filialId: Number(values.filialId),
        };
        const response = await api.post('/armazem/add', armazemData);
        const filial = filiais.find((f) => f.id === response.data.filialId);
        setArmazens((prev) => [
          ...prev,
          {
            id: response.data.id,
            designacao: response.data.designacao,
            filialId: response.data.filialId,
            filialNome: filial ? filial.nome : 'Sem filial associada',
          },
        ].sort((a, b) => a.designacao.localeCompare(b.designacao)));
        await logAudit('CREATE', response.data.id, response.data.designacao);
        setShowArmazemModal(false);
        form.resetFields();
        setErrorMessage(null);
        openNotification('Armazém cadastrado com sucesso!');
      } catch (error) {
        const errorMsg = error.response?.data?.message || `Erro ao cadastrar armazém: ${error.message}`;
        setErrorMessage(errorMsg);
        openNotification(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [setArmazens, logAudit, openNotification, filiais]
  );

  const handleArmazemEditSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const armazemData = {
          id: selectedArmazem.id,
          designacao: values.designacao.trim(),
          filialId: Number(values.filialId),
        };
        const response = await api.put('/armazem/edit', armazemData);
        const filial = filiais.find((f) => f.id === response.data.filialId);
        setArmazens((prev) =>
          prev
            .map((a) =>
              a.id === armazemData.id
                ? {
                    ...a,
                    designacao: response.data.designacao,
                    filialId: response.data.filialId,
                    filialNome: filial ? filial.nome : 'Sem filial associada',
                  }
                : a
            )
            .sort((a, b) => a.designacao.localeCompare(b.designacao))
        );
        await logAudit('UPDATE', armazemData.id, armazemData.designacao);
        setShowArmazemModal(false);
        form.resetFields();
        setSelectedArmazem(null);
        setErrorMessage(null);
        openNotification('Armazém atualizado com sucesso!');
      } catch (error) {
        const errorMsg = error.response?.data?.message || `Erro ao atualizar armazém: ${error.message}`;
        setErrorMessage(errorMsg);
        openNotification(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [selectedArmazem, setArmazens, logAudit, openNotification, filiais]
  );

  const handleDeleteArmazem = useCallback(
    async (id) => {
      setLoading(true);
      try {
        await api.delete(`/armazem/${id}`);
        setArmazens((prev) => prev.filter((a) => a.id !== id));
        await logAudit('DELETE', id, enrichedArmazens.find((a) => a.id === id)?.designacao || 'N/A');
        setErrorMessage(null);
        openNotification('Armazém excluído com sucesso!');
      } catch (error) {
        const errorMsg = error.response?.data?.message || `Erro ao excluir armazém: ${error.message}`;
        setErrorMessage(errorMsg);
        openNotification(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [enrichedArmazens, setArmazens, logAudit, openNotification]
  );

  const handleExport = useCallback(() => {
    try {
      const csvData = filteredArmazens.map((armazem) => ({
        ID: armazem.id,
        Designação: armazem.designacao,
        Filial: armazem.filialNome,
      }));
      const csv = [
        ['ID', 'Designação', 'Filial'],
        ...csvData.map((row) => Object.values(row)),
      ].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `armazens_${moment().format('YYYYMMDD')}.csv`;
      link.click();
      openNotification('Exportação de armazéns concluída!');
    } catch (error) {
      openNotification('Falha ao exportar armazéns', 'error');
    }
  }, [filteredArmazens, openNotification]);

  useEffect(() => {
    if (contextError) {
      setErrorMessage(contextError);
    } else if (!armazens.length && !contextLoading) {
      setErrorMessage('Nenhum armazém encontrado. Cadastre armazéns ou verifique o banco de dados.');
    } else if (!filiais.length && !contextLoading) {
      setErrorMessage('Nenhuma filial encontrada. Cadastre filiais antes de criar armazéns.');
    } else {
      setErrorMessage(null);
    }
  }, [armazens, filiais, contextError, contextLoading]);

  const armazemColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: 'Designação',
        dataIndex: 'designacao',
        key: 'designacao',
        sorter: (a, b) => a.designacao.localeCompare(b.designacao),
      },
      {
        title: 'Filial',
        dataIndex: 'filialNome',
        key: 'filialNome',
        sorter: (a, b) => (a.filialNome || 'Sem filial').localeCompare(b.filialNome || 'Sem filial'),
        render: (filialNome) => filialNome || 'Sem filial',
      },
      {
        title: 'Ações',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Editar armazém">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue({
                    designacao: record.designacao,
                    filialId: record.filialId,
                  });
                  setSelectedArmazem(record);
                  setShowArmazemModal(true);
                }}
                disabled={loading || contextLoading}
              />
            </Tooltip>
            <Popconfirm
              title={`Excluir "${record.designacao || ''}"?`}
              onConfirm={() => handleDeleteArmazem(record.id)}
              okText="Confirmar"
              cancelText="Cancelar"
            >
              <Tooltip title="Excluir armazém">
                <Button icon={<DeleteOutlined />} danger disabled={loading || contextLoading} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [loading, contextLoading, handleDeleteArmazem]
  );

  return (
    <div className="armazem-container">
      <Spin spinning={loading || contextLoading}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3}>Gestão de Armazéns</Title>
          </Col>
        </Row>
        {errorMessage && (
          <Alert
            message="Erro"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Card>
          <Row gutter={[16, 16]} justify="space-between">
            <Col xs={24} md={12}>
              <Input
                placeholder="Filtrar por designação"
                value={armazemSearch}
                onChange={(e) => setArmazemSearch(e.target.value)}
                prefix={<SearchOutlined />}
                disabled={loading || contextLoading}
              />
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  disabled={loading || contextLoading || filteredArmazens.length === 0}
                >
                  Exportar
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setSelectedArmazem(null);
                    setShowArmazemModal(true);
                  }}
                  disabled={loading || contextLoading || filiais.length === 0}
                >
                  Novo Armazém
                </Button>
              </Space>
            </Col>
          </Row>
          <Table
            columns={armazemColumns}
            dataSource={filteredArmazens}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            loading={loading || contextLoading}
            locale={{ emptyText: 'Nenhum armazém encontrado. Verifique se há filiais cadastradas.' }}
          />
        </Card>
        <Modal
          title={selectedArmazem ? 'Editar Armazém' : 'Novo Armazém'}
          open={showArmazemModal}
          onCancel={() => {
            setShowArmazemModal(false);
            setSelectedArmazem(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            onFinish={selectedArmazem ? handleArmazemEditSubmit : handleArmazemSubmit}
            layout="vertical"
          >
            <Form.Item
              name="designacao"
              label="Designação"
              rules={[{ required: true, message: 'Designação é obrigatória' }]}
            >
              <Input disabled={loading || contextLoading} placeholder="Ex.: Armazém Central" />
            </Form.Item>
            <Form.Item
              name="filialId"
              label="Filial"
              rules={[{ required: true, message: 'Filial é obrigatória' }]}
            >
              <Select
                placeholder="Selecionar uma filial"
                disabled={loading || contextLoading || filiais.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {filiais.map((filial) => (
                  <Select.Option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setShowArmazemModal(false);
                    setSelectedArmazem(null);
                    form.resetFields();
                  }}
                  disabled={loading || contextLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={loading}
                >
                  Salvar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Armazem;