
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, BrowserRouter } from 'react-router-dom';
import AuthProvider from '../src/contexts/auth';
import Login from '../src/pages/Login';
import RoutesApp from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StockProvider } from './contexts/StockContext';
//Alterado no github
//Alterado do VSCODE 7 8 9
//Do repositoriox
//Do VS Code 10
//Do Reoisitorio 02
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <StockProvider>
                    <RoutesApp />
                    <ToastContainer />
                </StockProvider>
            </AuthProvider>
        </BrowserRouter>
    );

}

export default App;
