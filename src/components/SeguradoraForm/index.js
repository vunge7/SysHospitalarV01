import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';
import './style.css';
import { api } from "../../service/api";
import DynamicTable from '../DynamicTable';


// Definindo o esquema de validação com Zod para Seguradora
const schema = z.object({
  nome: z.string().min(2, { message: 'O nome da seguradora deve ter pelo menos 2 caracteres.' }).max(60),
  nif: z.string().min(9, { message: 'O NIF deve ter 9 caracteres.' }).max(9),
  telefone: z.string().min(9, { message: 'O telefone deve ter 9 caracteres.' }).max(15),
});

const SeguradoraForm = () => {
  const [carregar, setCarregar] = useState(false);
  const [seguradoras, setSeguradoras] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState("Cadastrar Seguradora");
  const [seguradoraRemover, setSeguradoraRemover] = useState(null);
  var erros = [];

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  // Função para buscar seguradoras
  const buscarSeguradoras = async () => {
    setCarregar(true);
    try {
      const result = await api.get('seguradora/all');
      setSeguradoras(result.data);
    } catch (error) {
      console.log('Erro ao buscar seguradoras', error);
    } finally {
      setCarregar(false);
    }
  };

  useEffect(() => {
    buscarSeguradoras(); // Busca as seguradoras ao carregar o componente
  }, []);

  // Função para envio de dados do formulário
  const onSubmit = async (data) => {
    const dataToSubmit = { ...data, status: true };

    if (statusSendEdit === false) {
      await api.post('seguradora/add', dataToSubmit)
        .then(() => {
          buscarSeguradoras();
          setModalIsOpen(false);
        })
        .catch(() => {
          console.log("Erro ao salvar a seguradora");
        });
    } else {

      const dataSubmit = { ...data, id:id };
      await api.put('seguradora/edit', dataSubmit)
        .then(() => {
          buscarSeguradoras();
          setModalIsOpen(false);
          setStatusSendEdit(false);
          
        console.log("Editado com Sucesso...", dataSubmit)
        alert("Seguradora Editada Com Sucesso")
        })
        .catch(() => {
          console.log("Erro ao editar a seguradora");
          alert("FALHA ao Editar Seguradora")
        });
    }
  };

  // Funções para abrir e fechar o modal
  const openModal = () => {
    setValue("nome", "");
    setValue("nif", "");
    setValue("telefone", "");
    setBtnEnviar("Cadastrar Seguradora");
    setModalIsOpen(true);
    setStatusSendEdit(false);
  };

  const closeModal = () => setModalIsOpen(false);
  const closeModalRemove = () => setModalIsOpenRemove(false);

  // Funções para editar e remover seguradoras
  const onRemover = async (seguradora) => {
    setSeguradoraRemover(seguradora);
    setModalIsOpenRemove(true);
  };

  const onEditar = (seguradora) => {
    setStatusSendEdit(true);
    setBtnEnviar("Editar Seguradora");
    setId(seguradora.id);
    setValue("nome", seguradora.nome);
    setValue("nif", seguradora.nif);
    setValue("telefone", seguradora.telefone);
    setModalIsOpen(true);

  };

  
  const onConfirmar = async(data) =>{
    const dataSubmit = { ...seguradoraRemover, status: false, id:seguradoraRemover.id}; 
    const response = await api.put('seguradora/del',dataSubmit)
    .then((result)=>{
    console.log('Seguradora removido com sucesso!...', dataSubmit);
    buscarSeguradoras();
    setModalIsOpen(false);
    setStatusSendEdit(false)
    setModalIsOpenRemove(false);
  
    
  }).catch((error)=>{
    console.log("Erro ao remover a Seguradora ", seguradoraRemover.id)
    erros.push("Erro ao remover a Seguradora")
    alert("ERRO ao Deletar a Sguradora!")
    
  })
  };

  const onCancelar = () => {
    setModalIsOpenRemove(false);
  };

  return (
    <div>
      <button onClick={openModal} className="toggle-button">+</button>

      <div>
      <DynamicTable
            data={seguradoras}
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
      >
        <h4>Deseja Remover Esta Seguradora?</h4>
        <div id='remove-close-modal'>
          <button onClick={onConfirmar}>Confirmar</button>
          <button onClick={onCancelar}>Cancelar</button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Formulário de Seguradora"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} id="close-button">X</button>
        <h2>Cadastro de Seguradora</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="seguradora-form">
          {/* Nome */}
          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              {...register('nome')}
              className={errors.nome ? 'input-error' : ''}
            />
            {errors.nome && <span className="error-message">{errors.nome.message}</span>}
          </div>

          {/* NIF */}
          <div className="input-group">
            <label htmlFor="nif">NIF</label>
            <input
              type="text"
              id="nif"
              {...register('nif')}
              className={errors.nif ? 'input-error' : ''}
            />
            {errors.nif && <span className="error-message">{errors.nif.message}</span>}
          </div>

          {/* Telefone */}
          <div className="input-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="text"
              id="telefone"
              {...register('telefone')}
              className={errors.telefone ? 'input-error' : ''}
            />
            {errors.telefone && <span className="error-message">{errors.telefone.message}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" id='submit'>{btnEnviar}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SeguradoraForm;
