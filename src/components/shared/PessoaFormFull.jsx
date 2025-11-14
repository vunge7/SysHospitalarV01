// src/components/PessoaFormFull.jsx
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
      Modal.warning({ title: 'Atenção', content: 'Nenhuma empresa selecionada.' });
      return;
    }

    const required = ['nome', 'nif', 'dataNascimento', 'telefone', 'endereco', 'genero'];
    for (const f of required) {
      if (!values[f] || (typeof values[f] === 'string' && values[f].trim() === '')) {
        Modal.warning({ title: 'Atenção', content: 'Preencha todos os campos obrigatórios.' });
        return;
      }
    }

    try {
      const resolvedEmpresaId = empresaId ?? values.empresaId;
      if (!resolvedEmpresaId) {
        Modal.warning({ title: 'Atenção', content: 'Selecione a empresa.' });
        setSubmitting(false);
        return;
      }

      const dataStr = values.dataNascimento
        ? moment(values.dataNascimento).startOf('day').format('YYYY-MM-DD')
        : undefined;

      const basePayload = {
        nome: values.nome,
        apelido: values.apelido || undefined,
        nif: values.nif,
        dataNascimento: dataStr,
        localNascimento: values.localNascimento || undefined,
        telefone: values.telefone || undefined,
        email: values.email || undefined,
        endereco: values.endereco || undefined,
        genero: values.genero || undefined,
        bairro: values.bairro || undefined,
        estadoCivil: values.estadoCivil || undefined,
        pai: values.pai || undefined,
        mae: values.mae || undefined,
        nacionalidade: values.nacionalidade || undefined,
        raca: values.raca || undefined,
        paisEndereco: values.paisEndereco || undefined,
        provinciaEndereco: values.provinciaEndereco || undefined,
        municipioEndereco: values.municipioEndereco || undefined,
        paisNascimento: values.paisNascimento || undefined,
        provinciaNascimento: values.provinciaNascimento || undefined,
        municipioNascimento: values.municipioNascimento || undefined,
        profissao: values.profissao || undefined,
        habilitacao: values.habilitacao || undefined,
        empresaId: String(Number(resolvedEmpresaId)),
      };

      let response;
      try {
        // Sempre multipart/form-data (backend exige)
        const formData = new FormData();
        Object.entries(basePayload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) formData.append(k, v);
        });
        if (file) {
          formData.append('file', file);
          formData.append('nomePhoto', file.name);
        }

        try {
          const entries = [];
          if (typeof formData.forEach === 'function') {
            formData.forEach((v, k) => entries.push([k, v instanceof File ? v.name : v]));
          }
          console.log('Payload pessoa/add (FormData):', JSON.stringify(entries));
        } catch (_) {}

        response = await api.post('pessoa/add', formData);
      } catch (err1) {
        throw err1;
      }

      Modal.success({ title: 'Sucesso', content: 'Pessoa cadastrada com sucesso!' });
      form.resetFields();
      setFile(null);
      if (onSuccess) onSuccess(response.data);

    } catch (error) {
      console.error('Erro completo:', error?.response || error);
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
        {/* NOME E APELIDO */}
        <Col span={12}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="apelido" label="Apelido">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* NIF E DATA DE NASCIMENTO */}
        <Col span={12}>
          <Form.Item name="nif" label="NIF" rules={[{ required: true, message: 'Informe o NIF' }]}>
            <Input maxLength={50} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dataNascimento" label="Data de Nascimento" rules={[{ required: true, message: 'Informe a data' }]}>
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
        </Col>

        {/* LOCAL NASCIMENTO E TELEFONE */}
        <Col span={12}>
          <Form.Item name="localNascimento" label="Local de Nascimento">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="telefone" label="Telefone" rules={[{ required: true, message: 'Informe o telefone' }]}>
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* EMAIL E ENDEREÇO */}
        <Col span={12}>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email inválido' }]}>
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="endereco" label="Endereço" rules={[{ required: true, message: 'Informe o endereço' }]}>
            <Input maxLength={150} />
          </Form.Item>
        </Col>

        {/* BAIRRO E GÊNERO */}
        <Col span={12}>
          <Form.Item name="bairro" label="Bairro">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="genero" label="Gênero" rules={[{ required: true, message: 'Selecione o gênero' }]}>
            <Select allowClear>
              {generosOptions.map(g => <Option key={g.value} value={g.value}>{g.label}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        {/* ESTADO CIVIL E PAI */}
        <Col span={12}>
          <Form.Item name="estadoCivil" label=" palmito Estado Civil">
            <Select allowClear>
              {estadosCivisOptions.map(e => <Option key={e.value} value={e.value}>{e.label}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="pai" label="Nome do Pai">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* MÃE E NACIONALIDADE */}
        <Col span={12}>
          <Form.Item name="mae" label="Nome da Mãe">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nacionalidade" label="Nacionalidade">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* RAÇA E PAÍS ENDEREÇO */}
        <Col span={12}>
          <Form.Item name="raca" label="Raça">
            <Input max_quadrado={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="paisEndereco" label="País (Endereço)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* PROVÍNCIA E MUNICÍPIO ENDEREÇO */}
        <Col span={12}>
          <Form.Item name="provinciaEndereco" label="Província (Endereço)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="municipioEndereco" label="Município (Endereço)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* PAÍS, PROVÍNCIA E MUNICÍPIO NASCIMENTO */}
        <Col span={12}>
          <Form.Item name="paisNascimento" label="País (Nascimento)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="provinciaNascimento" label="Província (Nascimento)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="municipioNascimento" label="Município (Nascimento)">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* PROFISSÃO E HABILITAÇÃO */}
        <Col span={12}>
          <Form.Item name="profissao" label="Profissão">
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="habilitacao" label="Habilitação">
            <Input maxLength={100} />
          </Form.Item>
        </Col>

        {/* FOTO */}
        <Col span={12}>
          <Form.Item label="Foto">
            <Upload beforeUpload={() => false} onChange={handleUploadChange} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Selecionar</Button>
            </Upload>
          </Form.Item>
        </Col>

        {/* BOTÃO SALVAR */}
        <Col span={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Salvar Pessoa
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}