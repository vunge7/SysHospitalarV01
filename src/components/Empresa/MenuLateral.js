import React from 'react';
import { Menu } from 'antd';
import { ApartmentOutlined, BranchesOutlined, HomeOutlined } from '@ant-design/icons';

const MenuLateral = ({ view, onChangeView }) => {
  return (
    <Menu
      mode="inline"
      selectedKeys={[view]}
      items={[
        { key: 'home', label: 'Início', icon: <HomeOutlined /> },
        { key: 'empresas', label: 'Empresas (Mãe)', icon: <ApartmentOutlined /> },
        { key: 'filiais', label: 'Filiais', icon: <BranchesOutlined /> },
        { key: 'arvore', label: 'Árvore Empresa → Filiais', icon: <ApartmentOutlined /> },
      ]}
      onClick={(e) => {
        if (e.key === 'home') return onChangeView('empresas');
        onChangeView(e.key);
      }}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default MenuLateral;
