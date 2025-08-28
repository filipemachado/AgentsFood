#!/usr/bin/env node

/**
 * Script para configurar e testar WhatsApp Web no AgentsFood
 * 
 * Uso: node scripts/whatsapp-web-setup.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

class WhatsAppWebSetup {
  constructor() {
    this.token = null;
    this.establishmentId = null;
  }

  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }

  async login() {
    console.log('🔐 Fazendo login na API...');
    
    const email = await this.prompt('Email: ');
    const password = await this.prompt('Senha: ');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      this.token = response.data.access_token;
      console.log('✅ Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro no login:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async getEstablishment() {
    console.log('\n📍 Buscando estabelecimento...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/establishment`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      this.establishmentId = response.data.id;
      console.log('✅ Establishment encontrado!');
      console.log(`📋 ID: ${this.establishmentId}`);
      console.log(`🏪 Nome: ${response.data.name}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao buscar establishment:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async checkWhatsAppWebStatus() {
    console.log('\n📱 Verificando status do WhatsApp Web...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/whatsapp-web/status`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      const status = response.data;
      console.log('📊 Status do WhatsApp Web:');
      console.log(`   Habilitado: ${status.enabled ? '✅' : '❌'}`);
      console.log(`   Conectado: ${status.connected ? '✅' : '❌'}`);
      console.log(`   Estado: ${status.connectionState || status.state}`);
      console.log(`   QR Gerado: ${status.qrGenerated ? '✅' : '❌'}`);
      
      return status;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.response?.data?.message || error.message);
      return null;
    }
  }

  async connectWhatsAppWeb() {
    console.log('\n🔌 Conectando ao WhatsApp Web...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp-web/connect`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      console.log(`${response.data.success ? '✅' : '❌'} ${response.data.message}`);
      
      if (response.data.success) {
        console.log('\n📱 Verifique o terminal do servidor para o QR Code!');
        console.log('   1. Abra WhatsApp no celular');
        console.log('   2. Vá em "Dispositivos Conectados"');
        console.log('   3. Toque em "Conectar um dispositivo"');
        console.log('   4. Escaneie o QR Code no terminal do servidor');
      }
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async sendTestMessage() {
    console.log('\n✉️ Enviando mensagem de teste...');
    
    const phoneNumber = await this.prompt('Número de telefone (ex: 5511999999999): ');
    const message = await this.prompt('Mensagem de teste: ') || 'Esta é uma mensagem de teste do AgentsFood via WhatsApp Web! 🤖';
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp-web/send-test`, {
        phoneNumber,
        message
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      console.log(`${response.data.success ? '✅' : '❌'} ${response.data.message}`);
      
      if (response.data.success) {
        console.log(`📱 Mensagem enviada para: ${response.data.phoneNumber}`);
      }
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async showMenu() {
    console.log('\n📋 Menu de opções:');
    console.log('1. Verificar status');
    console.log('2. Conectar WhatsApp Web');
    console.log('3. Enviar mensagem teste');
    console.log('4. Reconectar');
    console.log('5. Gerar novo QR Code');
    console.log('0. Sair');
    
    const choice = await this.prompt('\nEscolha uma opção: ');
    
    switch (choice) {
      case '1':
        await this.checkWhatsAppWebStatus();
        break;
      case '2':
        await this.connectWhatsAppWeb();
        break;
      case '3':
        await this.sendTestMessage();
        break;
      case '4':
        await this.reconnect();
        break;
      case '5':
        await this.generateQR();
        break;
      case '0':
        console.log('👋 Saindo...');
        rl.close();
        return false;
      default:
        console.log('❌ Opção inválida');
    }
    
    return true;
  }

  async reconnect() {
    console.log('\n🔄 Reconectando...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp-web/reconnect`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      console.log(`${response.data.success ? '✅' : '❌'} ${response.data.message}`);
    } catch (error) {
      console.error('❌ Erro ao reconectar:', error.response?.data?.message || error.message);
    }
  }

  async generateQR() {
    console.log('\n🔄 Gerando novo QR Code...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp-web/generate-qr`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      console.log(`${response.data.success ? '✅' : '❌'} ${response.data.message}`);
    } catch (error) {
      console.error('❌ Erro ao gerar QR:', error.response?.data?.message || error.message);
    }
  }

  async run() {
    console.log('🚀 WhatsApp Web Setup - AgentsFood');
    console.log('=====================================\n');
    
    // Login
    if (!await this.login()) return;
    
    // Buscar establishment
    if (!await this.getEstablishment()) return;
    
    console.log('\n✅ Setup concluído! Agora você pode configurar as variáveis de ambiente:');
    console.log(`   WHATSAPP_WEB_ENABLED=true`);
    console.log(`   WHATSAPP_WEB_ESTABLISHMENT_ID="${this.establishmentId}"`);
    
    // Menu interativo
    while (await this.showMenu()) {
      // Continua no loop
    }
  }
}

// Executar
if (require.main === module) {
  const setup = new WhatsAppWebSetup();
  setup.run().catch(console.error);
}

module.exports = WhatsAppWebSetup;