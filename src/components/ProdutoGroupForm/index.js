import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';
import './style.css';
import { api } from "../../service/api";

// Definindo o esquema de validação com Zod
const schema = z.object({
    designacaoProduto: z.string().min(2, { message: 'O tipo do produto deve ter pelo menos 2 caracteres.' }).max(60, { message: 'Seleciona um tipo valido.' }),
});

function ProdutoGroupForm({ buscarProdutosGrupos }) {
    const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
        resolver: zodResolver(schema),
    });
    const [props, setProps] = useState(false)
    var erros = [];
    const [errosNoFront, setErrosNoFront] = useState([]);
    const [modalIsOpenAddGroup, setModalIsOpenAddGroup] = useState(false);
    const [carregar, setCarregar] = useState(false);
    const currentProducts = {};
    const [produto, setProduto] = useState([]);
    const [statusSendEdit, setStatusSendEdit] = useState(false);
    const [id, setId] = useState(null);
    const [btnEnviar, setBtnEnviar] = useState("Adicionar");
    const [produtoRemover, setProdutoRemover] = useState(null);
    const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);

    const onAddNewGroup = async (data) => {
        let v = getValues("designacaoProduto")
        const dataToSubmit = { ...{}, designacaoProduto: v, id: id };
        // Se necessário, adicione campos extras
        console.log("Dados a serem enviados para o backend:", dataToSubmit);  // Verifique os dados enviados

        if (statusSendEdit == true) {
            const response = await api.put('productgroup/edit', dataToSubmit)
                .then((result) => {
                    setValue("designacaoProduto", "")
                    alert("Grupo do Produto Editado com Sucesso")
                    console.log("grupo produto Editado com sucesso")
                    for (let i = 0; i < erros.length; i++) {
                        erros.pop()
                    }
                    setErrosNoFront(erros)
                    buscarProdutosGrupos();
                    buscarProdutosGrupo();
                }).catch((error) => {
                    console.log("Erro ao Editar o grupo do produto")
                    erros.push("Erro ao Editar o grupo do produto")
                    setErrosNoFront(erros)
                })
        } else {
            const dataSubmit = { ...{}, designacaoProduto: v };
            const response = await api.post('productgroup/add', dataSubmit)
                .then((result) => {
                    setValue("designacaoProduto", "")
                    alert("Grupo do Produto Salvo com Sucesso")
                    console.log("grupo produto salvo com sucesso")
                    for (let i = 0; i < erros.length; i++) {
                        erros.pop()
                    }
                    setErrosNoFront(erros)
                    buscarProdutosGrupos();
                    buscarProdutosGrupo();
                }).catch((error) => {
                    console.log("Erro ao salvar o grupo do produto")
                    erros.push("Erro ao salvar o grupo do produto")
                    setErrosNoFront(erros)
                })
        }

    }

    const OpenGroup = () => {
        setModalIsOpenAddGroup(true)
        buscarProdutosGrupo()
    }

    const closeGroup = () => {
        setModalIsOpenAddGroup(false)
        setStatusSendEdit(false)
        setBtnEnviar("Adicionar")
        setValue("designacaoProduto", "")
    }

    const buscarProdutosGrupo = async () => {
        setCarregar(true);
        try {
            const result = await api.get('productgroup/all'); // Chamada para a rota 'produto/all'
            setProduto(result.data); // Armazena os produtos recebidos da API
            currentProducts = result.data;
        } catch (error) {
            console.log('Erro ao efetuar a chamada da API', error);
        } finally {
            setCarregar(false);
        }
    };

    const onEditar = (prod) => {
        setStatusSendEdit(true)
        setBtnEnviar("Editar Grupo")
        setId(prod.id);
        setValue("designacaoProduto", prod.designacaoProduto)
        for (let i = 0; i < erros.length; i++) {
            erros.pop();
        }
        setErrosNoFront(erros)
        buscarProdutosGrupo();
    }

    const onRemover = (data) => {
        setProdutoRemover(data);
        setModalIsOpenRemove(true);
    }

    const onConfirmar = async () => {
        const response = await api.delete('productgroup/' + produtoRemover.id)
            .then((result) => {
                console.log('O produto removido com sucesso!...', produtoRemover.id);
                buscarProdutosGrupo();
                setStatusSendEdit(false)
                setModalIsOpenRemove(false);

            }).catch((error) => {
                console.log("Erro ao remover o grupo")
                erros.push("Erro ao remover o grupo")
                alert("ERRO ao Deletar Grupo!")

            })
    }

    function onCancelar() {
        setModalIsOpenRemove(false);
    }

    const anularEnter = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();  // Anula a ação padrão
            console.log('Enter foi pressionado, mas o comportamento foi anulado.');
        }
    };

    const closeModalRemove = () => {
        setStatusSendEdit(false)
        setModalIsOpenRemove(false)
    };

    useEffect(() => {
        buscarProdutosGrupo(); // Busca os tipos de produtos
    }, []);
    return (
        <div>
            <button type="button" className="add-button" onClick={OpenGroup}>+</button>
            {/*MODAL DE ADICIONAR NOVO GRUPO DO PRODUTO*/}
            <Modal
                isOpen={modalIsOpenAddGroup}
                onRequestClose={closeGroup}
                className="modal-add-group-content"
                overlayClassName="modal-add-group-overlay"
            >
                <form onSubmit={handleSubmit(onAddNewGroup)}>
                    <h4><label label htmlFor="addProductGroup">Novo Grupo do Produto</label><br /></h4>
                    <div id='modal-group'>
                        {errosNoFront.map((e) => (
                            <li className='erros'>{e}</li>
                        ))}
                        <input type='text' placeholder='Aa...'
                            {...register('designacaoProduto')}
                            onKeyDown={anularEnter}
                            className={errors.designacaoProduto ? 'input-error' : ''}

                        />
                        {errors.designacaoProduto && <span className="error-message">{errors.designacaoProduto.message}</span>}
                        <br />
                        <button type='button' onClick={onAddNewGroup}>{btnEnviar}</button>
                    </div>

                    <Modal
                        isOpen={modalIsOpenRemove}
                        onRequestClose={closeModalRemove}
                        className="modal-remove-content"
                        overlayClassName="modal-remove-overlay"
                    > <h4>Deseja Remover Este Grupo do Produto?</h4>
                        <div id='remove-close-modal'>

                            <button onClick={onConfirmar}>Confirmar</button>
                            <button onClick={onCancelar}>Cancelar</button>
                        </div>

                    </Modal>

                    <div>

                        <table border="1" id='tabela'>
                            <caption>Grupos do Produtos</caption>
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
                                            <td>{produto.designacaoProduto}</td>

                                            <td>
                                                <button type='button' onClick={() => onEditar(produto)}>Editar</button>
                                                <button type='button' onClick={() => onRemover(produto)}>Remover</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7">Nenhum Grupo de produto encontrado</td></tr>
                                )}
                            </tbody>
                        </table>


                    </div>
                </form>

            </Modal>
        </div>
    );
}

export default ProdutoGroupForm;
