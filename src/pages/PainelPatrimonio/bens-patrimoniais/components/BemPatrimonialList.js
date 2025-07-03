import React, { useState, useEffect } from 'react';
import { Table, Button, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import * as bemPatrimonialService from '../services/bemPatrimonialService';
import * as categoriaBemService from '../../categorias-bens/services/categoriaBemService';
import * as localizacaoService from '../../localizacoes/services/localizacaoService';

const { Option } = Select;

function BemPatrimonialList() {
    const [bens, setBens] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [localizacoes, setLocalizacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState(null);
    const [filtroLocalizacao, setFiltroLocalizacao] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bensResponse, categoriasResponse, localizacoesResponse] = await Promise.all([
                    bemPatrimonialService.getAllByStatus(filtroStatus),
                    categoriaBemService.getAllByStatus(true),
                    localizacaoService.getAllByStatus(true),
                ]);
                setBens(bensResponse.data);
                setCategorias(categoriasResponse.data);
                setLocalizacoes(localizacoesResponse.data);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar dados.');
                setLoading(false);
                message.error('Erro ao carregar dados.');
            }
        };
        fetchData();
    }, [filtroStatus]);

    const handleDesativar = async (id) => {
        if (window.confirm('Deseja desativar este bem patrimonial?')) {
            try {
                await bemPatrimonialService.desativar(id);
                setBens(bens.filter(bem => bem.id !== id));
                message.success('Bem patrimonial desativado com sucesso.');
            } catch (err) {
                setError('Erro ao desativar bem patrimonial.');
                message.error('Erro ao desativar bem patrimonial.');
            }
        }
    };

    const handleFiltroCategoria = async (categoriaId) => {
        setFiltroCategoria(categoriaId);
        try {
            setLoading(true);
            const response = categoriaId
                ? await bemPatrimonialService.getAllByCategoria(categoriaId)
                : await bemPatrimonialService.getAllByStatus(filtroStatus);
            setBens(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por categoria.');
            message.error('Erro ao filtrar por categoria.');
        }
    };

    const handleFiltroLocalizacao = async (localizacaoId) => {
        setFiltroLocalizacao(localizacaoId);
        try {
            setLoading(true);
            const response = localizacaoId
                ? await bemPatrimonialService.getAllByLocalizacao(localizacaoId)
                : await bemPatrimonialService.getAllByStatus(filtroStatus);
            setBens(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao filtrar por localização.');
            message.error('Erro ao filtrar por localização.');
        }
    };

    const columns = [
        {
            title: 'Nº Patrimônio',
            dataIndex: 'numeroPatrimonio',
            key: 'numeroPatrimonio',
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
        },
        {
            title: 'Categoria',
            dataIndex: ['categoria', 'nome'],
            key: 'categoria',
        },
        {
            title: 'Localização',
            dataIndex: ['localizacao', 'nome'],
            key: 'localizacao',
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <div>
                    <Link to={`/bens-patrimoniais/editar/${record.id}`} className="text-blue-600 mr-2">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bens Patrimoniais</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/bens-patrimoniais/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Novo Bem Patrimonial
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
                    placeholder="Filtrar por categoria"
                    onChange={handleFiltroCategoria}
                    value={filtroCategoria}
                    className="w-full md:w-48"
                    allowClear
                >
                    {categorias.map(categoria => (
                        <Option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Filtrar por localização"
                    onChange={handleFiltroLocalizacao}
                    value={filtroLocalizacao}
                    className="w-full md:w-48"
                    allowClear
                >
                    {localizacoes.map(localizacao => (
                        <Option key={localizacao.id} value={localizacao.id}>
                            {localizacao.nome}
                        </Option>
                    ))}
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={bens}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default BemPatrimonialList;