import './style.css';
import { api } from '../../service/api';
import { useEffect, useState } from 'react';

export default function Gasto(props) {
    const [gastos, setGastos] = useState([]);
    const [linhasGasto, setLinhasGasto] = useState([]);

    useEffect(() => {
        carregarGastos();
    }, []);

    const carregarGastos = async () => {
        await api
            .get('gasto/all')
            .then((r) => {
                setGastos([...r.data]);
                console.log(r.data);
            })
            .catch((e) => {
                console.log('Falha ao carregar os dados');
            });
    };

    const carregarLinhasGasto = async (gastoId) => {
        await api
            .get('linhagasto/gasto/' + gastoId)
            .then((r) => {
                setLinhasGasto([...r.data]);
            })
            .catch((e) => {
                console.log('Falha ao buscar as linhas dos gasto');
            });

        //console.log('ID GASTO = ' + gastoId);
    };

    const exportar = (e) => {
        e.preventDefault();
        linhasGasto.map(async (item) => {
            let artigo;
            await api
                .get('produto/' + item.servicoId)
                .then((r) => {
                    console.log(r.data);
                    let _item = r.data;
                    let item = {
                        id: _item.id,
                        designacao: _item.productDescription,
                        grupo: _item.productGroup,
                        qtd: 1,
                        preco: _item.preco,
                        iva: _item.taxIva,
                        desconto: 0,
                        subTotal: props.getSubTotal(_item),
                    };
                    artigo = item;
                })
                .catch((r) => {
                    console.log('Falha ao buscar o artigo');
                });

            props.newLineArtigo(artigo);
        });
        props.setIsOpenGasto(false);
    };

    const Linha = (props) => {
        const [nome, setNome] = useState('');

        useEffect(() => {
            paciente(props.item.inscricaoId);
        }, []);

        async function paciente(id) {
            await api
                .get('/inscricao/' + id)
                .then((r) => {
                    let dados = r.data;
                    setNome(dados.nome);
                })
                .catch((e) => {
                    console.log('Falha ao fazer a busca  pelo ID do gasto');
                });
        }

        return (
            <>
                <div
                    style={{
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <strong>{props.item.id}</strong>
                    <span>{nome}</span>
                </div>

                <button
                    style={{
                        width: '50%',
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        props.carregarLinhasGasto(props.item.id);
                        console.log('Clicado o gasto');
                    }}
                >
                    detalhe
                </button>
            </>
        );
    };

    return (
        <div className="container-gasto">
            <div className="container-gasto-item">
                {gastos.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <Linha
                            item={item}
                            carregarLinhasGasto={carregarLinhasGasto}
                        />
                    </div>
                ))}
            </div>
            <div className="container-gasto-item">
                <div>
                    <button onClick={exportar}>exportar</button>
                </div>
                {linhasGasto.map((item) => (
                    <div key={item.id}>
                        <span>{item.servicoId}</span>
                        <span>{item.servicoDescricao}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
