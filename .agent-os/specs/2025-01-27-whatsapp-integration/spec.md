# Spec: WhatsApp Business API Integration

## Visão Geral

Implementar a integração completa com WhatsApp Business API para criar um agente automatizado que responde aos clientes sobre cardápio, preços e disponibilidade de produtos em até 3 segundos.

## Objetivos

- [ ] Configuração da WhatsApp Business API
- [ ] Sistema de webhooks para receber mensagens
- [ ] Processamento de mensagens em linguagem natural
- [ ] Respostas automáticas baseadas no cardápio
- [ ] Sistema de logs de conversas
- [ ] Fallbacks para indisponibilidade da API
- [ ] Testes de integração completos

## Contexto

Esta é a funcionalidade core do produto. O agente WhatsApp deve substituir o atendimento manual, respondendo automaticamente sobre produtos, preços e disponibilidade, aumentando a conversão em 30% comparado ao atendimento manual.

## Requisitos Técnicos

### WhatsApp Business API
- **Configuração**: API oficial aprovada pelo Meta
- **Webhooks**: Recebimento de mensagens em tempo real
- **Rate Limiting**: Respeitar limites da API (1000 mensagens/dia)
- **Fallbacks**: Respostas padrão quando API indisponível

### Processamento de Mensagens
- **Entrada**: Mensagens de texto em português
- **Processamento**: IA/NLP (OpenAI GPT-4 ou Google Dialogflow)
- **Contexto**: Histórico das últimas 50 interações por cliente
- **Resposta**: Informações sobre produtos em até 3 segundos

### Funcionalidades do Agente
- **Boas-vindas**: Mensagem personalizada para novos clientes
- **Cardápio**: Lista de produtos disponíveis por categoria
- **Preços**: Consulta de preços específicos
- **Disponibilidade**: Status atual de produtos
- **Sugestões**: Produtos similares quando item indisponível

### Sistema de Logs
- **Armazenamento**: Últimas 50 interações por cliente
- **Estrutura**: timestamp, cliente, mensagem, resposta, produto consultado
- **Análise**: Métricas de produtos mais consultados
- **Exportação**: Dados para análise externa

## Critérios de Aceitação

### CA-01: Recebimento de Mensagens
**Dado** que um cliente envia mensagem no WhatsApp
**Quando** o webhook é acionado
**Então** a mensagem deve ser processada em até 1 segundo
**E** armazenada no sistema de logs
**E** enviada para processamento de IA

### CA-02: Resposta Automática
**Dado** que uma mensagem foi processada
**Quando** o agente gera resposta
**Então** deve responder em até 3 segundos
**E** incluir informações precisas sobre produtos
**E** usar tom de voz configurado pelo estabelecimento

### CA-03: Processamento de Linguagem Natural
**Dado** que o cliente pergunta "tem hambúrguer?"
**Quando** a mensagem é processada
**Então** deve identificar intenção de consulta
**E** buscar produtos de hambúrguer disponíveis
**E** responder com lista formatada e preços

### CA-04: Fallbacks e Tratamento de Erros
**Dado** que a API WhatsApp está indisponível
**Quando** o sistema tenta enviar mensagem
**Então** deve usar sistema de fallback
**E** armazenar mensagem para envio posterior
**E** notificar administrador sobre o problema

## Estrutura de Arquivos

```
src/
├── modules/
│   ├── whatsapp/
│   │   ├── dto/
│   │   │   ├── whatsapp-message.dto.ts
│   │   │   ├── whatsapp-response.dto.ts
│   │   │   └── webhook-payload.dto.ts
│   │   ├── entities/
│   │   │   ├── conversation-log.entity.ts
│   │   │   └── message-template.entity.ts
│   │   ├── whatsapp.controller.ts
│   │   ├── whatsapp.service.ts
│   │   ├── whatsapp.module.ts
│   │   └── webhook.service.ts
│   ├── ai/
│   │   ├── services/
│   │   │   ├── openai.service.ts
│   │   │   └── dialogflow.service.ts
│   │   ├── prompts/
│   │   │   ├── product-query.prompt.ts
│   │   │   └── welcome-message.prompt.ts
│   │   └── ai.module.ts
│   └── conversations/
│       ├── entities/
│       ├── services/
│       └── conversations.module.ts
└── common/
    ├── config/
    │   └── whatsapp.config.ts
    ├── guards/
    │   └── webhook-auth.guard.ts
    └── interceptors/
        └── logging.interceptor.ts
```

## Dependências

- CRUD de produtos implementado
- Sistema de autenticação funcionando
- Banco de dados configurado
- Aprovação da WhatsApp Business API
- Chaves de API OpenAI/Google configuradas

## Riscos e Mitigações

### Risco: API WhatsApp indisponível
**Mitigação**: Sistema de fallback, filas de retry, notificações

### Risco: Rate limiting da API
**Mitigação**: Controle de taxa, cache de respostas, priorização

### Risco: Falha no processamento de IA
**Mitigação**: Respostas padrão, fallbacks inteligentes, monitoramento

### Risco: Privacidade de dados
**Mitigação**: Criptografia, conformidade LGPD, logs seguros

## Configurações de Ambiente

### WhatsApp Business API
```env
WHATSAPP_API_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### OpenAI/GPT-4
```env
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
```

### Google Dialogflow (Alternativa)
```env
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_EMAIL=your_client_email
```

## Estimativa de Esforço

- **Complexidade**: Alta (L)
- **Tempo Estimado**: 5-7 dias
- **Agente Responsável**: Agent Integration + Agent Backend
- **Dependências**: CRUD de produtos + Setup inicial
