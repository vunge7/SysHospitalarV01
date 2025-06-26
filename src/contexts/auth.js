import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem('@sysHospitalarPRO');
            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }
            setLoading(false);
        }

        loadUser();
    }, []);

    function signIn(user) {
        let data = {
            uid: user.id,
            nome: user.username,
            tipo: user.tipo,
        };

        setUser(user);
        storedUser(data);
        if (data.tipo === 'master') navigate('/admin');
        else if (data.tipo === 'enfermeiro') navigate('/enf');
        else if (data.tipo === 'medico') navigate('/medico/home');
    }

    //Criar usuariário
    async function signUp(email, password, name) {
        setLoadingAuth(true);

        let data = {
            uid: '1',
            nome: user.username,
            tipo: user.tipo,
        };

        setUser(data);
        storedUser(data);
        setLoadingAuth(false);

        navigate('/admin/home');
    }

    function storedUser(data) {
        localStorage.setItem('@sysHospitalarPRO', JSON.stringify(data));
    }

    async function logout() {
        localStorage.removeItem('@sysHospitalarPRO');
        setUser(null);
        navigate('/');
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user, //false (caso não tiver usuário logado)
                user,
                signIn,
                signUp,
                logout,
                loading,
                loadingAuth,
                storedUser,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
