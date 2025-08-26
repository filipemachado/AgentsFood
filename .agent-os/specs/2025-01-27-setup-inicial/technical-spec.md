# Especificação Técnica: Setup Inicial da Infraestrutura

## Visão Geral Técnica

Esta especificação detalha a implementação técnica do ambiente de desenvolvimento, incluindo configurações específicas de Docker, PostgreSQL, Redis e CI/CD.

## Arquitetura Docker

### Estrutura de Serviços

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    build: ./docker/postgres
    container_name: vitrine_postgres
    environment:
      POSTGRES_DB: vitrine_food
      POSTGRES_USER: vitrine_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - vitrine_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vitrine_user -d vitrine_food"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    build: ./docker/redis
    container_name: vitrine_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - vitrine_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  vitrine_network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### Configurações Específicas

#### PostgreSQL
- **Versão**: 17-alpine (otimizada para produção)
- **Extensões**: uuid-ossp, pgcrypto, unaccent
- **Configurações**: 
  - shared_buffers: 256MB
  - effective_cache_size: 1GB
  - maintenance_work_mem: 64MB
  - checkpoint_completion_target: 0.9

#### Redis
- **Versão**: 7-alpine
- **Configurações**:
  - maxmemory: 256mb
  - maxmemory-policy: allkeys-lru
  - save: 900 1, 300 10, 60 10000
  - appendonly: yes

## Estrutura de Diretórios

```
project-root/
├── .agent-os/                    # Configurações AgentOS
├── docker/                       # Configurações Docker
│   ├── postgres/
│   │   ├── Dockerfile
│   │   ├── init.sql
│   │   └── postgresql.conf
│   ├── redis/
│   │   ├── Dockerfile
│   │   └── redis.conf
│   └── app/
│       └── Dockerfile
├── .github/                      # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── backend/                      # Backend NestJS (futuro)
├── frontend/                     # Frontend Next.js (futuro)
├── docs/                         # Documentação
├── scripts/                      # Scripts de automação
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

## Configurações de Ambiente

### Variáveis de Ambiente (.env.example)

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vitrine_food
POSTGRES_USER=vitrine_user
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application
NODE_ENV=development
PORT=3000
API_PORT=3001

# WhatsApp (futuro)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# AI/NLP (futuro)
OPENAI_API_KEY=
```

## CI/CD Pipeline

### GitHub Actions Workflow (ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, staging ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build Docker images
      run: |
        docker build -t vitrine-postgres ./docker/postgres
        docker build -t vitrine-redis ./docker/redis
    
    - name: Test Docker containers
      run: |
        docker run --rm vitrine-postgres pg_isready -U postgres
        docker run --rm vitrine-redis redis-cli ping
```

## Scripts de Automação

### Script de Setup (scripts/setup.sh)

```bash
#!/bin/bash

# Setup script para ambiente de desenvolvimento

echo "🚀 Configurando ambiente de desenvolvimento..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "⚠️  Configure as variáveis de ambiente em .env.local"
fi

# Iniciar serviços
echo "🐳 Iniciando serviços Docker..."
docker-compose up -d

# Aguardar serviços ficarem saudáveis
echo "⏳ Aguardando serviços ficarem saudáveis..."
sleep 30

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."
docker-compose ps

echo "✅ Ambiente configurado com sucesso!"
echo "📖 Consulte o README.md para próximos passos"
```

### Script de Limpeza (scripts/cleanup.sh)

```bash
#!/bin/bash

# Script de limpeza para ambiente de desenvolvimento

echo "🧹 Limpando ambiente de desenvolvimento..."

# Parar e remover containers
docker-compose down

# Remover volumes (opcional)
read -p "Deseja remover volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "🗑️  Volumes removidos"
fi

# Remover imagens não utilizadas
docker image prune -f

echo "✅ Limpeza concluída!"
```

## Testes e Validação

### Testes de Conectividade

```bash
# Testar PostgreSQL
docker exec vitrine_postgres pg_isready -U vitrine_user -d vitrine_food

# Testar Redis
docker exec vitrine_redis redis-cli ping

# Testar comunicação entre containers
docker exec vitrine_postgres ping redis
```

### Validação de Performance

```bash
# Testar performance do PostgreSQL
docker exec vitrine_postgres pgbench -U vitrine_user -d vitrine_food -c 10 -t 100

# Testar performance do Redis
docker exec vitrine_redis redis-benchmark -h localhost -p 6379 -n 100000 -c 10
```

## Monitoramento e Logs

### Logs dos Serviços

```bash
# Ver logs do PostgreSQL
docker logs vitrine_postgres

# Ver logs do Redis
docker logs vitrine_redis

# Ver logs de todos os serviços
docker-compose logs -f
```

### Métricas de Saúde

```bash
# Status dos serviços
docker-compose ps

# Uso de recursos
docker stats --no-stream

# Espaço em disco dos volumes
docker system df
```

## Segurança

### Configurações de Segurança

- **PostgreSQL**: Usuário com privilégios limitados
- **Redis**: Sem senha em desenvolvimento (configurar para produção)
- **Network**: Isolamento entre containers
- **Volumes**: Dados persistentes em volumes nomeados

### Boas Práticas

- Não commitar arquivos .env com senhas reais
- Usar secrets do GitHub para CI/CD
- Rotacionar senhas regularmente
- Monitorar logs para atividades suspeitas

## Troubleshooting

### Problemas Comuns

1. **Porta já em uso**: Verificar se outros serviços estão usando as portas
2. **Permissões de volume**: Verificar permissões de escrita no diretório
3. **Memória insuficiente**: Ajustar limites de memória no Docker
4. **Network conflicts**: Verificar se outras redes Docker estão conflitando

### Comandos de Debug

```bash
# Ver detalhes dos containers
docker inspect vitrine_postgres
docker inspect vitrine_redis

# Ver logs em tempo real
docker-compose logs -f postgres
docker-compose logs -f redis

# Executar comando em container
docker exec -it vitrine_postgres psql -U vitrine_user -d vitrine_food
docker exec -it vitrine_redis redis-cli
```
