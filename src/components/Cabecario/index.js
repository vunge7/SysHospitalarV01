import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
//import logo from '../../assets/images/logo_dvml.png';
import logo from '../../assets/images/logo5.png';
import userLogo from '../../assets/images/user.png';
import { Button } from 'antd';
import { AuthContext } from '../../contexts/auth';
function Cabecario() {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ marginBottom: 5 }}>
            <header className="navbar">
                <Link to="/admin">
                    <div className="navbar-logo">
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ width: '60%', height: '60%' }}
                        />
                    </div>
                </Link>

                <div className="navbar-user">
                    <img src={userLogo} alt="Usuário" />
                    <Button
                        type="primary"
                        onClick={() => logout()}
                        style={{ marginTop: 16 }}
                    >
                        Logout
                    </Button>
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
