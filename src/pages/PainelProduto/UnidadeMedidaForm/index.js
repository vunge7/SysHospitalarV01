import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Input, Button, Table, Spin, Alert, Space, notification } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './style.css';
import { api } from '../../../service/api';

const schema = z.object({
  descricao: z.string().min(2, { message: 'A descrição deve ter pelo menos 2 caracteres.' }).max(60),
  abrevicao: z.string().min(1, { message: 'A abreviação é obrigatória.' }).max(10),
});

const UnidadeMedidaForm = ({ buscarUnidades }) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { descricao: '', abrevicao: '' },
  });
  const [modalIsOpenAddUnidade, setModalIsOpenAddUnidade] = useState(false);
  const [carregar, setCarregar] = useState(false);
  const [unidadesInternas, setUnidadesInternas] = useState([]);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState('Adicionar');
  const [unidadeRemover, setUnidadeRemover] = useState(null);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [errosNoFront, setErrosNoFront] = useState([]);

  const fetchUnidades = async () => {
    setCarregar(true);
    try {
      const result = await api.get('unidade/all');
      setUnidadesInternas(result.data);
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao buscar unidades']);
    } finally {
      setCarregar(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  const onAddNewUnidade = async (data) => {
    setCarregar(true);
    try {
      if (statusSendEdit) {
        await api.put('unidade/edit', { ...data, id });
        notification.success({
          message: 'Sucesso',
          description: 'Unidade de Medida Editada com Sucesso',
          placement: 'topRight',
        });
      } else {
        await api.post('unidade/add', data);
        notification.success({
          message: 'Sucesso',
          description: 'Unidade de Medida Salva com Sucesso',
          placement: 'topRight',
        });
      }
      reset();
      fetchUnidades();
      buscarUnidades();
      setErrosNoFront([]);
      setModalIsOpenAddUnidade(false);
      setStatusSendEdit(false);
      setBtnEnviar('Adicionar');
    } catch (error) {
      console.error('Erro ao salvar/editar unidade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar/editar unidade';
      setErrosNoFront(prev => [...prev, errorMessage]);
      notification.error({
        message: 'Erro',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setCarregar(false);
    }
  };

  const onEditar = (unidade) => {
    setStatusSendEdit(true);
    setBtnEnviar('Editar Unidade');
    setId(unidade.id);
    reset({ descricao: unidade.descricao, abrevicao: unidade.abrevicao });
    setModalIsOpenAddUnidade(true);
    setErrosNoFront([]);
  };

  const onRemover = (unidade) => {
    setUnidadeRemover(unidade);
    setModalIsOpenRemove(true);
  };

  const onConfirmar = async () => {
    setCarregar(true);
    try {
      await api.delete(`unidade/${unidadeRemover.id}`);
      notification.success({
        message: 'Sucesso',
        description: 'Unidade Removida com Sucesso',
        placement: 'topRight',
      });
      fetchUnidades();
      buscarUnidades();
      setModalIsOpenRemove(false);
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao remover unidade';
      setErrosNoFront(prev => [...prev, errorMessage]);
      notification.error({
        message: 'Erro',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setCarregar(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
    { title: 'Abreviação', dataIndex: 'abrevicao', key: 'abrevicao' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEditar(record)} className="form-button" />
          <Button icon={<DeleteOutlined />} onClick={() => onRemover(record)} className="form-button form-button-danger" />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setModalIsOpenAddUnidade(true)} className="form-button form-button-primary" />
      <Modal
        title={statusSendEdit ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
        open={modalIsOpenAddUnidade}
        onCancel={() => {
          setModalIsOpenAddUnidade(false);
          setStatusSendEdit(false);
          setBtnEnviar('Adicionar');
          reset();
        }}
        footer={null}
        className="produto-form-modal"
        width={600}
        bodyStyle={{ height: '350px', overflow: 'hidden' }}
      >
        <Spin spinning={carregar}>
          {errosNoFront.length > 0 && (
            <Alert
              message="Erros"
              description={errosNoFront.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
              type="error"
              showIcon
              className="form-error-alert"
            />
          )}
          <Form onFinish={handleSubmit(onAddNewUnidade)} layout="vertical" className="produto-form">
            <Form.Item
              label="Descrição"
              validateStatus={errors.descricao ? 'error' : ''}
              help={errors.descricao?.message}
            >
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Descrição..." className="form-input" />}
              />
            </Form.Item>
            <Form.Item
              label="Abreviação"
              validateStatus={errors.abrevicao ? 'error' : ''}
              help={errors.abrevicao?.message}
            >
              <Controller
                name="abrevicao"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Abreviação..." className="form-input" />}
              />
            </Form.Item>
            <Form.Item className="produto-form-buttons">
              <Button type="primary" htmlType="submit" loading={carregar} className="form-button form-button-primary">
                {btnEnviar}
              </Button>
            </Form.Item>
          </Form>
          <Table
            columns={columns}
            dataSource={unidadesInternas}
            rowKey="id"
            locale={{ emptyText: 'Nenhuma unidade encontrada' }}
            className="form-table"
            pagination={false}
            scroll={{ y: 150 }}
          />
        </Spin>
      </Modal>
      <Modal
        title="Deseja Remover Esta Unidade de Medida?"
        open={modalIsOpenRemove}
        onOk={onConfirmar}
        onCancel={() => setModalIsOpenRemove(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        confirmLoading={carregar}
        className="produto-form-modal"
        bodyStyle={{ height: '150px', overflow: 'hidden' }}
      />
    </>
  );
};

export default UnidadeMedidaForm;