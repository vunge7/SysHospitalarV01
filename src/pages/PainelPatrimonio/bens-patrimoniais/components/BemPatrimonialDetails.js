import React, { useState, useEffect } from 'react';
import { getBemPatrimonialById } from '../../services/bemPatrimonialService';

const BemPatrimonialDetails = ({ bemId, onClose }) => {
  const [bem, setBem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bemId) {
      loadBemDetails();
    }
  }, [bemId]);

  const loadBemDetails = async () => {
    try {
      const data = await getBemPatrimonialById(bemId);
      setBem(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do bem:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!bem) {
    return <div>Bem não encontrado</div>;
  }

  return (
    <div>
      <h2>Detalhes do Bem Patrimonial</h2>
      <div>
        <h3>Informações Básicas</h3>
        <p><strong>Código:</strong> {bem.codigo}</p>
        <p><strong>Descrição:</strong> {bem.descricao}</p>
        <p><strong>Categoria:</strong> {bem.categoria}</p>
        <p><strong>Localização:</strong> {bem.localizacao}</p>
        <p><strong>Valor:</strong> R$ {bem.valor}</p>
        <p><strong>Data de Aquisição:</strong> {bem.dataAquisicao}</p>
        <p><strong>Fornecedor:</strong> {bem.fornecedor}</p>
        <p><strong>Número de Série:</strong> {bem.numeroSerie}</p>
        <p><strong>Observações:</strong> {bem.observacoes}</p>
      </div>

      <div>
        <h3>Histórico de Movimentações</h3>
        {/* Aqui você pode adicionar uma lista de movimentações */}
        <p>Histórico de movimentações será exibido aqui</p>
      </div>

      <div>
        <h3>Histórico de Manutenções</h3>
        {/* Aqui você pode adicionar uma lista de manutenções */}
        <p>Histórico de manutenções será exibido aqui</p>
      </div>

      <div>
        <h3>Histórico de Depreciações</h3>
        {/* Aqui você pode adicionar uma lista de depreciações */}
        <p>Histórico de depreciações será exibido aqui</p>
      </div>

      <button onClick={onClose}>Fechar</button>
    </div>
  );
};

export default BemPatrimonialDetails; 