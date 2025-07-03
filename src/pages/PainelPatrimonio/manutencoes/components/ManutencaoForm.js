import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from 'antd';
import * as manutencaoService from '../services/manutencaoService';
import * as bemPatrimonialService from '../../bens-patrimoniais/services/bemPatrimonialService';
import * as usuarioService from '../../../PainelPatrimonio/usuarios/services/UsuarioService';
import moment from 'moment';

const { Option } = Select;

function ManutencaoForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [bens, setBens] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bensResponse, usuariosResponse] = await Promise.all([
                    bemPatrimonialService.getAllByStatus(true),
                    usuarioService.getAllByStatus(true),
                ]);
                setBens(bensResponse.data);
                setUsuarios(usuariosResponse.data);

                if (id) {
                    const response = await manutencaoService.getById(id);
                    const manutencao = response.data;
                    form.setFieldsValue({
                        bemPatrimonialId: manutencao.bemPatrimonial?.id,
                        tipoManutencao: manutencao.tipoManutencao,
                        dataManutencao: manutencao.dataManutencao ? moment(manutencao.dataManutencao) : null,
                        descricao: manutencao.descricao,
                        custo: manutencao.custo,
                        responsavelId: manutencao.responsavel?.id,
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
            const manutencao = {
                bemPatrimonial: { id: values.bemPatrimonialId },
                tipoManutencao: values.tipoManutencao,
                dataManutencao: values.dataManutencao ? values.dataManutencao.format('YYYY-MM-DD') : null,
                descricao: values.descricao,
                custo: values.custo,
                responsavel: { id: values.responsavelId },
                status: true,
            };

            if (id) {
                await manutencaoService.atualizar(id, manutencao);
                message.success('Manutenção atualizada com sucesso.');
            } else {
                await manutencaoService.criar(manutencao);
                message.success('Manutenção criada com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar manutenção.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Manutenção' : 'Nova Manutenção'}
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
                    name="tipoManutencao"
                    label="Tipo de Manutenção"
                    rules={[{ required: true, message: 'Selecione o tipo de manutenção' }]}
                >
                    <Select placeholder="Selecione o tipo">
                        <Option value="PREVENTIVA">Preventiva</Option>
                        <Option value="CORRETIVA">Corretiva</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="dataManutencao"
                    label="Data de Manutenção"
                    rules={[{ required: true, message: 'Selecione a data de manutenção' }]}
                >
                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
                <Form.Item name="descricao" label="Descrição">
                    <Input.TextArea rows={4} placeholder="Digite a descrição" />
                </Form.Item>
                <Form.Item
                    name="custo"
                    label="Custo"
                    rules={[{ required: true, message: 'Informe o custo' }]}
                >
                    <InputNumber min={0} step={0.01} className="w-full" placeholder="Digite o custo" />
                </Form.Item>
                <Form.Item
                    name="responsavelId"
                    label="Responsável"
                    rules={[{ required: true, message: 'Selecione o responsável' }]}
                >
                    <Select placeholder="Selecione um responsável">
                        {usuarios.map(usuario => (
                            <Option key={usuario.id} value={usuario.id}>
                                {usuario.nome}
                            </Option>
                        ))}
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

export default ManutencaoForm;