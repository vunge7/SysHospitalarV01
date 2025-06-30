import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import * as localizacaoService from '../services/localizacaoService';

function LocalizacaoForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchLocalizacao = async () => {
                try {
                    setLoading(true);
                    const response = await localizacaoService.getById(id);
                    const localizacao = response.data;
                    form.setFieldsValue({
                        nome: localizacao.nome,
                        descricao: localizacao.descricao,
                        departamento: localizacao.departamento,
                    });
                    setLoading(false);
                } catch (err) {
                    message.error('Erro ao carregar localização.');
                    setLoading(false);
                }
            };
            fetchLocalizacao();
        }
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const localizacao = {
                nome: values.nome,
                descricao: values.descricao,
                departamento: values.departamento,
                status: true,
            };

            if (id) {
                await localizacaoService.atualizar(id, localizacao);
                message.success('Localização atualizada com sucesso.');
            } else {
                await localizacaoService.criar(localizacao);
                message.success('Localização criada com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar localização.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Localização' : 'Nova Localização'}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="nome"
                    label="Nome"
                    rules={[{ required: true, message: 'Informe o nome da localização' }]}
                >
                    <Input placeholder="Digite o nome da localização" />
                </Form.Item>
                <Form.Item name="descricao" label="Descrição">
                    <Input.TextArea rows={4} placeholder="Digite a descrição" />
                </Form.Item>
                <Form.Item
                    name="departamento"
                    label="Departamento"
                    rules={[{ required: true, message: 'Informe o departamento' }]}
                >
                    <Input placeholder="Digite o departamento" />
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

export default LocalizacaoForm;