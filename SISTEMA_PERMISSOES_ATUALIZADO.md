# 🔐 Sistema de Permissões Atualizado - Baseado em Painéis

## 📋 **Nova Estrutura**

O sistema agora funciona com **3 camadas** de verificação:

1. **Painéis** (baseado na entidade `Painel` com `id` e `descricao`)
2. **Permissões Granulares** (baseadas na tabela `PainelPermissao` com `painel_id`)
3. **Tipo de Usuário** (fallback baseado no campo `tipo` do usuário)

## 🏗️ **Estrutura do Banco de Dados**

### **Tabela Painel:**
```sql
CREATE TABLE painel (
    id BIGINT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL
    -- outros campos que você tenha
);
```

### **Tabela PainelPermissao:**
```sql
CREATE TABLE painel_permissao (
    id BIGINT PRIMARY KEY,
    usuario_id BIGINT,
    filial_id BIGINT,
    painel_id BIGINT,        -- 🔑 Referência à tabela Painel
    nome VARCHAR(100),        -- Ex: 'gerenciar_produtos'
    modulo VARCHAR(50),       -- Ex: 'produtos'
    ativo BOOLEAN,            -- true/false
    descricao TEXT,           -- Descrição da permissão
    data_criacao TIMESTAMP,
    data_atualizacao TIMESTAMP,
    FOREIGN KEY (painel_id) REFERENCES painel(id)
);
```

## 🎯 **Como Usar o Sistema**

### **1. Verificação por Painel ID:**
```javascript
<PermissaoRoute painelId={1}>
    <AdminPanel />
</PermissaoRoute>
```

### **2. Verificação por Descrição do Painel:**
```javascript
<PermissaoRoute descricaoPainel="Administrativo">
    <AdminPanel />
</PermissaoRoute>
```

### **3. Verificação por Permissão Específica:**
```javascript
<PermissaoRoute permissao="gerenciar_produtos">
    <ProdutoPanel />
</PermissaoRoute>
```

### **4. Verificação por Tipo de Usuário (Fallback):**
```javascript
<PermissaoRoute tipoPainel="admin">
    <AdminPanel />
</PermissaoRoute>
```

## 🔧 **Endpoints Necessários**

### **1. Buscar Painel por ID:**
```javascript
GET /painel/{id}
```

**Resposta esperada:**
```json
{
    "id": 1,
    "descricao": "Administrativo"
}
```

### **2. Buscar Permissões do Usuário na Filial:**
```javascript
GET /painelpermissoes/usuario/{usuarioId}/filial/{filialId}
```

**Resposta esperada:**
```json
[
    {
        "id": 1,
        "usuarioId": 1,
        "filialId": 1,
        "painelId": 1,
        "nome": "gerenciar_produtos",
        "modulo": "produtos",
        "ativo": true,
        "descricao": "Gerenciar produtos"
    }
]
```

## 🛠️ **Configuração Inicial**

### **1. Criar Painéis no Banco:**
```sql
INSERT INTO painel (id, descricao) VALUES
(1, 'Administrativo'),
(2, 'Médico'),
(3, 'Enfermeiro'),
(4, 'Analista'),
(5, 'Laboratório'),
(6, 'Enfermaria');
```

### **2. Criar Permissões:**
```sql
INSERT INTO painel_permissao (usuario_id, filial_id, painel_id, nome, modulo, ativo) VALUES
(1, 1, 1, 'acesso_admin', 'sistema', true),
(1, 1, 1, 'gerenciar_produtos', 'produtos', true),
(1, 1, 2, 'acesso_medico', 'sistema', true);
```

## 📊 **Exemplo de Uso no App.js**

```javascript
// Proteger rota por painel ID
<Route 
    path="/admin" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute painelId={1}>
                    <AdminPanel />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>

// Proteger rota por descrição do painel
<Route 
    path="/medico/home" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute descricaoPainel="Médico">
                    <MedicoPanel />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>

// Proteger rota por permissão específica
<Route 
    path="/artigo" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute permissao="gerenciar_produtos">
                    <ProdutoPanel />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>
```

## 🔍 **Debug e Teste**

### **1. Acesse a Página de Debug:**
```
http://localhost:3000/exemplo-permissoes
```

### **2. Verifique:**
- Permissões disponíveis
- Painéis disponíveis
- IDs dos painéis
- Status das permissões

### **3. Teste as Verificações:**
```javascript
// No console do navegador
const { temAcessoAoPainel, temAcessoAoPainelPorDescricao } = usePermissoes();

// Testar por ID
temAcessoAoPainel(1)

// Testar por descrição
temAcessoAoPainelPorDescricao('Administrativo')
```

## 🚨 **Solução Rápida**

Se você não tem o endpoint `/painel/{id}`, use apenas o tipo de usuário:

```javascript
// Em vez de:
<PermissaoRoute painelId={1}>

// Use:
<PermissaoRoute tipoPainel="admin">
```

## 📞 **Próximos Passos**

1. **Implemente o endpoint** `GET /painel/{id}` no seu backend
2. **Configure os painéis** no banco de dados
3. **Configure as permissões** com os `painel_id` corretos
4. **Teste o sistema** usando a página de debug

## 🎯 **Vantagens da Nova Estrutura**

- ✅ **Flexibilidade**: Permite múltiplas formas de verificação
- ✅ **Granularidade**: Controle fino por painel
- ✅ **Compatibilidade**: Mantém funcionalidades antigas
- ✅ **Escalabilidade**: Fácil adicionar novos painéis
- ✅ **Debug**: Visualização clara das permissões 