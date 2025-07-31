import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Input, Button, Table, Spin, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { api } from '../../../service/api';

// Definindo o esquema de validação com Zod
const schema = z.object({
  designacaoTipoProduto: z.string().min(2, { message: 'O tipo do produto deve ter pelo menos 2 caracteres.' }).max(60, { message: 'Selecione um tipo válido.' }),
});

function ProdutoTypeForm({ buscarTiposProduto }) {
  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    resolver: zodResolver(schema),
  });
  const [errosNoFront, setErrosNoFront] = useState([]);
  const [modalIsOpenAddType, setModalIsOpenAddType] = useState(false);
  const [carregar, setCarregar] = useState(false);
  const [produto, setProduto] = useState([]);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState('Adicionar');
  const [produtoRemover, setProdutoRemover] = useState(null);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);

  const onAddNewType = async (data) => {
    setCarregar(true);
    const dataToSubmit = { designacaoTipoProduto: data.designacaoTipoProduto, id };
    console.log('Dados a serem enviados para o backend:', dataToSubmit);
    try {
      if (statusSendEdit) {
        await api.put('/producttype/edit', dataToSubmit);
        Modal.success({ content: 'Tipo do Produto Editado com Sucesso' });
      } else {
        await api.post('/producttype/add', { designacaoTipoProduto: data.designacaoTipoProduto });
        Modal.success({ content: 'Tipo do Produto Salvo com Sucesso' });
      }
      setValue('designacaoTipoProduto', '');
      buscarTiposProduto();
      buscarTiposProdutos();
      setModalIsOpenAddType(false);
      setErrosNoFront([]);
    } catch (error) {
      console.error('Erro ao salvar/editar tipo:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao salvar/editar tipo']);
    } finally {
      setCarregar(false);
    }
  };

  const OpenType = () => {
    setModalIsOpenAddType(true);
    buscarTiposProdutos();
  };

  const closeType = () => {
    setModalIsOpenAddType(false);
    setStatusSendEdit(false);
    setBtnEnviar('Adicionar');
    setValue('designacaoTipoProduto', '');
  };

  const buscarTiposProdutos = async () => {
    setCarregar(true);
    try {
      const result = await api.get('/producttype/all');
      setProduto(result.data);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao buscar tipos']);
    } finally {
      setCarregar(false);
    }
  };

  const onEditar = (prod) => {
    setStatusSendEdit(true);
    setBtnEnviar('Editar Tipo');
    setId(prod.id);
    setValue('designacaoTipoProduto', prod.designacaoTipoProduto);
    setModalIsOpenAddType(true);
    setErrosNoFront([]);
  };

  const onRemover = (data) => {
    setProdutoRemover(data);
    setModalIsOpenRemove(true);
  };

  const onConfirmar = async () => {
    setCarregar(true);
    try {
      await api.delete(`/producttype/${produtoRemover.id}`);
      console.log('Tipo removido com sucesso:', produtoRemover.id);
      buscarTiposProdutos();
      setModalIsOpenRemove(false);
      setStatusSendEdit(false);
      Modal.success({ content: 'Tipo Removido com Sucesso' });
    } catch (error) {
      console.error('Erro ao remover tipo:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao remover tipo']);
      Modal.error({ content: 'ERRO ao Deletar Tipo!' });
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
    buscarTiposProdutos();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação do Produto', dataIndex: 'designacaoTipoProduto', key: 'designacaoTipoProduto' },
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
      <Button type="primary" shape="circle" className='btnAddType'  icon={<PlusOutlined />} onClick={OpenType} />
      <Modal
        title="Novo Tipo de Produto"
        open={modalIsOpenAddType}
        onCancel={closeType}
        footer={null}
      >
        <Spin spinning={carregar}>
          <Form onFinish={handleSubmit(onAddNewType)} layout="vertical">
            {errosNoFront.length > 0 && (
              <ul id="errosNoFront">
                {errosNoFront.map((e, i) => <li key={i} className="error-message">{e}</li>)}
              </ul>
            )}
            <Form.Item
              className="input-group"
              label="Designação do Tipo de Produto"
              validateStatus={errors.designacaoTipoProduto ? 'error' : ''}
            >
              <Controller
                name="designacaoTipoProduto"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.designacaoTipoProduto ? 'input-error' : ''}
                    placeholder="Aa..."
                    onKeyDown={anularEnter}
                  />
                )}
              />
              {errors.designacaoTipoProduto && <span className="error-message">{errors.designacaoTipoProduto.message}</span>}
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
            locale={{ emptyText: 'Nenhum tipo de produto encontrado' }}
          />
          <Modal
            title="Deseja Remover Este Tipo de Produto?"
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

export default ProdutoTypeForm;