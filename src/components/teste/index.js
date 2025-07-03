import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import './style.css';

import { api } from "../../service/api";

// Definindo o esquema de validação com Zod
const schema = z.object({
  productType: z.string().refine(val => ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(val), {
    message: 'Selecione um tipo de produto válido.',
  }),
  productCode: z.string().min(3, { message: 'O código do produto deve ter entre 3 e 60 caracteres.' }).max(60),
  productGroup: z.string().min(1, { message: 'O grupo do produto é obrigatório.' }),
  productDescription: z.string().min(3, { message: 'A descrição do produto deve ter entre 3 e 200 caracteres.' }).max(200),
  productNumberCode: z.string().min(3, { message: 'O número do código do produto deve ter entre 3 e 60 caracteres.' }).max(60),
  preco: z.string().min(1, { message: 'O preço do produto deve ser maior que zero.' }).transform(val => {
    const precoNumber = parseFloat(val);
    if (isNaN(precoNumber) || precoNumber <= 0) {
      throw new Error('O preço do produto deve ser um número maior que zero.');
    }
    return precoNumber;
  }),
  // Corrigido: Validação para o campo status
  status: z.boolean().refine(val => typeof val === 'boolean', {
    message: 'O status deve ser um valor booleano.',
  }),
});

const ProdutoForm = () => {
  // Usando o useForm com o zodResolver
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // Garantindo que o 'status' será 'true' se não for passado
    const dataToSubmit = { ...data, status: true };

    console.log("Produto enviado:", dataToSubmit);

    try {
      const response = await api.post('produto/add', dataToSubmit);
      console.log('Produto criado com sucesso!', response);
    } catch (error) {
      console.log('Erro ao salvar o produto:', error);
    }
  };

  return (
    <div className="produto-form-container">
      <h2>Cadastro de Produto</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="produto-form">
        <div className="input-group">
          <label htmlFor="productType">Tipo de Produto</label>
          <select
            id="productType"
            {...register('productType')}
            className={errors.productType ? 'input-error' : ''}
          >
            <option value="">Selecione um tipo</option>
            <option value="1">Tipo 1</option>
            <option value="2">Tipo 2</option>
            <option value="3">Tipo 3</option>
            <option value="4">Tipo 4</option>
            <option value="5">Tipo 5</option>
            <option value="6">Tipo 6</option>
            <option value="7">Tipo 7</option>
            <option value="8">Tipo 8</option>
            <option value="9">Tipo 9</option>
          </select>
          {errors.productType && <span className="error-message">{errors.productType.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="productCode">Código do Produto</label>
          <input
            type="text"
            id="productCode"
            {...register('productCode')}
            className={errors.productCode ? 'input-error' : ''}
          />
          {errors.productCode && <span className="error-message">{errors.productCode.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="productGroup">Grupo do Produto</label>
          <select
            id="productGroup"
            {...register('productGroup')}
            className={errors.productGroup ? 'input-error' : ''}
          >
            <option value="">Selecione um Grupo</option>
            <option value="1">Grupo 1</option>
            <option value="2">Grupo 2</option>
            <option value="3">Grupo 3</option>
            <option value="4">Grupo 4</option>
            <option value="5">Grupo 5</option>
            <option value="6">Grupo 6</option>
            <option value="7">Grupo 7</option>
            <option value="8">Grupo 8</option>
            <option value="9">Grupo 9</option>
          </select>
          {errors.productGroup && <span className="error-message">{errors.productGroup.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="productDescription">Descrição do Produto</label>
          <input
            type="text"
            id="productDescription"
            {...register('productDescription')}
            className={errors.productDescription ? 'input-error' : ''}
          />
          {errors.productDescription && <span className="error-message">{errors.productDescription.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="productNumberCode">Número do Código</label>
          <input
            type="text"
            id="productNumberCode"
            {...register('productNumberCode')}
            className={errors.productNumberCode ? 'input-error' : ''}
          />
          {errors.productNumberCode && <span className="error-message">{errors.productNumberCode.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="preco">Preço</label>
          <input
            type="text"
            id="preco"
            {...register('preco')}
            className={errors.preco ? 'input-error' : ''}
          />
          {errors.preco && <span className="error-message">{errors.preco.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="status">Status (Ativo)</label>
          <input
            type="checkbox"
            id="status"
            {...register('status')}
            className={errors.status ? 'input-error' : ''}
          />
          {errors.status && <span className="error-message">{errors.status.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Enviar</button>
        </div>
      </form>
    </div>
  );
};

export default ProdutoForm;
