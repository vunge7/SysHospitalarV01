import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';
import './style.css';
import { api } from "../../service/api";
import DynamicTable from '../DynamicTable';


// Definindo o esquema de validação com Zod para Filial
const schema = z.object({
  nome: z.string().min(2, { message: 'O nome da Filial deve ter pelo menos 2 caracteres.' }).max(60),
  nomeComercial: z.string().min(2, { message: 'O nome da Filial deve ter pelo menos 2 caracteres.' }).max(60),
  sedeNome: z.string().min(2, { message: 'O nome da Filial deve ter pelo menos 2 caracteres.' }).max(60),
  nif: z.string().min(9, { message: 'O NIF deve ter 9 caracteres.' }).max(9),
  endereco: z.string().min(1, { message: 'Prience o campo endereço.' }).max(50),
  telefone: z.string().min(9, { message: 'O telefone deve ter 9 caracteres.' }).max(15),

  sedeId: z.string().min(1, { message: 'Id da sede é obrigatorio.' }).transform(val => {
     const sedNumber = parseInt(val);
     if (isNaN(sedNumber) || sedNumber <= 0) {
       console.log('O Id da Sede de ser maior que Zero (0).');
     }
     return sedNumber;
   }),

   longitude: z.string().min(1, { message: 'Longitude  é obrigatorio.' }).transform(val => {
    const longNumber = parseFloat(val);
    if (isNaN(longNumber) || longNumber <= 0) {
      console.log('A Longitude deve ser maior que Zero (0).');
    }
    return longNumber;

    }),

    latitude: z.string().transform(val => {
        const latiNumber = parseFloat(val);
        if (isNaN(latiNumber) || latiNumber <= 0) {
        console.log('A latitude deve ser maior que Zero (0).');
        }
        return latiNumber;
    })

})

const FilialForm = () => {
  const [carregar, setCarregar] = useState(false);
  const [filial, setFilial] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState("Cadastrar Filial");
  const [filialRemover, setFilialRemover] = useState(null);
  var erros = [];

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  // Função para buscar Empresa
  const buscarFilial = async () => {
    setCarregar(true);
    try {
      const result = await api.get('filial/all');
      setFilial(result.data);
      console.log(result.data)
    } catch (error) {
      console.log('Erro ao buscar Filial', error);
    } finally {
      setCarregar(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            setValue("latitude", position.coords.latitude.toString());
            setValue("longitude",  position.coords.longitude.toString());
        },
        (error) => {
          console.error('Erro ao obter a localização:', error.message);
        }
      );
    } else {
      console.error('Geolocalização não é suportada neste navegador.');
    }
  };
  useEffect(() => {
    buscarFilial(); // Busca as Empresa ao carregar o componente
  }, []);

  // Função para envio de dados do formulário
  const onSubmit = async (data) => {
    const dataToSubmit = { ...data, status: true };

    if (statusSendEdit === false) {
      await api.post('filial/add', dataToSubmit)
        .then(() => {
          buscarFilial();
          setModalIsOpen(false);
          console.log("Dados a serem enviados: ", dataToSubmit);
        })
        .catch(() => {
          console.log("Erro ao salvar Filial");
        });
    } else {

      const dataSubmit = { ...data, id:id };
      await api.put('filial/edit', dataSubmit)
        .then(() => {
          buscarFilial();
          setModalIsOpen(false);
          setStatusSendEdit(false);
          
        console.log("Editado com Sucesso...", dataSubmit)
        alert("Filial Editada Com Sucesso")
        })
        .catch(() => {
          console.log("Erro ao editar a Filial", dataSubmit);
          alert("FALHA ao Editar Filial")
        });
    }
  };

  // Funções para abrir e fechar o modal
  const openModal = () => {
    getLocation();
    setValue("nome", "");
    setValue("nomeComercial", "");
    setValue("sedeNome", "");
    setValue("sedeId", "");
    setValue("nif", "");
    setValue("telefone", "");
    setValue("endereco", "");
    setBtnEnviar("Cadastrar Empresa");
    setModalIsOpen(true);
    setStatusSendEdit(false);
  };

  const closeModal = () => setModalIsOpen(false);
  const closeModalRemove = () => setModalIsOpenRemove(false);

  // Funções para editar e remover Empresa
  const onRemover = async (filial) => {
    setFilialRemover(filial);
    setModalIsOpenRemove(true);
  };

  const onEditar = (filial) => {
    setStatusSendEdit(true);
    setBtnEnviar("Editar Filial");
    setId(filial.id);
    setValue("nome", filial.nome);
    setValue("nomeComercial", filial.nomeComercial);
    setValue("nif", filial.nif);
    setValue("endereco", filial.endereco);
    setValue("sedeId", filial.sedeId.toString());
    setValue("sedeNome", filial.sedeNome);
    setValue("telefone", filial.telefone);
    setValue("longitude", filial.longitude.toString());
    setValue("latitude", filial.latitude.toString());
    setModalIsOpen(true);

  };

  
  const onConfirmar = async(data) =>{
    const dataSubmit = { ...filialRemover, status: false, id:filialRemover.id}; 
    const response = await api.put('filial/del',dataSubmit)
    .then((result)=>{
    console.log('Filial removido com sucesso!...', dataSubmit);
    buscarFilial();
    setModalIsOpen(false);
    setStatusSendEdit(false)
    setModalIsOpenRemove(false);
    
  }).catch((error)=>{
    console.log("Erro ao remover Filial ", filialRemover.id)
    erros.push("Erro ao remover Filial")
    alert("ERRO ao Deletar Filial!")
    
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
            data={filial}
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
        <h4>Deseja Remover Esta Filial?</h4>
        <div id='remove-close-modal'>
          <button onClick={onConfirmar}>Confirmar</button>
          <button onClick={onCancelar}>Cancelar</button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Formulário de Filial"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} id="close-button">X</button>
        <h2>Cadastro de Filial</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="Filial-form">
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
            {/* Endereço */}
            <div className="input-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              type="text"
              id="endereco"
              {...register('endereco')}
              className={errors.endereco ? 'input-error' : ''}
            />
            {errors.endereco && <span className="error-message">{errors.endereco.message}</span>}
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

           {/* SedeId */}
          <div className="input-group">
            <label htmlFor="sedId">sedeId</label>
            <input
              type="text"
              id="sedId"
              {...register('sedeId')}
              className={errors.sedeId ? 'input-error' : ''}
            />
            {errors.sedeId && <span className="error-message">{errors.sedeId.message}</span>}
            </div>

           {/* SedeNome*/}
       <div className="input-group">
            <label htmlFor="sedId">sedeNome</label>
            <input
              type="text"
              id="sedeNome"
              {...register('sedeNome')}
              className={errors.sedeNome ? 'input-error' : ''}
            />
            {errors.sedeNome && <span className="error-message">{errors.sedeNome.message}</span>}
            </div>

        {/* NomeComercial*/}
       <div className="input-group">
            <label htmlFor="nomeComercial">nomeComercial</label>
            <input
              type="text"
              id="nomeComercial"
              {...register('nomeComercial')}
              className={errors.nomeComercial ? 'input-error' : ''}
            />
            {errors.nomeComercial && <span className="error-message">{errors.nomeComercial.message}</span>}
        </div>
        
             {/* Longitude */}
          <div className="input-group">
            <label htmlFor="longitude">longitude</label>
            <input
              type="text"
              id="longitude"
              {...register('longitude')}
              className={errors.sedeId ? 'input-error' : ''}
              disabled
            />
            {errors.longitude && <span className="error-message">{errors.longitude.message}</span>}


           {/* latitude*/}
       <div className="input-group">
            <label htmlFor="sedId">latitude</label>
            <input
              type="text"
              id="latitude"
              {...register('latitude')}
              className={errors.latitude ? 'input-error' : ''}
              disabled
            />
            {errors.latitude && <span className="error-message">{errors.latitude.message}</span>}
            </div>

          </div>
          <br/>
          <div className="form-actions">
            <button type="submit" className="submit-button" id='submit'>{btnEnviar}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilialForm;