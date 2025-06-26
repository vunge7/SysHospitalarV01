import React, { useEffect, useState } from 'react';
import { Radio, AutoComplete, Flex, Card } from 'antd';
import { TM, VERMELHO, LARANJA, AMARELO, VERDE } from '../../util/file';
import { api } from '../../service/api';
const options = TM;
const optionsVermelho = VERMELHO;
const optionsLaranja = LARANJA;
const optionsAmarelo = AMARELO;
const optionsVerde = VERDE;

const corVermelha = 'red';
const corLaranja = 'orange';
const corAmarela = '#FFFF00';
const corVerde = 'green';
const corAzul = 'blue';

function TriagemManchester(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [queixaId, setQueixaId] = useState(0);
    const [queixa, setQueixa] = useState('');
    const [cor, setCor] = useState('red');
    const [corTex, setCorText] = useState('#ffffff');
    const [estado, setEstado] = useState('EMERGÊNCIA');

    const [vermelho, setVermelho] = useState(-1);
    const [laranja, setLaranja] = useState(-1);
    const [amarelo, setAmarelo] = useState(-1);
    const [verde, setVerde] = useState(-1);

    const [itensVermelhos, setItensVermelhos] = useState([]);
    const [itensLaranja, setItensLaranja] = useState([]);
    const [itensAmarelo, setItensAmarelo] = useState([]);
    const [itensVerde, setItensVerde] = useState([]);
    const [minuto, setMunito] = useState(0);

    useEffect(() => {
        updateListOrange();
        updateListYellow();
        updateListGreen();
    }, [queixaId]);

    useEffect(() => {
        async function updateEstadoTriagemManchester() {
            let inscricaoId = props.idInscricao;
            let corTranslate = translateCor();
            ///inscricao/edit/tm/{id}/{cor}/{minuto}

            await api
                .put(
                    '/inscricao/edit/tm/' +
                        inscricaoId +
                        '/' +
                        corTranslate +
                        '/' +
                        minuto
                )
                .then((r) => {
                    console.log('actualizado com sucesso');
                })
                .catch((e) => {
                    console.log('Error', e);
                });
        }

        function translateCor() {
            switch (cor) {
                case corVermelha:
                    return 'Vermelho';
                case corLaranja:
                    return 'Laranja';
                case corAmarela:
                    return 'Amarelo';
                case corVerde:
                    return 'Verde';
                case corAzul:
                    return 'Azul';
                default:
                    return '';
            }
        }

        updateEstadoTriagemManchester();
    }, [cor, minuto]);

    const handleSelectRadio = (e) => {
        console.log('Selecionado e valor: ' + e.target.value);
        setVermelho(e.target.value);
        updateIdQueixa();
        setLaranja(-1);
        if (e.target.value === 0) {
            setCor(corLaranja);
            setCorText('#000000');
            setMunito(10);
            setEstado('MUITO URGENTE');
        } else {
            setCor(corVermelha);
            setCorText('#000000');
            setMunito(0);
            setEstado('EMERGÊNCIA');
        }
    };

    const handleSelectRadioLaranja = (e) => {
        setLaranja(e.target.value);
        setAmarelo(-1);
        console.log('Id Laranja: ' + e.target.value);
        if (e.target.value === 0) {
            setCor(corAmarela);
            setCorText('#000000');
            setMunito(60);
            setEstado('URGENTE');
        } else {
            setCor(corLaranja);
            setCorText('#000000');
            setMunito(10);
            setEstado('MUITO URGENTE');
        }
    };

    const handleSelectRadioAmarelo = (e) => {
        setAmarelo(e.target.value);
        console.log('Id Amarelo: ' + e.target.value);
        if (e.target.value === 0) {
            setCor(corVerde);
            setMunito(120);
            setEstado('POUCO URGENTE');
        } else {
            setCor(corAmarela);
            setCorText('#000000');
            setMunito(60);
            setEstado('URGENTE');
        }
    };
    const handleSelectRadioVerde = (e) => {
        setVerde(e.target.value);
        console.log('Id Amarelo: ' + e.target.value);
        if (e.target.value === 0) {
            setCor(corAzul);
            setCorText('#ffffff');
            setMunito(240);
            setEstado('NÃO URGENTE');
        } else {
            setCor(corVerde);
            setCorText('#ffffff');
            setMunito(120);
            setEstado('POUCO URGENTE');
        }
    };

    const handleSelected = (value, option) => {
        setQueixa(value);
        updateIdQueixa();
        let itensVermelhos = [];
        optionsVermelho.map((item, index) => {
            if (item.queixa_id === option.id) {
                itensVermelhos.push(item.value);
            }
        }, itensVermelhos);
        setItensVermelhos([...itensVermelhos]);
        setVermelho(-1);
        setLaranja(-1);
    };

    const updateListOrange = () => {
        let itensLaranja = [];
        optionsLaranja.map((item, index) => {
            if (item.queixa_id === queixaId) {
                itensLaranja.push(item.value);
            }
        }, itensLaranja);
        setItensLaranja([...itensLaranja]);
    };

    const updateListYellow = () => {
        let itensAmarelo = [];
        optionsAmarelo.map((item, index) => {
            if (item.queixa_id === queixaId) {
                itensAmarelo.push(item.value);
            }
        }, itensAmarelo);
        setItensAmarelo([...itensAmarelo]);
    };

    const updateListGreen = () => {
        let itensVerde = [];
        optionsVerde.map((item, index) => {
            if (item.queixa_id === queixaId) {
                itensVerde.push(item.value);
            }
        }, itensAmarelo);
        setItensVerde([...itensVerde]);
    };

    const updateIdQueixa = () => {
        let id;
        options.map((item, index) => {
            if (item.value === queixa) id = item.id;
        }, id);
        setQueixaId(id);
    };

    function BuildRedOption() {
        return (
            <Card
                key={1}
                style={{
                    width: 450,
                    marginTop: 10,
                }}
            >
                <Radio.Group onChange={handleSelectRadio} value={vermelho}>
                    <Radio value={0}>Nenhuma</Radio>
                    {itensVermelhos.map((item, index) => {
                        return (
                            <Radio key={3 + index + 1} value={index + 1}>
                                {' '}
                                {item}{' '}
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Card>
        );
    }

    function BuildOrangeOption() {
        return (
            <Card
                key={2}
                style={{
                    width: 450,
                    marginTop: 10,
                }}
            >
                <Radio.Group
                    onChange={handleSelectRadioLaranja}
                    value={laranja}
                >
                    <Radio value={0}>Nenhuma</Radio>
                    {itensLaranja.map((item, index) => {
                        return (
                            <Radio key={2 + index + 1} value={index + 1}>
                                {' '}
                                {item}{' '}
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Card>
        );
    }
    function BuildYellowOption() {
        return (
            <Card
                key={3}
                style={{
                    width: 450,
                    marginTop: 10,
                }}
            >
                <Radio.Group
                    onChange={handleSelectRadioAmarelo}
                    value={amarelo}
                >
                    <Radio key={3 + 0} value={0}>
                        Nenhuma
                    </Radio>
                    {itensAmarelo.map((item, index) => {
                        return (
                            <Radio key={3 + index + 1} value={index + 1}>
                                {' '}
                                {item}{' '}
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Card>
        );
    }
    function BuildGreenOption() {
        return (
            <Card
                key={3}
                style={{
                    width: 450,
                    marginTop: 10,
                }}
            >
                <Radio.Group onChange={handleSelectRadioVerde} value={verde}>
                    <Radio key={3 + 0} value={0}>
                        Nenhuma
                    </Radio>
                    {itensVerde.map((item, index) => {
                        return (
                            <Radio key={3 + index + 1} value={index + 1}>
                                {' '}
                                {item}{' '}
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Card>
        );
    }

    function Cor(props) {
        return (
            <div
                style={{
                    backgroundColor: props.bgColor,
                    width: 440,
                    position: 'relative',
                    height: 50,
                    borderRadius: 10,
                    //box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
                    boxShadow: 'rgb(38, 57, 77) 0px 20px 30px -10px',
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <span
                    style={{
                        backgroundColor: 'white',
                        width: 210,
                        color: 'black',
                        borderRadius: '10px',
                        justifyContent: 'center',
                        padding: 2,
                        fontSize: 14,
                    }}
                >
                    <center>{props.estado}</center>
                </span>
                <span
                    style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        color: props.color,
                    }}
                >
                    {minuto} minutos
                </span>
            </div>
        );
    }

    return (
        <Flex gap="midle" vertical>
            <AutoComplete
                style={{
                    width: 200,
                }}
                options={options}
                placeholder="digite a queixa"
                filterOption={(inputValue, option) =>
                    option.value
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={(value, option) => {
                    handleSelected(value, option);
                }}
                onSearch={(value) => setQueixa(value)}
            />
            <div
                style={{
                    marginTop: 10,
                    marginLeft: 10,
                    width: 'auto',
                }}
            >
                <Cor bgColor={cor} color={corTex} estado={estado} />
            </div>

            {queixa !== '' && itensVermelhos.length > 0 && (
                <>
                    <BuildRedOption />
                </>
            )}
            {vermelho === 0 && <BuildOrangeOption />}
            {laranja === 0 && <BuildYellowOption />}
            {amarelo === 0 && <BuildGreenOption />}
        </Flex>
    );
}

export default TriagemManchester;
