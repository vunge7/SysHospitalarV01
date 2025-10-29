import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);

    const [filiais, setFiliais] = useState([]);
    const [filialSelecionada, setFilialSelecionada] = useState();
    const [permissoes, setPermissoes] = useState([]);

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem('@sysHospitalarPRO');
            if (storageUser) {
                const userData = JSON.parse(storageUser);
                setUser(userData);

                // Se o usuário não tem filial selecionada, redirecionar para seleção
                if (!userData.filialSelecionada) {
                    // Não redirecionar aqui, deixar o componente de rota fazer isso
                }
            }
        }

        loadUser();
    }, []);

    function signIn(user) {
        let data = {
            id: user.id,
            uid: user.id,
            nome: user.username,
            tipo: user.tipo,
            filias: filiais,
            permissoes: permissoes,
        };

        setUser(data);
        storedUser(data);
    }

    //Criar usuariário
    async function signUp(email, password, name) {
        let data = {
            uid: '1',
            nome: user.username,
            tipo: user.tipo,
            filias: user.filiais,
            permissoes: user.permissoes,
        };

        setUser(data);
        storedUser(data);
        setLoadingAuth(false);
    }

    function storedUser(data) {
        localStorage.setItem('@sysHospitalarPRO', JSON.stringify(data));
    }

    async function logout() {
        localStorage.removeItem('@sysHospitalarPRO');
        localStorage.removeItem('token');
        // Remover todos os cookies de sessão
        document.cookie.split(';').forEach(function (c) {
            document.cookie = c
                .replace(/^ +/, '')
                .replace(
                    /=.*/,
                    '=;expires=' + new Date(0).toUTCString() + ';path=/'
                );
        });
        setUser(null);
        setFiliais([]);
        setFilialSelecionada(null);
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user, //false (caso não tiver usuário logado)
                user,
                signIn,
                signUp,
                logout,
                loadingAuth,
                storedUser,
                setUser,
                setFiliais,
                filiais,
                permissoes,
                setPermissoes,
                setFilialSelecionada,
                filialSelecionada,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
