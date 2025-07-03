import { api } from '../../../../service/api';

const BASE_PATH = '/api/usuarios';

export const criar = async (usuario) => {
    return await api.post(BASE_PATH, usuario);
};

export const atualizar = async (id, usuario) => {
    return await api.put(`${BASE_PATH}/${id}`, usuario);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const getAllByNivelAcesso = async (nivelAcesso) => {
    return await api.get(`${BASE_PATH}/nivel-acesso/${nivelAcesso}`);
};

export const desativar = async (id) => {
    return await api.delete(`${BASE_PATH}/${id}`);
};