import React, { useEffect, useState } from 'react';
import './style.css';
import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';

function FacturacaoLinha(props) {
    const [editavel, setEditavel] = useState(false);
    const [qtd, setQtd] = useState(props.qtd);
    const [desconto, setDesconto] = useState(props.desconto);

    // Sincroniza com props quando a linha é atualizada externamente
    useEffect(() => {
        setQtd(props.qtd);
        setDesconto(props.desconto);
    }, [props.qtd, props.desconto]);

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

    const isBloqueado = props.designacao === 'Serviço Especial';

    return (
        <tr className="facturacao-linha">
            {/* DESIGNACAO */}
            <td className="designacao-cell">{props.designacao}</td>

            {/* PREÇO */}
            <td className="preco-cell">{props.preco}</td>

            {/* QTD */}
            <td className="qtd-cell">
                {editavel ? (
                    <input
                        autoFocus
                        type="number"
                        value={qtd}
                        onChange={(e) => setQtd(Number(e.target.value))}
                        onKeyPress={handleKeyPress}
                        min="1"
                        className="input-edicao"
                    />
                ) : (
                    <span>{props.qtd}</span>
                )}
            </td>

            {/* IVA */}
            <td className="iva-cell">{props.iva}%</td>

            {/* DESCONTO */}
            <td className="desconto-cell">
                {editavel ? (
                    <input
                        type="number"
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value))}
                        onKeyPress={handleKeyPress}
                        min="0"
                        className="input-edicao"
                    />
                ) : (
                    <span>{props.desconto}</span>
                )}
            </td>

            {/* SUBTOTAL */}
            <td className="subtotal-cell">
                <strong>{props.subTotal}</strong>
            </td>

            {/* AÇÕES */}
            <td className="acoes-cell">
                {editavel ? (
                    <Button
                        type="primary"
                        size="small"
                        onClick={updateRow}
                        disabled={isBloqueado}
                        icon={isBloqueado ? <StopOutlined /> : <CheckOutlined />}
                        className="btn-acao"
                    >
                        {isBloqueado ? 'Bloqueado' : 'OK'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setEditavel(true)}
                        type={props.designacao === 'Medicamento' ? 'dashed' : 'default'}
                        size="small"
                        icon={<EditOutlined />}
                        className="btn-acao"
                    >
                        {props.designacao === 'Medicamento' ? 'Editar' : 'Editar'}
                    </Button>
                )}

                <Popconfirm
                    title="Tens a certeza que queres remover?"
                    onConfirm={() => props.removerItem(props.id)}
                    okText="Sim"
                    cancelText="Não"
                    disabled={isBloqueado}
                >
                    <Button
                        type="text"
                        danger
                        size="small"
                        disabled={isBloqueado}
                        icon={<DeleteOutlined />}
                        className="btn-acao btn-remover"
                    >
                        Remover
                    </Button>
                </Popconfirm>
            </td>
        </tr>
    );
}

export default FacturacaoLinha;