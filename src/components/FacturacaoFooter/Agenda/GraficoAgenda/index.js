import React, { useState, useEffect, useMemo } from 'react';
import { Scatter, Doughnut } from 'react-chartjs-2';
import { Button, Modal, message, Select, Spin, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { api } from '../../../service/api';
import './style.css';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, ArcElement, CategoryScale);

const { confirm } = Modal;
const { Option } = Select;

const AgendaChart = React.memo(() => {
  const [chartData, setChartData] = useState({});
  const [doughnutData, setDoughnutData] = useState({});
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [chartType, setChartType] = useState('scatter');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [linhasAgendaRes, pacientesRes, funcionariosRes, pessoasRes] = await Promise.all([
          api.get('/linhaagenda/all'),
          api.get('/paciente/all'),
          api.get('/funcionario/all'),
          api.get('/pessoa/all'),
        ]);

        const linhasAgenda = linhasAgendaRes.data;
        const pacientes = pacientesRes.data;
        const funcionarios = funcionariosRes.data;
        const pessoas = pessoasRes.data;

        const dadosGrafico = processarDados(linhasAgenda, pacientes, funcionarios, pessoas);
        setChartData(dadosGrafico);
        setDoughnutData(processarDadosRosca(linhasAgenda, pacientes, funcionarios, pessoas));
        setAvailableYears(dadosGrafico.anos);
        setAvailableMonths(dadosGrafico.meses);

        if (!dadosGrafico.meses.some(mes => mes.value === selectedMonth)) {
          setSelectedMonth(dadosGrafico.meses[0]?.value || 1);
        }

        setLoading(false);
      } catch (error) {
        message.error({
          content: 'Erro ao carregar dados do gráfico.',
          className: 'custom-message',
          style: { top: '20px', right: '20px' },
        });
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  const handleDeleteConsulta = (consultaId) => {
    confirm({
      title: 'Confirmar Exclusão',
      content: 'Tem certeza que deseja eliminar esta consulta?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/linhaagenda/${consultaId}`);
          message.success({
            content: 'Consulta eliminada com sucesso!',
            className: 'custom-message',
            style: { top: '20px', right: '20px' },
          });
          setSelectedConsulta(null);
          setLoading(true);
          const [linhasAgendaRes, pacientesRes, funcionariosRes, pessoasRes] = await Promise.all([
            api.get('/linhaagenda/all'),
            api.get('/paciente/all'),
            api.get('/funcionario/all'),
            api.get('/pessoa/all'),
          ]);
          const linhasAgenda = linhasAgendaRes.data;
          const pacientes = pacientesRes.data;
          const funcionarios = funcionariosRes.data;
          const pessoas = pessoasRes.data;
          const dadosGrafico = processarDados(linhasAgenda, pacientes, funcionarios, pessoas);
          setChartData(dadosGrafico);
          setDoughnutData(processarDadosRosca(linhasAgenda, pacientes, funcionarios, pessoas));
          setLoading(false);
        } catch (error) {
          let errorMessage = 'Erro ao eliminar a consulta.';
          if (error.response?.status === 404) {
            errorMessage = 'Consulta não encontrada.';
          } else if (error.response?.status === 400) {
            errorMessage = error.response.data.message || 'Requisição inválida.';
          }
          message.error({
            content: errorMessage,
            className: 'custom-message',
            style: { top: '20px', right: '20px' },
          });
        }
      },
    });
  };

  const processarDadosRosca = (linhasAgenda, pacientes, funcionarios, pessoas) => {
    const medicosMap = funcionarios.reduce((acc, f) => {
      const pessoa = pessoas.find((p) => p.id === f.pessoaId);
      acc[f.id] = pessoa ? pessoa.nome : 'Desconhecido';
      return acc;
    }, {});

    const pacientesMap = pacientes.reduce((acc, p) => {
      acc[p.id] = p.nome || 'Desconhecido';
      return acc;
    }, {});

    const linhasFiltradas = linhasAgenda.filter((linha) => {
      if (!linha.dataRealizacao) return false;
      const data = new Date(linha.dataRealizacao);
      return data.getFullYear() === selectedYear && (data.getMonth() + 1) === selectedMonth;
    });

    const consultasPorMedicoPaciente = linhasFiltradas.reduce((acc, linha) => {
      const nomeMedico = medicosMap[linha.funcionarioId] || 'Desconhecido';
      const nomePaciente = pacientesMap[linha.pacienteId] || 'Desconhecido';
      const chave = `${nomeMedico} - ${nomePaciente}`;
      if (!acc[chave]) {
        acc[chave] = {
          count: 0,
          medico: nomeMedico,
          paciente: nomePaciente,
          detalhes: [],
        };
      }
      acc[chave].count += 1;
      acc[chave].detalhes.push({
        id: linha.id,
        consultaId: linha.consultaId,
        dataRealizacao: linha.dataRealizacao,
      });
      return acc;
    }, {});

    const cores = gerarCoresDiferentes(Object.keys(consultasPorMedicoPaciente).length);

    const labels = Object.keys(consultasPorMedicoPaciente);
    const data = Object.values(consultasPorMedicoPaciente).map(item => item.count);

    const detalhesCompletos = Object.values(consultasPorMedicoPaciente).map(item => ({
      medico: item.medico,
      paciente: item.paciente,
      numeroConsultas: item.count,
      detalhes: item.detalhes,
    }));

    return {
      labels,
      datasets: [{ data, backgroundColor: cores, hoverBackgroundColor: cores.map(cor => cor.replace('0.6', '0.8')), borderWidth: 1 }],
      detalhesCompletos,
    };
  };

  const gerarCoresDiferentes = (quantidade) => {
    const cores = [];
    for (let i = 0; i < quantidade; i++) {
      const hue = (i * 137.5) % 360;
      cores.push(`hsla(${hue}, 70%, 60%, 0.6)`);
    }
    return cores;
  };

  const processarDados = (linhasAgenda, pacientes, funcionarios, pessoas) => {
    const pacientesMap = pacientes.reduce((acc, p) => {
      acc[p.id] = p.nome || 'Desconhecido';
      return acc;
    }, {});

    const medicosMap = funcionarios.reduce((acc, f) => {
      const pessoa = pessoas.find((p) => p.id === f.pessoaId);
      acc[f.id] = pessoa ? pessoa.nome : 'Desconhecido';
      return acc;
    }, {});

    const medicosUnicos = [...new Set(linhasAgenda.map((la) => medicosMap[la.funcionarioId] || 'Desconhecido'))];

    const anosUnicos = [...new Set(
      linhasAgenda.filter((linha) => linha.dataRealizacao).map((linha) => new Date(linha.dataRealizacao).getFullYear())
    )].sort((a, b) => a - b);

    const mesesUnicos = [...new Set(
      linhasAgenda.filter((linha) => linha.dataRealizacao && new Date(linha.dataRealizacao).getFullYear() === selectedYear)
        .map((linha) => new Date(linha.dataRealizacao).getMonth() + 1)
    )].sort((a, b) => a - b);

    const mesesDisponiveis = mesesUnicos.map((mes) => ({
      value: mes,
      label: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][mes - 1],
    }));

    const linhasFiltradas = linhasAgenda.filter((linha) => {
      if (!linha.dataRealizacao) return false;
      const data = new Date(linha.dataRealizacao);
      return data.getFullYear() === selectedYear && (data.getMonth() + 1) === selectedMonth;
    });

    const consultasAgrupadas = linhasFiltradas.reduce((acc, linha) => {
      const nomeMedico = medicosMap[linha.funcionarioId] || 'Desconhecido';
      const nomePaciente = pacientesMap[linha.pacienteId] || 'Desconhecido';
      const chave = `${nomeMedico}-${nomePaciente}`;
      if (!acc[chave]) {
        acc[chave] = {
          medico: nomeMedico,
          paciente: nomePaciente,
          numeroConsultas: 0,
          detalhes: [],
        };
      }
      acc[chave].numeroConsultas += 1;
      acc[chave].detalhes.push({
        id: linha.id,
        consultaId: linha.consultaId,
        dataRealizacao: linha.dataRealizacao,
      });
      return acc;
    }, {});

    const datasUnicas = [...new Set(
      Object.values(consultasAgrupadas).flatMap((item) =>
        item.detalhes.map((detalhe) => detalhe.dataRealizacao ? new Date(detalhe.dataRealizacao).toLocaleDateString() : 'N/A')
      )
    )];

    const dados = Object.values(consultasAgrupadas).map((item) => ({
      x: medicosUnicos.indexOf(item.medico),
      y: datasUnicas.indexOf(item.detalhes[0]?.dataRealizacao ? new Date(item.detalhes[0].dataRealizacao).toLocaleDateString() : 'N/A'),
      value: item.numeroConsultas,
      medico: item.medico,
      paciente: item.paciente,
      detalhes: item.detalhes,
    }));

    return {
      datasets: [{ label: 'Consultas', data: dados, backgroundColor: 'rgba(75, 192, 192, 0.6)', pointRadius: 10 }],
      medicos: medicosUnicos,
      datas: datasUnicas,
      anos: anosUnicos,
      meses: mesesDisponiveis,
    };
  };

  const memoizedChartData = useMemo(() => chartData, [chartData]);
  const memoizedDoughnutData = useMemo(() => doughnutData, [doughnutData]);

  const options = {
    scales: {
      x: {
        title: { display: true, text: 'Médicos' },
        type: 'linear',
        ticks: { stepSize: 1, callback: (value) => memoizedChartData.medicos?.[value] || '' },
      },
      y: {
        title: { display: true, text: 'Datas das Consultas' },
        type: 'linear',
        ticks: { stepSize: 1, callback: (value) => memoizedChartData.datas?.[value] || '' },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const consulta = context.raw;
            const datas = consulta.detalhes.map((detalhe) => detalhe.dataRealizacao ? new Date(detalhe.dataRealizacao).toLocaleDateString() : 'N/A').join(', ');
            return `Médico: ${consulta.medico}, Paciente: ${consulta.paciente}, Consultas: ${consulta.value}, Datas: ${datas}`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const consulta = memoizedChartData.datasets[0].data[element.index];
        setSelectedConsulta(consulta);
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20 } },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            const label = context.label.split(' - ');
            return [`Médico: ${label[0]}`, `Paciente: ${label[1]}`, `Consultas: ${value} (${percentage}%)`];
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const index = element.index;
        const detalhes = memoizedDoughnutData.detalhesCompletos[index];
        setSelectedConsulta(detalhes);
      }
    },
    cutout: '50%',
  };

  const columns = [
    {
      title: 'Médico',
      dataIndex: 'medico',
      key: 'medico',
    },
    {
      title: 'Paciente',
      dataIndex: 'paciente',
      key: 'paciente',
    },
    {
      title: 'Marcação das Consultas',
      dataIndex: 'numeroConsultas',
      key: 'numeroConsultas',
      render: (_, record) => (chartType === 'scatter' ? record.value : record.numeroConsultas),
    },
    {
      title: 'Datas',
      dataIndex: 'dataRealizacao',
      key: 'dataRealizacao',
      render: (_, record) => record.dataRealizacao ? new Date(record.dataRealizacao).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleDeleteConsulta(record.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  const dataSource = selectedConsulta
    ? selectedConsulta.detalhes.map((detalhe, index) => ({
        key: detalhe.id || index,
        id: detalhe.id,
        medico: selectedConsulta.medico,
        paciente: selectedConsulta.paciente,
        numeroConsultas: selectedConsulta.numeroConsultas || selectedConsulta.value,
        dataRealizacao: detalhe.dataRealizacao,
      }))
    : [];

  return (
    <div className="consulta-grafico-container">
      <h2 className="consulta-grafico-title">Gráfico da Agenda</h2>
      <div className="consulta-grafico-controls">
        <div className="consulta-grafico-filtros">
          <Select
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
            placeholder="Selecione o ano"
            style={{ width: 150, marginRight: 10 }}
          >
            {availableYears.map((ano) => (
              <Option key={ano} value={ano}>{ano}</Option>
            ))}
          </Select>
          <Select
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value)}
            placeholder="Selecione o mês"
            style={{ width: 150, marginRight: 10 }}
          >
            {availableMonths.map((mes) => (
              <Option key={mes.value} value={mes.value}>{mes.label}</Option>
            ))}
          </Select>
          <Select
            value={chartType}
            onChange={(value) => setChartType(value)}
            placeholder="Selecione o tipo de gráfico"
            style={{ width: 220 }}
          >
            <Option value="scatter">Dispersão (médicos/datas)</Option>
            <Option value="doughnut">Rosca (consultas por médico)</Option>
          </Select>
        </div>
      </div>
      <div className="consulta-grafico-chart-wrapper">
        {loading ? (
          <Spin tip="Carregando dados..." className="consulta-grafico-loading" />
        ) : chartType === 'scatter' && memoizedChartData.datasets ? (
          <div className="consulta-grafico-chart"><Scatter data={memoizedChartData} options={options} /></div>
        ) : chartType === 'doughnut' && memoizedDoughnutData.datasets ? (
          <div className="consulta-grafico-chart"><Doughnut data={memoizedDoughnutData} options={doughnutOptions} /></div>
        ) : (
          <div className="consulta-grafico-no-data">Nenhum dado disponível</div>
        )}
      </div>
      {selectedConsulta && (
        <div className="consulta-grafico-details">
          <h3 className="consulta-grafico-details-title">Detalhes das Consultas</h3>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="key"
            pagination={false}
            scroll={{ y: 150 }}
            className="consulta-grafico-table"
          />
        </div>
      )}
    </div>
  );
});

export default AgendaChart;