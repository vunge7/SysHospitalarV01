import React, { useEffect, useState } from 'react';
import { api } from '../../../service/api';
import jsPDF from 'jspdf';
import fundoLogo from '../../../assets/images/logo5.jpg';
import Receituario from '../Receituario';
import Procedimento from '../../Procedimento';
import ExameRequisitado from '../../ExameRequisitado';
import { formatDate } from 'date-fns';
import Cid10 from '../../Cid10';

import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';

import { viewPdfGenerico } from '../../util/utilitarios';

import {
    List,
    Flex,
    Button,
    Avatar,
    Modal,
    Tabs,
    Input,
    Form,
    message,
    AutoComplete,
} from 'antd';

import { UserOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
const { TextArea } = Input;

function Consulta() {
    const [id, setId] = useState(0);
    const [data, setData] = useState([]);
    const [dataCID, setDataCID] = useState([]);
    const [nomePaciente, setNomePaciente] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [historiaClinica, setHistoriaClinica] = useState('');
    const [diagnosticoInicial, setDiagnosticoInicial] = useState('');
    const [diagnosticoFinal, setDiagnosticoFinal] = useState('');
    const [receita, setReceita] = useState('');
    const [idInscricao, setIdInscricao] = useState(0);
    const [isModalConsulta, setIsModalConsulta] = useState(false);
    const [isConsultaCriada, setIsConsultaCriada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formConsulta] = Form.useForm();

    const [listaExamesRequisitado, setListaExamesRequisitado] = useState([]);

    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        _carrgarDados();
    }, []);

    useEffect(() => {
        formConsulta.setFieldsValue({
            motivoConsulta: motivoConsulta,
            historiaClinica: historiaClinica,
            exameFisico: exameFisico,
            receita: receita,
            diagnosticoInicial: diagnosticoInicial,
            diagnosticoFinal: diagnosticoFinal,
        });
    }, [
        motivoConsulta,
        historiaClinica,
        exameFisico,
        receita,
        diagnosticoInicial,
        diagnosticoFinal,
    ]);

    useEffect(()=>{
       console.log('Data CID', dataCID);
    }, [dataCID])

    const _showModal = async (id, nome) => {
        setNomePaciente(nome);

        await api
            .get('/consulta/' + id + '/ABERTO')
            .then((r) => {
                setIsConsultaCriada(true);
                updateFieldsInForm(r.data);
            })
            .catch((e) => {
                limpar();
            });

        setIdInscricao(id);
        setIsModalConsulta(true);
    };

    const handleCancel = () => {
        setIsModalConsulta(false);
    };

    const handleOk = async () => {};

    const _onChange = (key) => {
        //  console.log(key);
    };

    const success = (msg) => {
        messageApi.open({
            type: 'success',
            content: msg,
        });
    };
    const error = (msg) => {
        messageApi.open({
            type: 'error',
            content: msg,
        });
    };

    const limpar = () => {
        setIsConsultaCriada(false);
        setMotivoConsulta('');
        setHistoriaClinica('');
        setExameFisico('');
        setReceita('');
        setId(0);
    };

    const _carrgarDados = async () => {
        await api
            .get('inscricao/all/consulta')
            .then((r) => {
                let data = r.data.map((item, index) => {
                    Object.defineProperty(item, 'tempo', {
                        value: item.dataCriacao,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                    return item;
                });
                setData(data);
            })
            .catch((e) => {
                console.log('Falha na busca', e);
            });
    };

    const consultaCreate = (values) => {
        console.log(values.receita);
        let consulta = {
            motivoConsulta: values.motivoConsulta,
            historiaClinica: values.historiaClinica,
            exameFisico: values.exameFisico,
            dataConsulta: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            estadoConsulta: 'ABERTO',
            receita: values.receita,
            inscricaoId: idInscricao,
            usuarioId: 1,
        };
        return consulta;
    };
    const _onFinishCriar = async (values) => {
        setLoading(true);
        let consulta = consultaCreate(values);
        await api
            .post('consulta/add', consulta)
            .then((r) => {
                let msg = 'consulta criada com successo';
                setId(r.data.id);
                success(msg);
                setLoading(false);
                setIsConsultaCriada(true);
            })
            .catch((e) => {
                let msg = 'Falha ao criar a consulta';
                console.error(msg, e);
                error(msg);
                setLoading(false);
            });
    };

    const _onFinishActualizar = async (values) => {
        setLoading(true);
        let consulta = consultaCreate(values);
        Object.defineProperty(consulta, 'id', {
            value: id,
            writable: true,
            enumerable: true,
            configurable: true,
        });
        console.log(consulta);

        await api
            .put('consulta/edit', consulta)
            .then((r) => {
                let msg = 'consulta actualizada com successo';
                console.log(msg);
                success(msg);
                setLoading(false);
            })
            .catch((e) => {
                let msg = 'Falha ao actualizar a consulta';
                console.error(msg, e);
                error(msg);
                setLoading(false);
            });
    };

    const updateFieldsInForm = (data) => {
        setMotivoConsulta(data.motivoConsulta);
        setHistoriaClinica(data.historiaClinica);
        setExameFisico(data.exameFisico);
        setReceita(data.receita);
        setId(data.id);
    };

    const removerItemExameRequisitado = (row) => {
        console.log(row);
        let data = listaExamesRequisitado;

        let newData = data.filter((item) => item.id !== row.id);
        setListaExamesRequisitado([...newData]);
    };

    const updateDescricao = (row, obs) => {
        let data = listaExamesRequisitado.map((item) =>
            item.id === row.id ? { ...item, obs: obs } : item
        );

        setListaExamesRequisitado([...data]);
    };

    const salvarRequisicao = async () => {
        let requisicaoExame = {
            dataRequisicao: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            status: true,
            usuarioId: 1,
            inscricaoId: idInscricao,
        };

        console.log(requisicaoExame);

        await api
            .post('requisicaoexame/add', requisicaoExame)
            .then((r) => {
                let id = r.data.id;
                listaExamesRequisitado.map(async (item) => {
                    await salvarLinhaExamaRequisica(item, id);
                });

                console.log('Requisicao efectuada com sucesso');
                setListaExamesRequisitado([]);
                viewPdfGenerico('requisicao_exame', id);
            })
            .catch((e) => {
                console.log('Erro ao salvar a requisição');
            });
    };
    const _itemsTabs = [
        {
            key: '1',
            label: 'Motivo da consulta',
            children: (
                <>
                    <Form.Item
                        name="motivoConsulta"
                        rules={[
                            {
                                required: true,
                                message:
                                    'Por favor digite o motivo da consulta',
                            },
                        ]}
                    >
                        <TextArea
                            rows={10}
                            placeholder="Digite o motivo da consulta"
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '2',
            label: 'História Clínica',
            children: (
                <>
                    <Form.Item name="historiaClinica">
                        <TextArea
                            rows={10}
                            placeholder="Digite a história clínica "
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '3',
            label: 'Exame Físico',
            children: (
                <>
                    <Form.Item name="exameFisico">
                        <TextArea
                            id="exameFisico"
                            rows={10}
                            placeholder="Insira o detalhe do exame físico"
                        />
                    </Form.Item>
                </>
            ),
        },

        {
            key: '4',
            label: 'Diagnóstico Inicial',
            children: (
                <>
                    <Form.Item name="diagnosticoInicial">
                        <Cid10   data={dataCID} setData={setDataCID} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '5',
            label: 'Exames Complementares',
            children: (
                <form>
                    <ExameRequisitado
                        listaExamesRequisitado={listaExamesRequisitado}
                        setListaExamesRequisitado={setListaExamesRequisitado}
                        removerItemExameRequisitado={
                            removerItemExameRequisitado
                        }
                        updateDescricao={updateDescricao}
                        salvarRequisicao={salvarRequisicao}
                    />
                </form>
            ),
        },
        {
            key: '6',
            label: 'Diagnóstico Final',
            children: (
                <>
                    <Form.Item name="diagnosticoFinal">
                        <TextArea
                            id="diagnosticoFinal"
                            rows={10}
                            placeholder="Insira o diagnóstico final"
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '7',
            label: 'Receituário',
            children: <Receituario idInscricao={idInscricao} />,
        },
        {
            key: '8',
            label: 'Prescrição Médica',
            children: <> Prescrição Médica</>,
        },
        {
            key: '9',
            label: 'Triagem',
            children: <>Triagem</>,
        },
        {
            key: '10',
            label: 'Procedimentos',
            children: (
                <ConfigProvider locale={ptBR}>
                    <Procedimento idInscricao={idInscricao} />
                </ConfigProvider>
            ),
        },
    ];

    function convertToPdf() {
        var doc = new jsPDF('element', 'pt', 'a5');
        doc.html(document.querySelector('#receita'), {
            callback: function (pdf) {
                pdf.save('receita' + idInscricao + '.pdf');
            },
        });
    }

    const addItemExameRequisitado = (item) => {
        let lista = listaExamesRequisitado;

        let linha = {
            estado: '',
            exame: '',
            hora: '',
            produtoId: 1,
            status: '',
        };

        lista.add(linha);

        setListaExamesRequisitado([...lista]);
    };

    const salvarLinhaExamaRequisica = async (item, requisicaoExameId) => {
        let linha = {
            estado: 'nao_efetuado',
            exame: item.designacao,
            // hora: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            produtoId: item.id,
            requisicaoExameId: requisicaoExameId,
            status: false,
        };

        await api
            .post('linharequisicaoexame/add', linha)
            .then((r) => {
                console.log('Linha criada com sucesso!...');
            })
            .catch((e) => {
                console.log('Falha ao criar a linha ', e);
            });
    };

    return (
        <>
            {contextHolder}
            <Flex gap="small" vertical style={{ width: 600 }}>
                <List
                    header={<div>Lista de paciente por consultar</div>}
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.inscricaoId + ' - ' + item.nome}
                                description=""
                            />
                            <Flex horizontal="true">
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={(e) =>
                                        _showModal(item.inscricaoId, item.nome)
                                    }
                                    style={{
                                        marginRight: 20,
                                        padding: 10,
                                        height: 35,
                                        borderRadius: 30,
                                    }}
                                >
                                    Consultar
                                </Button>
                                <Button
                                    size="small"
                                    type="link"
                                    style={{
                                        marginRight: 20,
                                        padding: 10,
                                        height: 35,
                                        borderRadius: 30,
                                    }}
                                >
                                    Finalizar
                                </Button>
                            </Flex>
                        </List.Item>
                    )}
                    footer={<div></div>}
                ></List>
            </Flex>

            <Modal
                title={'Consulta do paciente: ' + nomePaciente.toUpperCase()}
                open={isModalConsulta}
                onCancel={handleCancel}
                width={80 + '%'}
                height={25 + '%'}
            >
                <Form
                    form={formConsulta}
                    onFinish={
                        isConsultaCriada ? _onFinishActualizar : _onFinishCriar
                    }
                >
                    <div></div>
                    <Form.Item>
                        <div>
                            {isConsultaCriada ? (
                                <Button block type="primary" htmlType="submit">
                                    Actualizar
                                </Button>
                            ) : (
                                <Button
                                    block
                                    type="primary"
                                    loading={loading}
                                    htmlType="submit"
                                >
                                    Criar
                                </Button>
                            )}
                        </div>
                    </Form.Item>

                    <Tabs
                        defaultActiveKey="1"
                        items={_itemsTabs}
                        onChange={_onChange}
                        tabPosition="top"
                        style={{ marginTop: 10 }}
                    />
                </Form>
            </Modal>
        </>
    );
}

export default Consulta;
