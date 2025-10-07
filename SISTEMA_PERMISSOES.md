# Sistema de Permissões e Filiais

## Visão Geral

Este sistema implementa um controle completo de permissões baseado em filiais, onde cada usuário pode ter diferentes permissões em diferentes filiais.

## Fluxo do Sistema

1. **Login**: Usuário faz login com username e password
2. **Seleção de Filial**: Após login, usuário é redirecionado para selecionar uma filial
3. **Verificação de Permissões**: Sistema verifica permissões do usuário na filial selecionada
4. **Acesso ao Sistema**: Usuário acessa apenas funcionalidades para as quais tem permissão

## Componentes Principais

### 1. SelecionarFilial (`src/pages/SelecionarFilial/index.js`)
- Página para seleção de filial após login
- Mostra todas as filiais que o usuário tem permissão para acessar
- Exibe permissões disponíveis em cada filial

### 2. usePermissoes (`src/hooks/usePermissoes.js`)
Hook personalizado para gerenciar permissões:

```javascript
const { 
    permissoes, 
    loading, 
    error, 
    temPermissao, 
    temPermissaoPorModulo,
    getPermissoesPorModulo,
    temAcessoAoPainel 
} = usePermissoes();
```

### 3. PermissaoRoute (`src/components/PermissaoRoute.js`)
Componente para proteger rotas baseado em permissões:

```javascript
<PermissaoRoute permissao="gerenciar_produtos">
    <ComponenteProtegido />
</PermissaoRoute>
```

### 4. TrocarFilial (`src/components/TrocarFilial.js`)
Componente para permitir troca de filial durante a sessão.

## Como Usar

### 1. Proteger uma Rota

```javascript
<Route 
    path="/minha-rota" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute permissao="minha_permissao">
                    <MeuComponente />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>
```

### 2. Verificar Permissões em Componentes

```javascript
import { usePermissoes } from '../hooks/usePermissoes';

const MeuComponente = () => {
    const { temPermissao, temPermissaoPorModulo } = usePermissoes();

    return (
        <div>
            {temPermissao('gerenciar_produtos') && (
                <Button>Gerenciar Produtos</Button>
            )}
            
            {temPermissaoPorModulo('financeiro') && (
                <Button>Módulo Financeiro</Button>
            )}
        </div>
    );
};
```

### 3. Adicionar Botão de Trocar Filial

```javascript
import TrocarFilial from '../components/TrocarFilial';

const MeuHeader = () => {
    return (
        <div>
            <h1>Meu Sistema</h1>
            <TrocarFilial />
        </div>
    );
};
```

## Estrutura de Dados Esperada

### Resposta da API - Filiais do Usuário
```javascript
GET /api/filial/usuario-permissoes?usuarioId=123

[
    {
        id: 1,
        nome: "Filial Centro",
        endereco: "Rua A, 123",
        telefone: "(11) 1234-5678",
        permissoes: [
            {
                id: 1,
                nome: "gerenciar_produtos",
                modulo: "produtos",
                ativo: true
            },
            {
                id: 2,
                nome: "visualizar_relatorios",
                modulo: "relatorios",
                ativo: true
            }
        ]
    }
]
```

### Resposta da API - Permissões do Usuário na Filial
```javascript
GET /api/painel-permissao/usuario-filial?usuarioId=123&filialId=1

[
    {
        id: 1,
        nome: "gerenciar_produtos",
        modulo: "produtos",
        ativo: true,
        descricao: "Permite gerenciar produtos"
    },
    {
        id: 2,
        nome: "visualizar_relatorios",
        modulo: "relatorios",
        ativo: true,
        descricao: "Permite visualizar relatórios"
    }
]
```

## Tipos de Verificação de Permissão

### 1. Permissão Específica
```javascript
temPermissao('gerenciar_produtos') // true/false
```

### 2. Permissão por Módulo
```javascript
temPermissaoPorModulo('produtos') // true/false
```

### 3. Acesso ao Painel
```javascript
temAcessoAoPainel('administrativo') // true/false
```

### 4. Listar Permissões por Módulo
```javascript
getPermissoesPorModulo('produtos') // array de permissões
```

## Configuração de Rotas

### Rotas Públicas
```javascript
<Route path="/" element={<Login />} />
<Route path="/login" element={<Login />} />
```

### Rotas Protegidas
```javascript
<Route 
    path="/admin" 
    element={
        <Private>
            <RequireFilial>
                <PermissaoRoute tipoPainel="administrativo">
                    <PainelAdmin />
                </PermissaoRoute>
            </RequireFilial>
        </Private>
    } 
/>
```

## Tratamento de Erros

O sistema inclui tratamento para:
- Usuário sem filial selecionada
- Usuário sem permissões
- Erro ao carregar permissões
- Filial não encontrada

## Exemplo de Uso Completo

Veja o componente `ExemploUsoPermissoes` em `src/components/ExemploUsoPermissoes.js` para um exemplo completo de como usar todas as funcionalidades do sistema.

## Endpoints da API Necessários

1. `GET /api/filial/usuario-permissoes` - Listar filiais do usuário
2. `GET /api/painel-permissao/usuario-filial` - Listar permissões do usuário na filial
3. `POST /api/auth/login` - Login do usuário

## Notas Importantes

- O sistema verifica automaticamente se o usuário tem filial selecionada
- Permissões são carregadas automaticamente quando o usuário seleciona uma filial
- O contexto de autenticação mantém a filial selecionada
- Todas as rotas protegidas requerem filial selecionada 