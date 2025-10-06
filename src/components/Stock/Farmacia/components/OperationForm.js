import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Select, 
  Space, 
  Card, 
  Alert, 
  Divider,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  SaveOutlined, 
  CloseOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  SwapOutlined,
  StopOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const OperationForm = ({
  form,
  armazens = [],
  lotes = [],
  produtos = [],
  linhasLotes = [],
  tempItens = [],
  editOperacaoId,
  editItemId,
  selectedLoteId,
  loading = false,
  onAddItem,
  onSaveOperation,
  onReset,
  onEditItem,
  onRemoveItem,
  onChangeQuantidade,
  onLoteChange
}) => {
  const [tipoOperacao, setTipoOperacao] = useState(null);
  const [armazemId, setArmazemId] = useState(null);

  // Limpar campo de produto quando o lote mudar
  useEffect(() => {
    if (selectedLoteId) {
      form.setFieldsValue({ produtoId: null });
    }
  }, [selectedLoteId, form]);

  // Atualizar tipoOperacao quando o formulário mudar
  useEffect(() => {
    const currentTipoOperacao = form.getFieldValue('tipoOperacao');
    if (currentTipoOperacao !== tipoOperacao) {
      setTipoOperacao(currentTipoOperacao);
    }
  }, [form.getFieldValue('tipoOperacao'), tipoOperacao]);

  // Atualizar selectedLoteId quando o valor do formulário mudar
  useEffect(() => {
    const currentLoteId = form.getFieldValue('loteId');
    if (currentLoteId && currentLoteId !== selectedLoteId) {
      if (onLoteChange) {
        onLoteChange(currentLoteId);
      }
    }
  }, [form.getFieldValue('loteId'), selectedLoteId, onLoteChange]);

  const operationTypes = [
    {
      value: 'ENTRADA',
      label: 'Entrada',
      icon: <InboxOutlined />,
      color: '#52c41a',
      description: 'Adicionar produtos ao estoque'
    },
    {
      value: 'SAIDA',
      label: 'Saída',
      icon: <ShoppingCartOutlined />,
      color: '#ff4d4f',
      description: 'Remover produtos do estoque'
    },
    {
      value: 'TRANSFERENCIA',
      label: 'Transferência',
      icon: <SwapOutlined />,
      color: '#1890ff',
      description: 'Mover produtos entre armazéns'
    },
    {
      value: 'ANULACAO',
      label: 'Anulação',
      icon: <StopOutlined />,
      color: '#faad14',
      description: 'Anular operações anteriores'
    }
  ];

  const getOperationType = (value) => {
    return operationTypes.find(op => op.value === value);
  };

  const getProdutosByLote = (loteId) => {
    if (!loteId) return [];
    
    // Verificar se os dados estão disponíveis
    if (!Array.isArray(linhasLotes) || !Array.isArray(produtos)) {
      return [];
    }
    
    // Filtrar linhas do lote específico e do armazém selecionado
    const linhasDoLote = linhasLotes.filter((linha) => {
      const matchLote = String(linha.lotes_id) === String(loteId);
      const matchArmazem = Number(linha.armazem_id) === Number(armazemId);
      
      console.log('=== DEBUG getProdutosByLote ===');
      console.log('Verificando linha:', linha);
      console.log('loteId:', loteId, 'linha.lotes_id:', linha.lotes_id, 'matchLote:', matchLote);
      console.log('armazemId:', armazemId, 'linha.armazem_id:', linha.armazem_id, 'matchArmazem:', matchArmazem);
      
      return matchLote && matchArmazem;
    });
    
    // Se não há linhas para este lote/armazém, retornar array vazio
    console.log('Linhas encontradas para o lote/armazém:', linhasDoLote.length);
    if (linhasDoLote.length === 0) {
      console.log('Nenhuma linha encontrada para lote', loteId, 'e armazém', armazemId);
      return [];
    }
    
    // Mapear para produtos com informações completas
    const produtosDoLote = linhasDoLote.map((linha) => {
      const produtoId = linha.produto_id || linha.produtoId;
      const produto = produtos.find((p) => p.id === produtoId);
      
      return {
        id: linha.id,
        produtoId: produtoId,
        productDescription: produto?.productDescription || 'Sem Descrição',
        quantidade: Number(linha.quantidade || 0),
      };
    });
    
    // Remover duplicatas e somar quantidades se necessário
    const produtosUnicos = {};
    produtosDoLote.forEach((produto) => {
      if (produtosUnicos[produto.produtoId]) {
        produtosUnicos[produto.produtoId].quantidade += produto.quantidade;
      } else {
        produtosUnicos[produto.produtoId] = produto;
      }
    });
    
    const resultado = Object.values(produtosUnicos);
    console.log('Produtos retornados para anulação:', resultado);
    return resultado;
  };

  const handleTipoOperacaoChange = (value) => {
    console.log('=== DEBUG handleTipoOperacaoChange ===');
    console.log('Novo tipo de operação:', value);
    console.log('Estado anterior tipoOperacao:', tipoOperacao);
    console.log('Estado anterior armazemId:', armazemId);
    
    setTipoOperacao(value);
    setArmazemId(null);
    form.setFieldsValue({ 
      armazemId: null,
      loteId: null, 
      produtoId: null, 
      quantidade: null, 
      armazemDestinoId: null, 
      loteIdDestino: null 
    });
    
    console.log('Estados atualizados - tipoOperacao:', value, 'armazemId: null');
    console.log('Todos os campos limpos');
    
    // Forçar re-render dos campos dependentes
    setTimeout(() => {
      form.validateFields(['armazemId']);
    }, 100);
  };

  const handleArmazemDestinoChange = (value) => {
    console.log('=== DEBUG handleArmazemDestinoChange ===');
    console.log('Valor recebido:', value);
    
    // Limpar lote de destino quando armazém de destino mudar
    form.setFieldsValue({ loteIdDestino: null });
    
    console.log('Campo loteIdDestino limpo');
    
    // Forçar re-render do campo lote de destino
    setTimeout(() => {
      form.validateFields(['loteIdDestino']);
    }, 100);
  };

  const handleArmazemChange = (value) => {
    console.log('=== DEBUG handleArmazemChange ===');
    console.log('Valor recebido:', value);
    console.log('Tipo de operação atual:', tipoOperacao);
    console.log('Estado armazemId anterior:', armazemId);
    
    setArmazemId(value);
    form.setFieldsValue({ loteId: null, produtoId: null, quantidade: null });
    
    console.log('Estado armazemId atualizado para:', value);
    console.log('Campos limpos: loteId, produtoId, quantidade');
    
    // Forçar re-render dos campos dependentes
    setTimeout(() => {
      form.validateFields(['loteId']);
    }, 100);
  };

  const getLotesDisponiveis = () => {
    console.log('=== DEBUG getLotesDisponiveis ===');
    console.log('tipoOperacao:', tipoOperacao);
    console.log('armazemId:', armazemId);
    console.log('lotes.length:', lotes.length);
    console.log('linhasLotes.length:', linhasLotes.length);
    
    // Se não há tipo de operação selecionado, retornar vazio
    if (!tipoOperacao) {
      console.log('Nenhum tipo de operação selecionado, retornando array vazio');
      return [];
    }
    
    if (tipoOperacao === 'ENTRADA') {
      // Para entrada, mostrar todos os lotes ativos
      const lotesAtivos = lotes.filter(l => l.status);
      console.log('Lotes disponíveis para ENTRADA:', lotesAtivos.length);
      return lotesAtivos;
    }
    
    // Para outras operações (SAÍDA, TRANSFERÊNCIA, ANULAÇÃO), precisamos do armazém selecionado
    if (!armazemId) {
      console.log('Nenhum armazém selecionado para operação diferente de ENTRADA, retornando array vazio');
      return [];
    }
    
    // Mostrar apenas lotes que têm produtos no armazém selecionado
    const lotesComProdutos = lotes.filter(l => l.status).filter(lote => {
      const temProdutos = linhasLotes.some(linha => {
        const matchLote = Number(linha.lotes_id) === Number(lote.id);
        const matchArmazem = Number(linha.armazem_id) === Number(armazemId);
        console.log(`Verificando linha ${linha.id}: lote ${linha.lotes_id} === ${lote.id} = ${matchLote}, armazem ${linha.armazem_id} === ${armazemId} = ${matchArmazem}`);
        return matchLote && matchArmazem;
      });
      console.log(`Lote ${lote.id} (${lote.designacao}) tem produtos no armazém ${armazemId}:`, temProdutos);
      return temProdutos;
    });
    
    console.log('Lotes disponíveis para outras operações:', lotesComProdutos.length);
    console.log('Lotes encontrados:', lotesComProdutos.map(l => ({ id: l.id, designacao: l.designacao })));
    return lotesComProdutos;
  };

  const getLotesDestino = () => {
    const armazemDestinoId = form.getFieldValue('armazemDestinoId');
    const loteIdOrigem = form.getFieldValue('loteId');
    
    console.log('=== DEBUG getLotesDestino ===');
    console.log('armazemDestinoId:', armazemDestinoId);
    console.log('loteIdOrigem:', loteIdOrigem);
    
    if (!armazemDestinoId) {
      console.log('Nenhum armazém de destino selecionado, retornando array vazio');
      return [];
    }
    
    // Para transferência, mostrar todos os lotes ativos (excluindo o lote de origem)
    const lotesDisponiveis = lotes.filter(l => l.status).filter(lote => lote.id !== loteIdOrigem);
    
    console.log('Lotes disponíveis para destino:', lotesDisponiveis.length);
    console.log('Lotes encontrados:', lotesDisponiveis.map(l => ({ id: l.id, designacao: l.designacao })));
    
    return lotesDisponiveis;
  };

  const getTotalItems = () => {
    return tempItens.reduce((total, item) => total + Number(item.quantidade), 0);
  };

  const getTotalValue = () => {
    // Aqui você pode adicionar lógica para calcular o valor total
    // Por enquanto retorna apenas o número de itens
    return tempItens.length;
  };

  return (
    <div className="operation-form-container">
      <Card
        title={
          <Space>
            {editOperacaoId ? (
              <>
                <EditOutlined />
                <span>Editar Operação de Stock</span>
              </>
            ) : (
              <>
                <PlusOutlined />
                <span>Nova Operação de Stock</span>
              </>
            )}
          </Space>
        }
        className="operation-form-card"
        style={{
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)',
          border: '1px solid #91d5ff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Form form={form} layout="vertical" className="operation-form">
          <Row gutter={[16, 16]}>
            {/* Tipo de Operação */}
            <Col xs={24} md={12}>
              <Form.Item
                name="tipoOperacao"
                label={
                  <Space>
                    <span>Tipo de Operação</span>
                    {tipoOperacao && (
                      <span style={{ 
                        color: getOperationType(tipoOperacao)?.color,
                        fontWeight: 600 
                      }}>
                        {getOperationType(tipoOperacao)?.label}
                      </span>
                    )}
                  </Space>
                }
                rules={[{ required: true, message: 'Selecione o tipo de operação' }]}
              >
                <Select
                  placeholder="Selecione a operação"
                  onChange={handleTipoOperacaoChange}
                  style={{ width: '100%' }}
                >
                  {operationTypes.map((op) => (
                    <Option key={op.value} value={op.value}>
                      <Space>
                        <span style={{ color: op.color }}>{op.icon}</span>
                        <span>{op.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Armazém Origem */}
            <Col xs={24} md={12}>
              <Form.Item
                name="armazemId"
                label="Armazém Origem"
                rules={[{ required: true, message: 'Selecione o armazém de origem' }]}
              >
                <Select 
                  placeholder="Selecione o armazém"
                  onChange={handleArmazemChange}
                  style={{ width: '100%' }}
                  disabled={!tipoOperacao}
                >
                  {armazens.map((armazem) => (
                    <Option key={armazem.id} value={armazem.id}>
                      {armazem.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Armazém Destino (apenas para Transferência) */}
            {tipoOperacao === 'TRANSFERENCIA' && (
              <>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="armazemDestinoId"
                    label="Armazém Destino"
                    rules={[{ required: true, message: 'Selecione o armazém de destino' }]}
                  >
                    <Select 
                      placeholder="Selecione o armazém de destino" 
                      style={{ width: '100%' }}
                      allowClear
                      onChange={handleArmazemDestinoChange}
                    >
                      {armazens
                        .filter(a => a.id !== armazemId)
                        .map((armazem) => (
                          <Option key={armazem.id} value={armazem.id}>
                            {armazem.designacao}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="loteIdDestino"
                    label="Lote Destino"
                    rules={[{ required: true, message: 'Selecione o lote de destino' }]}
                  >
                    <Select 
                      placeholder="Selecione o lote de destino" 
                      style={{ width: '100%' }}
                      disabled={!form.getFieldValue('armazemDestinoId')}
                    >
                      {getLotesDestino().map((lote) => (
                        <Option key={lote.id} value={lote.id}>
                          {lote.designacao}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}

            {/* Descrição */}
            <Col xs={24}>
              <Form.Item name="descricao" label="Descrição da Operação">
                <Input.TextArea 
                  placeholder="Descreva a operação (opcional)" 
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Adicionar Itens</Divider>

          <Row gutter={[16, 16]}>
            {/* Lote */}
            <Col xs={24} md={8}>
              <Form.Item
                name="loteId"
                label="Lote"
                rules={[{ required: true, message: 'Selecione o lote' }]}
              >
                <Select
                  placeholder="Selecione o lote"
                  onChange={(value, option) => {
                    form.setFieldsValue({ loteDesignacao: option?.children });
                    // Atualizar selectedLoteId quando lote for selecionado
                    if (onLoteChange) {
                      onLoteChange(value);
                    }
                    // Limpar produto quando lote mudar
                    form.setFieldsValue({ produtoId: null });
                  }}
                  disabled={!tipoOperacao || (tipoOperacao !== 'ENTRADA' && !armazemId)}
                  style={{ width: '100%' }}
                  optionLabelProp="children"
                >
                  {getLotesDisponiveis().map((lote) => (
                    <Option key={lote.id} value={lote.id}>
                      {lote.designacao}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Produto */}
            <Col xs={24} md={8}>
              <Form.Item
                name="produtoId"
                label="Produto"
                rules={[{ required: true, message: 'Selecione o produto' }]}
              >
                <Select
                  placeholder={selectedLoteId ? "Selecione o produto" : "Selecione o lote primeiro"}
                  disabled={!selectedLoteId || produtos.length === 0}
                  style={{ width: '100%' }}
                  optionLabelProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={(value) => {
                    // Limpar quantidade quando produto mudar
                    form.setFieldsValue({ quantidade: null });
                  }}
                >
                  {(() => {
                    if (tipoOperacao === 'ENTRADA') {
                      // Para entrada, mostrar todos os produtos
                      return produtos.map((produto) => (
                        <Option key={produto.id} value={produto.id}>
                          {produto.productDescription || 'Sem Descrição'}
                        </Option>
                      ));
                    } else {
                      // Para saída, transferência e anulação, mostrar apenas produtos do lote
                      const produtosDoLote = getProdutosByLote(selectedLoteId);
                      
                      if (produtosDoLote.length === 0) {
                        return [
                          <Option key="no-products" value="" disabled>
                            Nenhum produto disponível neste lote
                          </Option>
                        ];
                      }
                      
                      return produtosDoLote.map((produto) => (
                        <Option key={produto.produtoId} value={produto.produtoId}>
                          {produto.productDescription} (Disponível: {produto.quantidade})
                        </Option>
                      ));
                    }
                  })()}
                </Select>
              </Form.Item>
            </Col>

            {/* Quantidade */}
            <Col xs={24} md={8}>
              <Form.Item
                name="quantidade"
                label="Quantidade"
                rules={[
                  { required: true, message: 'Insira a quantidade' },
                  { type: 'number', min: 1, message: 'Quantidade deve ser maior que zero' }
                ]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="Quantidade" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Botões de Ação */}
          <Space style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAddItem} 
              disabled={loading}
              className="custom-button primary"
            >
              Adicionar Item
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              type="primary" 
              onClick={onSaveOperation} 
              loading={loading} 
              disabled={loading || tempItens.length === 0}
              className="custom-button primary"
            >
              Salvar Operação
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              onClick={onReset} 
              disabled={loading}
              className="custom-button secondary"
            >
              Limpar
            </Button>
          </Space>

          {/* Resumo da Operação */}
          {tempItens.length > 0 && (
            <Alert
              message={
                <Space>
                  <span>Resumo da Operação</span>
                  <Text strong>{tempItens.length} itens</Text>
                  <Text strong>Total: {getTotalItems()} unidades</Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Form>
      </Card>
    </div>
  );
};

export default OperationForm; 