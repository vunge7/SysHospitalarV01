import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './stylePainelPrincipal.css';
import Rodape from '../Rodape';
import Cabecario from '../Cabecario';
import { AuthContext } from '../../contexts/auth';
import { LockOutlined } from '@ant-design/icons';

// Importação da Biblioteca de Icons
import '@fortawesome/fontawesome-free/css/all.min.css';

function PainelPrincipal() {
    const { user } = useContext(AuthContext);
    const userType = (user?.tipo || '').toLowerCase();

    // Defina as permissões de cada bloco
    const blocks = [
        // Processos Clínicos
        {
            section: 'Processos Clínicos',
            items: [
                { key: 'admissao', label: 'Admissão', icon: 'fas fa-sign-in-alt', to: '/admissao/home', allowed: ['administrativo'] },
                { key: 'moduloA', label: 'Módulo - A', icon: 'fas fa-box', allowed: ['administrativo'] },
                { key: 'enfermaria', label: 'Enfermaria', icon: 'fas fa-bed', to: '/enf', allowed: ['enfermeiro', 'administrativo', 'medico'] },
                { key: 'so', label: 'Sala de Obersavação (SO)', icon: 'fas fa-eye', allowed: ['administrativo'] },
                { key: 'bloco', label: 'Bloco Operatório', icon: 'fas fa-procedures', allowed: ['administrativo'] },
                { key: 'consultorio', label: 'Consultório', icon: 'fas fa-user-md', to: '/medico/consulta', allowed: ['medico', 'administrativo'] },
                { key: 'agenda', label: 'Agendamento', icon: 'fas fa-calendar-alt', to: '/agenda', allowed: ['administrativo', 'enfermeiro'] },
                { key: 'notificacoes', label: 'Notificações', icon: 'fas fa-bell', allowed: ['administrativo'] },
                { key: 'laboratorio', label: 'Laboratório', icon: 'fas fa-flask', to: '/lab', allowed: ['administrativo', 'analista'] },
                { key: 'moduloX2', label: 'Módulo X 2', icon: 'fas fa-cubes', allowed: ['administrativo'] },
                { key: 'moduloX3', label: 'Módulo X 3', icon: 'fas fa-layer-group', allowed: ['administrativo'] },
                { key: 'moduloX4', label: 'Módulo X 4', icon: 'fas fa-th-large', allowed: ['administrativo'] },
            ],
        },
        // Processos Administrativos
        {
            section: 'Processos Administrativos',
            items: [
                { key: 'facturacao', label: 'Facturação', icon: 'fas fa-file-invoice-dollar', to: '/facturacao', allowed: ['administrativo'] },
                { key: 'servicos', label: 'Serviços', icon: 'fas fa-tools', to: '/artigo', allowed: ['administrativo', 'analista'] },
                { key: 'usuarios', label: 'Usuários', icon: 'fas fa-users', to: '/admin/usuario', allowed: ['administrativo'] },
                { key: 'stock', label: 'Stock', icon: 'fas fa-warehouse', to: '/stock', allowed: ['administrativo'] },
                { key: 'compras', label: 'Compras', icon: 'fas fa-shopping-cart', allowed: [] },
                { key: 'rh', label: 'Recursos Humanos', icon: 'fas fa-briefcase', to: '/rh', allowed: ['administrativo'] },
                { key: 'tesouraria', label: 'Tesouraria', icon: 'fas fa-cash-register', allowed: [] },
                { key: 'contabilidade', label: 'Contabilidade', icon: 'fas fa-calculator', allowed: [] },
                { key: 'clientes', label: 'Clientes', icon: 'fas fa-user-tie', allowed: [] },
                { key: 'seguradoras', label: 'Seguradoras', icon: 'fas fa-shield-alt', allowed: [] },
                { key: 'empresas', label: 'Empresas', icon: 'fas fa-building', allowed: [] },
                { key: 'relatorios', label: 'Relatórios', icon: 'fas fa-chart-line', allowed: [] },
            ],
        },
    ];

    return (
        <div className="painelprincipal">
            <Cabecario />
            <div className="containerpainel">
                {blocks.map((panel) => (
                    <div className="panel" key={panel.section}>
                        <h2>{panel.section}</h2>
                        <div className="grid">
                            {panel.items.map((item) => {
                                // Verificar se o tipo de usuário está na lista de permissões
                                const isAllowed = item.allowed.includes(userType);

                                return (
                                    <div
                                        className="block"
                                        key={item.key}
                                        style={{
                                            opacity: isAllowed ? 1 : 0.5,
                                            cursor: isAllowed ? 'pointer' : 'not-allowed',
                                        }}
                                    >
                                        {item.to && isAllowed ? (
                                            <Link to={item.to}>
                                                <i className={item.icon}></i>
                                                <p>{item.label}</p>
                                            </Link>
                                        ) : (
                                            <span>
                                                <i className={item.icon}></i>
                                                <p>
                                                    {item.label}{' '}
                                                    {!isAllowed && <LockOutlined style={{ marginLeft: 6 }} />}
                                                </p>
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <Rodape />
        </div>
    );
}

export default PainelPrincipal;