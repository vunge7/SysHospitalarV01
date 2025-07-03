import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';
import './style.css';
import { api } from "../../service/api";

// Definindo o esquema de validação com Zod
const schema = z.object({
    designacaoTipoProduto: z.string().min(2, { message: 'O tipo do produto deve ter pelo menos 2 caracteres.' }).max(60, { message: 'Seleciona um tipo valido.' }),
});

function ProdutoTypeForm({ buscarTiposProduto }) {
    const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
        resolver: zodResolver(schema),
    });
    const [props, setProps] = useState(false)
    var erros = [];
    const [errosNoFront, setErrosNoFront] = useState([]);
    const [modalIsOpenAddType, setModalIsOpenAddType] = useState(false);
    const [carregar, setCarregar] = useState(false);
    const currentProducts = {};
    const [produto, setProduto] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [statusSendEdit, setStatusSendEdit] = useState(false);
    const [id, setId] = useState(null);
    const [btnEnviar, setBtnEnviar] = useState("Adicionar");
    const [produtoRemover, setProdutoRemover] = useState(null);


    const onAddNewType = async (data) => {
        var v = getValues("designacaoTipoProduto")
        const dataToSubmit = { ...{}, designacaoTipoProduto: v, id: id };
        // Se necessário, adicione campos extras
        console.log("Dados a serem enviados para o backend:", dataToSubmit);  // Verifique os dados enviados

        if (statusSendEdit == true) {
            //EDITAR
            const response = await api.put('producttype/edit', dataToSubmit)
                .then((result) => {
                    setValue("designacaoTipoProduto", "")
                    alert("Tipo do Produto Eeditado com Sucesso")
                    console.log("tipo produto Editado com sucesso")
                    for (let i = 0; i < erros.length; i++) {
                        erros.pop()
                    }

                    setErrosNoFront(erros)
                    buscarTiposProduto()
                    buscarTiposProdutos()
                }).catch((error) => {
                    console.log("Erro ao Editar o tipo produto")
                    erros.push("Erro ao Editar o tipo produto")
                    setErrosNoFront(erros)
                })
            //ADICIONAR
        } else {
            const dataSubmit = { ...{}, designacaoTipoProduto: v };
            const response = await api.post('producttype/add', dataSubmit)
                .then((result) => {
                    setValue("designacaoTipoProduto", "")
                    alert("Tipo do Produto Salvo com Sucesso")
                    console.log("tipo produto salvo com sucesso")
                    for (let i = 0; i < erros.length; i++) {
                        erros.pop()
                    }
                    setErrosNoFront(erros)
                    buscarTiposProduto()
                    buscarTiposProdutos()
                }).catch((error) => {
                    console.log("Erro ao salvar o tipo produto")
                    erros.push("Erro ao salvar o tipo produto")
                    setErrosNoFront(erros)
                })
        }

    }

    const OpenType = () => {
        setModalIsOpenAddType(true)
        buscarTiposProdutos();
    }

    const closeType = () => {
        setModalIsOpenAddType(false);
        setStatusSendEdit(false);
        setModalIsOpenRemove(false);
        setBtnEnviar("Adicionar");
        setValue("designacaoTipoProduto", "");
    }

    const buscarTiposProdutos = async () => {
        setCarregar(true);
        try {
            const result = await api.get('producttype/all'); // Chamada para a rota 'produto/all'
            setProduto(result.data); // Armazena os produtos recebidos da API
            currentProducts = result.data;
        } catch (error) {
            console.log('Erro ao efetuar a chamada da API', error);
        } finally {
            setCarregar(false);
        }
    };

    const onRemover = async (data) => {
        setProdutoRemover(data);
        setModalIsOpenRemove(true);

    };

    const onEditar = (prod) => {
        setStatusSendEdit(true)
        setBtnEnviar("Editar Produto")
        setId(prod.id);
        setValue("designacaoTipoProduto", prod.designacaoTipoProduto)
        setModalIsOpen(true);
        for (let i = 0; i < erros.length; i++) {
            erros.pop();
        }
        setErrosNoFront(erros)
        buscarTiposProdutos()
    };

    const onConfirmar = async () => {
        const response = await api.delete('producttype/' + produtoRemover.id)
            .then((result) => {
                console.log('O produto removido com sucesso!...', produtoRemover.id);
                buscarTiposProdutos();
                setStatusSendEdit(false)
                setModalIsOpenRemove(false);

            }).catch((error) => {
                console.log("Erro ao remover o produto ")
                erros.push("Erro ao remover o produto")
                alert("ERRO ao Deletar Produto!")

            })
    }

    function onCancelar() {
        setModalIsOpenRemove(false);
    }

    const closeModalRemove = () => {
        setModalIsOpenRemove(false)
    };

    const anularEnter = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();  // Anula a ação padrão
          console.log('Enter foi pressionado, mas o comportamento foi anulado.');
        }
      };

    useEffect(() => {
        buscarTiposProdutos(); // Busca os tipos de produtos
    }, []);
    return (
        <div>
            <button type="button" className="add-button" onClick={OpenType}>+</button>
            {/*MODAL DE ADICIONAR NOVO TIPO DO PRODUTO*/}
            <Modal
                isOpen={modalIsOpenAddType}
                onRequestClose={closeType}
                className="modal-add-type-content"
                overlayClassName="modal-add-type-overlay"
            >
                <form onSubmit={handleSubmit(onAddNewType)}>
                    <h4><label label htmlFor="addProductType">Novo Tipo do Produto</label><br /></h4>
                    <div id='modal-type'>
                        {errosNoFront.map((e) => (
                            <li className='erros'>{e}</li>
                        ))}
                        <input type='text' placeholder='Aa...'
                            {...register('designacaoTipoProduto')}
                          onKeyDown={anularEnter}
                            className={errors.designacaoTipoProduto ? 'input-error' : ''}

                        />
                        {errors.designacaoTipoProduto && <span className="error-message">{errors.designacaoTipoProduto.message}</span>}
                        <br />
                        <button type='button' onClick={onAddNewType}>{btnEnviar}</button>
                    </div>

                    <Modal
                        isOpen={modalIsOpenRemove}
                        onRequestClose={closeModalRemove}
                        className="modal-remove-content"
                        overlayClassName="modal-remove-overlay"
                    > <h4>Deseja Remover Este Tipo de Produto?</h4>
                        <div id='remove-close-modal'>

                            <button onClick={onConfirmar}>Confirmar</button>
                            <button onClick={onCancelar}>Cancelar</button>
                        </div>

                    </Modal>

                    <div>

                        <table border="1">
                            <caption>Tipos de Produtos</caption>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>designação do Produto</th>
                                    <th>Alterações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produto.length > 0 ? (
                                    produto.map((produto, index) => (
                                        <tr key={index}>
                                            <td>{produto.id}</td>
                                            <td>{produto.designacaoTipoProduto}</td>

                                            <td>
                                                <button onClick={() => onEditar(produto)} type='button'>Editar</button>
                                                <button onClick={() => onRemover(produto)} type='button'>Remover</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7">Nenhum tipo de produto encontrado</td></tr>
                                )}
                            </tbody>
                        </table>


                    </div>
                </form>

            </Modal>
        </div>
    );
}

export default ProdutoTypeForm;
