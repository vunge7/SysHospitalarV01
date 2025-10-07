/**
 * Configuração de permissões de campos por tipo de usuário
 * 
 * Estrutura:
 * - visibleFor: Lista de tipos de usuário que podem ver o campo
 * - hiddenFor: Lista de tipos de usuário que NÃO podem ver o campo
 * - Se ambos forem omitidos, o campo é visível para todos
 * 
 * Exemplo de uso:
 * {
 *   preco: { visibleFor: ['admin', 'gerente'] },
 *   taxIva: { hiddenFor: ['analista'] }
 * }
 */

// Mapeamento de tipo de usuário para grupo de produto padrão
const DEFAULT_PRODUCT_GROUPS = {
  analista: 'Exame',
  medico: 'Consultas',
  // Adicione outros mapeamentos conforme necessário
};

export const FIELD_PERMISSIONS = {
  // Campos de preço visíveis apenas para administrativo
  preco: { 
    visibleFor: ['administrativo']
  },
  
  taxIva: {
    visibleFor: ['administrativo']
  },
  
  finalPrice: {
    visibleFor: ['administrativo']
  },
  
  // Configuração para o campo de grupo de produto
  productGroup: {
    // Se o tipo de usuário estiver no mapeamento, define o valor padrão e bloqueia a edição
    getDefaultValue: (userType) => DEFAULT_PRODUCT_GROUPS[userType?.toLowerCase()] || '',
    isReadOnly: (userType) => !!DEFAULT_PRODUCT_GROUPS[userType?.toLowerCase()]
  },
  
  // Outros campos podem ser adicionados aqui
};

/**
 * Verifica se um campo deve ser visível para o tipo de usuário atual
 * @param {string} fieldName - Nome do campo
 * @param {string} userType - Tipo do usuário atual
 * @returns {boolean} - Se o campo deve ser visível
 */
export const isFieldVisible = (fieldName, userType) => {
  const normalizedUserType = userType?.toLowerCase() || '';
  const fieldConfig = FIELD_PERMISSIONS[fieldName];
  
  // Se não houver configuração para o campo, assume-se que está visível
  if (!fieldConfig) return true;
  
  // Se houver uma lista de tipos com permissão, verifica se o tipo atual está nela
  if (fieldConfig.visibleFor) {
    const allowedTypes = Array.isArray(fieldConfig.visibleFor) 
      ? fieldConfig.visibleFor.map(t => t.toLowerCase())
      : [fieldConfig.visibleFor.toLowerCase()];
    
    return allowedTypes.includes(normalizedUserType);
  }
  
  // Se houver uma lista de tipos sem permissão, verifica se o tipo atual NÃO está nela
  if (fieldConfig.hiddenFor) {
    const hiddenTypes = Array.isArray(fieldConfig.hiddenFor)
      ? fieldConfig.hiddenFor.map(t => t.toLowerCase())
      : [fieldConfig.hiddenFor.toLowerCase()];
    
    return !hiddenTypes.includes(normalizedUserType);
  }
  
  // Se não houver restrições, o campo é visível
  return true;
};

/**
 * Filtra um schema para incluir apenas os campos visíveis para o tipo de usuário
 * @param {Object} schema - Schema original
 * @param {string} userType - Tipo do usuário atual
 * @returns {Object} - Schema filtrado
 */
export const filterSchemaByUserType = (schema, userType) => {
  const filteredSchema = {};
  
  Object.entries(schema).forEach(([key, value]) => {
    if (isFieldVisible(key, userType)) {
      filteredSchema[key] = value;
    }
  });
  
  return filteredSchema;
};

/**
 * Filtra os valores de um formulário para incluir apenas os campos visíveis
 * @param {Object} values - Valores do formulário
 * @param {string} userType - Tipo do usuário atual
 * @returns {Object} - Valores filtrados
 */
export const filterFormValues = (values, userType) => {
  const filteredValues = {};
  
  Object.entries(values).forEach(([key, value]) => {
    if (isFieldVisible(key, userType)) {
      filteredValues[key] = value;
    }
  });
  
  return filteredValues;
};
