import React from 'react';
import './style.css';
// import { Container } from './styles';

function FacturacaoHeader() {
    return (
        <div className="container-facutacao-header">
            <div className="container-facutacao-header-item">
                <label>Logo</label>
                <strong>DVML-COMERCIAL, Lda</strong>
                <label>NIF</label>
                <label>Endereço</label>
            </div>
            <div className="container-facutacao-header-item">
                <strong>Consumidor Final</strong>
                <label>999999999</label>
                <label>Luanda-Angola</label>
            </div>
        </div>
    );
}

export default FacturacaoHeader;
