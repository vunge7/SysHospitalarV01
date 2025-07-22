import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Checkbox, Card, notification, DatePicker,
    Table, Space, Popconfirm, Typography, } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';
import modalProduto from '../../pages/PainelProduto/NovoProduto/index';
import NovoProduto from '../../pages/PainelProduto/NovoProduto';
import { toast } from 'react-toastify';

const { Option } = Select;
const { Text } = Typography;

function Exame({ exames, medicos, setExames, fetchAllData, createExame, updateExame, deleteExame, fetchExamesProdutos }) {
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
    const [showNovoProdutoModal, setShowNovoProdutoModal] = useState(false);
    const [produtosExame, setProdutosExame] = useState([]);
    const [showProdutoDetails, setShowProdutoDetails] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [produtoParaEditar, setProdutoParaEditar] = useState(null);

    // Log da prop exames para o  debug
    useEffect(() => {
        console.log('Exames prop:', exames);
    }, [exames]);

    // Fetch pacientes de GET /paciente/all
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

    // Fetch tiposExame de GET /tipo-exame/all
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

    // Fetch unidades de GET /unidade/all
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

    // Função para buscar produtos do tipo exame (usada para atualizar a tabela após add/edit)
    const fetchProdutosExame = async () => {
        try {
            const res = await api.get('produto/all');
            // Filtro flexível: inclui todos os produtos cujo tipo contenha 'exame' (case-insensitive), sem filtrar por status
            const produtos = Array.isArray(res.data)
                ? res.data.filter(p => {
                    const tipo = (p.productType || p.tipo || '').toString().toLowerCase();
                    return tipo.includes('exame');
                })
                : [];
            setProdutosExame(produtos);
        } catch (error) {
            setProdutosExame([]);
        }
    };

    useEffect(() => {
        fetchProdutosExame();
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
                referencias: referenciasObj, // Deve ser sempre um objecto
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
            if (fetchExamesProdutos) await fetchExamesProdutos(); // Atualiza a tabela de exames
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

    const handleViewProduto = (produto) => {
        setProdutoSelecionado(produto);
        setShowProdutoDetails(true);
    };
    const handleEditProduto = (produto) => {
        setProdutoParaEditar(produto);
        setIsEditMode(true);
        setShowNovoProdutoModal(true);
    };
    const handleCloseNovoProduto = () => {
        setShowNovoProdutoModal(false);
        setProdutoParaEditar(null);
        setIsEditMode(false);
    };
    const handleDeleteProduto = (produto) => {
        // Aqui pode-se implementar a lógica de exclusão real
        notification.info({ message: 'Funcionalidade de exclusão em desenvolvimento.' });
    };

    return (
        <div>
            <h2 className="section-title">Gestão de Exames</h2>
            <Card className="card-custom">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setShowNovoProdutoModal(true); setProdutoParaEditar(null); setIsEditMode(false); }} style={{ marginBottom: 16 }}>
                    Novo Exame
                </Button>
                <NovoProduto
                    visible={showNovoProdutoModal}
                    onClose={handleCloseNovoProduto}
                    modalTitle={isEditMode ? "Editar Exame" : "Novo Exame"}
                    submitButtonText={isEditMode ? "Salvar Alterações" : "Adicionar Exame"}
                    produtoParaEditar={produtoParaEditar}
                    onSuccess={fetchExamesProdutos}
                />
                <Table
                    columns={[
                        {
                            title: 'Imagem',
                            dataIndex: 'imagem',
                            key: 'imagem',
                            render: (img) => {
                                console.log('Valor do campo imagem:', img); // Log para debug
                                if (!img) return <span>Sem Imagem</span>;
                                const isFullUrl = img.startsWith('http') || img.startsWith('data:');
                                // Ajuste a URL base conforme seu backend
                                const src = isFullUrl ? img : `http://localhost:8081/produto/imagens/${img}`;
                                return (
                                    <img
                                        src={src}
                                        alt="Produto"
                                        style={{ maxWidth: 50, borderRadius: 4 }}
                                        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50'; }}
                                    />
                                );
                            },
                        },
                        { title: 'Descrição', dataIndex: 'productDescription', key: 'productDescription' },
                        { title: 'Grupo', dataIndex: 'productGroup', key: 'productGroup' },
                        { title: 'Tipo', dataIndex: 'productType', key: 'productType' },
                        { title: 'Código', dataIndex: 'productCode', key: 'productCode' },
                        { title: 'Preço', dataIndex: 'preco', key: 'preco' },
                        { title: 'Taxa IVA (%)', dataIndex: 'taxIva', key: 'taxIva' },
                        { title: 'Preço Final', dataIndex: 'finalPrice', key: 'finalPrice' },
                        {
                            title: 'Unidade',
                            dataIndex: 'unidadeMedida',
                            key: 'unidadeMedida',
                            render: (unidadeMedida) => unidadeMedida || 'N/A',
                        },
                        { title: 'Status', dataIndex: 'status', key: 'status', render: s => (s === true || s === '1' || s === 1 || s === 'true' || s === 'ATIVO') ? 'Ativo' : 'Inativo' },
                        {
                            title: 'Ações',
                            key: 'acoes',
                            render: (_, record) => (
                                <Space>
                                    <Button icon={<EyeOutlined />} onClick={() => handleViewProduto(record)} />
                                    <Button icon={<EditOutlined />} onClick={() => handleEditProduto(record)} />
                                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteProduto(record)} />
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={produtosExame}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ marginBottom: 32 }}
                    title={() => <span>Produtos do Tipo Exame</span>}
                />
            </Card>
            <Modal
                title="Detalhes do Produto"
                open={showProdutoDetails}
                onCancel={() => setShowProdutoDetails(false)}
                footer={<Button onClick={() => setShowProdutoDetails(false)}>Fechar</Button>}
            >
                {produtoSelecionado && (
                    <div>
                        <p><b>Descrição:</b> {produtoSelecionado.productDescription}</p>
                        <p><b>Grupo:</b> {produtoSelecionado.productGroup}</p>
                        <p><b>Tipo:</b> {produtoSelecionado.productType}</p>
                        <p><b>Código:</b> {produtoSelecionado.productCode}</p>
                        <p><b>Preço:</b> {produtoSelecionado.preco}</p>
                        <p><b>Taxa IVA (%):</b> {produtoSelecionado.taxIva}</p>
                        <p><b>Preço Final:</b> {produtoSelecionado.finalPrice}</p>
                        <p><b>Unidade:</b> {produtoSelecionado.unidadeMedida}</p>
                        <p><b>Status:</b> {produtoSelecionado.status ? 'Ativo' : 'Inativo'}</p>
                        {produtoSelecionado.imagem && (
                            <img src={produtoSelecionado.imagem.startsWith('http') ? produtoSelecionado.imagem : `/produto/imagens/${produtoSelecionado.imagem}`} alt="Produto" style={{ maxWidth: 100, borderRadius: 4 }} onError={e => e.target.style.display='none'} />
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Exame;