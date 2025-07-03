import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from 'react-modal';
import './style.css';
import { api } from "../../service/api";


// Definindo o esquema de validação com Zod para Seguradora
const schema = z.object({
  nome: z.string().min(2, { message: 'O nome da seguradora deve ter pelo menos 2 caracteres.' }).max(60),
  nif: z.string().min(9, { message: 'O NIF deve ter 9 caracteres.' }).max(9),
  endereco: z.string().min(1, { message: 'Prience o campo endereço.' }).max(50),
  telefone: z.string().min(9, { message: 'O telefone deve ter 9 caracteres.' }).max(15),
  seguradoraId: z.string().min(1, { message: 'Id da seguradora obrigatorio.' }).transform(val => {
     const segNumber = parseInt(val);
     if (isNaN(segNumber) || segNumber <= 0) {
       console.log('O Id da Seguradora de ser maior que Zero (0).');
     }
     return segNumber;
   }),
});

const EmpresaForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carregar, setCarregar] = useState(false);
  const [empresa, setEmpresa] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState("Cadastrar Empresa");
  const [empresaRemover, setEmpresaRemover] = useState(null);
  var erros = [];
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  // Função para buscar Empresa
  const buscarEmpresa = async () => {
    setCarregar(true);
    try {
      const result = await api.get('empresa/all');
      setEmpresa(result.data);
      console.log(result.data)
    } catch (error) {
      console.log('Erro ao buscar empresa', error);
    } finally {
      setCarregar(false);
    }
  };

  useEffect(() => {
    buscarEmpresa(); // Busca as Empresa ao carregar o componente
  }, []);

  // Função para envio de dados do formulário
  const onSubmit = async (data) => {
    const dataToSubmit = { ...data, status: true };

    if (statusSendEdit === false) {
      await api.post('empresa/add', dataToSubmit)
        .then(() => {
          buscarEmpresa();
          setModalIsOpen(false);
        })
        .catch(() => {
          console.log("Erro ao salvar Empresa");
        });
    } else {

      const dataSubmit = { ...data, id:id };
      await api.put('empresa/edit', dataSubmit)
        .then(() => {
          buscarEmpresa();
          setModalIsOpen(false);
          setStatusSendEdit(false);
          
        console.log("Editado com Sucesso...", dataSubmit)
        alert("Empresa Editada Com Sucesso")
        })
        .catch(() => {
          console.log("Erro ao editar a Empresa", dataSubmit);
          alert("FALHA ao Editar Empresa")
        });
    }
  };

  // Funções para abrir e fechar o modal
  const openModal = () => {
    setValue("nome", "");
    setValue("nif", "");
    setValue("telefone", "");
    setValue("endereco", "");
    setValue("seguradoraId", "");
    setBtnEnviar("Cadastrar Empresa");
    setModalIsOpen(true);
    setStatusSendEdit(false);
  };

  const closeModal = () => setModalIsOpen(false);
  const closeModalRemove = () => setModalIsOpenRemove(false);

  // Funções para editar e remover Empresa
  const onRemover = async (empresa) => {
    setEmpresaRemover(empresa);
    setModalIsOpenRemove(true);
  };

  const onEditar = (empresa) => {
    setStatusSendEdit(true);
    setBtnEnviar("Editar Empresa");
    setId(empresa.id);
    setValue("nome", empresa.nome);
    setValue("nif", empresa.nif);
    setValue("endereco", empresa.endereco);
    setValue("seguradoraId", empresa.seguradoraId);
    setValue("telefone", empresa.telefone);
    setModalIsOpen(true);

  };

  
  const onConfirmar = async(data) =>{
    const dataSubmit = { ...empresaRemover, status: false, id:empresaRemover.id}; 
    const response = await api.put('empresa/del',dataSubmit)
    .then((result)=>{
    console.log('Empresa removido com sucesso!...', dataSubmit);
    buscarEmpresa();
    setModalIsOpen(false);
    setStatusSendEdit(false)
    setModalIsOpenRemove(false);
    
  }).catch((error)=>{
    console.log("Erro ao remover Empresa ", empresaRemover.id)
    erros.push("Erro ao remover Empresa")
    alert("ERRO ao Deletar Empresa!")
    
  })
  };

  const onCancelar = () => {
    setModalIsOpenRemove(false);
  };

  // Função de Paginação
  const filteredEmpresa = empresa.filter((emp) =>
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) // Filtra pelo nome da seguradora
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentEmpresa = filteredEmpresa.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <button onClick={openModal} className="toggle-button">+</button>

      <div>
        <input
          type="text"
          name="search"
          id="search"
          className="search"
          placeholder="Pesquisar Empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table border="1">
          <caption>Empresa</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>NIF</th>
              <th>Endereço</th>
              <th>Telefone</th>
              <th>SeguradoraId</th>
              <th>Alterações</th>
            </tr>
          </thead>
          <tbody>
            {currentEmpresa.length > 0 ? (
              currentEmpresa.map((empresa, index) => (
                <tr key={index}>
                  <td>{empresa.id}</td>
                  <td>{empresa.nome}</td>
                  <td>{empresa.nif}</td>
                  <td>{empresa.endereco}</td>
                  <td>{empresa.telefone}</td>
                  <td>{empresa.seguradoraId}</td>
                  <td>
                    <button onClick={() => onEditar(empresa)}>Editar</button>
                    <button onClick={() => onRemover(empresa)}>Remover</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">Nenhuma Empresa encontrada</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredEmpresa.length / productsPerPage) }, (_, index) => (
            <button key={index} onClick={() => paginate(index + 1)}>{index + 1}</button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpenRemove}
        onRequestClose={closeModalRemove}
        className="modal-remove-content"
        overlayClassName="modal-remove-overlay"
      >
        <h4>Deseja Remover Esta Empresa?</h4>
        <div id='remove-close-modal'>
          <button onClick={onConfirmar}>Confirmar</button>
          <button onClick={onCancelar}>Cancelar</button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Formulário de Empresa"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} id="close-button">X</button>
        <h2>Cadastro de Empresa</h2>
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

           {/* Seguradora Id */}
          <div className="input-group">
            <label htmlFor="seguradora_id">Id Da Seguradora</label>
            <input
              type="text"
              id="seguradora_id"
              {...register('seguradoraId')}
              className={errors.seguradoraId ? 'input-error' : ''}
            />
            {errors.seguradoraId && <span className="error-message">{errors.seguradoraId.message}</span>}
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

export default EmpresaForm;
