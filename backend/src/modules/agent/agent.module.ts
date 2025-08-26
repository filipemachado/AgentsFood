import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { ConversationService } from './conversation.service';
import { EnhancedAgentService } from './enhanced-agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, ConversationService, EnhancedAgentService],
  exports: [AgentService, ConversationService, EnhancedAgentService],
})
export class AgentModule {}