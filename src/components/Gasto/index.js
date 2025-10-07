import './style.css';
import { api } from '../../service/api';
import { useEffect, useState } from 'react';
import {
    Button,
    List,
    Typography,
    Space,
    Divider,
    message,
    Card,
    Row,
    Col,
    Spin,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';

export default function Gasto(props) {
    const [gastos, setGastos] = useState([]);
    const [linhasGasto, setLinhasGasto] = useState([]);
    const [loadingGastos, setLoadingGastos] = useState(false);
    const [loadingLinhas, setLoadingLinhas] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState(null);

    useEffect(() => {
        carregarGastos();
    }, []);

    const carregarGastos = async () => {
        setLoadingGastos(true);
        try {
            const r = await api.get('/gasto/all');
            setGastos([...r.data]);
        } catch {
            message.error('Falha ao carregar os gastos ');
        }
        setLoadingGastos(false);
    };

    const carregarLinhasGasto = async (gastoId) => {
        setLoadingLinhas(true);
        setSelectedGasto(gastoId); // Atualiza o selecionado imediatamente
        try {
            const r = await api.get('/linhagasto/gasto/' + gastoId);
            setLinhasGasto([...r.data]);
        } catch {
            message.error('Falha ao buscar as linhas do gasto ');
        }
        setLoadingLinhas(false);
    };

    const exportar = async (e) => {
        e.preventDefault();
        setExportLoading(true);
        for (const item of linhasGasto) {
            try {
                const r = await api.get('/produto/' + item.servicoId);
                const _item = r.data;
                const artigo = {
                    id: _item.id,
                    designacao: _item.productDescription,
                    grupo: _item.productGroup,
                    qtd: 1,
                    preco: _item.preco,
                    iva: _item.taxIva,
                    desconto: 0,
                    subTotal: props.getSubTotal(_item),
                };
                props.newLineArtigo(artigo);
            } catch (error) {
                message.error('Falha ao exportar artigo');
            }
        }
        setExportLoading(false);
        props.setIsOpenGasto(false);
    };

    const Linha = (props) => {
        const [nome, setNome] = useState('');
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            paciente(props.item.inscricaoId);
            // eslint-disable-next-line
        }, []);

        async function paciente(id) {
            setLoading(true);
            try {
                const r = await api.get('/inscricao/' + id);
                setNome(r.data.nome);
            } catch {
                message.error('Falha ao buscar o nome do paciente');
            }
            setLoading(false);
        }

        return (
            <List.Item
                actions={[
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.preventDefault();
                            props.carregarLinhasGasto(props.item.id);
                        }}
                    />
                ]}
                style={{
                    background:
                        selectedGasto === props.item.id ? '#e6f7ff' : undefined,
                    cursor: 'pointer',
                }}
                onClick={() => props.carregarLinhasGasto(props.item.id)}
            >
                <Space>
                    <Typography.Text strong>{props.item.id}</Typography.Text>
                    <Typography.Text type="secondary">
                        {loading ? 'Carregando...' : nome}
                    </Typography.Text>
                </Space>
            </List.Item>
        );
    };

    return (
        <div className="container-gasto">
            <Card>
                <Row gutter={24}>
                    <Col
                        xs={24}
                        md={10}
                        style={{
                            maxWidth: 350,
                            minWidth: 250,
                            flex: '0 0 320px',
                        }} // largura controlada
                    >
                        <Divider orientation="left">Gastos</Divider>
                        <List
                            className="container-gasto-item"
                            dataSource={gastos}
                            renderItem={(item) => (
                                <Linha
                                    key={item.id}
                                    item={item}
                                    carregarLinhasGasto={carregarLinhasGasto}
                                />
                            )}
                            bordered
                            loading={loadingGastos}
                            locale={{ emptyText: 'Nenhum gasto encontrado' }}
                        />
                    </Col>
                    <Col xs={24} md={14} style={{ flex: 1 }}>
                        <Divider orientation="left">Linhas do Gasto</Divider>
                        <Button
                            type="primary"
                            onClick={exportar}
                            style={{ marginBottom: 16 }}
                            loading={exportLoading}
                            disabled={linhasGasto.length === 0}
                        >
                            Exportar
                        </Button>
                        <Spin spinning={loadingLinhas}>
                            <List
                                dataSource={linhasGasto}
                                renderItem={(item) => (
                                    <List.Item key={item.id}>
                                        <Space>
                                            <Typography.Text>
                                                {item.servicoId}
                                            </Typography.Text>
                                            <Typography.Text>
                                                {item.servicoDescricao}
                                            </Typography.Text>
                                        </Space>
                                    </List.Item>
                                )}
                                bordered
                                locale={{
                                    emptyText: 'Nenhuma linha encontrada',
                                }}
                            />
                        </Spin>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
