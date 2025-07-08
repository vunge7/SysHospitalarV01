import React, { useState, useEffect } from 'react';
import {Table, Button, Card, Select, DatePicker, notification, Typography, Row, Col,} from 'antd';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import moment from 'moment';
import 'chart.js/auto';const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;function Relatorio({ exames, pacientes, tiposExame, artigos, medicos }) {
    const [filteredExames, setFilteredExames] = useState(exames);
    const [pacienteFilter, setPacienteFilter] = useState(null);
    const [tipoExameFilter, setTipoExameFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [dataRange, setDataRange] = useState(null);useEffect(() => {
    let result = exames;
    if (pacienteFilter) {
        result = result.filter(
            (exame) => exame.pacienteId === pacienteFilter
        );
    }
    if (tipoExameFilter) {
        result = result.filter(
            (exame) => exame.tipoExameId === tipoExameFilter
        );
    }
    if (statusFilter) {
        result = result.filter((exame) => exame.status === statusFilter);
    }
    if (dataRange) {
        result = result.filter((exame) =>
            moment(exame.dataSolicitacao).isBetween(
                dataRange[0],
                dataRange[1],
                null,
                '[]'
            )
        );
    }
    setFilteredExames(result);
}, [pacienteFilter, tipoExameFilter, statusFilter, dataRange, exames]);

const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
        title: 'Paciente',
        dataIndex: 'pacienteId',
        key: 'pacienteId',
        render: (id) => pacientes.find((p) => p.id === id)?.nome || 'N/A',
    },
    {
        title: 'Médico',
        dataIndex: 'medicoId',
        key: 'medicoId',
        render: (id) => medicos.find((m) => m.id === id)?.nome || 'N/A',
    },
    {
        title: 'Exame',
        dataIndex: 'tipoExameId',
        key: 'tipoExameId',
        render: (id) => tiposExame.find((t) => t.id === id)?.nome || 'N/A',
    },
    { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
        title: 'Data de Solicitação',
        dataIndex: 'dataSolicitacao',
        key: 'dataSolicitacao',
        render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
        title: 'Resultado',
        key: 'resultado',
        render: (_, record) =>
            record.resultado?.finalizado ? (
                <Text>
                    {record.composto
                        ? Object.entries(record.resultado.valor)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')
                        : Object.values(record.resultado.valor)[0]}
                </Text>
            ) : (
                <Text type="secondary">Pendente</Text>
            ),
    },
];

// Dados para gráficos
const statusData = {
    labels: ['Pendente', 'Concluído'],
    datasets: [
        {
            label: 'Exames por Status',
            data: [
                exames.filter((e) => e.status === 'PENDENTE').length,
                exames.filter((e) => e.status === 'CONCLUIDO').length,
            ],
            backgroundColor: ['#1890ff', '#52c41a'],
        },
    ],
};

const tipoExameData = {
    labels: tiposExame.map((t) => t.nome),
    datasets: [
        {
            label: 'Exames por Tipo',
            data: tiposExame.map(
                (t) => exames.filter((e) => e.tipoExameId === t.id).length
            ),
            backgroundColor: [
                '#1890ff',
                '#52c41a',
                '#fa8c16',
                '#fadb14',
                '#ff4d4f',
            ],
        },
    ],
};

const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Exames', 20, 20);
    let y = 30;
    filteredExames.forEach((exame, index) => {
        doc.text(
            `${index + 1}. ID: ${exame.id}, Paciente: ${
                pacientes.find((p) => p.id === exame.pacienteId)?.nome ||
                'N/A'
            }, Exame: ${tiposExame.find((t) => t.id === exame.tipoExameId)?.nome || 'N/A'}, Status: ${
                exame.status
            }`,
            20,
            y
        );
        y += 10;
        if (exame.resultado?.finalizado) {
            const resultadoText = exame.composto
                ? Object.entries(exame.resultado.valor)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                : Object.values(exame.resultado.valor)[0];
            doc.text(`   Resultado: ${resultadoText}`, 20, y);
            y += 10;
        }
    });
    doc.save('relatorio_exames.pdf');
};

const downloadCSV = () => {
    const csvData = filteredExames.map((exame) => ({
        ID: exame.id,
        Paciente:
            pacientes.find((p) => p.id === exame.pacienteId)?.nome || 'N/A',
        Médico: medicos.find((m) => m.id === exame.medicoId)?.nome || 'N/A',
        Exame:
            tiposExame.find((t) => t.id === exame.tipoExameId)?.nome ||
            'N/A',
        Designação: exame.designacao,
        Status: exame.status,
        'Data de Solicitação': moment(exame.dataSolicitacao).format(
            'DD/MM/YYYY'
        ),
        Resultado: exame.resultado?.finalizado
            ? exame.composto
                ? Object.entries(exame.resultado.valor)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                : Object.values(exame.resultado.valor)[0]
            : 'Pendente',
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_exames.csv';
    link.click();
};

return (
    <div>
        <Title level={2} className="section-title">
            Relatório de Exames
        </Title>
        <Card className="card-custom">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Filtrar por paciente"
                        style={{ width: '100%' }}
                        allowClear
                        onChange={setPacienteFilter}
                    >
                        {pacientes.map((paciente) => (
                            <Option key={paciente.id} value={paciente.id}>
                                {paciente.nome}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Filtrar por tipo de exame"
                        style={{ width: '100%' }}
                        allowClear
                        onChange={setTipoExameFilter}
                    >
                        {tiposExame.map((tipo) => (
                            <Option key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Select
                        placeholder="Filtrar por status"
                        style={{ width: '100%' }}
                        allowClear
                        onChange={setStatusFilter}
                    >
                        <Option value="PENDENTE">Pendente</Option>
                        <Option value="CONCLUIDO">Concluído</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                        onChange={(dates) => setDataRange(dates)}
                    />
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12}>
                    <Card title="Exames por Status">
                        <Bar
                            data={statusData}
                            options={{ maintainAspectRatio: false }}
                            height={200}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card title="Exames por Tipo">
                        <Bar
                            data={tipoExameData}
                            options={{ maintainAspectRatio: false }}
                            height={200}
                        />
                    </Card>
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        type="primary"
                        onClick={downloadPDF}
                        style={{ marginRight: 8 }}
                    >
                        Baixar PDF
                    </Button>
                    <Button type="primary" onClick={downloadCSV}>
                        Baixar CSV
                    </Button>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredExames}
                rowKey="id"
                className="table-custom"
                pagination={{ pageSize: 10 }}
            />
        </Card>
    </div>
);}
export default Relatorio;

