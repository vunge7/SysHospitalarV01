import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Button, Modal, Form, Select, Space, Spin, Popconfirm, Tooltip, Card, Row, Col, Typography, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SaveOutlined, ExportOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import { StockContext } from '../../../contexts/StockContext';
import moment from 'moment';
import './Armazem.css';
import { toast } from 'react-toastify';

const { Title } = Typography;

const Armazem = () => {
  const { armazens, setArmazens, empresas, loading: contextLoading, error: contextError } = useContext(StockContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [armazemSearch, setArmazemSearch] = useState('');
  const [showArmazemModal, setShowArmazemModal] = useState(false);
  const [selectedArmazem, setSelectedArmazem] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Forçar atualização do useMemo
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Carregar armazéns (só na primeira vez)
  useEffect(() => {
    const fetchData = async () => {
      if (contextLoading || armazens.length > 0) return;
      setLoading(true);
      try {
        const res = await api.get('/armazem/all');
        setArmazens(Array.isArray(res.data) ? res.data : []);
        setErrorMessage(null);
      } catch (error) {
        const msg = error.response?.data?.message || `Erro ao carregar: ${error.message}`;
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contextLoading, armazens.length, setArmazens]);

  // Mensagens de erro
  useEffect(() => {
    if (contextError) {
      setErrorMessage(contextError);
    } else if (!armazens.length && !contextLoading) {
      setErrorMessage('Nenhum armazém encontrado.');
    } else if (!empresas.length && !contextLoading) {
      setErrorMessage('Nenhuma empresa cadastrada. Cadastre uma empresa primeiro.');
    } else {
      setErrorMessage(null);
    }
  }, [armazens, empresas, contextError, contextLoading, updateTrigger]);

  // Enriquecer com nome da empresa
  const enrichedArmazens = useMemo(() => {
    return armazens.map((armazem) => {
      const empresa = empresas.find((e) => e.id === armazem.empresaId);
      return {
        ...armazem,
        empresaNome: empresa ? empresa.nome : 'Sem empresa',
      };
    });
  }, [armazens, empresas, updateTrigger]); // Força recalcular

  const filteredArmazens = useMemo(
    () =>
      enrichedArmazens.filter((a) =>
        a.designacao?.toLowerCase().includes(armazemSearch.toLowerCase())
      ),
    [enrichedArmazens, armazemSearch]
  );

  // CRIAR – adiciona localmente
  const handleArmazemSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const payload = {
          designacao: values.designacao.trim(),
          empresaId: Number(values.empresaId),
        };

        const { data: novo } = await api.post('/armazem/add', payload);

        const empresa = empresas.find((e) => e.id === novo.empresaId);
        const novoComNome = {
          ...novo,
          empresaNome: empresa?.nome || 'Sem empresa',
        };

        setArmazens((prev) => [...prev, novoComNome]);
        setUpdateTrigger((t) => t + 1); // Força atualização

        toast.success('Armazém criado!');
        setShowArmazemModal(false);
        form.resetFields();
      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao criar armazém';
        toast.error(msg);
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    },
    [empresas, setArmazens, form]
  );

  // EDITAR – ATUALIZA LOCALMENTE E FORÇA RECOMPUTAÇÃO
  const handleArmazemEditSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const payload = {
          designacao: values.designacao.trim(),
          empresaId: Number(values.empresaId),
        };

        const { data: atualizado } = await api.put(`/armazem/${selectedArmazem.id}`, payload);

        const empresa = empresas.find((e) => e.id === atualizado.empresaId);
        const atualizadoComNome = {
          ...atualizado,
          empresaNome: empresa?.nome || 'Sem empresa',
        };

        // Atualiza o estado com o objeto completo
        setArmazens((prev) =>
          prev.map((a) => (a.id === atualizado.id ? atualizadoComNome : a))
        );

        setUpdateTrigger((t) => t + 1); // Força useMemo a recalcular

        toast.success('Armazém atualizado!');
        setShowArmazemModal(false);
        form.resetFields();
        setSelectedArmazem(null);
      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao atualizar armazém';
        toast.error(msg);
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    },
    [selectedArmazem, empresas, setArmazens, form]
  );

  // DELETAR – remove localmente
  const handleDeleteArmazem = useCallback(
    async (id) => {
      setLoading(true);
      try {
        await api.delete(`/armazem/${id}`);
        setArmazens((prev) => prev.filter((a) => a.id !== id));
        setUpdateTrigger((t) => t + 1); // Força atualização
        toast.success('Armazém excluído!');
      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao excluir';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [setArmazens]
  );

  const handleExport = useCallback(() => {
    const csv = [
      ['ID', 'Designação', 'Empresa'],
      ...filteredArmazens.map((a) => [a.id, a.designacao, a.empresaNome]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `armazens_${moment().format('YYYYMMDD')}.csv`;
    link.click();
    toast.success('Exportado!');
  }, [filteredArmazens]);

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
      { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
      { title: 'Empresa', dataIndex: 'empresaNome', key: 'empresaNome' },
      {
        title: 'Ações',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Editar">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  form.setFieldsValue({
                    designacao: record.designacao,
                    empresaId: record.empresaId,
                  });
                  setSelectedArmazem(record);
                  setShowArmazemModal(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title={`Excluir "${record.designacao}"?`}
              onConfirm={() => handleDeleteArmazem(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [form, handleDeleteArmazem]
  );

  return (
    <div className="armazem-container">
      <Spin spinning={loading || contextLoading}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Gestão de Armazéns</Title>
          </Col>
        </Row>

        {errorMessage && (
          <Alert message="Erro" description={errorMessage} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Card>
          <Row gutter={16} justify="space-between" style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Buscar por designação"
                value={armazemSearch}
                onChange={(e) => setArmazemSearch(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ExportOutlined />} onClick={handleExport} disabled={!filteredArmazens.length}>
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
                  disabled={empresas.length === 0}
                >
                  Novo Armazém
                </Button>
              </Space>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredArmazens}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
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
          width={600}
        >
          <Form
            form={form}
            onFinish={selectedArmazem ? handleArmazemEditSubmit : handleArmazemSubmit}
            layout="vertical"
          >
            <Form.Item
              name="designacao"
              label="Designação"
              rules={[{ required: true, message: 'Obrigatório' }]}
            >
              <Input placeholder="Ex: Armazém Central" />
            </Form.Item>

            <Form.Item
              name="empresaId"
              label="Empresa"
              rules={[{ required: true, message: 'Selecione uma empresa' }]}
            >
              <Select placeholder="Selecione" showSearch optionFilterProp="children">
                {empresas.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.nome}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowArmazemModal(false)}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  {selectedArmazem ? 'Atualizar' : 'Salvar'}
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