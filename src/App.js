import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import { StockProvider } from './contexts/StockContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './contexts/auth';
import RoutesApp from './routes/index';
import Login from './pages/Login';
import SelecionarFilial from './pages/SelecionarFilial';
import Private from './contexts/Private'; // Added import for Private

function App() {
  const RequireFilial = ({ children }) => {
    const { user } = React.useContext(AuthContext);
    const location = useLocation();

    // Evita redirecionamento em loop para /selecionar-filial
    if (location.pathname === '/selecionar-filial') {
      return children;
    }

    if (!user?.filialSelecionada) {
      return <Navigate to="/selecionar-filial" replace />;
    }

    return children;
  };

  return (
    <Router>
      <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Rota de seleção de filial */}
            <Route
              path="/selecionar-filial"
              element={
                <Private>
                  <SelecionarFilial />
                </Private>
              }
            />

            {/* Todas as outras rotas protegidas do RoutesApp */}
            <Route
              path="/*"
              element={
                <Private>
                  <RequireFilial>
                    <RoutesApp />
                  </RequireFilial>
                </Private>
              }
            />
          </Routes>
          <ToastContainer />
       
      </AuthProvider>
    </Router>
  );
}

export default App;