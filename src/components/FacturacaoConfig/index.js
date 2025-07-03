import React from 'react';
import './style.css';

function FacturacaoConfig() {
    return (
        <div className="container-facturacao-config">
            <div className="item">
                <label>Documento</label>
                <select>
                    <option>--Seleccione--</option>
                    <option>Factura Recibo</option>
                    <option>Factura</option>
                    <option>Factura Proforma</option>
                </select>
            </div>

            <div className="item">Data</div>
            <div className="item">coluna 03</div>
        </div>
    );
}

export default FacturacaoConfig;
