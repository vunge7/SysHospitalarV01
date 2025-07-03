import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Table, Input, Button, Modal, Form, Select, Popconfirm, Space, DatePicker, InputNumber, Tag, Tabs, message, Alert, Spin, Typography, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined, SaveOutlined, CloseOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment-timezone';
import { api } from '../../../service/api';
import { StockContext } from '../../../contexts/StockContext';
import './Farmacia.css';
import '../Monitoramento/Monitoramento.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const Farmacia = () => {
  const {
    armazens,
    filiais,
    produtos,
    lotes,
    fornecedores,
    linhasLotes,
    operacoesList,
    setFornecedores,
    setLotes,
    setLinhasLotes,
    setOperacoesList,
    loading: contextLoading,
    error: contextError,
  } = useContext(StockContext);
  const [activeSection, setActiveSection] = useState('entrada-saida');
  const [form] = Form.useForm();
  const [loteForm] = Form.useForm();
  const [fornecedorForm] = Form.useForm();
  const [linhasLotesForm] = Form.useForm();
  const [tempItens, setTempItens] = useState([]);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showLinhasLotesModal, setShowLinhasLotesModal] = useState(false);
  const [editLoteId, setEditLoteId] = useState(null);
  const [editFornecedorId, setEditFornecedorId] = useState(null);
  const [editLinhasLotesId, setEditLinhasLotesId] = useState(null);
  const [editOperacaoId, setEditOperacaoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  // Debug context data
  useEffect(() => {
    console.log('Context Data - Produtos:', produtos);
    console.log('Context Data - Lotes:', lotes);
    console.log('Context Data - Armazens:', armazens);
    console.log('Context Data - LinhasLotes:', linhasLotes);
    if (!produtos.length || !lotes.length || !armazens.length) {
      message.warning('Dados incompletos (produtos, lotes ou armazéns). Verifique a conexão com o backend.');
    }
  }, [produtos, lotes, armazens, linhasLotes]);

  const expirationThresholds = [
    { label: '1 Ano', days: 365 },
    { label: '9 Meses', days: 270 },
    { label: '6 Meses', days: 180 },
    { label: '3 Meses', days: 90 },
    { label: '1 Mês', days: 30 },
    { label: '3 Semanas', days: 21 },
    { label: '2 Semanas', days: 14 },
    { label: '1 Semana', days: 7 },
    { label: '5 Dias', days: 5 },
  ];

  useEffect(() => {
    setFilteredLotes(lotes);
  }, [lotes]);

  const expiringLotes = useMemo(() => {
    const now = moment().tz('Africa/Luanda').startOf('day');
    return lotes
      .map((lote) => {
        const vencimento = moment(lote.dataVencimento).tz('Africa/Luanda').startOf('day');
        const diasRestantes = vencimento.diff(now, 'days');
        const threshold = expirationThresholds.find(
          (t) => diasRestantes <= t.days && diasRestantes > (expirationThresholds[expirationThresholds.indexOf(t) + 1]?.days || 0)
        );
        return { ...lote, diasRestantes, threshold: threshold?.label };
      })
      .filter((lote) => lote.diasRestantes >= 0 && lote.threshold);
  }, [lotes]);

  useEffect(() => {
    let filtered = lotes;
    if (searchTerm) {
      filtered = filtered.filter(
        (lote) =>
          lote.designacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (produtos.find((p) => p.id === lote.produtoId)?.designacaoProduto || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== null) {
      filtered = filtered.filter((lote) => lote.status === (statusFilter === 'ativo'));
    }
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((lote) => {
        const vencimento = moment(lote.dataVencimento).tz('Africa/Luanda');
        return vencimento.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }
    setFilteredLotes(filtered);
  }, [lotes, produtos, searchTerm, statusFilter, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setDateRange([null, null]);
    setFilteredLotes(lotes);
  };

  const handleAddFornecedor = async (values) => {
    setLoading(true);
    try {
      const fornecedorDTO = {
        id: editFornecedorId || null,
        nome: values.nome,
        contacto: values.contacto,
        nif: values.nif,
        endereco: values.endereco,
        regimeTributario: values.regimeTributario,
        estadoFornecedor: values.estadoFornecedor || 'ATIVO',
        dataCriacao: editFornecedorId ? undefined : new Date().toISOString(),
      };
      if (editFornecedorId) {
        await api.put('/fornecedor/edit', fornecedorDTO);
        message.success('Fornecedor atualizado com sucesso');
      } else {
        await api.post('/fornecedor/add', fornecedorDTO);
        message.success('Fornecedor adicionado com sucesso');
      }
      setShowFornecedorModal(false);
      setEditFornecedorId(null);
      fornecedorForm.resetFields();
      const fornecedoresRes = await api.get('/fornecedor/all');
      setFornecedores(Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao salvar fornecedor: ${error.message}`;
      console.error('Erro ao salvar fornecedor:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFornecedor = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/fornecedor/${id}`);
      message.success('Fornecedor excluído com sucesso');
      const fornecedoresRes = await api.get('/fornecedor/all');
      setFornecedores(Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao excluir fornecedor: ${error.message}`;
      console.error('Erro ao excluir fornecedor:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLote = async (values) => {
    setLoading(true);
    try {
      const loteDTO = {
        id: editLoteId || null,
        usuarioId: 1, // Hardcoded as requested; ensure user ID 1 exists in the database
        designacao: values.designacao,
        dataCriacao: values.dataCriacao ? values.dataCriacao.toISOString() : moment().tz('Africa/Luanda').toISOString(),
        dataVencimento: values.dataVencimento ? values.dataVencimento.toISOString() : null,
        dataEntrada: values.dataEntrada ? values.dataEntrada.toISOString() : null,
        status: values.status !== undefined ? values.status : true,
      };
      if (editLoteId) {
        await api.put(`/lotes/${editLoteId}`, loteDTO);
        message.success('Lote atualizado com sucesso');
      } else {
        await api.post('/lotes/add', loteDTO);
        message.success('Lote adicionado com sucesso');
      }
      setShowLoteModal(false);
      setEditLoteId(null);
      loteForm.resetFields();
      const lotesRes = await api.get('/lotes/all');
      setLotes(Array.isArray(lotesRes.data) ? lotesRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao salvar lote: ${error.message}`;
      console.error('Erro ao salvar lote:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLote = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/lotes/${id}`);
      message.success('Lote excluído com sucesso');
      const lotesRes = await api.get('/lotes/all');
      setLotes(Array.isArray(lotesRes.data) ? lotesRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao excluir lote: ${error.message}`;
      console.error('Erro ao excluir lote:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLinhasLotes = async (values) => {
    setLoading(true);
    try {
      console.log('Form values (LinhasLotes):', values);
      const productGroup = produtos.find((p) => p.id === values.produtoId);
      if (!productGroup) {
        console.error('Produto não encontrado. ID:', values.produtoId);
        message.error(`Produto inválido: ID ${values.produtoId}`);
        return;
      }
      const lote = lotes.find((l) => l.id === values.lotes_id);
      if (!lote) {
        console.error('Lote não encontrado. ID:', values.lotes_id);
        message.error(`Lote inválido: ID ${values.lotes_id}`);
        return;
      }
      const linhasLotesDTO = {
        id: editLinhasLotesId || null,
        lotes_id: values.lotes_id,
        produto_id: productGroup.id,
        quantidade: values.quantidade.toString(),
      };
      console.log('Enviando LinhasLotesDTO:', linhasLotesDTO);
      if (editLinhasLotesId) {
        await api.put(`/linhaslotes/edit/${editLinhasLotesId}`, linhasLotesDTO);
        message.success('Linha de lote atualizada com sucesso');
      } else {
        await api.post('/linhaslotes/add', linhasLotesDTO);
        message.success('Linha de lote adicionada com sucesso');
      }
      setShowLinhasLotesModal(false);
      setEditLinhasLotesId(null);
      linhasLotesForm.resetFields();
      const linhasLotesRes = await api.get('/linhaslotes/all');
      setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || `Erro ao salvar linha de lote: ${error.message}`;
      console.error('Erro ao salvar linha de lote:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLinhasLotes = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/linhaslotes/${id}`);
      message.success('Linha de lote excluída com sucesso');
      const linhasLotesRes = await api.get('/linhaslotes/all');
      setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao excluir linha de lote: ${error.message}`;
      console.error('Erro ao excluir linha de lote:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOperacao = async () => {
    // WARNING: Suppressing backend errors as requested. This may cause data inconsistencies
    // if the backend fails to save the operation (e.g., 500 error). Ensure backend issues
    // are resolved to avoid discrepancies between frontend and backend state.
    try {
      const values = await form.validateFields();
      console.log('Form values (Operacao):', values);
      if (tempItens.length === 0) {
        message.error('Adicione pelo menos um item à operação');
        return;
      }

      // Validate prerequisites
      if (!produtos.length || !lotes.length || !armazens.length) {
        message.error('Dados de produtos, lotes ou armazéns não carregados. Verifique a conexão com o backend.');
        return;
      }

      // Validate armazemId
      const armazem = armazens.find((a) => a.id === values.armazemId);
      if (!armazem) {
        message.error(`Armazém inválido: ID ${values.armazemId} não encontrado`);
        return;
      }

      // Validate armazemDestinoId for TRANSFERENCIA
      if (values.tipoOperacao === 'TRANSFERENCIA') {
        if (!values.armazemDestinoId) {
          message.error('Armazém de destino é obrigatório para TRANSFERENCIA');
          return;
        }
        const armazemDestino = armazens.find((a) => a.id === values.armazemDestinoId);
        if (!armazemDestino) {
          message.error(`Armazém de destino inválido: ID ${values.armazemDestinoId} não encontrado`);
          return;
        }
      }

      // Validate each item in tempItens
      for (const itemGroup of tempItens) {
        for (const item of itemGroup.items) {
          const productGroup = produtos.find((p) => p.id === item.produtoId);
          const lote = lotes.find((l) => l.id === item.loteId);
          if (!productGroup) {
            message.error(`Produto inválido: ID ${item.produtoId} não encontrado`);
            return;
          }
          if (!lote) {
            message.error(`Lote inválido: ID ${item.loteId} não encontrado`);
            return;
          }
          if (!item.quantidade || item.quantidade <= 0) {
            message.error(`Quantidade inválida para o produto ${productGroup.designacaoProduto}: ${item.quantidade}`);
            return;
          }
        }
      }

      setLoading(true);

      const operacaoDTO = {
        id: editOperacaoId || null,
        dataOperacao : moment().tz('Africa/Luanda').format('YYYY-MM-DD HH:mm:ss'),
        tipoOperacao: values.tipoOperacao,
        usuarioId: 1,
        armazemId: values.armazemId,
        descricao: values.descricao || 'Operação registrada',
        linhas: tempItens.flatMap((itemGroup) =>
          itemGroup.items.map((item) => {
            const productGroup = produtos.find((p) => p.id === item.produtoId);
            const lote = lotes.find((l) => l.id === item.loteId);

            const existingLinha = linhasLotes.find(
              (linha) => linha.lotes_id === item.loteId && linha.produto_id === productGroup.id
            );
            const qtdAnterior = existingLinha ? Number(existingLinha.quantidade) : 0;
            let qtdActual = qtdAnterior;
            const qtdOperacao = Number(item.quantidade);

            if (values.tipoOperacao === 'ENTRADA') {
              qtdActual = qtdAnterior + qtdOperacao;
            } else if (values.tipoOperacao === 'SAIDA' || values.tipoOperacao === 'TRANSFERENCIA') {
              if (qtdAnterior < qtdOperacao) {
                throw new Error(`Quantidade insuficiente para o produto ${productGroup.designacaoProduto} no lote ${item.loteId}`);
              }
              qtdActual = qtdAnterior - qtdOperacao;
            } else if (values.tipoOperacao === 'ANULACAO') {
              qtdActual = qtdAnterior;
            }

            return {
              id: item.id || null,
              armazemIdOrigem: values.armazemId,
              loteIdOrigem: item.loteId,
              produtoId: productGroup.id,
              qtdAnterior: qtdAnterior.toString(),
              qtdOperacao: qtdOperacao.toString(),
              qtdActual: qtdActual.toString(),
              armazemIdDestino: values.tipoOperacao === 'TRANSFERENCIA' ? values.armazemDestinoId : null,
              loteIdDestino: values.tipoOperacao === 'TRANSFERENCIA' ? item.loteId : null,
              operacaoStockId: null,
            };
          })
        ),
      };

      console.log('Enviando OperacaoStockDTO:', JSON.stringify(operacaoDTO, null, 2));

      try {
        const endpoint = editOperacaoId ? `/operacao-stock/edit-with-linhas/${editOperacaoId}` : '/operacao-stock/add-with-linhas';
        const method = editOperacaoId ? api.put : api.post;
        const response = await method(endpoint, operacaoDTO);
        console.log('Resposta do backend:', response.data);
      } catch (error) {
        // Log error for debugging but do not show to user
        console.error('Erro na requisição:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.response?.data?.error || error.response?.data?.details || error.message,
          responseData: error.response?.data,
          headers: error.response?.headers,
        });
      }
      try {
        const [linhasLotesRes, operacoesRes] = await Promise.all([
          api.get('/linhaslotes/all'),
          api.get('/operacao-stock/all'),
        ]);
        setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
        setOperacoesList(Array.isArray(operacoesRes.data) ? operacoesRes.data : []);
      } catch (refreshError) {
        console.error('Erro ao atualizar dados após operação:', refreshError.message);
      }

      setTempItens([]);
      setEditOperacaoId(null);
      form.resetFields();
    } catch (error) {
      // Exit early if form validation fails (e.g., empty form)
      if (!error.errorFields) {
        // Handle non-validation errors (e.g., quantity issues)
        if (error.message && (error.message.includes('Quantidade insuficiente') || error.message.includes('inválido'))) {
          console.error('Erro de validação:', error.message);
          message.error(error.message);
        } else {
          console.error('Erro ao salvar operação:', error.message || error);
          // Still show success and update state for non-validation errors
          message.success('Operação concluída com sucesso');
          try {
            const [linhasLotesRes, operacoesRes] = await Promise.all([
              api.get('/linhaslotes/all'),
              api.get('/operacao-stock/all'),
            ]);
            setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
            setOperacoesList(Array.isArray(operacoesRes.data) ? operacoesRes.data : []);
          } catch (refreshError) {
            console.error('Erro ao atualizar dados após operação:', refreshError.message);
          }
          setTempItens([]);
          setEditOperacaoId(null);
          form.resetFields();
        }
      }
      // If errorFields exist (form validation failed, e.g., empty form), do nothing
    } finally {
      setLoading(false);
    }
  };

  const handleEditOperacao = async (record) => {
    try {
      const linhasRes = await api.get(`/linha-operacao-stock/lotes/${record.lotes[0]?.id}`);
      const tempItensData = (Array.isArray(linhasRes.data) ? linhasRes.data : []).map((linha) => ({
        loteId: linha.loteIdOrigem,
        loteDesignacao: lotes.find((l) => l.id === linha.loteIdOrigem)?.designacao || 'Desconhecido',
        items: [{
          id: linha.id,
          produtoId: linha.produtoId,
          designacaoProduto: produtos.find((p) => p.id === linha.produtoId)?.designacaoProduto || 'Desconhecido',
          quantidade: linha.qtdOperacao,
          loteId: linha.loteIdOrigem,
          qtdAnterior: linha.qtdAnterior,
          qtdActual: linha.qtdActual,
        }],
      }));
      setTempItens(tempItensData);
      setEditOperacaoId(record.id);
      form.setFieldsValue({
        tipoOperacao: record.tipoOperacao,
        armazemId: record.armazemId,
        armazemDestinoId: record.linhas[0]?.armazemIdDestino || null,
        descricao: record.descricao,
      });
      message.info('Operação carregada para edição');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || `Erro ao carregar operação: ${error.message}`;
      console.error('Erro ao carregar operação:', errorMsg);
      message.error(errorMsg);
    }
  };

  const handleDeleteOperacao = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/operacao-stock/${id}`);
      message.success('Operação excluída com sucesso');
      const operacoesRes = await api.get('/operacao-stock/all');
      setOperacoesList(Array.isArray(operacoesRes.data) ? operacoesRes.data : []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao excluir operação: ${error.message}`;
      console.error('Erro ao excluir operação:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await form.validateFields(['loteId', 'produtoId', 'quantidade']);
      console.log('Form values (AddItem):', values);
      const lote = lotes.find((l) => l.id === values.loteId);
      const productGroup = produtos.find((p) => p.id === values.produtoId);
      if (!lote) {
        console.error('Lote não encontrado. ID:', values.loteId);
        message.error(`Lote inválido: ID ${values.loteId} não encontrado`);
        return;
      }
      if (!productGroup) {
        console.error('Produto não encontrado. ID:', values.produtoId);
        message.error(`Produto inválido: ID ${values.produtoId} não encontrado`);
        return;
      }
      if (!values.quantidade || values.quantidade <= 0) {
        message.error('Quantidade deve ser maior que zero');
        return;
      }
      const newItem = {
        id: Date.now(),
        produtoId: productGroup.id,
        designacaoProduto: productGroup.designacaoProduto,
        quantidade: values.quantidade,
        loteId: values.loteId,
      };
      setTempItens((prev) => {
        const existingLote = prev.find((i) => i.loteId === values.loteId);
        if (existingLote) {
          return prev.map((i) =>
            i.loteId === values.loteId ? { ...i, items: [...i.items, newItem] } : i
          );
        }
        return [
          ...prev,
          {
            loteId: values.loteId,
            loteDesignacao: lote.designacao,
            items: [newItem],
          },
        ];
      });
      form.resetFields(['produtoId', 'quantidade', 'loteId']);
      message.success('Item adicionado à lista temporária');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      message.error('Preencha todos os campos obrigatórios');
    }
  };

  const tempItemColumns = [
    {
      title: 'Lote',
      dataIndex: 'loteDesignacao',
      key: 'loteDesignacao',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Produto',
      dataIndex: 'designacaoProduto',
      key: 'designacaoProduto',
      render: (_, record) =>
        record.items.map((item) => (
          <Tag color="green" key={item.id}>
            {item.designacaoProduto}
          </Tag>
        )),
    },
    {
      title: 'Quantidade',
      key: 'quantidade',
      render: (_, record) =>
        record.items.map((item) => (
          <div key={item.id}>
            <InputNumber
              min={1}
              value={item.quantidade}
              style={{ width: 100 }}
              onChange={(value) => {
                setTempItens((prev) =>
                  prev.map((i) =>
                    i.loteId === record.loteId
                      ? {
                          ...i,
                          items: i.items.map((it) =>
                            it.id === item.id ? { ...it, quantidade: value } : it
                          ),
                        }
                      : i
                  )
                );
              }}
            />
          </div>
        )),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.items.map((item) => (
            <Popconfirm
              key={item.id}
              title="Confirmar remoção do produto?"
              onConfirm={() => {
                setTempItens((prev) =>
                  prev.map((i) =>
                    i.loteId === record.loteId
                      ? { ...i, items: i.items.filter((it) => it.id !== item.id) }
                      : i
                  ).filter((i) => i.items.length > 0)
                );
              }}
              okText="OK"
              cancelText="Cancelar"
            >
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          ))}
          <Popconfirm
            title="Confirmar remoção do lote?"
            onConfirm={() => {
              setTempItens((prev) => prev.filter((i) => i.loteId !== record.loteId));
            }}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const operacaoColumns = [
    { title: 'Operação', dataIndex: 'tipoOperacao', key: 'tipoOperacao' },
    {
      title: 'Armazém Origem',
      key: 'armazem',
      render: (_, record) => armazens.find((a) => a.id === record.armazemId)?.designacao || '-',
    },
    {
      title: 'Armazém Destino',
      key: 'armazemDestino',
      render: (_, record) =>
        record.linhas[0]?.armazemIdDestino ? armazens.find((a) => a.id === record.linhas[0].armazemIdDestino)?.designacao || 'Desconhecido' : '-',
    },
    {
      title: 'Lotes',
      key: 'lotes',
      render: (_, record) => (Array.isArray(record.lotes) ? record.lotes.map((l) => lotes.find((lot) => lot.id === l.id)?.designacao || l.id).join(', ') : '-'),
    },
    {
      title: 'Produtos',
      key: 'produtos',
      render: async (_, record) => {
        try {
          if (!record.lotes?.[0]?.id) return '-';
          const linhasRes = await api.get(`/linha-operacao-stock/lotes/${record.lotes[0].id}`);
          return (Array.isArray(linhasRes.data) ? linhasRes.data : [])
            .map((linha) => `${produtos.find((p) => p.id === linha.produtoId)?.designacaoProduto || 'Desconhecido'} (Lote: ${lotes.find((l) => l.id === linha.loteIdOrigem)?.designacao || linha.loteIdOrigem}, Qty: ${linha.qtdOperacao})`)
            .join(', ');
        } catch {
          return '-';
        }
      },
    },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditOperacao(record)}
          />
          <Popconfirm
            title="Confirmar exclusão da operação?"
            onConfirm={() => handleDeleteOperacao(record.id)}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const loteColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    {
      title: 'Data de Criação',
      dataIndex: 'dataCriacao',
      key: 'dataCriacao',
      render: (date) => (date ? moment(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Data de Vencimento',
      dataIndex: 'dataVencimento',
      key: 'dataVencimento',
      render: (date) => (date ? moment(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Data de Entrada',
      dataIndex: 'dataEntrada',
      key: 'dataEntrada',
      render: (date) => (date ? moment(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={s ? 'green' : 'red'}>{s ? 'Ativo' : 'Inativo'}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditLoteId(record.id);
              loteForm.setFieldsValue({
                designacao: record.designacao,
                dataCriacao: record.dataCriacao ? moment(record.dataCriacao) : null,
                dataVencimento: record.dataVencimento ? moment(record.dataVencimento) : null,
                dataEntrada: record.dataEntrada ? moment(record.dataEntrada) : null,
                status: record.status,
              });
              setShowLoteModal(true);
            }}
          />
          <Popconfirm
            title="Confirmar exclusão do lote?"
            onConfirm={() => handleDeleteLote(record.id)}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const linhasLotesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Lote',
      dataIndex: 'lotes_id',
      key: 'lotes_id',
      render: (lotes_id) => lotes.find((l) => l.id === lotes_id)?.designacao || 'Desconhecido',
    },
    {
      title: 'Produto',
      dataIndex: 'produto_id',
      key: 'produto_id',
      render: (produto_id) => produtos.find((p) => p.id === produto_id)?.designacaoProduto || 'Desconhecido',
    },
    { title: 'Quantidade', dataIndex: 'quantidade', key: 'quantidade' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditLinhasLotesId(record.id);
              linhasLotesForm.setFieldsValue({
                lotes_id: record.lotes_id,
                produtoId: record.produto_id,
                quantidade: record.quantidade,
              });
              setShowLinhasLotesModal(true);
            }}
          />
          <Popconfirm
            title="Confirmar exclusão da linha de lote?"
            onConfirm={() => handleDeleteLinhasLotes(record.id)}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expiringLoteColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    {
      title: 'Data de Vencimento',
      dataIndex: 'dataVencimento',
      key: 'dataVencimento',
      render: (date) => moment(date).tz('Africa/Luanda').format('YYYY-MM-DD'),
    },
    {
      title: 'Dias Restantes',
      dataIndex: 'diasRestantes',
      key: 'diasRestantes',
      render: (days) => (
        <Tag color={days <= 30 ? 'red' : days <= 90 ? 'orange' : 'green'}>
          {days} dias
        </Tag>
      ),
    },
    { title: 'Alerta', dataIndex: 'threshold', key: 'threshold' },
  ];

  const fornecedorColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Contato', dataIndex: 'contacto', key: 'contacto', render: (c) => c || '-' },
    { title: 'NIF', dataIndex: 'nif', key: 'nif' },
    { title: 'Endereço', dataIndex: 'endereco', key: 'endereco', render: (e) => e || '-' },
    { title: 'Regime Tributário', dataIndex: 'regimeTributario', key: 'regimeTributario' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditFornecedorId(record.id);
              fornecedorForm.setFieldsValue({
                nome: record.nome,
                contacto: record.contacto,
                nif: record.nif,
                endereco: record.endereco,
                regimeTributario: record.regimeTributario,
                estadoFornecedor: record.estadoFornecedor,
              });
              setShowFornecedorModal(true);
            }}
          />
          <Popconfirm
            title="Confirmar exclusão?"
            onConfirm={() => handleDeleteFornecedor(record.id)}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderSection = () => (
    <div>
      {activeSection === 'entrada-saida' && (
        <div className="section-content">
          <h2>{editOperacaoId ? 'Editar Operação' : 'Registrar Operação'}</h2>
          {(produtos.length === 0 || armazens.length === 0 || lotes.length === 0) && (
            <Alert
              message="Aviso"
              description="Dados insuficientes (produtos, armazéns ou lotes). Verifique se os dados foram carregados corretamente."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form form={form} layout="vertical" className="operation-form">
            <div className="form-grid">
              <Form.Item name="tipoOperacao" label="Tipo de Operação" rules={[{ required: true, message: 'Selecione o tipo de operação' }]}>
                <Select placeholder="Selecione a operação">
                  {['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'ANULACAO'].map((op) => (
                    <Option key={op} value={op}>{op}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="armazemId" label="Armazém" rules={[{ required: true, message: 'Selecione o armazém' }]}>
                <Select placeholder="Selecione o armazém" showSearch optionFilterProp="children">
                  {armazens.map((armazem) => (
                    <Option key={armazem.id} value={armazem.id}>
                      {armazem.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.tipoOperacao !== currentValues.tipoOperacao}
              >
                {({ getFieldValue }) =>
                  getFieldValue('tipoOperacao') === 'TRANSFERENCIA' && (
                    <Form.Item name="armazemDestinoId" label="Armazém Destino" rules={[{ required: true, message: 'Selecione o armazém de destino' }]}>
                      <Select placeholder="Selecione o armazém de destino" showSearch optionFilterProp="children">
                        {armazens.map((armazem) => (
                          <Option key={armazem.id} value={armazem.id}>
                            {armazem.designacao}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )
                }
              </Form.Item>
              <Form.Item name="loteId" label="Lote" rules={[{ required: true, message: 'Selecione o lote' }]}>
                <Select placeholder="Selecione o lote" showSearch optionFilterProp="children">
                  {lotes.map((lote) => (
                    <Option key={lote.id} value={lote.id}>
                      {lote.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="produtoId" label="Produto" rules={[{ required: true, message: 'Selecione o produto' }]}>
                <Select
                  placeholder="Selecione o produto"
                  showSearch
                  optionFilterProp="children"
                  disabled={produtos.length === 0}
                >
                  {produtos.map((produto) => (
                    <Option key={produto.id} value={produto.id}>
                      {produto.designacaoProduto}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="quantidade" label="Quantidade" rules={[{ required: true, message: 'Digite a quantidade' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="descricao" label="Descrição" rules={[{ required: true, message: 'Descrição é obrigatória' }]}>
                <Input.TextArea rows={2} placeholder="Descrição da operação" />
              </Form.Item>
            </div>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                Adicionar Item
              </Button>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={() => setTempItens([])}
              >
                Limpar Itens
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveOperacao} loading={loading}>
                Finalizar Operação
              </Button>
            </Space>
          </Form>
          {tempItens.length > 0 && (
            <Table
              dataSource={tempItens}
              columns={tempItemColumns}
              rowKey="loteId"
              pagination={false}
              style={{ marginTop: 16 }}
              title={() => <h3>Itens Temporários</h3>}
            />
          )}
         
        </div>
      )}
      {activeSection === 'lotes' && (
        <div className="section-content">
          <h2>Gerenciar Lotes</h2>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowLoteModal(true);
                setEditLoteId(null);
                loteForm.resetFields();
              }}
            >
              Adicionar Lote
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowLinhasLotesModal(true);
                setEditLinhasLotesId(null);
                linhasLotesForm.resetFields();
              }}
            >
              Adicionar Linha de Lote
            </Button>
          </Space>
          <Table
            dataSource={lotes}
            columns={loteColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
            title={() => <h3>Lotes</h3>}
          />
          <Table
            dataSource={linhasLotes}
            columns={linhasLotesColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
            title={() => <h3>Linhas de Lotes</h3>}
          />
        </div>
      )}
      {activeSection === 'fornecedores' && (
        <div className="section-content">
          <h2>Gerenciar Fornecedores</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
            onClick={() => {
              setShowFornecedorModal(true);
              setEditFornecedorId(null);
              fornecedorForm.resetFields();
            }}
          >
            Adicionar Fornecedor
          </Button>
          <Table
            dataSource={fornecedores}
            columns={fornecedorColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
          />
        </div>
      )}
      {activeSection === 'monitoramento' && (
        <div className="monitoramento-container">
          <Title level={2} className="section-title">Monitoramento de Estoque</Title>
          <div className="filters">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Pesquisar por designação ou nome do produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250, marginRight: 16 }}
              disabled={loading || contextLoading}
            />
            <Select
              placeholder="Filtrar por status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 150, marginRight: 16 }}
              allowClear
              disabled={loading || contextLoading}
            >
              <Option value="ativo">Ativo</Option>
              <Option value="inativo">Inativo</Option>
            </Select>
            <RangePicker
              format="YYYY-MM-DD"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ marginRight: 16 }}
              placeholder={['Data Início', 'Data Fim']}
              disabled={loading || contextLoading}
            />
            <Button
              icon={<FilterOutlined />}
              type="primary"
              style={{ marginRight: 8 }}
              disabled={loading || contextLoading}
            >
              Aplicar Filtros
            </Button>
            <Button onClick={clearFilters} disabled={loading || contextLoading}>
              Limpar Filtros
            </Button>
          </div>
          {expiringLotes.length > 0 && (
            <Alert
              message="Lotes Próximos do Vencimento"
              description={`Existem ${expiringLotes.length} lotes com vencimento em até um ano.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Title level={3}>Lotes Próximos do Vencimento</Title>
          <Table
            columns={expiringLoteColumns}
            dataSource={expiringLotes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            className="custom-table"
            style={expiringLotes.length > 0 ? { marginBottom: 24 } : { marginBottom: 0 }}
            locale={{ emptyText: 'Nenhum lote próximo do vencimento encontrado.' }}
          />
          <Title level={3}>Lotes</Title>
          <Table
            columns={loteColumns}
            dataSource={filteredLotes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            className="custom-table"
            style={{ marginBottom: 24 }}
            locale={{ emptyText: 'Nenhum lote encontrado.' }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="farmacia-container">
      <Spin spinning={loading || contextLoading}>
        {error || contextError ? (
          <Alert message="Erro" description={error || contextError} type="error" showIcon />
        ) : (
          <>
            <Tabs
              activeKey={activeSection}
              onChange={setActiveSection}
              type="card"
              style={{ padding: '0 16px' }}
            >
              <TabPane tab="Entrada/Saída" key="entrada-saida" />
              <TabPane tab="Lotes" key="lotes" />
              <TabPane tab="Fornecedores" key="fornecedores" />
              <TabPane tab="Monitoramento" key="monitoramento" />
            </Tabs>
            <div className="content">{renderSection()}</div>
          </>
        )}
        <Modal
          title={editLoteId ? 'Editar Lote' : 'Adicionar Lote'}
          open={showLoteModal}
          onCancel={() => {
            setShowLoteModal(false);
            setEditLoteId(null);
            loteForm.resetFields();
          }}
          footer={null}
        >
          <Form form={loteForm} layout="vertical" onFinish={handleAddLote}>
            <Form.Item
              name="designacao"
              label="Designação"
              rules={[{ required: true, message: 'Digite a designação' }]}
            >
              <Input placeholder="Digite a designação" />
            </Form.Item>
            <Form.Item
              name="dataCriacao"
              label="Data de Criação"
              rules={[{ required: true, message: 'Selecione a data de criação' }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="dataVencimento"
              label="Data de Vencimento"
              rules={[{ required: true, message: 'Selecione a data de vencimento' }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="dataEntrada"
              label="Data de Entrada"
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Salvar
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setShowLoteModal(false);
                    setEditLoteId(null);
                    loteForm.resetFields();
                  }}
                  icon={<CloseOutlined />}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={editFornecedorId ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          open={showFornecedorModal}
          onCancel={() => {
            setShowFornecedorModal(false);
            setEditFornecedorId(null);
            fornecedorForm.resetFields();
          }}
          footer={null}
        >
          <Form form={fornecedorForm} layout="vertical" onFinish={handleAddFornecedor}>
            <Form.Item
              name="nome"
              label="Nome"
              rules={[{ required: true, message: 'Digite o nome' }]}
            >
              <Input placeholder="Digite o nome" />
            </Form.Item>
            <Form.Item
              name="contacto"
              label="Contato"
              rules={[{ required: true, message: 'Digite o contato' }]}
            >
              <Input placeholder="Digite o contato" />
            </Form.Item>
            <Form.Item
              name="nif"
              label="NIF"
              rules={[{ required: true, message: 'Digite o NIF' }]}
            >
              <Input placeholder="Digite o NIF" />
            </Form.Item>
            <Form.Item
              name="endereco"
              label="Endereço"
              rules={[{ required: true, message: 'Digite o endereço' }]}
            >
              <Input placeholder="Digite o endereço" />
            </Form.Item>
            <Form.Item
              name="regimeTributario"
              label="Regime Tributário"
              rules={[{ required: true, message: 'Selecione o regime' }]}
            >
              <Select placeholder="Selecione o regime">
                <Option value="GERAL">Geral</Option>
                <Option value="SIMPLIFICADO">Simplificado</Option>
                <Option value="EXCLUSAO">Exclusão</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="estadoFornecedor"
              label="Estado"
              rules={[{ required: true, message: 'Selecione o estado' }]}
            >
              <Select placeholder="Selecione o estado">
                <Option value="ATIVO">Ativo</Option>
                <Option value="INATIVO">Inativo</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Salvar
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setShowFornecedorModal(false);
                    setEditFornecedorId(null);
                    fornecedorForm.resetFields();
                  }}
                  icon={<CloseOutlined />}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={editLinhasLotesId ? 'Editar Linha de Lote' : 'Adicionar Linha de Lote'}
          open={showLinhasLotesModal}
          onCancel={() => {
            setShowLinhasLotesModal(false);
            setEditLinhasLotesId(null);
            linhasLotesForm.resetFields();
          }}
          footer={null}
        >
          <Form form={linhasLotesForm} layout="vertical" onFinish={handleAddLinhasLotes}>
            <Form.Item
              name="lotes_id"
              label="Lote"
              rules={[{ required: true, message: 'Selecione o lote' }]}
            >
              <Select placeholder="Selecione o lote" showSearch optionFilterProp="children">
                {lotes.map((lote) => (
                  <Option key={lote.id} value={lote.id}>
                    {lote.designacao}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="produtoId"
              label="Produto"
              rules={[{ required: true, message: 'Selecione o produto' }]}
            >
              <Select
                placeholder="Selecione o produto"
                showSearch
                optionFilterProp="children"
                disabled={produtos.length === 0}
              >
                {produtos.map((produto) => (
                  <Option key={produto.id} value={produto.id}>
                    {produto.designacaoProduto}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="quantidade"
              label="Quantidade"
              rules={[{ required: true, message: 'Digite a quantidade' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Salvar
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setShowLinhasLotesModal(false);
                    setEditLinhasLotesId(null);
                    linhasLotesForm.resetFields();
                  }}
                  icon={<CloseOutlined />}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Farmacia;