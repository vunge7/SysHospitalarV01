import React from 'react';
import { Card, List, Tag, Progress, Button, Space, Tooltip } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment-timezone';

const ExpiringLotesCard = ({ 
  expiringLotes = [], 
  onViewLote, 
  isLoading = false,
  maxItems = 5 
}) => {
  const getSeverityColor = (daysRemaining) => {
    if (daysRemaining <= 7) return '#ff4d4f';
    if (daysRemaining <= 30) return '#faad14';
    if (daysRemaining <= 90) return '#1890ff';
    return '#52c41a';
  };

  const getSeverityIcon = (daysRemaining) => {
    if (daysRemaining <= 7) return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (daysRemaining <= 30) return <WarningOutlined style={{ color: '#faad14' }} />;
    return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
  };

  const getProgressColor = (daysRemaining) => {
    if (daysRemaining <= 7) return '#ff4d4f';
    if (daysRemaining <= 30) return '#faad14';
    if (daysRemaining <= 90) return '#1890ff';
    return '#52c41a';
  };

  const getProgressPercent = (daysRemaining) => {
    // Calcula percentual baseado em 365 dias (1 ano)
    const maxDays = 365;
    const remaining = Math.max(0, Math.min(daysRemaining, maxDays));
    return Math.round((remaining / maxDays) * 100);
  };

  const formatDate = (date) => {
    return moment(date).tz('Africa/Luanda').format('DD/MM/YYYY');
  };

  const getTimeText = (daysRemaining) => {
    if (daysRemaining === 0) return 'Vence hoje';
    if (daysRemaining === 1) return 'Vence amanhã';
    if (daysRemaining < 7) return `Vence em ${daysRemaining} dias`;
    if (daysRemaining < 30) return `Vence em ${Math.floor(daysRemaining / 7)} semanas`;
    if (daysRemaining < 365) return `Vence em ${Math.floor(daysRemaining / 30)} meses`;
    return `Vence em ${Math.floor(daysRemaining / 365)} anos`;
  };

  const sortedLotes = [...expiringLotes]
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, maxItems);

  const totalExpiring = expiringLotes.length;
  const criticalLotes = expiringLotes.filter(lote => lote.diasRestantes <= 7).length;
  const warningLotes = expiringLotes.filter(lote => lote.diasRestantes > 7 && lote.diasRestantes <= 30).length;

  return (
    <Card
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Lotes Próximos do Vencimento</span>
          {totalExpiring > 0 && (
            <Tag color={criticalLotes > 0 ? 'red' : warningLotes > 0 ? 'orange' : 'blue'}>
              {totalExpiring} lotes
            </Tag>
          )}
        </Space>
      }
      className="expiring-lotes-card"
      style={{
        background: 'linear-gradient(135deg, #fff7e6 0%, #fff2e8 100%)',
        border: '1px solid #ffd591',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
      loading={isLoading}
      extra={
        totalExpiring > 0 && (
          <Space>
            {criticalLotes > 0 && (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                {criticalLotes} críticos
              </Tag>
            )}
            {warningLotes > 0 && (
              <Tag color="orange" icon={<WarningOutlined />}>
                {warningLotes} alertas
              </Tag>
            )}
          </Space>
        )
      }
    >
      {totalExpiring === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#8c8c8c'
        }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            Nenhum lote próximo do vencimento
          </div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Todos os lotes estão dentro do prazo de validade
          </div>
        </div>
      ) : (
        <List
          dataSource={sortedLotes}
          renderItem={(lote) => (
            <List.Item
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              actions={[
                <Tooltip title="Ver detalhes do lote">
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => onViewLote && onViewLote(lote)}
                    size="small"
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={getSeverityIcon(lote.diasRestantes)}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{lote.designacao}</span>
                    <Tag color={getSeverityColor(lote.diasRestantes)}>
                      {getTimeText(lote.diasRestantes)}
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Vencimento:</strong> {formatDate(lote.dataVencimento)}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Dias restantes:</strong> {lote.diasRestantes} dias
                    </div>
                    <Progress
                      percent={getProgressPercent(lote.diasRestantes)}
                      strokeColor={getProgressColor(lote.diasRestantes)}
                      size="small"
                      showInfo={false}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                }
              />
            </List.Item>
          )}
          pagination={false}
        />
      )}
      
      {totalExpiring > maxItems && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px',
          padding: '12px',
          background: '#fafafa',
          borderRadius: '6px'
        }}>
          <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
            Mostrando {maxItems} de {totalExpiring} lotes próximos do vencimento
          </span>
        </div>
      )}
    </Card>
  );
};

export default ExpiringLotesCard; 