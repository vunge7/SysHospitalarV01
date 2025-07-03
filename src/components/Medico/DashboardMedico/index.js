import React, { useState, useEffect } from 'react';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeflex/primeflex.css';
import { Card, Tag } from 'antd';

import { Chart } from 'primereact/chart';

function DashboardMedico() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const [chartDataEvolucao, setChartDataEvolucao] = useState({});
    const [chartOptionsEvolucao, setChartOptionsEvolucao] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
            labels: ['Masculino', 'Femenino'],
            datasets: [
                {
                    data: [300, 50],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                    ],
                },
            ],
        };
        const options = {
            cutout: '30%',
        };

        //##

        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary'
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');
        const dataEvolucao = {
            labels: [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
            ],
            datasets: [
                {
                    type: 'line',
                    label: 'Dataset 1',
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    data: [50, 25, 12, 70, 56, 76, 42],
                },
                {
                    type: 'bar',
                    label: 'Dataset 2',
                    backgroundColor:
                        documentStyle.getPropertyValue('--green-500'),
                    data: [21, 84, 24, 75, 37, 65, 34],
                    borderColor: 'white',
                    borderWidth: 2,
                },
            ],
        };

        const optionsEvolucao = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução das consultas realizadas',
                },
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                    },
                },
            },
        };

        setChartData(data);
        setChartOptions(options);

        setChartDataEvolucao(dataEvolucao);
        setChartOptionsEvolucao(optionsEvolucao);
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: 800,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom: 10,
                }}
            >
                <Card
                    style={{ width: 40 + '%' }}
                    title="Por Consultar"
                    bordered={false}
                >
                    <Tag color="#108ee9">21</Tag>
                </Card>
                <Card
                    style={{ width: 40 + '%', marginLeft: 5 + '%' }}
                    title="Consultas Realizadas"
                    bordered={false}
                >
                    <Tag color="green">7</Tag>
                </Card>
                <Card
                    style={{ width: 40 + '%', marginLeft: 5 + '%' }}
                    title="Marcadas"
                    bordered={false}
                >
                    <Tag color="red">7</Tag>
                </Card>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 600,
                    height: 300,
                    marginBottom: 10,
                }}
            >
                <Card>
                    <Chart
                        type="pie"
                        data={chartData}
                        options={chartOptions}
                        className="w-full md:w-15rem"
                    />
                </Card>
                <Card
                    style={{
                        marginLeft: 10,
                    }}
                >
                    <Chart
                        type="line"
                        data={chartDataEvolucao}
                        options={chartOptionsEvolucao}
                        className="w-full md:w-15rem"
                        style={{
                            height: 250,
                            width: 300,
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}

export default DashboardMedico;
