# 🔐 Configuração do Sistema de Permissões

## 📋 **Visão Geral**

O sistema de permissões funciona em **duas camadas**:

1. **Tipo de Usuário** (baseado no campo `tipo` do usuário)
2. **Permissões Granulares** (baseadas na tabela `PainelPermissao`)

## 🎯 **Como Funciona Atualmente**

### **1. Verificação por Tipo de Usuário**
```javascript
// Tipos permitidos para cada painel
const tiposPermitidos = {
    'admin': ['admin'],
    'medico': ['medico', 'admin'],
    'enfermeiro': ['enfermeiro', 'admin'],
    'analista': ['analista', 'admin']
};
```

### **2. Verificação por Permissões Granulares**
```javascript
// Verifica se o usuário tem uma permissão específica
temPermissao('gerenciar_produtos')

// Verifica se o usuário tem permissão em um módulo
temPermissaoPorModulo('produtos')
```

## 🛠️ **Soluções para o Problema de Acesso**

### **Opção 1: Usar Apenas Tipo de Usuário (Recomendado para Início)**

Se você não tem permissões configuradas no banco, use apenas o tipo de usuário:

```javascript
// No App.js, use apenas tipoPainel
<Route 
    path="/admin" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute tipoPainel="admin">
                    <AdminPanel />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>
```

### **Opção 2: Configurar Permissões no Banco**

Se quiser usar permissões granulares, configure no banco:

```sql
-- Exemplo de inserção de permissões
INSERT INTO painel_permissao (usuario_id, filial_id, nome, modulo, ativo) VALUES
(1, 1, 'acesso_admin', 'sistema', true),
(1, 1, 'gerenciar_produtos', 'produtos', true),
(1, 1, 'gerenciar_usuarios', 'usuarios', true);
```

## 📊 **Estrutura de Dados Esperada**

### **Tabela PainelPermissao:**
```sql
CREATE TABLE painel_permissao (
    id BIGINT PRIMARY KEY,
    usuario_id BIGINT,
    filial_id BIGINT,
    nome VARCHAR(100),        -- Ex: 'gerenciar_produtos'
    modulo VARCHAR(50),       -- Ex: 'produtos'
    ativo BOOLEAN,            -- true/false
    descricao TEXT,           -- Descrição da permissão
    data_criacao TIMESTAMP,
    data_atualizacao TIMESTAMP
);
```

### **Exemplos de Permissões:**
```javascript
// Permissões de Acesso a Painéis
{
    nome: 'acesso_admin',
    modulo: 'sistema',
    ativo: true
}

// Permissões de Funcionalidades
{
    nome: 'gerenciar_produtos',
    modulo: 'produtos',
    ativo: true
}

{
    nome: 'visualizar_relatorios',
    modulo: 'relatorios',
    ativo: true
}
```

## 🔧 **Como Testar**

### **1. Acesse a Página de Debug:**
```
http://localhost:3000/exemplo-permissoes
```

### **2. Verifique as Informações:**
- Tipo de usuário
- Filial selecionada
- Permissões disponíveis
- Testes de acesso

### **3. Configure as Permissões:**
Baseado no que aparece no debug, configure as permissões necessárias no banco.

## 🎯 **Fluxo Recomendado**

### **Passo 1: Teste com Tipo de Usuário**
1. Acesse `/exemplo-permissoes`
2. Verifique se o tipo de usuário está correto
3. Teste o acesso aos painéis

### **Passo 2: Configure Permissões Granulares (Opcional)**
1. Adicione permissões no banco de dados
2. Use o componente de debug para verificar
3. Configure as rotas com permissões específicas

## 🚨 **Solução Rápida**

Se você só quer que funcione agora, **remova as verificações de permissão** e use apenas o tipo de usuário:

```javascript
// Em vez de:
<PermissaoRoute tipoPainel="admin" permissao="gerenciar_produtos">

// Use apenas:
<PermissaoRoute tipoPainel="admin">
```

## 📞 **Suporte**

Se ainda tiver problemas:
1. Acesse `/exemplo-permissoes`
2. Tire um print do componente de debug
3. Compartilhe as informações para análise 