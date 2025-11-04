import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildMenu } from '../../config/menus';

const { SubMenu } = Menu;

const AppMenu = ({ mode = 'inline', theme = 'light', userRole = 'user' }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Carrega os itens do menu com base no papel do usuário
  useEffect(() => {
    const items = buildMenu(userRole);
    setMenuItems(items);
  }, [userRole]);

  // Atualiza as chaves abertas e selecionadas quando o local muda
  useEffect(() => {
    const path = location.pathname;
    const keys = [];
    const open = [];

    // Função recursiva para encontrar o item do menu ativo
    const findActiveItem = (items, parentKey = '') => {
      for (const item of items) {
        const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
        
        if (item.path && path.startsWith(item.path)) {
          keys.push(fullKey);
          if (parentKey) {
            open.push(parentKey);
          }
          return true;
        }
        
        if (item.children) {
          if (findActiveItem(item.children, fullKey)) {
            if (parentKey) {
              open.push(parentKey);
            }
            return true;
          }
        }
      }
      return false;
    };

    findActiveItem(menuItems);
    setSelectedKeys(keys);
    setOpenKeys(open);
  }, [location.pathname, menuItems]);

  // Manipulador de clique no menu
  const handleClick = ({ key, keyPath, domEvent }) => {
    // Evita a navegação para itens que não têm caminho
    if (key === 'sair') {
      // Lógica de logout aqui
      navigate('/login');
      return;
    }

    // Encontra o item do menu clicado
    const findItemByKey = (items, targetKey) => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findItemByKey(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItemByKey(menuItems, key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  // Manipulador para abrir/fechar submenus
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  // Função para renderizar os itens do menu recursivamente
  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <SubMenu
            key={item.key}
            icon={item.icon}
            title={item.label}
            className={item.danger ? 'menu-item-danger' : ''}
          >
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      }

      if (item.type === 'divider') {
        return <Menu.Divider key={`divider-${Math.random()}`} />;
      }

      return (
        <Menu.Item 
          key={item.key} 
          icon={item.icon}
          danger={item.danger}
          className={item.danger ? 'menu-item-danger' : ''}
        >
          {item.label}
        </Menu.Item>
      );
    });
  };

  return (
    <Menu
      mode={mode}
      theme={theme}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleClick}
      style={{ border: 'none' }}
    >
      {renderMenuItems(menuItems)}
    </Menu>
  );
};

export default AppMenu;
