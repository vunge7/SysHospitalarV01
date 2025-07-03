import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { api } from '../../../service/api';
import './style.css';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const ConsultaGrafico = () => {
  const [chartData, setChartData] = useState({});
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // +1 pq getMonth é 0-based
  const [availableYears, setAvailableYears] = useState([]); // Novo estado para os anos disponíveis

  useEffect(() => {
    const fetchData = async () => {
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
        setAvailableYears(dadosGrafico.anos); // Atualiza os anos disponíveis
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

    // Extrair anos únicos das consultas
    const anosUnicos = [...new Set(
      linhasAgenda
        .filter((linha) => linha.dataRealizacao)
        .map((linha) => new Date(linha.dataRealizacao).getFullYear())
    )].sort((a, b) => a - b); // Ordenar os anos

    // Filtrar linhasAgenda pelo ano e mês selecionados
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
        consultaId: linha.consultaId,
        dataRealizacao: linha.dataRealizacao,
      });
      return acc;
    }, {});

    const datasUnicas = [...new Set(
      Object.values(consultasAgrupadas).flatMap((item) =>
        item.detalhes.map((detalhe) =>
          detalhe.dataRealizacao ? new Date(detalhe.dataRealizacao).toLocaleDateString() : 'N/A'
        )
      )
    )];

    const dados = Object.values(consultasAgrupadas).map((item) => ({
      x: medicosUnicos.indexOf(item.medico),
      y: datasUnicas.indexOf(
        item.detalhes[0]?.dataRealizacao
          ? new Date(item.detalhes[0].dataRealizacao).toLocaleDateString()
          : 'N/A'
      ),
      value: item.numeroConsultas,
      medico: item.medico,
      paciente: item.paciente,
      detalhes: item.detalhes,
    }));

    return {
      datasets: [
        {
          label: 'Consultas',
          data: dados,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          pointRadius: 10,
        },
      ],
      medicos: medicosUnicos,
      datas: datasUnicas,
      anos: anosUnicos, // Retornar os anos únicos
    };
  };

  // Atualizar os dados do gráfico quando o ano ou mês mudar
  useEffect(() => {
    if (!loading && chartData.datasets) {
      const fetchData = async () => {
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
        setAvailableYears(dadosGrafico.anos); // Atualiza os anos disponíveis
        setLoading(false);
      };
      fetchData();
    }
  }, [selectedYear, selectedMonth]);

  const options = {
    scales: {
      x: {
        title: { display: true, text: 'Médicos' },
        type: 'linear',
        ticks: {
          stepSize: 1,
          callback: (value) => chartData.medicos?.[value] || '',
        },
      },
      y: {
        title: { display: true, text: 'Datas das Consultas' },
        type: 'linear',
        ticks: {
          stepSize: 1,
          callback: (value) => chartData.datas?.[value] || '',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const consulta = context.raw;
            const datas = consulta.detalhes
              .map((detalhe) =>
                detalhe.dataRealizacao ? new Date(detalhe.dataRealizacao).toLocaleDateString() : 'N/A'
              )
              .join(', ');
            return `Médico: ${consulta.medico}, Paciente: ${consulta.paciente}, Consultas: ${consulta.value}, Datas: ${datas}`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const consulta = chartData.datasets[0].data[element.index];
        setSelectedConsulta(consulta);
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <div className="consulta-grafico-container">
      <h2 className="consulta-grafico-title">Gráfico da Agenda</h2>
      <div className="consulta-grafico-filtros">
        <label>
          Ano:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mês:
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p className="consulta-grafico-loading">Carregando dados...</p>
      ) : chartData.datasets ? (
        <div className="consulta-grafico-chart">
          <Scatter data={chartData} options={options} />
        </div>
      ) : (
        <p className="consulta-grafico-no-data">Nenhum dado disponível</p>
      )}

      {selectedConsulta && (
        <div className="consulta-grafico-details">
          <h3 className="consulta-grafico-details-title">Detalhes das Consultas</h3>
          <table className="consulta-grafico-table">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Paciente</th>
                <th>Marcação das Consultas</th>
                <th>Datas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedConsulta.medico}</td>
                <td>{selectedConsulta.paciente}</td>
                <td>{selectedConsulta.value}</td>
                <td>
                  {selectedConsulta.detalhes
                    .map((detalhe) => (detalhe.dataRealizacao ? new Date(detalhe.dataRealizacao).toLocaleDateString() : 'N/A'))
                    .join(', ')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultaGrafico;