# Spec: Sistema de IA/NLP para Processamento de Mensagens

## Visão Geral

Implementar um sistema inteligente de processamento de linguagem natural que analisa mensagens do WhatsApp e gera respostas contextuais sobre produtos, preços e disponibilidade, utilizando OpenAI GPT-4 ou Google Dialogflow como fallback.

## Objetivos

- [ ] Sistema de prompts inteligentes para GPT-4
- [ ] Processamento de intenções do usuário
- [ ] Geração de respostas contextuais
- [ ] Sistema de fallbacks para falhas de IA
- [ ] Cache de respostas para performance
- [ ] Análise de sentimento das mensagens
- [ ] Aprendizado contínuo com feedback

## Contexto

O sistema de IA/NLP é o cérebro do agente WhatsApp, responsável por entender o que o cliente quer e gerar respostas úteis e contextuais. Deve funcionar mesmo quando a IA externa falha, garantindo que o cliente sempre receba uma resposta útil.

## Requisitos Técnicos

### Processamento de Linguagem Natural
- **Entrada**: Mensagens em português brasileiro
- **Análise**: Identificação de intenções e entidades
- **Contexto**: Histórico das últimas 50 interações
- **Saída**: Respostas estruturadas e contextuais

### Intenções Identificadas
- **Consulta de Cardápio**: "mostre o cardápio", "o que vocês têm?"
- **Consulta de Preço**: "quanto custa o hambúrguer?", "preço da pizza"
- **Consulta de Disponibilidade**: "tem hambúrguer?", "está disponível?"
- **Solicitação de Sugestões**: "o que você recomenda?", "qual é bom?"
- **Reclamações**: "demorou muito", "não gostei"
- **Elogios**: "muito bom", "delicioso"

### Sistema de Prompts
- **Prompt Base**: Contexto do estabelecimento e produtos
- **Prompt de Produto**: Informações específicas sobre item
- **Prompt de Categoria**: Lista de produtos por categoria
- **Prompt de Sugestão**: Recomendações personalizadas
- **Prompt de Fallback**: Respostas quando IA falha

### Respostas Contextuais
- **Formatação**: Emojis, formatação WhatsApp, estrutura clara
- **Personalização**: Tom de voz configurado pelo estabelecimento
- **Relevância**: Baseada no histórico de conversas
- **Ação**: Sempre incluir próximo passo ou pergunta

### Sistema de Cache
- **Redis**: Cache de respostas frequentes
- **TTL**: Tempo de vida configurável por tipo de resposta
- **Invalidação**: Cache limpo quando produtos mudam
- **Fallback**: Respostas padrão quando cache vazio

## Critérios de Aceitação

### CA-01: Processamento de Intenções
**Dado** que o cliente envia "quanto custa o X-Burger?"
**Quando** a mensagem é processada pela IA
**Então** deve identificar intenção de consulta de preço
**E** extrair entidade "X-Burger"
**E** gerar resposta com preço e descrição

### CA-02: Respostas Contextuais
**Dado** que o cliente pergunta sobre hambúrgueres
**Quando** a IA gera resposta
**Então** deve incluir lista de hambúrgueres disponíveis
**E** preços atualizados
**E** sugestão de próximo passo

### CA-03: Sistema de Fallbacks
**Dado** que a API OpenAI está indisponível
**Quando** o sistema tenta processar mensagem
**Então** deve usar sistema de fallbacks
**E** gerar resposta baseada em templates
**E** notificar sobre problema técnico

### CA-04: Performance e Cache
**Dado** que o cliente pergunta sobre cardápio
**Quando** é a segunda vez na mesma sessão
**Então** resposta deve vir do cache
**E** tempo de resposta deve ser < 1 segundo
**E** dados devem estar atualizados

## Estrutura de Arquivos

```
src/
├── modules/
│   ├── ai/
│   │   ├── services/
│   │   │   ├── openai.service.ts
│   │   │   ├── dialogflow.service.ts
│   │   │   ├── nlp-processor.service.ts
│   │   │   └── fallback.service.ts
│   │   ├── prompts/
│   │   │   ├── base.prompt.ts
│   │   │   ├── product-query.prompt.ts
│   │   │   ├── category-query.prompt.ts
│   │   │   ├── suggestion.prompt.ts
│   │   │   └── fallback.prompt.ts
│   │   ├── models/
│   │   │   ├── message-intent.model.ts
│   │   │   ├── user-context.model.ts
│   │   │   └── response-template.model.ts
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   └── ai.module.ts
│   ├── cache/
│   │   ├── services/
│   │   │   ├── response-cache.service.ts
│   │   │   └── context-cache.service.ts
│   │   └── cache.module.ts
│   └── analytics/
│       ├── services/
│       │   ├── sentiment-analysis.service.ts
│       │   └── conversation-analytics.service.ts
│       └── analytics.module.ts
└── common/
    ├── config/
    │   └── ai.config.ts
    ├── decorators/
    │   └── cache.decorator.ts
    └── interceptors/
        └── ai-logging.interceptor.ts
```

## Dependências

- Sistema de produtos implementado
- WhatsApp integration funcionando
- Redis configurado para cache
- Chaves de API OpenAI/Google configuradas
- Sistema de logs de conversas implementado

## Riscos e Mitigações

### Risco: API OpenAI indisponível
**Mitigação**: Sistema de fallbacks robusto, Google Dialogflow como backup

### Risco: Respostas incorretas da IA
**Mitigação**: Validação de respostas, templates de fallback, monitoramento

### Risco: Alto custo de tokens
**Mitigação**: Cache inteligente, prompts otimizados, rate limiting

### Risco: Privacidade de dados
**Mitigação**: Anonimização de dados, conformidade LGPD, logs seguros

## Configurações de Ambiente

### OpenAI GPT-4
```env
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
OPENAI_FREQUENCY_PENALTY=0.1
OPENAI_PRESENCE_PENALTY=0.1
```

### Google Dialogflow (Fallback)
```env
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_EMAIL=your_client_email
```

### Cache Redis
```env
REDIS_CACHE_TTL=3600
REDIS_CONTEXT_TTL=1800
REDIS_MAX_MEMORY=100mb
```

### Configurações de IA
```env
AI_FALLBACK_ENABLED=true
AI_CACHE_ENABLED=true
AI_SENTIMENT_ANALYSIS=true
AI_LEARNING_ENABLED=true
```

## Exemplos de Prompts

### Prompt Base
```
Você é um assistente virtual de uma lanchonete chamada "Sabor & Arte". 
Seu objetivo é ajudar clientes a conhecerem nosso cardápio e fazerem pedidos.

Regras importantes:
1. Sempre seja educado e prestativo
2. Use emojis para tornar as respostas mais amigáveis
3. Sempre sugira próximos passos
4. Se não souber algo, seja honesto e sugira falar com atendente humano

Cardápio atual: {PRODUCTS_LIST}
```

### Prompt de Consulta de Produto
```
Cliente pergunta: "{USER_MESSAGE}"

Contexto: {CONVERSATION_HISTORY}

Baseado no cardápio disponível, responda de forma útil e contextual.
Se o produto não existir, sugira alternativas similares.
```

## Estimativa de Esforço

- **Complexidade**: Alta (L)
- **Tempo Estimado**: 6-8 dias
- **Agente Responsável**: Agent Integration + Agent Backend
- **Dependências**: WhatsApp integration + CRUD de produtos
