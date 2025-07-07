import React, { useEffect, useState } from 'react';
import './style.css';
import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';

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
                        onChange={(e) => setQtd(Number(e.target.value))}
                        onKeyPress={(event) => handleKeyPress(event)}
                    />
                ) : (
                    <div>{props.qtd}</div>
                )}

                {editavel ? (
                    <input
                        type="text"
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value))}
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
                        <Button
                            type="primary"
                            onClick={() => updateRow()}
                            disabled={props.designacao === 'Serviço Especial'}
                            icon={
                                props.designacao === 'Serviço Especial'
                                    ? <StopOutlined />
                                    : <CheckOutlined />
                            }
                        >
                            {props.designacao === 'Serviço Especial'
                                ? 'Bloqueado'
                                : 'actualizar'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setEditavel(true)}
                            type={
                                props.designacao === 'Medicamento'
                                    ? 'dashed'
                                    : 'default'
                            }
                            icon={<EditOutlined />}
                        >
                            {props.designacao === 'Medicamento'
                                ? 'editar medicamento'
                                : 'editar'}
                        </Button>
                    )}
                    <Popconfirm
                        title="Tens a certeza que queres remover?"
                        onConfirm={() => props.removerItem(props.id)}
                        okText="Sim"
                        cancelText="Não"
                        disabled={props.designacao === 'Serviço Especial'}
                    >
                        <Button
                            type="text"
                            danger
                            disabled={props.designacao === 'Serviço Especial'}
                            icon={<DeleteOutlined />}
                        >
                            remover
                        </Button>
                    </Popconfirm>
                </div>
            </div>
        </div>
    );
}

export default FacturacaoLinha;
