import React, { useEffect, useState } from 'react';

import { formatDate } from 'date-fns';
import { api } from '../../../service/api';

import {
    Dosagem,
    InputArtigo,
    Quantidade,
    Frequencia,
    ViaAdministracao,
    viewPdfGenerico,
} from '../../util/utilitarios';
import TextArea from 'antd/es/input/TextArea';

function Receituario(props) {
    const [listaFarmacos, setListaFarmacos] = useState([]);
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        async function addItens() {
            await api
                .get('produto/all/grupo/4')
                .then((r) => {
                    let dados = r.data;

                    let itens = dados.map((item) => ({
                        id: item.id,
                        value: item.productDescription,
                    }));

                    setOptions([...itens]);

                    // console.log(newDados);
                })
                .catch((e) => {});
        }

        addItens();
    }, []);

    const removeitem = (index) => {
        console.log(index);
        let newArray = listaFarmacos.filter((item) => item.id !== index);
        setListaFarmacos([...newArray]);
    };
    function add(e) {
        e.preventDefault();

        var itens = listaFarmacos;

        let item = {
            id: listaFarmacos.length + 1,
            medicamento: 'Produto ' + listaFarmacos.length,
        };
        itens.push(item);
        setListaFarmacos([...itens]);
    }

    const updateItem = (id, medicamento) => {
        setListaFarmacos((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          medicamento: medicamento,
                      }
                    : item
            )
        );
    };

    const updateDosagem = (id, dosagem) => {
        setListaFarmacos((prevItens) =>
            prevItens.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          dosagem: dosagem,
                      }
                    : item
            )
        );
    };
    const updateViaAdministracao = (id, viaAdministracao) => {
        setListaFarmacos((prevItens) =>
            prevItens.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          viaAdministracao: viaAdministracao,
                      }
                    : item
            )
        );
    };

    const updateQtd = (id, quantidade) => {
        setListaFarmacos((prevItens) =>
            prevItens.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantidade: quantidade,
                      }
                    : item
            )
        );
    };
    const updateFrequencia = (id, frequencia) => {
        setListaFarmacos((prevItens) =>
            prevItens.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          frequencia: frequencia,
                      }
                    : item
            )
        );
    };

    const updatePosologia = (id, posologia) => {
        setListaFarmacos((prevItens) =>
            prevItens.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          posologia: posologia,
                      }
                    : item
            )
        );
    };

    const concluirReceita = async (e) => {
        e.preventDefault();
        console.log(listaFarmacos);
        await criarReceita();
    };

    const criarReceita = async () => {
        let receita = {
            data: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            hora: formatDate(new Date(), 'HH:mm:ss'),
            inicioTratamento: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            fimTratamento: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            inscricaoId: 1,
            usuarioId: 1,
        };
        await api
            .post('receita/add', receita)
            .then((r) => {
                // console.log('Receita criada com sucesso!..', r.data);

                var receitaId = r.data.id;
                listaFarmacos.map(async (item) => {
                    let {
                        medicamento,
                        dosagem,
                        posologia,
                        quantidade,
                        frequencia,
                        viaAdministracao,
                    } = item;

                    var newItem = {
                        medicamento: medicamento,
                        dosagem: dosagem,
                        posologia: posologia,
                        quantidade: quantidade,
                        frequencia: frequencia,
                        viaAdministracao: viaAdministracao,
                        receitaId: receitaId,
                    };

                    await api
                        .post('linhareceita/add', newItem)
                        .then((r) => {
                            console.log('linha criada com sucesso!');
                        })
                        .catch((e) => {
                            console.log('Falha ao criar a linha');
                        });
                });
                setListaFarmacos([]);

                viewPdfGenerico('receita_medica', receitaId);
            })
            .catch((e) => {
                console.log(e);
            });
    };
    return (
        <div id="receiturario">
            <form>
                <div>
                    <button onClick={(e) => add(e)}>adicionar</button>
                    <button
                        onClick={(e) => {
                            concluirReceita(e);
                        }}
                    >
                        Concluir Receita
                    </button>
                </div>

                <table className="table">
                    <thead className="thead">
                        <tr>
                            <th className="th">id</th>
                            <th className="th">Med.</th>
                            <th className="th">Dosagem</th>
                            <th className="th">V/A</th>
                            <th className="th">Qtd.</th>
                            <th className="th">Frequência</th>
                        </tr>
                    </thead>
                    {listaFarmacos.map((item) => (
                        <tr key={item.id}>
                            <td className="td">{item.id}</td>
                            <td className="td">
                                <InputArtigo
                                    options={options}
                                    id={item.id}
                                    updateItem={updateItem}
                                />
                            </td>

                            <td className="td">
                                <Dosagem
                                    id={item.id}
                                    updateDosagem={updateDosagem}
                                />
                            </td>

                            <td className="td">
                                <ViaAdministracao
                                    id={item.id}
                                    updateViaAdministracao={
                                        updateViaAdministracao
                                    }
                                />
                            </td>

                            <td className="td">
                                <Quantidade
                                    id={item.id}
                                    updateQtd={updateQtd}
                                />
                            </td>
                            <td className="td">
                                <Frequencia
                                    id={item.id}
                                    updateFrequencia={updateFrequencia}
                                />
                            </td>

                            <td className="td">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeitem(item.id);
                                    }}
                                >
                                    remover
                                </button>
                            </td>
                        </tr>
                    ))}
                </table>
            </form>
        </div>
    );
}

export default Receituario;
