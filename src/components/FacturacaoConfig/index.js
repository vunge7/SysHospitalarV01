import React, { useState, useEffect } from 'react';
import './style.css';
import { api } from '../../service/api';

function FacturacaoConfig({ documentType, setDocumentType }) {
  const [tipoDocumentos, setTipoDocumento] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    api.get('/tipo-documento/all')
      .then((response) => {
        setTipoDocumento(response.data);
      })
      .catch((error) => {
        console.log('Erro ao buscar tipos de documentos', error);
      });
  }, []);

  return (
    <div className="container-facturacao-config">
      <div className="item">
        <label htmlFor="documentType">Documento</label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="" disabled>--Seleccione--</option>
          {tipoDocumentos.map((tipo) => (
            <option key={tipo.abreviatura} value={tipo.abreviatura}>{tipo.designacao}</option>
          ))}
        </select>

        <label htmlFor="series">{documentType}</label>
      </div>

      <div className="item">
        <label htmlFor="date">Data</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </div>
  );
}

export default FacturacaoConfig;
