# Spec: Painel Administrativo - Frontend

## Visão Geral

Desenvolver o painel administrativo completo em Next.js para gerenciar produtos, categorias, configurações do agente WhatsApp e visualizar métricas de atendimento do estabelecimento.

## Objetivos

- [ ] Sistema de autenticação com NextAuth.js
- [ ] Dashboard com métricas principais
- [ ] CRUD completo de produtos (UI)
- [ ] Gestão de categorias
- [ ] Configurações do agente WhatsApp
- [ ] Sistema de upload de imagens
- [ ] Interface responsiva para mobile e desktop
- [ ] Testes de componentes com React Testing Library

## Contexto

O painel administrativo é a interface principal para os proprietários de estabelecimentos gerenciarem seus produtos e configurarem o agente WhatsApp. Deve ser intuitivo, rápido e responsivo para uso em diferentes dispositivos.

## Requisitos Técnicos

### Autenticação e Segurança
- **NextAuth.js**: Login com email/senha e JWT
- **Proteção de Rotas**: Middleware para páginas protegidas
- **Sessões**: Gerenciamento de estado de autenticação
- **Logout**: Encerramento seguro de sessões

### Dashboard Principal
- **Métricas**: Número de interações WhatsApp, produtos mais consultados
- **Gráficos**: Visualização de dados com Chart.js ou Recharts
- **Cards**: Resumo de informações importantes
- **Atualizações**: Dados em tempo real ou com refresh automático

### Gestão de Produtos
- **Listagem**: Tabela com paginação, filtros e busca
- **Criação**: Formulário com validação e upload de imagem
- **Edição**: Modal ou página dedicada para modificações
- **Exclusão**: Confirmação antes de remover (soft delete)
- **Status**: Toggle para disponibilidade/indisponibilidade

### Gestão de Categorias
- **CRUD**: Criar, editar e remover categorias
- **Validação**: Nome único e obrigatório
- **Relacionamentos**: Produtos associados à categoria
- **Ordenação**: Drag & drop para reordenar

### Configurações do Agente
- **Mensagem de Boas-vindas**: Editor de texto rico
- **Tom de Voz**: Seleção de personalidade (formal, casual, amigável)
- **Respostas Padrão**: Templates para situações comuns
- **Horário de Funcionamento**: Configuração de disponibilidade
- **Fallbacks**: Mensagens quando IA não consegue responder

### Sistema de Upload
- **Imagens**: Suporte a JPG, PNG, WebP
- **Validação**: Tamanho máximo, dimensões mínimas
- **Preview**: Visualização antes de salvar
- **Otimização**: Compressão automática para web
- **Storage**: Integração com AWS S3 ou similar

## Critérios de Aceitação

### CA-01: Autenticação
**Dado** que o usuário acessa o painel
**Quando** não está autenticado
**Então** deve ser redirecionado para login
**E** após login válido, acessar dashboard
**E** sessão deve persistir entre navegações

### CA-02: Dashboard Responsivo
**Dado** que o usuário acessa o dashboard
**Quando** visualiza em diferentes dispositivos
**Então** interface deve se adaptar corretamente
**E** métricas devem ser legíveis em todas as telas
**E** navegação deve ser intuitiva em mobile

### CA-03: CRUD de Produtos
**Dado** que o usuário está no painel de produtos
**Quando** cria um novo produto
**Então** formulário deve validar dados obrigatórios
**E** imagem deve ser enviada com sucesso
**E** produto deve aparecer na lista imediatamente

### CA-04: Configurações do Agente
**Dado** que o usuário altera configurações
**Quando** salva as mudanças
**Então** configurações devem ser aplicadas imediatamente
**E** agente WhatsApp deve usar novas configurações
**E** mudanças devem ser persistidas no banco

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/          # Shadcn/ui components
│   ├── forms/       # Form components
│   ├── dashboard/   # Dashboard specific
│   ├── products/    # Product management
│   └── layout/      # Layout components
├── hooks/           # Custom hooks
├── lib/             # Utilities and configurations
├── types/           # TypeScript definitions
└── services/        # API services
```

## Dependências

- Backend com CRUD de produtos implementado
- Sistema de autenticação JWT funcionando
- Shadcn/ui configurado
- TailwindCSS configurado
- Sistema de upload de imagens configurado

## Riscos e Mitigações

### Risco: Performance com muitos produtos
**Mitigação**: Paginação, virtualização de listas, lazy loading

### Risco: Upload de imagens grandes
**Mitigação**: Compressão automática, validação de tamanho, progress bar

### Risco: Sincronização de dados
**Mitigação**: React Query para cache, websockets para atualizações em tempo real

### Risco: Responsividade em mobile
**Mitigação**: Design mobile-first, testes em diferentes dispositivos

## Configurações de Ambiente

### NextAuth.js
```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_API_URL=http://localhost:3001/api
```

### Upload de Imagens
```env
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3001/api/upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### API Backend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_TIMEOUT=10000
```

## Estimativa de Esforço

- **Complexidade**: Média (M)
- **Tempo Estimado**: 4-6 dias
- **Agente Responsável**: Agent Frontend
- **Dependências**: CRUD de produtos backend + Setup inicial
