import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal'; // Importando a biblioteca react-modal
import './style.css';
import { api } from '../../../service/api';
import ProdutoTypeForm from '../ProdutoTypeForm';
import ProdutoGroupForm from '../ProdutoGroupForm';
import DynamicTable from '../../../components/DynamicTable';

// Definindo o esquema de validação com Zod
const schema = z.object({
    productType: z
        .string()
        .min(2, {
            message: 'O grupo do produto deve ter pelo menos 2 caracteres.',
        })
        .max(60, { message: 'Seleciona um tipo valido.' }),
    productCode: z
        .string()
        .min(3, {
            message: 'O código do produto deve ter entre 3 e 60 caracteres.',
        })
        .max(60),
    productGroup: z
        .string()
        .min(2, {
            message: 'O grupo do produto deve ter pelo menos 2 caracteres.',
        })
        .max(60),
    productNumberCode: z
        .string()
        .min(3, {
            message:
                'O número do código do produto deve ter entre 3 e 60 caracteres.',
        })
        .max(60),
    productDescription: z
        .string()
        .min(3, {
            message:
                'A descrição do produto deve ter entre 3 e 200 caracteres.',
        })
        .max(200),
    taxIva: z
        .string()
        .min(1, { message: 'Taxa do IVA obrigatória.' })
        .transform((val) => {
            const taxNumber = parseFloat(val);
            if (isNaN(taxNumber) || taxNumber <= 0) {
                console.log('A taxa do IVA deve ser um número maior que zero.');
            }
            return taxNumber;
        }),
    preco: z
        .string()
        .min(1, { message: 'O preço do produto deve ser maior que zero.' })
        .transform((val) => {
            const precoNumber = parseFloat(val);
            if (isNaN(precoNumber) || precoNumber <= 0) {
                console.log(
                    'O preço do produto deve ser um número maior que zero.'
                );
            }
            return precoNumber;
        }),
    status: z.boolean().refine((val) => typeof val === 'boolean', {
        message: 'O status deve ser um valor booleano.',
    }),
    newProductType: z
        .string()
        .min(2, {
            message: 'O tipo do produto deve ter pelo menos 2 caracteres.',
        })
        .max(60, { message: 'Seleciona um tipo valido.' }),

    newProductGroup: z
        .string()
        .min(2, {
            message: 'O grupo do produto deve ter pelo menos 2 caracteres.',
        })
        .max(60, { message: 'Seleciona um tipo valido.' }),
});

const ListarProduto = () => {
    //USE STATES
    const [carregar, setCarregar] = useState(false);
    const [gruposDeProduto, setGruposDeProduto] = useState([]);
    const [tipoProduto, setTipoProduto] = useState([]);
    const [produto, setProduto] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
    const [modalIsOpenAddGroup, setModalIsOpenAddGroup] = useState(false);
    const [statusSendEdit, setStatusSendEdit] = useState(false);
    const [id, setId] = useState(null);
    const [btnEnviar, setBtnEnviar] = useState('Cadastrar Produto');
    const [errosNoFront, setErrosNoFront] = useState([]);
    var erros = [];
    const [produtoRemover, setProdutoRemover] = useState(null);
    const [idType, setIdType] = useState(null);
    const [idGroup, setIdGroup] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
    } = useForm({
        resolver: zodResolver(schema),
    });

    // Função para buscar produtos
    const buscarProdutos = async () => {
        setCarregar(true);
        try {
            const result = await api.get('produto/all'); // Chamada para a rota 'produto/all'
            setProduto(result.data); // Armazena os produtos recebidos da API
        } catch (error) {
            console.log('Erro ao efetuar a chamada da API', error);
            erros.push('Erro Interno do Servidor');
        } finally {
            setCarregar(false);
        }
    };

    // Função para buscar grupos de produtos (exemplo de outra API)
    const buscarProdutosGrupos = async () => {
        setCarregar(true);
        try {
            const result = await api.get('productgroup/all');
            const grupos = [
                ...new Set(
                    result.data.map((produto) => produto.designacaoProduto)
                ),
            ];
            setIdGroup([...new Set(result.data.map((produto) => produto.id))]);

            setGruposDeProduto(grupos);
        } catch (error) {
            console.log(
                'Erro ao efetuar a chamada da API para grupos de produtos',
                error
            );
            erros.push('Erro Interno do Servidor');
        } finally {
            setCarregar(false);
        }
    };

    // Função para buscar tipos de produtos (exemplo de outra API)
    const buscarTiposProduto = async () => {
        setCarregar(true);
        try {
            const result = await api.get('producttype/all');
            const tipos = [
                ...new Set(
                    result.data.map((produto) => produto.designacaoTipoProduto)
                ),
            ];
            setIdType([...new Set(result.data.map((produto) => produto.id))]);
            setTipoProduto(tipos);
            console.log(tipos);
        } catch (error) {
            console.log(
                'Erro ao efetuar a chamada da API para tipos de produtos',
                error
            );
            erros.push('Erro Interno do Servidor');
        } finally {
            setCarregar(false);
        }
    };

    useEffect(() => {
        buscarProdutos(); // Busca os produtos ao carregar o componente
        buscarProdutosGrupos(); // Busca os grupos de produtos
        buscarTiposProduto(); // Busca os tipos de produtos
    }, []);

    // Função para envio de dados do formulário
    const onSubmit = async (data) => {
        var t = getValues('productType');
        var g = getValues('productGroup');
        var p = getValues('preco');
        var i = getValues('taxIva');
        var c = getValues('productCode');
        var nc = getValues('productNumberCode');
        var d = getValues('productDescription');

        const dataToSubmit = {
            ...{},
            status: true,
            productType: t,
            productGroup: g,
            preco: p,
            taxIva: i,
            productNumberCode: nc,
            productDescription: d,
            productCode: c,
        };
        console.log('Dados a serem enviados para o backend:', dataToSubmit); // Verifique os dados enviados

        if (statusSendEdit === false) {
            const response = await api
                .post('produto/add', dataToSubmit)
                .then((result) => {
                    buscarProdutos();
                    setModalIsOpen(false);
                })
                .catch((error) => {
                    console.log('Erro ao salvar o produto');
                    erros.push('Erro ao salvar o produto');
                    setErrosNoFront(erros);
                });
        } else {
            const dataSubmit = {
                ...{},
                status: true,
                id: id,
                productType: t,
                productGroup: g,
                preco: p,
                taxIva: i,
                productNumberCode: nc,
                productDescription: d,
                productCode: c,
            };
            const response = await api
                .put('produto/edit', dataSubmit)
                .then((result) => {
                    console.log('Dados Editados com sucess!...');
                    buscarProdutos();
                    setModalIsOpen(false);
                    setStatusSendEdit(false);
                    alert('Produto Editado com Sucesso');
                })
                .catch((error) => {
                    console.log('Erro ao Editar o produto', error);
                    erros.push('Erro ao Editar o produto');
                    setErrosNoFront(erros);
                });
        }
    };

    // Funções para abrir e fechar o modal
    const openModal = () => {
        setValue('productType', '');
        setValue('productGroup', '');
        setValue('productCode', '');
        setValue('productDescription', '');
        setValue('productNumberCode', '');
        setValue('taxIva', ''); // Converte o número para string
        setValue('preco', '');
        setBtnEnviar('Cadastrar Produto');
        setModalIsOpen(true);
        setStatusSendEdit(false);
    };
    const closeModal = () => setModalIsOpen(false);

    const closeModalRemove = () => setModalIsOpenRemove(false);

    const closeModalGroup = () => setModalIsOpenAddGroup(false);

    //REMOVER PRODUTO DA TABELA
    const onRemover = async (data) => {
        setProdutoRemover(data);
        setModalIsOpenRemove(true);
    };

    //EDITAR O PRODUTO DA TABELA
    const onEditar = (prod) => {
        setStatusSendEdit(true);
        setBtnEnviar('Editar Produto');
        setId(prod.id);
        setValue('productType', prod.productType);
        setValue('productGroup', prod.productGroup);
        setValue('productCode', prod.productCode);
        setValue('productDescription', prod.productDescription);
        setValue('productNumberCode', prod.productNumberCode);
        setValue('taxIva', prod.taxIva.toString()); // Converte o número para string
        setValue('preco', prod.preco.toString());
        setModalIsOpen(true);
        for (let i = 0; i < erros.length; i++) {
            erros.pop();
        }
        setErrosNoFront(erros);
    };

    //BOTÃO DE CONFIRMAÇÃO DE ELIMANAÇÃO DE PRODUTO

    const onConfirmar = async (data) => {
        const dataSubmit = {
            ...produtoRemover,
            status: false,
            id: produtoRemover.id,
        };
        const response = await api
            .put('produto/del', dataSubmit)
            .then((result) => {
                console.log('O produto removido com sucesso!...', dataSubmit);
                buscarProdutos();
                setModalIsOpen(false);
                setStatusSendEdit(false);
                setModalIsOpenRemove(false);
            })
            .catch((error) => {
                console.log('Erro ao remover o produto ');
                erros.push('Erro ao remover o produto');
                alert('ERRO ao Deletar Produto!');
            });
    };

    function onCancelar() {
        setModalIsOpenRemove(false);
    }

    return (
        <div>
            <div>
                {/*Tabela De Produtos*/}
                <div>
                    <DynamicTable
                        data={produto}
                        onEdit={onEditar}
                        onDelete={onRemover}
                        className="my-custom-table"
                        headers={{
                            id: 'id',
                            productCode: 'Codigo do Produto',
                            productDescription: 'Descrição do Produto',
                            productGroup: 'Grupo  do Produto',
                            productNumberCode: 'Número de Codigo do Produto',
                            productType: 'Tipo do Produto',
                            taxIva: 'Taxa do IVA',
                            preco: 'Preço',
                        }}
                        onRowClick={setSelectedRow} // Passamos a função para capturar o clique na linha
                        showActions={false}
                    />
                </div>
            </div>
            {/* Exibir os dados capturados */}
            {selectedRow && (
                <div>
                    <h3>Dados da Linha Selecionada:</h3>
                    <p>
                        <strong>descricao:</strong>{' '}
                        {selectedRow.productDescription}
                    </p>
                    <p>
                        <strong>codigo:</strong> {selectedRow.productCode}
                    </p>
                </div>
            )}

            <Modal
                isOpen={modalIsOpenRemove}
                onRequestClose={closeModalRemove}
                className="modal-remove-content"
                overlayClassName="modal-remove-overlay"
            >
                {' '}
                <h4>Deseja Remover Este Produto?</h4>
                <div id="remove-close-modal">
                    <button onClick={onConfirmar}>Confirmar</button>
                    <button onClick={onCancelar}>Cancelar</button>
                </div>
            </Modal>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Formulário de Produto"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <button onClick={closeModal} id="close-button">
                    X
                </button>
                <h2>Cadastro de Produto</h2>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="produto-form"
                >
                    {errosNoFront.map((e, i) => (
                        <ul id="errosNoFront">
                            <li key={i}>{e}</li>
                        </ul>
                    ))}
                    {/* Tipo de Produto */}
                    <div className="input-group">
                        <label htmlFor="productType">Tipo de Produto</label>

                        <div className="select-container">
                            <select
                                id="productType"
                                {...register('productType')}
                                className={
                                    errors.productType ? 'input-error' : ''
                                }
                            >
                                <option value="">
                                    Selecione o Tipo do Produto
                                </option>
                                {tipoProduto.map((tipo, index) => (
                                    <option key={index} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>

                            {/* Botões alinhados à direita */}
                            <div className="action-buttons">
                                <ProdutoTypeForm
                                    buscarTiposProduto={buscarTiposProduto}
                                />
                            </div>
                        </div>

                        {/* Mensagem de erro (se houver) */}
                        {errors.productType && (
                            <span className="error-message">
                                {errors.productType.message}
                            </span>
                        )}
                    </div>

                    {/* Grupo do Produto */}
                    <div className="input-group">
                        <label htmlFor="productGroup">Grupo do Produto</label>

                        <div className="select-container">
                            <select
                                id="productGroup"
                                {...register('productGroup')}
                                className={
                                    errors.productGroup ? 'input-error' : ''
                                }
                            >
                                <option value="">Selecione um Grupo</option>
                                {gruposDeProduto.map((grupo, index) => (
                                    <option key={index} value={grupo}>
                                        {grupo}
                                    </option>
                                ))}
                            </select>

                            {/* Botões alinhados à direita */}
                            <div className="action-buttons">
                                <ProdutoGroupForm
                                    buscarProdutosGrupos={buscarProdutosGrupos}
                                />
                            </div>
                        </div>

                        {/* Mensagem de erro (se houver) */}
                        {errors.productGroup && (
                            <span className="error-message">
                                {errors.productGroup.message}
                            </span>
                        )}
                    </div>

                    {/* Código do Produto */}
                    <div className="input-group">
                        <label htmlFor="productCode">Código do Produto</label>
                        <input
                            type="text"
                            id="productCode"
                            {...register('productCode')}
                            className={errors.productCode ? 'input-error' : ''}
                        />
                        {errors.productCode && (
                            <span className="error-message">
                                {errors.productCode.message}
                            </span>
                        )}
                    </div>

                    {/* Descrição do Produto */}
                    <div className="input-group">
                        <label htmlFor="productDescription">
                            Descrição do Produto
                        </label>
                        <input
                            type="text"
                            id="productDescription"
                            {...register('productDescription')}
                            className={
                                errors.productDescription ? 'input-error' : ''
                            }
                        />
                        {errors.productDescription && (
                            <span className="error-message">
                                {errors.productDescription.message}
                            </span>
                        )}
                    </div>

                    {/* Número do Código */}
                    <div className="input-group">
                        <label htmlFor="productNumberCode">
                            Número do Código
                        </label>
                        <input
                            type="text"
                            id="productNumberCode"
                            {...register('productNumberCode')}
                            className={
                                errors.productNumberCode ? 'input-error' : ''
                            }
                        />
                        {errors.productNumberCode && (
                            <span className="error-message">
                                {errors.productNumberCode.message}
                            </span>
                        )}
                    </div>

                    {/* Preço */}
                    <div className="input-group">
                        <label htmlFor="preco">Preço</label>
                        <input
                            type="text"
                            id="preco"
                            {...register('preco')}
                            className={errors.preco ? 'input-error' : ''}
                        />
                        {errors.preco && (
                            <span className="error-message">
                                {errors.preco.message}
                            </span>
                        )}
                    </div>

                    {/* Taxa de IVA */}
                    <div className="input-group">
                        <label htmlFor="taxIva">Taxa de IVA</label>
                        <input
                            type="text"
                            id="taxIva"
                            {...register('taxIva')}
                            className={errors.taxIva ? 'input-error' : ''}
                        />
                        {errors.taxIva && (
                            <span className="error-message">
                                {errors.taxIva.message}
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <div className="input-group">
                        <label htmlFor="status"></label>
                        <input
                            type="checkbox"
                            id="status"
                            {...register('status')}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-button"
                            id="submit"
                            onClick={onSubmit}
                        >
                            {btnEnviar}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ListarProduto;
