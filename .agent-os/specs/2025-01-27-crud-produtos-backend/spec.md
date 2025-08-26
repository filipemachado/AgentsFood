# Spec: CRUD de Produtos - Backend

## Visão Geral

Implementar o sistema completo de gerenciamento de produtos no backend NestJS, incluindo entidades, DTOs, serviços, controladores e validações para o projeto Vitrine de Alimentos via WhatsApp.

## Objetivos

- [ ] Entidades de produto e categoria implementadas
- [ ] DTOs com validações completas
- [ ] Serviços com lógica de negócio
- [ ] Controladores com endpoints RESTful
- [ ] Validações e tratamento de erros
- [ ] Testes unitários com cobertura mínima de 80%
- [ ] Documentação Swagger/OpenAPI

## Contexto

Esta especificação é fundamental para o funcionamento do sistema, pois os produtos são o core do negócio. O agente WhatsApp precisa consultar estes dados para responder aos clientes sobre cardápio, preços e disponibilidade.

## Requisitos Técnicos

### Entidades
- **Product**: id, name, description, price, imageUrl, categoryId, isAvailable, createdAt, updatedAt
- **Category**: id, name, description, createdAt, updatedAt

### DTOs
- **CreateProductDto**: Validação de dados de entrada
- **UpdateProductDto**: Validação de dados de atualização
- **ProductResponseDto**: Formato de resposta padronizado

### Validações
- Preço deve ser positivo
- Nome obrigatório e único por categoria
- Imagem opcional mas com validação de formato
- Categoria deve existir

### Endpoints
- `GET /products` - Listar produtos com filtros
- `GET /products/:id` - Buscar produto por ID
- `POST /products` - Criar novo produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Remover produto (soft delete)
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria

## Critérios de Aceitação

### CA-01: Criação de Produto
**Dado** que o usuário está autenticado como admin
**Quando** envia dados válidos para `/products`
**Então** o produto deve ser criado no banco
**E** retornar status 201 com dados do produto
**E** validar que o nome é único na categoria

### CA-02: Atualização de Produto
**Dado** que um produto existe no sistema
**Quando** o usuário atualiza dados válidos
**Então** o produto deve ser atualizado
**E** retornar status 200 com dados atualizados
**E** manter histórico de modificações

### CA-03: Listagem com Filtros
**Dado** que existem produtos no sistema
**Quando** o usuário solicita lista com filtros
**Então** deve retornar produtos filtrados
**E** suportar paginação
**E** permitir busca por nome e categoria

### CA-04: Validações de Dados
**Dado** que o usuário envia dados inválidos
**Quando** tenta criar/atualizar produto
**Então** deve retornar status 400
**E** mensagens de erro claras
**E** não deve persistir dados inválidos

## Estrutura de Arquivos

```
src/
├── modules/
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-response.dto.ts
│   │   ├── entities/
│   │   │   ├── product.entity.ts
│   │   │   └── category.entity.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── products.repository.ts
│   └── categories/
│       ├── dto/
│       ├── entities/
│       ├── categories.controller.ts
│       ├── categories.service.ts
│       └── categories.module.ts
└── common/
    ├── decorators/
    ├── guards/
    └── interceptors/
```

## Dependências

- NestJS framework configurado
- Prisma ORM configurado
- Banco de dados PostgreSQL funcionando
- Sistema de autenticação JWT implementado
- Validação com class-validator configurada

## Riscos e Mitigações

### Risco: Performance com muitos produtos
**Mitigação**: Implementar paginação, cache Redis e índices no banco

### Risco: Validação de imagens
**Mitigação**: Validação de formato e tamanho, upload seguro

### Risco: Concorrência na atualização
**Mitigação**: Versionamento de entidades e locks otimistas

## Estimativa de Esforço

- **Complexidade**: Média (M)
- **Tempo Estimado**: 3-4 dias
- **Agente Responsável**: Agent Backend
- **Dependências**: Setup inicial completo
