import React, { useState } from 'react';

const DynamicTable = (props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5; // Número de produtos por página

    // Filtro de pesquisa
    const filteredData = props.data.filter((row) =>
        Object.values(row).some(
            (value) =>
                typeof value === 'string' &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Função de Paginação
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentData = filteredData.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (!props.data || props.data.length === 0) {
        return <p>Nenhum dado disponível.</p>;
    }

    // Obtendo os nomes das colunas a partir da primeira linha de dados
    const columns = Object.keys(props.data[0]);

    return (
        <div>
            <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                    width: '100%',
                }}
            />

            <table className={props.className}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((row, index) => (
                        <tr key={index}>
                            {columns.map((col) => (
                                <td key={col}>
                                    {typeof row[col] === 'object'
                                        ? JSON.stringify(row[col])
                                        : row[col]}
                                </td>
                            ))}

                            {props.isCrud ? (
                                <td>
                                    <button onClick={() => props.onEdit(row)}>
                                        Editar
                                    </button>
                                    <button onClick={() => props.onDelete(row)}>
                                        Excluir
                                    </button>
                                </td>
                            ) : (
                                <td>
                                    <button onClick={() => props.onAdd(row)}>
                                        Adicionar
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginação */}
            <div className="pagination">
                {Array.from(
                    {
                        length: Math.ceil(
                            filteredData.length / productsPerPage
                        ),
                    },
                    (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={
                                currentPage === index + 1 ? 'active' : ''
                            }
                        >
                            {index + 1}
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default DynamicTable;
