import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from 'antd';
import * as bemPatrimonialService from '../services/bemPatrimonialService';
import * as categoriaBemService from '../../categorias-bens/services/categoriaBemService';
import * as localizacaoService from '../../localizacoes/services/localizacaoService';

const { Option } = Select;

function BemPatrimonialForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [localizacoes, setLocalizacoes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [categoriasResponse, localizacoesResponse] = await Promise.all([
                    categoriaBemService.getAllByStatus(true),
                    localizacaoService.getAllByStatus(true),
                ]);
                setCategorias(categoriasResponse.data);
                setLocalizacoes(localizacoesResponse.data);

                if (id) {
                    const response = await bemPatrimonialService.getById(id);
                    const bem = response.data;
                    form.setFieldsValue({
                        numeroPatrimonio: bem.numeroPatrimonio,
                        descricao: bem.descricao,
                        categoriaId: bem.categoria?.id,
                        localizacaoId: bem.localizacao?.id,
                        dataAquisicao: bem.dataAquisicao ? new Date(bem.dataAquisicao) : null,
                        valorAquisicao: bem.valorAquisicao,
                        vidaUtilMeses: bem.vidaUtilMeses,
                        observacoes: bem.observacoes,
                    });
                }
                setLoading(false);
            } catch (err) {
                message.error('Erro ao carregar dados.');
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const bemPatrimonial = {
                numeroPatrimonio: values.numeroPatrimonio,
                descricao: values.descricao,
                categoria: { id: values.categoriaId },
                localizacao: { id: values.localizacaoId },
                dataAquisicao: values.dataAquisicao?.toISOString().split('T')[0],
                valorAquisicao: values.valorAquisicao,
                vidaUtilMeses: values.vidaUtilMeses,
                observacoes: values.observacoes,
                status: true,
            };

            if (id) {
                await bemPatrimonialService.atualizar(id, bemPatrimonial);
                message.success('Bem patrimonial atualizado com sucesso.');
            } else {
                await bemPatrimonialService.criar(bemPatrimonial);
                message.success('Bem patrimonial criado com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar bem patrimonial.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Bem Patrimonial' : 'Novo Bem Patrimonial'}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="numeroPatrimonio"
                    label="Nº Patrimônio"
                    rules={[{ required: true, message: 'Informe o número do patrimônio' }]}
                >
                    <Input placeholder="Digite o número do patrimônio" />
                </Form.Item>
                <Form.Item
                    name="descricao"
                    label="Descrição"
                    rules={[{ required: true, message: 'Informe a descrição' }]}
                >
                    <Input placeholder="Digite a descrição" />
                </Form.Item>
                <Form.Item
                    name="categoriaId"
                    label="Categoria"
                    rules={[{ required: true, message: 'Selecione a categoria' }]}
                >
                    <Select placeholder="Selecione uma categoria">
                        {categorias.map(categoria => (
                            <Option key={categoria.id} value={categoria.id}>
                                {categoria.nome}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="localizacaoId"
                    label="Localização"
                    rules={[{ required: true, message: 'Selecione a localização' }]}
                >
                    <Select placeholder="Selecione uma localização">
                        {localizacoes.map(localizacao => (
                            <Option key={localizacao.id} value={localizacao.id}>
                                {localizacao.nome}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="dataAquisicao"
                    label="Data de Aquisição"
                    rules={[{ required: true, message: 'Selecione a data de aquisição' }]}
                >
                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
                <Form.Item
                    name="valorAquisicao"
                    label="Valor de Aquisição"
                    rules={[{ required: true, message: 'Informe o valor de aquisição' }]}
                >
                    <InputNumber min={0} step={0.01} className="w-full" placeholder="Digite o valor" />
                </Form.Item>
                <Form.Item name="vidaUtilMeses" label="Vida Útil (meses)">
                    <InputNumber min={0} className="w-full" placeholder="Digite a vida útil em meses" />
                </Form.Item>
                <Form.Item name="observacoes" label="Observações">
                    <Input.TextArea rows={4} placeholder="Digite observações" />
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

export default BemPatrimonialForm;