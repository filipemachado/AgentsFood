import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppWebService } from './whatsapp-web.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [AgentModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsAppWebService],
  exports: [WhatsappService, WhatsAppWebService],
})
export class WhatsappModule {}