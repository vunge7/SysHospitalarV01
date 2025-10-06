import React, { useEffect, useState } from 'react';
import { CaretRightOutlined, SettingOutlined } from '@ant-design/icons';
import { Collapse, theme } from 'antd';
import { api } from '../../service/api';
import Modal from 'react-modal';
import DynamicTable from '../DynamicTable';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const genExtra = () => <span>Progresso</span>;
const ExameRequisitado = (props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [listaFonteExame, setListaFonteExame] = useState([]);
    const [itens, setItens] = useState([]);
    const [obs, setObs] = useState('');
    const { token } = theme.useToken();
    const panelStyle = {
        marginBottom: 9,
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: 'none',
    };
    // Remover Tree e examesTree
    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => {
        carregarExames();
    }, []);

    useEffect(() => {
        carrgarItens();
    }, [props.listaExamesRequisitado]);

    // Função para buscar árvore de filhos recursivamente
    const fetchFilhos = async (produtoId) => {
        try {
            const res = await api.get(`produto/${produtoId}/arvore`);
            return res.data;
        } catch {
            return null;
        }
    };

    const carregarExames = async () => {
        try {
            const res = await api.get('produto/all');
            const produtos = res.data || [];
            // Filtrar apenas exames pai (produtoPaiId == null)
            const pais = produtos.filter(p => p.produtoPaiId == null);
            const newData = pais.map(item => ({
                        id: item.id,
                        designacao: item.productDescription,
                        grupo: item.productGroup,
                        obs: '',
            }));
            setListaFonteExame(newData);
        } catch (e) {
            setListaFonteExame([]);
        }
    };

    const carrgarItens = () => {
        let data = props.listaExamesRequisitado;
        let newitens = data.map((linha) => {
            let item = {
                key: linha.id,
                label: linha.designacao,
                children: (
                    <div>
                        <textarea style={{ display: 'block' }}></textarea>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                props.removerItemExameRequisitado(linha);
                            }}
                        >
                            remover
                        </button>
                    </div>
                ),
                style: panelStyle,
                extra: genExtra(),
            };

            return item;
        });

        setItens([...newitens]);
        closeModal();
    };

    const openModal = () => {
        setModalOpen(true);
    };

    const onAfterClose = () => {
        setModalOpen(false);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const onAdd = (row) => {
        let data = props.listaExamesRequisitado;

        data.push(row);
        console.log('adicionar', row);
        props.setListaExamesRequisitado([...data]);
    };

    // Remover também funções relacionadas a onSelect, onAddSelected, findLeafNodes, etc.
    return (
        <div style={{ flexDirection: 'row' }}>
            <form>
                <div style={{ marginBottom: 10 }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            openModal();
                        }}
                    >
                        Adicionar
                    </button>
                    {props.listaExamesRequisitado.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                props.salvarRequisicao();
                            }}
                        >
                            Concluir requisição
                        </button>
                    )}
                </div>
            </form>
            <Collapse
                bordered={false}
                defaultActiveKey={['1']}
                expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
                style={{ background: token.colorBgContainer }}
                items={itens}
            />
            <Modal
                isOpen={modalOpen}
                onAfterClose={onAfterClose}
                style={{
                    overlay: {
                        zIndex: 2000,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    content: {
                        margin: 'auto',
                        width: '40%',
                        padding: '20px',
                        borderRadius: '10px',
                    },
                }}
            >
                <DynamicTable
                    data={listaFonteExame}
                    isCrud={false}
                    onAdd={onAdd}
                />
                <button onClick={onAfterClose} style={{ marginLeft: 8 }}>Fechar</button>
            </Modal>
        </div>
    );
};
export default ExameRequisitado;
