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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        dataInicio: null,
        dataFim: null,
        armazemId: null,
        produtoId: null,
        tipoOperacao: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    armazensRes,
                    filiaisRes,
                    produtosRes,
                    lotesRes,
                    fornecedoresRes,
                    linhasLotesRes,
                    operacoesRes,
                ] = await Promise.all([
                    api.get('/armazem/all'),
                    api.get('/filial/all'),
                    api.get('/produto/all'),
                    api.get('/lotes/all'),
                    api.get('/fornecedor/all'),
                    api.get('/linhaslotes/all'),
                    api.get('/operacao-stock/all'),
                ]);
                setArmazens(
                    Array.isArray(armazensRes.data) ? armazensRes.data : []
                );
                setFiliais(
                    Array.isArray(filiaisRes.data) ? filiaisRes.data : []
                );
                setProdutos(
                    Array.isArray(produtosRes.data) ? produtosRes.data : []
                );
                setLotes(Array.isArray(lotesRes.data) ? lotesRes.data : []);
                setFornecedores(
                    Array.isArray(fornecedoresRes.data)
                        ? fornecedoresRes.data
                        : []
                );
                setLinhasLotes(
                    Array.isArray(linhasLotesRes.data)
                        ? linhasLotesRes.data
                        : []
                );
                setOperacoesList(
                    Array.isArray(operacoesRes.data) ? operacoesRes.data : []
                );
                setError(null);
            } catch (err) {
                const errorMsg =
                    err.response?.data?.message ||
                    `Erro ao carregar dados: ${err.message}`;
                setError(errorMsg);
                message.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const applyFilters = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.dataInicio)
                params.dataInicio = filters.dataInicio.toISOString();
            if (filters.dataFim) params.dataFim = filters.dataFim.toISOString();
            if (filters.armazemId) params.armazemId = filters.armazemId;
            if (filters.produtoId) params.produtoId = filters.produtoId;
            if (filters.tipoOperacao)
                params.tipoOperacao = filters.tipoOperacao;

            const operacoesRes = await api.get('/operacao-stock/all', {
                params,
            });
            const filteredOperacoes = Array.isArray(operacoesRes.data)
                ? operacoesRes.data
                : [];
            setOperacoesList(filteredOperacoes);
            return filteredOperacoes;
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                `Erro ao aplicar filtros: ${err.message}`;
            setError(errorMsg);
            message.error(errorMsg);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <StockContext.Provider
            value={{
                armazens,
                setArmazens,
                filiais,
                setFiliais,
                produtos,
                setProdutos,
                lotes,
                setLotes,
                fornecedores,
                setFornecedores,
                linhasLotes,
                setLinhasLotes,
                operacoesList,
                setOperacoesList,
                loading,
                error,
                filters,
                setFilters,
                applyFilters,
            }}
        >
            {children}
        </StockContext.Provider>
    );
};
