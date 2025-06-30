import { api } from '../../../../service/api';
const BASE_PATH = '/api/categorias-bens';

export const criar = async (categoria) => {
    return await api.post(BASE_PATH, categoria);
};

export const atualizar = async (id, categoria) => {
    return await api.put(`${BASE_PATH}/${id}`, categoria);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const desativar = async (id) => {
    return await api.delete(`${BASE_PATH}/${id}`);
};