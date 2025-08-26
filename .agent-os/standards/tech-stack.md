# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

## Default Technology Stacks

### 🟢 **Modern JavaScript/TypeScript Stack (Recommended)**
- **App Framework**: NestJS 10+ (Backend) / Next.js 14+ (Frontend)
- **Language**: TypeScript 5.0+
- **Runtime**: Node.js 22 LTS
- **Primary Database**: PostgreSQL 17+
- **ORM**: Prisma ORM
- **JavaScript Framework**: React 18+ with TypeScript
- **Build Tool**: Vite / Webpack
- **Import Strategy**: ES Modules (ESM)
- **Package Manager**: npm / pnpm
- **CSS Framework**: TailwindCSS 4.0+
- **UI Components**: Shadcn/ui / Material-UI
- **Icons**: Lucide React / Heroicons
- **Font Provider**: Google Fonts
- **Font Loading**: Self-hosted for performance

### 🔴 **Legacy Ruby on Rails Stack (Deprecated)**
> **⚠️ NOTA**: Esta stack está sendo descontinuada em favor da stack JavaScript/TypeScript moderna. 
> Use apenas para manutenção de projetos legados existentes.
- **App Framework**: Ruby on Rails 8.0+
- **Language**: Ruby 3.2+
- **Primary Database**: PostgreSQL 17+
- **ORM**: Active Record
- **JavaScript Framework**: React latest stable
- **Build Tool**: Vite
- **Import Strategy**: Node.js modules
- **Package Manager**: npm
- **Node Version**: 22 LTS
- **CSS Framework**: TailwindCSS 4.0+
- **UI Components**: Instrumental Components latest
- **UI Installation**: Via development gems group

## Common Infrastructure (All Stacks)

### 🗄️ **Database & Storage**
- **Primary Database**: PostgreSQL 17+
- **Cache**: Redis 7+ for sessions and caching
- **Database Hosting**: AWS RDS / Digital Ocean Managed PostgreSQL
- **Database Backups**: Daily automated
- **Asset Storage**: Amazon S3 / Digital Ocean Spaces
- **CDN**: CloudFront / Digital Ocean CDN
- **Asset Access**: Private with signed URLs

### ☁️ **Hosting & Deployment**
- **Application Hosting**: AWS ECS / Digital Ocean App Platform / Vercel
- **Hosting Region**: Primary region based on user base
- **Containerization**: Docker + Kubernetes (optional)
- **CI/CD Platform**: GitHub Actions
- **CI/CD Trigger**: Push to main/staging branches
- **Tests**: Run before deployment
- **Production Environment**: main branch
- **Staging Environment**: staging branch

### 🔧 **Development Tools**
- **Code Repository**: GitHub
- **Version Control**: Git with conventional commits
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + Testing Library
- **Type Safety**: TypeScript (when applicable)
- **Documentation**: Markdown + JSDoc

## Stack Selection Guidelines

### Choose Modern JavaScript/TypeScript Stack When:
- Building new applications
- Working with modern web technologies
- Need for type safety and better developer experience
- Team familiar with JavaScript/TypeScript ecosystem
- Building APIs or full-stack applications

### Choose Ruby on Rails Stack When:
- **⚠️ APENAS para manutenção de projetos legados existentes**
- **⚠️ NÃO use para novos projetos**
- **⚠️ Considere migração para stack JavaScript/TypeScript moderna**

## Migration Path

Projects can migrate between stacks by:
1. **Gradual Migration**: Start with new features in target stack
2. **Parallel Development**: Run both stacks simultaneously
3. **Full Rewrite**: Complete migration to new stack
4. **Hybrid Approach**: Use both stacks for different parts of the application

## Project-Specific Overrides

Each project should define its specific tech stack in `.agent-os/product/tech-stack.md` to override these global defaults with project-specific requirements.
