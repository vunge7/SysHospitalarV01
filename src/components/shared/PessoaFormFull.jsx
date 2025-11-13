import React, { useState } from 'react';
import { Form, Input, Select, Button, Row, Col, DatePicker, Upload, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { api } from '../../service/api';

const { Option } = Select;

const generosOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'OUTRO', label: 'Outro' },
];

const estadosCivisOptions = [
  { value: 'SOLTEIRO', label: 'Solteiro' },
  { value: 'CASADO', label: 'Casado' },
  { value: 'DIVORCIADO', label: 'Divorciado' },
  { value: 'VIUVO', label: 'Viúvo' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' },
];

export default function PessoaFormFull({ empresaId, onSuccess }) {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUploadChange = ({ file: newFile }) => {
    setFile(newFile.originFileObj || null);
  };

  const handleFinish = async (values) => {
    if (!empresaId) {
      Modal.warning({ title: 'Atenção', content: 'Nenhuma empresa/filial selecionada.' });
      return;
    }

    const required = ['nome', 'nif', 'dataNascimento', 'telefone', 'endereco', 'genero'];
    for (const f of required) {
      if (!values[f] || (typeof values[f] === 'string' && values[f].trim() === '')) {
        Modal.warning({ title: 'Atenção', content: 'Preencha todos os campos obrigatórios da pessoa.' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nome', values.nome);
      if (values.apelido) formData.append('apelido', values.apelido);
      formData.append('nif', values.nif);
      if (values.dataNascimento) {
        const dataStr = moment(values.dataNascimento).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        formData.append('dataNascimento', dataStr);
      }
      if (values.localNascimento) formData.append('localNascimento', values.localNascimento);
      if (values.telefone) formData.append('telefone', values.telefone);
      if (values.email) formData.append('email', values.email);
      if (values.endereco) formData.append('endereco', values.endereco);
      if (values.genero) formData.append('genero', values.genero);
      if (values.bairro) formData.append('bairro', values.bairro);
      if (values.estadoCivil) formData.append('estadoCivil', values.estadoCivil);
      if (values.pai) formData.append('pai', values.pai);
      if (values.mae) formData.append('mae', values.mae);
      if (values.nacionalidade) formData.append('nacionalidade', values.nacionalidade);
      if (values.raca) formData.append('raca', values.raca);
      if (values.paisEndereco) formData.append('paisEndereco', values.paisEndereco);
      if (values.provinciaEndereco) formData.append('provinciaEndereco', values.provinciaEndereco);
      if (values.municipioEndereco) formData.append('municipioEndereco', values.municipioEndereco);
      if (values.paisNascimento) formData.append('paisNascimento', values.paisNascimento);
      if (values.provinciaNascimento) formData.append('provinciaNascimento', values.provinciaNascimento);
      if (values.municipioNascimento) formData.append('municipioNascimento', values.municipioNascimento);
      if (values.profissao) formData.append('profissao', values.profissao);
      if (values.habilitacao) formData.append('habilitacao', values.habilitacao);
      formData.append('empresaId', String(Number(empresaId)));
      if (file) {
        formData.append('file', file);
        formData.append('nomePhoto', file.name);
      }

      // Logar payload para confirmar formato enviado
      try {
        const entries = [];
        // Note: FormData.forEach not iterable across all envs; iterate keys if available
        if (typeof formData.forEach === 'function') {
          formData.forEach((v, k) => entries.push([k, v instanceof File ? v.name : v]));
        }
        // eslint-disable-next-line no-console
        console.log('Payload pessoa/add (FormData):', JSON.stringify(entries));
      } catch (_) {}

      const response = await api.post('pessoa/add', formData);
      Modal.success({ title: 'Sucesso', content: 'Pessoa cadastrada com sucesso!' });
      form.resetFields();
      setFile(null);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const raw = error?.response?.data?.message ?? error?.response?.data ?? 'Falha ao cadastrar pessoa.';
      const serverMsg = typeof raw === 'string' ? raw : JSON.stringify(raw);
      Modal.error({ title: 'Erro', content: serverMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="apelido" label="Apelido">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nif" label="NIF" rules={[{ required: true, message: 'Informe o NIF' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dataNascimento" label="Data de Nascimento" rules={[{ required: true, message: 'Informe a data de nascimento' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="localNascimento" label="Local de Nascimento">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="telefone" label="Telefone" rules={[{ required: true, message: 'Informe o telefone' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email inválido' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="endereco" label="Endereço" rules={[{ required: true, message: 'Informe o endereço' }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="bairro" label="Bairro">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="genero" label="Gênero" rules={[{ required: true, message: 'Selecione o gênero' }]}>
            <Select allowClear showSearch optionFilterProp="children">
              {generosOptions.map((g) => (
                <Option key={g.value} value={g.value}>{g.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="estadoCivil" label="Estado Civil">
            <Select allowClear showSearch optionFilterProp="children">
              {estadosCivisOptions.map((e) => (
                <Option key={e.value} value={e.value}>{e.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="pai" label="Nome do Pai">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="mae" label="Nome da Mãe">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nacionalidade" label="Nacionalidade">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="raca" label="Raça">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="paisEndereco" label="País (Endereço)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="provinciaEndereco" label="Província (Endereço)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="municipioEndereco" label="Município (Endereço)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="paisNascimento" label="País (Nascimento)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="provinciaNascimento" label="Província (Nascimento)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="municipioNascimento" label="Município (Nascimento)">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="profissao" label="Profissão">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="habilitacao" label="Habilitação">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Foto">
            <Upload beforeUpload={() => false} onChange={handleUploadChange} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>Salvar</Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
