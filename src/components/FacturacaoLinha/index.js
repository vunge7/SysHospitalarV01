import React, { useEffect, useState } from 'react';
import './style.css';

function FacturacaoLinha(props) {
    const [editavel, setEditavel] = useState(false);
    const [qtd, setQtd] = useState(props.qtd);
    const [desconto, setDesconto] = useState(props.desconto);

    const updateRow = () => {
        acaoActualizarLinha();
    };

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            acaoActualizarLinha();
        }
    }
    function acaoActualizarLinha() {
        if (
            props.isZero(qtd) ||
            props.isMenorQueZero(qtd) ||
            props.isMenorQueZero(desconto)
        ) {
            return;
        }
        setEditavel(false);
        props.updateItem(props.id, qtd, desconto);
    }

    return (
        <div className="container-facturacao-linha">
            <div className="item">{props.designacao}</div>
            <div className="item">
                <div>{props.preco}</div>
                {editavel ? (
                    <input
                        autoFocus={true}
                        type="text"
                        value={qtd}
                        onChange={(e) => setQtd(e.target.value)}
                        onKeyPress={(event) => handleKeyPress(event)}
                    />
                ) : (
                    <div>{props.qtd}</div>
                )}

                {editavel ? (
                    <input
                        type="text"
                        value={desconto}
                        onChange={(e) => setDesconto(e.target.value)}
                        onKeyPress={(event) => handleKeyPress(event)}
                    />
                ) : (
                    <div>{props.desconto}</div>
                )}
                <div>{props.iva}</div>
                <div>
                    <strong>{props.subTotal}</strong>
                </div>
                <div>
                    {editavel ? (
                        <button onClick={() => updateRow()}>actualizar</button>
                    ) : (
                        <button onClick={() => setEditavel(true)}>
                            editar
                        </button>
                    )}
                    <button onClick={(e) => props.removerItem(props.id)}>
                        remover
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FacturacaoLinha;
