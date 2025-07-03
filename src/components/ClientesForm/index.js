import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';  // Importando a biblioteca react-modal
import './style.css';
import { api } from "../../service/api";
import DynamicTable from '../DynamicTable';
 
// Definindo o esquema de validação com Zod
const schema = z.object({
    dataCadastro: z.string().min(2, { message: ' Data Cadastro deve ter pelo menos 2 caracteres.' }).max(60, { message: 'Seleciona um tipo valido.' }),
    nif:z.string().min(9, { message: 'O NIF deve ter 9 caracteres.' }).max(9),
    status: z.boolean().refine(val => typeof val === 'boolean', {
    message: 'O status deve ser um valor booleano.',
  }),
});


const Clientes = () => {

  //USE STATES
  const [cliente, setcliente] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState("Cadastrar cliente");
  const [errosNoFront, setErrosNoFront] = useState([]);
   const [carregar, setCarregar] = useState(false);
  var erros = [];
  var d = {};
  const [clienteRemover, setclienteRemover] = useState(null);

  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    resolver: zodResolver(schema),
  });

  // Função para buscar produtos
  const buscarcliente = async () => {
    setCarregar(true);
    try {
      const result = await api.get('clientes/all'); // Chamada para a rota 'cliente/all'
      setcliente(result.data); // Armazena os produtos recebidos da API
    } catch (error) {
      console.log('Erro ao efetuar a chamada da API', error);
      erros.push("Erro Interno do Servidor");
    } finally {
      setCarregar(false);
    }
  };

  useEffect(() => {
    buscarcliente(); // Busca os produtos ao carregar o componente
  }, []);

  // Função para envio de dados do formulário
  const onSubmit = async (data) => {
    var c = getValues("dataCadastro")
    var n = getValues("nif")
  
    const dataToSubmit = { ...{}, status: true, dataCadastro: c,nif: n,};  // Se necessário, adicione campos extras
    console.log("Dados a serem enviados para o backend:", dataToSubmit);  // Verifique os dados enviados

    if (statusSendEdit == false) {
      const response = await api.post('clientes/add', dataToSubmit)
        .then((result) => {
          buscarcliente();
          setModalIsOpen(false);
        })
        .catch((error) => {
          console.log("Erro ao salvar o cliente")
          erros.push("Erro ao salvar o cliente")
          setErrosNoFront(erros);
        })
    } else {
      const dataSubmit = { ...{}, status: true, dataCadastro: c,nif: n, id:id};
      const response = await api.put('clientes/edit', dataSubmit)
        .then((result) => {
          console.log('Dados Editados com sucess!...');
          buscarcliente();
          setModalIsOpen(false);
          setStatusSendEdit(false)
          alert("Cliente Editado com Sucesso")
        })
        .catch((error) => {
          console.log("Erro ao Editar o cliente", error);
          erros.push("Erro ao Editar o cliente");
          setErrosNoFront(erros);
        })
    }
  };

  // Funções para abrir e fechar o modal
  const openModal = () => {
    setValue("dataCadastro", "");
    setValue("nif", "");
    setBtnEnviar("Cadastrar cliente")
    setModalIsOpen(true)
    setStatusSendEdit(false)
  };
  const closeModal = () => setModalIsOpen(false);

  const closeModalRemove = () => setModalIsOpenRemove(false);

  //REMOVER PRODUTO DA TABELA
  const onRemover = async (data) => {
    setclienteRemover(data);
    setModalIsOpenRemove(true);

  };

  //EDITAR O PRODUTO DA TABELA
  const onEditar = (cli) => {
    setStatusSendEdit(true)
    setBtnEnviar("Editar cliente")
    setId(cli.id);
    setValue("dataCadastro", cli.dataCadastro);
    setValue("nif", cli.nif);
    setModalIsOpen(true);
    for (let i = 0; i < erros.length; i++) {
      erros.pop();
    }
    setErrosNoFront(erros)
  };

  //BOTÃO DE CONFIRMAÇÃO DE ELIMANAÇÃO DE PRODUTO

  const onConfirmar = async (data) => {
    console.log(d)
    const dataSubmit = { ...clienteRemover, status: false, id: clienteRemover.id };
    const response = await api.put('clientes/del', dataSubmit)
      .then((result) => {
        console.log('O cliente removido com sucesso!...', dataSubmit);
        buscarcliente();
        setModalIsOpen(false);
        setStatusSendEdit(false)
        setModalIsOpenRemove(false);


      }).catch((error) => {
        console.log("Erro ao remover o cliente ", d.id)
        erros.push("Erro ao remover o cliente")
        alert("ERRO ao Deletar cliente!")

      })
  }

  function onCancelar() {
    setModalIsOpenRemove(false);
  }

  return (
    <div>
      <button onClick={openModal} className="toggle-button">+</button>

      <div>
      <DynamicTable
            data={cliente}
            onEdit={onEditar}
            onDelete={onRemover}
            className="my-custom-table"
          />
      </div>

      <Modal
        isOpen={modalIsOpenRemove}
        onRequestClose={closeModalRemove}
        className="modal-remove-content"
        overlayClassName="modal-remove-overlay"
      > <h4>Deseja cliente Este Produto?</h4>
        <div id='remove-close-modal'>

          <button onClick={onConfirmar}>Confirmar</button>
          <button onClick={onCancelar}>Cancelar</button>
        </div>

      </Modal>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Formulário de cliente"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} id='close-button'>X</button>
        <h2>Cadastro de Cliente</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="produto-form">
          {errosNoFront.map((e, i) => (
            <ul id='errosNoFront'>
              <li key={i}>{e}</li>
            </ul>
          ))}
          {/* dataCadastro*/}
          <div className="input-group">
            <label htmlFor="dataCadastro">dataCadastro</label>
            <input
              type="text"
              id="dataCadastro"
              {...register('dataCadastro')}
              className={errors.dataCadastro ? 'input-error' : ''}
            />
            {errors.dataCadastro && <span className="error-message">{errors.dataCadastro.message}</span>}
          </div>

          {/* nif */}
          <div className="input-group">
            <label htmlFor="nif">nif</label>
            <input
              type="text"
              id="nif"
              {...register('nif')}
              className={errors.nif? 'input-error' : ''}
            />
            {errors.nif && <span className="error-message">{errors.nif.message}</span>}
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button" id='submit' onClick={onSubmit}>{btnEnviar}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
