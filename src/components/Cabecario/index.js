import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import logo from '../../assets/images/logo_dvml.png';
import user from '../../assets/images/user.png';

function Cabecario() {
    return (
        <div style={{ marginBottom: 10 }}>
            <header className="navbar">
                <Link to="/admin">
                    <div className="navbar-logo">
                        <img src={logo} alt="Logo" />
                    </div>
                </Link>

                <div className="navbar-user">
                    <img src={user} alt="Usuário" />
                </div>

                <div className="hamburger">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </header>
        </div>
    );
}

export default Cabecario;
