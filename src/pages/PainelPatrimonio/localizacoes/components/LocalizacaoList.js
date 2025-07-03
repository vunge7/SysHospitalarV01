import React, { useState, useEffect } from 'react';
import { Table, Button, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import * as localizacaoService from '../services/localizacaoService';

const { Option } = Select;

function LocalizacaoList() {
    const [localizacoes, setLocalizacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);
    const [filtroDepartamento, setFiltroDepartamento] = useState(null);
    const [departamentos, setDepartamentos] = useState([]);

    useEffect(() => {
        const fetchLocalizacoes = async () => {
            try {
                setLoading(true);
                const response = filtroDepartamento
                    ? await localizacaoService.getAllByDepartamento(filtroDepartamento)
                    : await localizacaoService.getAllByStatus(filtroStatus);
                setLocalizacoes(response.data);

                // Carregar departamentos únicos para o filtro
                const allLocalizacoes = await localizacaoService.getAllByStatus(true);
                const uniqueDepartamentos = [...new Set(allLocalizacoes.data.map(loc => loc.departamento))];
                setDepartamentos(uniqueDepartamentos);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar localizações.');
                setLoading(false);
                message.error('Erro ao carregar localizações.');
            }
        };
        fetchLocalizacoes();
    }, [filtroStatus, filtroDepartamento]);

    const handleDesativar = async (id) => {
        if (window.confirm('Deseja desativar esta localização?')) {
            try {
                await localizacaoService.desativar(id);
                setLocalizacoes(localizacoes.filter(loc => loc.id !== id));
                message.success('Localização desativada com sucesso.');
            } catch (err) {
                setError('Erro ao desativar localização.');
                message.error('Erro ao desativar localização.');
            }
        }
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
        },
        {
            title: 'Departamento',
            dataIndex: 'departamento',
            key: 'departamento',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (status ? 'Ativo' : 'Inativo'),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <div>
                    <Link to={`/localizacoes/editar/${record.id}`} className="text-blue-600 mr-2">
                        Editar
                    </Link>
                    <Button type="link" danger onClick={() => handleDesativar(record.id)}>
                        Desativar
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Localizações</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/localizacoes/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Nova Localização
                    </Button>
                </Link>
                <Select
                    placeholder="Filtrar por status"
                    onChange={(value) => setFiltroStatus(value)}
                    value={filtroStatus}
                    className="w-full md:w-48"
                >
                    <Option value={true}>Ativo</Option>
                    <Option value={false}>Inativo</Option>
                </Select>
                <Select
                    placeholder="Filtrar por departamento"
                    onChange={(value) => setFiltroDepartamento(value)}
                    value={filtroDepartamento}
                    className="w-full md:w-48"
                    allowClear
                >
                    {departamentos.map(dep => (
                        <Option key={dep} value={dep}>
                            {dep}
                        </Option>
                    ))}
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={localizacoes}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default LocalizacaoList;