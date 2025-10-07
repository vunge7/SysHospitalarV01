import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './auth';

export default function RoleRoute({ allowed, children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div></div>;

  if (!user || !allowed.includes((user.tipo || '').toLowerCase())) {
    // Redireciona para uma página padrão, como dashboard ou acesso negado
    return <Navigate to="/admin" />;
  }

  return children;
} 