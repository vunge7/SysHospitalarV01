import React, { useState } from 'react';
import './style.css';
// import { Container } from './styles';

function FacturacaoFooter(props) {
    return (
        <div className="container-facutacao-footer">
            <div className="container-facutacao-footer-item">
                <div>
                    <label>Total de Itens: </label>
                    <span>
                        <strong>{props.totalItens}</strong>
                    </span>
                </div>
            </div>
            <div className="container-facutacao-footer-item">
                <div>
                    <label>Total Ilíquido: </label>
                    <span>
                        <strong>{props.totalIliquido}</strong>
                    </span>
                </div>
                <div>
                    <label>Total Iva: </label>
                    <span>
                        <strong>{props.totalIva}</strong>
                    </span>
                </div>

                <div>
                    <label>Total Desconto: </label>
                    <span>
                        <strong>{props.totalDesconto}</strong>{' '}
                    </span>
                </div>
                <hr />
                <div>
                    <label>Total Líquido: </label>
                    <span>
                        <strong>{props.totalLiquido}</strong>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default FacturacaoFooter;
