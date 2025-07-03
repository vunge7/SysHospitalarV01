import React, { useState, useEffect } from 'react';
import { api } from "../../service/api";

function TabelaDeProduto(){

    const [carregar, setCarregar] = useState(false);
    const [produto, setProduto] = useState([]);

    const buscarProdutos = async () => {
        setCarregar(true);
        await api
          .get('produto/all')
          .then((result) => {
            console.log(result.data);
            const tipos = [...new Set(result.data.map(produto => produto))];
            setProduto(tipos);
            setCarregar(false);
          })
          .catch((error) => {
            console.log('Erro ao efetuar a chamada da API', error);
            setCarregar(false);
          });
      };
    
    
      // Chama a função para buscar os produtos quando o componente for montado
      useEffect(() => {
        buscarProdutos();
      }, []);


    return (
        <div>
            <table border="1">
                <caption>Produtos</caption>
        
                <tr>
                    <th>ID</th>
                    <th>Preço</th>
                    <th>Product Code</th>
                    <th>Product Description</th>
                    <th>Product Group</th>
                    <th>Product Number Code</th>
                    <th>Product Type</th>
                </tr>
                {produto.length > 0 ? (
                    produto.map((produto, index) => (
                    <tr>
                        <td key={index}>{produto.id}</td>
                        <td key={index}>{produto.preco}</td>
                        <td key={index}>{produto.productCode}</td>
                        <td key={index}>{produto.productDescription}</td>
                        <td key={index}>{produto.productGroup}</td>
                        <td key={index}>{produto.productNumberCode}</td>
                        <td key={index}>{produto.productType}</td>
                    </tr>
                 ))
                ) : "<p>Sem Produtos Pra Mostrar</p>" }
            </table>
        </div>
    );

}export default TabelaDeProduto;