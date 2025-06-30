import { api } from '../../../../service/api';

const BASE_PATH = '/api/manutencoes';

export const criar = async (manutencao) => {
    return await api.post(BASE_PATH, manutencao);
};

export const atualizar = async (id, manutencao) => {
    return await api.put(`${BASE_PATH}/${id}`, manutencao);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getAllByBemPatrimonial = async (bemPatrimonialId) => {
    return await api.get(`${BASE_PATH}/bem-patrimonial/${bemPatrimonialId}`);
};

export const getAllByTipoAndStatus = async (tipo, status) => {
    return await api.get(`${BASE_PATH}/tipo/${tipo}/status/${status}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const getAllByPeriodo = async (dataInicio, dataFim) => {
    return await api.get(`${BASE_PATH}/periodo`, {
        params: { dataInicio, dataFim }
    });
};