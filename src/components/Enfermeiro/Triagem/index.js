import React, { useEffect, useState } from 'react';
import { api } from '../../../service/api';

import {
    Flex,
    List,
    Avatar,
    Input,
    Button,
    Modal,
    Card,
    Form,
    Slider,
    Row,
    Col,
    InputNumber,
    Divider,
    Radio,
    Space,
} from 'antd';

import { format } from 'date-fns';

import TriagemManchester from '../../TriagemManchester';
import { viewPdfPacienteFita } from '../../util/utilitarios';

const { Search } = Input;

function Triagem() {
    const [data, setData] = useState([]);
    const [isModalTriagem, setIsModalTriagem] = useState(false);
    const [idInscricao, setIdInscricao] = useState(0);
    const [nomePaciente, setNomePaciente] = useState();
    const [encaminhamento, setEncaminhamento] = useState(1);

    /**DADOS DOS SINAIS VITAIS */

    const [pressaArterial, setpPessaArterial] = useState(120);
    const [pressaArterialD, setpPessaArterialD] = useState(80);
    const [temperatura, setTemperatura] = useState(37);
    const [peso, setPeso] = useState(0);
    const [pulso, setPulso] = useState();
    const [so, setSo] = useState();
    const [respiracao, setRespiracao] = useState();
    const [dor, setDor] = useState();

    useEffect(() => {
        carrgarDados();
    }, []);

    const showModal = (id, nome) => {
        setNomePaciente(nome);
        setIdInscricao(id);
        setIsModalTriagem(true);
    };

    const handleOk = async () => {
        setIsModalTriagem(false);
        console.log(idInscricao);
        const triagem = {
            dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            fkInscricao: idInscricao,
            fkUser: 1,
        };
        await api
            .post('triagem/add', triagem)
            .then(async (r) => {
                const id = r.data.id;
                console.log(id);
                let _linhasTriagem = _getLinhasTriagem(id);
                console.log(_linhasTriagem);
                await api
                    .post('linha-triagem/add/all', _linhasTriagem)
                    .then(async (r) => {
                        //inscricao/edit/{id}/{estado}"
                        console.log(idInscricao);
                        await api
                            .put(
                                'inscricao/edit/' +
                                    idInscricao +
                                    '/TRIADO/' +
                                    encaminhamento
                            )
                            .then((r) => {
                                console.log('Triagem efectuada com sucesso');
                                _limpar();
                                carrgarDados();
                            })
                            .catch((e) => {
                                console.log(
                                    'Falha ao actualizar o estado da inscrição',
                                    e
                                );
                            });
                    })
                    .catch((e) => {
                        //setLoading(false);
                        console.log('Falha ao registrar a linha', e);
                    });

                //chamar o reports
                viewPdfPacienteFita('paciente_fita', idInscricao);
            })
            .catch((e) => {
                console.log('Falha ao registrar a triagem', e);
                //setLoading(false);
            });
    };

    const handleCancel = () => {
        setIsModalTriagem(false);
    };

    const onChange = (newValue) => {
        setpPessaArterial(newValue);
    };
    const onChangeD = (newValue) => {
        setpPessaArterialD(newValue);
    };

    const onChangeTemperatura = (newValue) => {
        setTemperatura(newValue);
    };

    const onChangePeso = (newValue) => {
        setPeso(newValue);
    };

    const onChangePulso = (newValue) => {
        setPulso(newValue);
    };

    const onChangeSo = (newValue) => {
        setSo(newValue);
    };
    const onChangeRespiracao = (newValue) => {
        setRespiracao(newValue);
    };
    const onChangeDor = (newValue) => {
        setDor(newValue);
    };

    const onChangeEncaminhamento = (e) => {
        console.log('radio checked', e.target.value);
        setEncaminhamento(e.target.value);
    };

    const marks = {
        0: '0°C',
        37: '37°C',
        100: {
            style: {
                color: '#f50',
            },
            label: <strong>100°C</strong>,
        },
    };
    const style = {
        // display: 'inline-block',
        with: 800,
        // marginInlineStart: 70,
    };

    function getItem(id, campo, valor, unidade) {
        let _item = {
            campo: campo,
            valor: valor,
            unidade: unidade,
            triagem: {
                id: id,
            },
        };
        return _item;
    }

    function _getLinhasTriagem(id) {
        let _linhas = [];
        _linhas.push(
            getItem(
                id,
                'Pressão Arterial',
                pressaArterial + '/' + pressaArterialD,
                'mmHg'
            )
        );
        _linhas.push(getItem(id, 'Peso', peso, 'Kg'));
        _linhas.push(getItem(id, 'Temperatura', temperatura, '°C'));
        _linhas.push(getItem(id, 'Pulso', pulso, 'bpm'));
        _linhas.push(getItem(id, 'Saturação de Oxigênio', so, '%'));
        _linhas.push(getItem(id, 'Respiração', respiracao, 'ipm'));
        _linhas.push(getItem(id, 'Dor', dor, 'Un.'));
        return _linhas;
    }

    const _limpar = () => {
        setpPessaArterial(120);
        setpPessaArterialD(80);
        setPeso(0);
        setTemperatura(37);
        setPulso(0);
        setSo();
        setRespiracao();
        setDor();
    };

    const carrgarDados = async () => {
        await api
            .get('inscricao/all')
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

                console.log(data);
                setData(data);
                //setListaTemp(inscricoes);
            })
            .catch((e) => {
                console.log('Falha na busca', e);
            });
    };

    return (
        <Flex gap="small" vertical style={{ width: 600 }}>
            <Search
                placeholder="faça busca pelo id"
                enterButton
                style={{
                    width: 200,
                }}
            />
            <List
                header={<div>Lista de Paciente Inscritos</div>}
                footer={<div>Footer</div>}
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                                />
                            }
                            title={item.inscricaoId + ' - ' + item.nome}
                            description="Dados da Última Triagem"
                        />
                        <Flex horizontal="true">
                            <Button
                                size="small"
                                type="primary"
                                onClick={(e) =>
                                    showModal(item.inscricaoId, item.nome)
                                }
                            >
                                Triar
                            </Button>
                            <span>Tempo de Espera: </span>
                        </Flex>
                    </List.Item>
                )}
            ></List>
            <>
                <Modal
                    title="Triagem"
                    open={isModalTriagem}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={1020}
                >
                    <Flex horizontal gap="small">
                        <Card
                            bordered={true}
                            title="Triagem "
                            style={{
                                width: '50%',
                                marginBottom: 10,
                            }}
                        >
                            <div>
                                <div id="pressao_arterial">
                                    <label>
                                        Pressão Arterial{' (  '}
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 20,
                                            }}
                                        >
                                            {pressaArterial +
                                                '/' +
                                                pressaArterialD}
                                        </span>
                                        {'  ) mmHg'}
                                    </label>
                                    <Row>
                                        <Col span={12}>
                                            <Slider
                                                min={1}
                                                max={220}
                                                onChange={onChange}
                                                value={
                                                    typeof pressaArterial ===
                                                    'number'
                                                        ? pressaArterial
                                                        : 0
                                                }
                                            />
                                        </Col>

                                        <Col span={4}>
                                            <InputNumber
                                                min={1}
                                                max={220}
                                                style={{
                                                    margin: '0 16px',
                                                }}
                                                value={pressaArterial}
                                                onChange={onChange}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col span={12}>
                                            <Slider
                                                min={1}
                                                max={220}
                                                onChange={onChangeD}
                                                value={
                                                    typeof pressaArterialD ===
                                                    'number'
                                                        ? pressaArterialD
                                                        : 0
                                                }
                                            />
                                        </Col>

                                        <Col span={4}>
                                            <InputNumber
                                                min={1}
                                                max={220}
                                                style={{
                                                    margin: '0 16px',
                                                }}
                                                value={pressaArterialD}
                                                onChange={onChangeD}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div id="temperatura">
                                    Temperatura{' (  '}
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: 25,
                                        }}
                                    >
                                        {temperatura}
                                    </span>
                                    {' ) °C'}
                                    <Row>
                                        <Col span={12}>
                                            <div style={style}>
                                                <Slider
                                                    horizontal
                                                    range
                                                    marks={marks}
                                                    defaultValue={[37]}
                                                    value={temperatura}
                                                    onChange={
                                                        onChangeTemperatura
                                                    }
                                                />
                                            </div>
                                        </Col>
                                        <Col span={4}>
                                            <InputNumber
                                                min={1}
                                                max={220}
                                                style={{
                                                    margin: '0 16px',
                                                }}
                                                value={temperatura}
                                                onChange={onChangeTemperatura}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div id="peso">
                                    Peso{' (  '}
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: 25,
                                        }}
                                    >
                                        {peso}
                                    </span>
                                    {' ) Kg'}
                                    <Row>
                                        <Col span={12}>
                                            <Slider
                                                min={1}
                                                max={220}
                                                onChange={onChangePeso}
                                                value={
                                                    typeof peso === 'number'
                                                        ? peso
                                                        : 0
                                                }
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <InputNumber
                                                min={1}
                                                max={220}
                                                style={{
                                                    margin: '0 16px',
                                                }}
                                                value={peso}
                                                onChange={onChangePeso}
                                            />
                                        </Col>
                                    </Row>
                                    <Flex
                                        horizontal
                                        grap="small"
                                        style={{ marginTop: 5 }}
                                    >
                                        <Flex vertical>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <label>Pulso</label>
                                                <InputNumber
                                                    min={1}
                                                    max={220}
                                                    style={{
                                                        margin: '0 16px',
                                                    }}
                                                    value={pulso}
                                                    onChange={onChangePulso}
                                                />
                                            </div>

                                            <div>
                                                <label>SO</label>
                                                <InputNumber
                                                    min={1}
                                                    max={220}
                                                    style={{
                                                        margin: '0 16px',
                                                    }}
                                                    value={so}
                                                    onChange={onChangeSo}
                                                />
                                            </div>
                                            <div>
                                                <label>Respiração</label>
                                                <InputNumber
                                                    min={1}
                                                    max={220}
                                                    style={{
                                                        margin: '0 16px',
                                                    }}
                                                    value={respiracao}
                                                    onChange={
                                                        onChangeRespiracao
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label>Dor</label>
                                                <InputNumber
                                                    min={1}
                                                    max={220}
                                                    style={{
                                                        margin: '0 16px',
                                                    }}
                                                    value={dor}
                                                    onChange={onChangeDor}
                                                />
                                            </div>
                                        </Flex>
                                        <Flex vertical>
                                            <label
                                                style={{
                                                    fontWeight: 'bold',
                                                    marginBottom: 10,
                                                }}
                                            >
                                                Encaminhamento:
                                            </label>
                                            <Radio.Group
                                                onChange={
                                                    onChangeEncaminhamento
                                                }
                                                value={encaminhamento}
                                            >
                                                <Space direction="vertical">
                                                    <Radio value="CONSULTORIO">
                                                        Consultório
                                                    </Radio>
                                                    <Radio value="SO">
                                                        Sala de Observação
                                                    </Radio>
                                                    <Radio value="CADEIRA">
                                                        Cadeira
                                                    </Radio>
                                                </Space>
                                            </Radio.Group>
                                        </Flex>
                                    </Flex>
                                </div>
                            </div>
                        </Card>
                        <Card
                            title="Triagem de Manchester"
                            style={{
                                width: '50%',
                            }}
                        >
                            <TriagemManchester idInscricao={idInscricao} />
                        </Card>
                    </Flex>
                </Modal>
            </>
        </Flex>
    );
}

export default Triagem;
