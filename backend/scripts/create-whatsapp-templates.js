const axios = require('axios');
require('dotenv').config();

// Configurações do WhatsApp Business API
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const META_API_VERSION = 'v18.0';

// Templates para criar no Meta for Developers
const templates = {
  welcome: {
    name: 'agentsfood_welcome',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Olá! Bem-vindo ao {{1}}! 🍔\n\nSou seu assistente virtual e estou aqui para ajudar com nosso cardápio.\n\nDigite *menu* para ver nossos produtos ou faça sua pergunta!',
        example: {
          body_text: [
            ['AgentsFood']
          ]
        }
      }
    ]
  },

  menu_intro: {
    name: 'agentsfood_menu_intro',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: '📋 *NOSSO CARDÁPIO*\n\n{{1}}\n\n💬 Digite o nome de um produto para mais detalhes ou *categorias* para navegar por seções!',
        example: {
          body_text: [
            ['🍔 X-Burger - R$ 15,90\n🍟 Batata Frita - R$ 8,50\n🥤 Refrigerante - R$ 5,00']
          ]
        }
      }
    ]
  },

  product_info: {
    name: 'agentsfood_product_info',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: '🍽️ *{{1}}*\n\n{{2}}\n\n💰 *Preço:* R$ {{3}}\n{{4}}\n\nGostaria de saber mais alguma coisa?',
        example: {
          body_text: [
            ['X-Burger', 'Hambúrguer artesanal com queijo, alface e tomate', '15,90', '✅ Disponível']
          ]
        }
      }
    ]
  },

  order_help: {
    name: 'agentsfood_order_help',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: '🛒 *COMO FAZER SEU PEDIDO*\n\n1️⃣ Escolha seus produtos\n2️⃣ Confirme os itens\n3️⃣ Informe seu endereço\n4️⃣ Escolha forma de pagamento\n\n📞 *Telefone:* {{1}}\n📍 *Endereço:* {{2}}',
        example: {
          body_text: [
            ['(11) 99999-9999', 'Rua das Flores, 123 - Centro']
          ]
        }
      }
    ]
  },

  promocao: {
    name: 'agentsfood_promocao',
    language: 'pt_BR',
    category: 'MARKETING',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🎉 PROMOÇÃO ESPECIAL!'
      },
      {
        type: 'BODY',
        text: '{{1}}\n\n🕐 Válida até: {{2}}\n💬 Responda *QUERO* para aproveitar!',
        example: {
          body_text: [
            ['Combo X-Burger + Batata + Refrigerante por apenas R$ 19,90', '31/12/2024']
          ]
        }
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'QUERO'
          },
          {
            type: 'QUICK_REPLY',
            text: 'MAIS INFO'
          }
        ]
      }
    ]
  },

  confirmacao_pedido: {
    name: 'agentsfood_confirmacao',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: '✅ *PEDIDO CONFIRMADO!*\n\n📝 *Pedido #{{1}}*\n{{2}}\n\n💰 *Total:* R$ {{3}}\n⏰ *Tempo estimado:* {{4}} minutos\n\n📍 *Endereço de entrega:*\n{{5}}',
        example: {
          body_text: [
            ['12345', '2x X-Burger\n1x Batata Frita\n2x Refrigerante', '35,80', '30', 'Rua das Flores, 123 - Centro']
          ]
        }
      }
    ]
  }
};

// Função para criar um template
async function createTemplate(templateData) {
  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    
    console.log(`🔄 Criando template: ${templateData.name}`);
    console.log('📤 Payload:', JSON.stringify(templateData, null, 2));

    const response = await axios.post(url, templateData, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Template ${templateData.name} criado com sucesso!`);
    console.log(`📊 ID: ${response.data.id}`);
    console.log(`📋 Status: ${response.data.status}`);
    console.log('---');

    return response.data;

  } catch (error) {
    console.error(`❌ Erro ao criar template ${templateData.name}:`);
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Erro:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('📄 Erro:', error.message);
    }
    console.log('---');
    return null;
  }
}

// Função para listar templates existentes
async function listExistingTemplates() {
  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });

    console.log('📋 Templates existentes:');
    response.data.data.forEach(template => {
      console.log(`  - ${template.name} (${template.status})`);
    });
    console.log('---');

    return response.data.data;

  } catch (error) {
    console.error('❌ Erro ao listar templates:', error.response?.data || error.message);
    return [];
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando criação de templates WhatsApp...\n');
  
  // Verificar configurações
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_TOKEN) {
    console.error('❌ Configurações do WhatsApp não encontradas!');
    console.error('   Verifique as variáveis WHATSAPP_BUSINESS_ACCOUNT_ID e WHATSAPP_TOKEN no .env');
    process.exit(1);
  }

  console.log(`📱 Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
  console.log(`🔑 Token: ${WHATSAPP_TOKEN.substring(0, 20)}...`);
  console.log('---');

  // Listar templates existentes
  await listExistingTemplates();

  // Criar cada template
  const results = [];
  for (const [key, templateData] of Object.entries(templates)) {
    const result = await createTemplate(templateData);
    results.push({ key, result });
    
    // Aguardar um pouco entre requests para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumo final
  console.log('\n📊 RESUMO FINAL:');
  results.forEach(({ key, result }) => {
    if (result) {
      console.log(`✅ ${key}: Criado (ID: ${result.id})`);
    } else {
      console.log(`❌ ${key}: Falhou`);
    }
  });

  console.log('\n🎉 Processo concluído!');
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde aprovação dos templates no Meta for Developers');
  console.log('2. Templates UTILITY são aprovados automaticamente');
  console.log('3. Templates MARKETING precisam de revisão manual');
  console.log('4. Teste os templates após aprovação');
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createTemplate,
  listExistingTemplates,
  templates
};