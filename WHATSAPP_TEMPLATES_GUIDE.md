# 📱 Guia de Templates WhatsApp - AgentsFood

## 🎯 **Objetivo**
Este guia detalha como configurar e usar o sistema avançado de templates do WhatsApp Business API no AgentsFood.

## 📋 **Templates Implementados**

### 1. **Template de Boas-vindas**
- **Nome:** `agentsfood_welcome`
- **Categoria:** UTILITY
- **Status:** ✅ Auto-aprovado
- **Uso:** Primeira mensagem para novos clientes
- **Variáveis:** 
  - `{{1}}` - Nome do estabelecimento

### 2. **Apresentação do Menu**
- **Nome:** `agentsfood_menu_intro`
- **Categoria:** UTILITY
- **Status:** ✅ Auto-aprovado
- **Uso:** Mostrar cardápio resumido
- **Variáveis:**
  - `{{1}}` - Resumo do menu

### 3. **Detalhes do Produto**
- **Nome:** `agentsfood_product_info`
- **Categoria:** UTILITY
- **Status:** ✅ Auto-aprovado
- **Uso:** Informações específicas de produtos
- **Variáveis:**
  - `{{1}}` - Nome do produto
  - `{{2}}` - Descrição
  - `{{3}}` - Preço
  - `{{4}}` - Status de disponibilidade

### 4. **Auxílio para Pedidos**
- **Nome:** `agentsfood_order_help`
- **Categoria:** UTILITY
- **Status:** ✅ Auto-aprovado
- **Uso:** Instruções para fazer pedidos
- **Variáveis:**
  - `{{1}}` - Telefone do estabelecimento
  - `{{2}}` - Endereço do estabelecimento

### 5. **Promoção Especial**
- **Nome:** `agentsfood_promocao`
- **Categoria:** MARKETING
- **Status:** ⏳ Requer aprovação manual
- **Uso:** Campanhas de marketing
- **Variáveis:**
  - `{{1}}` - Descrição da promoção
  - `{{2}}` - Data de validade

### 6. **Confirmação de Pedido**
- **Nome:** `agentsfood_confirmacao`
- **Categoria:** UTILITY
- **Status:** ✅ Auto-aprovado
- **Uso:** Confirmar pedidos realizados
- **Variáveis:**
  - `{{1}}` - Número do pedido
  - `{{2}}` - Itens do pedido
  - `{{3}}` - Valor total
  - `{{4}}` - Tempo estimado
  - `{{5}}` - Endereço de entrega

## 🚀 **Como Configurar**

### **Passo 1: Preparar Ambiente**
```bash
cd backend
npm install
```

### **Passo 2: Configurar Variáveis de Ambiente**
```bash
# Adicionar no .env
WHATSAPP_BUSINESS_ACCOUNT_ID="sua_business_account_id"
WHATSAPP_TOKEN="seu_token_permanente"
```

### **Passo 3: Executar Script de Criação**
```bash
node scripts/create-whatsapp-templates.js
```

### **Passo 4: Verificar Status**
- Acesse Meta for Developers
- Vá para WhatsApp > Message Templates
- Verifique o status de cada template

## 🎛️ **Sistema Inteligente de Templates**

### **Detecção Automática**
O sistema detecta automaticamente qual template usar baseado no contexto:

```typescript
// Exemplos de detecção
"Olá, bem-vindo!" → agentsfood_welcome
"Mostrar cardápio" → agentsfood_menu_intro  
"Informações do X-Burger" → agentsfood_product_info
"Como fazer pedido?" → agentsfood_order_help
```

### **Fallback Inteligente**
1. **Conversa Ativa (< 24h):** Texto livre
2. **Nova Conversa:** Template obrigatório
3. **Erro:** Template genérico de boas-vindas

### **Cache e Performance**
- Templates são cacheados no Redis
- Variáveis são processadas dinamicamente
- Rate limiting específico para templates

## 📊 **Monitoramento e Analytics**

### **Métricas Disponíveis**
- Templates mais utilizados
- Taxa de entrega por template
- Conversões por template
- Erros de envio

### **Dashboard de Templates**
- Status de aprovação em tempo real
- Preview interativo
- Teste de templates
- Histórico de uso

## 🔧 **API Endpoints**

### **Listar Templates**
```bash
GET /api/whatsapp/templates
Authorization: Bearer {token}
```

### **Criar Template**
```bash
POST /api/whatsapp/templates
{
  "name": "novo_template",
  "category": "UTILITY",
  "components": {...}
}
```

### **Testar Template**
```bash
POST /api/whatsapp/templates/test
{
  "templateName": "agentsfood_welcome",
  "phoneNumber": "5511999999999",
  "variables": ["AgentsFood"]
}
```

### **Enviar Mensagem com Template**
```bash
POST /api/whatsapp/send-template
{
  "to": "5511999999999",
  "templateName": "agentsfood_welcome",
  "variables": ["Meu Restaurante"]
}
```

## 🛠️ **Personalização**

### **Criar Novos Templates**

1. **Definir Estrutura**
```typescript
const novoTemplate = {
  name: 'meu_template',
  category: 'UTILITY',
  language: 'pt_BR',
  components: [{
    type: 'BODY',
    text: 'Meu texto com {{1}} variável'
  }]
};
```

2. **Registrar no Meta**
```bash
# Adicionar ao script create-whatsapp-templates.js
const templates = {
  // ... outros templates
  meu_template: novoTemplate
};
```

3. **Implementar Lógica**
```typescript
// No WhatsAppService
private detectTemplateType(message: string) {
  if (message.includes('minha_palavra_chave')) {
    return { 
      name: 'meu_template', 
      variables: ['valor_da_variavel'] 
    };
  }
}
```

## 📱 **Boas Práticas**

### **Design de Templates**
- ✅ Máximo 1024 caracteres
- ✅ Use emojis para visual atrativo
- ✅ Variáveis específicas e descritivas
- ✅ Call-to-action claros
- ❌ Evite CAPS LOCK excessivo
- ❌ Não use links externos em UTILITY

### **Categorização**
- **UTILITY:** Notificações, confirmações, informações
- **MARKETING:** Promoções, ofertas, campanhas
- **AUTHENTICATION:** Códigos de verificação apenas

### **Aprovação**
- **UTILITY:** Aprovação automática (mais rápida)
- **MARKETING:** Revisão manual (até 24h)
- **Rejeições:** Comum por conteúdo promocional em UTILITY

## 🚨 **Troubleshooting**

### **Problemas Comuns**

1. **Template Rejeitado**
   - Verifique categoria correta
   - Evite conteúdo promocional em UTILITY
   - Revise texto por compliance

2. **Variável Não Substitui**
   - Confirme formato `{{1}}`, `{{2}}`, etc.
   - Verifique se número de variáveis está correto
   - Teste com valores de exemplo

3. **Erro de Envio**
   - Confirme status APPROVED
   - Verifique token e permissions
   - Valide número de telefone

4. **Rate Limit**
   - Respeite limite de 250 templates/dia
   - Use cache para otimizar
   - Implemente retry com backoff

### **Logs Úteis**
```bash
# Ver logs do WhatsApp
docker-compose logs -f backend | grep -i whatsapp

# Ver status dos templates
curl -H "Authorization: Bearer TOKEN" \
  https://graph.facebook.com/v18.0/BUSINESS_ACCOUNT_ID/message_templates
```

## 🎉 **Resultado Final**

Após implementação completa:
- ✅ 6+ templates personalizados
- ✅ Sistema inteligente de detecção
- ✅ Interface de gerenciamento
- ✅ Fallback automático
- ✅ Monitoramento em tempo real
- ✅ Performance otimizada

---

**📞 Suporte:** Para dúvidas, consulte a documentação do Meta for Developers ou logs do sistema.