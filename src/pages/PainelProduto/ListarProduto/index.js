import { useState, useEffect, useContext, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Select, Input, Button, Checkbox, Spin, Alert, Space, Upload, notification } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import ProdutoTypeForm from '../ProdutoTypeForm';
import UnidadeMedidaForm from '../UnidadeMedidaForm';
import DynamicTable from '../DynamicTable';
import { AuthContext } from '../../../contexts/auth';
import { isFieldVisible, filterSchemaByUserType, FIELD_PERMISSIONS } from '../../../config/fieldAccess';

// Substitua o schema fixo pelo schema dinâmico igual ao NovoProduto
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

// Função utilitária para extrair a descrição da unidade
function extrairDescricaoUnidade(str) {
  if (!str) return '';
  return str.split(' (')[0];
}

const ListarProduto = () => {
  const [carregar, setCarregar] = useState(false);
  const [gruposDeProduto, setGruposDeProduto] = useState([]);
  const [tipoProduto, setTipoProduto] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [produto, setProduto] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenRemove, setModalIsOpenRemove] = useState(false);
  const [statusSendEdit, setStatusSendEdit] = useState(false);
  const [id, setId] = useState(null);
  const [btnEnviar, setBtnEnviar] = useState('Editar Produto');
  const [errosNoFront, setErrosNoFront] = useState([]);
  const [produtoRemover, setProdutoRemover] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [finalPrice, setFinalPrice] = useState('0.00');
  const [gruposMap, setGruposMap] = useState({});
  const [tiposMap, setTiposMap] = useState({});
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const { user } = useContext(AuthContext);
  const userType = user?.tipo || '';

  // Schema dinâmico conforme tipo de usuário
  const schema = useMemo(() => {
    const filteredSchema = filterSchemaByUserType(baseSchema, userType);
    return z.object(filteredSchema);
  }, [userType]);

  // Valores padrão conforme tipo de usuário
  const defaultProductGroup = useMemo(() => {
    const fieldConfig = FIELD_PERMISSIONS.productGroup;
    return fieldConfig?.getDefaultValue ? fieldConfig.getDefaultValue(userType) : '';
  }, [userType]);

  const isProductGroupReadOnly = useMemo(() => {
    const fieldConfig = FIELD_PERMISSIONS.productGroup;
    return fieldConfig?.isReadOnly ? fieldConfig.isReadOnly(userType) : false;
  }, [userType]);

  const defaultValues = useMemo(() => ({
    productType: '',
    productCode: '',
    productGroup: defaultProductGroup,
    productDescription: '',
    unidadeMedida: '',
    status: true,
    imagem: null,
    taxIva: '0',
    preco: '0',
    finalPrice: '0.00'
  }), [defaultProductGroup]);

  const filteredDefaultValues = useMemo(() => {
    const values = { ...defaultValues };
    Object.keys(values).forEach(key => {
      if (!isFieldVisible(key, userType)) {
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

  useEffect(() => {
    console.log('Base URL da API:', api.defaults.baseURL); // Depuração
  }, []);

  const fetchData = async () => {
    setCarregar(true);
    try {
      const [unidadesRes, gruposRes, tiposRes, produtosRes] = await Promise.all([
        api.get('unidade/all'),
        api.get('productgroup/all'),
        api.get('producttype/all'),
        api.get('produto/all'),
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
      console.log('Produtos recebidos:', produtosRes.data); // Depuração
      setProduto(produtosRes.data);
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

  const onSubmit = async (data) => {
    setCarregar(true);
    try {
      const productTypeId = tiposMap[data.productType];
      const productGroupId = gruposMap[data.productGroup];
      const unidadeSelecionada = unidades.find(u => u.descricao === data.unidadeMedida);
      const unidadeMedidaId = unidadeSelecionada?.id;

      if (!data.productType || !productTypeId) {
        throw new Error(`Tipo de produto inválido: ${data.productType}`);
      }
      if (!data.productGroup || !productGroupId) {
        throw new Error(`Grupo de produto inválido: ${data.productGroup}`);
      }
      if (!data.unidadeMedida || !unidadeMedidaId) {
        throw new Error(`Unidade de medida inválida: ${data.unidadeMedida}`);
      }

      // Garante que campos numéricos nunca sejam nulos ou vazios
      const preco = data.preco === '' || data.preco === null || isNaN(Number(data.preco)) ? '0.0' : data.preco.toString();
      const taxIva = data.taxIva === '' || data.taxIva === null || isNaN(Number(data.taxIva)) ? '0.0' : data.taxIva.toString();
      const finalPrice = data.finalPrice === '' || data.finalPrice === null || isNaN(Number(data.finalPrice)) ? '0.0' : data.finalPrice.toString();

      const formData = new FormData();
      formData.append('id', id);
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
      if (data.imagem && data.imagem.length > 0) {
        formData.append('imagem', data.imagem[0].originFileObj);
      }

      await api.put('produto/edit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notification.success({
        message: 'Sucesso',
        description: 'Produto editado com sucesso!',
        placement: 'topRight',
        className: 'custom-message',
      });

      reset();
      setModalIsOpen(false);
      setStatusSendEdit(false);
      setBtnEnviar('Editar Produto');
      setPreview(null);
      setExistingImage(null);
      fetchData();
    } catch (error) {
      // Mostra mensagem detalhada do backend, se houver, mesmo para status 400
      let errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erro ao editar produto';

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
        errorMessage = 'Acesso negado (403). Verifique se você tem permissão para editar produtos ou se está autenticado.';
      }

      setErrosNoFront(prev => [...prev, errorMessage]);
      notification.error({
        message: 'Erro',
        description: errorMessage,
        placement: 'topRight',
        className: 'custom-message',
      });
    } finally {
      setCarregar(false);
    }
  };

  const onEditar = (prod) => {
    setStatusSendEdit(true);
    setBtnEnviar('Editar Produto');
    setId(prod.id);

    const tipo = tipoProduto.find(t => t === prod.productType || tiposMap[t] === prod.productTypeId);
    const grupo = gruposDeProduto.find(g => g === prod.productGroup || gruposMap[g] === prod.productGroupId);
    const unidade = unidades.find(u => u.descricao === prod.unidadeMedida || u.id === prod.unidadeMedidaId);

    setValue('productType', tipo || prod.productType || '');
    setValue('productGroup', grupo || prod.productGroup || '');
    setValue('productCode', prod.productCode || '');
    setValue('productDescription', prod.productDescription || '');
    setValue('taxIva', prod.taxIva ? prod.taxIva.toString() : '0');
    setValue('preco', prod.preco ? prod.preco.toString() : '0');
    setValue('finalPrice', prod.finalPrice ? prod.finalPrice.toString() : '0.00');
    setValue('unidadeMedida', unidade?.descricao || extrairDescricaoUnidade(prod.unidadeMedida) || '');
    setValue('status', prod.status !== undefined ? prod.status : true); // Corrigido para manter status real
    setFinalPrice(prod.finalPrice ? prod.finalPrice.toString() : '0.00');

    // Corrigir URL da imagem
    let imageUrl = null;
    if (prod.imagem) {
      if (prod.imagem.startsWith('http')) {
        imageUrl = prod.imagem;
      } else {
        // Remove possíveis barras iniciais
        let imgPath = prod.imagem.startsWith('/') ? prod.imagem.slice(1) : prod.imagem;
        imageUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/produto/imagens/${imgPath}`;
      }
    }
    setExistingImage(imageUrl);
    setPreview(null);
    setModalIsOpen(true);
    setErrosNoFront([]); // Limpa erros antigos ao abrir modal
  };

  const onRemover = (data) => {
    setProdutoRemover(data);
    setModalIsOpenRemove(true);
  };

  const onConfirmar = async () => {
    setCarregar(true);
    try {
      await api.put('produto/del', { id: produtoRemover.id, status: false });
      notification.success({
        message: 'Sucesso',
        description: 'Produto removido com sucesso!',
        placement: 'topRight',
        className: 'custom-message',
      });
      fetchData();
      setModalIsOpenRemove(false);
    } catch (error) {
      console.error('Erro ao remover:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao remover produto';
      setErrosNoFront([...errosNoFront, errorMessage]);
      notification.error({
        message: 'Erro',
        description: errorMessage,
        placement: 'topRight',
        className: 'custom-message',
      });
    } finally {
      setCarregar(false);
    }
  };

  const orderedHeaders = {
    id: 'ID',
    imagem: 'Imagem',
    productDescription: 'Descrição do Produto',
    productGroup: 'Grupo do Produto',
    productType: 'Tipo do Produto',
    productCode: 'Código do Produto',
    preco: 'Preço',
    taxIva: 'Taxa do IVA (%)',
    finalPrice: 'Preço Final',
    unidadeMedida: 'Unidade de Medida',
  };

  const orderedData = produto.map(item => {
    const orderedItem = {};
    Object.keys(orderedHeaders).forEach(key => {
      if (key === 'unidadeMedida') {
        const unidade = unidades.find(u => u.id === item.unidadeMedidaId);
        orderedItem[key] = unidade ? `${unidade.descricao} (${unidade.abrevicao})` : 'N/A';
      } else if (key === 'imagem') {
        let imagemUrl = 'Sem Imagem';
        if (item.imagem) {
          // Corrige para garantir URL absoluta
          if (item.imagem.startsWith('http')) {
            imagemUrl = item.imagem;
          } else {
            // Remove possíveis barras iniciais
            let imgPath = item.imagem.startsWith('/') ? item.imagem.slice(1) : item.imagem;
            imagemUrl = `${api.defaults.baseURL.replace(/\/$/, '')}produto/imagens/${imgPath}`;
          }
        }
        orderedItem[key] = imagemUrl;
      } else {
        orderedItem[key] = item[key];
      }
    });
    return orderedItem;
  });

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = ['image/jpeg', 'image/png'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) {
        notification.error({
          message: 'Erro',
          description: 'Apenas imagens JPEG ou PNG.',
          placement: 'topRight',
          className: 'custom-message',
        });
        return Upload.LIST_IGNORE;
      }
      if (!isLt2M) {
        notification.error({
          message: 'Erro',
          description: 'A imagem deve ter no máximo 2MB!',
          placement: 'topRight',
          className: 'custom-message',
        });
        return Upload.LIST_IGNORE;
      }
      setPreview(URL.createObjectURL(file));
      return false;
    },
    maxCount: 1,
    listType: 'picture',
  };

  return (
    <div className="produto-form-container">
      <h2>Lista de Produtos</h2>
      {carregar ? (
        <Spin spinning />
      ) : (
        <DynamicTable
          data={orderedData}
          onEdit={onEditar}
          onDelete={onRemover}
          className="my-custom-table"
          headers={orderedHeaders}
          onRowClick={setSelectedRow}
          showActions={true}
        />
      )}
      {selectedRow && (
        <div className="selected-row-details">
          <h3>Dados da Linha Selecionada:</h3>
          <p><strong>Descrição:</strong> {selectedRow.productDescription}</p>
          <p><strong>Código:</strong> {selectedRow.productCode}</p>
          <p><strong>Preço:</strong> {selectedRow.preco}</p>
          <p><strong>Unidade de Medida:</strong> {selectedRow.unidadeMedida}</p>
          {selectedRow.imagem && selectedRow.imagem !== 'Sem Imagem' ? (
            <p>
              <strong>Imagem:</strong>
              <img
                src={selectedRow.imagem}
                alt="Produto"
                style={{ maxWidth: '100px', borderRadius: '4px' }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/100x100';
                }}
              />
            </p>
          ) : (
            <p><strong>Imagem:</strong> Sem Imagem</p>
          )}
        </div>
      )}
      <Modal
        title="Editar Produto"
        open={modalIsOpen}
        onCancel={() => {
          setModalIsOpen(false);
          reset();
          setPreview(null);
          setExistingImage(null);
          setErrosNoFront([]);
        }}
        footer={
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              form="editProductForm"
              loading={carregar}
              className="form-button form-button-primary"
            >
              {btnEnviar}
            </Button>
            <Button
              onClick={() => {
                reset();
                setPreview(null); // Limpa preview da imagem ao limpar
                setExistingImage(null); // Limpa imagem existente ao limpar
              }}
              disabled={carregar}
              className="form-button"
            >
              Limpar
            </Button>
            <Button
              onClick={() => {
                setModalIsOpen(false);
                reset();
                setPreview(null);
                setExistingImage(null);
                setErrosNoFront([]);
              }}
              disabled={carregar}
              className="form-button"
            >
              Fechar
            </Button>
          </Space>
        }
        className="produto-form-modal"
        width={600}
        styles={{ body: { height: 'auto', overflow: 'auto' } }}
      >
        <Spin spinning={carregar}>
          {errosNoFront.length > 0 && (
            <Alert
              message="Erros"
              description={errosNoFront.slice(0, 2).map((e, i) => (
                <div key={i} className="error-message">{e}</div>
              ))}
              type="error"
              showIcon
              className="form-error-alert"
            />
          )}
          <Form
            id="editProductForm"
            onFinish={handleSubmit(onSubmit)}
            layout="vertical"
            className="produto-form"
          >
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
                  <img src={preview} alt="Pré-visualização" className="imagem-preview" />
                )}
                {!preview && existingImage && (
                  <img src={existingImage} alt="Imagem Atual" className="imagem-preview" />
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
                <Space wrap={true}>
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
                <Space wrap={true}>
                  <Controller
                    name="productGroup"
                    control={control}
                    render={({ field }) => {
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
            </div>
            <div className="form-row">
              <Form.Item
                label="Unidade de Medida"
                validateStatus={errors.unidadeMedida ? 'error' : ''}
                help={errors.unidadeMedida?.message}
                className="form-item"
              >
                <Space wrap={true}>
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
            </div>
            <Form.Item
              label="Descrição do Produto"
              validateStatus={errors.productDescription ? 'error' : ''}
              help={errors.productDescription?.message}
              className="form-item"
            >
              <Controller
                name="productDescription"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Descrição do Produto" className="form-input" />}
              />
            </Form.Item>
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
                    label="Taxa de IVA (%)"
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
            <Form.Item>
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
          </Form>
        </Spin>
      </Modal>
      <Modal
        title="Deseja Remover Este Produto?"
        open={modalIsOpenRemove}
        onOk={onConfirmar}
        onCancel={() => setModalIsOpenRemove(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        confirmLoading={carregar}
        className='confi'
      />
    </div>
  );
};

export default ListarProduto;