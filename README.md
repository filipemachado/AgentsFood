# AgentsFood - Vitrine de Alimentos via WhatsApp

Sistema de atendimento automatizado via WhatsApp para estabelecimentos de alimentação, permitindo gestão de cardápio e respostas automáticas com IA.

## Arquitetura

### Backend
- **Framework**: NestJS com TypeScript
- **ORM**: Prisma ORM
- **Banco de Dados**: PostgreSQL + Redis
- **API**: RESTful com Swagger
- **Autenticação**: JWT com Guards do NestJS

### Frontend
- **Framework**: Next.js 14+ com TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Autenticação**: NextAuth.js
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod

### Integrações
- **WhatsApp**: WhatsApp Business API oficial
- **AI/NLP**: OpenAI GPT-4
- **Infraestrutura**: Docker

## Estrutura do Projeto

```
├── backend/           # API NestJS
├── frontend/          # Painel administrativo Next.js
├── docker/           # Configurações Docker
├── docs/             # Documentação
└── prd/              # Product Requirements Document
```

## Funcionalidades MVP

- Cadastro e gestão de produtos
- Painel administrativo responsivo
- Integração com WhatsApp Business API
- Agente IA para respostas automáticas
- Configuração do agente (mensagens, tom de voz)
- Logs de interações

## Getting Started

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute `docker-compose up`
4. Acesse o painel em `http://localhost:3000`

## Desenvolvimento

O projeto utiliza AgentOS para coordenação entre agentes especializados:
- Agent Backend: APIs e integrações
- Agent Frontend: Interface administrativa
- Agent DevOps: Infraestrutura e deploy
- Agent QA: Testes e qualidade
- Agent Integration: Integrações externas