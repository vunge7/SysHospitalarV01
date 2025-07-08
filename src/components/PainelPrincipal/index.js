import React from 'react';
import { Link } from 'react-router-dom';
import './stylePainelPrincipal.css';
import Rodape from '../Rodape';
import Cabecario from '../Cabecario';

//Importação da Biblioteca de Icons
import '@fortawesome/fontawesome-free/css/all.min.css';

function PainelPrincipal() {
    return (
        <div classNam e="painelprincipal">
            <Cabecario />

            <div className="containerpainel">
                <div className="panel">
                    <h2>Processos Clínicos</h2>
                    <div className="grid">
                        <div className="block">
                            <Link to="/admissao/home">
                                <i className="fas fa-sign-in-alt"></i>
                                <p>Admissão</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-box"></i>
                            <p>Módulo - A</p>
                        </div>
                        <div className="block">
                            <Link to="/enf">
                                <i className="fas fa-bed"></i>
                                <p>Enfermaria</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-eye"></i>
                            <p>Sala de Obersavação (SO)</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-procedures"></i>
                            <p>Bloco Operatório</p>
                        </div>
                        <div className="block">
                            <Link to="/medico/consulta">
                                <i className="fas fa-user-md"></i>
                                <p>Consultório</p>
                            </Link>
                        </div>
                        <div className="block">
                            <Link to="/agenda">
                                <i className="fas fa-calendar-alt"></i>
                                <p>Agendamento</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-bell"></i>
                            <p>Notificações</p>
                        </div>
                        <div className="block">
                            <Link to="/lab">
                                <i className="fas fa-calendar-alt"></i>
                                <p>Laboratório</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-cubes"></i>
                            <p>Módulo X 2</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-layer-group"></i>
                            <p>Módulo X 3</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-th-large"></i>
                            <p>Módulo X 4</p>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <h2>Processos Administrativos</h2>
                    <div className="grid">
                        <div className="block">
                            <Link to="/facturacao">
                                <i className="fas fa-file-invoice-dollar"></i>
                                <p>Facturação</p>
                            </Link>
                        </div>

                        <div className="block">
                            <Link to="/artigo">
                                <i className="fas fa-tools"></i>
                                <p>Serviços</p>
                            </Link>
                        </div>
                        <div className="block">
                            <Link to="/admin/usuario">
                                <i className="fas fa-users"></i>
                                <p>Usuários</p>
                            </Link>
                        </div>
                        <div className="block">
                            <Link to="/stock">
                                <i className="fas fa-tools"></i>
                                <p>Stock</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-shopping-cart"></i>
                            <p>Compras</p>
                        </div>

                        <div className="block">
                            <Link to="/rh">
                                <i className="fas fa-briefcase"></i>
                                <p>Recursos Humanos</p>
                            </Link>
                        </div>
                        <div className="block">
                            <i className="fas fa-cash-register"></i>
                            <p>Tesouraria</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-calculator"></i>
                            <p>Contabilidade</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-user-tie"></i>
                            <p>Clientes</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-shield-alt"></i>
                            <p>Seguradoras</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-building"></i>
                            <p>Empresas</p>
                        </div>
                        <div className="block">
                            <i className="fas fa-chart-line"></i>
                            <p>Relatórios</p>
                        </div>
                    </div>
                </div>
            </div>
            <Rodape />
        </div>
    );
}

export default PainelPrincipal;
