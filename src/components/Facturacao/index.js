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
import { viewPdf } from '../util/utilitarios';
import { Table, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined, DollarOutlined, XOutlined, CheckOutlined } from '@ant-design/icons';

Modal.setAppElement('#root');

function Facturacao() {
    const [linhasFactura, setlinhasFactura] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenGasto, setIsOpenGasto] = useState(false);
    const [artigos, setArtigos] = useState([]);
    const [fonteArtigos, setFonteArtigos] = useState([]);
    const [totalLiquido, setTotalLiquido] = useState(0);
    const [totalIva, setTotalIva] = useState(0);
    const [totalDesconto, setTotalDesconto] = useState(0);
    const [totalIliquido, setTotalIliquido] = useState(0);
    const [totalItens, setTotalItens] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = artigos.slice(indexOfFirstProduct, indexOfLastProduct);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        carregarArtigos();
    }, []);

    useEffect(() => {
        somaTotalIlqiuido();
        somaTotalIva();
        somaTotalDesconto();
        somaTotalLiquido();
        somaTotalItens();
    }, [linhasFactura]);

    async function carregarArtigos() {
        await carregarArtigosServer();
        setArtigos([...fonteArtigos]);
    }

    async function carregarArtigosServer() {
        await api
            .get('produto/all')
            .then((r) => {
                let dados = r.data;
                let newDados = dados.map((_item) => ({
                    id: _item.id,
                    designacao: _item.productDescription,
                    grupo: _item.productGroup,
                    qtd: 1,
                    preco: _item.preco,
                    iva: _item.taxIva,
                    desconto: 0,
                    subTotal: getSubTotal(_item),
                }));
                setFonteArtigos([...newDados]);
            })
            .catch(() => {});
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
        return linhasFactura.some((item) => item.id === id);
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
        setIsOpenGasto(true);
    };
    const closeModal = () => setIsOpen(false);
    const closeModalGasto = () => setIsOpenGasto(false);

    const buscaArtigo = (e) => {
        filtroArtigo(e.target.value);
    };

    function buscaArtigoById(id) {
        return fonteArtigos.find(item => item.id === id);
    }

    function filtroArtigo(value) {
        let newArray = fonteArtigos.filter((item) =>
            item.designacao.toLowerCase().includes(value.toLowerCase())
        );
        setArtigos([...newArray]);
    }

    function getValorFormatado(value) {
        return format(value, {
            locales: 'de-DE',
            format: 'currency',
            currency: 'AOA',
            maximumFractionDigits: 2,
        });
    }

    function getValorUnFormat(value) {
        return unformat(value, 'de-DE');
    }

    function novoSubTotal(item) {
        let valorDescontado = item.preco * item.qtd - item.desconto;
        let totalLiquido = valorDescontado + getValorIva(item.iva, valorDescontado);
        return getValorFormatado(totalLiquido);
    }

    function getSubTotal(item, newQtd, desconto) {
        let valorDescontado = getValorUnFormat(item.preco) * newQtd - desconto;
        let totalLiquido = valorDescontado + getValorIva(item.iva, valorDescontado);
        return getValorFormatado(totalLiquido);
    }

    function getValorIva(iva, valor) {
        return (valor * iva) / 100;
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

    function somaTotalIlqiuido() {
        if (linhasFactura.length === 0) {
            setTotalIliquido(0);
            return;
        }
        const total = linhasFactura.reduce((sum, item) => sum + item.qtd * getValorUnFormat(item.preco), 0);
        setTotalIliquido(getValorFormatado(total));
    }

    function somaTotalIva() {
        if (linhasFactura.length === 0) {
            setTotalIva(0);
            return;
        }
        const total = linhasFactura.reduce((sum, item) =>
            sum + getValorIva(item.iva, getValorUnFormat(item.preco) * item.qtd - item.desconto), 0);
        setTotalIva(getValorFormatado(total));
    }

    function somaTotalDesconto() {
        if (linhasFactura.length === 0) {
            setTotalDesconto(0);
            return;
        }
        const total = linhasFactura.reduce((sum, item) => sum + Number(item.desconto), 0);
        setTotalDesconto(getValorFormatado(total));
    }

    function somaTotalLiquido() {
        if (linhasFactura.length === 0) {
            setTotalLiquido(0);
            return;
        }
        const total = linhasFactura.reduce((sum, item) => sum + Number(getValorUnFormat(item.subTotal)), 0);
        setTotalLiquido(getValorFormatado(total));
    }

    function somaTotalItens() {
        if (linhasFactura.length === 0) {
            setTotalItens(0);
            return;
        }
        const total = linhasFactura.reduce((sum, item) => sum + Number(item.qtd), 0);
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
            creditAmount: Number(linha.qtd) * Number(getValorUnFormat(linha.preco)),
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
        let invoiceStatus = 'N';
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
                    let linhaConvertida = parseLine(linha, ++number, lastId, document.invoiceNo);
                    await salvarLinha(linhaConvertida);
                });
                viewPdf('invoice_A4', lastId);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div id="container-facturacao" className="container-facturacao">
            <div className="container-item"><FacturacaoHeader /></div>
            <div className="container-item"><FacturacaoConfig /></div>

            {/* BARRA DE AÇÕES */}
            <div className="container-item action-bar">
                <div className="numero-linhas">
                    Nº de Linhas: <strong>{linhasFactura.length}</strong>
                </div>
                <div className="action-buttons">
                    <button onClick={openModal} className="action-btn btn-search">
                        <SearchOutlined /> Buscar
                    </button>
                    <button onClick={newLine} className="action-btn btn-new">
                        <PlusOutlined /> Nova Linha
                    </button>
                    <button onClick={openModalGasto} className="action-btn btn-expense">
                        <DollarOutlined /> Gastos
                    </button>
                </div>
            </div>

            {/* FATURA VISUAL ÚNICA */}
            <div className="invoice-body">
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Designação</th>
                            <th>Qtd</th>
                            <th>Preço</th>
                            <th>IVA</th>
                            <th>Desconto</th>
                            <th>Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>

                <div className="invoice-footer">
                    <div className="invoice-totals">
                        <FacturacaoFooter
                            totalIliquido={totalIliquido}
                            totalIva={totalIva}
                            totalDesconto={totalDesconto}
                            totalLiquido={totalLiquido}
                            totalItens={totalItens}
                        />
                    </div>
                    <div className="invoice-payment-terms">
                        <label>Condições de pagamentos</label>
                    </div>
                </div>
            </div>

            {/* BOTÃO FINALIZAR */}
            <div className="finalize-container">
                <button onClick={salvarSourceDocument} className="finalize-btn">
                    <CheckOutlined /> Finalizar
                </button>
            </div>

            {/* MODAL BUSCA ARTIGO */}
            <Modal
                isOpen={isOpen}
                onAfterClose={closeModal}
                onRequestClose={closeModal}
                className="modal-content"
                overlayClassName="modal-overlay"
                closeTimeoutMS={481}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Pesquisar Artigo</h3>
                </div>

                <div className="modal-search-container">
                    <div className="modal-search-wrapper">
                        <SearchOutlined className="modal-search-icon" />
                        <input
                            type="text"
                            placeholder="Nome, código ou grupo..."
                            onChange={buscaArtigo}
                            className="modal-search-input"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="modal-body">
                    <Table
                        columns={columns}
                        dataSource={currentProducts.map((item) => ({
                            ...item,
                            key: item.id,
                            subTotal: novoSubTotal(item),
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
                </div>

                <div className="modal-pagination">
                    <Pagination
                        current={currentPage}
                        pageSize={productsPerPage}
                        total={artigos.length}
                        onChange={paginate}
                        showSizeChanger={false}
                    />
                </div>

                <button onClick={closeModal} className="modal-close-btn">
                    <XOutlined /> Fechar
                </button>
            </Modal>

            {/* MODAL GASTOS – DESIGN PREMIUM */}
            <Modal
                isOpen={isOpenGasto}
                onRequestClose={closeModalGasto}
                onAfterClose={closeModalGasto}
                className="modal-content"
                overlayClassName="modal-overlay"
                closeTimeoutMS={300}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Adicionar Gasto</h3>
                </div>

                <div className="modal-body gasto-modal-body">
                    <Gasto
                        newLineArtigo={newLineArtigo}
                        setIsOpenGasto={setIsOpenGasto}
                        getSubTotal={getSubTotal}
                    />
                </div>

                <button onClick={closeModalGasto} className="modal-close-btn">
                    <XOutlined /> Fechar
                </button>
            </Modal>
        </div>
    );
}

const columns = [
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    { title: 'Grupo', dataIndex: 'grupo', key: 'grupo' },
    { title: 'Preço', dataIndex: 'preco', key: 'preco' },
    { title: 'Taxa Iva', dataIndex: 'iva', key: 'iva' },
    { title: 'Preço c/Iva', dataIndex: 'subTotal', key: 'subTotal' },
];

export default Facturacao;