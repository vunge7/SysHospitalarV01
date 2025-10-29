import React, { useEffect, useState } from 'react';
import { api } from '../../../service/api';
import { Flex, List, Input, Button } from 'antd';

import { ModalTriagem } from '../../util/utilitarios';

const { Search } = Input;

function Triagem() {
    const [data, setData] = useState([]);
    const [isModalTriagem, setIsModalTriagem] = useState(false);

    const [idInscricao, setIdInscricao] = useState(0);
    const [nomePaciente, setNomePaciente] = useState();

    /**DADOS DOS SINAIS VITAIS */

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
                console.log('Dados recebidos', r.data);
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
                    inscricaoId={idInscricao}
                    usuarioId={1}
                    onCancel={() => setIsModalTriagem(false)} //
                    exibirEncaminhamento={true}
                    exibirManchester={true}
                    carrgarDados={carrgarDados}
                />
            </>
        </Flex>
    );
}

export default Triagem;
