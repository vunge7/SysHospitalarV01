import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  ShoppingCartOutlined, 
  InboxOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';

const StatsCard = ({ 
  totalLotes, 
  totalProdutos, 
  lotesVencendo, 
  operacoesHoje, 
  valorEstoque,
  isLoading = false 
}) => {
  const stats = [
    {
      title: 'Total de Lotes',
      value: totalLotes || 0,
      icon: <InboxOutlined />,
      color: '#1890ff',
      suffix: 'lotes'
    },
    {
      title: 'Total de Produtos',
      value: totalProdutos || 0,
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
      suffix: 'produtos'
    },
    {
      title: 'Lotes Vencendo',
      value: lotesVencendo || 0,
      icon: <ExclamationCircleOutlined />,
      color: '#faad14',
      suffix: 'lotes'
    },
    {
      title: 'Operações Hoje',
      value: operacoesHoje || 0,
      icon: <ClockCircleOutlined />,
      color: '#722ed1',
      suffix: 'op.'
    },
    {
      title: 'Valor do Estoque',
      value: valorEstoque || 0,
      icon: <DollarOutlined />,
      color: '#13c2c2',
      suffix: 'AOA',
      precision: 2
    }
  ];

  return (
    <div className="stats-container" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={index}>
            <Card 
              className="stats-card"
              loading={isLoading}
              style={{ 
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                border: `1px solid ${stat.color}30`,
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '20px 16px' }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ 
                    color: '#8c8c8c', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    marginBottom: '8px'
                  }}>
                    {stat.title}
                  </div>
                  <Statistic
                    value={stat.value}
                    suffix={stat.suffix}
                    precision={stat.precision}
                    valueStyle={{ 
                      color: stat.color, 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}
                  />
                </div>
                <div style={{
                  fontSize: '32px',
                  color: stat.color,
                  opacity: 0.8
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StatsCard; 