import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    Form,
    Input,
    Select,
    Checkbox,
    Card,
    notification,
    DatePicker,
    Table,
    Space,
    Popconfirm,
    Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';

const { Option } = Select;
const { Text } = Typography;

function Exame({ exames, medicos, setExames, fetchAllData, createExame, updateExame, deleteExame }) {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingExame, setEditingExame] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isComposto, setIsComposto] = useState(false);
    const [referencias, setReferencias] = useState([]);
    const [selectedExame, setSelectedExame] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [tiposExame, setTiposExame] = useState([]);
    const [unidades, setUnidades] = useState([]);

    // Log exames prop to debug
    useEffect(() => {
        console.log('Exames prop:', exames);
    }, [exames]);

    // Fetch pacientes from GET /paciente/all
    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await api.get('paciente/all');
                console.log('Fetched pacientes:', response.data);
                setPacientes(response.data);
            } catch (error) {
                console.error('Error fetching pacientes:', error);
                notification.error({ message: 'Erro ao buscar pacientes!' });
                setPacientes([]);
            }
        };
        fetchPacientes();
    }, []);

    // Fetch tiposExame from GET /tipo-exame/all
    useEffect(() => {
        const fetchTiposExame = async () => {
            try {
                const response = await api.get('tipo-exame/all');
                console.log('Fetched tiposExame:', response.data);
                setTiposExame(response.data);
            } catch (error) {
                console.error('Error fetching tiposExame:', error);
                notification.error({ message: 'Erro ao buscar tipos de exame!' });
                setTiposExame([]);
            }
        };
        fetchTiposExame();
    }, []);

    // Fetch unidades from GET /unidade/all
    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await api.get('unidade/all');
                console.log('Fetched unidades:', response.data);
                setUnidades(response.data);
            } catch (error) {
                console.error('Error fetching unidades:', error);
                notification.error({ message: 'Erro ao buscar unidades de medida!' });
                setUnidades([]);
            }
        };
        fetchUnidades();
    }, []);

    const showModal = (exame = null) => {
        setIsModalVisible(true);
        setIsEditMode(!!exame);
        setEditingExame(exame);
        setIsComposto(exame?.composto || false);
        setReferencias(
            exame && exame.composto && exame.referencias
                ? Object.entries(exame.referencias).map(([nome, ref]) => ({
                      nome,
                      intervalo: ref.valor,
                      unidade: ref.unidade,
                  }))
                : []
        );
        if (exame) {
            form.setFieldsValue({
                tipoExameId: exame.tipoExameId,
                pacienteId: exame.pacienteId,
                medicoId: exame.medicoId,
                estado: exame.estado,
                designacao: exame.designacao,
                unidade: exame.unidade,
                composto: exame.composto,
                dataColeta: exame.dataColeta ? moment(exame.dataColeta) : null,
            });
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setIsComposto(false);
        setReferencias([]);
        setEditingExame(null);
        setIsEditMode(false);
    };

    const showDetailsModal = (exame) => {
        setSelectedExame(exame);
        setIsDetailsModalVisible(true);
    };

    const handleDetailsCancel = () => {
        setIsDetailsModalVisible(false);
        setSelectedExame(null);
    };

    const addReferencia = () => {
        setReferencias([...referencias, { nome: '', intervalo: '', unidade: '' }]);
    };

    const removeReferencia = (index) => {
        setReferencias(referencias.filter((_, i) => i !== index));
    };

    const updateReferencia = (index, field, value) => {
        const newReferencias = [...referencias];
        newReferencias[index][field] = value;
        setReferencias(newReferencias);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const referenciasObj = {};
            if (values.composto) {
                referencias.forEach((ref, index) => {
                    if (!ref.nome || !ref.intervalo || !ref.unidade) {
                        throw new Error(`Preencha todos os campos da referência ${index + 1}`);
                    }
                    if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(ref.intervalo)) {
                        throw new Error(`Intervalo inválido na referência ${ref.nome}. Use o formato "min-max" (ex.: 4.5-5.9)`);
                    }
                    referenciasObj[ref.nome] = { valor: ref.intervalo, unidade: ref.unidade };
                });
            } else {
                referenciasObj[values.designacao] = { valor: '0-0', unidade: values.unidade || 'N/A' };
            }

            const exameData = {
                tipoExameId: values.tipoExameId,
                estado: values.estado,
                designacao: values.designacao,
                unidade: values.unidade || 'N/A',
                composto: values.composto || false,
                referencias: referenciasObj, // Always an object
                pacienteId: values.pacienteId,
                medicoId: values.medicoId,
                status: 'PENDENTE',
                dataSolicitacao: new Date().toISOString(),
                dataColeta: values.dataColeta ? values.dataColeta.toISOString() : null,
            };

            let exameResponse;
            if (isEditMode) {
                console.log('Updating exame ID:', editingExame.id, 'Payload:', exameData);
                exameResponse = await updateExame(editingExame.id, exameData);
            } else {
                console.log('Creating exame:', exameData);
                exameResponse = await createExame(exameData);
            }

            console.log('Exame response:', exameResponse.data);
            setExames(
                isEditMode
                    ? exames.map((e) => (e.id === editingExame.id ? exameResponse.data : e))
                    : [...exames, exameResponse.data]
            );
            notification.success({ message: isEditMode ? 'Exame atualizado com sucesso!' : 'Exame criado com sucesso!' });
            handleCancel();
            fetchAllData(); // Trigger parent state update
        } catch (error) {
            console.error('Error saving exame:', error);
            notification.error({
                message: error.response?.data || error.message || 'Erro ao salvar exame!',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log('Deleting exame ID:', id);
            const response = await deleteExame(id);
            console.log('Delete response:', response.data);
            notification.success({ message: 'Exame excluído com sucesso!' });
            fetchAllData();
        } catch (error) {
            console.error('Error deleting exame:', error);
            notification.error({
                message: error.response?.data || 'Erro ao excluir exame!',
            });
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
        {
            title: 'Tipo',
            dataIndex: 'tipoExameId',
            key: 'tipoExameId',
            render: (id) => {
                const tipo = tiposExame.find((t) => t.id === id);
                console.log('tipoExameId:', id, 'Found tipo:', tipo);
                return tipo ? tipo.nome : 'N/A';
            },
        },
        { title: 'Unidade', dataIndex: 'unidade', key: 'unidade' },
        {
            title: 'Referências',
            key: 'referencias',
            render: (_, record) => {
                if (!record.referencias || Object.keys(record.referencias).length === 0) {
                    return 'N/A';
                }
                return record.composto
                    ? `Múltiplos (${Object.keys(record.referencias).length})`
                    : Object.values(record.referencias)[0]?.valor || 'N/A';
            },
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => showDetailsModal(record)}>
                        Detalhes
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
                        Editar
                    </Button>
                    <Popconfirm
                        title="Deseja excluir este exame?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Excluir
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2 className="section-title">Gestão de Exames</h2>
            <Card className="card-custom">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
                    Adicionar Exame
                </Button>
                <Table columns={columns} dataSource={exames} rowKey="id" className="table-custom" />
            </Card>
            <Modal
                title={isEditMode ? 'Editar Exame' : 'Criar Novo Exame'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                className="modal-custom"
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="tipoExameId"
                        label="Tipo de Exame"
                        rules={[{ required: true, message: 'Selecione um tipo de exame' }]}
                    >
                        <Select placeholder="Selecione um tipo de exame" loading={tiposExame.length === 0}>
                            {tiposExame.map((tipo) => (
                                <Option key={tipo.id} value={tipo.id}>
                                    {tipo.nome}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="pacienteId"
                        label="Paciente"
                        rules={[{ required: true, message: 'Selecione um paciente' }]}
                    >
                        <Select placeholder="Selecione um paciente" loading={pacientes.length === 0}>
                            {pacientes.map((paciente) => (
                                <Option key={paciente.id} value={paciente.id}>
                                    {paciente.nome}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="estado"
                        label="Estado"
                        rules={[{ required: true, message: 'Selecione o estado' }]}
                    >
                        <Select placeholder="Selecione o estado">
                            <Option value="ATIVO">Ativo</Option>
                            <Option value="INATIVO">Inativo</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="designacao"
                        label="Designação"
                        rules={[{ required: true, message: 'Insira a designação' }]}
                    >
                        <Input placeholder="Nome do exame" />
                    </Form.Item>
                    <Form.Item
                        name="unidade"
                        label="Unidade"
                        rules={[{ required: true, message: 'Selecione a unidade' }]}
                    >
                        <Select placeholder="Selecione a unidade" loading={unidades.length === 0}>
                            {unidades.map((unidade) => (
                                <Option key={unidade.id} value={unidade.abrevicao}>
                                    {unidade.abrevicao} ({unidade.descricao})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="composto" valuePropName="checked">
                        <Checkbox onChange={(e) => setIsComposto(e.target.checked)}>Exame Composto</Checkbox>
                    </Form.Item>
                    {isComposto && (
                        <div>
                            <Text strong>Referências Médicas</Text>
                            {referencias.map((ref, index) => (
                                <Card key={index} style={{ marginBottom: 16 }} size="small">
                                    <Space style={{ width: '100%' }}>
                                        <Input
                                            placeholder="Nome do componente (ex.: Hemácias)"
                                            value={ref.nome}
                                            onChange={(e) => updateReferencia(index, 'nome', e.target.value)}
                                            style={{ width: 200 }}
                                        />
                                        <Input
                                            placeholder="Intervalo (ex.: 4.5-5.9)"
                                            value={ref.intervalo}
                                            onChange={(e) => updateReferencia(index, 'intervalo', e.target.value)}
                                            style={{ width: 150 }}
                                        />
                                        <Select
                                            placeholder="Unidade"
                                            value={ref.unidade}
                                            onChange={(value) => updateReferencia(index, 'unidade', value)}
                                            style={{ width: 150 }}
                                        >
                                            {unidades.map((unidade) => (
                                                <Option key={unidade.id} value={unidade.abrevicao}>
                                                    {unidade.abrevicao} ({unidade.descricao})
                                                </Option>
                                            ))}
                                        </Select>
                                        <Button danger onClick={() => removeReferencia(index)}>
                                            Remover
                                        </Button>
                                    </Space>
                                </Card>
                            ))}
                            <Button type="dashed" onClick={addReferencia} block>
                                Adicionar Referência
                            </Button>
                        </div>
                    )}
                    <Form.Item style={{ marginTop: 16 }}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode ? 'Atualizar Exame' : 'Criar Exame'}
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                            Cancelar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Detalhes do Exame"
                open={isDetailsModalVisible}
                onCancel={handleDetailsCancel}
                footer={[
                    <Button key="close" onClick={handleDetailsCancel}>
                        Fechar
                    </Button>,
                ]}
                className="modal-custom"
            >
                {selectedExame && (
                    <div>
                        <Text strong>Designação:</Text> <Text>{selectedExame.designacao}</Text>
                        <br />
                        <Text strong>Tipo:</Text>{' '}
                        <Text>
                            {tiposExame.find((t) => t.id === selectedExame.tipoExameId)?.nome || 'N/A'}
                        </Text>
                        <br />
                        <Text strong>Unidade:</Text> <Text>{selectedExame.unidade || 'N/A'}</Text>
                        <br />
                        <Text strong>Composto:</Text> <Text>{selectedExame.composto ? 'Sim' : 'Não'}</Text>
                        <br />
                        <Text strong>Referências Médicas:</Text>
                        {selectedExame.composto && selectedExame.referencias && Object.keys(selectedExame.referencias).length > 0 ? (
                            <Table
                                dataSource={Object.entries(selectedExame.referencias).map(([nome, ref]) => ({
                                    nome,
                                    intervalo: ref.valor,
                                    unidade: ref.unidade,
                                }))}
                                columns={[
                                    { title: 'Componente', dataIndex: 'nome', key: 'nome' },
                                    { title: 'Intervalo', dataIndex: 'intervalo', key: 'intervalo' },
                                    { title: 'Unidade', dataIndex: 'unidade', key: 'unidade' },
                                ]}
                                pagination={false}
                                size="small"
                                className="table-custom"
                            />
                        ) : selectedExame.referencias && Object.keys(selectedExame.referencias).length > 0 ? (
                            <Text>
                                {Object.values(selectedExame.referencias)[0]?.valor || 'N/A'} (
                                {Object.values(selectedExame.referencias)[0]?.unidade || 'N/A'})
                            </Text>
                        ) : (
                            <Text>N/A</Text>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Exame;