import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Modal, Form, Select, Popconfirm, Space,
   DatePicker, InputNumber, Tag, Tabs, message, Alert, Spin, Typography, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, SearchOutlined }
   from '@ant-design/icons';
import moment from 'moment';
import 'moment-timezone';
import { api } from '../../../service/api';
import { StockContext } from '../../../contexts/StockContext';
import './Farmacia.css';
import '../Monitoramento/Monitoramento.css';
import { debounce } from 'lodash';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const Farmacia = () => {
  const {
    armazens, produtos, lotes, fornecedores, linhasLotes, operacoesList,productTypes,
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
  const [editItemId, setEditItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState([]);
  const [loteSearch, setLoteSearch] = useState('');
  const [loteStatus, setLoteStatus] = useState(null);
  const [loteDateRange, setLoteDateRange] = useState([null, null]);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const [fornecedorEstado, setFornecedorEstado] = useState(null);
  const [selectedLoteId, setSelectedLoteId] = useState(null);

  useEffect(() => {
    console.log('Produtos no Farmacia.js:', produtos);
    console.log('ProductTypes no Farmacia.js:', productTypes);
    console.log('Mapeamento de produtos:', 
      produtos.map(p => ({
        id: p.id,
        productDescription: p.productDescription || 'N/A',
        productGroupId: p.productGroupId || 'N/A',
        productTypeMatch: productTypes.find(pt => pt.designacaoTipoProduto === p.productDescription)?.designacaoTipoProduto || 'Sem Correspondência'
      }))
    );
    const produto23 = produtos.find(p => p.id === 23);
    if (produto23) {
      console.log('Produto ID 23:', produto23);
      if (!produto23.productDescription) {
        message.warning('Produto ID 23 não possui productDescription definido.');
      }
    }
  }, [produtos, productTypes]);

  useEffect(() => {
    console.log('Context Data - Produtos:', produtos);
    console.log('Context Data - Lotes:', lotes);
    console.log('Context Data - Armazens:', armazens);
    console.log('Context Data - LinhasLotes:', linhasLotes);
    console.log('Context Data - ProductTypes:', productTypes);
    if (!produtos.length || !lotes.length || !armazens.length) {
      message.warning('Dados incompletos (produtos, lotes ou armazéns). Verifique a conexão com o backend.');
    }
  }, [produtos, lotes, armazens, linhasLotes, productTypes]);

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

  const debouncedSetLoteSearch = useCallback(
    debounce((value) => setLoteSearch(value), 300),
    []
  );

  useEffect(() => {
    let filtered = lotes;
    if (loteSearch) {
      filtered = filtered.filter(
        (lote) =>
          lote.designacao?.toLowerCase().includes(loteSearch.toLowerCase()) ||
          (produtos.find((p) => p.id === lote.produtoId)?.productDescription || '')?.toLowerCase().includes(loteSearch.toLowerCase())
      );
    }
    if (loteStatus !== null) {
      filtered = filtered.filter((lote) => lote.status === (loteStatus === 'ativo'));
    }
    if (loteDateRange[0] && loteDateRange[1]) {
      filtered = filtered.filter((lote) => {
        const vencimento = moment(lote.dataVencimento).tz('Africa/Luanda');
        return vencimento.isBetween(loteDateRange[0], loteDateRange[1], 'day', '[]');
      });
    }
    setFilteredLotes(filtered);
  }, [lotes, produtos, loteSearch, loteStatus, loteDateRange]);

  const debouncedSetFornecedorSearch = useCallback(
    debounce((value) => setFornecedorSearch(value), 300),
    []
  );

  useEffect(() => {
    let filtered = fornecedores;
    if (fornecedorSearch) {
      filtered = filtered.filter((fornecedor) =>
        fornecedor.nome?.toLowerCase().includes(fornecedorSearch.toLowerCase())
      );
    }
    if (fornecedorEstado !== null) {
      filtered = filtered.filter((fornecedor) => fornecedor.estadoFornecedor === fornecedorEstado);
    }
    setFilteredFornecedores(filtered);
  }, [fornecedores, fornecedorSearch, fornecedorEstado]);

  const clearLoteFilters = () => {
    setLoteSearch('');
    setLoteStatus(null);
    setLoteDateRange([null, null]);
    setFilteredLotes(lotes);
  };

  const clearFornecedorFilters = () => {
    setFornecedorSearch('');
    setFornecedorEstado(null);
    setFilteredFornecedores(fornecedores);
  };

  const getProdutosByLote = (loteId) => {
    return linhasLotes
      .filter((linha) => linha.lotes_id === loteId)
      .map((linha) => {
        const produto = produtos.find((p) => p.id === linha.produto_id);
        return {
          id: linha.id,
          produtoId: linha.produto_id,
          productDescription: produto?.productDescription || 'Sem Descrição',
          quantidade: Number(linha.quantidade),
        };
      });
  };

  const handleAddItem = async () => {
    try {
      const values = await form.validateFields(['loteId', 'produtoId', 'quantidade']);
      const lote = lotes.find((l) => l.id === values.loteId);
      const produto = produtos.find((p) => p.id === values.produtoId);
      
      console.log('Produto selecionado (handleAddItem):', produto);
      console.log('Lote selecionado (handleAddItem):', lote);
      
      if (!lote) {
        message.error(`Lote inválido: ID ${values.loteId}`);
        return;
      }
      if (!produto) {
        message.error(`Produto não encontrado: ID ${values.produtoId}`);
        return;
      }
      if (!produto.productDescription) {
        message.error(`Produto ID ${values.produtoId} não possui descrição de produto definida.`);
        return;
      }
      if (!values.quantidade || values.quantidade <= 0) {
        message.error('Quantidade deve ser maior que zero');
        return;
      }
      const tipoOperacao = form.getFieldValue('tipoOperacao');
      if (tipoOperacao === 'SAIDA' || tipoOperacao === 'TRANSFERENCIA' || tipoOperacao === 'ANULACAO') {
        const existingLinha = linhasLotes.find(
          (linha) => linha.lotes_id === values.loteId && linha.produto_id === produto.id
        );
        const qtdDisponivel = existingLinha ? Number(existingLinha.quantidade) : 0;
        if (qtdDisponivel < values.quantidade) {
          message.error(`Quantidade insuficiente no lote ${lote.designacao} para o produto ${produto.productDescription} (Disponível: ${qtdDisponivel})`);
          return;
        }
      }
      const newItem = {
        id: editItemId || Date.now(),
        produtoId: produto.id,
        designacaoTipoProduto: produto.productDescription || 'Sem Descrição',
        quantidade: values.quantidade,
        loteId: values.loteId,
        loteDesignacao: lote.designacao,
      };
      setTempItens((prev) =>
        editItemId
          ? prev.map((item) => (item.id === editItemId ? newItem : item))
          : [...prev, newItem]
      );
      form.resetFields(['produtoId', 'quantidade', 'loteId']);
      setEditItemId(null);
      setSelectedLoteId(null);
      message.success(editItemId ? 'Item atualizado na lista temporária' : 'Item adicionado à lista temporária');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      message.error('Preencha os campos de lote, produto e quantidade corretamente');
    }
  };

  const handleEditItem = (record) => {
    form.setFieldsValue({
      loteId: record.loteId,
      produtoId: record.produtoId,
      quantidade: record.quantidade,
    });
    setEditItemId(record.id);
    setSelectedLoteId(record.loteId);
  };

  const handleSaveOperacao = async () => {
    if (tempItens.length === 0) {
      message.error('Adicione pelo menos um item à operação');
      return;
    }
    try {
      const values = await form.validateFields(['tipoOperacao', 'armazemId', 'descricao']);
      const armazem = armazens.find((a) => a.id === values.armazemId);
      if (!armazem) {
        message.error(`Armazém inválido: ID ${values.armazemId}`);
        return;
      }
      if (values.tipoOperacao === 'TRANSFERENCIA' && !values.armazemDestinoId) {
        message.error('Armazém de destino é obrigatório para TRANSFERENCIA');
        return;
      }
      const armazemDestino = values.tipoOperacao === 'TRANSFERENCIA' ? armazens.find((a) => a.id === values.armazemDestinoId) : null;
      if (values.tipoOperacao === 'TRANSFERENCIA' && !armazemDestino) {
        message.error(`Armazém de destino inválido: ID ${values.armazemDestinoId}`);
        return;
      }
      setLoading(true);
      const operacaoDTO = {
        id: editOperacaoId || null,
        dataOperacao: moment().tz('Africa/Luanda').format('YYYY-MM-DD HH:mm:ss'),
        tipoOperacao: values.tipoOperacao,
        usuarioId: 1,
        armazemId: values.armazemId,
        descricao: values.descricao || `Operação ${values.tipoOperacao}`,
        linhas: tempItens.map((item) => {
          const produto = produtos.find((p) => p.id === item.produtoId);
          const lote = lotes.find((l) => l.id === item.loteId);
          const existingLinha = linhasLotes.find(
            (linha) => linha.lotes_id === item.loteId && linha.produto_id === produto.id
          );
          const qtdAnterior = existingLinha ? Number(existingLinha.quantidade) : 0;
          let qtdActual = qtdAnterior;
          const qtdOperacao = Number(item.quantidade);

          if (values.tipoOperacao === 'ENTRADA') {
            qtdActual = qtdAnterior + qtdOperacao;
          } else if (['SAIDA', 'TRANSFERENCIA', 'ANULACAO'].includes(values.tipoOperacao)) {
            if (qtdAnterior < qtdOperacao) {
              throw new Error(`Quantidade insuficiente para o produto ${produto.productDescription || 'Sem Descrição'} no lote ${lote?.designacao || 'Desconhecido'} (Disponível: ${qtdAnterior})`);
            }
            qtdActual = qtdAnterior - qtdOperacao;
          }

          return {
            id: item.id && !isNaN(item.id) ? item.id : null,
            armazemIdOrigem: values.armazemId,
            loteIdOrigem: item.loteId,
            produtoId: produto.id,
            qtdAnterior: qtdAnterior.toString(),
            qtdOperacao: qtdOperacao.toString(),
            qtdActual: qtdActual.toString(),
            armazemIdDestino: values.tipoOperacao === 'TRANSFERENCIA' ? values.armazemDestinoId : null,
            loteIdDestino: values.tipoOperacao === 'TRANSFERENCIA' ? item.loteId : null,
            operacaoStockId: null,
          };
        }),
      };
      const endpoint = editOperacaoId ? `/operacao-stock/edit-with-linhas/${editOperacaoId}` : '/operacao-stock/add-with-linhas';
      const method = editOperacaoId ? api.put : api.post;
      await method(endpoint, operacaoDTO);
      message.success('Operação salva com sucesso');
      const [linhasLotesRes, operacoesRes] = await Promise.all([
        api.get('/linhaslotes/all'),
        api.get('/operacao-stock/all'),
      ]);
      setLinhasLotes(Array.isArray(linhasLotesRes.data) ? linhasLotesRes.data : []);
      setOperacoesList(Array.isArray(operacoesRes.data) ? operacoesRes.data : []);
      setTempItens([]);
      setEditOperacaoId(null);
      setEditItemId(null);
      setSelectedLoteId(null);
      form.resetFields();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Erro ao salvar operação';
      console.error('Erro ao salvar operação:', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOperacao = async (record) => {
    try {
      const linhasRes = await api.get(`/linha-operacao-stock/lotes/${record.lotes[0]?.id}`);
      const tempItensData = (Array.isArray(linhasRes.data) ? linhasRes.data : []).map((linha) => {
        const produto = produtos.find((p) => p.id === linha.produtoId);
        const lote = lotes.find((l) => l.id === linha.loteIdOrigem);
        return {
          id: linha.id || Date.now() + Math.random(),
          produtoId: linha.produtoId,
          designacaoTipoProduto: produto?.productDescription || 'Sem Descrição',
          quantidade: Number(linha.qtdOperacao),
          loteId: linha.loteIdOrigem,
          loteDesignacao: lote?.designacao || 'Desconhecido',
        };
      });
      setTempItens(tempItensData);
      setEditOperacaoId(record.id);
      form.setFieldsValue({
        tipoOperacao: record.tipoOperacao,
        armazemId: record.armazemId,
        armazemDestinoId: record.linhas[0]?.armazemIdDestino || null,
        descricao: record.descricao,
      });
      setSelectedLoteId(record.lotes[0]?.id || null);
      message.info('Operação carregada para edição');
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Erro ao carregar operação: ${error.message}`;
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
        usuarioId: 1,
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
      const productGroup = produtos.find((p) => p.id === values.produtoId);
      const lote = lotes.find((l) => l.id === values.lotes_id);
      if (!productGroup) {
        message.error(`Produto inválido: ID ${values.produtoId}`);
        return;
      }
      if (!lote) {
        message.error(`Lote inválido: ID ${values.lotes_id}`);
        return;
      }
      const linhasLotesDTO = {
        id: editLinhasLotesId || null,
        lotes_id: values.lotes_id,
        produto_id: productGroup.id,
        quantidade: values.quantidade.toString(),
      };
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

  const lotesTableColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    {
      title: 'Data de Vencimento',
      dataIndex: 'dataVencimento',
      key: 'dataVencimento',
      render: (date) => (date ? moment(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={s ? 'green' : 'red'}>{s ? 'Ativo' : 'Inativo'}</Tag>,
    },
  ];

  const produtosPorLoteColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Produto', dataIndex: 'productDescription', key: 'productDescription' },
    { title: 'Quantidade Disponível', dataIndex: 'quantidade', key: 'quantidade' },
  ];

  const tempItemColumns = [
    {
      title: 'Lote',
      dataIndex: 'loteDesignacao',
      key: 'loteDesignacao',
      render: (text) => <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{text}</Tag>,
    },
    {
      title: 'Produto',
      dataIndex: 'designacaoTipoProduto',
      key: 'designacaoTipoProduto',
      render: (text) => <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>{text}</Tag>,
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
      render: (quantidade, record) => (
        <InputNumber
          min={1}
          value={quantidade}
          style={{ width: 100 }}
          onChange={(value) => {
            setTempItens((prev) =>
              prev.map((item) =>
                item.id === record.id ? { ...item, quantidade: value } : item
              )
            );
          }}
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEditItem(record)}
            title="Editar item"
          />
          <Popconfirm
            title="Confirmar remoção do item?"
            onConfirm={() => {
              setTempItens((prev) => prev.filter((item) => item.id !== record.id));
              message.success('Item removido da lista temporária');
            }}
            okText="OK"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} type="link" danger title="Remover item" />
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
      render: (_, record) =>
        (record.linhas || [])
          .map((linha) => {
            const produto = produtos.find((p) => p.id === linha.produtoId);
            return `${produto?.productDescription || 'Sem Descrição'} (Qtd: ${linha.qtdOperacao})`;
          })
          .join(', ') || '-',
    },
    { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditOperacao(record)} />
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
      title: 'Data de Vencimento',
      dataIndex: 'dataVencimento',
      key: 'dataVencimento',
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
      render: (produto_id) => produtos.find((p) => p.id === produto_id)?.productDescription || 'Sem Descrição',
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
    { title: 'Estado', dataIndex: 'estadoFornecedor', key: 'estadoFornecedor', render: (estado) => <Tag color={estado === 'ATIVO' ? 'green' : 'red'}>{estado}</Tag> },
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
              <Form.Item
                name="tipoOperacao"
                label="Tipo de Operação"
                rules={[{ required: true, message: 'Selecione o tipo de operação' }]}
              >
                <Select
                  placeholder="Selecione a operação"
                  onChange={(value) => {
                    form.setFieldsValue({ loteId: null, produtoId: null, quantidade: null, armazemDestinoId: null });
                    setSelectedLoteId(null);
                    setTempItens([]);
                    form.resetFields(['loteId', 'produtoId', 'quantidade', 'armazemDestinoId']);
                  }}
                >
                  {['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'ANULACAO'].map((op) => (
                    <Option key={op} value={op}>{op}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="armazemId"
                label="Armazém Origem"
                rules={[{ required: true, message: 'Selecione o armazém de origem' }]}
              >
                <Select placeholder="Selecione o armazém">
                  {armazens.map((armazem) => (
                    <Option key={armazem.id} value={armazem.id}>
                      {armazem.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="armazemDestinoId"
                label="Armazém Destino"
                rules={[{ required: form.getFieldValue('tipoOperacao') === 'TRANSFERENCIA', message: 'Selecione o armazém de destino' }]}
              >
                <Select placeholder="Selecione o armazém de destino" allowClear>
                  {armazens.map((armazem) => (
                    <Option key={armazem.id} value={armazem.id}>
                      {armazem.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="descricao" label="Descrição">
                <Input placeholder="Descrição da operação" />
              </Form.Item>
              <Form.Item
                name="loteId"
                label="Lote"
                rules={[{ required: true, message: 'Selecione o lote' }]}
              >
                <Select
                  placeholder="Selecione o lote"
                  onChange={(value) => setSelectedLoteId(value)}
                  disabled={['SAIDA', 'TRANSFERENCIA', 'ANULACAO'].includes(form.getFieldValue('tipoOperacao')) && lotes.length === 0}
                >
                  {lotes.filter(l => l.status).map((lote) => (
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
                  disabled={selectedLoteId === null || produtos.length === 0}
                >
                  {getProdutosByLote(selectedLoteId).map((produto) => (
                    <Option key={produto.produtoId} value={produto.produtoId}>
                      {produto.productDescription} (Disponível: {produto.quantidade})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="quantidade"
                label="Quantidade"
                rules={[
                  { required: true, message: 'Insira a quantidade' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (['SAIDA', 'TRANSFERENCIA', 'ANULACAO'].includes(getFieldValue('tipoOperacao'))) {
                        const loteId = getFieldValue('loteId');
                        const produtoId = getFieldValue('produtoId');
                        const linha = linhasLotes.find(
                          (l) => l.lotes_id === loteId && l.produto_id === produtoId
                        );
                        const quantidadeDisponivel = linha ? Number(linha.quantidade) : 0;
                        if (value > quantidadeDisponivel) {
                          return Promise.reject(`Quantidade excede o disponível (${quantidadeDisponivel})`);
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber min={1} placeholder="Quantidade" style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                {editItemId ? 'Atualizar Item' : 'Adicionar Item'}
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSaveOperacao}
                loading={loading}
              >
                Salvar Operação
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  form.resetFields();
                  setTempItens([]);
                  setEditOperacaoId(null);
                  setEditItemId(null);
                  setSelectedLoteId(null);
                }}
              >
                Cancelar
              </Button>
            </Space>
        
            <Table
              dataSource={tempItens}
              columns={tempItemColumns}
              rowKey={record => record.id}
              pagination={false}
              title={() => <Title level={4}>Itens Temporários</Title>}
              className="stock-table"
            />
          </Form>
        </div>
      )}
      {activeSection === 'lotes' && (
        <div className="section-content">
          <Space style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Pesquisar por designação"
              value={loteSearch}
              onChange={(e) => debouncedSetLoteSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filtrar por status"
              value={loteStatus}
              onChange={setLoteStatus}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="ativo">Ativo</Option>
              <Option value="inativo">Inativo</Option>
            </Select>
            <RangePicker
              format="YYYY-MM-DD"
              value={loteDateRange}
              onChange={setLoteDateRange}
              placeholder={['Data Início', 'Data Fim']}
            />
            <Button onClick={clearLoteFilters}>Limpar Filtros</Button>
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
            dataSource={filteredLotes}
            columns={loteColumns}
            rowKey={record => record.id}
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
            className="stock-table"
            title={() => <Title level={3}>Lotes</Title>}
          />
          <Table
            dataSource={linhasLotes}
            columns={linhasLotesColumns}
            rowKey={record => record.id}
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
            className="stock-table"
            title={() => <Title level={3}>Produtos em Lotes</Title>}
          />
        </div>
      )}
      {activeSection === 'fornecedores' && (
        <div className="section-content">
          <Space style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Pesquisar por nome"
              value={fornecedorSearch}
              onChange={(e) => debouncedSetFornecedorSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filtrar por estado"
              value={fornecedorEstado}
              onChange={setFornecedorEstado}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="ATIVO">Ativo</Option>
              <Option value="INATIVO">Inativo</Option>
            </Select>
            <Button onClick={clearFornecedorFilters}>Limpar Filtros</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowFornecedorModal(true);
                setEditFornecedorId(null);
                fornecedorForm.resetFields();
              }}
            >
              Adicionar Fornecedor
            </Button>
          </Space>
          <Table
            dataSource={filteredFornecedores}
            columns={fornecedorColumns}
            rowKey={record => record.id}
            pagination={{ pageSize: 10 }}
            loading={loading || contextLoading}
            className="stock-table"
          />
        </div>
      )}
      {activeSection === 'monitoramento' && (
        <div className="section-content">
          <Space style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Pesquisar por designação"
              value={loteSearch}
              onChange={(e) => debouncedSetLoteSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filtrar por status"
              value={loteStatus}
              onChange={setLoteStatus}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="ativo">Ativo</Option>
              <Option value="inativo">Inativo</Option>
            </Select>
            <RangePicker
              format="YYYY-MM-DD"
              value={loteDateRange}
              onChange={setLoteDateRange}
              placeholder={['Data Início', 'Data Fim']}
            />
            <Button onClick={clearLoteFilters}>Limpar Filtros</Button>
          </Space>
          {expiringLotes.length > 0 && (
            <Alert
              message="Lotes Próximos do Vencimento"
              description={`Existem ${expiringLotes.length} lotes com vencimento em até um ano.`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Table
            dataSource={expiringLotes}
            columns={expiringLoteColumns}
            rowKey={record => record.id}
            pagination={{ pageSize: 10 }}
            className="stock-table"
            title={() => <Title level={3}>Lotes Próximos do Vencimento</Title>}
          />
          <Table
            dataSource={filteredLotes}
            columns={loteColumns}
            rowKey={record => record.id}
            pagination={{ pageSize: 10 }}
            className="stock-table"
            title={() => <Title level={3}>Lotes</Title>}
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
              <TabPane tab="Operação Stock" key="entrada-saida" />
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
                    {produto.productDescription || 'Sem Descrição'} (ID: {produto.id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="quantidade"
              label="Quantidade"
              rules={[{ required: true, message: 'Digite a quantidade', type: 'number', min: 1 }]}
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