import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { api } from '../../../service/api';

Modal.setAppElement('#receiturario');
export default function BuscaArtigo(props) {
    const [isOpen, setIsOpen] = useState(true);
    const [fonteArtigos, setFonteArtigos] = useState([]); /**lista do backend.*/
    const [artigos, setArtigos] = useState(
        []
    ); /** lista actual em função da pesquisa do usuário*/

    useEffect(() => {
        carregarArtigos(); //carrega os artigos para ser usado na pesquisa
    }, []);

    async function carregarArtigos() {
        await carregarArtigosServer();
        let array = fonteArtigos;
        setArtigos([...array]);
    }

    async function carregarArtigosServer() {
        await api
            .get('produto/all')
            .then((r) => {
                let dados = r.data;
                let newDados = dados.map((_item) => {
                    let item = {
                        id: _item.id,
                        designacao: _item.productDescription,
                        grupo: _item.productGroup,
                    };
                    return item;
                });

                setFonteArtigos([...newDados]);
                // console.log(newDados);
            })
            .catch((e) => {});
    }

    const closeModal = () => setIsOpen(false);

    const buscaArtigo = (e) => {
        console.log(e.target.value);
        filtroArtigo(e.target.value);
    };

    function buscaArtigoById(id) {
        return fonteArtigos.filter((item) => item.id === id)[0];
    }

    /**Função filtro */
    function filtroArtigo(value) {
        /**Faz o filtro  na fonte pelas inicias do artigos Obs: criar um array novo.*/
        let newArray = fonteArtigos.filter((item) =>
            item.designacao.toLowerCase().includes(value.toLowerCase())
        );
        setArtigos([
            ...newArray,
        ]); /**Actualiza os artigos em função da busca do ususário */
    }

    /**Componente interno para ser usado no modal da pesquisa */
    function Artigo(props) {
        return (
            <tr
                className="tr"
                onClick={() => {
                    console.log(props.designacao);
                    let artigo = buscaArtigoById(props.id);
                    // console.log(artigo);
                    //newLineArtigo(artigo);
                    closeModal();
                }}
            >
                <td className="td">{props.designacao}</td>
                <td className="td">{props.grupo}</td>
                <td className="td">{props.preco}</td>
                <td className="td">{props.iva}</td>
                <td className="td">{props.subTotal}</td>
            </tr>
        );
    }

    return (
        <div>
            Busca Artigo
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
                    onChange={buscaArtigo}
                    style={{ marginBottom: '20px' }}
                />
                <div>
                    <table className="table">
                        <thead className="thead">
                            <tr>
                                <th className="th">Designação</th>
                                <th className="th">Grupo</th>
                                <th className="th">Preço</th>
                                <th className="th">Taxa Iva</th>
                                <th className="th">Preço c/Iva</th>
                            </tr>
                        </thead>

                        <tbody className="tbody">
                            {artigos.map((item) => (
                                <Artigo
                                    key={item.id}
                                    id={item.id}
                                    designacao={item.designacao}
                                    grupo={item.grupo}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={closeModal} style={{ marginTop: '20px' }}>
                    Fechar
                </button>
            </Modal>
        </div>
    );
}
