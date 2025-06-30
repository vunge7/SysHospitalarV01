import { api } from '../../../../service/api';

const BASE_PATH = '/api/depreciacoes';

export const criar = async (depreciacao) => {
    return await api.post(BASE_PATH, depreciacao);
};

export const atualizar = async (id, depreciacao) => {
    return await api.put(`${BASE_PATH}/${id}`, depreciacao);
};

export const getById = async (id) => {
    return await api.get(`${BASE_PATH}/${id}`);
};

export const getAllByBemPatrimonial = async (bemPatrimonialId) => {
    return await api.get(`${BASE_PATH}/bem-patrimonial/${bemPatrimonialId}`);
};

export const getAllByStatus = async (status) => {
    return await api.get(`${BASE_PATH}/status/${status}`);
};

export const getAllByPeriodo = async (dataInicio, dataFim) => {
    return await api.get(`${BASE_PATH}/periodo`, {
        params: { dataInicio, dataFim }
    });
};