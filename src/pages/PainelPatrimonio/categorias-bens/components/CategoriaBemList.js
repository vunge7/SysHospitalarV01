import React, { useState, useEffect } from 'react';
import { Table, Button, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import * as categoriaBemService from '../services/categoriaBemService';

const { Option } = Select;

function CategoriaBemList() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                setLoading(true);
                const response = await categoriaBemService.getAllByStatus(filtroStatus);
                setCategorias(response.data);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar categorias.');
                setLoading(false);
                message.error('Erro ao carregar categorias.');
            }
        };
        fetchCategorias();
    }, [filtroStatus]);

    const handleDesativar = async (id) => {
        if (window.confirm('Deseja desativar esta categoria?')) {
            try {
                await categoriaBemService.desativar(id);
                setCategorias(categorias.filter(categoria => categoria.id !== id));
                message.success('Categoria desativada com sucesso.');
            } catch (err) {
                setError('Erro ao desativar categoria.');
                message.error('Erro ao desativar categoria.');
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
                    <Link to={`/categorias-bens/editar/${record.id}`} className="text-blue-600 mr-2">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Categorias de Bens</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/categorias-bens/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Nova Categoria
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
            </div>
            <Table
                columns={columns}
                dataSource={categorias}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default CategoriaBemList;