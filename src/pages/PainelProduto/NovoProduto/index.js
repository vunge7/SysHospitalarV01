import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Select, Input, Button, Checkbox, Spin, Alert, Space, Upload, notification } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

import { api } from '../../../service/api';
import ProdutoTypeForm from '../ProdutoTypeForm';
import UnidadeMedidaForm from '../UnidadeMedidaForm';

// Esquema de validação com Zod
const schema = z.object({
  productType: z.string().min(1, { message: 'Selecione um tipo de produto.' }).max(200),
  productCode: z
    .string()
    .min(1, { message: 'O código do produto deve ter entre 1 e 60 caracteres.' })
    .max(60)
    .regex(/^[A-Za-z0-9]+$/, { message: 'O código deve ser alfanumérico.' }),
  productGroup: z.string().min(1, { message: 'Selecione um grupo de produto.' }).max(200),
  productDescription: z.string().min(3, { message: 'A descrição do produto deve ter entre 3 e 200 caracteres.' }).max(200),
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
  }),
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
});

const NovoProduto = ({ visible, onClose, modalTitle, submitButtonText, produtoParaEditar, onSuccess }) => {
  const [carregar, setCarregar] = useState(false);
  const [gruposDeProduto, setGruposDeProduto] = useState([]);
  const [tipoProduto, setTipoProduto] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errosNoFront, setErrosNoFront] = useState([]);
  const [finalPrice, setFinalPrice] = useState('0.00');
  const [gruposMap, setGruposMap] = useState({});
  const [tiposMap, setTiposMap] = useState({});
  const [preview, setPreview] = useState(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      productType: '',
      productCode: '',
      productGroup: '',
      productDescription: '',
      taxIva: '',
      preco: '',
      finalPrice: '0.00',
      unidadeMedida: '',
      status: true,
      imagem: null,
    },
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

  const fetchData = async () => {
    setCarregar(true);
    try {
      const [unidadesRes, gruposRes, tiposRes] = await Promise.all([
        api.get('unidade/all'),
        api.get('productgroup/all'),
        api.get('producttype/all'),
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
      }
    }
  }, [visible, produtoParaEditar, tipoProduto, reset, unidades]);

  const onSubmit = async (data) => {
    setCarregar(true);
    try {
      const productTypeId = tiposMap[data.productType];
      const productGroupId = gruposMap[data.productGroup];
      const unidadeSelecionada = unidades.find(u => u.descricao === data.unidadeMedida);
      const unidadeMedidaId = unidadeSelecionada?.id;

      // Validação reforçada
      if (!data.productType) throw new Error('Tipo de produto é obrigatório.');
      if (!productTypeId || isNaN(productTypeId)) throw new Error('Tipo de produto inválido.');
      if (!data.productGroup) throw new Error('Grupo de produto é obrigatório.');
      if (!productGroupId || isNaN(productGroupId)) throw new Error('Grupo de produto inválido.');
      if (!data.productDescription) throw new Error('Descrição do produto é obrigatória.');
      if (!data.productCode) throw new Error('Código do produto é obrigatório.');
      if (!data.unidadeMedida) throw new Error('Unidade de medida é obrigatória.');
      if (!unidadeMedidaId || isNaN(unidadeMedidaId)) throw new Error('Unidade de medida inválida.');
      if (!data.preco || isNaN(Number(data.preco)) || Number(data.preco) < 0) throw new Error('Preço inválido.');
      if (data.taxIva === undefined || data.taxIva === null || isNaN(Number(data.taxIva)) || Number(data.taxIva) < 0) throw new Error('Taxa de IVA inválida.');
      if (!data.finalPrice || isNaN(Number(data.finalPrice))) throw new Error('Preço final inválido.');

      const formData = new FormData();
      formData.append('productType', data.productType);
      formData.append('productTypeId', String(productTypeId));
      formData.append('productCode', data.productCode);
      formData.append('productGroup', data.productGroup);
      formData.append('productGroupId', String(productGroupId));
      formData.append('productDescription', data.productDescription);
      formData.append('unidadeMedida', data.unidadeMedida);
      formData.append('unidadeMedidaId', String(unidadeMedidaId));
      formData.append('preco', String(data.preco));
      formData.append('taxIva', String(data.taxIva));
      formData.append('finalPrice', String(data.finalPrice));
      formData.append('status', data.status === true ? '1' : '0'); // Sempre string correta

      if (produtoParaEditar && produtoParaEditar.id) {
        formData.append('id', produtoParaEditar.id);
        if (data.imagem && data.imagem.length > 0) {
          formData.append('imagem', data.imagem[0].originFileObj);
        }
        // Logar todos os campos do FormData antes de enviar
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }
        await api.put('produto/edit', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produto editado com sucesso!', { autoClose: 2000 });
      } else {
        if (!data.imagem || data.imagem.length === 0) {
          throw new Error('A imagem é obrigatória para cadastro de exame.');
        }
        formData.append('imagem', data.imagem[0].originFileObj);
        // Logar todos os campos do FormData antes de enviar
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? value.name : value);
        }
        await api.post('produto/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produto cadastrado com sucesso!', { autoClose: 2000 });
      }
      reset();
      if (onClose) onClose();
      if (onSuccess) onSuccess();
      setErrosNoFront([]);
      setPreview(null);
    } catch (error) {
      let errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Erro ao cadastrar/editar produto';
      if (typeof errorMessage === 'object') {
        errorMessage = errorMessage.message || JSON.stringify(errorMessage);
      }
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
                  <img src={preview} alt="Pré-visualização" className="imagem-preview" />
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
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Selecione um Grupo"
                        className="form-select"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        value={field.value || undefined}
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
                    )}
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
                  render={({ field }) => <Input {...field} placeholder="Descrição do Produto" className="form-input" />}
                />
              </Form.Item>
            </div>
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
                  render={({ field }) => <Input {...field} placeholder="Preço" className="form-input" type="number" step="0.01" />}
                />
              </Form.Item>
              <Form.Item
                label="Taxa de IVA (%)"
                validateStatus={errors.taxIva ? 'error' : ''}
                help={errors.taxIva?.message}
                className="form-item"
              >
                <Controller
                  name="taxIva"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Taxa de IVA" className="form-input" type="number" step="0.01" />}
                />
              </Form.Item>
              <Form.Item
                label="Preço Final"
                validateStatus={errors.finalPrice ? 'error' : ''}
                help={errors.finalPrice?.message}
                className="form-item"
              >
                <Controller
                  name="finalPrice"
                  control={control}
                  render={({ field }) => <Input {...field} readOnly value={finalPrice} className="form-input" />}
                />
              </Form.Item>
            </div>
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
    </div>
  );
};

export default NovoProduto;