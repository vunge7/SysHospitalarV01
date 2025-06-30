import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import * as movimentacaoService from '../services/MovimentacaoService';
import * as bemPatrimonialService from '../../bens-patrimoniais/services/bemPatrimonialService';
import * as localizacaoService from '../../localizacoes/services/localizacaoService';
import * as usuarioService from '../../usuarios/services/UsuarioService';
import moment from 'moment';

const { Option } = Select;

function MovimentacaoForm() {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [bens, setBens] = useState([]);
    const [localizacoes, setLocalizacoes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bensResponse, localizacoesResponse, usuariosResponse] = await Promise.all([
                    bemPatrimonialService.getAllByStatus(true),
                    localizacaoService.getAllByStatus(true),
                    usuarioService.getAllByStatus(true),
                ]);
                setBens(bensResponse.data);
                setLocalizacoes(localizacoesResponse.data);
                setUsuarios(usuariosResponse.data);

                if (id) {
                    const response = await movimentacaoService.getById(id);
                    const movimentacao = response.data;
                    form.setFieldsValue({
                        bemPatrimonialId: movimentacao.bemPatrimonial?.id,
                        localizacaoOrigemId: movimentacao.localizacaoOrigem?.id,
                        localizacaoDestinoId: movimentacao.localizacaoDestino?.id,
                        responsavelId: movimentacao.responsavel?.id,
                        dataMovimentacao: movimentacao.dataMovimentacao ? moment(movimentacao.dataMovimentacao) : null,
                        motivo: movimentacao.motivo,
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
            const movimentacao = {
                bemPatrimonial: { id: values.bemPatrimonialId },
                localizacaoOrigem: { id: values.localizacaoOrigemId },
                localizacaoDestino: { id: values.localizacaoDestinoId },
                responsavel: { id: values.responsavelId },
                dataMovimentacao: values.dataMovimentacao ? values.dataMovimentacao.format('YYYY-MM-DD') : null,
                motivo: values.motivo,
                status: true,
            };

            if (id) {
                await movimentacaoService.atualizar(id, movimentacao);
                message.success('Movimentação atualizada com sucesso.');
            } else {
                await movimentacaoService.criar(movimentacao);
                message.success('Movimentação criada com sucesso.');
            }
            navigate('/'); // Volta para o PainelPatrimonio
            setLoading(false);
        } catch (err) {
            message.error('Erro ao salvar movimentação.');
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {id ? 'Editar Movimentação' : 'Nova Movimentação'}
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
                    name="localizacaoOrigemId"
                    label="Localização de Origem"
                    rules={[{ required: true, message: 'Selecione a localização de origem' }]}
                >
                    <Select placeholder="Selecione a localização de origem">
                        {localizacoes.map(loc => (
                            <Option key={loc.id} value={loc.id}>
                                {loc.nome}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="localizacaoDestinoId"
                    label="Localização de Destino"
                    rules={[{ required: true, message: 'Selecione a localização de destino' }]}
                >
                    <Select placeholder="Selecione a localização de destino">
                        {localizacoes.map(loc => (
                            <Option key={loc.id} value={loc.id}>
                                {loc.nome}
                            </Option>
                        ))}
                    </Select>
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
                <Form.Item
                    name="dataMovimentacao"
                    label="Data de Movimentação"
                    rules={[{ required: true, message: 'Selecione a data de movimentação' }]}
                >
                    <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
                <Form.Item
                    name="motivo"
                    label="Motivo"
                    rules={[{ required: true, message: 'Informe o motivo da movimentação' }]}
                >
                    <Input.TextArea rows={4} placeholder="Digite o motivo" />
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

export default MovimentacaoForm;
