# AgentOS Standards

## Context

Este diretório contém todos os padrões globais e específicos do projeto para o AgentOS, garantindo consistência, qualidade e boas práticas em todo o desenvolvimento.

## Standards Overview

### 🏗️ **Core Standards**

#### [tech-stack.md](./tech-stack.md)
- **Purpose**: Define a stack tecnológica padrão global para projetos AgentOS
- **Content**: Ruby on Rails, PostgreSQL, React, TailwindCSS, Digital Ocean
- **Usage**: Base para todos os projetos, pode ser sobrescrito por projetos específicos

#### [best-practices.md](./best-practices.md)
- **Purpose**: Estabelece princípios fundamentais de desenvolvimento
- **Content**: Keep It Simple, DRY, Readability, Dependencies, Code Quality
- **Usage**: Aplicável a todos os projetos e tecnologias

### 🎨 **Code Style Standards**

#### [code-style.md](./code-style.md)
- **Purpose**: Guia principal de estilo de código com regras globais
- **Content**: Formatação, nomenclatura, comentários, estrutura
- **Usage**: Base para todos os projetos, integra com guias específicos

#### [eslint-config.md](./eslint-config.md)
- **Purpose**: Configurações ESLint específicas para o projeto
- **Content**: Regras TypeScript, React, NestJS, TailwindCSS
- **Usage**: Configurações prontas para backend e frontend

### 📁 **Code Style Subdirectories**

#### [code-style/html-style.md](./code-style/html-style.md)
- **Purpose**: Padrões para JSX/React e estrutura
- **Content**: Indentação, atributos, estrutura JSX, acessibilidade
- **Usage**: Projetos React/Next.js

#### [code-style/css-style.md](./code-style/css-style.md)
- **Purpose**: Padrões para TailwindCSS e CSS
- **Content**: Organização de classes, formatação multi-linha, responsividade
- **Usage**: Projetos usando TailwindCSS

#### [code-style/typescript-style.md](./code-style/typescript-style.md)
- **Purpose**: Padrões para TypeScript/JavaScript
- **Content**: Convenções de nomenclatura, tipos, estrutura
- **Usage**: Projetos TypeScript/JavaScript

#### [code-style/project-specific-style.md](./code-style/project-specific-style.md)
- **Purpose**: Guia de estilo específico para "Vitrine de Alimentos via WhatsApp"
- **Content**: NestJS, Next.js, TypeScript, TailwindCSS, Prisma
- **Usage**: Aplicável apenas a este projeto específico

#### [code-style/shadcn-style.md](./code-style/shadcn-style.md)
- **Purpose**: Padrões para Shadcn/ui e componentes UI
- **Content**: Componentes, tema, customização, acessibilidade, testes
- **Usage**: Projetos usando Shadcn/ui

### 🧪 **Testing Standards**

#### [testing-standards.md](./testing-standards.md)
- **Purpose**: Padrões completos de testes para o projeto
- **Content**: Jest, React Testing Library, cobertura, exemplos práticos
- **Usage**: Garante qualidade e confiabilidade do código

### 🔗 **Integration Standards**

#### [whatsapp-standards.md](./whatsapp-standards.md)
- **Purpose**: Padrões para integração com WhatsApp Business API
- **Content**: Webhooks, mensagens, templates, segurança, rate limiting
- **Usage**: Projetos com integração WhatsApp

## Integration Matrix

| Standard | Backend | Frontend | Global | Project-Specific |
|----------|---------|----------|---------|------------------|
| **tech-stack** | ✅ | ✅ | ✅ | ❌ |
| **best-practices** | ✅ | ✅ | ✅ | ❌ |
| **code-style** | ✅ | ✅ | ✅ | ❌ |
| **eslint-config** | ✅ | ✅ | ❌ | ✅ |
| **testing-standards** | ✅ | ✅ | ❌ | ✅ |
| **html-style** | ❌ | ✅ | ❌ | ❌ |
| **css-style** | ❌ | ✅ | ❌ | ❌ |
| **typescript-style** | ✅ | ✅ | ❌ | ❌ |
| **shadcn-style** | ❌ | ✅ | ❌ | ❌ |
| **whatsapp-standards** | ✅ | ❌ | ❌ | ❌ |
| **project-specific-style** | ✅ | ✅ | ❌ | ✅ |

## Usage Instructions

### For Development Agents

1. **Start with Global Standards**: Leia `tech-stack.md` e `best-practices.md` primeiro
2. **Apply Code Style**: Use `code-style.md` como base, complemente com específicos
3. **Configure Tools**: Use `eslint-config.md` para configurações de qualidade
4. **Follow Testing**: Implemente testes seguindo `testing-standards.md`

### For Project-Specific Work

1. **Read Project Style**: Comece com `project-specific-style.md`
2. **Apply Standards**: Use padrões globais como base
3. **Customize as Needed**: Adapte padrões para necessidades específicas
4. **Maintain Consistency**: Siga convenções estabelecidas

### For Code Review

1. **Check Standards Compliance**: Verifique se código segue padrões
2. **Validate ESLint Rules**: Execute configurações ESLint
3. **Review Test Coverage**: Confirme cobertura de testes
4. **Maintain Quality**: Aplique princípios de boas práticas

## Standards Hierarchy

```
Standards/
├── Global (Aplicável a todos os projetos)
│   ├── tech-stack.md
│   ├── best-practices.md
│   └── code-style.md
├── Technology-Specific (Por tecnologia)
│   ├── code-style/html-style.md
│   ├── code-style/css-style.md
│   ├── code-style/typescript-style.md
│   └── code-style/shadcn-style.md
├── Integration-Specific (Por integração)
│   └── whatsapp-standards.md
├── Project-Specific (Apenas este projeto)
│   ├── project-specific-style.md
│   ├── eslint-config.md
│   └── testing-standards.md
└── README.md (Este arquivo)
```

## Quality Assurance

### Standards Compliance
- **Code Review**: Todos os PRs devem seguir padrões
- **Automated Checks**: ESLint e Prettier em CI/CD
- **Coverage Reports**: Testes devem atingir metas definidas
- **Documentation**: Código deve ser auto-documentado

### Continuous Improvement
- **Regular Reviews**: Avaliar padrões periodicamente
- **Feedback Loop**: Incorporar melhorias baseadas em experiência
- **Version Control**: Manter histórico de mudanças nos padrões
- **Team Alignment**: Garantir que todos seguem mesmos padrões

## Maintenance

### Updating Standards
1. **Propose Changes**: Sugerir melhorias via issues/PRs
2. **Review Impact**: Avaliar impacto em projetos existentes
3. **Update Documentation**: Manter padrões atualizados
4. **Communicate Changes**: Notificar equipe sobre mudanças

### Version Control
- **Semantic Versioning**: Para mudanças significativas
- **Changelog**: Documentar todas as alterações
- **Migration Guide**: Para mudanças breaking
- **Backward Compatibility**: Manter compatibilidade quando possível

## Support & Questions

Para dúvidas sobre padrões:
1. **Check Documentation**: Leia documentação relevante
2. **Search Issues**: Procure por discussões existentes
3. **Ask Team**: Consulte outros membros da equipe
4. **Create Issue**: Abra issue para clarificações necessárias

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Maintainer**: AgentOS Team
