# AgentsFood - Informações para Claude Code

## 🔧 Status do Projeto

**✅ PROJETO FUNCIONANDO CORRETAMENTE - ATUALIZADO 25/08/2024**

Todos os componentes principais estão operacionais:
- ✅ Backend NestJS rodando na porta 3001
- ✅ Frontend Next.js rodando na porta 3000
- ✅ Banco PostgreSQL e Redis via Docker
- ✅ Autenticação JWT funcionando
- ✅ **CRUD de produtos totalmente funcional** (bug do categoryId corrigido)
- ✅ **Sistema de Agente IA Conversacional Avançado**
- ✅ **Contexto de conversa com memória e estado**
- ✅ **Sistema inteligente de pedidos com modificações**
- ✅ **Respostas dinâmicas baseadas na configuração**
- ✅ API endpoints documentados via Swagger
- ✅ Upload de imagens funcionando
- ✅ Sistema de validação robusto

**🚀 NOVA FUNCIONALIDADE IMPLEMENTADA:** Sistema de Agente IA Conversacional Avançado com Contexto e Inteligência Artificial

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ instalado

### Comandos de Execução

```bash
# 1. Subir infraestrutura (PostgreSQL + Redis)
docker-compose up -d postgres redis

# 2. Backend (terminal 1)
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

## 🔑 Credenciais de Acesso

### Usuário Admin
- **Email:** `admin@agentsfood.com`
- **Senha:** `admin123`

### Usuários de Teste Adicionais
- **Email:** `teste@agentsfood.com` - **Senha:** `123456`
- **Email:** `teste@exemplo.com` - **Senha:** `123456`
- **Email:** `teste@teste.com` - **Senha:** `123456`

## 🌐 URLs Importantes

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/health

## 🛠️ Comandos Úteis para Desenvolvimento

### Backend
```bash
# Rodar testes
npm test

# Gerar client Prisma
npm run prisma:generate

# Aplicar migrations
npm run prisma:migrate

# Popular banco com dados iniciais
npm run prisma:seed

# Ver dados no banco
npm run prisma:studio
```

### Frontend
```bash
# Build de produção
npm run build

# Verificar tipos TypeScript
npm run type-check

# Executar linting
npm run lint
```

### Docker
```bash
# Ver logs dos serviços
docker-compose logs -f backend
docker-compose logs -f postgres

# Acessar banco de dados
docker-compose exec postgres psql -U agentsfood -d agentsfood

# Parar todos os serviços
docker-compose down
```

## 🔧 Resolução de Problemas

### ❌ Problema: "Erro ao incluir produtos" (Erro 500 - Internal Server Error)
**✅ RESOLVIDO - 25/08/2024** - Era um problema de chave estrangeira:
- **Causa:** Campo `categoryId` sendo enviado como string vazia `""` quando nenhuma categoria selecionada
- **Erro:** `Foreign key constraint violated: products_categoryId_fkey (index)`
- **Solução Aplicada:**
  1. **Backend DTO:** Adicionado `@Transform(({ value }) => value === '' ? null : value)` no campo categoryId
  2. **Frontend Form:** Alterado inicialização de `''` para `undefined`
  3. **Frontend Submit:** Limpeza de dados antes de enviar (`categoryId: productData.categoryId || undefined`)

### ❌ Problema: "Credenciais incorretas" 
**✅ RESOLVIDO** - Usar credenciais corretas:
- Admin: `admin@agentsfood.com` / `admin123`
- Teste: `teste@exemplo.com` / `123456`

### ❌ Problema: "NEXTAUTH_URL incorreta"
**✅ RESOLVIDO** - Configuração corrigida para `http://localhost:3000`

### ❌ Problema: "Cannot POST /products"
**✅ RESOLVIDO** - A API usa prefixo `/api`, então a rota correta é `/api/products`

### ❌ Problema: "Unauthorized"
**✅ RESOLVIDO** - Necessário fazer login e usar o token JWT no header `Authorization: Bearer <token>`

## 🎯 Funcionalidades Implementadas

### ✅ Backend (NestJS + Prisma + PostgreSQL)
- [x] Autenticação JWT com Guards
- [x] CRUD completo de Produtos
- [x] CRUD de Categorias
- [x] Sistema de Upload de Imagens
- [x] **Sistema de Agente IA Conversacional Avançado**
- [x] **Contexto de conversa com memória persistente**
- [x] **Sistema de pedidos inteligente com modificações**
- [x] **Navegação inteligente por categorias**
- [x] **Respostas dinâmicas e variadas para naturalidade**
- [x] **Integração OpenAI com fallback inteligente**
- [x] Integração WhatsApp Business API
- [x] Sistema de Conversas
- [x] Documentação Swagger
- [x] Health Check endpoint

### ✅ Frontend (Next.js + Tailwind + Shadcn/ui)
- [x] Dashboard administrativo responsivo
- [x] Autenticação com NextAuth.js
- [x] Formulários de produtos com upload
- [x] **Interface completa para configurar agente conversacional**
- [x] **Sistema de teste com chat interativo em tempo real**
- [x] **Configuração avançada: tom, personalidade, funcionalidades**
- [x] **Sistema de contexto para manter histórico da conversa**
- [x] **Interface para visualizar pedidos e estado das conversas**
- [x] Listagem e gerenciamento de produtos
- [x] Componentes UI reutilizáveis

### ✅ Integração e Deploy
- [x] Docker Compose para desenvolvimento
- [x] Seed de dados iniciais
- [x] CORS configurado
- [x] Validation pipes
- [x] Error handling
- [x] Interceptors para transformação de dados

## 🔍 Como Testar a API Diretamente

```bash
# 1. Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agentsfood.com","password":"admin123"}'

# 2. Extrair o access_token da resposta e usar nos próximos requests

# 3. Listar produtos
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/api/products

# 4. Criar produto
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Novo Produto","description":"Descrição","price":25.90}'

# 5. Testar Agente IA
curl -X POST http://localhost:3001/api/agent/test-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"message":"Olá! Qual o cardápio de hoje?"}'

# 6. Buscar configuração do agente
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/api/agent/config

# 7. Atualizar configuração do agente
curl -X PUT http://localhost:3001/api/agent/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"welcomeMessage":"Olá! Seja bem-vindo!","tone":"friendly"}'
```

## 🤖 Sistema de Agente IA Conversacional Avançado

### ⭐ Recursos Implementados

**🧠 Inteligência Conversacional:**
- **Contexto de Conversa:** Mantém histórico e estado da conversa por cliente
- **Análise de Intenção:** Reconhece automaticamente saudações, pedidos, consultas
- **Memória Persistente:** Lembra preferências e pedidos anteriores
- **Estado da Conversa:** Gerencia fluxo (saudação → navegação → pedido → confirmação)

**🗣️ Respostas Naturais e Dinâmicas:**
- **Variações de Resposta:** Evita repetição com múltiplas variações para cada situação
- **Tom Configurável:** Amigável, profissional ou descontraído conforme configuração
- **Emojis Contextuais:** Uso inteligente de emojis para deixar conversa mais amigável
- **Respostas Adaptativas:** Baseadas no contexto atual da conversa

**🛒 Sistema Inteligente de Pedidos:**
- **Reconhecimento de Produtos:** Identifica produtos mencionados pelo cliente
- **Modificações de Pedido:** "sem cebola", "com batata extra", etc.
- **Carrinho Virtual:** Mantém pedidos em andamento durante a conversa
- **Cálculo Automático:** Soma valores e quantidades automaticamente

**📋 Navegação Inteligente:**
- **Categorias Primeiro:** Mostra categorias quando há muitas, produtos quando há poucas
- **Busca Flexível:** Entende nomes com ou sem acento, variações
- **Sugestões Contextuais:** Oferece próximos passos baseados na conversa

### 🚀 Como Testar o Sistema

#### Via Frontend (Recomendado)
1. **Acesso:** http://localhost:3000
2. **Login:** `admin@agentsfood.com` / `admin123`
3. **Navegue:** "Configurar Agente" no menu lateral

#### **Configuração do Agente:**
- 🏠 **Mensagem de Boas-vindas:** Personalizada por estabelecimento
- 🎭 **Tom de Voz:** Amigável/Profissional/Descontraído
- 📏 **Tamanho da Resposta:** Controle do tamanho máximo
- 🔧 **Prompt Personalizado:** Instruções específicas para o agente
- ⚙️ **Funcionalidades:** Habilitar/desabilitar preços, disponibilidade, etc.

#### **Teste Interativo:**
- 💬 **Chat em Tempo Real:** Lado direito da tela
- 📱 **Simula WhatsApp:** Interface similar ao app real
- 🔄 **Contexto Persistente:** Cada conversa mantém estado

### 🗣️ Conversas de Exemplo

#### **Fluxo Completo Natural:**
```
Cliente: "Oi, tudo bem?"
Agente: "Olá! Bem-vindo à Lanchonete da Dona Maria! 😊 Como posso ajudá-lo hoje? Gostaria de conhecer nosso cardápio? 📋"

Cliente: "Sim, qual o cardápio?"
Agente: "🍽️ **Cardápio Lanchonete da Dona Maria**
Escolha uma categoria:
1. **Lanches** (3 itens)
2. **Bebidas** (2 itens)  
3. **Batata Recheada** (2 itens)
Digite o número ou nome da categoria que deseja ver! 📋"

Cliente: "Quero um X-Burger sem cebola"
Agente: "✅ Adicionei **1x X-Burger** ao seu pedido!
Observações: sem cebola
Valor: R$ 15,90
Gostaria de adicionar mais alguma coisa? 🍽️"

Cliente: "Uma coca cola também"
Agente: "✅ Adicionei **1x Coca-Cola** ao seu pedido!
Valor: R$ 5,50
**Seu pedido atual:**
• X-Burger (sem cebola) - R$ 15,90
• Coca-Cola - R$ 5,50
**Total: R$ 21,40**
Mais alguma coisa? 😊"
```

#### **Mensagens de Teste Sugeridas:**
**Saudações:**
- "Oi!", "Olá!", "Bom dia!", "E aí!"

**Consultas de Menu:**
- "Cardápio", "Menu", "O que vocês têm?", "Quais lanches?"

**Pedidos:**
- "Quero um X-Burger", "Vou querer uma batata"
- "Um hambúrguer sem tomate", "2 coca-colas"

**Informações:**
- "Telefone", "Endereço", "Preços", "Como funciona?"

### 🔧 Arquitetura Técnica

#### **Estrutura de Dados:**
```typescript
// Contexto da Conversa
interface ConversationContext {
  state: 'greeting' | 'browsing_menu' | 'ordering' | 'confirming_order';
  currentCategory?: string;
  greetingShown: boolean;
  menuShown: boolean;
  lastInteractionTime: Date;
}

// Pedido Atual
interface CurrentOrder {
  items: OrderItem[];
  totalValue: number;
  notes?: string;
}

// Item do Pedido
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  modifications?: string[]; // "sem cebola", "com bacon extra"
  notes?: string;
}
```

#### **Serviços Implementados:**
- 🗣️ **EnhancedAgentService:** Lógica conversacional principal
- 💭 **ConversationService:** Gerencia contexto e estado
- 🔍 **Intent Analysis:** Análise de intenção das mensagens
- 📝 **Order Management:** Sistema de pedidos avançado

### 🎯 Diferenciais do Sistema

**Vs. Chatbots Tradicionais:**
- ❌ **Tradicional:** Respostas fixas e robóticas
- ✅ **AgentsFood:** Conversas naturais com contexto

**Vs. Sistemas Simples:**
- ❌ **Simples:** Apenas FAQ estático
- ✅ **AgentsFood:** Sistema completo de pedidos

**Integrações:**
- 🔗 **OpenAI:** Para respostas mais naturais (opcional)
- 🔄 **Fallback Inteligente:** Funciona sem internet/API
- 📱 **WhatsApp Ready:** Preparado para integração real

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `establishments` - Estabelecimentos/Restaurantes
- `products` - Produtos do cardápio
- `categories` - Categorias de produtos
- `agent_configs` - Configurações do chatbot
- `conversations` - Conversas do WhatsApp (com contexto e pedidos)
- `messages` - Mensagens das conversas

### Relacionamentos
- User 1:1 Establishment
- Establishment 1:N Products
- Establishment 1:N Categories
- Category 1:N Products
- Establishment 1:1 AgentConfig
- Establishment 1:N Conversations
- Conversation 1:N Messages

### 🆕 Novos Campos de Contexto (Conversations)
- `currentContext` (JSON): Estado atual da conversa (greeting, browsing_menu, ordering, etc.)
- `preferences` (JSON): Preferências do cliente e histórico
- `currentOrder` (JSON): Pedido em andamento com itens e modificações

## 🚀 Próximos Passos para Desenvolvimento

### Alta Prioridade
1. **Testes Automatizados**
   - Testes unitários dos services
   - Testes de integração da API
   - Testes E2E do frontend

2. **Sistema de Upload Melhorado**
   - Integração com AWS S3 ou similar
   - Redimensionamento de imagens
   - Validação de tipos de arquivo

3. **Configuração de Produção**
   - Dockerfile otimizado
   - CI/CD pipeline
   - Monitoramento e logs

### Média Prioridade
1. **Dashboard Avançado**
   - Métricas em tempo real
   - Gráficos de conversas
   - Relatórios de produtos mais consultados

2. **Sistema de Pedidos Avançado**
   - Finalização de pedidos com pagamento
   - Integração com sistemas de delivery
   - Histórico de pedidos dos clientes

### Baixa Prioridade
1. **Funcionalidades Avançadas**
   - Multi-estabelecimento
   - Sistema de permissões
   - Integrações com delivery

## 📚 Lições Aprendidas e Padrões de Debugging

### 🔍 Como Diagnosticar Erros 500 (Internal Server Error)

**Problema Típico:** Frontend mostra apenas "Internal server error" sem detalhes

**Estratégia de Debug:**
1. **Adicionar logs no backend** nos pontos críticos:
   - Controllers (entrada de dados)
   - Services (lógica de negócio) 
   - Decorators (extração de usuário)
   - Strategies (autenticação)

2. **Verificar logs do Prisma** - erros de banco são comum:
   - Constraints violadas (FK, unique, etc.)
   - Dados mal formatados
   - Campos obrigatórios faltando

3. **Comparar com requests diretos via curl**:
   - Se API funciona via curl mas falha no frontend = problema na integração
   - Se falha em ambos = problema no backend

4. **Validar dados no frontend antes de enviar**:
   - Strings vazias vs null/undefined
   - Tipos de dados (number vs string)
   - Campos obrigatórios

### 🛠️ Padrões de Correção Aplicados

**Para campos opcionais com FK:**
```typescript
// ❌ Problemático
categoryId: product?.categoryId || '',

// ✅ Correto
categoryId: product?.categoryId || undefined,

// ✅ Backend DTO com transformação
@Transform(({ value }) => value === '' ? null : value)
categoryId?: string;
```

**Para debugging temporário:**
```typescript
// Sempre remover depois de corrigir
console.log('DEBUG - dados:', dadosImportantes);
```

---

**Última atualização:** 25/08/2024  
**Status:** Sistema de Agente Conversacional Avançado implementado e funcional  
**Ambiente:** Desenvolvimento local com Docker  
**Novo Sistema:** Agente IA com contexto, pedidos inteligentes e respostas naturais  
**Próxima revisão:** Otimizar performance e adicionar métricas de conversação