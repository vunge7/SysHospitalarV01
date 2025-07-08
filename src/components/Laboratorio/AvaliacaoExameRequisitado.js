import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Card,
    notification,
    Typography,
    Popconfirm,
    InputNumber,
    Space,
} from 'antd';
import {
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';

const { Title, Text } = Typography;

function AvaliacaoExameRequisitado({
    examesRequisitados,
    setExamesRequisitados,
    setExames,
    updateExame,
    deleteExame,
    fetchAllData,
}) {
    const [form] = Form.useForm();
    const [selectedExame, setSelectedExame] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRequisicao, setSelectedRequisicao] = useState(null);
    const [valores, setValores] = useState({});

    const [linhasRequisicao, setLinhasRequisicao] = useState([]);

    // Reset selection when examesRequisitados changes
    useEffect(() => {
        console.log('Exames Requisitados:', examesRequisitados);
        setLinhasRequisicao([]);
        setSelectedRequisicao(null);
    }, [examesRequisitados]);

    // Fetch linhas de requisição for the selected requisition
    const fetchLinhasRequisicao = async (requisicaoExameId) => {
        try {
            console.log('Fetching linhas for requisicaoExameId:', requisicaoExameId);
            const response = await api.get(`linharequisicaoexame/all/requisicao/${requisicaoExameId}`);
            console.log('Endpoint response:', response.data);
            const mappedData = response.data.map((item) => ({
                id: item.id,
                exame: item.exame || 'N/A',
                descricao: item.exame || 'Sem descrição', // Replace with item.designacao if confirmed
                status: item.estado || 'PENDENTE',
                resultado: item.resultado || null,
                referencias: item.referencias || {}, // Fallback to empty object
                requisicaoExameId: item.requisicaoExameId || null,
                statusBoolean: item.status, // Store boolean status for backend updates
            }));
            setLinhasRequisicao(mappedData);
        } catch (error) {
            console.error('Error fetching linhas de requisição:', error);
            notification.error({
                message: error.response?.data || 'Erro ao buscar linhas de requisição!',
            });
            setLinhasRequisicao([]);
        }
    };

    const handleRowClick = (record) => {
        setSelectedRequisicao(record);
        setLinhasRequisicao([]);
        fetchLinhasRequisicao(record.id);
    };

    const showResultModal = (exame) => {
        if (!exame) {
            notification.error({ message: 'Dados do exame inválidos!' });
            console.log('Invalid exame:', exame);
            return;
        }
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
            console.log('Finalizing exame ID:', selectedExame.id, 'Payload:', values);
            const referenciasKeys = Object.keys(selectedExame.referencias || {});
            // Only validate referencias if they exist
            if (referenciasKeys.length > 0) {
                const todosPreenchidos = referenciasKeys.every(
                    (key) => values.valores[key] !== undefined
                );
                if (!todosPreenchidos) {
                    throw new Error('Preencha todos os valores dos componentes do exame.');
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
                status: true, // Boolean for backend
            };

            const response = await updateExame(selectedExame.id, updatedExame);
            console.log('Update response:', response.data);
            notification.success({ message: 'Resultado finalizado com sucesso!' });
            handleCancel();
            fetchAllData();
            fetchLinhasRequisicao(selectedRequisicao.id);
        } catch (error) {
            console.error('Error finalizing exame:', error);
            notification.error({
                message: error.response?.data || error.message || 'Erro ao finalizar resultado!',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExame = async (id) => {
        try {
            console.log('Deleting exame ID:', id);
            const response = await deleteExame(id);
            console.log('Delete response:', response.data);
            notification.success({ message: 'Exame excluído com sucesso!' });
            fetchLinhasRequisicao(selectedRequisicao.id);
            fetchAllData();
        } catch (error) {
            console.error('Error deleting exame:', error);
            notification.error({
                message: error.response?.data || 'Erro ao excluir exame!',
            });
        }
    };

    const handleReopenExame = async (exame) => {
        try {
            console.log('Reopening exame ID:', exame.id);
            const updatedExame = {
                ...exame,
                resultado: null,
                status: false, // Boolean for backend
            };
            const response = await updateExame(exame.id, updatedExame);
            console.log('Reopen response:', response.data);
            notification.success({ message: 'Exame reaberto com sucesso!' });
            fetchAllData();
            fetchLinhasRequisicao(selectedRequisicao.id);
        } catch (error) {
            console.error('Error reopening exame:', error);
            notification.error({
                message: error.response?.data || 'Erro ao reabrir exame!',
            });
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
            dataIndex: 'paciente',
            key: 'paciente',
            render: (paciente) => paciente || 'N/A',
        },
        {
            title: 'Médico',
            dataIndex: 'medico',
            key: 'medico',
            render: (medico) => medico || 'N/A',
        },
        {
            title: 'Data da Requisição',
            dataIndex: 'data',
            key: 'data',
            render: (data) => (data ? moment(data).format('DD/MM/YYYY HH:mm') : 'N/A'),
        },
    ];

    const examesColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Exame',
            dataIndex: 'exame',
            key: 'exame',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
            render: (text) => text || 'Sem descrição',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text) => text || 'PENDENTE',
        },
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
                {examesRequisitados.length === 0 ? (
                    <Text>Nenhuma requisição disponível.</Text>
                ) : (
                    <Table
                        columns={requisicoesColumns}
                        dataSource={examesRequisitados}
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
                <Card title={`Detalhes do Exame - Requisição ${selectedRequisicao.id}`}>
                    <Table
                        columns={examesColumns}
                        dataSource={linhasRequisicao}
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
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                {selectedExame && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinishResult}
                    >
                        {selectedExame.referencias && Object.keys(selectedExame.referencias).length > 0 ? (
                            <Table
                                dataSource={Object.entries(selectedExame.referencias).map(([key, ref]) => ({
                                    key,
                                    exame: key,
                                    unidade: ref?.unidade || 'N/A',
                                    intervalo: ref?.valor || 'N/A',
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
                                                    {
                                                        required: true,
                                                        message: `Insira valor para ${record.exame}`,
                                                    },
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
                                                    onChange={(value) =>
                                                        setValores({
                                                            ...valores,
                                                            [record.exame]: value,
                                                        })
                                                    }
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
                                <Form.Item
                                    name={['valores', selectedExame.exame || 'valor']}
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
                                        style={{ width: '100%' }}
                                        onChange={(value) =>
                                            setValores({
                                                ...valores,
                                                [selectedExame.exame || 'valor']: value,
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