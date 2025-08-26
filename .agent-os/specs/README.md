# Especificações do Projeto

Este diretório contém as especificações detalhadas para cada funcionalidade do projeto Vitrine de Alimentos via WhatsApp.

## Estrutura

```
specs/
├── README.md                    # Este arquivo
├── 2025-01-27-setup-inicial/   # Setup inicial da infraestrutura
├── 2025-01-27-crud-produtos-backend/    # CRUD de produtos no backend
├── 2025-01-27-whatsapp-integration/     # Integração com WhatsApp Business API
├── 2025-01-27-painel-administrativo/    # Painel administrativo frontend
├── 2025-01-27-ai-nlp-system/            # Sistema de IA/NLP para mensagens
├── 2025-08-22-status-atual/             # Status atual do desenvolvimento (75% COMPLETO)
└── [outras-specs]/             # Outras especificações
```

## Como Usar

1. **Criar nova spec**: Use o comando `@~/.agent-os/instructions/core/create-spec.md`
2. **Executar spec**: Use o comando `@~/.agent-os/instructions/core/execute-tasks.md`
3. **Executar tarefa específica**: Use o comando `@~/.agent-os/instructions/core/execute-task.md`

## Padrão de Nomenclatura

- **Formato**: `YYYY-MM-DD-nome-da-spec`
- **Exemplo**: `2025-01-27-setup-inicial`
- **Branch**: `setup-inicial` (sem data)

## Workflow

1. **Criar spec** com funcionalidade detalhada
2. **Definir tarefas** com critérios de aceitação
3. **Executar tarefas** seguindo TDD
4. **Validar** com testes e revisão
5. **Documentar** decisões e mudanças
