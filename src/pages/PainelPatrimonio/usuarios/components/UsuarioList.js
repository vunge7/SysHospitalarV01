import React, { useState, useEffect } from 'react';
import { Table, Button, Select, message } from 'antd';
import { Link } from 'react-router-dom';
import * as usuarioService from '../../usuarios/services/UsuarioService';

const { Option } = Select;

function UsuarioList() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState(true);
    const [filtroNivelAcesso, setFiltroNivelAcesso] = useState(null);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                setLoading(true);
                const response = filtroNivelAcesso
                    ? await usuarioService.getAllByNivelAcesso(filtroNivelAcesso)
                    : await usuarioService.getAllByStatus(filtroStatus);
                setUsuarios(response.data);
                setLoading(false);
            } catch (err) {
                setError('Erro ao carregar usuários.');
                setLoading(false);
                message.error('Erro ao carregar usuários.');
            }
        };
        fetchUsuarios();
    }, [filtroStatus, filtroNivelAcesso]);

    const handleDesativar = async (id) => {
        if (window.confirm('Deseja desativar este usuário?')) {
            try {
                await usuarioService.desativar(id);
                setUsuarios(usuarios.filter(usuario => usuario.id !== id));
                message.success('Usuário desativado com sucesso.');
            } catch (err) {
                setError('Erro ao desativar usuário.');
                message.error('Erro ao desativar usuário.');
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
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Nível de Acesso',
            dataIndex: 'nivelAcesso',
            key: 'nivelAcesso',
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
                    <Link to={`/usuarios/editar/${record.id}`} className="text-blue-600 mr-2">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuários</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Link to="/patrimonio/usuarios/novo">
                    <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                        Novo Usuário
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
                    placeholder="Filtrar por nível de acesso"
                    onChange={(value) => setFiltroNivelAcesso(value)}
                    value={filtroNivelAcesso}
                    className="w-full md:w-48"
                    allowClear
                >
                    <Option value="ADMIN">Administrador</Option>
                    <Option value="TECNICO">Técnico</Option>
                    <Option value="USUARIO">Usuário</Option>
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={usuarios}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                className="border rounded-lg"
            />
        </div>
    );
}

export default UsuarioList;