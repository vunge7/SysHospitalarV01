import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from 'antd';
import * as depreciacaoService from '../services/DepreciacaoService';
import * as bemPatrimonialService from '../../bens-patrimoniais/services/bemPatrimonialService';
import moment from 'moment';

const { Option } = Select;

function DepreciacaoForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const bensResponse = await bemPatrimonialService.getAllByStatus(true);
                setBens(bensResponse.data);

                if (id) {
                    const response = await depreciacaoService.getById(id);
                    const depreciacao = response.data;
                    form.setFieldsValue({
                        bemPatrimonialId: depreciacao.bemPatrimonial?.id,
                        dataDepreciacao: depreciacao.dataDepreciacao ? moment(depreciacao.dataDepreciacao) : null,
                        valorDepreciado: depreciacao.valorDepreciado,
                        percentualDepreciacao: depreciacao.percentualDepreciacao,
                        descricao: depreciacao.descricao,
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
            const depreciacao = {
                bemPatrimonial: { id: values.bemPatrimonialId },
                dataDepreciacao: values.dataDepreciacao ? values.dataDepreciacao.format('YYYY-MM-DD') : null,
                valorDepreciado: values.valorDepreciado,
                percentualDepreciacao: values.percentualDepreciacao,
                descricao: values.descricao,
                status: true,
            };

            if (id) {
                await depreciacaoService.atualizar(id, depreciacao);
                message.success('Depreciação atualizada com sucesso.');
            } else {
                await depreciacaoService.criar(depreciacao);
                message.success('Depreciação criada com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar depreciação.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Depreciação' : 'Nova Depreciação'}
            </h2>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="bemPatrimonialId"
                    label="Bem Patrimonial"
                    rules={[{ required: true, message: 'Selecione o bem patrimonial' }]}
                >
                    <Select placeholder="Selecione um bem patrimonial">
                        {bens.map(bem => (
                            <Option key={bem.id} value={bem.id}>
                                {bem.numeroPatrimonio} - {bem.descricao}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="dataDepreciacao"
                    label="Data da Depreciação"
                    rules={[{ required: true, message: 'Selecione a data da depreciação' }]}
                >
                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
                <Form.Item
                    name="valorDepreciado"
                    label="Valor Depreciado"
                    rules={[{ required: true, message: 'Informe o valor depreciado' }]}
                >
                    <InputNumber min={0} step={0.01} className="w-full" placeholder="Digite o valor depreciado" />
                </Form.Item>
                <Form.Item
                    name="percentualDepreciacao"
                    label="Percentual de Depreciação"
                    rules={[{ required: true, message: 'Informe o percentual de depreciação' }]}
                >
                    <InputNumber min={0} max={100} step={0.01} className="w-full" placeholder="Digite o percentual" />
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

export default DepreciacaoForm;