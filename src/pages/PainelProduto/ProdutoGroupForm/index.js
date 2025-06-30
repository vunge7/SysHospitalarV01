import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Input, Button, Table, Spin, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './style.css';
import { api } from '../../../service/api';

// Definindo o esquema de validação com Zod
const schema = z.object({
  designacaoProduto: z.string().min(2, { message: 'O grupo do produto deve ter pelo menos 2 caracteres.' }).max(60, { message: 'Selecione um grupo válido.' }),
});

function ProdutoGroupForm({ buscarProdutosGrupos }) {
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    resolver: zodResolver(schema),
  });
  const [errosNoFront, setErrosNoFront] = useState([]);
  const [modalIsOpenAddGroup, setModalIsOpenAddGroup] = useState(false);
  const [carregar, setCarregar] = useState(false);
  const [produto, setProduto] = useState([]);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState('Adicionar');
  const [produtoRemover, setProdutoRemover] = useState(null);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);

  const onAddNewGroup = async (data) => {
    setCarregar(true);
    const dataToSubmit = { designacaoProduto: data.designacaoProduto, id };
    console.log('Dados a serem enviados para o backend:', dataToSubmit);
    try {
      if (statusSendEdit) {
        await api.put('productgroup/edit', dataToSubmit);
        Modal.success({ content: 'Grupo do Produto Editado com Sucesso' });
      } else {
        await api.post('productgroup/add', { designacaoProduto: data.designacaoProduto });
        Modal.success({ content: 'Grupo do Produto Salvo com Sucesso' });
      }
      setValue('designacaoProduto', '');
      buscarProdutosGrupos();
      buscarProdutosGrupo();
      setModalIsOpenAddGroup(false);
      setErrosNoFront([]);
    } catch (error) {
      console.error('Erro ao salvar/editar grupo:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao salvar/editar grupo']);
    } finally {
      setCarregar(false);
    }
  };

  const OpenGroup = () => {
    setModalIsOpenAddGroup(true);
    buscarProdutosGrupo();
  };

  const closeGroup = () => {
    setModalIsOpenAddGroup(false);
    setStatusSendEdit(false);
    setBtnEnviar('Adicionar');
    setValue('designacaoProduto', '');
  };

  const buscarProdutosGrupo = async () => {
    setCarregar(true);
    try {
      const result = await api.get('productgroup/all');
      setProduto(result.data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao buscar grupos']);
    } finally {
      setCarregar(false);
    }
  };

  const onEditar = (prod) => {
    setStatusSendEdit(true);
    setBtnEnviar('Editar Grupo');
    setId(prod.id);
    setValue('designacaoProduto', prod.designacaoProduto);
    setModalIsOpenAddGroup(true);
    setErrosNoFront([]);
  };

  const onRemover = (data) => {
    setProdutoRemover(data);
    setModalIsOpenRemove(true);
  };

  const onConfirmar = async () => {
    setCarregar(true);
    try {
      await api.delete(`productgroup/${produtoRemover.id}`);
      console.log('Grupo removido com sucesso:', produtoRemover.id);
      buscarProdutosGrupo();
      setModalIsOpenRemove(false);
      setStatusSendEdit(false);
      Modal.success({ content: 'Grupo Removido com Sucesso' });
    } catch (error) {
      console.error('Erro ao remover grupo:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao remover grupo']);
      Modal.error({ content: 'ERRO ao Deletar Grupo!' });
    } finally {
      setCarregar(false);
    }
  };

  const onCancelar = () => {
    setModalIsOpenRemove(false);
  };

  const anularEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    buscarProdutosGrupo();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação do Produto', dataIndex: 'designacaoProduto', key: 'designacaoProduto' },
    {
      title: 'Alterações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEditar(record)}>Editar</Button>
          <Button icon={<DeleteOutlined />} onClick={() => onRemover(record)}>Remover</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" className='btnAddGroup' shape="circle" icon={<PlusOutlined />} onClick={OpenGroup} />
      <Modal
        title="Novo Grupo de Produto"
        open={modalIsOpenAddGroup}
        onCancel={closeGroup}
        footer={null}
      >
        <Spin spinning={carregar}>
          <Form onFinish={handleSubmit(onAddNewGroup)} layout="vertical">
            {errosNoFront.length > 0 && (
              <ul id="errosNoFront">
                {errosNoFront.map((e, i) => <li key={i} className="error-message">{e}</li>)}
              </ul>
            )}
            <Form.Item
              className="input-group"
              label="Designação do Grupo de Produto"
              validateStatus={errors.designacaoProduto ? 'error' : ''}
            >
              <Controller
                name="designacaoProduto"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.designacaoProduto ? 'input-error' : ''}
                    placeholder="Aa..."
                    onKeyDown={anularEnter}
                  />
                )}
              />
              {errors.designacaoProduto && <span className="error-message">{errors.designacaoProduto.message}</span>}
            </Form.Item>
            <Form.Item className="form-actions">
              <Button className="submit-button" type="primary" htmlType="submit" loading={carregar}>
                {btnEnviar}
              </Button>
            </Form.Item>
          </Form>
          <Table
            className="my-custom-table"
            columns={columns}
            dataSource={produto}
            rowKey="id"
            locale={{ emptyText: 'Nenhum grupo de produto encontrado' }}
          />
          <Modal
            title="Deseja Remover Este Grupo de Produto?"
            open={modalIsOpenRemove}
            onOk={onConfirmar}
            onCancel={onCancelar}
            okText="Confirmar"
            cancelText="Cancelar"
            confirmLoading={carregar}
          />
        </Spin>
      </Modal>
    </div>
  );
}

export default ProdutoGroupForm;