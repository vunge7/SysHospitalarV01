import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { api } from '../../service/api';
import NovoProduto from '../../pages/PainelProduto/NovoProduto';
import {
  Button, Modal, Form, Input, Select, Checkbox, Card, notification, DatePicker, Table, Space, Popconfirm, Typography,
  Row, Col, Tag, Tooltip, Alert, Divider, InputNumber, Switch, Upload, message
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, NodeExpandOutlined, SearchOutlined,
  FilterOutlined, DownloadOutlined, UploadOutlined, InfoCircleOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, XOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

function Exame({ exames, medicos, setExames, fetchAllData, createExame, updateExame, deleteExame }) {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedExame, setSelectedExame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isComposto, setIsComposto] = useState(false);
  const [referencias, setReferencias] = useState([]);
  const [editingExame, setEditingExame] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showNovoProdutoModal, setShowNovoProdutoModal] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [produtosExame, setProdutosExame] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showProdutoDetails, setShowProdutoDetails] = useState(false);
  const [modalFilhosVisible, setModalFilhosVisible] = useState(false);
  const [produtoPaiSelecionado, setProdutoPaiSelecionado] = useState(null);
  const [filhosProduto, setFilhosProduto] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [showTodos, setShowTodos] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchProdutosExame();
  }, [showTodos, statusFilter]); // Atualizar automaticamente quando mudar o modo de exibição ou filtro de status

  const fetchProdutosExame = async () => {
    try {
      setLoadingData(true);
      console.log('Buscando produtos de exame...');
      
      let res;
      if (showTodos) {
        // Quando "Mostrar Todos", buscar todos os produtos sem filtro de status
        console.log('Modo "Mostrar Todos" ativo, buscando todos os produtos...');
        try {
          // Tentar buscar endpoint que retorna todos (incluindo inativos)
          res = await api.get('/produto/all-with-inactive');
        } catch (error) {
          console.warn('Endpoint /all-with-inactive não encontrado, usando /all normal...', error);
          res = await api.get('/produto/all');
        }
      } else {
        // Modo normal, usar endpoint padrão
        res = await api.get('/produto/all');
      }
      
      console.log('Todos os produtos recebidos:', res.data);
      
      // Buscar produtos que contenham "Hemograma Completo" para debug
      const hemogramaProdutos = res.data.filter(p => 
        (p.productDescription || '').toLowerCase().includes('hemograma completo')
      );
      console.log('Produtos com "Hemograma Completo":', hemogramaProdutos);
      
      // Mostrar produtos inativos no console para debug
      const produtosInativos = res.data.filter(p => {
        const isActive = p.status === true || p.status === '1' || p.status === 1 || p.status === 'true' || p.status === 'ATIVO';
        return !isActive;
      });
      console.log('Produtos INATIVOS encontrados:', produtosInativos);
      
      const produtos = Array.isArray(res.data)
        ? res.data.filter(p => {
            if (showTodos) {
              // No modo "Mostrar Todos", aplicar filtro de status se selecionado
              if (statusFilter === 'active') {
                const isActive = p.status === true || p.status === '1' || p.status === 1 || p.status === 'true' || p.status === 'ATIVO';
                return isActive;
              } else if (statusFilter === 'inactive') {
                const isActive = p.status === true || p.status === '1' || p.status === 1 || p.status === 'true' || p.status === 'ATIVO';
                return !isActive;
              }
              return true; // Mostrar todos
            }
            
            // Verificar se o produto está ativo (status true)
            const isActive = p.status === true || p.status === '1' || p.status === 1 || p.status === 'true' || p.status === 'ATIVO';
            if (!isActive) return false; // Não mostrar inativos
            
            // Filtro específico para exames (mais restrito)
            const productType = (p.productType || '').toLowerCase();
            const productGroup = (p.productGroup || '').toLowerCase();
            
            // Incluir APENAS se for grupo EXAMES ou tipo contém EXAME
            const isExame = productGroup === 'exames' || 
                          productGroup === 'exame' ||
                          productType.includes('exame') || 
                          productType.includes('exames');
            
            // Log para debug dos primeiros 10 produtos
            if (res.data.indexOf(p) < 10) {
              console.log(`Produto: ${p.productDescription} | Grupo: ${productGroup} | Tipo: ${productType} | Status: ${p.status} | Ativo: ${isActive} | É exame: ${isExame}`);
            }
            
            return isExame;
          })
        : [];
      
      console.log('Produtos filtrados como exame:', produtos);
      
      // Ordenar alfabeticamente por descrição
      produtos.sort((a, b) => (a.productDescription || '').localeCompare(b.productDescription || ''));
      setProdutosExame(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos de exame:', error);
      setProdutosExame([]);
    } finally {
      setLoadingData(false);
    }
  };

  const showModal = (exame = null) => {
    setEditingExame(exame);
    setIsEditMode(!!exame);
    if (exame) {
      form.setFieldsValue({
        ...exame,
        dataColeta: exame.dataColeta ? moment(exame.dataColeta) : null,
      });
      setIsComposto(exame.composto || false);
      if (exame.referencias) {
        const refsArray = Object.entries(exame.referencias).map(([nome, data]) => ({
          nome,
          intervalo: data.valor,
          unidade: data.unidade,
        }));
        setReferencias(refsArray);
      }
    } else {
      form.resetFields();
      setReferencias([]);
      setIsComposto(false);
    }
    setIsModalVisible(true);
  };

  const validateExame = (values) => {
    const errors = {};
    
    if (!values.designacao || values.designacao.trim().length < 3) {
      errors.designacao = 'A designação deve ter pelo menos 3 caracteres';
    }
    
    if (!values.tipoExameId) {
      errors.tipoExameId = 'Selecione um tipo de exame';
    }
    
    if (!values.unidade) {
      errors.unidade = 'Informe a unidade de medida';
    }
    
    if (isComposto) {
      referencias.forEach((ref, index) => {
        if (!ref.nome || !ref.intervalo || !ref.unidade) {
          errors[`referencia_${index}`] = 'Preencha todos os campos da referência';
        }
        if (ref.intervalo && !/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(ref.intervalo)) {
          errors[`intervalo_${index}`] = 'Intervalo inválido. Use o formato "min-max" (ex.: 4.5-5.9)';
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setIsComposto(false);
    setReferencias([]);
    setEditingExame(null);
    setIsEditMode(false);
  };

  const showDetailsModal = (exame) => {
    setSelectedExame(exame);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedExame(null);
  };

  const addReferencia = () => {
    setReferencias([...referencias, { nome: '', intervalo: '', unidade: '' }]);
  };

  const removeReferencia = (index) => {
    setReferencias(referencias.filter((_, i) => i !== index));
  };

  const updateReferencia = (index, field, value) => {
    const newReferencias = [...referencias];
    newReferencias[index][field] = value;
    setReferencias(newReferencias);
  };

  const onFinish = async (values) => {
    if (!validateExame(values)) {
      toast.error('Por favor, corrija os erros de validação!', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const referenciasObj = {};
      if (values.composto) {
        referencias.forEach((ref, index) => {
          if (!ref.nome || !ref.intervalo || !ref.unidade) {
            throw new Error(`Preencha todos os campos da referência ${index + 1}`);
          }
          if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(ref.intervalo)) {
            throw new Error(`Intervalo inválido na referência ${ref.nome}. Use o formato "min-max" (ex.: 4.5-5.9)`);
          }
          referenciasObj[ref.nome] = { valor: ref.intervalo, unidade: ref.unidade };
        });
      } else {
        referenciasObj[values.designacao] = { valor: '0-0', unidade: values.unidade || 'N/A' };
      }

      const exameData = {
        tipoExameId: values.tipoExameId,
        estado: values.estado,
        designacao: values.designacao,
        unidade: values.unidade || 'N/A',
        composto: values.composto || false,
        referencias: referenciasObj,
        pacienteId: values.pacienteId,
        medicoId: values.medicoId,
        status: 'PENDENTE',
        dataSolicitacao: new Date().toISOString(),
        dataColeta: values.dataColeta ? values.dataColeta.toISOString() : null,
        preco: values.preco ? parseFloat(values.preco) : 0,
        stock: values.stock ? parseInt(values.stock) : 0,
        dataCriacao: new Date().toISOString(),
      };

      let exameResponse;
      if (isEditMode) {
        exameResponse = await updateExame(editingExame.id, exameData);
        await fetchProdutosExame();
      } else {
        exameResponse = await createExame(exameData);
      }

      setExames(
        isEditMode
          ? exames.map((e) => (e.id === editingExame.id ? exameResponse.data : e))
          : [...exames, exameResponse.data]
      );
      toast.success(isEditMode ? 'Exame atualizado com sucesso!' : 'Exame criado com sucesso!', { autoClose: 2000 });
      handleCancel();
      fetchAllData();
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving exame:', error);
      toast.error(error.response?.data || error.message || 'Erro ao salvar exame!', { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteExame(id);
      toast.success('Exame excluído com sucesso!', { autoClose: 2000 });
      fetchAllData();
      await fetchProdutosExame();
    } catch (error) {
      console.error('Error deleting exame:', error);
      toast.error(error.response?.data || 'Erro ao excluir exame!', { autoClose: 2000 });
    }
  };

  const handleViewProduto = (produto) => {
    setProdutoSelecionado(produto);
    setShowProdutoDetails(true);
  };

  const handleEditProduto = (produto) => {
    console.log('EDITANDO PRODUTO:', produto);
    console.log('produtoPaiSelecionado atual:', produtoPaiSelecionado);
    console.log('filhosProduto atuais:', filhosProduto);
    
    setProdutoParaEditar(produto);
    setIsEditMode(true);
    setShowNovoProdutoModal(true);
  };

  const handleCloseNovoProduto = () => {
    setShowNovoProdutoModal(false);
    setProdutoParaEditar(null);
    setIsEditMode(false);
    // Forçar refresh completo dos dados após fechar
    setTimeout(async () => {
      await fetchProdutosExame();
      if (fetchAllData) await fetchAllData();
    }, 300);
  };

  const handleDeleteProduto = async (produto) => {
    try {
      // Tentar excluir permanentemente
      await api.delete(`/produto/${produto.id}`);
      toast.success('Produto excluído permanentemente com sucesso!', { autoClose: 2000 });
      await fetchProdutosExame();
    } catch (error) {
      console.warn('DELETE falhou, tentando mudar status...', error);
      try {
        // Se DELETE falhar, mudar status para false
        await api.patch(`/produto/${produto.id}/status`, null, { params: { status: false } });
        toast.success('Produto desativado com sucesso!', { autoClose: 2000 });
        await fetchProdutosExame();
      } catch (error2) {
        console.warn('PATCH status falhou, tentando fallback via PUT...', error2);
        try {
          await api.put(`/produto/${produto.id}/status`, { status: false });
          toast.success('Produto desativado com sucesso!', { autoClose: 2000 });
          await fetchProdutosExame();
        } catch (error3) {
          console.error('Todos os métodos de exclusão falharam:', error3);
          toast.error('Erro ao excluir produto', { autoClose: 2000 });
        }
      }
    }
  };

  const handleVerFilhos = async (produto) => {
    setProdutoPaiSelecionado(produto);
    try {
      console.log(`Buscando filhos do produto: ${produto.productDescription} (ID: ${produto.id})`);
      const res = await api.get(`produto/${produto.id}/arvore`);
      console.log('Filhos recebidos:', res.data);
      
      // Verificar se há filhos e mostrar detalhes
      if (res.data.filhos && res.data.filhos.length > 0) {
        console.log(`Encontrados ${res.data.filhos.length} filhos diretos`);
        res.data.filhos.forEach((filho, index) => {
          console.log(`Filho ${index + 1}: ${filho.productDescription} (ID: ${filho.id})`);
          if (filho.filhos && filho.filhos.length > 0) {
            console.log(`  - Netos: ${filho.filhos.length}`);
            filho.filhos.forEach((neto, netoIndex) => {
              console.log(`    Neto ${netoIndex + 1}: ${neto.productDescription} (ID: ${neto.id})`);
            });
          }
        });
      } else {
        console.log('Nenhum filho encontrado');
      }
      
      setFilhosProduto(res.data.filhos || []);
    } catch (error) {
      console.error('Erro ao buscar filhos:', error);
      setFilhosProduto([]);
    }
    setModalFilhosVisible(true);
  };

  const renderFilhosArvore = (filhosArr, nivel = 1) => (
    <div style={{ marginLeft: nivel * 20 }}>
      {filhosArr.map((filho, index) => (
        <div key={filho.id} style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: nivel === 1 ? '#f0f9ff' : '#ffffff',
            border: nivel === 1 ? '1px solid #b3d8ff' : '1px solid #e8e8e8',
            borderRadius: 6,
            boxShadow: nivel === 1 ? '0 2px 4px rgba(24, 144, 255, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
            position: 'relative',
            borderLeft: nivel === 1 ? '4px solid #1890ff' : '4px solid #52c41a'
          }}>
            {/* Linha conectora */}
            {nivel > 1 && (
              <div style={{
                position: 'absolute',
                left: -20,
                top: '50%',
                width: 20,
                height: '1px',
                backgroundColor: '#d9d9d9'
              }} />
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '500', 
                marginBottom: 4,
                color: nivel === 1 ? '#1890ff' : '#262626',
                fontSize: nivel === 1 ? '15px' : '14px'
              }}>
                {filho.productDescription}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {filho.id} | Código: {filho.productCode || 'N/A'}
              </div>
              {filho.preco && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#52c41a', 
                  fontWeight: 'bold', 
                  marginTop: 4 
                }}>
                  {parseFloat(filho.preco).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </div>
              )}
            </div>
            
            {filho.filhos && filho.filhos.length > 0 && (
              <div style={{
                marginLeft: 12,
                padding: '4px 8px',
                backgroundColor: nivel === 1 ? '#e6f7ff' : '#f6ffed',
                borderRadius: 4,
                fontSize: '11px',
                color: nivel === 1 ? '#1890ff' : '#52c41a',
                fontWeight: 'bold'
              }}>
                {filho.filhos.length} filho(s)
              </div>
            )}
          </div>
          
          {filho.filhos && filho.filhos.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {renderFilhosArvore(filho.filhos, nivel + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Filtrar e ordenar produtos
  const filteredProdutos = produtosExame
    .filter(produto => {
      const matchesSearch = !searchText || 
        (produto.productDescription || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (produto.productCode || '').toLowerCase().includes(searchText.toLowerCase());
      const matchesType = !filterType || 
        (produto.productType || '').toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => (a.productDescription || '').localeCompare(b.productDescription || ''));

  // Obter tipos únicos para filtro
  const uniqueTypes = [...new Set(produtosExame.map(p => p.productType).filter(Boolean))];

  return (
    <div>
      <Title level={2}>Gestão de Exames</Title>
      <Card>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowNovoProdutoModal(true);
            setProdutoParaEditar(null);
            setIsEditMode(false);
          }}
          style={{ marginBottom: 16, marginRight: 8 }}
        >
          Novo Exame
        </Button>

        <Button
          type={showTodos ? "primary" : "default"}
          onClick={() => {
            setShowTodos(!showTodos);
          }}
          style={{ marginBottom: 16 }}
        >
          {showTodos ? "Mostrar Apenas Exames" : "Mostrar Todos"}
        </Button>

        {/* Filtros */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por nome ou código..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          
          <Select
            placeholder="Filtrar por tipo de exame"
            value={filterType}
            onChange={(value) => setFilterType(value)}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="sangue">Exames de Sangue</Option>
            <Option value="imagem">Exames de Imagem</Option>
            <Option value="urina">Exames de Urina</Option>
            <Option value="outros">Outros</Option>
          </Select>

          {showTodos && (
            <Select
              placeholder="Filtrar por status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 150 }}
            >
              <Option value="all">Todos</Option>
              <Option value="active">Ativos</Option>
              <Option value="inactive">Inativos</Option>
            </Select>
          )}
        </div>

        <Button onClick={() => { setSearchText(''); setFilterType(''); }}>
          Limpar Filtros
        </Button>

        <NovoProduto
          visible={showNovoProdutoModal}
          onClose={handleCloseNovoProduto}
          modalTitle={isEditMode ? "Editar Exame" : "Novo Exame"}
          submitButtonText={isEditMode ? "Salvar Alterações" : "Adicionar Exame"}
          produtoParaEditar={produtoParaEditar}
          onSuccess={async () => {
            console.log('Sucesso ao salvar produto, buscando dados atualizados...');
            console.log('isEditMode:', isEditMode);
            console.log('produtoParaEditar:', produtoParaEditar);
            console.log('produtoPaiSelecionado:', produtoPaiSelecionado);
            
            // Forçar múltiplos refresh para garantir sincronização completa
            await fetchProdutosExame();
            if (fetchAllData) await fetchAllData();
            
            // Se estávamos editando um produto que tem filhos, atualizar a árvore
            if (isEditMode && produtoParaEditar && produtoPaiSelecionado) {
              console.log('Atualizando árvore do produto pai:', produtoPaiSelecionado);
              await handleVerFilhos(produtoPaiSelecionado);
            }
            
            // Pequeno delay e refresh novamente
            setTimeout(async () => {
              console.log('Refresh final após delay...');
              await fetchProdutosExame();
              if (fetchAllData) await fetchAllData();
            }, 500);
            
            setShowNovoProdutoModal(false);
          }}
          onError={async (error) => {
            console.error('Erro ao salvar produto:', error);
            
            // Se for erro de duplicação, buscar detalhes do produto duplicado
            if (error && error.includes('Já existe um produto')) {
              console.log('Erro de duplicação detectado, buscando detalhes...');
              
              // Extrair nome do produto da mensagem de erro
              const match = error.match(/descrição: (.+)$/);
              if (match && match[1]) {
                const produtoDuplicado = match[1].trim();
                console.log(`Produto duplicado: "${produtoDuplicado}"`);
                
                // Buscar todos os produtos para encontrar o duplicado
                try {
                  const res = await api.get('/produto/all');
                  const duplicados = res.data.filter(p => 
                    (p.productDescription || '').toLowerCase() === produtoDuplicado.toLowerCase()
                  );
                  
                  console.log('Produtos duplicados encontrados:', duplicados);
                  duplicados.forEach(dup => {
                    console.log(`ID: ${dup.id}, Status: ${dup.status}, Descrição: ${dup.productDescription}`);
                  });
                  
                  // Mostrar mensagem detalhada
                  toast.error(`Produto "${produtoDuplicado}" já existe (${duplicados.length} ocorrência(s)). Use "Mostrar Todos" para encontrá-lo.`, { autoClose: 5000 });
                } catch (searchError) {
                  console.error('Erro ao buscar duplicados:', searchError);
                }
              }
              
              // Ativar modo "Mostrar Todos" para ajudar a encontrar
              setShowTodos(true);
              await fetchProdutosExame();
            } else {
              toast.error(error || 'Erro ao salvar produto', { autoClose: 3000 });
            }
          }}
          initialValues={isEditMode ? {} : { productGroup: 'Exames' }}
          isFromExame={true}
        />

        <Table
          columns={[
            {
              title: 'Imagem',
              dataIndex: 'imagem',
              key: 'imagem',
              render: (img, record) => {
                console.log('Renderizando imagem:', img, 'para o produto:', record.productDescription);
                
                if (!img) {
                  return <span style={{ color: '#999', fontSize: '12px' }}>Sem Imagem</span>;
                }
                
                // Se for texto inválido, mostrar erro
                if (typeof img === 'string' && !img.includes('.') && !img.startsWith('http') && !img.startsWith('data:')) {
                  return <span style={{ color: '#ff4d4f', fontSize: '11px' }}>Texto inválido</span>;
                }
                
                // Usar a mesma URL do ListarProduto e NovoProduto
                const src = img.startsWith('http') || img.startsWith('data:') 
                  ? img 
                  : `${api.defaults.baseURL}uploads/produtos/${img}`;
                
                console.log('URL da imagem:', src);
                
                return (
                  <img
                    src={src}
                    alt={record.productDescription}
                    style={{ 
                      maxWidth: 60, 
                      maxHeight: 60, 
                      borderRadius: 6,
                      objectFit: 'cover',
                      border: '1px solid #d9d9d9'
                    }}
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', src);
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/60x60/e8e8e8/999999?text=IMG';
                    }}
                    onLoad={(e) => {
                      console.log('Imagem carregada com sucesso:', src);
                      e.target.style.border = '2px solid #52c41a';
                    }}
                  />
                );
              },
            },
            { title: 'Descrição', dataIndex: 'productDescription', key: 'productDescription' },
            { title: 'Grupo', dataIndex: 'productGroup', key: 'productGroup' },
            { title: 'Tipo', dataIndex: 'productType', key: 'productType' },
            { title: 'Código', dataIndex: 'productCode', key: 'productCode' },
            { title: 'Preço', dataIndex: 'preco', key: 'preco' },
            { title: 'Taxa IVA (%)', dataIndex: 'taxIva', key: 'taxIva' },
            { title: 'Preço Final', dataIndex: 'finalPrice', key: 'finalPrice' },
            {
              title: 'Unidade',
              dataIndex: 'unidadeMedida',
              key: 'unidadeMedida',
              render: (unidadeMedida) => unidadeMedida || 'N/A',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: s => {
                const isActive = s === true || s === '1' || s === 1 || s === 'true' || s === 'ATIVO';
                return (
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Tag>
                );
              }
            },
            {
              title: 'Ações',
              key: 'acoes',
              render: (_, record) => (
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => handleViewProduto(record)} />
                  <Button icon={<EditOutlined />} onClick={() => handleEditProduto(record)} />
                  <Button icon={<NodeExpandOutlined />} onClick={() => handleVerFilhos(record)}>
                    Ver Filhos
                  </Button>
                  <Popconfirm
                    title="Deseja realmente excluir este produto?"
                    onConfirm={() => handleDeleteProduto(record)}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <Button icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={filteredProdutos}
          rowKey="id"
          loading={loadingData}
          pagination={{ pageSize: 10 }}
          style={{ marginBottom: 32 }}
          title={() => (
            <div>
              <span>
                {showTodos ? "TODOS OS PRODUTOS" : "Produtos do Tipo Exame"} ({filteredProdutos.length})
              </span>
              {showTodos && (
                <Tag color="orange" style={{ marginLeft: 8 }}>
                  Modo Debug Ativo
                </Tag>
              )}
            </div>
          )}
        />

        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NodeExpandOutlined style={{ color: '#1890ff' }} />
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>Estrutura de Exames</span>
              <Button
                size="small"
                icon={<SearchOutlined />}
                onClick={async () => {
                  if (produtoPaiSelecionado) {
                    console.log('Forçando refresh completo dos filhos...');
                    await handleVerFilhos(produtoPaiSelecionado);
                    // Também refresh geral
                    await fetchProdutosExame();
                  }
                }}
              >
                Atualizar Tudo
              </Button>
            </div>
          }
          open={modalFilhosVisible}
          onCancel={() => setModalFilhosVisible(false)}
          footer={[
            <Button key="refresh" onClick={async () => {
              if (produtoPaiSelecionado) {
                await handleVerFilhos(produtoPaiSelecionado);
              }
            }}>
              <SearchOutlined /> Atualizar Filhos
            </Button>,
            <Button key="close" type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} onClick={() => setModalFilhosVisible(false)}>
              Fechar
            </Button>
          ]}
          width={800}
          styles={{ body: { backgroundColor: '#fafafa', padding: '20px' } }}
        >
          {produtoPaiSelecionado && (
            <div>
              <div style={{ 
                padding: 16,
                backgroundColor: '#e6f7ff',
                border: '2px solid #1890ff',
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: 4, fontSize: '16px' }}>
                  {produtoPaiSelecionado.productDescription}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ID: {produtoPaiSelecionado.id}
                </div>
              </div>
              
              {filhosProduto.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 40,
                  backgroundColor: '#fff',
                  borderRadius: 6,
                  border: '1px dashed #d9d9d9'
                }}>
                  <Text type="secondary" style={{ fontSize: '16px' }}>Nenhum filho encontrado</Text>
                </div>
              ) : (
                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: 6 }}>
                  {renderFilhosArvore(filhosProduto)}
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EyeOutlined style={{ color: '#1890ff' }} />
              <span>Detalhes do Produto</span>
            </div>
          }
          open={showProdutoDetails}
          onCancel={() => setShowProdutoDetails(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setShowProdutoDetails(false)}>
              Fechar
            </Button>
          ]}
          width={700}
          bodyStyle={{ padding: '24px' }}
        >
          {produtoSelecionado && (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <Text strong style={{ color: '#262626' }}>Descrição:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.productDescription}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Código:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.productCode || 'N/A'}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Grupo:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.productGroup}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Tipo:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.productType}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Preço:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.preco ? parseFloat(produtoSelecionado.preco).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Preço Final:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.finalPrice ? parseFloat(produtoSelecionado.finalPrice).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Taxa IVA:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.taxIva}% 
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#262626' }}>Unidade:</Text>
                  <div style={{ marginTop: 4, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {produtoSelecionado.unidadeMedida || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#262626' }}>Status:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={produtoSelecionado.status ? 'green' : 'red'}>
                    {produtoSelecionado.status ? 'Ativo' : 'Inativo'}
                  </Tag>
                </div>
              </div>

              {produtoSelecionado.imagem && (
                <div>
                  <Text strong style={{ color: '#262626' }}>Imagem:</Text>
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    {(() => {
                      // Se for texto inválido, mostrar erro
                      if (typeof produtoSelecionado.imagem === 'string' && 
                          !produtoSelecionado.imagem.includes('.') && 
                          !produtoSelecionado.imagem.startsWith('http') && 
                          !produtoSelecionado.imagem.startsWith('data:')) {
                        return <span style={{ color: '#ff4d4f' }}>Texto inválido no campo imagem</span>;
                      }
                      
                      const src = produtoSelecionado.imagem.startsWith('http') || produtoSelecionado.imagem.startsWith('data:')
                        ? produtoSelecionado.imagem
                        : `${api.defaults.baseURL}uploads/produtos/${produtoSelecionado.imagem}`;
                      
                      return (
                        <img
                          src={src}
                          alt={produtoSelecionado.productDescription}
                          style={{ 
                            maxWidth: 200, 
                            maxHeight: 200, 
                            borderRadius: 8,
                            border: '1px solid #d9d9d9',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.error('Erro ao carregar imagem no modal:', src);
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x200/e8e8e8/999999?text=SEM+IMAGEM';
                          }}
                          onLoad={(e) => {
                            console.log('Imagem do modal carregada com sucesso:', src);
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}

export default Exame;
