import React, { useEffect, useState } from 'react';
import { Flex, Switch, Table, Tag, Transfer } from 'antd';
import { api } from '../../service/api';
import { formatDate } from 'date-fns';

const TableTransfer = (props) => {
    const { leftColumns, rightColumns, ...restProps } = props;
    return (
        <Transfer
            style={{
                width: '100%',
            }}
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
                const columns =
                    direction === 'left' ? leftColumns : rightColumns;
                const rowSelection = {
                    getCheckboxProps: () => ({
                        disabled: listDisabled,
                    }),
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
                        style={{
                            pointerEvents: listDisabled ? 'none' : undefined,
                        }}
                        onRow={({ key, disabled: itemDisabled }) => ({
                            onClick: () => {
                                if (itemDisabled || listDisabled) {
                                    return;
                                }
                                onItemSelect(
                                    key,
                                    !listSelectedKeys.includes(key)
                                );
                            },
                        })}
                    />
                );
            }}
        </Transfer>
    );
};

const filterOption = (input, item) =>
    item.title?.includes(input) || item.tag?.includes(input);

const Procedimento = (props) => {
    const [targetKeys, setTargetKeys] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [mockData1, setMockData1] = useState([]);
    const [fonteDados, setFonteDados] = useState([]);
    const [temKeys, setTempKeys] = useState([]);
    const [gastoId, setGastoId] = useState(0);

    const columns = [
        {
            dataIndex: 'title',
            title: 'Designação',
        },
        {
            dataIndex: 'tag',
            title: 'Tag',
            render: (tag) => (
                <Tag
                    style={{
                        marginInlineEnd: 0,
                    }}
                    color="cyan"
                >
                    {tag.toUpperCase()}
                </Tag>
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
                <Tag
                    style={{
                        marginInlineEnd: 0,
                    }}
                    color="cyan"
                >
                    {tag.toUpperCase()}
                </Tag>
            ),
        },
    ];

    useEffect(() => {
        async function carregar() {
            await api
                .get('produto/all/grupo/3')
                .then((r) => {
                    let newArray = r.data;
                    setFonteDados([...newArray]);
                    console.log(fonteDados);
                    var itens = [];
                    newArray.map((item) => {
                        let value = {
                            key: item.id,
                            title: item.productDescription,
                            description: item.productDescription,
                            tag: 'Doc',
                        };

                        itens.push(value);
                    });
                    setMockData1([...itens]);

                    //console.log(r.data);
                })
                .catch((e) => {
                    console.log('Falha ao carregar');
                });
        }

        carregar();
    }, []);

    useEffect(() => {
        procInsertLinhas();
    }, [temKeys]);

    const criarLinhaGasto = async (index) => {
        let linha = {
            dataInsercao: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            desconto: 0,
            gastoId: gastoId,
            preco: getItemProduto(index).preco,
            iva: getItemProduto(index).taxIva,
            quantidade: 1,
            servicoDescricao: getItemProduto(index).productDescription,
            servicoId: index,
            status: true,
        };
        await api
            .post('linhagasto/add', linha)
            .then((r) => {
                console.log('linha criada com sucesso!...');
            })
            .catch((r) => {
                console.log('Falha ao criar a linha');
            });
    };

    const criarGasto = async () => {
        let gasto = {
            gastoId: gastoId,
            convertido: 'ABERTO',
            dataCriacao: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            doc: '',
            docRef: '',
            inscricaoId: props.idInscricao,
            status: true,
        };

        await api
            .post('gasto/add', gasto)
            .then((r) => {
                console.log(r.data);
                setGastoId(r.data.id);
                //console.log('Gasto criado com sucesso!...');
                return r.data;
            })
            .catch((e) => {
                console.log('Erro ao salvar o gasto', e.data);
            });
    };
    const onChange = async (nextTargetKeys) => {
        console.log(nextTargetKeys);
        setTempKeys([...nextTargetKeys]);

        if (gastoId === 0) {
            criarGasto()
                .then((r) => {
                    console.log('Gasto criado com sucesso: ', r);
                })
                .catch((e) => {
                    console.log('Falha ao criar o gasto');
                });
        }

        /*
        if (gastoId !== 0) {
            await deleteAllLinhasGasto();
            nextTargetKeys.map(async (index) => {
                await criarLinhaGasto(index);
            });
            setTargetKeys(nextTargetKeys);
        }
            */
    };

    async function procInsertLinhas() {
        await deleteAllLinhasGasto();
        console.log('GastoIDUpdade:' + gastoId);

        temKeys.map(async (index) => {
            await criarLinhaGasto(index);
        });
        setTargetKeys(temKeys);
    }

    const deleteAllLinhasGasto = async () => {
        await api
            .delete('linhagasto/gasto/' + gastoId)
            .then((r) => {
                console.log('Gastos eliminado com sucesso!...');
            })
            .catch((e) => {
                console.log('Falha ao eliminar os gastos');
            });
    };

    const toggleDisabled = (checked) => {
        setDisabled(checked);
    };

    const getItemProduto = (id) => {
        return fonteDados.find((item) => item.id === id);
        //return produto.taxIva;
    };

    return (
        <Flex align="start" gap="middle" vertical>
            <TableTransfer
                dataSource={mockData1}
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
                unCheckedChildren="disabled"
                checkedChildren="disabled"
                checked={disabled}
                onChange={toggleDisabled}
            />
        </Flex>
    );
};
export default Procedimento;
