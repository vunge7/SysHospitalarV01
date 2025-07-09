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
    Slider,
    Row,
    Col,
    InputNumber,
    Radio,
    Space,
} from 'antd';

import { format } from 'date-fns';

import TriagemManchester from '../../TriagemManchester';
import { viewPdfPacienteFita, ModalTriagem } from '../../util/utilitarios';

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
                footer={<div></div>}
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.inscricaoId + ' - ' + item.nome}
                            description=""
                        />
                        <Flex>
                            <Button
                                size="small"
                                type="primary"
                                onClick={(e) =>
                                    showModal(item.inscricaoId, item.nome)
                                }
                            >
                                Triar
                            </Button>
                        </Flex>
                    </List.Item>
                )}
            ></List>
            <>
                <ModalTriagem
                    estado={isModalTriagem}
                    idInscricao={idInscricao}
                    onCancel={() => setIsModalTriagem(false)} //
                    exibirEncaminhamento={false}
                    exibirManchester={false}
                />
            </>
        </Flex>
    );
}

export default Triagem;
