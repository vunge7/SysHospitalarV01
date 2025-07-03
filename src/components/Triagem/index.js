import { useEffect, useState } from 'react';

/**UI LIBRARY */
import Box from '@mui/material/Box';
import api from '../../service/api';
/**UTIL LIBRARY */
import { format, differenceInMinutes } from 'date-fns';
import TriagemManchester from '../TriagemManchester';

import SinaisVitais from '../SinaisVitais';

/** PRIME LIBRARY */
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

export default function Triagem(props) {
    /**DADOS DOS SINAIS VITAIS */
    const [pressaArterial, setPressaoAterial] = useState();
    const [peso, setPeso] = useState();
    const [temperatura, setTemperatura] = useState();
    const [pulso, setPulso] = useState();
    const [so, setSo] = useState();
    const [respiracao, setRespiracao] = useState();
    const [dor, setDor] = useState();

    /**OUTROS CAMPOS */
    const [inscricoes, setInscricoes] = useState([]);
    const [selectedInscricao, setSelectedInscricao] = useState('');
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState('right');
    const [loading, setLoading] = useState(false);
    const [tempo, setTempo] = useState(0);

    useEffect(() => {
        loadingInscricoes();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            //updateTempo();
            setTempo(tempo + 1);
            updateTempo();

            //loadingInscricoes();
            //console.log(listaTemp);
        }, 1000);

        //console.log("Time: " +tempo)
    }, [tempo]);

    function updateTempo() {
        const array = inscricoes;
        array.map((item, index) => {
            let diff = dateDifference(new Date(item.dataCriacao), new Date());
            // console.log('Tempo: ' +  item.dataCriacao);
            item.tempo = diff;
            return item;
        });

        //setListaTemp(array);
    }

    function dateDifference(data1, data2) {
        const result = differenceInMinutes(
            new Date(
                data2.getYear(),
                data2.getMonth(),
                data2.getDate(),
                data2.getHours(),
                data2.getMinutes(),
                data2.getSeconds()
            ),
            new Date(
                data1.getYear(),
                data1.getMonth(),
                data1.getDate(),
                data1.getHours(),
                data1.getMinutes(),
                data1.getSeconds()
            )
        );

        return result;
    }

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

    function getLinhasTriagem(id) {
        let _linhas = [];
        _linhas.push(getItem(id, 'Pressão Arterial', pressaArterial, 'Un.'));
        _linhas.push(getItem(id, 'Peso', peso, 'Kg'));
        _linhas.push(getItem(id, 'Temperatura', temperatura, 'C'));
        _linhas.push(getItem(id, 'Pulso', pulso, 'C'));
        _linhas.push(getItem(id, 'Saturação de Oxigênio', so, 'Un.'));
        _linhas.push(getItem(id, 'Respiração', respiracao, 'Un.'));
        _linhas.push(getItem(id, 'Dor', dor, 'Un.'));
        return _linhas;
    }

    const show = (position) => {
        setPosition(position);
        setVisible(true);
    };

    const salvar = async () => {
        setLoading(true);
        const triagem = {
            dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            fkInscricao: selectedInscricao.inscricaoId,
            fkUser: 1,
        };
        await api
            .post('triagem/add', triagem)
            .then(async (r) => {
                const id = r.data.id;
                console.log(id);
                let _linhasTriagem = getLinhasTriagem(id);
                console.log(_linhasTriagem);
                await api
                    .post('linha-triagem/add/all', _linhasTriagem)
                    .then((r) => {
                        // console.log(r.data);
                        //    console.log('Triagem efectuada com sucesso.');
                        setLoading(false);
                        setVisible(false);
                        setSelectedInscricao('');
                        limparCampos();
                    })
                    .catch((e) => {
                        setLoading(false);
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            });
    };

    const limparCampos = () => {
        setPressaoAterial('');
        setTemperatura('');
        setPeso('');
        setSo('');
        setPulso('');
        setDor('');
        setRespiracao('');
    };

    const footerContent = (
        <div>
            <Button
                label="Finalizar Triagem"
                icon="pi pi-check"
                size="small"
                severity="primary"
                loading={loading}
                className="mr-2"
                raised
                onClick={() => {
                    salvar();
                }}
                autoFocus
            />
            <Button
                label="Fechar"
                icon="pi pi-times"
                size="small"
                className="mt-2"
                severity="danger"
                raised
                onClick={() => {
                    setVisible(false);
                    setSelectedInscricao('');
                }}
            />
        </div>
    );

    async function loadingInscricoes() {
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
                setInscricoes(data);
                //setListaTemp(inscricoes);
            })
            .catch((e) => {
                console.log(e);
            });
    }

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold">
                Doentes Inscritos
            </span>
        </div>
    );

    const tempoEspero = (data) => {
        const dataActual = new Date();
        //  new Date(2014, 6, 2, 12, 20, 0)
        const result = differenceInMinutes(
            //new Date(data.getYear(), data.getMonth(), data.getDate(), data.getHours(), data.getMinutes(), data.getSeconds()),
            new Date(2024, 9, 9, 9, 21, 0),
            new Date()
        );

        return result;
    };

    return (
        <Box
            sx={{
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                textAlign: 'center',
                marginLeft: '10px',
            }}
        >
            <div className="flex flex-row">
                <Button
                    label="Actualizar"
                    size="small"
                    severity="primary"
                    className="flex align-items-center justify-content-center mr-2 mb-4"
                    icon="pi pi-sync"
                    raised
                />

                <Button
                    label="Paciente Triados"
                    size="small"
                    severity="primary"
                    className="flex align-items-center justify-content-center mb-4"
                    icon="pi pi-sync"
                    raised
                />

                <TriagemManchester selectedInscricao={selectedInscricao} />
            </div>

            <div className="card">
                <DataTable
                    value={inscricoes}
                    size="small"
                    header={header}
                    onClick={() => show('right')}
                    tableStyle={{ minWidth: '50rem' }}
                    selectionMode="single"
                    selection={selectedInscricao}
                    onSelectionChange={(e) => {
                        setSelectedInscricao(e.value);
                    }}
                    style={{ width: 'auto' }}
                >
                    <Column field="inscricaoId" header="Inscr. No."></Column>
                    <Column
                        field="dataCriacao"
                        header="Data de Inscrição"
                    ></Column>
                    <Column field="pacienteId" header="Ficha No."></Column>
                    <Column field="nomeCompleto" header="Doente"></Column>
                    <Column field={'tempo'} header="Tempo de Espera"></Column>
                </DataTable>
            </div>

            <SinaisVitais
                pressaArterial={pressaArterial}
                setPressaoAterial={setPressaoAterial}
                peso={peso}
                setPeso={setPeso}
                temperatura={temperatura}
                setTemperatura={setTemperatura}
                pulso={pulso}
                setPulso={setPulso}
                so={so}
                setSo={setSo}
                respiracao={respiracao}
                setRespiracao={setRespiracao}
                dor={dor}
                setDor={setDor}
                visible={visible}
                position={position}
                footerContent={footerContent}
                selectedInscricao={selectedInscricao}
            />
        </Box>
    );
}
