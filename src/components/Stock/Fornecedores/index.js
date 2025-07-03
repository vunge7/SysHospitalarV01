import React, { useContext, useState, useEffect } from 'react';
import { StockContext } from '../../../context/StockContext'; // Ajustado para o caminho correto
import { Table, Button, Modal, Form, Input, Select, Spin, notification, Popconfirm, Space, Tooltip, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Fornecedores.css';

const API_BASE_URL = 'http://localhost:8081';

const Fornecedores = () => {
  const { fornecedores, setFornecedores, loading, setLoading, error } = useContext(StockContext);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const handleAddFornecedor = async (values) => {
    setLoading(true);
    try {
      const fornecedorData = {
        nome: values.nome?.trim(),
        contacto: values.contacto?.trim(),
        nif: values.nif?.trim(),
        endereco: values.endereco?.trim(),
        regimeTributario: values.regimeTributario || 'GERAL',
        estadoFornecedor: values.estadoFornecedor || 'ATIVO',
      };

      console.log('Payload enviado para cadastro/edição:', fornecedorData);

      let response;
      if (editingFornecedor) {
        // Edição de fornecedor
        response = await axios.put(`${API_BASE_URL}/fornecedor/edit`, { ...fornecedorData, id: editingFornecedor.id });
        const updatedFornecedor = {
          id: editingFornecedor.id,
          nome: response.data.nome || fornecedorData.nome,
          contacto: response.data.contacto || fornecedorData.contacto,
          nif: response.data.nif || fornecedorData.nif,
          endereco: response.data.endereco || fornecedorData.endereco,
          regimeTributario: response.data.regimeTributario || fornecedorData.regimeTributario,
          estadoFornecedor: response.data.estadoFornecedor || fornecedorData.estadoFornecedor,
        };
        console.log('Resposta da API (edição):', response.data);
        setFornecedores((prev) =>
          prev.map((f) => (f.id === editingFornecedor.id ? updatedFornecedor : f))
        );
        notification.success({ message: 'Sucesso', description: 'Fornecedor atualizado com sucesso!' });
      } else {
        // Cadastro de novo fornecedor
        response = await axios.post(`${API_BASE_URL}/fornecedor/add`, fornecedorData);
        if (!response.data || typeof response.data !== 'object' || !response.data.id) {
          throw new Error('Resposta da API inválida: fornecedor não retornado corretamente.');
        }
        const newFornecedor = {
          id: response.data.id,
          nome: response.data.nome || fornecedorData.nome,
          contacto: response.data.contacto || fornecedorData.contacto,
          nif: response.data.nif || fornecedorData.nif,
          endereco: response.data.endereco || fornecedorData.endereco,
          regimeTributario: response.data.regimeTributario || fornecedorData.regimeTributario,
          estadoFornecedor: response.data.estadoFornecedor || fornecedorData.estadoFornecedor,
        };
        console.log('Resposta da API (cadastro):', response.data);
        setFornecedores((prev) => {
          const updated = [...prev, newFornecedor];
          console.log('Estado fornecedores atualizado:', updated);
          return updated;
        });
        notification.success({ message: 'Sucesso', description: 'Fornecedor cadastrado com sucesso!' });
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingFornecedor(null);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Erro interno no servidor. Contate o administrador.';
      console.error('Erro ao cadastrar/editar fornecedor:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        headers: err.config?.headers,
      });
      notification.error({
        message: 'Erro',
        description: `${errorMessage} (Código: ${err.response?.status || 'desconhecido'})`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFornecedor = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    form.setFieldsValue({
      nome: fornecedor.nome || '',
      contacto: fornecedor.contacto || '',
      nif: fornecedor.nif || '',
      endereco: fornecedor.endereco || '',
      regimeTributario: fornecedor.regimeTributario || 'GERAL',
      estadoFornecedor: fornecedor.estadoFornecedor || 'ATIVO',
    });
    setIsModalOpen(true);
  };

  const handleDeleteFornecedor = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/fornecedor/${id}`);
      console.log('Resposta da API (exclusão):', response.data);
      setFornecedores((prev) => prev.filter((f) => f.id !== id));
      notification.success({ message: 'Sucesso', description: 'Fornecedor excluído com sucesso!' });
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Erro ao excluir fornecedor.';
      console.error('Erro ao excluir fornecedor:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      notification.error({
        message: 'Erro',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFornecedores = Array.isArray(fornecedores)
    ? fornecedores.filter((fornecedor) => {
        if (!fornecedor || typeof fornecedor !== 'object') return false;
        const nome = fornecedor.nome || '';
        const nif = fornecedor.nif || '';
        const matchesSearch =
          nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nif.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || fornecedor.estadoFornecedor === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const columns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome', render: (nome) => nome || 'N/A' },
    { title: 'NIF', dataIndex: 'nif', key: 'nif', render: (nif) => nif || 'N/A' },
    { title: 'Contacto', dataIndex: 'contacto', key: 'contacto', render: (contacto) => contacto || 'N/A' },
    { title: 'Endereço', dataIndex: 'endereco', key: 'endereco', render: (endereco) => endereco || 'N/A' },
    {
      title: 'Regime Tributário',
      dataIndex: 'regimeTributario',
      key: 'regimeTributario',
      render: (regime) => regime || 'N/A',
    },
    {
      title: 'Estado',
      dataIndex: 'estadoFornecedor',
      key: 'estadoFornecedor',
      render: (estado) => (estado === 'ATIVO' ? 'Ativo' : estado === 'INATIVO' ? 'Inativo' : 'N/A'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => handleEditFornecedor(record)}
              disabled={loading}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir este fornecedor?"
            onConfirm={() => handleDeleteFornecedor(record.id)}
            okText="Sim"
            cancelText="Não"
            disabled={loading}
          >
            <Tooltip title="Excluir">
              <Button icon={<DeleteOutlined />} type="text" danger disabled={loading} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Carregando dados..." />;
  if (error) return <Alert message="Erro" description={error} type="error" showIcon />;

  return (
    <div className="fornecedores-container">
      <h2 className="section-title">Fornecedores</h2>
      <div className="filters">
        <Input
          placeholder="Pesquisar por nome ou NIF"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder="Filtrar por estado"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 150, marginRight: 16 }}
          allowClear
        >
          <Select.Option value="ATIVO">Ativo</Select.Option>
          <Select.Option value="INATIVO">Inativo</Select.Option>
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingFornecedor(null);
            setIsModalOpen(true);
          }}
          disabled={loading}
        >
          Novo Fornecedor
        </Button>
      </div>
      {filteredFornecedores.length === 0 && !loading && !error && (
        <p>Nenhum fornecedor encontrado.</p>
      )}
      <Table
        columns={columns}
        dataSource={filteredFornecedores}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
        className="custom-table"
      />
      <Modal
        title={editingFornecedor ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingFornecedor(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleAddFornecedor} layout="vertical">
          <Form.Item
            name="nome"
            label="Nome"
            rules={[
              { required: true, message: 'Nome é obrigatório' },
              { min: 3, max: 200, message: 'Nome deve ter entre 3 e 200 caracteres' },
            ]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            name="contacto"
            label="Contacto"
            rules={[
              { required: true, message: 'Contacto é obrigatório' },
              {
                pattern: /^(\+?[0-9]{7,15}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
                message: 'Insira um telefone válido (ex.: +123456789) ou email (ex.: exemplo@dominio.com)',
              },
            ]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            name="nif"
            label="NIF"
            rules={[
              { required: true, message: 'NIF é obrigatório' },
              { min: 9, max: 20, message: 'NIF deve ter entre 9 e 20 caracteres' },
              { pattern: /^[0-9A-Za-z]+$/, message: 'NIF deve conter apenas números e letras' },
            ]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            name="endereco"
            label="Endereço"
            rules={[
              { required: true, message: 'Endereço é obrigatório' },
              { min: 5, max: 300, message: 'Endereço deve ter entre 5 e 300 caracteres' },
            ]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            name="regimeTributario"
            label="Regime Tributário"
            rules={[{ required: true, message: 'Regime tributário é obrigatório' }]}
          >
            <Select disabled={loading}>
              <Select.Option value="GERAL">Geral</Select.Option>
              <Select.Option value="SIMPLIFICADO">Simplificado</Select.Option>
              <Select.Option value="EXCLUSAO">Exclusão</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="estadoFornecedor"
            label="Estado"
            rules={[{ required: true, message: 'Estado é obrigatório' }]}
          >
            <Select disabled={loading}>
              <Select.Option value="ATIVO">Ativo</Select.Option>
              <Select.Option value="INATIVO">Inativo</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Salvar
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFornecedor(null);
                  form.resetFields();
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => form.resetFields()}
                disabled={loading}
                type="dashed"
              >
                Limpar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Fornecedores;