import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, message } from 'antd';
import { Link } from 'react-router-dom';
import * as movimentacaoService from '../services/MovimentacaoService';
import * as bemPatrimonialService from '../../bens-patrimoniais/services/bemPatrimonialService';
import * as localizacaoService from '../../localizacoes/services/localizacaoService';
import * as usuarioService from '../../usuarios/services/UsuarioService';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

function MovimentacaoList() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [bens, setBens] = useState([]);
    const [localizacoes, setLocalizacoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroBemId, setFiltroBemId] = useState(null);
    const [filtroLocalizacaoId, setFiltroLocalizacaoId] = useState(null);
    const [filtroResponsavelId, setFiltroResponsavelId] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);
    const [filtroPeriodo, setFiltroPeriodo] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [movimentacoesResponse, bensResponse, localizacoesResponse, usuariosResponse] = await Promise.all([
                    movimentacaoService.getAllByStatus(filtroStatus),
                    bemPatrimonialService.getAllByStatus(true),
                    localizacaoService.getAllByStatus(true),
                    usuarioService.getAllByStatus(true),
                ]);
                setMovimentacoes(movimentacoesResponse.data);
                setBens(bensResponse.data);
                setLocalizacoes(localizacoesResponse.data);
                setUsuarios(usuariosResponse.data);
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
                ? await movimentacaoService.getAllByBemPatrimonial(bemId)
                : await movimentacaoService.getAllByStatus(filtroStatus);
            setMovimentacoes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por bem patrimonial.');
            message.error('Erro ao filtrar por bem patrimonial.');
        }
    };

    const handleFiltroLocalizacao = async (localizacaoId) => {
        setFiltroLocalizacaoId(localizacaoId);
        try {
            setLoading(true);
            const response = localizacaoId
                ? await movimentacaoService.getAllByLocalizacaoDestino(localizacaoId)
                : await movimentacaoService.getAllByStatus(filtroStatus);
            setMovimentacoes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por localização.');
            message.error('Erro ao filtrar por localização.');
        }
    };

    const handleFiltroResponsavel = async (responsavelId) => {
        setFiltroResponsavelId(responsavelId);
        try {
            setLoading(true);
            const response = responsavelId
                ? await movimentacaoService.getAllByResponsavel(responsavelId)
                : await movimentacaoService.getAllByStatus(filtroStatus);
            setMovimentacoes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por responsável.');
            message.error('Erro ao filtrar por responsável.');
        }
    };

    const handleFiltroPeriodo = async (dates) => {
        setFiltroPeriodo(dates);
        if (dates && dates.length === 2) {
            try {
                setLoading(true);
                const response = await movimentacaoService.getAllByPeriodo(
                    dates[0].format('YYYY-MM-DD'),
                    dates[1].format('YYYY-MM-DD')
                );
                setMovimentacoes(response.data);
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
            title: 'Origem',
            dataIndex: ['localizacaoOrigem', 'nome'],
            key: 'localizacaoOrigem',
        },
        {
            title: 'Destino',
            dataIndex: ['localizacaoDestino', 'nome'],
            key: 'localizacaoDestino',
        },
        {
            title: 'Responsável',
            dataIndex: ['responsavel', 'nome'],
            key: 'responsavel',
        },
        {
            title: 'Data',
            dataIndex: 'dataMovimentacao',
            key: 'dataMovimentacao',
            render: (data) => moment(data).format('DD/MM/YYYY'),
        },
        {
            title: 'Motivo',
            dataIndex: 'motivo',
            key: 'motivo',
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
                    <Link to={`/movimentacoes/editar/${record.id}`} className="text-blue-600 mr-2">
                        Editar
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Movimentações</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/movimentacoes/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Nova Movimentação
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
                <Select
                    placeholder="Filtrar por localização de destino"
                    onChange={handleFiltroLocalizacao}
                    value={filtroLocalizacaoId}
                    className="w-full md:w-48"
                    allowClear
                >
                    {localizacoes.map(loc => (
                        <Option key={loc.id} value={loc.id}>
                            {loc.nome}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Filtrar por responsável"
                    onChange={handleFiltroResponsavel}
                    value={filtroResponsavelId}
                    className="w-full md:w-48"
                    allowClear
                >
                    {usuarios.map(usuario => (
                        <Option key={usuario.id} value={usuario.id}>
                            {usuario.nome}
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
                dataSource={movimentacoes}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default MovimentacaoList;