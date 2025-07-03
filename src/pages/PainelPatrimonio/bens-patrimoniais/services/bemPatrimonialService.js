import { api } from '../../../../service/api';

const BASE_PATH = '/api/bens-patrimoniais';

export const criar = async (bemPatrimonial) => {
    return await api.post(BASE_PATH, bemPatrimonial);
};

export const atualizar = async (id, bemPatrimonial) => {
    return await api.put(`${BASE_PATH}/${id}`, bemPatrimonial);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getByNumeroPatrimonio = async (numeroPatrimonio) => {
    return await api.get(`${BASE_PATH}/numero-patrimonio/${numeroPatrimonio}`);
};

export const getAllByCategoria = async (categoriaId) => {
    return await api.get(`${BASE_PATH}/categoria/${categoriaId}`);
};

export const getAllByLocalizacao = async (localizacaoId) => {
    return await api.get(`${BASE_PATH}/localizacao/${localizacaoId}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const desativar = async (id) => {
    return await api.delete(`${BASE_PATH}/${id}`);
};