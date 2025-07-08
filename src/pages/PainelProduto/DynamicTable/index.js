import React, { useState } from 'react';
import { Table, Input, Button, Pagination, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const DynamicTable = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const showActions = props.showActions ?? true;

  if (!props.data || props.data.length === 0) {
    return <p>Nenhum dado disponível.</p>;
  }

  const columns = Object.keys(props.data[0] || {})
    .filter((key) => key !== 'isFuncionarioAtivo')
    .map((col) => ({
      title: (
        <Tooltip title={props.headers?.[col] || col}>
          <span>{props.headers?.[col] || col}</span>
        </Tooltip>
      ),
      dataIndex: col,
      key: col,
      render: (value) => {
        if (col === 'imagem') {
          console.log('Imagem value:', value); // Depuração
          if (value && value !== 'Sem Imagem') {
            return (
              <img
                src={value}
                alt="Produto"
                style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '4px', objectFit: 'cover' }}
                loading="lazy"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', value);
                  e.target.src = '/placeholder.jpg'; // Fallback
                }}
              />
            );
          }
          return <span>Sem Imagem</span>;
        }
        return (
          <Tooltip title={typeof value === 'object' ? JSON.stringify(value) : value}>
            <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
          </Tooltip>
        );
      },
      ellipsis: col !== 'imagem',
    }));

  if (showActions) {
    columns.push({
      title: 'Ações',
      key: 'actions',
      render: (_, row) => (
        <Space wrap>
          {props.customActions ? (
            props.customActions(row)
          ) : (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{width:70, height:25}}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onEdit?.(row);
                }}
              >
                Editar
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                style={{width:70, height:25}}
                onClick={(e) => {
                  e.stopPropagation();
                  props.onDelete?.(row);
                }}
              >
                Excluir
              </Button>
            </>
          )}
        </Space>
      ),
    });
  }

  const filteredData = props.data.filter((row) =>
    columns.some(
      (col) =>
        row[col.dataIndex] &&
        typeof row[col.dataIndex] === 'string' &&
        row[col.dataIndex].toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentData = filteredData.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <div>
      <Input
        placeholder="Pesquisar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table
        columns={columns}
        dataSource={currentData}
        rowKey="id"
        pagination={false}
        onRow={(row) => ({
          onClick: () => props.onRowClick?.(row),
          style: { cursor: 'pointer' },
        })}
        className={props.className}
      />
      <Pagination
        current={currentPage}
        pageSize={productsPerPage}
        total={filteredData.length}
        onChange={(page) => setCurrentPage(page)}
        showSizeChanger={false}
      />
    </div>
  );
};

export default DynamicTable;