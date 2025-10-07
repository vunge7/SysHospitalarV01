import {
    Button,
    Flex,
    Form,
    Input,
    Tabs,
    Card,
    message,
    DatePicker,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { HomeFilled, InfoCircleFilled } from '@ant-design/icons';
import { api } from '../../service/api';
import { format } from 'date-fns';
import Combo from '../util/Combo';
import {
    Habitacaoes,
    Profissoes,
    EstadoCivil,
    Nacionalidade,
    Sexo,
    Raca,
    paisesOptions,
} from '../../util/db';
import moment from 'moment/moment';
import Seguradora from '../Seguradora';
import { toast } from 'react-toastify';

const baseStyle = {};
const { Search } = Input;

function Paciente() {
    const [idSeach, setIdSeach] = useState();
    const [id, setId] = useState();
    const [nome, setNome] = useState();
    const [apelido, setApelido] = useState();
    const [bairro, setBairro] = useState('');
    const [nif, setNif] = useState('');
    const [habilitacao, setHabilitacao] = useState('');
    const [profissao, setProfissao] = useState('');
    const [nacionalidade, setNacionalidade] = useState('');
    const [raca, setRaca] = useState('');
    const [sexo, setSexo] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [pai, setPai] = useState('');
    const [mae, setMae] = useState('');
    const [dataNascimento, setDataNascimento] = useState();
    const [paisEndereco, setPaisEndereco] = useState('');
    const [provinciaEndereco, setProvinciaEndereco] = useState('');
    const [municipioEndereco, setMunicipioEndereco] = useState('');
    const [paisNascimento, setPaisNascimento] = useState('');
    const [provinciaNascimento, setProvinciaNascimento] = useState('');
    const [municipioNascimento, setMunicipioNascimento] = useState('');
    const [localNascimento, setLocalNascimento] = useState('');

    const [pronvicaOptionsEndereco, setPronvicaOptionsEndereco] = useState([]);
    const [municipioOptionsEndereco, setMunicipioOptionsEndereco] = useState(
        []
    );
    const [pronvicaOptionsNascimento, setPronvicaOptionsNascimento] = useState(
        []
    );
    const [municipioOptionsNascimento, setMunicipioOptionsNascimento] =
        useState([]);
    const [formHeader] = Form.useForm();

    const [pacienteSeguradora, setPacienteSeguradora] = useState([]);

    useEffect(() => {
        formHeader.setFieldsValue({
            id: id,
            nome: nome,
            apelido: apelido,
            bairro: bairro,
            nif: nif,
            profissao: profissao,
            estadoCivil: estadoCivil,
            habilitacao: habilitacao,
            nacionalidade: nacionalidade,
            raca: raca,
            sexo: sexo,
            pai: pai,
            mae: mae,
            dataNascimento: dataNascimento,
            paisEndereco: paisEndereco,
            provinciaEndereco: provinciaEndereco,
            municipioEndereco: municipioEndereco,
            paisNascimento: paisNascimento,
            provinciaNascimento: provinciaNascimento,
            municipioNascimento: municipioNascimento,
            localNascimento: localNascimento,
        });
    }, [
        id,
        nome,
        apelido,
        bairro,
        nif,
        profissao,
        habilitacao,
        estadoCivil,
        habilitacao,
        nacionalidade,
        raca,
        sexo,
        pai,
        mae,
        dataNascimento,
        paisEndereco,
        provinciaEndereco,
        municipioEndereco,
        paisNascimento,
        provinciaNascimento,
        municipioNascimento,
        localNascimento,
    ]);

    const success = (msg) => {
        toast.success(msg, {
            autoClose: 2000,
        });
    };
    const error = (msg) => {
        toast.error(msg, {
            autoClose: 2000,
        });
    };

    const _paisOtions = (id) => {
        return paisesOptions[id].label;
    };

    const _idPaisOtions = (label) => {
        let indexPais = -1;
        paisesOptions.map((item, index) => {
            if (item.label === label) {
                indexPais = item.value;
                return;
            }
        }, indexPais);

        return indexPais;
    };

    const _idProvinciaLabelOtions = (label, indexPais) => {
        let indexProvincia = -1;
        paisesOptions[indexPais].provincia.map((item, index) => {
            if (item.label === label) {
                indexProvincia = item.value;
            }
        }, indexProvincia);

        return indexProvincia;
    };

    const _idMunicipioLabelOtions = (label, indexPais, indexProvincia) => {
        var indexMunicipio = -1;

        paisesOptions[indexPais].provincia[indexProvincia].municipio.map(
            (item, index) => {
                if (item.label === label) {
                    indexMunicipio = item.value;
                    return;
                }
            },
            indexMunicipio
        );

        return indexMunicipio;
    };

    const _provinciaOtions = (idPais, idProvincia) => {
        return paisesOptions[idPais].provincia[idProvincia].label;
    };

    const _municipioOtions = (idPais, idProvincia, idMunicipio) => {
        console.log('idPais', idPais);
        return paisesOptions[idPais].provincia[idProvincia].municipio[
            idMunicipio
        ].label;
    };

    const salvar = async (values) => {
        /*
        let idPaisEndereco = values.paisEndereco;
        let idProvinciaEndereco = values.provinciaEndereco;
        let idMunicipioEndereco = values.municipioEndereco;

        let idPaisNascimento = values.paisNascimento;
        let idProvinciaNascimento = values.provinciaNascimento;
        let idMunicipioNascimento = values.municipioNascimento;

        //console.log(values);

        let paciente = {
            nome: values.nome,
            apelido: values.apelido,
            bairro: values.bairro,
            estadoCivil: values.estadoCivil,
            nif: 'n/a',
            profissao: values.profissao,
            habilitacao: values.habilitacao,
            dataNascimento: format(values.dataNascimento.$d, 'yyyy-MM-dd'),
            mae: values.mae,
            nacionalidade: values.nacionalidade,
            pai: values.pai,
            raca: values.raca,
            sexo: values.sexo,
            localNascimento: values.localNascimento,

            municipioEndereco: _municipioOtions(
                idPaisEndereco,
                idProvinciaEndereco,
                idMunicipioEndereco
            ),

            municipioNascimento: _municipioOtions(
                idPaisNascimento,
                idProvinciaNascimento,
                idMunicipioNascimento
            ),

            paisEndereco: _paisOtions(idPaisEndereco),
            paisNascimento: _paisOtions(idPaisNascimento),

            provinciaEndereco: _provinciaOtions(
                idPaisEndereco,
                idProvinciaEndereco
            ),
            provinciaNascimento: _provinciaOtions(
                idPaisNascimento,
                idProvinciaNascimento
            ),
        };

        console.log(paciente);

        await api
            .post('paciente/add', paciente)
            .then((e) => {
                console.log('Dados salvos com sucesso.', e);
                success('Dados salvos com sucesso');
            })
            .catch((e) => {
                limpar();
                error('Erro ao registrar o paciente');
            });




            */

        console.log('Salvar dados paciente');
    };

    const update = async (values) => {
        console.log(
            'ENDERECO',
            paisEndereco,
            provinciaEndereco,
            municipioEndereco
        );
        console.log(
            'NASCIMENTO',
            paisNascimento,
            provinciaNascimento,
            municipioNascimento
        );

        console.log('Profissão', profissao);
        console.log('Habilitação', habilitacao);
        console.log('Estado Civil', estadoCivil);
        console.log('Nacionalidade', nacionalidade);
        console.log('Local de nascimento: ', localNascimento);
        console.log('Sexo ', sexo);
        console.log('Raça', raca);

        let paciente = {
            id: id,
            nome: nome,
            apelido: apelido,
            bairro: bairro,
            estadoCivil: estadoCivil,
            nif: 'n/a',
            profissao: profissao,
            habilitacao: habilitacao,
            dataNascimento: moment(dataNascimento, 'yyyy-MM-dd'),
            mae: mae,
            nacionalidade: nacionalidade,
            pai: pai,
            raca: raca,
            sexo: sexo,
            localNascimento: localNascimento,

            municipioEndereco: _municipioOtions(
                paisEndereco,
                provinciaEndereco,
                municipioEndereco
            ),

            municipioNascimento: _municipioOtions(
                paisNascimento,
                provinciaNascimento,
                municipioNascimento
            ),

            paisEndereco: _paisOtions(paisEndereco),

            paisNascimento: _paisOtions(paisNascimento),

            provinciaEndereco: _provinciaOtions(
                paisEndereco,
                provinciaEndereco
            ),
            provinciaNascimento: _provinciaOtions(
                paisNascimento,
                provinciaNascimento
            ),
        };

        console.log(paciente);
        //console.log(paisEndereco);
        //console.log(values);

        await api
            .put('paciente/edit', paciente)
            .then((e) => {
                console.log('Dados actualido com sucesso.', e);
                success('Dados actualidos com sucesso');
            })
            .catch((e) => {
                console.log('Erro ao actualizar os dados', e);
                limpar();
                error('Erro ao actualizar os dados');
            });
    };

    const novaInscrica = async () => {
        let inscricao = {
            dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            dataActualizacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            estadoInscricao: 'NAO_TRIADO',
            pacienteId: id,
        };

        await api
            .post('inscricao/add', inscricao)
            .then((r) => {
                console.log('Inscricao criada com sucesso!..');
                success('Inscricao criada com sucesso!..');
            })
            .catch((e) => {
                console.log(e);
                error('Falha ao inscrever o paciente');
            });
    };

    const limpar = () => {
        setId('');
        setNome('');
        setApelido('');
        setBairro('');
        setPaisEndereco('');
        setProvinciaEndereco('');
        setMunicipioEndereco('');
        setProfissao('');
        setHabilitacao('');
        setEstadoCivil('');
        setPaisNascimento('');
        setProvinciaNascimento('');
        setMunicipioNascimento('');
        setNacionalidade('');
        setDataNascimento(null);
        setSexo('');
        setRaca('');
        setPai('');
        setMae('');
        setLocalNascimento('');
    };

    const buscar = async () => {
        await api
            .get('paciente/' + idSeach)
            .then((r) => {
                //console.log(r.data);

                /**ENDERECO */
                let paciente = r.data;
                let indexPaisEndereco = _idPaisOtions(paciente.paisEndereco);

                let indexProvinciaEndereco = _idProvinciaLabelOtions(
                    paciente.provinciaEndereco,
                    indexPaisEndereco
                );

                let indexMunicipioEndereco = _idMunicipioLabelOtions(
                    paciente.municipioEndereco,
                    indexPaisEndereco,
                    indexProvinciaEndereco
                );

                setPronvinciaBusca(indexPaisEndereco);
                setMunicipioBusca(indexPaisEndereco, indexProvinciaEndereco);

                /**NASCIMENTO */

                let indexPaisNascimento = _idPaisOtions(
                    paciente.paisNascimento
                );

                let indexProvinciaNascimento = _idProvinciaLabelOtions(
                    paciente.provinciaNascimento,
                    indexPaisNascimento
                );

                let indexMunicipioNascimento = _idMunicipioLabelOtions(
                    paciente.municipioNascimento,
                    indexPaisNascimento,
                    indexProvinciaNascimento
                );
                console.log('ID MUNICIPIO: ', indexMunicipioNascimento);

                setPronvinciaNascBusca(indexPaisNascimento);
                setMunicipioNascBusca(
                    indexPaisNascimento,
                    indexProvinciaNascimento
                );

                setId(paciente.id);
                setNome(paciente.nome);
                setApelido(paciente.apelido);
                setBairro(paciente.bairro);
                setProfissao(paciente.profissao);
                setHabilitacao(paciente.habilitacao);
                setEstadoCivil(paciente.estadoCivil);
                setNacionalidade(paciente.nacionalidade);
                setRaca(paciente.raca);
                setSexo(paciente.sexo);
                setDataNascimento(moment(paciente.dataNascimento));
                setPai(paciente.pai);
                setMae(paciente.mae);

                setPaisEndereco(indexPaisEndereco);
                setProvinciaEndereco(indexProvinciaEndereco);
                setMunicipioEndereco(indexMunicipioEndereco);

                setPaisNascimento(indexPaisNascimento);
                setProvinciaNascimento(indexProvinciaNascimento);
                setMunicipioNascimento(indexMunicipioNascimento);
                setLocalNascimento(paciente.localNascimento);
            })
            .catch((e) => {
                console.log('Erro', e);
                limpar();
                error('Não existe paciente com este ID.');
            });
    };

    const maximazed = () => {
        window.moveTo(0, 0);
        window.resizeTo(window.screen.availWidth, window.screen.availHeight);
    };

    const setPronvincia = (index) => {
        setPronvicaOptionsEndereco([...paisesOptions[index].provincia]);
    };
    const setPronvinciaBusca = (index) => {
        setPronvicaOptionsEndereco([...paisesOptions[index].provincia]);
    };
    const setMunicipio = (index) => {
        setMunicipioOptionsEndereco([
            ...pronvicaOptionsEndereco[index].municipio,
        ]);
    };
    const setMunicipioBusca = (idPaisEndereco, index) => {
        setMunicipioOptionsEndereco([
            ...paisesOptions[idPaisEndereco].provincia[index].municipio,
        ]);
    };

    const setPronvinciaNasc = (index) => {
        console.log('ID' + index);
        setPronvicaOptionsNascimento([...paisesOptions[index].provincia]);
    };
    const setPronvinciaNascBusca = (index) => {
        setPronvicaOptionsNascimento([...paisesOptions[index].provincia]);
    };
    const setMunicipioNasc = (index) => {
        console.log(
            'id provincia: ',
            pronvicaOptionsNascimento[index].municipio
        );

        setMunicipioOptionsNascimento([
            ...pronvicaOptionsNascimento[index].municipio,
        ]);
    };
    const setMunicipioNascBusca = (indexPais, index) => {
        console.log(paisesOptions[indexPais].provincia[index].municipio);
        setMunicipioOptionsNascimento([
            ...paisesOptions[indexPais].provincia[index].municipio,
        ]);
    };

    function PacienteSeguradora(props) {
        return (
            <tr className="tr">
                <td className="td">{props.id}</td>
                <td className="td">{props.nome}</td>
            </tr>
        );
    }

    return (
        <Flex
            gap="midlle"
            align="start"
            vertical={true}
            style={{ ...baseStyle }}
        >

            <Flex gap="small" horizontal={true} style={{ marginBottom: 10 }}>
                <Search
                    placeholder="faça busca pelo id"
                    value={idSeach}
                    onChange={(e) => setIdSeach(e.target.value)}
                    onSearch={(e) => buscar()}
                    enterButton
                    style={{
                        width: 400,
                    }}
                />
            </Flex>

            <Form
                name="basic"
                form={formHeader}
                labelCol={{
                    span: 6,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 600,
                    marginBottom: 10,
                }}
                autoComplete="off"
                onFinish={salvar}
                onReset={limpar}
            >
                <Flex gap="small" horizontal>
                    {id > 0 && (
                        <Button
                            type="primary"
                            onClick={(e) => {
                                novaInscrica();
                            }}
                        >
                            {' '}
                            Nova Inscrição
                        </Button>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={update}
                        >
                            Actualizar
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="reset">
                            Limpar
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Salvar
                        </Button>
                    </Form.Item>
                </Flex>
                <Flex gap="small" horizontal style={{ marginTop: 10 }}>
                    <Flex gap="small" vertical>
                        <h2>Ficha do Paciente</h2>

                        <Form.Item
                            label="Nº"
                            name="id"
                            style={{
                                marginBottom: 5,
                            }}
                            value={id}
                        >
                            <Input
                                style={{
                                    width: 50,
                                }}
                                disabled
                            />
                        </Form.Item>

                        <Form.Item
                            label="Nif"
                            name="nif"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor insira o nif.',
                                },
                            ]}
                            style={{
                                marginBottom: 5,
                            }}
                        >
                            <Input onChange={(e) => setNif(e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Nome"
                            name="nome"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor insira o nome.',
                                },
                            ]}
                            style={{
                                marginBottom: 5,
                            }}
                        >
                            <Input onChange={(e) => setNome(e.target.value)} />
                        </Form.Item>

                        <Form.Item
                            label="Apelido"
                            name="apelido"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor insira o apelifo.',
                                },
                            ]}
                        >
                            <Input
                                onChange={(e) => setApelido(e.target.value)}
                            />
                        </Form.Item>
                    </Flex>
                    <Flex gap="small" horizontal align="right">
                        <h2>Foto</h2>
                    </Flex>
                </Flex>

                <Flex gap="small" horizontal>
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                label: 'Endereço',
                                key: '1',
                                icon: <HomeFilled style={{ color: 'red' }} />,
                                children: (
                                    <Flex gap="small" horizontal>
                                        <Flex gap="smal" vertical>
                                            <Card
                                                bordered={true}
                                                style={{ width: 800 }}
                                            >
                                                <Combo
                                                    label="Pais"
                                                    name="paisEndereco"
                                                    value={paisEndereco}
                                                    required={false}
                                                    options={paisesOptions}
                                                    placeHolder="Seleccione o País"
                                                    onSelect={setPronvincia}
                                                    select={setPaisEndereco}
                                                />
                                                <Combo
                                                    label="Província"
                                                    name="provinciaEndereco"
                                                    value={provinciaEndereco}
                                                    required={false}
                                                    options={
                                                        pronvicaOptionsEndereco
                                                    }
                                                    placeHolder="Seleccione a Província"
                                                    onSelect={setMunicipio}
                                                    select={
                                                        setProvinciaEndereco
                                                    }
                                                />
                                                <Combo
                                                    label="Municipio"
                                                    name="municipioEndereco"
                                                    value={municipioEndereco}
                                                    required={false}
                                                    options={
                                                        municipioOptionsEndereco
                                                    }
                                                    placeHolder="Seleccione o Municipio"
                                                    select={
                                                        setMunicipioEndereco
                                                    }
                                                />

                                                <Form.Item
                                                    label="Bairro"
                                                    name="bairro"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                'Por favor insira o bairro.',
                                                        },
                                                    ]}
                                                    style={{
                                                        width: 750,
                                                    }}
                                                >
                                                    <Input
                                                        style={{ width: 250 }}
                                                    />
                                                </Form.Item>
                                            </Card>
                                        </Flex>
                                        <Flex
                                            gap="small"
                                            vertical
                                            style={{ marginLeft: 20 }}
                                        >
                                            *
                                        </Flex>
                                    </Flex>
                                ),
                            },
                            {
                                label: 'Informação Fiscal',
                                key: '2',
                                icon: <InfoCircleFilled />,
                                children: (
                                    <Card style={{ width: 800 }}>
                                        <Combo
                                            label="Profissões"
                                            name="profissao"
                                            value={profissao}
                                            required={false}
                                            options={Profissoes}
                                            placeHolder="Seleccione a Profissão"
                                            select={setProfissao}
                                            tipo={2}
                                        />
                                        <Combo
                                            label="Habilitação Literária"
                                            name="habilitacao"
                                            value={habilitacao}
                                            required={false}
                                            options={Habitacaoes}
                                            placeHolder="Seleccione a Habilitação"
                                            select={setHabilitacao}
                                            tipo={2}
                                        />
                                        <Combo
                                            label="Estado Civil"
                                            name="estadoCivil"
                                            value={estadoCivil}
                                            required={false}
                                            options={EstadoCivil}
                                            placeHolder="Seleccione o Estado Civil "
                                            select={setEstadoCivil}
                                            tipo={2}
                                        />
                                    </Card>
                                ),
                            },

                            {
                                label: 'Nascimento',
                                key: '4',
                                children: (
                                    <Card style={{ width: 800 }}>
                                        <Flex horizontal>
                                            <div
                                                style={{
                                                    marginRight: 30,
                                                }}
                                            >
                                                <Combo
                                                    label="Pais"
                                                    name="paisNascimento"
                                                    value={paisNascimento}
                                                    required={false}
                                                    options={paisesOptions}
                                                    placeHolder="Seleccione a nacionalidade"
                                                    onSelect={setPronvinciaNasc}
                                                    select={setPaisNascimento}
                                                />
                                                <Combo
                                                    label="Província"
                                                    name="provinciaNascimento"
                                                    value={provinciaNascimento}
                                                    required={false}
                                                    options={
                                                        pronvicaOptionsNascimento
                                                    }
                                                    placeHolder="Seleccione a província"
                                                    onSelect={setMunicipioNasc}
                                                    select={
                                                        setProvinciaNascimento
                                                    }
                                                />

                                                <Combo
                                                    label="Municipio"
                                                    name="municipioNascimento"
                                                    value={municipioNascimento}
                                                    required={false}
                                                    options={
                                                        municipioOptionsNascimento
                                                    }
                                                    placeHolder="Seleccione o municipio"
                                                    select={
                                                        setMunicipioNascimento
                                                    }
                                                />
                                                <Form.Item
                                                    label="Data"
                                                    name="dataNascimento"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                'Por favor seleccione a data de nascimento',
                                                        },
                                                    ]}
                                                    style={{
                                                        marginBottom: 5,
                                                        width: 300,
                                                    }}
                                                >
                                                    <DatePicker
                                                        placeholder="Select. a data de nascimento"
                                                        style={{ width: 200 }}
                                                        onChange={(
                                                            dateString
                                                        ) =>
                                                            setDataNascimento(
                                                                dateString
                                                            )
                                                        }
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    label="Local"
                                                    name="localNascimento"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                'Por favor digite a o local de nascimento',
                                                        },
                                                    ]}
                                                    style={{
                                                        marginBottom: 5,
                                                        width: 300,
                                                    }}
                                                >
                                                    <Input
                                                        style={{ width: 250 }}
                                                        placeHolder="Digite o local de nascimento"
                                                    />
                                                </Form.Item>
                                            </div>
                                            <div>
                                                <Combo
                                                    label="Nacionalidade"
                                                    name="nacionalidade"
                                                    value={nacionalidade}
                                                    required={false}
                                                    options={Nacionalidade}
                                                    placeHolder="Seleccione a nacionalidade"
                                                    select={setNacionalidade}
                                                    tipo={2}
                                                />

                                                <Combo
                                                    label="Sexo"
                                                    name="sexo"
                                                    value={sexo}
                                                    required={false}
                                                    options={Sexo}
                                                    placeHolder="Seleccione o sexo"
                                                    select={setSexo}
                                                    tipo={2}
                                                />
                                                <Combo
                                                    label="Raça/Cor"
                                                    name="raca"
                                                    value={raca}
                                                    required={false}
                                                    options={Raca}
                                                    placeHolder="Seleccione a Raça/Cor"
                                                    select={setRaca}
                                                    tipo={2}
                                                />

                                                <Form.Item
                                                    label="Pai"
                                                    name="pai"
                                                    style={{
                                                        marginBottom: 5,
                                                        width: 600,
                                                    }}
                                                >
                                                    <Input
                                                        style={{ width: 250 }}
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    label="Mãe"
                                                    name="mae"
                                                    style={{
                                                        marginBottom: 5,
                                                        width: 600,
                                                    }}
                                                >
                                                    <Input
                                                        style={{ width: 250 }}
                                                    />
                                                </Form.Item>
                                            </div>
                                        </Flex>
                                    </Card>
                                ),
                            },

                            {
                                label: 'Seguradora',
                                key: '5',
                                children: (
                                    <Card style={{ width: 800 }}>
                                        <Flex
                                            horizontal
                                            style={{ marginBottom: 10 }}
                                        >
                                            <Seguradora pacienteId={id} />
                                        </Flex>
                                    </Card>
                                ),
                            },
                        ]}
                    />
                </Flex>
            </Form>
        </Flex>
    );
}

export default Paciente;
