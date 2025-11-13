import React from 'react';
import { Modal } from 'antd';
import PessoaFormFull from '../../shared/PessoaFormFull';

const NovaPessoaModal = ({ open, onCancel, user, onSuccess }) => {
  const empresaId = user?.filialSelecionada?.id;
  return (
    <Modal title="Nova Pessoa" open={open} onCancel={onCancel} footer={null} destroyOnHidden>
      <PessoaFormFull
        empresaId={empresaId}
        onSuccess={(pessoa) => {
          if (onSuccess) onSuccess(pessoa);
          if (onCancel) onCancel();
        }}
      />
    </Modal>
  );
};

export default NovaPessoaModal;
