# Spec: Setup Inicial da Infraestrutura

## Visão Geral

Configurar o ambiente de desenvolvimento completo para o projeto Vitrine de Alimentos via WhatsApp, incluindo Docker, banco de dados, CI/CD básico e estrutura de diretórios.

## Objetivos

- [ ] Ambiente de desenvolvimento funcional com Docker
- [ ] Banco de dados PostgreSQL configurado e acessível
- [ ] Redis configurado para cache e sessões
- [ ] CI/CD básico com GitHub Actions
- [ ] Estrutura de diretórios organizada
- [ ] Documentação de setup para desenvolvedores

## Contexto

Esta é a primeira especificação do projeto, focando na fundação técnica necessária para o desenvolvimento das funcionalidades seguintes. O setup deve ser robusto, documentado e fácil de reproduzir por novos desenvolvedores.

## Requisitos Técnicos

### Docker
- Containers para PostgreSQL, Redis, e aplicação
- Volumes persistentes para dados
- Network isolada para comunicação entre serviços
- Health checks configurados

### Banco de Dados
- PostgreSQL 17+ com extensões necessárias
- Usuário e banco criados automaticamente
- Migrations iniciais configuradas
- Backup automático configurado

### Redis
- Redis 7+ para cache e sessões
- Configuração de persistência
- Monitoramento básico

### CI/CD
- GitHub Actions para build e teste
- Docker image building automatizado
- Testes rodando em pull requests
- Deploy automático para staging

## Critérios de Aceitação

### CA-01: Ambiente Docker
**Dado** que o desenvolvedor executa `docker-compose up`
**Quando** todos os serviços iniciam
**Então** deve ter acesso a PostgreSQL na porta 5432
**E** Redis na porta 6379
**E** logs mostram todos os serviços como "healthy"

### CA-02: Banco de Dados
**Dado** que o PostgreSQL está rodando
**Quando** o desenvolvedor conecta com as credenciais
**Então** deve conseguir criar tabelas
**E** executar queries básicas
**E** ter acesso a todas as extensões necessárias

### CA-03: Redis
**Dado** que o Redis está rodando
**Quando** o desenvolvedor conecta via CLI
**Então** deve conseguir executar comandos SET/GET
**E** ver dados persistidos após restart

### CA-04: CI/CD
**Dado** que um PR é criado
**Quando** o GitHub Actions roda
**Então** deve executar build do Docker
**E** rodar testes básicos
**E** reportar status no PR

## Estrutura de Arquivos

```
project-root/
├── docker/
│   ├── postgres/
│   │   ├── Dockerfile
│   │   ├── init.sql
│   │   └── postgresql.conf
│   ├── redis/
│   │   ├── Dockerfile
│   │   └── redis.conf
│   └── app/
│       └── Dockerfile
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.local
└── README.md
```

## Dependências

- Docker e Docker Compose instalados
- Git configurado com acesso ao repositório
- Portas 5432, 6379, 3000, 3001 disponíveis
- 4GB RAM disponível para containers

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Conflito de portas | Média | Baixo | Documentar portas e verificar disponibilidade |
| Docker não instalado | Baixa | Alto | Instruções de instalação no README |
| Falha na criação de volumes | Baixa | Médio | Scripts de fallback e limpeza |
| CI/CD não funciona | Média | Médio | Testes locais antes do commit |

## Estimativa de Esforço

- **Setup Docker**: 1 dia
- **Configuração DB**: 1 dia  
- **Configuração Redis**: 0.5 dia
- **CI/CD básico**: 1.5 dias
- **Documentação**: 0.5 dia
- **Testes e validação**: 1 dia

**Total**: 5.5 dias úteis
