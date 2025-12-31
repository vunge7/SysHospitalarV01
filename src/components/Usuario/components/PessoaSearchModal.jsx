import React from 'react';
import { Modal, Button, Table } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const PessoaSearchModal = ({ open, onCancel, columns, dataSource, onClickAddNovaPessoa }) => {
  return (
    <Modal
      title="Pesquisar Pessoa"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
      ]}
      className="search-modal"
    >
      <div className="add-person-icon-container">
        <UserAddOutlined onClick={onClickAddNovaPessoa} className="add-person-icon" title="Cadastrar Nova Pessoa" />
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default PessoaSearchModal;
