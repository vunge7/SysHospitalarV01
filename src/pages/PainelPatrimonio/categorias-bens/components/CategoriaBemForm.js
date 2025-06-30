import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import * as categoriaBemService from '../services/categoriaBemService';

function CategoriaBemForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchCategoria = async () => {
                try {
                    setLoading(true);
                    const response = await categoriaBemService.getById(id);
                    const categoria = response.data;
                    form.setFieldsValue({
                        nome: categoria.nome,
                        descricao: categoria.descricao,
                    });
                    setLoading(false);
                } catch (err) {
                    message.error('Erro ao carregar categoria.');
                    setLoading(false);
                }
            };
            fetchCategoria();
        }
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const categoria = {
                nome: values.nome,
                descricao: values.descricao,
                status: true,
            };

            if (id) {
                await categoriaBemService.atualizar(id, categoria);
                message.success('Categoria atualizada com sucesso.');
            } else {
                await categoriaBemService.criar(categoria);
                message.success('Categoria criada com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar categoria.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="nome"
                    label="Nome"
                    rules={[{ required: true, message: 'Informe o nome da categoria' }]}
                >
                    <Input placeholder="Digite o nome da categoria" />
                </Form.Item>
                <Form.Item name="descricao" label="Descrição">
                    <Input.TextArea rows={4} placeholder="Digite a descrição" />
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

export default CategoriaBemForm;