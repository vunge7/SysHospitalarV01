import React, { useState, useEffect } from 'react';
import { remove as removeDiacritics } from 'diacritics';
import { Table, Button, Modal, Form, Input, Card, Typography, Popconfirm, InputNumber,
    Space, } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, UndoOutlined, } from '@ant-design/icons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { api } from '../../service/api';

const { Title, Text } = Typography;

function AvaliacaoExameRequisitado({
    examesRequisitados,
    setExamesRequisitados,
    fetchAllData,
}) {
    const [form] = Form.useForm();
    const [selectedExame, setSelectedExame] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRequisicao, setSelectedRequisicao] = useState(null);
    const [linhasRequisicao, setLinhasRequisicao] = useState([]);
    const [linhasResultado, setLinhasResultado] = useState([]);
    const [cachedLinhasResultado, setCachedLinhasResultado] = useState([]); // Cache para linhas de resultado
    const [produtos, setProdutos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [inscricoes, setInscricoes] = useState([]);
    const [requisicoesPendentes, setRequisicoesPendentes] = useState([]);

    // Função utilitária para normalizar nomes (remove acentos, títulos, espaços extras)
    const normalizeName = (name) => {
        if (!name) return '';
        return removeDiacritics(name)
            .toLowerCase()
            .replace(/^(dr\.?|dra\.?)/i, '')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Busca paciente por nome aproximado
    const findPacienteByName = (nome) => {
        const normNome = normalizeName(nome);
        let paciente = pacientes.find(p => normalizeName(p.nome || p.name || '') === normNome);
        if (paciente) return paciente;
        paciente = pacientes.find(p => normalizeName(p.nome || p.name || '').includes(normNome));
        if (paciente) return paciente;
        const firstWord = normNome.split(' ')[0];
        paciente = pacientes.find(p => normalizeName(p.nome || p.name || '').includes(firstWord));
        return paciente || null;
    };

    // Busca médico por nome aproximado
    const findMedicoByName = (nome) => {
        const normNome = normalizeName(nome);
        let medico = medicos.find(m => normalizeName(m.nome || m.designacao || m.name || '') === normNome);
        if (medico) return medico;
        medico = medicos.find(m => normalizeName(m.nome || m.designacao || m.name || '').includes(normNome));
        if (medico) return medico;
        const firstWord = normNome.split(' ')[0];
        medico = medicos.find(m => normalizeName(m.nome || m.designacao || m.name || '').includes(firstWord));
        return medico || null;
    };

    useEffect(() => {
        setLinhasRequisicao([]);
        setSelectedRequisicao(null);
        setCachedLinhasResultado([]); // Limpar cache quando requisições mudam
        fetchData();
    }, [examesRequisitados]);

    const fetchData = async () => {
        try {
            const [produtoRes, pacienteRes, usuarioRes, medicoRes, unidadeRes, inscricaoRes] = await Promise.all([
                api.get('produto/all'),
                api.get('paciente/all'),
                api.get('usuario/all'),
                api.get('medicos/all'),
                api.get('unidade/all'),
                api.get('inscricao/all'),
            ]);
            setProdutos(produtoRes.data || []);
            setPacientes(pacienteRes.data || []);
            setUsuarios(usuarioRes.data || []);
            setMedicos(medicoRes.data || []);
            setUnidades(unidadeRes.data || []);
            setInscricoes(inscricaoRes.data || []);
            if (!pacienteRes.data || pacienteRes.data.length === 0) {
                toast.error('Nenhum paciente encontrado.', { autoClose: 2000 });
            }
            if (!medicoRes.data || medicoRes.data.length === 0) {
                toast.error('Nenhum médico encontrado.', { autoClose: 2000 });
            }
        } catch (error) {
            toast.error('Erro ao buscar dados auxiliares: ' + (error.response?.data?.message || error.message), {
                autoClose: 2000,
            });
        }
    };

    const fetchLinhasRequisicao = async (requisicaoExameId) => {
        try {
            const response = await api.get(`/linharequisicaoexame/all/requisicao/${requisicaoExameId}`);
            const mappedData = response.data.map((item) => ({
                id: item.id,
                produtoId: item.produtoId || item.produto_id,
                exame: item.exame || item.designacao || 'N/A',
                estado: item.estado || 'NAO_EFECTUADO',
                hora: item.hora,
                requisicaoExameId: item.requisicaoExameId || item.requisicao_exame_id || null,
                status: item.status !== undefined ? item.status : true,
                finalizado: item.finalizado !== undefined ? item.finalizado : false,
            }));
            setLinhasRequisicao(mappedData);
        } catch (error) {
            toast.error('Erro ao buscar linhas de requisição: ' + (error.response?.data?.message || error.message), {
                autoClose: 2000,
            });
            setLinhasRequisicao([]);
        }
    };

    const fetchLinhasResultado = async () => {
        try {
            const res = await api.get('linharesultado/all');
            setLinhasResultado(res.data || []);
        } catch (error) {
            toast.error('Erro ao buscar linhas de resultado: ' + (error.response?.data?.message || error.message), {
                autoClose: 2000,
            });
        }
    };

    useEffect(() => {
        if (selectedRequisicao) {
            fetchLinhasRequisicao(selectedRequisicao.id);
            fetchLinhasResultado();
        }
    }, [selectedRequisicao]);

    const handleRowClick = (record) => {
        setSelectedRequisicao(record);
        setLinhasRequisicao([]);
        setCachedLinhasResultado([]); // Limpar cache ao selecionar nova requisição
        fetchLinhasRequisicao(record.id);
    };

    const showResultModal = (exame) => {
        if (!exame) {
            toast.error('Dados do exame inválidos!', { autoClose: 2000 });
            return;
        }
        setSelectedExame(exame);
        const linhaResultado = cachedLinhasResultado.find(lr => lr.exameId === exame.id) || 
                              linhasResultado.find(lr => lr.exameId === exame.id);
        form.setFieldsValue({
            valorReferencia: linhaResultado?.valorReferencia || null,
            observacao: linhaResultado?.observacao || '',
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedExame(null);
    };

    const getPacienteId = (requisicao) => {
        if (requisicao.pacienteId) {
            return requisicao.pacienteId;
        }
        const pacienteNome = requisicao.paciente || requisicao.pacienteNome;
        if (!pacienteNome) {
            toast.error('Nome do paciente está vazio na requisição.', { autoClose: 2000 });
            return null;
        }
        const paciente = findPacienteByName(pacienteNome);
        if (!paciente) {
            toast.error(`Paciente "${pacienteNome}" não encontrado.`, { autoClose: 2000 });
            return null;
        }
        return paciente.id;
    };

    const getUsuarioId = (requisicao) => {
        if (requisicao.usuarioId) {
            return requisicao.usuarioId;
        }
        const medicoNome = requisicao.medico || requisicao.medicoNome;
        if (!medicoNome) {
            toast.error('Nome do médico está vazio na requisição.', { autoClose: 2000 });
            return null;
        }
        const medico = findMedicoByName(medicoNome);
        if (!medico) {
            toast.error(`Médico "${medicoNome}" não encontrado.`, { autoClose: 2000 });
            return null;
        }
        const usuarioId = medico.funcionarioId || medico.usuarioId || medico.id;
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
            toast.error(`Usuário com ID ${usuarioId} não encontrado.`, { autoClose: 2000 });
            return null;
        }
        return usuarioId;
    };

    const getUnidadeId = (linha) => {
        if (!linha.produtoId) {
            toast.error('Produto ID não encontrado para o exame.', { autoClose: 2000 });
            return null;
        }
        const produto = produtos.find(p => p.id === linha.produtoId);
        if (!produto) {
            toast.error(`Produto com ID ${linha.produtoId} não encontrado.`, { autoClose: 2000 });
            return null;
        }
        const unidadeId = produto.unidadeMedidaId || produto.unidade_medida_id || null;
        if (!unidadeId) {
            toast.error(`Unidade de medida não encontrada para o produto ID ${linha.produtoId}.`, { autoClose: 2000 });
        }
        return unidadeId;
    };

    // Adiciona/edita resultado no cache local, não envia ao backend ainda
    const handleFinishResult = async (values) => {
        if (!selectedExame || !selectedRequisicao) {
            toast.error('Exame ou requisição não selecionados!', { autoClose: 2000 });
            return;
        }
        if (!values.valorReferencia && values.valorReferencia !== 0) {
            toast.error('Valor de referência é obrigatório!', { autoClose: 2000 });
            return;
        }
        if (isNaN(values.valorReferencia)) {
            toast.error('Valor de referência deve ser numérico!', { autoClose: 2000 });
            return;
        }
        const unidadeId = getUnidadeId(selectedExame);
        if (!unidadeId) {
            return;
        }

        // Adiciona/atualiza no cache local
        const linhaResultadoCache = {
            exameId: selectedExame.id,
            valorReferencia: Number(values.valorReferencia),
            unidadeId: unidadeId,
            observacao: values.observacao || '',
            requisicaoExameId: selectedRequisicao.id,
        };
        setCachedLinhasResultado(prev => [
            ...prev.filter(lr => lr.exameId !== selectedExame.id),
            linhaResultadoCache,
        ]);

        // Atualiza estado local da linha de requisição para reflectir "efetuado" e status "Inserido"
        setLinhasRequisicao(prev => prev.map(linha =>
            linha.id === selectedExame.id
                ? { ...linha, estado: 'efetuado', status: true }
                : linha
        ));
        toast.success('Resultado adicionado ao cache! Clique em "Finalizar" para salvar no sistema.', { autoClose: 2500 });
        handleCancel();
    };

    // Salva todos os resultados do cache no backend e finaliza a requisição
    const handleFinalizarExame = async () => {
        if (!selectedRequisicao) {
            toast.error('Nenhuma requisição selecionada!', { autoClose: 2000 });
            return;
        }
        setLoading(true);
        try {
            const pacienteId = getPacienteId(selectedRequisicao);
            const usuarioId = getUsuarioId(selectedRequisicao);
            if (!pacienteId || !usuarioId) {
                toast.error(`Paciente ID (${pacienteId}) ou usuário ID (${usuarioId}) não encontrado.`, {
                    autoClose: 2000,
                });
                return;
            }

            // Filtra resultados do cache para esta requisição
            const linhasParaSalvar = cachedLinhasResultado.filter(lr => lr.requisicaoExameId === selectedRequisicao.id);
            if (linhasParaSalvar.length === 0) {
                toast.error('Nenhum resultado no cache para salvar!', { autoClose: 2000 });
                return;
            }

            // Cria resultado principal
            const resultadoPayload = {
                requisicaoExameId: selectedRequisicao.id,
                pacienteId: pacienteId,
                usuarioId: usuarioId,
                dataResultado: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            const resultadoResponse = await api.post('/resultado/add', resultadoPayload);
            const resultadoId = resultadoResponse.data.id;

            // Cria todas as linhas de resultado individualmente
            const linhasResultadoPayload = linhasParaSalvar.map(linha => ({
                exameId: linha.exameId,
                valorReferencia: linha.valorReferencia,
                unidadeId: linha.unidadeId,
                observacao: linha.observacao,
                resultadoId: resultadoId,
            }));
            await Promise.all(
                linhasResultadoPayload.map(payload =>
                    api.post('/linharesultado/add', payload)
                )
            );
            
            // Atualiza todas as linhas de requisição para "efetuado" (enum backend)
            const updateLinhaRequisicaoPromises = linhasRequisicao.map((linha) => {
                const updatedLinha = {
                    ...linha,
                    estado: 'efetuado', // enum backend
                    hora: moment().toISOString(), // formato ISO
                    finalizado: true, // booleano
                };
                return api.put('/linharequisicaoexame/edit', updatedLinha);
            });
            await Promise.all(updateLinhaRequisicaoPromises);
            toast.success('Exame finalizado e resultados salvos com sucesso!', { autoClose: 2000 });
            // NOVA LÓGICA: só remover requisição se todas as linhas tiverem resultado inserido
            const linhasRestantes = linhasRequisicao.filter(linha => !isLinhaInserida(linha));
            if (linhasRestantes.length === 0) {
                setExamesRequisitados(prev => prev.filter(r => r.id !== selectedRequisicao.id));
                setSelectedRequisicao(null);
            }
            setLinhasRequisicao([]);
            setLinhasResultado([]);
            setCachedLinhasResultado([]); // Limpar cache após salvar
            fetchAllData();
        } catch (error) {
            toast.error(`Erro ao finalizar exame: ${error.response?.data?.message || error.message}`, {
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExame = async (id) => {
        try {
            await api.delete(`/linharequisicaoexame/${id}`);
            setCachedLinhasResultado(prev => prev.filter(lr => lr.exameId !== id));
            toast.success('Exame excluído com sucesso!', { autoClose: 2000 });
            fetchLinhasRequisicao(selectedRequisicao.id);
            fetchAllData();
        } catch (error) {
            toast.error('Erro ao excluir exame: ' + (error.response?.data?.message || error.message), {
                autoClose: 2000,
            });
        }
    };

    const handleReopenExame = async (exame) => {
        try {
            // Busca a linha de requisição mais atualizada do backend para garantir campos obrigatórios
            const response = await api.get(`/linharequisicaoexame/${exame.id}`);
            const linhaAtual = response.data;
            // Monta o payload com todos os campos obrigatórios e tipos corretos
            const updatedExame = {
                id: linhaAtual.id,
                produtoId: Number(linhaAtual.produtoId || linhaAtual.produto_id || 0),
                exame: linhaAtual.exame || linhaAtual.designacao || 'N/A',
                estado: 'NAO_EFECTUADO', // Enum exato do backend
                hora: linhaAtual.hora
                    ? moment(linhaAtual.hora).format('YYYY-MM-DDTHH:mm:ss')
                    : moment().format('YYYY-MM-DDTHH:mm:ss'),
                requisicaoExameId: Number(linhaAtual.requisicaoExameId || linhaAtual.requisicao_exame_id || 0),
                status: false,
                finalizado: false,
            };
            // Log para debug
            console.log('Payload para reabrir exame:', updatedExame);
            await api.put('/linharequisicaoexame/edit', updatedExame);
            const linhaResultado = linhasResultado.find(lr => lr.exameId === exame.id);
            if (linhaResultado) {
                await api.delete(`/linharesultado/${linhaResultado.id}`);
            }
            setCachedLinhasResultado(prev => prev.filter(lr => lr.exameId !== exame.id));
            toast.success('Exame reaberto com sucesso!', { autoClose: 2000 });
            fetchAllData();
            fetchLinhasRequisicao(selectedRequisicao.id);
            fetchLinhasResultado();
        } catch (error) {
            console.error('Erro ao reabrir exame:', error, error.response?.data);
            toast.error('Erro ao reabrir exame: ' + (error.response?.data?.message || error.message), {
                autoClose: 2000,
            });
        }
    };

    const isLinhaInserida = (linha) =>
        (linha.estado === 'EFECTUADO' || linha.status === true) ||
        cachedLinhasResultado.some(lr => lr.exameId === linha.id) ||
        linhasResultado.some(lr => lr.exameId === linha.id);

    const getPacienteNome = (record) => {
        const pacienteNome = record.paciente || record.pacienteNome;
        if (!pacienteNome) {
            return 'Paciente Desconhecido';
        }
        return pacienteNome;
    };

    const parseDate = (dateValue, fieldName, record) => {
        if (!dateValue) {
            return moment().format('DD/MM/YYYY HH:mm');
        }
        const parsedDate = moment(dateValue, [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY/MM/DD HH:mm:ss',
            'YYYY-MM-DDTHH:mm:ss',
            'YYYY-MM-DDTHH:mm:ss.SSS',
            'DD/MM/YYYY HH:mm:ss',
            'DD-MM-YYYY HH:mm:ss',
            moment.ISO_8601,
            moment.HTML5_FMT.DATETIME_LOCAL_MS,
            'DD/MM/YYYY HH:mm',
            'YYYY-MM-DD'
        ], true);
        if (parsedDate.isValid()) {
            return parsedDate.format('DD/MM/YYYY HH:mm');
        }
        return moment().format('DD/MM/YYYY HH:mm');
    };

    function getUsuarioNome(record) {
        const medicoNome = record.medico || record.medicoNome;
        if (!medicoNome) {
            return 'Médico Desconhecido';
        }
        return medicoNome;
    }

    const requisicoesColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Paciente',
            key: 'paciente',
            render: (_, record) => getPacienteNome(record),
        },
        {
            title: 'Médico',
            key: 'medico',
            render: (_, record) => getUsuarioNome(record),
        },
        {
            title: 'Data da Requisição',
            dataIndex: 'data',
            key: 'dataRequisicao',
            render: (data, record) => parseDate(data, 'Data da Requisição', record),
        },
    ];

    const examesColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Exame',
            dataIndex: 'exame',
            key: 'exame',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (text) => text || 'NAO_EFECTUADO',
        },
        {
            title: 'Hora',
            dataIndex: 'hora',
            key: 'hora',
            render: (hora, record) => parseDate(hora, 'Hora', record),
        },
        {
            title: 'Unidade',
            key: 'unidade',
            render: (_, record) => {
                const unidadeId = getUnidadeId(record);
                const unidade = unidades.find(u => u.id === unidadeId);
                return unidade ? `${unidade.descricao} (${unidade.abrevicao})` : (unidadeId || 'Sem unidade');
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) =>
                isLinhaInserida(record) ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Inserido</span>
                ) : (
                    <span style={{ color: 'orange' }}>Pendente</span>
                ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space>
                    <Button
                        type={isLinhaInserida(record) ? 'default' : 'primary'}
                        disabled={isLinhaInserida(record)}
                        onClick={() => showResultModal(record)}
                    >
                        {isLinhaInserida(record) ? 'Inserido' : 'Inserir Resultado'}
                    </Button>
                    <Popconfirm
                        title="Excluir exame?"
                        onConfirm={() => handleDeleteExame(record.id)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                    {isLinhaInserida(record) && (
                        <Popconfirm
                            title="Reabrir exame?"
                            onConfirm={() => handleReopenExame(record)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button icon={<UndoOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const allLinhasInseridas = linhasRequisicao.length > 0 && 
        linhasRequisicao.every(linha => isLinhaInserida(linha));

    // Nova variável: pelo menos uma linha inserida
    const hasAnyLinhaInserida = linhasRequisicao.some(linha => isLinhaInserida(linha));

    // Nova função: verifica localmente se há pelo menos uma linha não inserida
    const isRequisicaoPendenteLocal = (requisicao) => {
        // Busca todas as linhas da requisição
        const linhas = linhasRequisicao.filter(l => l.requisicaoExameId === requisicao.id);
        if (linhas.length === 0) return false; // Se não há linhas, não mostrar
        const todasLinhasInseridas = linhas.every(linha => isLinhaInserida(linha));
        // Só some se todas as linhas inseridas E finalizado === true
        if (todasLinhasInseridas && (requisicao.finalizado === true || requisicao.finalizado === 1)) return false;
        // Caso contrário, permanece na lista
        return true;
    };

    // Filtra requisições pendentes ao montar ou quando examesRequisitados ou linhasRequisicao mudar
    useEffect(() => {
        let isMounted = true;
        const filtrarPendentes = async () => {
            if (!examesRequisitados || examesRequisitados.length === 0) {
                setRequisicoesPendentes([]);
                return;
            }
            const results = await Promise.all(
                examesRequisitados.map(async (req) => {
                    try {
                        const response = await api.get(`/linharequisicaoexame/all/requisicao/${req.id}`);
                        const linhas = response.data || [];
                        // Só some se todas as linhas estão finalizadas E estado do exame também está finalizado
                        const todasFinalizadas = linhas.length > 0 && linhas.every(
                            linha => (linha.finalizado === true || linha.finalizado === 1) &&
                                     (linha.estado === 'EFECTUADO' || linha.estado === 'efetuado')
                        );
                        return todasFinalizadas ? null : req;
                    } catch {
                        return req; // Se erro, mantém na lista
                    }
                })
            );
            if (isMounted) {
                setRequisicoesPendentes(results.filter(Boolean));
            }
        };
        filtrarPendentes();
        return () => {
            isMounted = false;
        };
    }, [examesRequisitados]);

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Avaliação de Exames Requisitados</Title>
            <Card title="Requisições de Exames" style={{ marginBottom: '24px' }}>
                {requisicoesPendentes.length === 0 ? (
                    <Text>Nenhuma requisição disponível.</Text>
                ) : (
                    <Table
                        columns={requisicoesColumns}
                        dataSource={requisicoesPendentes}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
                        rowSelection={{
                            type: 'radio',
                            onChange: (_, selectedRows) => handleRowClick(selectedRows[0]),
                            selectedRowKeys: selectedRequisicao ? [selectedRequisicao.id] : [],
                        }}
                    />
                )}
            </Card>
            {selectedRequisicao ? (
                <Card title={`Detalhes do Exame - Requisição ${selectedRequisicao.id}`}>
                    <Table
                        columns={examesColumns}
                        dataSource={linhasRequisicao}
                        rowKey="id"
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={handleFinalizarExame}
                        disabled={!hasAnyLinhaInserida}
                        loading={loading}
                    >
                        Finalizar
                    </Button>
                </Card>
            ) : (
                <Card>
                    <Text>Selecione uma requisição para ver os exames.</Text>
                </Card>
            )}

            <Modal
                title="Resultado do Exame"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                {selectedExame && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinishResult}
                    >
                        <Form.Item
                            name="valorReferencia"
                            label="Valor de Referência"
                            rules={[
                                { required: true, message: 'Insira o valor de referência' },
                                {
                                    validator: (_, value) =>
                                        !value || !isNaN(value)
                                            ? Promise.resolve()
                                            : Promise.reject('Valor deve ser numérico'),
                                },
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="observacao" label="Observação">
                            <Input.TextArea rows={4} placeholder="Observações sobre o exame" />
                        </Form.Item>
                        <Form.Item>
                            <Popconfirm
                                title="Adicionar resultado ao cache?"
                                onConfirm={() => form.submit()}
                                okText="Sim"
                                cancelText="Não"
                            >
                                <Button type="primary" loading={loading}>
                                    Adicionar Resultado
                                </Button>
                            </Popconfirm>
                            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
                                Cancelar
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
}

export default AvaliacaoExameRequisitado;