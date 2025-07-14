import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { api } from '../../service/api';

const Relatorio = () => {
  const [linhas, setLinhas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    api.get('linharesultado/all').then(res => setLinhas(res.data || []));
    api.get('funcionario/all').then(res => setFuncionarios(res.data || []));
    api.get('resultado/all').then(res => setResultados(res.data || []));
    api.get('paciente/all').then(res => setPacientes(res.data || []));
  }, []);

  // Função para obter o id do médico (funcionário) a partir do usuarioId
  const getMedicoId = (usuarioId) => {
    const funcionarioMedico = funcionarios.find(f => f.usuarioId === usuarioId && f.cargo === 'Medico');
    return funcionarioMedico ? funcionarioMedico.id : usuarioId;
  };

  // Função para obter o resultadoId, aceitando tanto 'resutaldoId' quanto 'resultadoId'
  const getResultadoId = (linha) => {
    return linha.resultadoId || linha.resutaldoId || '';
  };

  // Função para obter o pacienteId a partir do resultadoId
  const getPacienteId = (linha) => {
    const resultadoId = getResultadoId(linha);
    const resultado = resultados.find(r => r.id === resultadoId);
    return resultado ? resultado.pacienteId : '';
  };

  // Função para obter o nome do paciente a partir do resultadoId
  const getPacienteNome = (linha) => {
    const pacienteId = getPacienteId(linha);
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : pacienteId || '';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Exame ID', dataIndex: 'exameId', key: 'exameId' },
    { title: 'Valor Referência', dataIndex: 'valorReferencia', key: 'valorReferencia' },
    { title: 'Unidade ID', dataIndex: 'unidadeId', key: 'unidadeId' },
    {
      title: 'Resultado ID',
      key: 'resultadoId',
      render: (linha) => getResultadoId(linha)
    },
    { title: 'Observação', dataIndex: 'observacao', key: 'observacao' },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (linha) => getPacienteNome(linha)
    },
    {
      title: 'Usuário ID',
      dataIndex: 'usuarioId',
      key: 'usuarioId',
      render: (usuarioId) => getMedicoId(usuarioId)
    },
  ];

  // Adaptar o dataSource para passar o objeto inteiro da linha para as colunas customizadas
  const dataSource = linhas.map(linha => ({ ...linha, key: linha.id }));

  return <Table dataSource={dataSource} columns={columns} rowKey="id" />;
};

export default Relatorio;

