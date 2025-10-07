import { useState, useEffect, useContext, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Select, Input, Button, Checkbox, Spin, Alert, Space, Upload, notification, TreeSelect, Divider, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

import { api } from '../../../service/api';
import ProdutoTypeForm from '../ProdutoTypeForm';
import UnidadeMedidaForm from '../UnidadeMedidaForm';
import ProdutoGroupForm from '../ProdutoGroupForm';
import { AuthContext } from '../../../contexts/auth';
import { isFieldVisible, filterSchemaByUserType, FIELD_PERMISSIONS } from '../../../config/fieldAccess';

// Schema base para validação do formulário
const baseSchema = {
  productType: z.string().min(1, { message: 'Selecione um tipo de produto.' }).max(200),
  productCode: z
    .string()
    .min(1, { message: 'O código do produto deve ter entre 1 e 60 caracteres.' })
    .max(60)
    .regex(/^[A-Za-z0-9]+$/, { message: 'O código deve ser alfanumérico.' }),
  productGroup: z.string().min(1, { message: 'Selecione um grupo de produto.' }).max(200),
  productDescription: z.string().min(3, { message: 'A descrição do produto deve ter entre 3 e 200 caracteres.' }).max(200),
  unidadeMedida: z.string().min(1, { message: 'Selecione uma unidade de medida.' }),
  status: z.boolean().default(true),
  imagem: z
    .any()
    .optional()
    .refine((file) => !file || file.length === 0 || file?.[0]?.size <= 2 * 1024 * 1024, 'A imagem deve ter no máximo 2MB')
    .refine(
      (file) => !file || file.length === 0 || ['image/jpeg', 'image/png'].includes(file?.[0]?.type),
      'Apenas imagens JPEG ou PNG são permitidas'
    ),
  // Campos de preço (serão filtrados conforme as permissões)
  taxIva: z.string().optional().transform(val => {
    if (!val) return 0;
    const taxNumber = parseFloat(val);
    return isNaN(taxNumber) || taxNumber < 0 ? 0 : taxNumber;
  }),
  preco: z.string().optional().transform(val => {
    if (!val) return 0;
    const precoNumber = parseFloat(val);
    return isNaN(precoNumber) || precoNumber < 0 ? 0 : precoNumber;
  }),
  finalPrice: z.string().optional().transform(val => {
    if (!val) return 0;
    const priceNumber = parseFloat(val);
    return isNaN(priceNumber) || priceNumber < 0 ? 0 : priceNumber;
  })
};

<<<<<<< HEAD
const NovoProduto = () => {
  const { user } = useContext(AuthContext);
  const userType = user?.tipo || '';
  const [showGroupModal, setShowGroupModal] = useState(false);
=======
const NovoProduto = ({ visible, onClose, modalTitle, submitButtonText, produtoParaEditar, onSuccess }) => {
  const [carregar, setCarregar] = useState(false);
>>>>>>> cf342109e49c7208f7b28aa53f82d80c56a6d4b7
  const [gruposDeProduto, setGruposDeProduto] = useState([]);
  const [tipoProduto, setTipoProduto] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errosNoFront, setErrosNoFront] = useState([]);
  const [finalPrice, setFinalPrice] = useState('0.00');
  const [gruposMap, setGruposMap] = useState({});
  const [tiposMap, setTiposMap] = useState({});
  const [preview, setPreview] = useState(null);
  const [carregar, setCarregar] = useState(false);
  
  // Cria o schema de validação baseado no tipo de usuário
  const schema = useMemo(() => {
    const filteredSchema = filterSchemaByUserType(baseSchema, userType);
    return z.object(filteredSchema);
  }, [userType]);
  
  // Obtém o valor padrão para o grupo de produto com base no tipo de usuário
  const defaultProductGroup = useMemo(() => {
    const fieldConfig = FIELD_PERMISSIONS.productGroup;
    return fieldConfig?.getDefaultValue ? fieldConfig.getDefaultValue(userType) : '';
  }, [userType]);

  // Verifica se o campo de grupo de produto deve ser somente leitura
  const isProductGroupReadOnly = useMemo(() => {
    const fieldConfig = FIELD_PERMISSIONS.productGroup;
    return fieldConfig?.isReadOnly ? fieldConfig.isReadOnly(userType) : false;
  }, [userType]);

  // Valores padrão para todos os campos
  const defaultValues = useMemo(() => ({
    productType: '',
    productCode: '',
    productGroup: defaultProductGroup, // Usa o valor padrão do grupo de produto
    productDescription: '',
    unidadeMedida: '',
    status: true,
    imagem: null,
    // Campos de preço com valores padrão
    taxIva: '0',
    preco: '0',
    finalPrice: '0.00'
  }), [defaultProductGroup]);
  
  // Filtra os valores padrão com base nas permissões do usuário
  const filteredDefaultValues = useMemo(() => {
    const values = { ...defaultValues };
    Object.keys(values).forEach(key => {
      if (!isFieldVisible(key, userType)) {
        // Define valores padrão para campos ocultos
        if (key === 'taxIva' || key === 'preco' || key === 'finalPrice') {
          values[key] = '0';
        } else if (key === 'status') {
          values[key] = true;
        } else {
          values[key] = '';
        }
      }
    });
    return values;
  }, [defaultValues, userType]);
  // Busca os dados iniciais ao carregar o componente
  const fetchData = async () => {
    setCarregar(true);
    try {
      console.log('Carregando dados iniciais...');
      const [unidadesRes, gruposRes, tiposRes] = await Promise.all([
        api.get('unidade/all'),
        api.get('productgroup/all'),
        api.get('producttype/all')
      ]);

      // Processa as unidades
      setUnidades(unidadesRes.data);

      // Processa os grupos de produto
      const gruposArray = [];
      const newGruposMap = {};
      gruposRes.data.forEach(grupo => {
        if (grupo.designacaoProduto && grupo.id) {
          newGruposMap[grupo.designacaoProduto] = grupo.id;
          gruposArray.push(grupo.designacaoProduto);
        }
      });
      setGruposDeProduto(gruposArray);
      setGruposMap(newGruposMap);

      // Processa os tipos de produto
      const newTiposMap = {};
      const tiposArray = [];
      tiposRes.data.forEach(tipo => {
        if (tipo.designacaoTipoProduto && tipo.id) {
          newTiposMap[tipo.designacaoTipoProduto] = tipo.id;
          tiposArray.push(tipo.designacaoTipoProduto);
        }
      });
      setTipoProduto(tiposArray);
      setTiposMap(newTiposMap);

      console.log('Dados carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      notification.error({
        message: 'Erro ao carregar dados',
        description: (
          <div>
            Não foi possível carregar os dados iniciais.<br />
            <b>Detalhes:</b> {error?.response?.data?.message || error.message || 'Erro desconhecido'}
            <br />
            <Button size="small" type="link" onClick={fetchData}>Tentar novamente</Button>
          </div>
        ),
        duration: 8,
      });
    } finally {
      setCarregar(false);
    }
  };

  // Efeito para carregar os dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Estado para filhos (produtos filhos)
  const [filhos, setFilhos] = useState([]); // [{id, data, isNovo, filhos: []}]
  const [produtosExistentes, setProdutosExistentes] = useState([]); // Para busca de exames existentes
  const [showAdicionarFilho, setShowAdicionarFilho] = useState(false);
  const [produtoFilhoSelecionado, setProdutoFilhoSelecionado] = useState(null);

  // Adicionar estado para exame composto
  const [isComposto, setIsComposto] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: filteredDefaultValues,
  });

  const watchedPreco = watch('preco');
  const watchedTaxIva = watch('taxIva');

  useEffect(() => {
    const preco = Number(watchedPreco) || 0;
    const iva = Number(watchedTaxIva) || 0;
    const valor = preco + (preco * iva / 100);
    const valorFormatado = isNaN(valor) ? '0.00' : valor.toFixed(2);
    setFinalPrice(valorFormatado);
    setValue('finalPrice', valorFormatado);
  }, [watchedPreco, watchedTaxIva, setValue]);

<<<<<<< HEAD
  // A função fetchData já foi definida anteriormente no componente
  // e será usada para carregar os dados iniciais
=======
  const fetchData = async () => {
    setCarregar(true);
    try {
      const [unidadesRes, gruposRes, tiposRes] = await Promise.all([
        api.get('/unidade/all'),
        api.get('/productgroup/all'),
        api.get('/producttype/all'),
      ]);
      setUnidades(unidadesRes.data);
      const newGruposMap = {};
      const gruposArray = [];
      gruposRes.data.forEach(grupo => {
        if (grupo.designacaoProduto && grupo.id) {
          newGruposMap[grupo.designacaoProduto] = grupo.id;
          gruposArray.push(grupo.designacaoProduto);
        }
      });
      setGruposDeProduto(gruposArray);
      setGruposMap(newGruposMap);
      const newTiposMap = {};
      const tiposArray = [];
      tiposRes.data.forEach(tipo => {
        if (tipo.designacaoTipoProduto && tipo.id) {
          newTiposMap[tipo.designacaoTipoProduto] = tipo.id;
          tiposArray.push(tipo.designacaoTipoProduto);
        }
      });
      setTipoProduto(tiposArray);
      setTiposMap(newTiposMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrosNoFront(prev => [...prev, 'Erro ao carregar dados iniciais']);
    } finally {
      setCarregar(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
>>>>>>> cf342109e49c7208f7b28aa53f82d80c56a6d4b7

  // Preencher formulário para edição ou novo
  useEffect(() => {
    if (visible) {
      if (produtoParaEditar) {
        // Edição: preencher com dados do produto, convertendo números para string e status/unidade para valor correto
        // Buscar unidade pelo ID ou nome
        let unidadeValue = '';
        if (produtoParaEditar.unidadeMedidaId && Array.isArray(unidades)) {
          const unidadeObj = unidades.find(u => u.id === produtoParaEditar.unidadeMedidaId);
          unidadeValue = unidadeObj ? unidadeObj.descricao : (produtoParaEditar.unidadeMedida || '');
        } else {
          unidadeValue = produtoParaEditar.unidadeMedida || '';
        }
        // Corrigir status para booleano true apenas se for true, '1', 1, 'true', 'ATIVO'
        const statusValue = (
          produtoParaEditar.status === true ||
          produtoParaEditar.status === '1' ||
          produtoParaEditar.status === 1 ||
          produtoParaEditar.status === 'true' ||
          (typeof produtoParaEditar.status === 'string' && produtoParaEditar.status.toUpperCase() === 'ATIVO')
        );
        reset({
          productType: produtoParaEditar.productType || '',
          productCode: produtoParaEditar.productCode || '',
          productGroup: produtoParaEditar.productGroup || '',
          productDescription: produtoParaEditar.productDescription || '',
          taxIva: produtoParaEditar.taxIva !== undefined && produtoParaEditar.taxIva !== null ? String(produtoParaEditar.taxIva) : '',
          preco: produtoParaEditar.preco !== undefined && produtoParaEditar.preco !== null ? String(produtoParaEditar.preco) : '',
          finalPrice: produtoParaEditar.finalPrice !== undefined && produtoParaEditar.finalPrice !== null ? String(produtoParaEditar.finalPrice) : '',
          unidadeMedida: unidadeValue,
          status: statusValue,
          imagem: null,
        });
        setIsComposto(!!(produtoParaEditar && produtoParaEditar.produtoPaiId === null));
        // Buscar filhos do produto para edição
        const fetchArvore = async () => {
          try {
            const res = await api.get(`/produto/${produtoParaEditar.id}/arvore`);
            // Converter árvore para estrutura [{id, data, isNovo, filhos: []}]
            const mapArvore = (node) => ({
              id: node.id,
              data: produtosExistentes.find(p => p.id === node.id) || {},
              isNovo: false,
              filhos: (node.filhos || []).map(mapArvore),
            });
            if (res.data && res.data.filhos) {
              setFilhos(res.data.filhos.map(mapArvore));
            } else {
              setFilhos([]);
            }
          } catch {
            setFilhos([]);
          }
        };
        fetchArvore();
      } else {
        // Novo: pré-selecionar 'Exame' se existir
        const tipoExame = tipoProduto.find((t) => t.toLowerCase() === 'exame');
        reset({
          productType: tipoExame || '',
          productCode: '',
          productGroup: '',
          productDescription: '',
          taxIva: '',
          preco: '',
          finalPrice: '0.00',
          unidadeMedida: '',
          status: true,
          imagem: null,
        });
        setIsComposto(false);
      }
    }
  }, [visible, produtoParaEditar, tipoProduto, reset, unidades, produtosExistentes]);

  // Buscar todos produtos do tipo exame para seleção de filhos existentes
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await api.get('/produto/all');
        setProdutosExistentes(res.data || []);
      } catch (e) {
        setProdutosExistentes([]);
      }
    };
    fetchProdutos();
  }, []);

  // Limpar filhos ao abrir novo modal
  useEffect(() => {
    if (visible && !produtoParaEditar) {
      setFilhos([]);
    }
    if (visible && produtoParaEditar && produtoParaEditar.id) {
      // Buscar árvore de filhos do produto para edição
      const fetchArvore = async () => {
        try {
          const res = await api.get(`/produto/${produtoParaEditar.id}/arvore`);
          // Converter árvore para estrutura [{id, data, isNovo, filhos: []}]
          const mapArvore = (node) => ({
            id: node.id,
            data: produtosExistentes.find(p => p.id === node.id) || {},
            isNovo: false,
            filhos: (node.filhos || []).map(mapArvore),
          });
          if (res.data && res.data.filhos) {
            setFilhos(res.data.filhos.map(mapArvore));
          } else {
            setFilhos([]);
          }
        } catch {
          setFilhos([]);
        }
      };
      fetchArvore();
    }
  }, [visible, produtoParaEditar, produtosExistentes]);

  // Adicionar novo filho (produto novo)
  const handleAdicionarFilhoNovo = () => {
    setFilhos([...filhos, { id: null, data: {}, isNovo: true, filhos: [] }]);
  };
  // Adicionar filho existente
  const handleAdicionarFilhoExistente = () => {
    if (!produtoFilhoSelecionado) return;
    const produto = produtosExistentes.find(p => p.id === produtoFilhoSelecionado);
    if (!produto) return;
    setFilhos([...filhos, { id: produto.id, data: produto, isNovo: false, filhos: [] }]);
    setProdutoFilhoSelecionado(null);
    setShowAdicionarFilho(false);
  };
  // Remover filho
  const handleRemoverFilho = (index) => {
    setFilhos(filhos.filter((_, i) => i !== index));
  };

  // Substituir renderFilhos por uma versão recursiva com ações em cada nó
  const renderFilhos = (filhosArr, nivel = 1, parentArr = filhos, parentSet = setFilhos) => (
    <div style={{ marginLeft: nivel * 16 }}>
      {filhosArr.map((filho, idx) => (
        <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8, borderRadius: 4, background: '#fafafa' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {filho.isNovo ? (
              <Input
                placeholder="Descrição do Exame Filho"
                value={filho.data.productDescription || ''}
                onChange={e => {
                  const novos = [...parentArr];
                  novos[idx].data.productDescription = e.target.value;
                  parentSet(novos);
                }}
                style={{ width: 250 }}
              />
            ) : (
              <span><b>Filho Existente:</b> {filho.data.productDescription}</span>
            )}
            <Space>
              <Button size="small" icon={<PlusOutlined />} onClick={() => {
                const novos = [...parentArr];
                if (!novos[idx].filhos) novos[idx].filhos = [];
                novos[idx].filhos.push({ id: null, data: {}, isNovo: true, filhos: [] });
                parentSet(novos);
              }}>Adicionar Filho</Button>
              <Button size="small" onClick={() => {
                const novos = [...parentArr];
                novos[idx].showAdicionarFilhoExistente = true;
                parentSet(novos);
              }}>Adicionar Filho Existente</Button>
              <Popconfirm
                title="Deseja remover este filho?"
                onConfirm={() => {
                  const novos = [...parentArr];
                  novos.splice(idx, 1);
                  parentSet(novos);
                }}
                okText="Sim"
                cancelText="Não"
              >
                <Button size="small" danger>Remover</Button>
              </Popconfirm>
            </Space>
            {/* Se showAdicionarFilhoExistente estiver true, mostrar select para adicionar filho existente */}
            {filho.showAdicionarFilhoExistente && (
              <div style={{ marginTop: 8 }}>
                <Select
                  showSearch
                  style={{ width: 300 }}
                  placeholder="Selecione um exame existente"
                  value={filho.produtoFilhoSelecionado}
                  onChange={val => {
                    const novos = [...parentArr];
                    novos[idx].produtoFilhoSelecionado = val;
                    parentSet(novos);
                  }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {produtosExistentes.map(p => (
                    <Select.Option key={p.id} value={p.id}>{p.productDescription}</Select.Option>
                  ))}
                </Select>
                <Button type="primary" size="small" onClick={() => {
                  const novos = [...parentArr];
                  const produto = produtosExistentes.find(p => p.id === novos[idx].produtoFilhoSelecionado);
                  if (produto) {
                    if (!novos[idx].filhos) novos[idx].filhos = [];
                    novos[idx].filhos.push({ id: produto.id, data: produto, isNovo: false, filhos: [] });
                  }
                  novos[idx].showAdicionarFilhoExistente = false;
                  novos[idx].produtoFilhoSelecionado = null;
                  parentSet(novos);
                }} style={{ marginLeft: 8 }}>Adicionar</Button>
                <Button size="small" onClick={() => {
                  const novos = [...parentArr];
                  novos[idx].showAdicionarFilhoExistente = false;
                  parentSet(novos);
                }} style={{ marginLeft: 8 }}>Cancelar</Button>
              </div>
            )}
            {/* Recursivo: filhos dos filhos */}
            {filho.filhos && filho.filhos.length > 0 && renderFilhos(filho.filhos, nivel + 1, filho.filhos, novos => {
              const novosPais = [...parentArr];
              novosPais[idx].filhos = novos;
              parentSet(novosPais);
            })}
          </Space>
        </div>
      ))}
    </div>
  );

  // Função recursiva para cadastrar produto e seus filhos (agora usando JSON)
  const cadastrarProdutoComFilhos = async (produtoData, filhosArr, produtoPaiId = null) => {
    const productTypeId = tiposMap[produtoData.productType];
    const productGroupId = gruposMap[produtoData.productGroup];
    const unidadeSelecionada = unidades.find(u => u.descricao === produtoData.unidadeMedida);
    const unidadeMedidaId = unidadeSelecionada?.id;
    // Montar o payload JSON
    const payload = {
      productType: produtoData.productType,
      productCode: produtoData.productCode,
      productGroup: produtoData.productGroup,
      productDescription: produtoData.productDescription,
      taxIva: produtoData.taxIva,
      preco: produtoData.preco,
      finalPrice: produtoData.finalPrice,
      unidadeMedida: produtoData.unidadeMedida,
      status: produtoData.status === true || produtoData.status === '1' || produtoData.status === 1 ? true : false,
      productTypeId: productTypeId,
      productGroupId: productGroupId,
      unidadeMedidaId: unidadeMedidaId,
      produtoPaiId: produtoPaiId,
      imagem: null // ignorar imagem por enquanto
    };
    // Cadastrar produto
    let produtoId = null;
    try {
      const res = await api.post('/produto/add', payload); // axios envia como JSON
      // O backend retorna mensagem, precisamos buscar o produto pelo nome para pegar o id
      const busca = await api.get('/produto/all');
      const produtoSalvo = (busca.data || []).find(p => p.productDescription === produtoData.productDescription);
      produtoId = produtoSalvo?.id;
    } catch (e) {
      toast.error('Erro ao cadastrar produto: ' + (e.response?.data?.message || e.message), { autoClose: 2000 });
      throw e;
    }
    // Recursivo: cadastrar filhos
    for (const filho of filhosArr) {
      if (filho.isNovo) {
        await cadastrarProdutoComFilhos(
          {
            ...produtoData,
            productDescription: filho.data.productDescription,
            productCode: filho.data.productCode || Math.random().toString(36).substring(2, 10),
          },
          filho.filhos,
          produtoId
        );
      } else {
        if (filho.id && produtoId) {
          try {
            await api.put(`/produto/${filho.id}`, { ...filho.data, produtoPaiId: produtoId });
          } catch (e) {
            toast.error('Erro ao associar filho existente: ' + (e.response?.data?.message || e.message), { autoClose: 2000 });
          }
        }
        if (filho.filhos && filho.filhos.length > 0) {
          await cadastrarProdutoComFilhos(filho.data, filho.filhos, filho.id);
        }
      }
    }
    return produtoId;
  };

  // Substituir onSubmit para usar a lógica recursiva
  const onSubmit = async (data) => {
    setCarregar(true);
    try {
<<<<<<< HEAD
      const productTypeId = tiposMap[data.productType];
      const productGroupId = gruposMap[data.productGroup];
      const unidadeSelecionada = unidades.find(u => u.descricao === data.unidadeMedida);
      const unidadeMedidaId = unidadeSelecionada?.id;

      if (!data.productType || !data.productGroup || !data.unidadeMedida || !productTypeId || !productGroupId || !unidadeMedidaId) {
        throw new Error('Campos obrigatórios não preenchidos corretamente.');
      }

      // Garante que campos numéricos nunca sejam nulos ou vazios
      const preco = data.preco === '' || data.preco === null || isNaN(Number(data.preco)) ? '0.0' : data.preco.toString();
      const taxIva = data.taxIva === '' || data.taxIva === null || isNaN(Number(data.taxIva)) ? '0.0' : data.taxIva.toString();
      const finalPrice = data.finalPrice === '' || data.finalPrice === null || isNaN(Number(data.finalPrice)) ? '0.0' : data.finalPrice.toString();

      const formData = new FormData();
      formData.append('productType', data.productType);
      formData.append('productTypeId', productTypeId);
      formData.append('productCode', data.productCode);
      formData.append('productGroup', data.productGroup);
      formData.append('productGroupId', productGroupId);
      formData.append('productDescription', data.productDescription);
      formData.append('unidadeMedida', data.unidadeMedida);
      formData.append('unidadeMedidaId', unidadeMedidaId);
      formData.append('preco', preco);
      formData.append('taxIva', taxIva);
      formData.append('finalPrice', finalPrice);
      formData.append('status', data.status ? '1' : '0');
      if (isFieldVisible('imagem', userType) && data.imagem && data.imagem.length > 0) {
        formData.append('imagem', data.imagem[0].originFileObj);
      }

      await api.post('produto/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notification.success({
        message: 'Sucesso',
        description: 'Produto cadastrado com sucesso!',
        placement: 'topRight',
        className: 'custom-message',
      });

=======
      await cadastrarProdutoComFilhos(data, isComposto ? filhos : [], null);
      toast.success('Produto e filhos cadastrados com sucesso!', { autoClose: 2000 });
>>>>>>> cf342109e49c7208f7b28aa53f82d80c56a6d4b7
      reset();
      setFilhos([]);
      setIsComposto(false);
      if (onClose) onClose();
      if (onSuccess) onSuccess();
      setErrosNoFront([]);
      setPreview(null);
    } catch (error) {
<<<<<<< HEAD
      // Mostra mensagem detalhada do backend, se houver, mesmo para status 400
      let errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erro ao cadastrar produto';

      // Exibe o corpo da resposta do backend se não houver mensagem clara
      if (
        error.response?.status === 400 &&
        !error.response?.data?.message &&
        !error.response?.data?.error
      ) {
        if (typeof error.response?.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response?.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      if (
        error.response?.status === 400 &&
        (error.response?.data?.message || error.response?.data?.error)
      ) {
        errorMessage = error.response.data.message || error.response.data.error;
        if (
          errorMessage.toLowerCase().includes('descrição') &&
          errorMessage.toLowerCase().includes('existe')
        ) {
          errorMessage = 'Já existe um produto com esta descrição!';
        }
        if (
          errorMessage.toLowerCase().includes('description') &&
          errorMessage.toLowerCase().includes('exists')
        ) {
          errorMessage = 'Já existe um produto com esta descrição!';
        }
      }

      if (error.response?.status === 403) {
        errorMessage = 'Acesso negado (403). Verifique se você tem permissão para cadastrar produtos ou se está autenticado.';
      }

=======
      let errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Erro ao cadastrar produto e filhos';
      if (typeof errorMessage === 'object') {
        errorMessage = errorMessage.message || JSON.stringify(errorMessage);
      }
>>>>>>> cf342109e49c7208f7b28aa53f82d80c56a6d4b7
      setErrosNoFront(prev => [...prev, errorMessage]);
      toast.error(errorMessage, { autoClose: 2000 });
    } finally {
      setCarregar(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    reset();
    setErrosNoFront([]);
    setPreview(null);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = ['image/jpeg', 'image/png'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        toast.error('Apenas imagens JPEG ou PNG são permitidas!', { autoClose: 2000 });
        return Upload.LIST_IGNORE;
      }
      if (!isLt2M) {
        toast.error('A imagem deve ter no máximo 2MB!', { autoClose: 2000 });
        return Upload.LIST_IGNORE;
      }
      setPreview(URL.createObjectURL(file));
      return false;
    },
    maxCount: 1,
    listType: 'picture',
  };

  // Sempre que abrir o modal de grupo, recarrega os grupos
  useEffect(() => {
    if (showGroupModal) {
      fetchData();
    }
  }, [showGroupModal]);

  return (
    <div className="product-container">
      {/* Remover o botão e título internos */}
      <Modal
        title={modalTitle || "Novo Exame"}
        open={visible !== undefined ? visible : modalIsOpen}
        onCancel={onClose || closeModal}
        footer={null}
        className="product-form-modal"
        width={900}
      >
        <Spin spinning={carregar}>
          {errosNoFront.length > 0 && (
            <Alert
              message="Erros"
              description={errosNoFront.map((e, i) => (
                <div key={i} className="error-message">{typeof e === 'object' ? JSON.stringify(e) : e}</div>
              ))}
              type="error"
              showIcon
              className="form-error-alert"
            />
          )}
          <Form onFinish={handleSubmit(onSubmit)} layout="vertical" className="product-form">
            <div className="form-row">
              <Form.Item
                label="Imagem"
                validateStatus={errors.imagem ? 'error' : ''}
                help={errors.imagem?.message}
                className="form-item"
              >
                <Controller
                  name="imagem"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Upload {...uploadProps} onChange={({ fileList }) => onChange(fileList)}>
                      <Button icon={<UploadOutlined />}>Selecionar Imagem</Button>
                    </Upload>
                  )}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Pré-visualização"
                    className="imagem-preview"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/EEE/31343C';
                    }}
                  />
                )}
              </Form.Item>
            </div>
            <div className="form-row">
              <Form.Item
                label="Tipo de Produto"
                validateStatus={errors.productType ? 'error' : ''}
                help={errors.productType?.message}
                className="form-item"
              >
                <Space>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Selecione o Tipo do Produto"
                        className="form-select"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        value={field.value || undefined}
                      >
                        {tipoProduto.length > 0 ? (
                          tipoProduto.map((tipo) => (
                            <Select.Option key={tipo} value={tipo}>
                              {tipo}
                            </Select.Option>
                          ))
                        ) : (
                          <Select.Option value="" disabled>
                            Nenhum tipo disponível
                          </Select.Option>
                        )}
                      </Select>
                    )}
                  />
                  <ProdutoTypeForm buscarTiposProduto={fetchData} />
                </Space>
              </Form.Item>
              <Form.Item
                label="Grupo do Produto"
                validateStatus={errors.productGroup ? 'error' : ''}
                help={errors.productGroup?.message}
                className="form-item"
              >
                <Space>
                  <Controller
                    name="productGroup"
                    control={control}
                    render={({ field }) => {
                      // Se for somente leitura, exibe o valor padrão como texto
                      if (isProductGroupReadOnly) {
                        return (
                          <Input
                            value={field.value}
                            readOnly
                            className="form-input"
                            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                          />
                        );
                      }
                      
                      // Se não for somente leitura, exibe o select normalmente
                      return (
                        <Select
                          {...field}
                          placeholder="Selecione um Grupo"
                          className="form-select"
                          showSearch
                          allowClear={!isProductGroupReadOnly}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          value={field.value || undefined}
                          disabled={isProductGroupReadOnly}
                        >
                          {gruposDeProduto.length > 0 ? (
                            gruposDeProduto.map((grupo) => (
                              <Select.Option key={grupo} value={grupo}>
                                {grupo}
                              </Select.Option>
                            ))
                          ) : (
                            <Select.Option value="" disabled>
                              Nenhum grupo disponível
                            </Select.Option>
                          )}
                        </Select>
                      );
                    }}
                  />
                </Space>
              </Form.Item>
              <Form.Item
                label="Unidade de Medida"
                validateStatus={errors.unidadeMedida ? 'error' : ''}
                help={errors.unidadeMedida?.message}
                className="form-item"
              >
                <Space>
                  <Controller
                    name="unidadeMedida"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Selecione uma Unidade"
                        className="form-select"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        value={field.value || undefined}
                      >
                        {unidades.length > 0 ? (
                          unidades.map((unidade) => (
                            <Select.Option key={unidade.id} value={unidade.descricao}>
                              {`${unidade.descricao} (${unidade.abrevicao})`}
                            </Select.Option>
                          ))
                        ) : (
                          <Select.Option value="" disabled>
                            Nenhuma unidade disponível
                          </Select.Option>
                        )}
                      </Select>
                    )}
                  />
                  <UnidadeMedidaForm buscarUnidades={fetchData} />
                </Space>
              </Form.Item>
            </div>
            <div className="form-row">
              <Form.Item
                label="Código do Produto"
                validateStatus={errors.productCode ? 'error' : ''}
                help={errors.productCode?.message}
                className="form-item"
              >
                <Controller
                  name="productCode"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Código" className="form-input" />}
                />
              </Form.Item>
              <Form.Item
                label="Descrição do Produto"
                validateStatus={errors.productDescription ? 'error' : ''}
                help={errors.productDescription?.message}
                className="form-item"
              >
                <Controller
                  name="productDescription"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Descrição do Produto"
                      className="form-input"
                    />
                  )}
                />
              </Form.Item>
            </div>
            
            {isFieldVisible('preco', userType) && (
              <div className="form-row">
                <Form.Item
                  label="Preço"
                  validateStatus={errors.preco ? 'error' : ''}
                  help={errors.preco?.message}
                  className="form-item"
                >
                  <Controller
                    name="preco"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Digite o preço"
                        className="form-input"
                      />
                    )}
                  />
                </Form.Item>

                {isFieldVisible('taxIva', userType) && (
                  <Form.Item
                    label="Taxa IVA (%)"
                    validateStatus={errors.taxIva ? 'error' : ''}
                    help={errors.taxIva?.message}
                    className="form-item"
                  >
                    <Controller
                      name="taxIva"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Digite a taxa de IVA"
                          className="form-input"
                        />
                      )}
                    />
                  </Form.Item>
                )}

                {isFieldVisible('finalPrice', userType) && (
                  <Form.Item
                    label="Preço Final"
                    className="form-item"
                  >
                  <Controller
                    name="finalPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={finalPrice}
                        disabled
                        className="form-input"
                      />
                    )}
                    />
                  </Form.Item>
                )}
              </div>
            )}
            
            <div className="form-row">
              <Form.Item className="form-item">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
                      Ativo
                    </Checkbox>
                  )}
                />
              </Form.Item>
            </div>
            <Form.Item label="Exame Composto">
              <Checkbox checked={isComposto} onChange={e => setIsComposto(e.target.checked)}>
                Este exame é composto (possui filhos)?
              </Checkbox>
            </Form.Item>
            {isComposto && (
              <>
                <Divider>Exames Compostos (Filhos)</Divider>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: 8 }}>Produto Pai</div>
                <div style={{ marginLeft: 0, marginBottom: 8, padding: 8, background: '#f0f5ff', border: '1px solid #91d5ff', borderRadius: 4 }}>
                  {watch('productDescription') || 'Sem descrição'}
                </div>
                <div style={{ fontWeight: 'bold', color: '#555', marginBottom: 8 }}>Produtos Filhos</div>
                <Space style={{ marginBottom: 8 }}>
                  <Button icon={<PlusOutlined />} onClick={handleAdicionarFilhoNovo}>Adicionar Novo Filho</Button>
                  <Button onClick={() => setShowAdicionarFilho(true)}>Adicionar Filho Existente</Button>
                </Space>
                {showAdicionarFilho && (
                  <div style={{ marginTop: 8 }}>
                    <Select
                      showSearch
                      style={{ width: 300 }}
                      placeholder="Selecione um exame existente"
                      value={produtoFilhoSelecionado}
                      onChange={setProdutoFilhoSelecionado}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {produtosExistentes.map(p => (
                        <Select.Option key={p.id} value={p.id}>{p.productDescription}</Select.Option>
                      ))}
                    </Select>
                    <Button type="primary" onClick={handleAdicionarFilhoExistente} style={{ marginLeft: 8 }}>Adicionar</Button>
                    <Button onClick={() => setShowAdicionarFilho(false)} style={{ marginLeft: 8 }}>Cancelar</Button>
                  </div>
                )}
                <div style={{ marginLeft: 0 }}>{renderFilhos(filhos, 1, filhos, setFilhos)}</div>
              </>
            )}
            <Form.Item className="product-form-buttons">
              <Space>
                <Button type="primary" htmlType="submit" loading={carregar} className="form-button form-button-primary">
                  {submitButtonText || "Cadastrar Produto"}
                </Button>
                <Button onClick={() => reset()} disabled={carregar} className="form-button">
                  Limpar
                </Button>
                <Button onClick={onClose || closeModal} disabled={carregar} className="form-button">
                  Fechar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      
      {/* Modal para adicionar novo grupo de produto */}
      <Modal
        title="Adicionar Novo Grupo de Produto"
        open={showGroupModal}
        onCancel={() => setShowGroupModal(false)}
        footer={null}
        destroyOnClose
      >
        <ProdutoGroupForm 
          buscarProdutosGrupos={() => {
            fetchData();
            setShowGroupModal(false);
          }} 
        />
      </Modal>
    </div>
  );
};

export default NovoProduto;

// Adicione esta função utilitária para testar se a imagem realmente existe no servidor
function checkImage(url, onSuccess, onError) {
  const img = new window.Image();
  img.onload = onSuccess;
  img.onerror = onError;
  img.src = url;
}