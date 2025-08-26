# WhatsApp Integration Standards

## Context

Este guia define os padrões para integração com WhatsApp Business API no projeto "Vitrine de Alimentos via WhatsApp", garantindo consistência, qualidade e conformidade com as políticas da Meta.

## WhatsApp Business API Fundamentals

### API Configuration
- **Versão**: WhatsApp Business API v18.0+
- **Autenticação**: Bearer Token obrigatório
- **Rate Limiting**: 1000 mensagens/dia por número
- **Webhooks**: HTTPS obrigatório para produção
- **Timeout**: 30 segundos para respostas

### Webhook Security
```typescript
// ✅ Good - Verificação de webhook
@Post('webhook')
async handleWebhook(
  @Body() payload: WebhookPayload,
  @Headers('x-hub-signature-256') signature: string,
  @Headers('x-hub-signature') legacySignature: string
) {
  // Verificar assinatura do webhook
  if (!this.verifyWebhookSignature(payload, signature)) {
    throw new UnauthorizedException('Invalid webhook signature');
  }
  
  // Processar mensagem
  return this.processWebhookMessage(payload);
}
```

### Message Processing
```typescript
// ✅ Good - Processamento de mensagens
interface WhatsAppMessage {
  from: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio';
  text?: { body: string };
  image?: { id: string; mime_type: string };
  context?: { forwarded: boolean; frequently_forwarded: boolean };
}

// ✅ Good - Validação de entrada
async processMessage(message: WhatsAppMessage): Promise<void> {
  // Validar formato da mensagem
  if (!message.from || !message.timestamp) {
    this.logger.warn('Invalid message format', message);
    return;
  }
  
  // Verificar se é mensagem válida
  if (message.type !== 'text' || !message.text?.body) {
    await this.sendUnsupportedMessageResponse(message.from);
    return;
  }
  
  // Processar texto da mensagem
  await this.processTextMessage(message.from, message.text.body);
}
```

## Message Response Patterns

### Text Message Responses
```typescript
// ✅ Good - Resposta de texto formatada
async sendTextResponse(phoneNumber: string, message: string): Promise<void> {
  const response = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: {
      body: this.formatMessageForWhatsApp(message)
    }
  };
  
  await this.whatsAppApi.sendMessage(response);
}

// ✅ Good - Formatação para WhatsApp
private formatMessageForWhatsApp(message: string): string {
  return message
    .replace(/\*\*(.*?)\*\*/g, '*$1*')        // Bold -> Bold
    .replace(/__(.*?)__/g, '_$1_')            // Italic -> Italic
    .replace(/~~(.*?)~~/g, '~$1~')            // Strikethrough
    .replace(/\n\n/g, '\n')                   // Remove double line breaks
    .trim();
}
```

### Template Messages
```typescript
// ✅ Good - Mensagens de template
async sendWelcomeMessage(phoneNumber: string, customerName?: string): Promise<void> {
  const template = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: 'welcome_message',
      language: {
        code: 'pt_BR'
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: customerName || 'Cliente'
            }
          ]
        }
      ]
    }
  };
  
  await this.whatsAppApi.sendMessage(template);
}
```

### Interactive Messages
```typescript
// ✅ Good - Mensagem interativa com botões
async sendProductMenu(phoneNumber: string, categories: Category[]): Promise<void> {
  const response = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: {
        type: 'text',
        text: '🍽️ Nosso Cardápio'
      },
      body: {
        text: 'Escolha uma categoria para ver nossos produtos:'
      },
      action: {
        buttons: categories.slice(0, 3).map(category => ({
          type: 'reply',
          reply: {
            id: `category_${category.id}`,
            title: category.name
          }
        }))
      }
    }
  };
  
  await this.whatsAppApi.sendMessage(response);
}
```

## Error Handling & Fallbacks

### API Error Handling
```typescript
// ✅ Good - Tratamento de erros da API
async sendMessageWithRetry(message: any, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.whatsAppApi.sendMessage(message);
      return;
    } catch (error) {
      this.logger.error(`Failed to send message (attempt ${attempt})`, error);
      
      if (attempt === maxRetries) {
        // Última tentativa falhou, usar fallback
        await this.handleMessageFailure(message);
        throw new WhatsAppApiError('Failed to send message after retries');
      }
      
      // Aguardar antes de tentar novamente
      await this.delay(1000 * attempt);
    }
  }
}

// ✅ Good - Fallback para falhas
private async handleMessageFailure(message: any): Promise<void> {
  // Armazenar mensagem para envio posterior
  await this.messageQueue.add('send-later', {
    message,
    scheduledFor: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
  });
  
  // Notificar administrador
  await this.notifyAdmin('WhatsApp API failure', {
    phoneNumber: message.to,
    error: 'Message queued for later delivery'
  });
}
```

### Rate Limiting
```typescript
// ✅ Good - Controle de taxa de envio
@Injectable()
export class WhatsAppRateLimiter {
  private readonly redis: Redis;
  private readonly dailyLimit = 1000;
  private readonly hourlyLimit = 100;
  
  async checkRateLimit(phoneNumber: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    
    const dailyKey = `whatsapp:daily:${phoneNumber}:${today}`;
    const hourlyKey = `whatsapp:hourly:${phoneNumber}:${hour}`;
    
    const [dailyCount, hourlyCount] = await Promise.all([
      this.redis.get(dailyKey),
      this.redis.get(hourlyKey)
    ]);
    
    if (parseInt(dailyCount || '0') >= this.dailyLimit) {
      throw new RateLimitExceededError('Daily limit exceeded');
    }
    
    if (parseInt(hourlyCount || '0') >= this.hourlyLimit) {
      throw new RateLimitExceededError('Hourly limit exceeded');
    }
    
    // Incrementar contadores
    await Promise.all([
      this.redis.incr(dailyKey),
      this.redis.incr(hourlyKey)
    ]);
    
    // Definir TTL
    await Promise.all([
      this.redis.expire(dailyKey, 86400), // 24 horas
      this.redis.expire(hourlyKey, 3600)  // 1 hora
    ]);
    
    return true;
  }
}
```

## Message Templates & Localization

### Template Structure
```typescript
// ✅ Good - Estrutura de templates
interface MessageTemplate {
  name: string;
  language: string;
  category: 'ACCOUNT_UPDATE' | 'ALERT_UPDATE' | 'APPOINTMENT_UPDATE' | 'AUTOMATION' | 'ISSUE_RESOLUTION' | 'MESSAGE_TAG' | 'PAYMENT_UPDATE' | 'PERSONAL_FINANCE_UPDATE' | 'SHIPPING_UPDATE' | 'RESERVATION_UPDATE' | 'TRAVEL_UPDATE';
  components: TemplateComponent[];
}

// ✅ Good - Componentes de template
interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  parameters?: TemplateParameter[];
}
```

### Localization
```typescript
// ✅ Good - Suporte a múltiplos idiomas
const SUPPORTED_LANGUAGES = {
  'pt_BR': 'Português (Brasil)',
  'en_US': 'English (US)',
  'es_ES': 'Español (España)'
} as const;

// ✅ Good - Seleção de idioma
async detectLanguage(phoneNumber: string): Promise<string> {
  // Verificar preferência salva do usuário
  const userPreference = await this.userService.getLanguagePreference(phoneNumber);
  if (userPreference) {
    return userPreference;
  }
  
  // Detectar por código do país (ex: +55 = Brasil = pt_BR)
  const countryCode = this.extractCountryCode(phoneNumber);
  const languageMap: Record<string, string> = {
    '55': 'pt_BR', // Brasil
    '1': 'en_US',  // EUA/Canadá
    '34': 'es_ES'  // Espanha
  };
  
  return languageMap[countryCode] || 'pt_BR';
}
```

## Security & Compliance

### Data Privacy
```typescript
// ✅ Good - Anonimização de dados
private anonymizePhoneNumber(phoneNumber: string): string {
  // Manter apenas código do país e últimos 2 dígitos
  const parts = phoneNumber.split(' ');
  if (parts.length >= 2) {
    const countryCode = parts[0];
    const lastDigits = parts[parts.length - 1].slice(-2);
    return `${countryCode} *** *** **${lastDigits}`;
  }
  return '*** *** *** ***';
}

// ✅ Good - Logs seguros
private logMessageSafely(message: WhatsAppMessage): void {
  const safeMessage = {
    ...message,
    from: this.anonymizePhoneNumber(message.from),
    text: message.text ? { body: '[REDACTED]' } : undefined
  };
  
  this.logger.info('WhatsApp message received', safeMessage);
}
```

### Webhook Verification
```typescript
// ✅ Good - Verificação de assinatura
private verifyWebhookSignature(payload: any, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', this.webhookVerifyToken)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

## Testing & Quality Assurance

### Unit Tests
```typescript
// ✅ Good - Teste de envio de mensagem
describe('WhatsAppService', () => {
  it('should send text message successfully', async () => {
    const mockApi = {
      sendMessage: jest.fn().mockResolvedValue({ id: 'msg_123' })
    };
    
    const service = new WhatsAppService(mockApi);
    await service.sendTextResponse('+5511999999999', 'Olá!');
    
    expect(mockApi.sendMessage).toHaveBeenCalledWith({
      messaging_product: 'whatsapp',
      to: '+5511999999999',
      type: 'text',
      text: { body: 'Olá!' }
    });
  });
});
```

### Integration Tests
```typescript
// ✅ Good - Teste de webhook
describe('WhatsApp Webhook', () => {
  it('should process incoming message', async () => {
    const webhookPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123456789',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { phone_number_id: 'phone_123' },
            contacts: [{ phone_number: '+5511999999999' }],
            messages: [{
              from: '+5511999999999',
              timestamp: '1234567890',
              type: 'text',
              text: { body: 'Olá' }
            }]
          }
        }]
      }]
    };
    
    const response = await request(app)
      .post('/webhook')
      .send(webhookPayload)
      .set('x-hub-signature-256', 'valid_signature');
    
    expect(response.status).toBe(200);
  });
});
```

## Performance & Monitoring

### Metrics Collection
```typescript
// ✅ Good - Métricas de performance
@Injectable()
export class WhatsAppMetricsService {
  async recordMessageSent(phoneNumber: string, messageType: string, responseTime: number): Promise<void> {
    await this.metrics.increment('whatsapp.messages.sent', {
      type: messageType,
      country: this.extractCountryCode(phoneNumber)
    });
    
    await this.metrics.histogram('whatsapp.response_time', responseTime, {
      type: messageType
    });
  }
  
  async recordError(error: Error, context: any): Promise<void> {
    await this.metrics.increment('whatsapp.errors', {
      type: error.constructor.name,
      context: context
    });
  }
}
```

### Health Checks
```typescript
// ✅ Good - Health check da API
@Get('health/whatsapp')
async checkWhatsAppHealth(): Promise<HealthCheckResult> {
  try {
    const response = await this.whatsAppApi.getBusinessProfile();
    
    return {
      status: 'up',
      details: {
        businessName: response.data.name,
        phoneNumber: response.data.phone_number,
        lastChecked: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 'down',
      details: {
        error: error.message,
        lastChecked: new Date().toISOString()
      }
    };
  }
}
```

## Integration with Project Standards

Este guia complementa:
- **TypeScript Style**: Use tipos corretos para mensagens WhatsApp
- **Testing Standards**: Implemente testes para integração WhatsApp
- **Error Handling**: Tratamento robusto de erros da API
- **Performance**: Cache e rate limiting para otimização

## Quality Metrics

- **API Uptime**: 99.9% de disponibilidade
- **Response Time**: < 3 segundos para respostas
- **Error Rate**: < 1% de falhas na API
- **Rate Limit Compliance**: 100% de conformidade
- **Security**: Zero vulnerabilidades de webhook
