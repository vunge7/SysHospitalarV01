// src/contexts/StockContext.js
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../service/api';
import { message } from 'antd';

export const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [armazens, setArmazens] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [linhasLotes, setLinhasLotes] = useState([]);
  const [operacoesList, setOperacoesList] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          armazensRes,
          filiaisRes,
          produtosRes,
          productTypesRes,
          lotesRes,
          fornecedoresRes,
          linhasLotesRes,
          operacoesRes,
        ] = await Promise.all([
          api.get('/armazem/all'),
          api.get('/empresa/all'),
          api.get('/produto/all'),
          api.get('/producttype/all'),
          api.get('/lotes/all'),
          api.get('/fornecedor/all'),
          api.get('/linhaslotes/all'),
          api.get('/operacao-stock/all'),
        ]);

        console.log('Dados de produtos:', produtosRes.data);
        console.log('Dados de productTypes:', productTypesRes.data);
        console.log('Dados de lotes:', lotesRes.data);
        console.log('Dados de fornecedores:', fornecedoresRes.data);
        console.log('Dados de linhasLotes:', linhasLotesRes.data);
        console.log('Dados de operacoes:', operacoesRes.data);

        setArmazens(Array.isArray(armazensRes.data) ? armazensRes.data : []);
        setFiliais(Array.isArray(filiaisRes.data) ? filiaisRes.data : []);
        setProdutos(Array.isArray(produtosRes.data) ? produtosRes.data : []);
        setProductTypes(Array.isArray(productTypesRes.data) ? productTypesRes.data : []);
        setLotes(Array.isArray(lotesRes.data) ? lotesRes.data : []);
        setFornecedores(Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : []);
        setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
        setOperacoesList(Array.isArray(operacoesRes.data) ? operacoesRes.data : []);
        setError(null);

        if (!Array.isArray(productTypesRes.data) || productTypesRes.data.length === 0) {
          console.warn('Nenhum productType retornado pela API /producttype/all');
          message.warning('Nenhum tipo de produto disponível. Verifique a API.');
        }
        const produto23 = produtosRes.data.find(p => p.id === 23);
        if (produto23 && !produto23.productType) {
          console.warn('Produto ID 23 não possui productType definido.');
          message.warning('Produto ID 23 não possui tipo de produto definido.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || `Erro ao carregar dados: ${err.message}`;
        console.error('Erro no fetchData:', errorMsg);
        setError(errorMsg);
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <StockContext.Provider
      value={{
        armazens,
        setArmazens, // Adicionado
        filiais,
        setFiliais, // Adicionado
        produtos,
        setProdutos, // Adicionado
        lotes,
        setLotes,
        fornecedores,
        setFornecedores,
        linhasLotes,
        setLinhasLotes,
        operacoesList,
        setOperacoesList,
        productTypes,
        setProductTypes, // Adicionado
        loading,
        error,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};