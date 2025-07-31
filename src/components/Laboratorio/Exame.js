import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Checkbox, Card, notification, DatePicker,
    Table, Space, Popconfirm, Typography, } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, NodeExpandOutlined } from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';
import modalProduto from '../../pages/PainelProduto/NovoProduto/index';
import NovoProduto from '../../pages/PainelProduto/NovoProduto';
import { toast } from 'react-toastify';

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
    const [showNovoProdutoModal, setShowNovoProdutoModal] = useState(false);
    const [produtosExame, setProdutosExame] = useState([]);
    const [showProdutoDetails, setShowProdutoDetails] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [produtoParaEditar, setProdutoParaEditar] = useState(null);
    const [modalFilhosVisible, setModalFilhosVisible] = useState(false);
    const [filhosProduto, setFilhosProduto] = useState([]);
    const [produtoPaiSelecionado, setProdutoPaiSelecionado] = useState(null);

    // Log da prop exames para o  debug
    useEffect(() => {
        console.log('Exames prop:', exames);
    }, [exames]);

    // Fetch pacientes de GET /paciente/all
    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await api.get('/paciente/all');
                console.log('Fetched pacientes:', response.data);
                setPacientes(response.data);
            } catch (error) {
                console.error('Error fetching pacientes:', error);
                toast.error('Erro ao buscar pacientes!', { autoClose: 2000 });
                setPacientes([]);
            }
        };
        fetchPacientes();
    }, []);

    // Fetch tiposExame de GET /tipo-exame/all
    useEffect(() => {
        const fetchTiposExame = async () => {
            try {
                const response = await api.get('/tipo-exame/all');
                console.log('Fetched tiposExame:', response.data);
                setTiposExame(response.data);
            } catch (error) {
                console.error('Error fetching tiposExame:', error);
                toast.error('Erro ao buscar tipos de exame!', { autoClose: 2000 });
                setTiposExame([]);
            }
        };
        fetchTiposExame();
    }, []);

    // Fetch unidades de GET /unidade/all
    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await api.get('/unidade/all');
                console.log('Fetched unidades:', response.data);
                setUnidades(response.data);
            } catch (error) {
                console.error('Error fetching unidades:', error);
                toast.error('Erro ao buscar unidades de medida!', { autoClose: 2000 });
                setUnidades([]);
            }
        };
        fetchUnidades();
    }, []);

    // Função para buscar produtos do tipo exame (usada para atualizar a tabela após add/edit)
    const fetchProdutosExame = async () => {
        try {
            const res = await api.get('/produto/all');
            console.log('Produtos retornados da API:', res.data); // Log para debug
            // Filtro flexível: inclui todos os produtos cujo tipo contenha 'exame' (case-insensitive)
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
            toast.success(isEditMode ? 'Exame atualizado com sucesso!' : 'Exame criado com sucesso!', { autoClose: 2000 });
            handleCancel();
            fetchAllData(); // Trigger parent state update
        } catch (error) {
            console.error('Error saving exame:', error);
            toast.error(error.response?.data || error.message || 'Erro ao salvar exame!', { autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log('Deleting exame ID:', id);
            const response = await deleteExame(id);
            console.log('Delete response:', response.data);
            toast.success('Exame excluído com sucesso!', { autoClose: 2000 });
            fetchAllData();
        } catch (error) {
            console.error('Error deleting exame:', error);
            toast.error(error.response?.data || 'Erro ao excluir exame!', { autoClose: 2000 });
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
    const handleDeleteProduto = async (produto) => {
        try {
            await api.patch(`produto/${produto.id}/status?status=false`);
            toast.success('Produto excluído com sucesso!', { autoClose: 2000 });
            fetchProdutosExame();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.response?.data || error.message || 'Erro ao excluir produto!', { autoClose: 2000 });
        }
    };

    // Função para buscar filhos de um produto
    const handleVerFilhos = async (produto) => {
      setProdutoPaiSelecionado(produto);
      try {
        const res = await api.get(`produto/${produto.id}/arvore`);
        setFilhosProduto(res.data.filhos || []);
      } catch {
        setFilhosProduto([]);
      }
      setModalFilhosVisible(true);
    };

    // Função para renderizar filhos em árvore
    const renderFilhosArvore = (filhosArr, nivel = 1) => (
      <ul style={{ marginLeft: nivel * 16 }}>
        {filhosArr.map(filho => (
          <li key={filho.id}>
            <b>Produto Filho:</b> {filho.productDescription}
            {filho.filhos && filho.filhos.length > 0 && renderFilhosArvore(filho.filhos, nivel + 1)}
          </li>
        ))}
      </ul>
    );

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
                    onSuccess={fetchProdutosExame}
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
                                    <Button icon={<NodeExpandOutlined />} onClick={() => handleVerFilhos(record)}>
                                        Ver Filhos
                                    </Button>
                                    <Button icon={<DeleteOutlined />} danger
                                        // Adicionar Popconfirm para confirmação
                                        overlay={
                                            <Popconfirm
                                                title="Deseja realmente excluir este produto?"
                                                onConfirm={() => handleDeleteProduto(record)}
                                                okText="Sim"
                                                cancelText="Não"
                                            >
                                                <span>Excluir</span>
                                            </Popconfirm>
                                        }
                                    />
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={produtosExame.filter(p => !p.produtoPaiId)}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ marginBottom: 32 }}
                    title={() => <span>Produtos do Tipo Exame</span>}
                />
                <Modal
                    title={`Filhos de ${produtoPaiSelecionado?.productDescription || ''}`}
                    open={modalFilhosVisible}
                    onCancel={() => setModalFilhosVisible(false)}
                    footer={<Button onClick={() => setModalFilhosVisible(false)}>Fechar</Button>}
                >
                    {filhosProduto.length === 0 ? (
                        <div>Nenhum filho cadastrado.</div>
                    ) : (
                        renderFilhosArvore(filhosProduto)
                    )}
                </Modal>
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