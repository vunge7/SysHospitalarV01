import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Checkbox, Card, notification, DatePicker, Table, Space, Popconfirm, Typography, 
    Row, Col, Tag, Tooltip, Alert, Divider, InputNumber, Switch, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, NodeExpandOutlined, SearchOutlined, FilterOutlined,
    DownloadOutlined, UploadOutlined, InfoCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';
import NovoProduto from '../../pages/PainelProduto/NovoProduto';
import { toast } from 'react-toastify';

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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

    useEffect(() => {
        fetchProdutosExame();
    }, []);

    const fetchProdutosExame = async () => {
        try {
            const res = await api.get('/produto/all');
            const produtos = Array.isArray(res.data)
                ? res.data.filter(p => {
                    const tipo = (p.productType || p.tipo || '').toString().toLowerCase();
                    return tipo.includes('exame');
                })
                : [];
            setProdutosExame(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos de exame:', error);
            setProdutosExame([]);
            toast.error('Erro ao carregar exames!');
        }
    };

    const abrirNovoExame = () => {
        setProdutoParaEditar(null);
        setIsEditMode(false);
        setShowNovoProdutoModal(true);
    };

    const abrirEditarExame = (produto) => {
        setProdutoParaEditar(produto);
        setIsEditMode(true);
        setShowNovoProdutoModal(true);
    };

    const handleCloseNovoProduto = async () => {
        setShowNovoProdutoModal(false);
        setProdutoParaEditar(null);
        setIsEditMode(false);
        await fetchProdutosExame();
    };

    const handleViewProduto = (produto) => {
        setProdutoSelecionado(produto);
        setShowProdutoDetails(true);
    };

    const handleDeleteProduto = async (produto) => {
        try {
            await api.patch(`/produto/${produto.id}/status`, null, { params: { status: false } });
            toast.success('Exame excluído com sucesso!');
            await fetchProdutosExame();
        } catch (error) {
            console.warn('PATCH falhou, tentando PUT...', error);
            try {
                const { data } = await api.get(`/produto/${produto.id}`);
                await api.put(`/produto/${produto.id}`, { ...data, status: false });
                toast.success('Exame excluído com sucesso!');
                await fetchProdutosExame();
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Erro ao excluir exame!');
            }
        }
    };

    const handleVerFilhos = async (produto) => {
        setProdutoPaiSelecionado(produto);
        try {
            const res = await api.get(`/produto/${produto.id}/arvore`);
            setFilhosProduto(res.data.filhos || []);
        } catch {
            setFilhosProduto([]);
        }
        setModalFilhosVisible(true);
    };

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
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={abrirNovoExame}
                    style={{ marginBottom: 16 }}
                >
                    Novo Exame
                </Button>

                {/* Modal de Criação/Edição de Exame */}
                <NovoProduto
                    visible={showNovoProdutoModal}
                    onClose={handleCloseNovoProduto}
                    modalTitle={isEditMode ? "Editar Exame" : "Novo Exame"}
                    submitButtonText={isEditMode ? "Salvar Alterações" : "Cadastrar Exame"}
                    produtoParaEditar={produtoParaEditar}
                    onSuccess={async () => {
                        await fetchProdutosExame();
                        setShowNovoProdutoModal(false);
                    }}
                    initialValues={isEditMode ? {} : { productGroup: 'Exames' }}
                    disabledFields={['productGroup']}
                    isFromExame={true}
                />

                {/* Tabela de Exames */}
                <Table
                    columns={[
                        {
                            title: 'Imagem',
                            dataIndex: 'imagem',
                            key: 'imagem',
                            render: (img) => {
                                if (!img) return <span>Sem Imagem</span>;
                                const isFullUrl = img.startsWith('http') || img.startsWith('data:');
                                const src = isFullUrl ? img : `http://localhost:8081/produto/imagens/${img}`;
                                return (
                                    <img
                                        src={src}
                                        alt="Exame"
                                        style={{ maxWidth: 50, borderRadius: 4 }}
                                        onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50'; }}
                                    />
                                );
                            },
                        },
                        { title: 'Descrição', dataIndex: 'productDescription', key: 'productDescription' },
                        { title: 'Grupo', dataIndex: 'productGroup', key: 'productGroup', render: g => g || 'Exames' },
                        { title: 'Tipo', dataIndex: 'productType', key: 'productType' },
                        { title: 'Código', dataIndex: 'productCode', key: 'productCode' },
                        { title: 'Preço', dataIndex: 'preco', key: 'preco', render: p => `AOA ${p}` },
                        { title: 'Taxa IVA (%)', dataIndex: 'taxIva', key: 'taxIva' },
                        { title: 'Preço Final', dataIndex: 'finalPrice', key: 'finalPrice', render: f => `AOA ${f}` },
                        { title: 'Unidade', dataIndex: 'unidadeMedida', key: 'unidadeMedida', render: u => u || 'N/A' },
                        { title: 'Status', dataIndex: 'status', key: 'status', render: s => (s ? 'Ativo' : 'Inativo') },
                        {
                            title: 'Ações',
                            key: 'acoes',
                            render: (_, record) => (
                                <Space>
                                    <Button icon={<EyeOutlined />} onClick={() => handleViewProduto(record)} />
                                    <Button icon={<EditOutlined />} onClick={() => abrirEditarExame(record)} />
                                    <Button icon={<NodeExpandOutlined />} onClick={() => handleVerFilhos(record)}>
                                        Ver Filhos
                                    </Button>
                                    <Popconfirm
                                        title="Excluir este exame?"
                                        onConfirm={() => handleDeleteProduto(record)}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button icon={<DeleteOutlined />} danger />
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={produtosExame.filter(p => !p.produtoPaiId)}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    title={() => <Title level={5}>Lista de Exames Cadastrados</Title>}
                />

                {/* Modal de Filhos */}
                <Modal
                    title={`Filhos de ${produtoPaiSelecionado?.productDescription || ''}`}
                    open={modalFilhosVisible}
                    onCancel={() => setModalFilhosVisible(false)}
                    footer={<Button onClick={() => setModalFilhosVisible(false)}>Fechar</Button>}
                >
                    {filhosProduto.length === 0 ? (
                        <div>Nenhum exame filho cadastrado.</div>
                    ) : (
                        renderFilhosArvore(filhosProduto)
                    )}
                </Modal>

                {/* Modal de Detalhes */}
                <Modal
                    title="Detalhes do Exame"
                    open={showProdutoDetails}
                    onCancel={() => setShowProdutoDetails(false)}
                    footer={<Button onClick={() => setShowProdutoDetails(false)}>Fechar</Button>}
                >
                    {produtoSelecionado && (
                        <div>
                            <p><b>Descrição:</b> {produtoSelecionado.productDescription}</p>
                            <p><b>Grupo:</b> {produtoSelecionado.productGroup || 'Exames'}</p>
                            <p><b>Tipo:</b> {produtoSelecionado.productType}</p>
                            <p><b>Código:</b> {produtoSelecionado.productCode}</p>
                            <p><b>Preço:</b> AOA {produtoSelecionado.preco}</p>
                            <p><b>Taxa IVA:</b> {produtoSelecionado.taxIva}%</p>
                            <p><b>Preço Final:</b> AOA {produtoSelecionado.finalPrice}</p>
                            <p><b>Unidade:</b> {produtoSelecionado.unidadeMedida || 'N/A'}</p>
                            <p><b>Status:</b> {produtoSelecionado.status ? 'Ativo' : 'Inativo'}</p>
                            {produtoSelecionado.imagem && (
                                <img 
                                    src={produtoSelecionado.imagem.startsWith('http') ? produtoSelecionado.imagem : `http://localhost:8081/produto/imagens/${produtoSelecionado.imagem}`} 
                                    alt="Exame" 
                                    style={{ maxWidth: 100, borderRadius: 4 }} 
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            )}
                        </div>
                    )}
                </Modal>
            </Card>
        </div>
    );
}

export default Exame;