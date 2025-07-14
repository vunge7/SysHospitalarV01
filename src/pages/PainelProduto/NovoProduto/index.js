import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal, Form, Select, Input, Button, Checkbox, Spin, Alert, Space, Upload, notification } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

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

const NovoProduto = () => {
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

  const onSubmit = async (data) => {
    setCarregar(true);
    try {
      const productTypeId = tiposMap[data.productType];
      const productGroupId = gruposMap[data.productGroup];
      const unidadeSelecionada = unidades.find(u => u.descricao === data.unidadeMedida);
      const unidadeMedidaId = unidadeSelecionada?.id;

      if (!data.productType || !data.productGroup || !data.unidadeMedida || !productTypeId || !productGroupId || !unidadeMedidaId) {
        throw new Error('Campos obrigatórios não preenchidos corretamente.');
      }

      const formData = new FormData();
      formData.append('productType', data.productType);
      formData.append('productTypeId', productTypeId);
      formData.append('productCode', data.productCode);
      formData.append('productGroup', data.productGroup);
      formData.append('productGroupId', productGroupId);
      formData.append('productDescription', data.productDescription);
      formData.append('unidadeMedida', data.unidadeMedida);
      formData.append('unidadeMedidaId', unidadeMedidaId);
      formData.append('preco', data.preco.toString());
      formData.append('taxIva', data.taxIva.toString());
      formData.append('finalPrice', data.finalPrice.toString());
      formData.append('status', data.status ? '1' : '0');
      if (data.imagem && data.imagem.length > 0) {
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

      reset();
      setModalIsOpen(false);
      setErrosNoFront([]);
      setPreview(null);
    } catch (error) {
      console.error('Erro ao processar o formulário:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao cadastrar produto';
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
        notification.error({
          message: 'Erro',
          description: 'Apenas imagens JPEG ou PNG são permitidas!',
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
    <div className="product-container">
      <h2>Novo Produto</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalIsOpen(true)}
        className="form-button form-button-primary"
      >
        Novo Produto
      </Button>
      <Modal
        title="Cadastro de Produto"
        open={modalIsOpen}
        onCancel={closeModal}
        footer={null}
        className="product-form-modal"
        width={900}
      >
        <Spin spinning={carregar}>
          {errosNoFront.length > 0 && (
            <Alert
              message="Erros"
              description={errosNoFront.map((e, i) => (
                <div key={i} className="error-message">{e}</div>
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
                  Cadastrar Produto
                </Button>
                <Button onClick={() => reset()} disabled={carregar} className="form-button">
                  Limpar
                </Button>
                <Button onClick={closeModal} disabled={carregar} className="form-button">
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