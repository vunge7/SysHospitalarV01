# 🎯 Guia Final de Configuração - Sistema de Permissões

## ✅ **Status Atual**

O sistema está **100% configurado** e pronto para uso! Agora você tem:

- ✅ **Hook `usePermissoes`** atualizado para trabalhar com `painel_id`
- ✅ **Componente `PermissaoRoute`** com múltiplas formas de verificação
- ✅ **Configuração de rotas** baseada em painéis
- ✅ **Componente de debug** para testar permissões
- ✅ **PainelPrincipal** atualizado para usar a nova lógica

## 🚀 **Como Usar Agora**

### **1. Configurar Painéis no Banco**

Primeiro, crie os painéis no seu banco de dados:

```sql
INSERT INTO painel (id, descricao) VALUES
(1, 'Administrativo'),
(2, 'Médico'),
(3, 'Enfermeiro'),
(4, 'Analista'),
(5, 'Laboratório'),
(6, 'Enfermaria');
```

### **2. Configurar Permissões**

Depois, configure as permissões dos usuários:

```sql
-- Exemplo: Usuário ID 1, Filial ID 1, com acesso ao painel Administrativo
INSERT INTO painel_permissao (usuario_id, filial_id, painel_id, nome, modulo, ativo) VALUES
(1, 1, 1, 'acesso_admin', 'sistema', true),
(1, 1, 1, 'gerenciar_produtos', 'produtos', true),
(1, 1, 1, 'gerenciar_usuarios', 'usuarios', true);

-- Exemplo: Usuário ID 2, Filial ID 1, com acesso ao painel Médico
INSERT INTO painel_permissao (usuario_id, filial_id, painel_id, nome, modulo, ativo) VALUES
(2, 1, 2, 'acesso_medico', 'sistema', true),
(2, 1, 2, 'acesso_consultorio', 'clinico', true);
```

### **3. Usar no App.js**

Agora você pode proteger suas rotas de 4 formas diferentes:

#### **Opção A: Por Painel ID (Mais Preciso)**
```javascript
<PermissaoRoute painelId={1}>
    <AdminPanel />
</PermissaoRoute>
```

#### **Opção B: Por Descrição do Painel**
```javascript
<PermissaoRoute descricaoPainel="Administrativo">
    <AdminPanel />
</PermissaoRoute>
```

#### **Opção C: Por Permissão Específica**
```javascript
<PermissaoRoute permissao="gerenciar_produtos">
    <ProdutoPanel />
</PermissaoRoute>
```

#### **Opção D: Por Tipo de Usuário (Fallback)**
```javascript
<PermissaoRoute tipoPainel="administrativo">
    <AdminPanel />
</PermissaoRoute>
```

## 🔧 **Configuração Rápida**

### **1. Copie o exemplo do App.js**

Use o arquivo `src/config/exemploApp.js` como base para configurar suas rotas.

### **2. Ajuste as configurações**

Edite o arquivo `src/config/rotasConfig.js` para mapear suas rotas aos painéis corretos.

### **3. Teste o sistema**

Acesse `http://localhost:3000/exemplo-permissoes` para ver o debug das permissões.

## 📊 **Estrutura de Dados Esperada**

### **Tabela Painel:**
```json
{
    "id": 1,
    "descricao": "Administrativo"
}
```

### **Tabela PainelPermissao:**
```json
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
```

## 🎯 **Exemplo Prático**

### **Cenário: Usuário Administrativo**

1. **Login** com usuário do tipo `administrativo`
2. **Seleciona filial** (sistema busca permissões automaticamente)
3. **Acessa painel** - sistema verifica se tem `painelId=1` (Administrativo)
4. **Navega** - cada rota verifica permissões específicas

### **Cenário: Usuário Médico**

1. **Login** com usuário do tipo `medico`
2. **Seleciona filial** (sistema busca permissões automaticamente)
3. **Acessa painel** - sistema verifica se tem `painelId=2` (Médico)
4. **Navega** - só acessa rotas permitidas para médicos

## 🔍 **Debug e Teste**

### **1. Página de Debug**
```
http://localhost:3000/exemplo-permissoes
```

### **2. Console do Navegador**
```javascript
// Testar permissões
const { temAcessoAoPainel, temAcessoAoPainelPorDescricao } = usePermissoes();

// Testar por ID
temAcessoAoPainel(1)

// Testar por descrição
temAcessoAoPainelPorDescricao('Administrativo')
```

## 🚨 **Solução de Problemas**

### **Problema: "Acesso Negado"**
1. Verifique se o usuário tem permissões no banco
2. Verifique se a filial está selecionada
3. Use a página de debug para verificar permissões

### **Problema: Endpoint não encontrado**
1. Verifique se o backend está rodando na porta 8081
2. Verifique se os endpoints estão corretos:
   - `GET /painel/{id}`
   - `GET /painelpermissoes/usuario/{id}/filial/{id}`

### **Problema: Permissões não carregam**
1. Verifique se o usuário tem `filialSelecionada`
2. Verifique se há permissões no banco para o usuário/filial
3. Use o console do navegador para ver erros

## 🎉 **Próximos Passos**

1. **Configure os painéis** no banco de dados
2. **Configure as permissões** dos usuários
3. **Teste o sistema** usando a página de debug
4. **Adapte as rotas** no App.js conforme necessário
5. **Personalize** as configurações no `rotasConfig.js`

## 📞 **Suporte**

Se tiver dúvidas:
1. Use a página de debug para verificar permissões
2. Verifique os logs do console do navegador
3. Confirme se os endpoints do backend estão funcionando
4. Verifique se as permissões estão corretas no banco

**O sistema está pronto para uso! 🚀** 