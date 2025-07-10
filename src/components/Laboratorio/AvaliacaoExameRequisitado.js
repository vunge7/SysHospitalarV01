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
    const [linhasResultado, setLinhasResultado] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [unidades, setUnidades] = useState([]);

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
                finalizado: item.finalizado, // Adicionar finalizado
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

    const fetchLinhasResultado = async () => {
        const res = await api.get('linharesultado/all');
        setLinhasResultado(res.data || []);
    };

    useEffect(() => {
        if (selectedRequisicao) {
            fetchLinhasRequisicao(selectedRequisicao.id);
            fetchLinhasResultado();
        }
    }, [selectedRequisicao]);

    // Corrija os endpoints para bater com o backend
    useEffect(() => {
        api.get('produto/all').then(res => setProdutos(res.data || []));
        api.get('/paciente/all').then(res => setPacientes(res.data || []));
        api.get('usuario/all').then(res => setUsuarios(res.data || []));
        api.get('unidade/all').then(res => setUnidades(res.data || []));
        // Remova api.get('medico/all') se não existir no backend
    }, []);

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
            // Extrair o valor do resultado corretamente
            let valorReferencia = null;
            if (values.valores && typeof values.valores === 'object') {
                // Se houver múltiplos exames, pega o primeiro valor
                const firstKey = Object.keys(values.valores)[0];
                valorReferencia = Number(values.valores[firstKey]);
            } else if (values.valorReferencia !== undefined) {
                valorReferencia = Number(values.valorReferencia);
            }
            const linhaResultado = {
                exameId: selectedExame.id,
                valorReferencia: valorReferencia,
                unidadeId: selectedExame.unidadeId || null,
                observacao: values.observacao || "",
                pacienteId: selectedRequisicao.pacienteId || selectedRequisicao.paciente_id,
                usuarioId: selectedRequisicao.medicoId || selectedRequisicao.medico_id,
                resultadoId: selectedExame.resultado?.id || null, // Adicionar resultadoId
            };
            await api.post('linharesultado/add', linhaResultado);

            notification.success({ message: 'Resultado finalizado com sucesso!' });
            handleCancel();
            fetchAllData();
            if (selectedRequisicao && selectedRequisicao.id) {
                await fetchLinhasRequisicao(selectedRequisicao.id);
                await fetchLinhasResultado();
            }
        } catch (error) {
            notification.error({
                message: 'Erro ao finalizar resultado!',
                description: error.response?.data?.message || error.message || JSON.stringify(error.response?.data) || 'Erro desconhecido'
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
                finalizado: false, // Boolean for backend
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

    const isLinhaInserida = (linha) =>
        linhasResultado.some(lr => lr.exameId === linha.id);

    const getUnidadeId = (linha) => {
        const produto = produtos.find(p => p.id === linha.produtoId);
        return produto ? produto.unidadeMedidaId : '';
    };
    const getUnidadeNome = (linha) => {
        const unidadeId = getUnidadeId(linha);
        const unidade = unidades.find(u => u.id === unidadeId);
        return unidade ? `${unidade.descricao} (${unidade.abrevicao})` : unidadeId || '';
    };
    const getLinhaResultado = (linha) => linhasResultado.find(lr => lr.exameId === linha.id) || {};
    const getPacienteNome = (linha) => {
        const lr = getLinhaResultado(linha);
        const pacienteId = lr.pacienteId || selectedRequisicao?.pacienteId || selectedRequisicao?.paciente_id;
        const paciente = pacientes.find(p => p.id === pacienteId);
        return paciente ? paciente.nome : pacienteId || '';
    };
    const getUsuarioNome = (linha) => {
        const lr = getLinhaResultado(linha);
        const usuarioId = lr.usuarioId || selectedRequisicao?.usuarioId || selectedRequisicao?.medicoId || selectedRequisicao?.medico_id;
        const usuario = usuarios.find(u => u.id === usuarioId);
        return usuario ? usuario.userName : usuarioId || '';
    };
    const getMedicoNome = (linha) => {
        const lr = getLinhaResultado(linha);
        const usuarioId = lr.usuarioId || selectedRequisicao?.usuarioId || selectedRequisicao?.medicoId || selectedRequisicao?.medico_id;
        const medico = medicos.find(m => m.usuarioId === usuarioId);
        return medico ? medico.nome : '';
    };

    // Corrija a tabela para não duplicar IDs e mostrar corretamente o resultadoId
    const examesColumns = [
        // Remova a duplicidade: mantenha apenas uma coluna de ID
        // { title: 'ID', dataIndex: 'id', key: 'id' },
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
            title: 'Paciente',
            key: 'paciente',
            render: (_, record) => getPacienteNome(record)
        },
        {
            title: 'Usuário',
            key: 'usuario',
            render: (_, record) => getUsuarioNome(record)
        },
        {
            title: 'Médico',
            key: 'medico',
            render: (_, record) => getMedicoNome(record)
        },
        {
            title: 'Resultado ID',
            key: 'resultadoId',
            render: (_, record) => {
                // Mostre o mesmo resultadoId para todas as linhas relacionadas
                const lr = getLinhaResultado(record);
                return lr.resultadoId || '';
            }
        },
        {
            title: 'Unidade',
            key: 'unidade',
            render: (_, record) => getUnidadeNome(record)
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) =>
                isLinhaInserida(record) ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Inserido</span>
                ) : (
                    <span style={{ color: 'orange' }}>Pendente</span>
                ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space>
                    <Button
                        type={isLinhaInserida(record) ? 'default' : 'primary'}
                        disabled={isLinhaInserida(record)}
                        onClick={() => showResultModal(record)}
                    >
                        {isLinhaInserida(record) ? 'Inserido' : 'Inserir Resultado'}
                    </Button>
                </Space>
            ),
        },
    ];

    const allLinhasInseridas = linhasRequisicao.length > 0 && linhasRequisicao.every(linha => isLinhaInserida(linha));

    const handleFinalizarExame = async () => {
        try {
            // 1. Cria o resultado principal
            const payload = {
                pacienteId: selectedRequisicao.pacienteId || selectedRequisicao.paciente_id,
                usuarioId: selectedRequisicao.medicoId || selectedRequisicao.medico_id,
                dataResultado: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            const res = await api.post('resultado/add', payload);
            const resultadoId = res.data.id;

            // 2. Para cada linha, cria LinhaResultado com o mesmo resultadoId e todos os campos obrigatórios
            for (const linha of linhasRequisicao) {
                const produto = produtos.find(p => p.id === linha.produtoId);
                const unidadeId = produto ? produto.unidadeMedidaId : null;
                let valorReferencia = null;
                if (linha.resultado && typeof linha.resultado === 'object') {
                    const firstKey = Object.keys(linha.resultado)[0];
                    valorReferencia = Number(linha.resultado[firstKey]);
                } else if (linha.valorReferencia !== undefined) {
                    valorReferencia = Number(linha.valorReferencia);
                }
                const linhaResultado = {
                    exameId: linha.id,
                    valorReferencia: valorReferencia,
                    unidadeId: unidadeId,
                    pacienteId: payload.pacienteId,
                    usuarioId: payload.usuarioId,
                    resultadoId: resultadoId, // Corrigido de 'resutaldoId' para 'resultadoId'
                    observacao: linha.observacao || ''
                };
                await api.post('linharesultado/add', linhaResultado);
            }

            notification.success({ message: 'Exame finalizado com sucesso!' });
            setExamesRequisitados(prev => prev.filter(r => r.id !== selectedRequisicao.id));
            setSelectedRequisicao(null);
            setLinhasRequisicao([]);
            setLinhasResultado([]);
            fetchAllData();
        } catch (error) {
            notification.error({ message: 'Erro ao finalizar exame!' });
        }
    };

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
                    <Button type="primary" style={{ marginTop: 16 }} onClick={handleFinalizarExame} disabled={!allLinhasInseridas}>Finalizar</Button>
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