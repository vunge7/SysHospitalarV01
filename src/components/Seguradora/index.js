import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { api } from '../../service/api';
import { format as dateFormat, formatDate } from 'date-fns';

/**
 * 2. clientes
 * @returns
 */

export default function Seguradora(props) {
    const [fonteSeguradora, setFonteSeguradora] = useState([]);

    const [seguradoras, setSeguradoras] = useState([]);
    const [seguradoraId, setSeguradoraId] = useState(0);
    const [pacienteSeguradora, setPacienteSeguradora] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        carregarSeguradoras();
    }, []);

    useEffect(() => {
        carregarPacienteSeguradoras();
    }, [props.pacienteId]);

    async function carregarSeguradorasServer() {
        await api
            .get('seguradora/all')
            .then((r) => {
                console.log(r.data);
                let dados = r.data;
                let tempArray = dados.map((_item) => {
                    let item = {
                        id: _item.id,
                        nome: _item.nome,
                    };
                    return item;
                });

                setFonteSeguradora([...tempArray]);
            })
            .catch((e) => {
                console.log('Erro a carregar as seguradoras');
            });
    }

    async function carregarPacienteSeguradoras() {
        await api
            .get('pacienteSeguradora/all/' + props.pacienteId)
            .then((r) => {
                let newArray = r.data;
                console.log(newArray);

                setPacienteSeguradora([...newArray]);
                console.log('Dados' + r.data);
            })
            .catch((e) => {
                setPacienteSeguradora([]);
            });
    }

    async function carregarSeguradoras() {
        await carregarSeguradorasServer();
        let array = fonteSeguradora;
        setSeguradoras([...array]);
    }

    async function salvarPacienteSeguradora(seguradoraId) {
        let pacienteSeguradora = {
            dataCricao: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            dataActualizacao: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            usuarioIdCricao: 1,
            usuarioIdAtualizacao: 1,
            seguradoraId: seguradoraId,
            pacienteId: props.pacienteId,
        };

        await api
            .post('pacienteSeguradora/add', pacienteSeguradora)
            .then((r) => {
                carregarPacienteSeguradoras();
                console.log('dados salvos com sucesso');
            })
            .catch((e) => {
                console.log('Erro a registrar a associação.');
            });
    }

    const onClickHandle = async (e) => {
        e.preventDefault();
        await carregarSeguradorasServer();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const buscaSeguradoraById = (id) => {
        return fonteSeguradora.filter((item) => item.id === id)[0];
    };

    const findSeguradoraById = (id) => {
        let { nome } = fonteSeguradora.filter((item) => item.id === id)[0];
        console.log(nome);
        return nome;
    };

    const handleRemover = async (id) => {
        await api
            .delete('pacienteSeguradora/' + id)
            .then((r) => {
                carregarPacienteSeguradoras();
                console.log('seguradora removida com sucesso!..');
            })
            .catch((e) => {
                console.log('erro ao remover a seguradora');
            });
    };

    const buscaSeguradora = (e) => {
        filtroSeguradora(e.target.value);
    };

    /**Função filtro */
    function filtroSeguradora(value) {
        /**Faz o filtro  na fonte pelas inicias do artigos Obs: criar um array novo.*/
        let newArray = fonteSeguradora.filter((item) =>
            item.nome.toLowerCase().includes(value.toLowerCase())
        );
        setSeguradoras([
            ...newArray,
        ]); /**Actualiza os artigos em função da busca do ususário */
    }

    function Seguradora(props) {
        return (
            <tr
                className="tr"
                onClick={async () => {
                    console.log(props.pacienteId);
                    let seguradora = buscaSeguradoraById(props.id);

                    setSeguradoraId(props.id);
                    console.log(seguradora);
                    // newLineArtigo(artigo);
                    await salvarPacienteSeguradora(props.id);
                    closeModal();
                }}
            >
                <td className="td">{props.id}</td>
                <td className="td">{props.nome}</td>
            </tr>
        );
    }

    return (
        <div>
            <div>
                <button onClick={onClickHandle}>Adicionar</button>
                <table className="table">
                    <thead className="thead">
                        <tr>
                            <th className="th">id</th>
                            <th className="th">Seguradora</th>
                            <th className="th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacienteSeguradora.map((item) => (
                            <tr className="tr" key={item.id}>
                                <td className="td">{item.id}</td>
                                <td className="td">
                                    {findSeguradoraById(item.seguradoraId)}
                                </td>
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemover(item.id);
                                        }}
                                    >
                                        Remover
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isOpen}
                onAfterClose={closeModal}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        width: '60%',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    },
                }}
            >
                <input
                    type="text"
                    onChange={buscaSeguradora}
                    style={{ marginBottom: '20px' }}
                />

                <div>
                    <table className="table">
                        <thead className="thead">
                            <tr>
                                <th className="th">ID</th>
                                <th className="th">Seguradora</th>
                            </tr>
                        </thead>
                        <tbody className="tbody">
                            {seguradoras.map((item) => (
                                <Seguradora
                                    key={item.id}
                                    id={item.id}
                                    nome={item.nome}
                                    pacienteId={props.pacienteId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={closeModal}>close</button>
            </Modal>
        </div>
    );
}
