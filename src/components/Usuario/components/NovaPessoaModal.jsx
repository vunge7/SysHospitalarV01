import React from 'react';
import { Modal } from 'antd';
import Ficha from '../../RecursosHumanos/Ficha';

const NovaPessoaModal = ({ open, onCancel, user, onSuccess }) => {
  return (
    <Modal
      title="Nova Pessoa"
      open={open}
      onCancel={onCancel}
      footer={null}
      width="90vw"
      centered
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: 0 }}
      destroyOnClose
    >
      <Ficha />
    </Modal>
  );
};

export default NovaPessoaModal;
