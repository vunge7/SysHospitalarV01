import React, { createContext, useEffect, useState } from 'react';
import { api, fetchFuncionarioById, fetchPessoaById } from '../service/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        }

        loadUser();
    }, []);

    async function signIn(user) {
        setLoadingAuth(true);
        try {
            let data = {
                id: user.id,
                uid: user.id,
                nome: user.username,
                tipo: user.tipo,
                funcionarioId: user.funcionarioId || null,
            };

            // Busca foto do perfil via funcionario -> pessoa -> nomePhoto
            if (data.funcionarioId) {
                try {
                    const funcResp = await fetchFuncionarioById(data.funcionarioId);
                    const func = funcResp?.data;
                    const pessoaId = func?.pessoaId || func?.pessoa?.id;
                    if (pessoaId) {
                        const pessoaResp = await fetchPessoaById(pessoaId);
                        const pessoa = pessoaResp?.data;
                        const nomePhoto = pessoa?.nomePhoto;
                        if (nomePhoto) {
                            const base = (api?.defaults?.baseURL || '').replace(/\/+$/, '');
                            // Garante que usamos apenas a ORIGEM (sem caminhos como /api)
                            const baseOrigin = (() => {
                                try {
                                    return new URL(base, window.location.origin).origin;
                                } catch {
                                    // Fallback: remove "/api" ou qualquer sufixo de caminho
                                    return base.replace(/\/?api\/?$/, '');
                                }
                            })();
                            data.pessoaId = pessoaId;
                            data.nomePhoto = nomePhoto;
                            data.fotoUrl = `${api.baseURL}/uploads/pessoa/fotos/${encodeURIComponent(nomePhoto)}`;
                            console.log("Nome da foto: ", data.nomePhoto);
                        }else{
                            console.log('Nenhuma foto encontrada para o funcionário');
                        }
                    }else{
                        console.log('Nenhuma pessoa encontrada para o funcionário');
                    }
                } catch (e) {
                    // Ignora erro de busca de foto; segue login
                    console.warn('Falha ao carregar foto de perfil:', e);
                }
            }

            setUser(data);
            storedUser(data);
        } finally {
            setLoadingAuth(false);
        }
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
    }

    function storedUser(data) {
        localStorage.setItem('@sysHospitalarPRO', JSON.stringify(data));
    }

    async function logout() {
        localStorage.removeItem('@sysHospitalarPRO');
        localStorage.removeItem('token');
        // Remover todos os cookies de sessão
        document.cookie.split(';').forEach(function(c) {
            document.cookie = c
                .replace(/^ +/, '')
                .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
        });
        setUser(null);
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