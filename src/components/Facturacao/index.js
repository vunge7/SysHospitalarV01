import React, { useEffect, useState } from 'react';

import Modal from 'react-modal';
import { format, unformat } from '@react-input/number-format';
import FacturacaoHeader from '../FacturacaoHeader';
import FacturacaoConfig from '../FacturacaoConfig';
import FacturacaoLinha from '../FacturacaoLinha';
import FacturacaoFooter from '../FacturacaoFooter';
import Gasto from '../Gasto';
import './style.css';
import { api } from '../../service/api';
import { format as dateFormat, formatDate } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { viewPdf } from '../util/utilitarios';
import { Table, Pagination } from 'antd';

const options = { locales: 'en', maximumFractionDigits: 2 };
Modal.setAppElement('#root');

function Facturacao() {
    const [linhasFactura, setlinhasFactura] = useState(
        []
    ); /**Linhas da factura a ser processada */
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenGasto, setIsOpenGasto] = useState(false);
    const [artigos, setArtigos] = useState(
        []
    ); /** lista actual em função da pesquisa do usuário*/
    const [fonteArtigos, setFonteArtigos] = useState([]); /**lista do backend.*/
    const [totalLiquido, setTotalLiquido] = useState(0);
    const [totalIva, setTotalIva] = useState(0);
    const [totalDesconto, setTotalDesconto] = useState(0);
    const [totalIliquido, setTotalIliquido] = useState(0);
    const [totalItens, setTotalItens] = useState(0);
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5; // Número de produtos por página

    // Função de Paginação
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    const currentProducts = artigos.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        carregarArtigos(); //carrega os artigos para ser usado na pesquisa
    }, []);

    useEffect(() => {
        // console.log(linhasFactura); //carrega os artigos para ser usado na pesquisa
        somaTotalIlqiuido();
        somaTotalIva();
        somaTotalDesconto();
        somaTotalLiquido();
        somaTotalItens();
    }, [linhasFactura]);

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
                        qtd: 1,
                        preco: _item.preco,
                        iva: _item.taxIva,
                        desconto: 0,
                        subTotal: getSubTotal(_item),
                    };
                    return item;
                });

                setFonteArtigos([...newDados]);
                // console.log(newDados);
            })
            .catch((e) => {});
    }

    const newLine = () => {
        let itens = linhasFactura;
        let item = {
            id: linhasFactura.length + 1,
            designacao: 'New Produto',
            qtd: 1,
            preco: 100,
            iva: 7,
            desconto: 0,
            subTotal: 100.0,
        };

        itens.push(item);
        setlinhasFactura([...itens]);
    };

    function newLineArtigo(artigo) {
        if (!existeItem(artigo.id)) {
            let itens = linhasFactura;
            let item = {
                id: artigo.id,
                designacao: artigo.designacao,
                qtd: 1,
                preco: getValorFormatado(artigo.preco),
                iva: artigo.iva,
                desconto: 0,
                //subTotal: getSubTotal(artigo),
                subTotal: novoSubTotal(artigo),
            };

            itens.push(item);
            setlinhasFactura([...itens]);
        }
    }

    const updateItem = (id, qtd, desconto) => {
        setlinhasFactura((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          qtd: qtd,
                          desconto: desconto,
                          subTotal: getSubTotal(item, qtd, desconto),
                      }
                    : item
            )
        );
    };

    const existeItem = (id) => {
        console.log('ID: ' + id);
        let existe = linhasFactura.some((item) => item.id === id);
        return existe;
    };

    const removerItem = (id) => {
        setlinhasFactura((prevItens) =>
            prevItens.filter((item) => item.id !== id)
        );
    };

    const openModal = () => {
        carregarArtigos();
        setIsOpen(true);
    };
    const openModalGasto = () => {
        // carregarArtigos();
        setIsOpenGasto(true);
    };
    const closeModal = () => setIsOpen(false);
    const closeModalGasto = () => setIsOpenGasto(false);

    const buscaArtigo = (e) => {
        console.log(e.target.value);
        filtroArtigo(e.target.value);
    };

    function buscaArtigoById(id) {
        return fonteArtigos.filter((item) => item.id === id)[0];
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
                    newLineArtigo(artigo);
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

    /**Função que retorna o valor formatado de 1500.00 para AOA 1,500.00*/
    function getValorFormatado(value) {
        // locales={['ban', 'id']}
        return format(value, {
            locales: 'de-DE',
            format: 'currency',
            currency: 'AOA',
            maximumFractionDigits: 2,
        });
    }
    /**Função que faz a operação inversa da formatação. Ex: A0A 1,500.00 para 1500.00 */
    function getValorUnFormat(value) {
        return unformat(value, 'de-DE');
    }

    /**Função que retorna o total de uma determinada linha */
    function novoSubTotal(item) {
        let valorDescontado = item.preco * item.qtd - item.desconto;
        let totalLiquido =
            valorDescontado + getValorIva(item.iva, valorDescontado);
        return getValorFormatado(totalLiquido);
    }

    /**Função que retorna o total de uma determinada linha  com os valores pré-definidos*/
    function getSubTotal(item, newQtd, desconto) {
        let valorDescontado = getValorUnFormat(item.preco) * newQtd - desconto;
        let totalLiquido =
            valorDescontado + getValorIva(item.iva, valorDescontado);
        return getValorFormatado(totalLiquido);
    }

    function getValorIva(iva, valor) {
        let valorIva = (valor * iva) / 100;
        return valorIva;
    }

    function isZero(value) {
        if (Number(value) === 0) {
            alert('O valor não poder ser igual a zero(0)');
            return true;
        }
        return false;
    }

    function isMenorQueZero(value) {
        if (value < 0) {
            alert('o Valor não poder ser negativo');
            return true;
        }
        return false;
    }

    /**Soma Total Iliquidos */
    function somaTotalIlqiuido() {
        if (linhasFactura.length === 0) {
            setTotalIliquido(0);
        }
        const total = Object.values(linhasFactura).reduce(
            (sum, item) => sum + item.qtd * getValorUnFormat(item.preco),
            0
        );
        setTotalIliquido(getValorFormatado(total));
    }

    /**Soma Total do Iva */
    function somaTotalIva() {
        if (linhasFactura.length === 0) {
            setTotalIva(0);
        }
        const total = Object.values(linhasFactura).reduce(
            (sum, item) =>
                sum +
                getValorIva(
                    item.iva,
                    getValorUnFormat(item.preco) * item.qtd - item.desconto
                ),
            0
        );
        setTotalIva(getValorFormatado(total));
    }

    function somaTotalDesconto() {
        if (linhasFactura.length === 0) {
            setTotalDesconto(0);
        }
        const total = Object.values(linhasFactura).reduce(
            (sum, item) => sum + Number(item.desconto),
            0
        );
        setTotalDesconto(getValorFormatado(total));
    }

    function somaTotalLiquido() {
        if (linhasFactura.length === 0) {
            setTotalLiquido(0);
        }
        const total = Object.values(linhasFactura).reduce(
            (sum, item) => sum + Number(getValorUnFormat(item.subTotal)),
            0
        );

        console.log('TotalLiquido: ' + getValorFormatado(total));
        setTotalLiquido(getValorFormatado(total));
    }

    function somaTotalItens() {
        if (linhasFactura.length === 0) {
            setTotalItens(0);
        }
        const total = Object.values(linhasFactura).reduce(
            (sum, item) => sum + Number(item.qtd),
            0
        );

        console.log('TotalLiquido: ' + getValorFormatado(total));
        setTotalItens(total);
    }

    async function salvarLinha(line) {
        await api
            .post('line/add', line)
            .then((result) => {
                console.log('Linha criada com sucesso!...');
            })
            .catch((error) => {
                console.log('Falha ao salvar a linha', error);
            });
    }

    const parseLine = (linha, number, sourceDocumentId, reference) => {
        //console.log(number);
        let line = {
            lineNumber: number,
            productCode: linha.id,
            productDescription: linha.designacao,
            quantity: linha.qtd,
            unitOfMeasure: 'Un',
            unitPrice: getValorUnFormat(linha.preco),
            taxBase: Number(linha.qtd) * Number(getValorUnFormat(linha.preco)),
            taxPointDate: formatDate(new Date(), 'yyyy-MM-dd'),
            reference: reference,
            description: linha.designacao,
            debitAmount: 0.0,
            creditAmount:
                Number(linha.qtd) * Number(getValorUnFormat(linha.preco)),
            taxType: 'IVA',
            taxCountryRegion: 'AOA',
            taxCode: 'NOR',
            taxPercentage: linha.iva,
            taxAmount: 0.0,
            taxExceptionReason: '',
            taxExceptionCode: '',
            sourceDocumentId: sourceDocumentId,
            lineDiscount: linha.desconto,
            lineTotal: getValorUnFormat(linha.subTotal),
        };
        return line;
    };

    async function salvarSourceDocument() {
        let invoiceType = 'FT';
        let invoiceNo = invoiceType + ' 2024/1';
        let invoiceStatus = 'N'; //Normal
        let invoiceStatusDate = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let sourceId = 'user.dvml';
        let sourceBilling = 'P';
        let hash = '';
        let hashControl = '1.0';
        let invoiceDate = formatDate(new Date(), 'yyyy-MM-dd');
        let selfBillingIndicator = 0;
        let cashVatschemeIndicator = '1';
        let systemEntryDate = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let thirdPartiesBillingIndicator = '0';
        let taxPayable = getValorUnFormat(totalIva);
        let netTotal = getValorUnFormat(totalIliquido);
        let grossTotal = Number(taxPayable) + Number(netTotal);
        let discountTotal = getValorUnFormat(totalDesconto);
        let customerId = 1;

        let document = {
            invoiceNo: invoiceNo,
            invoiceStatus: invoiceStatus,
            invoiceStatusDate: invoiceStatusDate,
            sourceId: sourceId,
            sourceBilling: sourceBilling,
            hash: hash,
            hashControl: hashControl,
            invoiceDate: invoiceDate,
            invoiceType: invoiceType,
            selfBillingIndicator: selfBillingIndicator,
            cashVatschemeIndicator: cashVatschemeIndicator,
            thirdPartiesBillingIndicator: thirdPartiesBillingIndicator,
            systemEntryDate: systemEntryDate,
            taxPayable: taxPayable,
            netTotal: netTotal,
            grossTotal: grossTotal,
            discountTotal: discountTotal,
            customerId: customerId,
        };

        await api
            .post('sourceDocument/add/last', document)
            .then((r) => {
                var number = 0;
                var lastId = r.data.id;
                linhasFactura.map(async (linha) => {
                    let linhaConvertida = parseLine(
                        linha,
                        ++number,
                        lastId,
                        document.invoiceNo
                    );
                    // console.log(linhaConvertida);
                    await salvarLinha(linhaConvertida);
                });
                viewPdf('invoice_A4', lastId);
                //generatePDF();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /**Renderização do componente 'Facturacao' */
    return (
        <div id="container-facturacao" className="container-facturacao">
            <div className="container-item">
                <FacturacaoHeader />
            </div>
            <div className="container-item">
                <FacturacaoConfig />
            </div>
            <div className="container-item">
                <div className="numero-linhas">
                    Nº de Linhas: <strong>{linhasFactura.length}</strong>
                </div>
                <div>
                    <button onClick={openModal}>busca</button>
                    <button onClick={newLine}>Nova Linha</button>
                    <button onClick={openModalGasto}>Gastos</button>
                </div>
            </div>
            <div className="container-item">
                {linhasFactura.map((item) => (
                    <FacturacaoLinha
                        key={item.id}
                        id={item.id}
                        designacao={item.designacao}
                        preco={item.preco}
                        qtd={item.qtd}
                        desconto={item.desconto}
                        iva={item.iva}
                        subTotal={item.subTotal}
                        updateItem={updateItem}
                        removerItem={removerItem}
                        isZero={isZero}
                        isMenorQueZero={isMenorQueZero}
                    />
                ))}
            </div>
            <div className="container-item">
                <hr />
            </div>
            <div className="container-item">
                <FacturacaoFooter
                    totalIliquido={totalIliquido}
                    totalIva={totalIva}
                    totalDesconto={totalDesconto}
                    totalLiquido={totalLiquido}
                    totalItens={totalItens}
                />
            </div>

            <div className="container-item">
                <label>Condições de pagamentos</label>
            </div>
            <div className="container-item">
                <button onClick={salvarSourceDocument}>Finalizar</button>
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
                    onChange={buscaArtigo}
                    style={{ marginBottom: '20px' }}
                />
                <div>
                    <Table
                        columns={columns}
                        dataSource={currentProducts.map((item) => ({
                            ...item,
                            key: item.id,
                            subTotal: novoSubTotal(item, 1, 0),
                        }))}
                        pagination={false}
                        onRow={(record) => ({
                            onClick: () => {
                                let artigo = buscaArtigoById(record.id);
                                newLineArtigo(artigo);
                                closeModal();
                            },
                            style: { cursor: 'pointer' },
                        })}
                        locale={{ emptyText: 'Nenhum produto encontrado' }}
                        size="small"
                    />
                    <div
                        className="pagination"
                        style={{ marginTop: 16, textAlign: 'center' }}
                    >
                        <Pagination
                            current={currentPage}
                            pageSize={productsPerPage}
                            total={artigos.length}
                            onChange={paginate}
                            showSizeChanger={false}
                        />
                    </div>
                </div>
                <button onClick={closeModal} style={{ marginTop: '20px' }}>
                    Fechar
                </button>
            </Modal>

            <Modal
                isOpen={isOpenGasto}
                onAfterClose={closeModalGasto}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        width: 'auto', // ajuste conforme necessário
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    },
                }}
            >
                <Gasto
                    newLineArtigo={newLineArtigo}
                    setIsOpenGasto={setIsOpenGasto}
                    getSubTotal={getSubTotal}
                />
                <button onClick={closeModalGasto} style={{ marginTop: '20px' }}>
                    Fechar
                </button>
            </Modal>
        </div>
    );
}

const columns = [
    {
        title: 'Designação',
        dataIndex: 'designacao',
        key: 'designacao',
    },
    {
        title: 'Grupo',
        dataIndex: 'grupo',
        key: 'grupo',
    },
    {
        title: 'Preço',
        dataIndex: 'preco',
        key: 'preco',
    },
    {
        title: 'Taxa Iva',
        dataIndex: 'iva',
        key: 'iva',
    },
    {
        title: 'Preço c/Iva',
        dataIndex: 'subTotal',
        key: 'subTotal',
    },
];

export default Facturacao;
