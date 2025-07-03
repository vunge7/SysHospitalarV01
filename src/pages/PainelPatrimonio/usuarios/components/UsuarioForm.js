import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, message } from 'antd';
import * as usuarioService from '../../usuarios/services/UsuarioService';

const { Option } = Select;

function UsuarioForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchUsuario = async () => {
                try {
                    setLoading(true);
                    const response = await usuarioService.getById(id);
                    const usuario = response.data;
                    form.setFieldsValue({
                        nome: usuario.nome,
                        email: usuario.email,
                        nivelAcesso: usuario.nivelAcesso,
                    });
                    setLoading(false);
                } catch (err) {
                    message.error('Erro ao carregar usuário.');
                    setLoading(false);
                }
            };
            fetchUsuario();
        }
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const usuario = {
                nome: values.nome,
                email: values.email,
                senha: values.senha, // Inclui senha apenas para criação
                nivelAcesso: values.nivelAcesso,
                status: true,
            };

            if (id) {
                delete usuario.senha; // Não envia senha em atualizações
                await usuarioService.atualizar(id, usuario);
                message.success('Usuário atualizado com sucesso.');
            } else {
                await usuarioService.criar(usuario);
                message.success('Usuário criado com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar usuário.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="nome"
                    label="Nome"
                    rules={[{ required: true, message: 'Informe o nome do usuário' }]}
                >
                    <Input placeholder="Digite o nome do usuário" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Informe o email' },
                        { type: 'email', message: 'Email inválido' },
                    ]}
                >
                    <Input placeholder="Digite o email" />
                </Form.Item>
                {!id && (
                    <Form.Item
                        name="senha"
                        label="Senha"
                        rules={[{ required: true, message: 'Informe a senha' }]}
                    >
                        <Input.Password placeholder="Digite a senha" />
                    </Form.Item>
                )}
                <Form.Item
                    name="nivelAcesso"
                    label="Nível de Acesso"
                    rules={[{ required: true, message: 'Selecione o nível de acesso' }]}
                >
                    <Select placeholder="Selecione o nível de acesso">
                        <Option value="ADMIN">Administrador</Option>
                        <Option value="TECNICO">Técnico</Option>
                        <Option value="USUARIO">Usuário</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">
                        {id ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button className="ml-2" onClick={() => navigate('/')}>
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default UsuarioForm;