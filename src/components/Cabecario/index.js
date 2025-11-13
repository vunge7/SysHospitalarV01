import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './style.css';
import logo from '../../assets/images/logo5.png';
import userImg from '../../assets/images/user.png';

function Cabecario() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    // Fechar o menu quando clicar fora dele
    const handleClickOutside = (e) => {
        if (!e.target.closest('.navbar-user')) {
            setShowUserMenu(false);
        }
    };

    // Adicionar evento de clique fora do menu
    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div style={{ marginBottom: 5 }}>
            <header className="navbar">
                <Link to="/admin">
                    <div className="navbar-logo">
                        <img src={logo} alt="Logo" style={{ width: "60%", height: "60%" }} />
                    </div>
                </Link>

                <div className="navbar-user" onClick={toggleUserMenu}>
                    <img
                        src={user?.fotoUrl || userImg}
                        alt="Usuário"
                        onError={(e) => { e.currentTarget.src = userImg; }}
                        style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    {user && (
                        <span style={{ marginLeft: '8px', color: '#fff' }}>
                            {user.nome || 'Usuário'}
                        </span>
                    )}
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-info">
                                <p><strong>{user?.nome || 'Usuário'}</strong></p>
                                <p className="user-email">{user?.email || ''}</p>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button onClick={handleLogout} className="logout-button">
                                Sair
                            </button>
                        </div>
                    )}
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
