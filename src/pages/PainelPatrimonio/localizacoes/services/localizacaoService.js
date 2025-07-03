import { api } from '../../../../service/api';

const BASE_PATH = '/api/localizacoes';

export const criar = async (localizacao) => {
    return await api.post(BASE_PATH, localizacao);
};

export const atualizar = async (id, localizacao) => {
    return await api.put(`${BASE_PATH}/${id}`, localizacao);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const getAllByDepartamento = async (departamento) => {
    return await api.get(`${BASE_PATH}/departamento/${departamento}`);
};

export const desativar = async (id) => {
    return await api.delete(`${BASE_PATH}/${id}`);
};