import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, message } from 'antd';
import { Link } from 'react-router-dom';
import * as depreciacaoService from '../services/DepreciacaoService';
import * as bemPatrimonialService from '../../bens-patrimoniais/services/bemPatrimonialService';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

function DepreciacaoList() {
    const [depreciacoes, setDepreciacoes] = useState([]);
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroBemId, setFiltroBemId] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);
    const [filtroPeriodo, setFiltroPeriodo] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [depreciacoesResponse, bensResponse] = await Promise.all([
                    depreciacaoService.getAllByStatus(filtroStatus),
                    bemPatrimonialService.getAllByStatus(true),
                ]);
                setDepreciacoes(depreciacoesResponse.data);
                setBens(bensResponse.data);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar dados.');
                setLoading(false);
                message.error('Erro ao carregar dados.');
            }
        };
        fetchData();
    }, [filtroStatus]);

    const handleFiltroBem = async (bemId) => {
        setFiltroBemId(bemId);
        try {
            setLoading(true);
            const response = bemId
                ? await depreciacaoService.getAllByBemPatrimonial(bemId)
                : await depreciacaoService.getAllByStatus(filtroStatus);
            setDepreciacoes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por bem patrimonial.');
            message.error('Erro ao filtrar por bem patrimonial.');
        }
    };

    const handleFiltroPeriodo = async (dates) => {
        setFiltroPeriodo(dates);
        if (dates && dates.length === 2) {
            try {
                setLoading(true);
                const response = await depreciacaoService.getAllByPeriodo(
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD')
                );
                setDepreciacoes(response.data);
                setLoading(false);
            } catch (err) {
                setError('Erro ao filtrar por período.');
                message.error('Erro ao filtrar por período.');
            }
        }
    };

    const columns = [
        {
            title: 'Bem Patrimonial',
            dataIndex: ['bemPatrimonial', 'numeroPatrimonio'],
            key: 'bemPatrimonial',
        },
        {
            title: 'Data',
            dataIndex: 'dataDepreciacao',
            key: 'dataDepreciacao',
            render: (data) => moment(data).format('DD/MM/YYYY'),
        },
        {
            title: 'Valor Depreciado',
            dataIndex: 'valorDepreciado',
            key: 'valorDepreciado',
            render: (valor) => `R$ ${valor.toFixed(2)}`,
        },
        {
            title: 'Percentual',
            dataIndex: 'percentualDepreciacao',
            key: 'percentualDepreciacao',
            render: (percentual) => `${percentual.toFixed(2)}%`,
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
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
                    <Link to={`/depreciacoes/editar/${record.id}`} className="text-blue-600 mr-2">
                        Editar
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Depreciações</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/depreciacoes/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Nova Depreciação
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
                    placeholder="Filtrar por bem patrimonial"
                    onChange={handleFiltroBem}
                    value={filtroBemId}
                    className="w-full md:w-48"
                    allowClear
                >
                    {bens.map(bem => (
                        <Option key={bem.id} value={bem.id}>
                            {bem.numeroPatrimonio} - {bem.descricao}
                        </Option>
                    ))}
                </Select>
                <RangePicker
                    format="DD/MM/YYYY"
                    onChange={handleFiltroPeriodo}
                    className="w-full md:w-48"
                />
            </div>
            <Table
                columns={columns}
                dataSource={depreciacoes}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default DepreciacaoList;