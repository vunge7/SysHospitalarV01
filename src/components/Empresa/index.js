import React, { useEffect, useState } from 'react';
import { Layout, Card, Table, Button, Space, Spin, Alert, Modal, Form, Input, Select, Switch, message, Popconfirm, Grid, Tabs } from 'antd';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import { fetchAllFiliais, fetchAllEmpresas, fetchEmpresaArvore, createEmpresa, updateEmpresa, deleteEmpresa, deleteEmpresaCascade } from '../../service/api';
import MenuLateral from './MenuLateral';

const { Content, Sider } = Layout;

const Empresas = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // < md
  const [view, setView] = useState('empresas'); // 'empresas' | 'filiais'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [empresasOptions, setEmpresasOptions] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [toggling, setToggling] = useState({}); // { [id]: true }
  const [statusFilter, setStatusFilter] = useState('todas'); // 'todas' | 'ativas' | 'inativas'

  const getErrMsg = (e, fallback) => {
    const data = e?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (e?.message) return e.message;
    return fallback || 'Ocorreu um erro.';
  };

  const getStatusDeep = (obj) => {
    const direct = getStatus(obj);
    if (typeof direct === 'boolean') return direct;
    const candidates = [obj?.empresa, obj?.filial, obj?.matriz, obj?.empresaMatriz];
    for (const c of candidates) {
      const val = getStatus(c || {});
      if (typeof val === 'boolean') return val;
    }
    return undefined;
  };

  const getStatus = (obj) => {
    const keys = [
      'status', 'ativo', 'isActive', 'enabled',
      'statusFilial', 'statusEmpresa', 'ativoFilial', 'ativoEmpresa',
      'situacao', 'situacaoAtiva'
    ];
    for (const k of keys) {
      if (obj?.hasOwnProperty(k)) {
        const b = toBool(obj[k]);
        if (typeof b === 'boolean') return b;
      }
    }
    return false;
  };

  const toBool = (v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', '1', 'ativo', 'active', 'yes', 'y', 't', 'sim', 'on', 'v'].includes(s)) return true;
      if (['false', '0', 'inativo', 'inactive', 'no', 'n', 'f', 'nao', 'não', 'off', 'f'].includes(s)) return false;
      return undefined;
    }
    return undefined;
  };

  useEffect(() => {
    setLoading(true);
    const mapFlat = (data, typeLabel) => (data || []).map(item => ({
      key: String(item.id),
      id: item.id,
      nome: item.nome || item.descricao || `${typeLabel} ${item.id}`,
      tipo: item.tipo ? String(item.tipo).toUpperCase() : undefined,
      email: item.email || item.emailContato,
      telefone: item.telefone || item.telemovel,
      nif: item.nif,
      endereco: item.endereco || item.morada,
      status: (() => { const s = getStatusDeep(item); return typeof s === 'boolean' ? s : true; })(),
      seguradoraId: item.seguradora_id ?? item.seguradoraId,
      empresaMatrizId: item.empresa_matriz_id ?? item.empresaMatrizId,
    }));

    const mapTree = (nodes) => (Array.isArray(nodes) ? nodes : []).map(node => ({
      key: String(node.id),
      id: node.id,
      nome: node.nome || node.descricao || `Empresa ${node.id}`,
      tipo: node.tipo ? String(node.tipo).toUpperCase() : undefined,
      email: node.email || node.emailContato,
      telefone: node.telefone || node.telemovel,
      nif: node.nif,
      endereco: node.endereco || node.morada,
      status: (() => { const s = getStatusDeep(node); return typeof s === 'boolean' ? s : true; })(),
      seguradoraId: node.seguradora_id ?? node.seguradoraId,
      empresaMatrizId: node.empresa_matriz_id ?? node.empresaMatrizId,
      children: mapFlat(node.filiais || node.children || []),
    }));

    const load = async () => {
      try {
        if (view === 'empresas') {
          const res = await fetchAllEmpresas();
          const all = Array.isArray(res.data) ? res.data : [];
          const somenteMatriz = all.filter(it => {
            if (typeof it.tipo === 'string') return it.tipo.toUpperCase() === 'MATRIZ';
            const matrizId = it.empresa_matriz_id ?? it.empresaMatrizId;
            return matrizId === null || matrizId === undefined;
          });
          const mapped = mapFlat(somenteMatriz, 'Empresa');
          setRows(mapped);
        } else if (view === 'filiais') {
          const [filiaisRes, empresasRes] = await Promise.all([fetchAllFiliais(), fetchAllEmpresas()]);
          const empresasMap = new Map((empresasRes.data || []).map(e => [String(e.id), e.nome || e.descricao || `Empresa ${e.id}`]));
          let mapped = mapFlat(filiaisRes.data, 'Filial').map(f => ({
            ...f,
            empresaMatrizNome: f.empresaMatrizId ? empresasMap.get(String(f.empresaMatrizId)) : undefined,
          }));
          mapped = mapped.sort((a, b) => {
            const ma = (a.empresaMatrizNome || '').localeCompare(b.empresaMatrizNome || '');
            if (ma !== 0) return ma;
            return (a.nome || '').localeCompare(b.nome || '');
          });
          setRows(mapped);
        } else {
          const res = await fetchEmpresaArvore();
          const mapped = mapTree(res.data);
          setRows(mapped);
        }
        setError(null);
      } catch (err) {
        setError(getErrMsg(err, `Falha ao carregar ${view}`));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [view, reload]);

  const handleToggleStatus = async (record, checked) => {
    const id = record.id;
    const isEmpresas = view === 'empresas';
    setToggling(prev => ({ ...prev, [id]: true }));
    const prevStatus = record.status;
    // Otimista somente quando o DTO não traz status (filiais/árvore)
    if (!isEmpresas) {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: checked } : r)));
    }
    try {
      const payload = {
        nome: record.nome,
        email: record.email,
        telefone: record.telefone,
        nif: record.nif,
        endereco: record.endereco,
        status: checked,
        seguradoraId: record.seguradoraId,
        tipo: record.tipo || (record.empresaMatrizId ? 'FILIAL' : 'MATRIZ'),
        empresaMatrizId: record.empresaMatrizId,
      };
      await updateEmpresa(id, payload);
      message.success('Status atualizado');
      if (isEmpresas) setReload(r => r + 1);
    } catch (e) {
      if (!isEmpresas) {
        // Reverte otimista
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status: prevStatus } : r)));
      }
      message.error(getErrMsg(e, 'Falha ao atualizar status'));
    } finally {
      setToggling(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Nome', dataIndex: 'nome', key: 'nome', ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Telefone', dataIndex: 'telefone', key: 'telefone', width: 140 },
    { title: 'NIF', dataIndex: 'nif', key: 'nif', width: 160 },
    { title: 'Endereço', dataIndex: 'endereco', key: 'endereco', ellipsis: true },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 100 },
    ...(view === 'filiais' ? [
      { title: 'Empresa Matriz', dataIndex: 'empresaMatrizNome', key: 'empresaMatrizNome' },
      { title: 'Empresa Matriz ID', dataIndex: 'empresaMatrizId', key: 'empresaMatrizId', width: 140 },
    ] : []),
    ...(view === 'empresas'
      ? [{
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 120,
          render: (_, record) => (
            <Switch checked={!!record.status} loading={!!toggling[record.id]} onChange={(checked) => handleToggleStatus(record, checked)} />
          ),
        }]
      : []),
    {
      title: 'Ações',
      key: 'acoes',
      width: 260,
      render: (_, record) => (
        <Space wrap size={isMobile ? 'small' : 'middle'}>
          <Button type="primary" size={isMobile ? 'small' : 'middle'} onClick={async () => {
            if (view === 'filiais') {
              try {
                const res = await fetchAllEmpresas();
                setEmpresasOptions((res.data || []).map(e => ({ label: e.nome || e.descricao || `Empresa ${e.id}`, value: e.id })));
              } catch {}
            }
            setEditingRecord(record);
            setEditModalOpen(true);
            setTimeout(() => {
              editForm.setFieldsValue({
                nome: record.nome,
                email: record.email,
                telefone: record.telefone,
                nif: record.nif,
                endereco: record.endereco,
                seguradoraId: record.seguradoraId,
                empresaMatrizId: record.empresaMatrizId,
                status: !!record.status,
              });
            });
          }}>Editar</Button>
          <Popconfirm title="Excluir esta entidade?" okText="Excluir" cancelText="Cancelar" onConfirm={async () => {
            try {
              await deleteEmpresa(record.id);
              message.success('Excluído com sucesso');
              setReload(r => r + 1);
            } catch (e) {
              message.error(getErrMsg(e, 'Falha ao excluir'));
            }
          }}>
            <Button danger size={isMobile ? 'small' : 'middle'}>Excluir</Button>
          </Popconfirm>
          <Popconfirm title="Excluir em CASCATA (empresa + filiais)?" okText="Excluir em cascata" cancelText="Cancelar" onConfirm={async () => {
            try {
              await deleteEmpresaCascade(record.id);
              message.success('Excluído em cascata com sucesso');
              setReload(r => r + 1);
            } catch (e) {
              message.error(getErrMsg(e, 'Falha ao excluir em cascata'));
            }
          }}>
            <Button danger size={isMobile ? 'small' : 'middle'}>Excluir Cascata</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Cabecario />
      <Layout>
        {!isMobile && (
          <Sider
            width={260}
            style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
          >
            <MenuLateral view={view} onChangeView={setView} />
          </Sider>
        )}
        <Content style={{ padding: isMobile ? 12 : 20, overflowX: 'hidden' }}>
          <Spin spinning={loading} tip="Carregando...">
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Space direction="vertical" style={{ width: '100%', overflowX: 'hidden' }} size={isMobile ? 'middle' : 'large'}>
              {isMobile && (
                <Tabs
                  activeKey={view}
                  onChange={(k) => setView(k)}
                  items={[
                    { key: 'empresas', label: 'Empresas' },
                    { key: 'filiais', label: 'Filiais' },
                    { key: 'arvore', label: 'Árvore' },
                  ]}
                />
              )}
              <Card
                title={view === 'empresas' ? 'Empresas (Mãe)' : view === 'filiais' ? 'Filiais' : 'Árvore Empresa → Filiais'}
                extra={
                  <Space>
                    {view === 'empresas' && (
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                          { value: 'todas', label: 'Todas' },
                          { value: 'ativas', label: 'Ativas' },
                          { value: 'inativas', label: 'Inativas' },
                        ]}
                        size={isMobile ? 'small' : 'middle'}
                        style={{ minWidth: 120 }}
                      />
                    )}
                    <Button type="primary" size={isMobile ? 'small' : 'middle'} onClick={async () => {
                  if (view === 'filiais') {
                    try {
                      const res = await fetchAllEmpresas();
                      setEmpresasOptions((res.data || []).map(e => ({ label: e.nome || e.descricao || `Empresa ${e.id}`, value: e.id })));
                    } catch {}
                  }
                  setModalOpen(true);
                }}>{view === 'empresas' ? 'Nova Empresa' : view === 'filiais' ? 'Nova Filial' : 'Nova Empresa'}</Button>
                  </Space>
                }
                styles={{ body: { overflowX: 'auto' } }}
              >
                <Table
                  columns={isMobile ? [
                    { title: 'Nome', dataIndex: 'nome', key: 'nome', ellipsis: true },
                    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 90 },
                    ...(view === 'empresas' ? [{
                      title: 'Status', key: 'status', width: 100,
                      render: (_, record) => (
                        <Switch checked={!!record.status} disabled={false} loading={!!toggling[record.id]} onChange={(checked) => handleToggleStatus(record, checked)} />
                      )
                    }] : []),
                    {
                      title: 'Ações', key: 'acoes', width: 180,
                      render: (_, record) => (
                        <Space wrap size="small">
                          <Button type="primary" size="small" onClick={async () => {
                            if (view === 'filiais') {
                              try {
                                const res = await fetchAllEmpresas();
                                setEmpresasOptions((res.data || []).map(e => ({ label: e.nome || e.descricao || `Empresa ${e.id}`, value: e.id })));
                              } catch {}
                            }
                            setEditingRecord(record);
                            setEditModalOpen(true);
                            setTimeout(() => {
                              editForm.setFieldsValue({
                                nome: record.nome,
                                email: record.email,
                                telefone: record.telefone,
                                nif: record.nif,
                                endereco: record.endereco,
                                seguradoraId: record.seguradoraId,
                                empresaMatrizId: record.empresaMatrizId,
                                status: !!record.status,
                              });
                            });
                          }}>Editar</Button>
                          <Popconfirm title="Excluir?" onConfirm={async () => { try { await deleteEmpresa(record.id); message.success('Excluído'); setReload(r=>r+1);} catch(e){ message.error(getErrMsg(e)); } }}>
                            <Button danger size="small">Excluir</Button>
                          </Popconfirm>
                        </Space>
                      )
                    }
                  ] : columns}
                  dataSource={(() => {
                    if (view !== 'empresas') return rows;
                    if (statusFilter === 'todas') return rows;
                    const want = statusFilter === 'ativas';
                    return rows.filter(r => !!r.status === want);
                  })()}
                  size={isMobile ? 'small' : 'middle'}
                  pagination={{ pageSize: 10, responsive: true }}
                  expandable={view === 'arvore' ? { defaultExpandAllRows: true } : undefined}
                  rowKey="key"
                  tableLayout="fixed"
                />
              </Card>
            </Space>
          </Spin>
        </Content>
      </Layout>
      <Rodape />

      {/* Modal de criação */}
      <Modal
        title={view === 'empresas' ? 'Nova Empresa (Matriz)' : 'Nova Filial'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = {
                nome: values.nome,
                tipo: view === 'empresas' ? 'MATRIZ' : 'FILIAL',
                email: values.email,
                telefone: values.telefone,
                nif: values.nif,
                endereco: values.endereco,
                status: values.status === undefined ? true : values.status,
                seguradoraId: values.seguradoraId,
                empresaMatrizId: view === 'filiais' ? values.empresaMatrizId : undefined,
              };
              await createEmpresa(payload);
              message.success(`${view === 'empresas' ? 'Empresa' : 'Filial'} criada com sucesso`);
              setModalOpen(false);
              form.resetFields();
              setReload(r => r + 1);
            } catch (err) {
              message.error(getErrMsg(err, 'Falha ao criar. Verifique os dados e tente novamente.'));
            }
          }}
        >
          <Form.Item label="Nome" name="nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input placeholder="Ex.: DVML COMERCIAL" />
          </Form.Item>
          {view === 'filiais' && (
            <Form.Item label="Empresa Matriz" name="empresaMatrizId" rules={[{ required: true, message: 'Selecione a empresa matriz' }]}>
              <Select options={empresasOptions} placeholder="Selecione a empresa matriz" showSearch optionFilterProp="label" />
            </Form.Item>
          )}
          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="email@empresa.com" />
          </Form.Item>
          <Form.Item label="Telefone" name="telefone">
            <Input placeholder="+2449..." />
          </Form.Item>
          <Form.Item label="NIF" name="nif">
            <Input placeholder="NIF" />
          </Form.Item>
          <Form.Item label="Endereço" name="endereco">
            <Input.TextArea rows={3} placeholder="Morada completa" />
          </Form.Item>
          <Form.Item label="Seguradora ID" name="seguradoraId">
            <Input placeholder="ID da seguradora (opcional)" />
          </Form.Item>
          <Form.Item label="Ativa" name="status" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit">Salvar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de edição */}
      <Modal
        title={view === 'empresas' ? 'Editar Empresa (Matriz)' : 'Editar Filial'}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingRecord(null); }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = {
                nome: values.nome,
                email: values.email,
                telefone: values.telefone,
                nif: values.nif,
                endereco: values.endereco,
                status: values.status === undefined ? true : values.status,
                seguradoraId: values.seguradoraId,
                // tipo é exigido pelo backend; manter valor atual ou inferir pelo contexto
                tipo: (editingRecord?.tipo && String(editingRecord.tipo).toUpperCase()) || (view === 'filiais' ? 'FILIAL' : 'MATRIZ'),
                empresaMatrizId: (view === 'filiais' || (editingRecord?.tipo && String(editingRecord.tipo).toUpperCase() === 'FILIAL'))
                  ? values.empresaMatrizId
                  : undefined,
              };
              await updateEmpresa(editingRecord.id, payload);
              message.success('Atualizado com sucesso');
              setEditModalOpen(false);
              setEditingRecord(null);
              setReload(r => r + 1);
            } catch (err) {
              message.error(getErrMsg(err, 'Falha ao atualizar'));
            }
          }}
        >
          <Form.Item label="Nome" name="nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input />
          </Form.Item>
          {view === 'filiais' && (
            <Form.Item label="Empresa Matriz" name="empresaMatrizId" rules={[{ required: true, message: 'Selecione a empresa matriz' }]}>
              <Select options={empresasOptions} placeholder="Selecione a empresa matriz" showSearch optionFilterProp="label" />
            </Form.Item>
          )}
          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Telefone" name="telefone">
            <Input />
          </Form.Item>
          <Form.Item label="NIF" name="nif">
            <Input />
          </Form.Item>
          <Form.Item label="Endereço" name="endereco">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Seguradora ID" name="seguradoraId">
            <Input />
          </Form.Item>
          <Form.Item label="Ativa" name="status" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => { setEditModalOpen(false); setEditingRecord(null); }}>Cancelar</Button>
              <Button type="primary" htmlType="submit">Salvar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </Layout>
  );
};

export default Empresas;
