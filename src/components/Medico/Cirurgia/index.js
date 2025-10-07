import React, { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import NovaAgenda from '../../Agenda/NovaAgenda';
import ListarAgenda from '../../Agenda/ListarAgenda';

const Cirurgia = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2>Cirurgia</h2>
      <NovaAgenda isModalVisible={showModal} setIsModalVisible={setShowModal} tipoAgendamento="cirurgia" />
      <div style={{ marginTop: 24 }}>
        <ListarAgenda
          tipoAgendamento="cirurgia"
          renderExtraButtons={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)} style={{ marginRight: 8 }}>
              Nova Cirurgia
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default Cirurgia; 