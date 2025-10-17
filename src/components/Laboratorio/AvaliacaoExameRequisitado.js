import React, { useState, useEffect } from 'react';
import { remove as removeDiacritics } from 'diacritics';
import { Table, Button, Modal, Form, Input, Card, Typography, InputNumber, Space, Popconfirm, Tag } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, UndoOutlined, PlusCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { api } from '../../service/api';

const { Title, Text } = Typography;

// Função auxiliar para validar e ajustar o valor de referência
const validateAndAdjustValue = (value, intervaloReferencia) => {
  if (!intervaloReferencia || !/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(intervaloReferencia)) {
    return { adjustedValue: Number(value), error: null };
  }
  const [min, max] = intervaloReferencia.split('-').map(Number);
  if (isNaN(value) || value === null || value === undefined) {
    return { adjustedValue: null, error: 'Valor de referência deve ser numérico' };
  }
  if (value < min) {
    return { adjustedValue: min, error: `O valor deve estar entre ${min} e ${max}. Ajustado para ${min}.` };
  }
  if (value > max) {
    return { adjustedValue: max, error: `O valor deve estar entre ${min} e ${max}. Ajustado para ${max}.` };
  }
  return { adjustedValue: Number(value), error: null };
};

function AvaliacaoExameRequisitado({
  examesRequisitados,
  setExamesRequisitados,
  fetchAllData,
}) {
  const [form] = Form.useForm();
  const [reopenForm] = Form.useForm();
  const [selectedExame, setSelectedExame] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReopenModalVisible, setIsReopenModalVisible] = useState(false);
  const [exameToReopen, setExameToReopen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState(null);
  const [linhasRequisicao, setLinhasRequisicao] = useState([]);
  const [linhasResultado, setLinhasResultado] = useState([]);
  const [cachedLinhasResultado, setCachedLinhasResultado] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtosHierarquia, setProdutosHierarquia] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [inscricoes, setInscricoes] = useState([]);
  const [requisicoesStatus, setRequisicoesStatus] = useState({});

  const normalizeName = (name) => {
    if (!name) return '';
    return removeDiacritics(name)
      .toLowerCase()
      .replace(/^(dr\.?|dra\.?)/i, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findPacienteByName = (nome) => {
    const normNome = normalizeName(nome);
    let paciente = pacientes.find((p) => normalizeName(p.nome || p.name || '') === normNome);
    if (paciente) return paciente;
    paciente = pacientes.find((p) => normalizeName(p.nome || p.name || '').includes(normNome));
    if (paciente) return paciente;
    const firstWord = normNome.split(' ')[0];
    paciente = pacientes.find((p) => normalizeName(p.nome || p.name || '').includes(firstWord));
    return paciente || null;
  };

  const findMedicoByName = (nome) => {
    const normNome = normalizeName(nome);
    let medico = medicos.find((m) => normalizeName(m.nome || m.designacao || m.name || '') === normNome);
    if (medico) return medico;
    medico = medicos.find((m) => normalizeName(m.nome || m.designacao || m.name || '').includes(normNome));
    if (medico) return medico;
    const firstWord = normNome.split(' ')[0];
    medico = medicos.find((m) => normalizeName(m.nome || m.designacao || m.name || '').includes(firstWord));
    return medico || null;
  };

  const buildProdutoHierarchy = (produtos) => {
    const produtoMap = new Map();
    produtos.forEach((produto) => {
      produto.filhos = [];
      produtoMap.set(produto.id, produto);
    });

    const hierarquia = [];
    produtos.forEach((produto) => {
      if (produto.produtoPaiId) {
        const pai = produtoMap.get(produto.produtoPaiId);
        if (pai) {
          pai.filhos.push(produto);
        }
      } else {
        hierarquia.push(produto);
      }
    });

    return hierarquia;
  };

  const isLeafNode = (produtoId) => {
    return !produtos.some((p) => p.produtoPaiId === produtoId);
  };

  const getBaseId = (id) => {
    if (id == null || id === '') {
      console.warn('getBaseId received invalid id:', id);
      return id;
    }
    const idStr = String(id);
    return idStr.includes('-') ? idStr.split('-')[0] : idStr;
  };

  useEffect(() => {
    setLinhasRequisicao([]);
    setSelectedRequisicao(null);
    setCachedLinhasResultado([]);
    fetchData();
  }, [examesRequisitados]);

  const fetchData = async () => {
    try {
      const [produtoRes, pacienteRes, usuarioRes, medicoRes, unidadeRes, inscricaoRes] = await Promise.all([
        api.get('produto/all'),
        api.get('paciente/all'),
        api.get('usuario/all'),
        api.get('medicos/all'),
        api.get('unidade/all'),
        api.get('inscricao/all'),
      ]);
      const produtos = produtoRes.data || [];
      setProdutos(produtos);
      setProdutosHierarquia(buildProdutoHierarchy(produtos));
      setPacientes(pacienteRes.data || []);
      setUsuarios(usuarioRes.data || []);
      setMedicos(medicoRes.data || []);
      setUnidades(unidadeRes.data || []);
      setInscricoes(inscricaoRes.data || []);

      if (!pacienteRes.data || pacienteRes.data.length === 0) {
        toast.error('Nenhum paciente encontrado.', { autoClose: 2000 });
      }
      if (!medicoRes.data || medicoRes.data.length === 0) {
        toast.error('Nenhum médico encontrado.', { autoClose: 2000 });
      }

      const statusMap = {};
      await Promise.all(
        examesRequisitados.map(async (req) => {
          try {
            const response = await api.get(`/linharequisicaoexame/all/requisicao/${req.id}`);
            const linhas = response.data.map((item) => ({
              id: String(item.id),
              produtoId: item.produtoId || item.produto_id,
              exame: item.exame || item.designacao || 'N/A',
              estado: item.estado || 'nao_efetuado',
              hora: item.hora,
              requisicaoExameId: item.requisicaoExameId || item.requisicao_exame_id || null,
              status: item.status !== undefined ? item.status : true,
              finalizado: item.finalizado !== undefined ? item.finalizado : false,
            }));
            statusMap[req.id] = linhas.some((linha) => !linha.finalizado);
          } catch (error) {
            console.error(`Erro ao buscar linhas para requisição ${req.id}:`, error);
            statusMap[req.id] = false;
          }
        })
      );
      setRequisicoesStatus(statusMap);
    } catch (error) {
      toast.error('Erro ao buscar dados auxiliares: ' + (error.response?.data?.message || error.message), {
        autoClose: 2000,
      });
    }
  };

  const fetchLinhasRequisicao = async (requisicaoExameId) => {
    try {
      const response = await api.get(`/linharequisicaoexame/all/requisicao/${requisicaoExameId}`);
      const mappedData = response.data.flatMap((item) => {
        console.log('Dados brutos da linha:', item); // Log para inspecionar dados recebidos
        const produto = produtos.find((p) => p.id === (item.produtoId || item.produto_id));
        if (!produto) {
          return [{
            id: String(item.id),
            produtoId: item.produtoId || item.produto_id,
            exame: item.exame || item.designacao || 'N/A',
            estado: item.estado || 'nao_efetuado',
            hora: item.hora,
            requisicaoExameId: item.requisicaoExameId || item.requisicao_exame_id || null,
            status: item.status !== undefined ? item.status : true,
            finalizado: item.finalizado !== undefined ? item.finalizado : false,
            isComposto: false,
            level: 0,
            intervaloReferencia: '',
          }];
        }

        const isComposto = produtos.some((p) => p.produtoPaiId === produto.id);
        const buildHierarchy = (prod, parentId = null, level = 0) => {
          const linhaBase = {
            id: parentId ? `${String(item.id)}-${prod.id}` : String(item.id),
            produtoId: prod.id,
            exame: prod.productDescription || item.exame || 'N/A',
            estado: item.estado || 'nao_efetuado',
            hora: item.hora,
            requisicaoExameId: item.requisicaoExameId || item.requisicao_exame_id || null,
            status: item.status !== undefined ? item.status : true,
            finalizado: item.finalizado !== undefined ? item.finalizado : false,
            isComposto: produtos.some((p) => p.produtoPaiId === prod.id),
            parentId: parentId,
            level: level,
            intervaloReferencia: prod.intervaloReferencia || '',
          };

          const filhos = produtos
            .filter((p) => p.produtoPaiId === prod.id)
            .map((filho) => buildHierarchy(filho, item.id, level + 1));

          return [linhaBase, ...filhos.flat()];
        };

        return buildHierarchy(produto);
      });
      console.log('Linhas de requisição mapeadas:', mappedData); // Log para inspecionar dados mapeados
      setLinhasRequisicao(mappedData);
    } catch (error) {
      toast.error('Erro ao buscar linhas de requisição: ' + (error.response?.data?.message || error.message), {
        autoClose: 2000,
      });
      setLinhasRequisicao([]);
    }
  };

  const fetchLinhasResultado = async () => {
    try {
      const res = await api.get('linharesultado/all');
      console.log('Linhas resultado carregadas:', res.data);
      setLinhasResultado(res.data.map((item) => ({
        ...item,
        exameId: String(item.exameId),
        produtoId: item.produtoId ? String(item.produtoId) : null,
      })) || []);
    } catch (error) {
      console.error('Erro ao buscar linhas de resultado:', error);
      toast.error('Erro ao buscar linhas de resultado: ' + (error.response?.data?.message || error.message), {
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    if (selectedRequisicao) {
      fetchLinhasRequisicao(selectedRequisicao.id);
      fetchLinhasResultado();
    }
  }, [selectedRequisicao]);

  const handleRowClick = (record) => {
    setSelectedRequisicao(record);
    setLinhasRequisicao([]);
    setCachedLinhasResultado([]);
    fetchLinhasRequisicao(record.id);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedExame(null);
  };

  const showResultModal = (exame) => {
    if (!exame) {
      toast.error('Dados do exame inválidos!', { autoClose: 2000 });
      return;
    }
    setSelectedExame(exame);
    const linhaResultado =
      cachedLinhasResultado.find((lr) => lr.exameId === getBaseId(exame.id) && lr.produtoId === exame.produtoId) ||
      linhasResultado.find((lr) => lr.exameId === getBaseId(exame.id) && lr.produtoId === exame.produtoId);
    form.setFieldsValue({
      valorReferencia: linhaResultado?.valorReferencia ?? null,
      observacao: linhaResultado?.observacao || '',
    });
    setIsModalVisible(true);
  };

  const showReopenModal = (exame) => {
    if (!exame) {
      toast.error('Dados do exame inválidos!', { autoClose: 2000 });
      return;
    }
    setExameToReopen(exame);
    const linhaResultado =
      cachedLinhasResultado.find((lr) => lr.exameId === getBaseId(exame.id) && lr.produtoId === exame.produtoId) ||
      linhasResultado.find((lr) => lr.exameId === getBaseId(exame.id) && lr.produtoId === exame.produtoId);

    console.log('Exame selecionado para reabrir:', exame);
    console.log('Linha resultado encontrada:', linhaResultado);

    reopenForm.setFieldsValue({
      exame: exame.exame || exame.productDescription || 'N/A',
      hora: moment().format('DD/MM/YYYY HH:mm:ss'),
      valorReferencia: linhaResultado?.valorReferencia ?? null,
      observacao: linhaResultado?.observacao || '',
    });
    console.log('Valores aplicados ao reopenForm:', reopenForm.getFieldsValue());
    setIsReopenModalVisible(true);
  };

  const handleConfirmReopen = async (values) => {
    if (!exameToReopen) {
      toast.error('Nenhum exame selecionado!', { autoClose: 2000 });
      return;
    }
    try {
      setLoading(true);
      const estadoRequisicao = 'efetuado'; // Ajustado para corresponder ao enum
      const horaString = moment().format('YYYY-MM-DDTHH:mm:ss'); // Formato correto

      // Validar e ajustar valorReferencia
      const { adjustedValue, error } = validateAndAdjustValue(values.valorReferencia, exameToReopen.intervaloReferencia);
      if (error) {
        toast.info(error, { autoClose: 3000 });
      }
      if (adjustedValue === null || isNaN(adjustedValue)) {
        toast.error('Valor de referência inválido!', { autoClose: 2000 });
        return;
      }

      const updatedExame = {
        id: getBaseId(exameToReopen.id),
        produtoId: exameToReopen.produtoId ?? null,
        exame: exameToReopen.exame || 'N/A',
        estado: estadoRequisicao,
        hora: horaString,
        requisicaoExameId: exameToReopen.requisicaoExameId ?? selectedRequisicao.id ?? null,
        status: exameToReopen.status !== undefined ? exameToReopen.status : true,
        finalizado: false,
      };

      if (!updatedExame.id) {
        throw new Error('ID do exame é obrigatório');
      }
      if (!updatedExame.produtoId) {
        throw new Error('Produto ID é obrigatório');
      }
      if (!updatedExame.requisicaoExameId) {
        throw new Error('Requisição Exame ID é obrigatório');
      }
      if (!updatedExame.exame || updatedExame.exame.trim() === '') {
        throw new Error('Exame é obrigatório e não pode ser vazio');
      }

      console.log('Enviando payload para /linharequisicaoexame/edit:', JSON.stringify(updatedExame, null, 2));

      const response = await api.put('/linharequisicaoexame/edit', updatedExame);
      console.log('Resposta da atualização:', response.data);

      const linhaResultado = linhasResultado.find(
        (lr) => lr.exameId === getBaseId(exameToReopen.id) && lr.produtoId === exameToReopen.produtoId
      );
      if (linhaResultado) {
        console.log('Excluindo linha resultado:', linhaResultado);
        await api.delete(`/linharesultado/${linhaResultado.id}`);
      }

      if (isLeafNode(exameToReopen.produtoId) && adjustedValue !== null && !isNaN(adjustedValue)) {
        const unidadeId = getUnidadeId(exameToReopen);
        if (!unidadeId) {
          throw new Error('Unidade ID não encontrada');
        }
        const linhaResultadoCache = {
          exameId: getBaseId(exameToReopen.id),
          valorReferencia: adjustedValue,
          unidadeId: unidadeId,
          observacao: values.observacao || '',
          requisicaoExameId: exameToReopen.requisicaoExameId ?? selectedRequisicao.id,
          parentId: exameToReopen.parentId || null,
          produtoId: exameToReopen.produtoId,
        };
        console.log('Adicionando ao cache:', linhaResultadoCache);
        setCachedLinhasResultado((prev) => [
          ...prev.filter((lr) => lr.exameId !== getBaseId(exameToReopen.id) || lr.produtoId !== exameToReopen.produtoId),
          linhaResultadoCache,
        ]);
      } else {
        console.log('Removendo do cache:', getBaseId(exameToReopen.id));
        setCachedLinhasResultado((prev) => prev.filter((lr) => lr.exameId !== getBaseId(exameToReopen.id) || lr.produtoId !== exameToReopen.produtoId));
      }

      setLinhasRequisicao((prev) =>
        prev.map((linha) =>
          linha.id === exameToReopen.id
            ? {
                ...linha,
                exame: exameToReopen.exame,
                estado: estadoRequisicao,
                hora: horaString,
                finalizado: false,
              }
            : linha
        )
      );

      toast.success('Exame reaberto e editado com sucesso!', { autoClose: 2000 });
      fetchAllData();
      fetchLinhasRequisicao(selectedRequisicao.id);
      fetchLinhasResultado();
      setRequisicoesStatus((prev) => ({ ...prev, [selectedRequisicao.id]: true }));

      setIsReopenModalVisible(false);
      setExameToReopen(null);
      reopenForm.resetFields();
    } catch (error) {
      console.error('Erro em handleConfirmReopen:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error(`Erro ao reabrir exame: ${errorMessage}`, { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const getPacienteId = (requisicao) => {
    if (requisicao.pacienteId) {
      return requisicao.pacienteId;
    }
    const pacienteNome = requisicao.paciente || requisicao.pacienteNome;
    if (!pacienteNome) {
      toast.error('Nome do paciente está vazio na requisição.', { autoClose: 2000 });
      return null;
    }
    const paciente = findPacienteByName(pacienteNome);
    if (!paciente) {
      toast.error(`Paciente "${pacienteNome}" não encontrado.`, { autoClose: 2000 });
      return null;
    }
    return paciente.id;
  };

  const getUsuarioId = (requisicao) => {
    if (requisicao.usuarioId) {
      return requisicao.usuarioId;
    }
    const medicoNome = requisicao.medico || requisicao.medicoNome;
    if (!medicoNome) {
      toast.error('Nome do médico está vazio na requisição.', { autoClose: 2000 });
      return null;
    }
    const medico = findMedicoByName(medicoNome);
    if (!medico) {
      toast.error(`Médico "${medicoNome}" não encontrado.`, { autoClose: 2000 });
      return null;
    }
    const usuarioId = medico.funcionarioId || medico.usuarioId || medico.id;
    const usuario = usuarios.find((u) => u.id === usuarioId);
    if (!usuario) {
      toast.error(`Usuário com ID ${usuarioId} não encontrado.`, { autoClose: 2000 });
      return null;
    }
    return usuarioId;
  };

  const getUnidadeId = (linha) => {
    if (!linha.produtoId) {
      toast.error('Produto ID não encontrado para o exame.', { autoClose: 2000 });
      return null;
    }
    const produto = produtos.find((p) => p.id === linha.produtoId);
    if (!produto) {
      toast.error(`Produto com ID ${linha.produtoId} não encontrado.`, { autoClose: 2000 });
      return null;
    }
    const unidadeId = produto.unidadeMedidaId || produto.unidade_medida_id || null;
    if (!unidadeId) {
      toast.error(`Unidade de medida não encontrada para o produto ID ${linha.produtoId}.`, { autoClose: 2000 });
    }
    return unidadeId;
  };

  const handleFinishResult = async (values) => {
    if (!selectedExame || !selectedRequisicao) {
      toast.error('Exame ou requisição não selecionados!', { autoClose: 2000 });
      return;
    }
    if (!values.valorReferencia && values.valorReferencia !== 0) {
      toast.error('Valor de referência é obrigatório!', { autoClose: 2000 });
      return;
    }
    // Validar e ajustar valorReferencia
    const { adjustedValue, error } = validateAndAdjustValue(values.valorReferencia, selectedExame.intervaloReferencia);
    if (error) {
      toast.info(error, { autoClose: 3000 });
    }
    if (adjustedValue === null || isNaN(adjustedValue)) {
      toast.error('Valor de referência inválido!', { autoClose: 2000 });
      return;
    }
    const unidadeId = getUnidadeId(selectedExame);
    if (!unidadeId) {
      return;
    }
    const linhaResultadoCache = {
      exameId: getBaseId(selectedExame.id),
      valorReferencia: adjustedValue,
      unidadeId: unidadeId,
      observacao: values.observacao || '',
      requisicaoExameId: selectedRequisicao.id,
      parentId: selectedExame.parentId || null,
      produtoId: selectedExame.produtoId,
    };
    setCachedLinhasResultado((prev) => [
      ...prev.filter((lr) => lr.exameId !== getBaseId(selectedExame.id) || lr.produtoId !== selectedExame.produtoId),
      linhaResultadoCache,
    ]);
    toast.success('Resultado adicionado ao cache! Clique em "Finalizar" para salvar no sistema.', {
      autoClose: 2500,
    });
    handleCancel();
  };

  const handleFinalizarExame = async () => {
    if (!selectedRequisicao) {
      toast.error('Nenhuma requisição selecionada!', { autoClose: 2000 });
      return;
    }
    setLoading(true);
    try {
      const pacienteId = getPacienteId(selectedRequisicao);
      const usuarioId = getUsuarioId(selectedRequisicao);
      if (!pacienteId || !usuarioId) {
        toast.error(`Paciente ID (${pacienteId}) ou usuário ID (${usuarioId}) não encontrado.`, {
          autoClose: 2000,
        });
        return;
      }
      const linhasParaSalvar = cachedLinhasResultado.filter((lr) => lr.requisicaoExameId === selectedRequisicao.id);
      if (linhasParaSalvar.length === 0) {
        toast.error('Nenhum resultado no cache para salvar!', { autoClose: 2000 });
        return;
      }
      const resultadoPayload = {
        requisicaoExameId: selectedRequisicao.id,
        pacienteId: pacienteId,
        usuarioId: usuarioId,
        dataResultado: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      const resultadoResponse = await api.post('/resultado/add', resultadoPayload);
      const resultadoId = resultadoResponse.data.id;
      const linhasResultadoPayload = linhasParaSalvar.map((linha) => ({
        exameId: linha.exameId,
        valorReferencia: linha.valorReferencia,
        unidadeId: linha.unidadeId,
        observacao: linha.observacao,
        resultadoId: resultadoId,
        parentId: linha.parentId || null,
        produtoId: linha.produtoId,
      }));
      console.log('Enviando linhasResultadoPayload:', JSON.stringify(linhasResultadoPayload, null, 2));
      await Promise.all(linhasResultadoPayload.map((payload) => api.post('/linharesultado/add', payload)));

      const updateLinhaRequisicaoPromises = linhasRequisicao
        .filter((linha) => isLeafNode(linha.produtoId) && cachedLinhasResultado.some((lr) => lr.exameId === getBaseId(linha.id) && lr.produtoId === linha.produtoId))
        .map((linha) => {
          // Validações adicionais
          if (!linha.id) {
            console.error('ID da linha está indefinido:', linha);
            toast.error(`O exame ${linha.exame || 'desconhecido'} não possui um ID válido.`);
            return Promise.reject(new Error('ID da linha inválido'));
          }
          if (!linha.exame || linha.exame.trim() === '') {
            console.error('Campo exame está vazio ou inválido:', linha);
            toast.error(`O exame ${linha.id} não possui um nome válido.`);
            return Promise.reject(new Error('Campo exame inválido'));
          }
          if (!linha.produtoId) {
            console.error('Campo produtoId está vazio ou inválido:', linha);
            toast.error(`O exame ${linha.id} não possui um produtoId válido.`);
            return Promise.reject(new Error('Campo produtoId inválido'));
          }
          if (!linha.requisicaoExameId) {
            console.error('Campo requisicaoExameId está vazio ou inválido:', linha);
            toast.error(`O exame ${linha.id} não possui um requisicaoExameId válido.`);
            return Promise.reject(new Error('Campo requisicaoExameId inválido'));
          }
          const updatedLinha = {
            id: parseInt(getBaseId(linha.id), 10), // Garante que o ID seja um número
            produtoId: parseInt(linha.produtoId, 10), // Garante que seja um número
            exame: linha.exame,
            estado: 'efetuado', // Ajustado para corresponder ao enum
            hora: moment().format('YYYY-MM-DDTHH:mm:ss'), // Formato correto sem milissegundos
            requisicaoExameId: parseInt(linha.requisicaoExameId, 10), // Garante que seja um número
            empresaId: linha.empresaId ? parseInt(linha.empresaId, 10) : null,
            status: linha.status !== undefined ? linha.status : true,
            finalizado: true,
          };
          console.log(`Payload enviado para /linharequisicaoexame/edit (linha ID ${linha.id}):`, JSON.stringify(updatedLinha, null, 2));
          return api.put('/linharequisicaoexame/edit', updatedLinha).catch((error) => {
            console.error(`Erro ao atualizar linha ${linha.id}:`, error.response?.data || error.message);
            throw new Error(`Erro ao atualizar linha ${linha.id}: ${error.response?.data?.message || error.message}`);
          });
        });
      console.log('Executando atualizações de linhas de requisição:', updateLinhaRequisicaoPromises.length, 'promessas');
      await Promise.all(updateLinhaRequisicaoPromises);
      toast.success('Exame finalizado e resultados salvos com sucesso!', { autoClose: 2000 });
      setExamesRequisitados((prev) => prev.filter((r) => r.id !== selectedRequisicao.id));
      setSelectedRequisicao(null);
      setLinhasRequisicao([]);
      setLinhasResultado([]);
      setCachedLinhasResultado([]);
      setRequisicoesStatus((prev) => ({ ...prev, [selectedRequisicao.id]: false }));
      fetchAllData();
    } catch (error) {
      console.error('Erro em handleFinalizarExame:', error.message, error.stack);
      toast.error(`Erro ao finalizar exame: ${error.message}`, {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExame = async (id) => {
    try {
      await api.delete(`/linharequisicaoexame/${getBaseId(id)}`);
      setCachedLinhasResultado((prev) => prev.filter((lr) => lr.exameId !== getBaseId(id)));
      toast.success('Exame excluído com sucesso!', { autoClose: 2000 });
      fetchLinhasRequisicao(selectedRequisicao.id);
      fetchAllData();
    } catch (error) {
      toast.error('Erro ao excluir exame: ' + (error.response?.data?.message || error.message), {
        autoClose: 2000,
      });
    }
  };

  const isLinhaInserida = (linha) => {
    if (!isLeafNode(linha.produtoId)) return true;
    return (
      cachedLinhasResultado.some((lr) => lr.exameId === getBaseId(linha.id) && lr.produtoId === linha.produtoId) ||
      linhasResultado.some((lr) => lr.exameId === getBaseId(linha.id) && lr.produtoId === linha.produtoId)
    );
  };

  const getPacienteNome = (record) => {
    const pacienteNome = record.paciente || record.pacienteNome;
    if (!pacienteNome) {
      return 'Paciente Desconhecido';
    }
    return pacienteNome;
  };

  const parseDate = (dateValue, fieldName, record) => {
    if (!dateValue) {
      return moment().format('DD/MM/YYYY HH:mm');
    }
    const parsedDate = moment(dateValue, [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY/MM/DD HH:mm:ss',
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY-MM-DDTHH:mm:ss.SSS',
      'DD/MM/YYYY HH:mm:ss',
      'DD-MM-YYYY HH:mm:ss',
      moment.ISO_8601,
      moment.HTML5_FMT.DATETIME_LOCAL_MS,
      'DD/MM/YYYY HH:mm',
      'YYYY-MM-DD',
    ], true);
    if (parsedDate.isValid()) {
      return parsedDate.format('DD/MM/YYYY HH:mm');
    }
    return moment().format('DD/MM/YYYY HH:mm');
  };

  function getUsuarioNome(record) {
    const medicoNome = record.medico || record.medicoNome;
    if (!medicoNome) {
      return 'Médico Desconhecido';
    }
    return medicoNome;
  }

  const requisicoesColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_, record) => (
        <span style={{ fontWeight: 500, color: '#0052cc' }}>{getPacienteNome(record)}</span>
      ),
    },
    {
      title: 'Médico',
      key: 'medico',
      render: (_, record) => getUsuarioNome(record),
    },
    {
      title: 'Data da Requisição',
      dataIndex: 'data',
      key: 'dataRequisicao',
      render: (data, record) => parseDate(data, 'Data da Requisição', record),
    },
  ];

  const examesColumns = [
    {
      title: 'Exame',
      dataIndex: 'exame',
      key: 'exame',
      width: 300,
      render: (text, record) => (
        <span style={{ paddingLeft: record.level * 20, fontWeight: record.isComposto ? 600 : 400 }}>
          {record.isComposto ? <strong>{text || 'N/A'}</strong> : text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (text) => (
        <span style={{ textTransform: 'capitalize', color: text === 'efetuado' ? '#28a745' : '#fa8c16' }}>
          {text || 'Não Efetuado'}
        </span>
      ),
    },
    {
      title: 'Hora',
      dataIndex: 'hora',
      key: 'hora',
      width: 150,
      render: (hora, record) => parseDate(hora, 'Hora', record),
    },
    {
      title: 'Unidade',
      key: 'unidade',
      width: 150,
      render: (_, record) => {
        const unidadeId = getUnidadeId(record);
        const unidade = unidades.find((u) => u.id === unidadeId);
        return unidade ? `${unidade.descricao} (${unidade.abrevicao})` : unidadeId || 'Sem unidade';
      },
    },
    {
      title: 'Intervalo de Referência',
      key: 'intervaloReferencia',
      width: 150,
      render: (_, record) => (
        <span>{record.intervaloReferencia || 'N/A'}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <span
          style={{
            color: isLinhaInserida(record) ? '#28a745' : '#fa8c16',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: isLinhaInserida(record) ? '#e6ffed' : '#fff7e6',
            display: 'inline-block',
          }}
        >
          {isLinhaInserida(record) ? 'Inserido' : 'Pendente'}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {isLeafNode(record.produtoId) && (
            <Button
              type={isLinhaInserida(record) ? 'default' : 'primary'}
              icon={<PlusCircleOutlined />}
              disabled={isLinhaInserida(record)}
              onClick={() => showResultModal(record)}
              style={{
                backgroundColor: isLinhaInserida(record) ? '#f0f5ff' : '#007bff',
                borderColor: isLinhaInserida(record) ? '#d9e1f2' : '#007bff',
                color: isLinhaInserida(record) ? '#4b5e77' : '#fff',
                borderRadius: '8px',
                padding: '4px 12px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!isLinhaInserida(record)) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLinhaInserida(record)) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLinhaInserida(record) ? 'Inserido' : 'Inserir Resultado'}
            </Button>
          )}
          <Popconfirm
            title="Excluir exame?"
            onConfirm={() => handleDeleteExame(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{
                borderRadius: '8px',
                borderColor: '#ff4d4f',
                color: '#ff4d4f',
                padding: '4px 12px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff1f0';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              danger
            />
          </Popconfirm>
          {isLeafNode(record.produtoId) && isLinhaInserida(record) && (
            <Button
              icon={<UndoOutlined />}
              onClick={() => showReopenModal(record)}
              style={{
                borderRadius: '8px',
                borderColor: '#0052cc',
                color: '#0052cc',
                padding: '4px 12px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e6f0fa';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 204, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Reabrir
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const allLinhasInseridas =
    linhasRequisicao.length > 0 &&
    linhasRequisicao
      .filter((linha) => isLeafNode(linha.produtoId))
      .every((linha) => isLinhaInserida(linha));

  const nonFinalizedRequisicoes = examesRequisitados.filter((req) => requisicoesStatus[req.id]);

  return (
    <div
      style={{
        padding: '32px',
        background: 'linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <Title
        level={2}
        style={{
          color: '#0052cc',
          fontWeight: 700,
          margin: '0 auto 24px',
          textAlign: 'center',
          fontSize: '28px',
          textShadow: '0 2px 4px rgba(0, 82, 204, 0.1)',
        }}
      >
        Avaliação de Exames Requisitados
      </Title>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleOutlined style={{ color: '#007bff', fontSize: '20px' }} />
            <span>Requisições de Exames</span>
          </div>
        }
        style={{
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0, 82, 204, 0.15)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          border: '1px solid #e6f0fa',
        }}
        headStyle={{
          background: 'linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%)',
          borderRadius: '12px 12px 0 0',
          fontWeight: 600,
          color: '#0052cc',
          padding: '16px 24px',
          fontSize: '18px',
          borderBottom: '2px solid #007bff',
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {nonFinalizedRequisicoes.length === 0 ? (
          <Text
            style={{
              color: '#4b5e77',
              fontSize: '16px',
              display: 'block',
              textAlign: 'center',
              padding: '24px',
              backgroundColor: '#f9fbff',
              borderRadius: '8px',
            }}
          >
            Nenhuma requisição não finalizada disponível.
          </Text>
        ) : (
          <Table
            columns={requisicoesColumns}
            dataSource={nonFinalizedRequisicoes}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: {
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                backgroundColor: selectedRequisicao?.id === record.id ? '#e6f0fa' : '#fff',
              },
            })}
            rowSelection={{
              type: 'radio',
              onChange: (_, selectedRows) => handleRowClick(selectedRows[0]),
            }}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
      {selectedRequisicao ? (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MedicineBoxOutlined style={{ color: '#007bff', fontSize: '20px' }} />
              <span>{`Detalhes do Exame - Requisição ${selectedRequisicao.id}`}</span>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 82, 204, 0.15)',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            border: '2px double #e6f0fa',
            borderTop: '4px solid #007bff',
          }}
          headStyle={{
            background: 'linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%)',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            color: '#0052cc',
            padding: '16px 24px',
            fontSize: '18px',
            borderBottom: '2px solid #007bff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          extra={
            <div
              style={{
                textAlign: 'right',
                fontSize: '14px',
                color: '#4b5e77',
                lineHeight: '1.5',
              }}
            >
              <div><strong>Paciente:</strong> {getPacienteNome(selectedRequisicao)}</div>
              <div><strong>Médico:</strong> {getUsuarioNome(selectedRequisicao)}</div>
              <div><strong>Data/Hora:</strong> {parseDate(selectedRequisicao.data, 'Data da Requisição', selectedRequisicao)}</div>
            </div>
          }
          styles={{ body: { padding: '24px', backgroundColor: '#f9fbff' } }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e6f0fa',
              boxShadow: '0 4px 12px rgba(0, 82, 204, 0.1)',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <Table
              columns={examesColumns}
              dataSource={linhasRequisicao}
              rowKey="id"
              pagination={false}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#fff',
              }}
              rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
              scroll={{ x: 'max-content' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              style={{
                backgroundColor: allLinhasInseridas ? '#007bff' : '#d9e1f2',
                borderColor: allLinhasInseridas ? '#007bff' : '#d9e1f2',
                color: allLinhasInseridas ? '#fff' : '#4b5e77',
                borderRadius: '8px',
                padding: '8px 24px',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onClick={handleFinalizarExame}
              disabled={!allLinhasInseridas}
              loading={loading}
              onMouseEnter={(e) => {
                if (allLinhasInseridas) {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (allLinhasInseridas) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              Finalizar
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0, 82, 204, 0.15)',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            border: '1px solid #e6f0fa',
            textAlign: 'center',
          }}
          styles={{ body: { padding: '24px', backgroundColor: '#f9fbff' } }}
        >
          <Text
            style={{
              color: '#4b5e77',
              fontSize: '16px',
              display: 'block',
              padding: '24px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 82, 204, 0.1)',
            }}
          >
            Selecione uma requisição para ver os exames.
          </Text>
        </Card>
      )}

      <Modal
        title="Registrar Resultado do Exame"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        style={{ borderRadius: '12px', overflow: 'hidden' }}
        styles={{
          body: {
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '0 0 12px 12px',
          },
          header: {
            background: 'linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%)',
            color: '#0052cc',
            fontWeight: 600,
            fontSize: '18px',
            padding: '16px 24px',
            borderRadius: '12px 12px 0 0',
            borderBottom: '2px solid #007bff',
          },
        }}
      >
        {selectedExame && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinishResult}
            style={{ padding: '8px 0' }}
          >
            <Form.Item label="Intervalo de Referência">
              <Tag color="blue">{selectedExame.intervaloReferencia || 'N/A'}</Tag>
            </Form.Item>
            <Form.Item
              name="valorReferencia"
              label="Valor de Referência"
              rules={[
                { required: true, message: 'Insira o valor de referência' },
                {
                  validator: (_, value) => {
                    const { error } = validateAndAdjustValue(value, selectedExame.intervaloReferencia);
                    if (error) {
                      return Promise.reject(error);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
                step={0.01}
              />
            </Form.Item>
            <Form.Item name="observacao" label="Observação">
              <Input.TextArea
                rows={4}
                placeholder="Observações sobre o exame"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Popconfirm
                title="Adicionar resultado ao cache?"
                onConfirm={() => form.submit()}
                okText="Sim"
                cancelText="Não"
              >
                <Button
                  type="primary"
                  loading={loading}
                  style={{
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0056b3';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#007bff';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Adicionar Resultado
                </Button>
              </Popconfirm>
              <Button
                onClick={handleCancel}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  color: '#4b5e77',
                  padding: '8px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f0fa';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 204, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Reabrir e Editar Exame"
        open={isReopenModalVisible}
        onCancel={() => {
          setIsReopenModalVisible(false);
          setExameToReopen(null);
          reopenForm.resetFields();
        }}
        footer={null}
        style={{ borderRadius: '12px', overflow: 'hidden' }}
        styles={{
          body: {
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '0 0 12px 12px',
          },
          header: {
            background: 'linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%)',
            color: '#0052cc',
            fontWeight: 600,
            fontSize: '18px',
            padding: '16px 24px',
            borderRadius: '12px 12px 0 0',
            borderBottom: '2px solid #007bff',
          },
        }}
      >
        {exameToReopen && (
          <Form
            form={reopenForm}
            layout="vertical"
            onFinish={handleConfirmReopen}
            style={{ padding: '8px 0' }}
          >
            <Form.Item
              name="exame"
              label="Nome do Exame"
              rules={[{ required: true, message: 'Insira o nome do exame' }]}
            >
              <Input
                disabled
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f0f5ff',
                  color: '#4b5e77',
                }}
              />
            </Form.Item>
            <Form.Item
              name="hora"
              label="Data e Hora"
              rules={[{ required: true, message: 'Data e hora são obrigatórias' }]}
            >
              <Input
                disabled
                value={moment().format('DD/MM/YYYY HH:mm:ss')}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f0f5ff',
                  color: '#4b5e77',
                }}
              />
            </Form.Item>
            <Form.Item label="Intervalo de Referência">
              <Tag color="blue">{exameToReopen.intervaloReferencia || 'N/A'}</Tag>
            </Form.Item>
            <Form.Item
              name="valorReferencia"
              label="Valor de Referência"
              rules={[
                { required: true, message: 'Insira o valor de referência' },
                {
                  validator: (_, value) => {
                    const { error } = validateAndAdjustValue(value, exameToReopen.intervaloReferencia);
                    if (error) {
                      return Promise.reject(error);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
                step={0.01}
              />
            </Form.Item>
            <Form.Item name="observacao" label="Observação">
              <Input.TextArea
                rows={4}
                placeholder="Observações sobre o exame"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Salvar Alterações
              </Button>
              <Button
                onClick={() => {
                  setIsReopenModalVisible(false);
                  setExameToReopen(null);
                  reopenForm.resetFields();
                }}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  color: '#4b5e77',
                  padding: '8px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f0fa';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 204, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
      <style jsx global>{`
        .table-row-light {
          background-color: #ffffff;
        }
        .table-row-dark {
          background-color: #f9fbff;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%) !important;
          color: #0052cc !important;
          fontWeight: 600 !important;
          fontSize: 14px !important;
          padding: 12px 16px !important;
          borderBottom: 2px solid #007bff !important;
        }
        .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          fontSize: 14px !important;
          color: #4b5e77 !important;
          borderBottom: 1px solid #e6f0fa !important;
          transition: background-color 0.3s ease !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f0fa !important;
        }
        .ant-table-container {
          borderRadius: 12px !important;
          overflow: hidden !important;
        }
        .ant-table {
          background-color: #ffffff !important;
        }
        .ant-table-selection-column {
          background: #e6f0fa !important;
        }
        @media (max-width: 768px) {
          .ant-table-tbody > tr > td {
            padding: 8px !important;
            fontSize: 12px !important;
          }
          .ant-table-thead > tr > th {
            fontSize: 12px !important;
            padding: 8px !important;
          }
          .ant-btn {
            padding: 4px 12px !important;
            fontSize: 12px !important;
          }
          .ant-card-extra {
            fontSize: 12px !important;
            lineHeight: 1.4 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AvaliacaoExameRequisitado;