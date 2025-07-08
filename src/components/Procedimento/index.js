import React, { useEffect, useState } from 'react';
import { Flex, Switch, Table, Tag, Transfer } from 'antd';
import { api } from '../../service/api';
import { formatDate } from 'date-fns';

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
    <Transfer
        style={{ width: '100%' }}
        titles={['Disponíveis', 'Selecionado']}
        {...restProps}
    >
        {({
            direction,
            filteredItems,
            onItemSelect,
            onItemSelectAll,
            selectedKeys: listSelectedKeys,
            disabled: listDisabled,
        }) => {
            const columns = direction === 'left' ? leftColumns : rightColumns;
            const rowSelection = {
                getCheckboxProps: () => ({ disabled: listDisabled }),
                onChange(selectedRowKeys) {
                    onItemSelectAll(selectedRowKeys, 'replace');
                },
                selectedRowKeys: listSelectedKeys,
                selections: [
                    Table.SELECTION_ALL,
                    Table.SELECTION_INVERT,
                    Table.SELECTION_NONE,
                ],
            };
            return (
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredItems}
                    size="small"
                    style={{ pointerEvents: listDisabled ? 'none' : undefined }}
                    onRow={({ key, disabled: itemDisabled }) => ({
                        onClick: () => {
                            if (itemDisabled || listDisabled) return;
                            onItemSelect(key, !listSelectedKeys.includes(key));
                        },
                    })}
                />
            );
        }}
    </Transfer>
);

const filterOption = (input, item) =>
    item.title?.toLowerCase().includes(input.toLowerCase()) ||
    item.tag?.toLowerCase().includes(input.toLowerCase());

const Procedimento = (props) => {
    const [targetKeys, setTargetKeys] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [mockData, setMockData] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [gastoId, setGastoId] = useState(0);

    // Carrega produtos ao montar
    useEffect(() => {
        async function carregarProdutos() {
            try {
                const { data } = await api.get('produto/all/grupo/3');
                setProdutos(data);
                setMockData(
                    data.map((item) => ({
                        key: item.id,
                        title: item.productDescription,
                        description: item.productDescription,
                        tag: 'Doc',
                    }))
                );
            } catch {
                // Trate o erro conforme necessário
            }
        }
        carregarProdutos();
    }, []);

    // Sempre que targetKeys mudar, sincroniza linhas de gasto
    useEffect(() => {
        if (gastoId !== 0) {
            sincronizarLinhasGasto(targetKeys);
        }
    }, [targetKeys, gastoId]);

    // Cria gasto se necessário e atualiza seleção
    const onChange = async (nextTargetKeys) => {
        if (gastoId === 0) {
            const novoGastoId = await criarGasto();
            setGastoId(novoGastoId);
            setTargetKeys(nextTargetKeys);
        } else {
            setTargetKeys(nextTargetKeys);
        }
    };

    // Cria gasto e retorna o id
    const criarGasto = async () => {
        const gasto = {
            convertido: 'ABERTO',
            dataCriacao: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            doc: '',
            docRef: '',
            inscricaoId: props.idInscricao,
            status: true,
        };
        try {
            const { data } = await api.post('gasto/add', gasto);
            return data.id;
        } catch {
            return 0;
        }
    };

    // Remove todas as linhas e cria novas para os selecionados
    const sincronizarLinhasGasto = async (keys) => {
        await deletarTodasLinhasGasto();
        for (const key of keys) {
            await criarLinhaGasto(key);
        }
    };

    // Cria uma linha de gasto
    const criarLinhaGasto = async (produtoId) => {
        const produto = produtos.find((item) => item.id === produtoId);
        if (!produto) return;
        const linha = {
            dataInsercao: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            desconto: 0,
            gastoId,
            preco: produto.preco,
            iva: produto.taxIva,
            quantidade: 1,
            servicoDescricao: produto.productDescription,
            servicoId: produtoId,
            status: true,
        };
        try {
            await api.post('linhagasto/add', linha);
        } catch {
            // Trate o erro conforme necessário
        }
    };

    // Remove todas as linhas do gasto
    const deletarTodasLinhasGasto = async () => {
        if (!gastoId) return;
        try {
            await api.delete(`linhagasto/gasto/${gastoId}`);
        } catch {
            // Trate o erro conforme necessário
        }
    };

    const columns = [
        {
            dataIndex: 'title',
            title: 'Designação',
        },
        {
            dataIndex: 'tag',
            title: 'Tag',
            render: (tag) => (
                <Tag color="cyan">{tag.toUpperCase()}</Tag>
            ),
        },
    ];

    const columnsRight = [
        {
            dataIndex: 'title',
            title: 'Designação',
        },
        {
            dataIndex: 'tag',
            title: 'Progresso',
            render: (tag) => (
                <Tag color="cyan">{tag.toUpperCase()}</Tag>
            ),
        },
    ];

    return (
        <Flex align="start" gap="middle" vertical>
            <TableTransfer
                dataSource={mockData}
                targetKeys={targetKeys}
                disabled={disabled}
                showSearch
                showSelectAll={false}
                onChange={onChange}
                filterOption={filterOption}
                leftColumns={columns}
                rightColumns={columnsRight}
            />
            <Switch
                unCheckedChildren="Desativado"
                checkedChildren="Ativo"
                checked={disabled}
                onChange={setDisabled}
            />
        </Flex>
    );
};

export default Procedimento;
