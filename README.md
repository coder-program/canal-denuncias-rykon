# 🛡️ Canal de Denúncias Corporativo - Sistema Completo

> **Produção-Ready** | Anônimo & Seguro | Dashboard em Tempo Real

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Backend](https://img.shields.io/badge/backend-NestJS%2010.x-e0234e.svg)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-black.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sistema completo de **Canal de Denúncias** seguro, escalável e personalizável, desenvolvido com **NestJS + Next.js 14 + PostgreSQL** com autenticação JWT, notificações em tempo real e dashboard administrativo.

## 📚 Documentação

📖 **[DOCUMENTAÇÃO COMPLETA](DOCUMENTACAO-COMPLETA.md)** - Guia detalhado de 113KB com toda arquitetura, tecnologias e implementação

### Documentação Adicional

- [Changelog](CHANGELOG.md)
- [Guia de Instalação](GUIA-INSTALACAO-COMPLETO.md)
- [Guia de Testes](GUIA-TESTES-MANUAIS.md)
- [Exemplos da API - Denúncias](docs/COMPLAINTS-API-EXAMPLES.md)
- [Exemplos da API - Anexos](docs/ATTACHMENTS-API-EXAMPLES.md)
- **[📄 Módulo de Dossiês (Download PDF)](FUNCIONALIDADE-DOSSIERS.md)** - ✨ Novo!

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Instalação Rápida](#instalação-rápida)
- [Credenciais de Teste](#credenciais-de-teste)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Visão Geral

O **Canal de Denúncias Corporativo** é uma plataforma completa para gestão de denúncias internas que oferece:

### Para Denunciantes
- ✅ Envio de denúncias **anônimas**
- ✅ Acompanhamento via **protocolo único**
- ✅ Upload seguro de **anexos** (documentos, imagens)
- ✅ Interface intuitiva e responsiva

### Para Comitê de Compliance
- ✅ **Dashboard em tempo real** com estatísticas e gráficos
- ✅ **Busca funcional** por protocolo, título, tipo e status
- ✅ **Gestão de investigações** com timeline de 6 estágios
- ✅ **Sistema de comentários** para acompanhamento
- ✅ **Notificações** por email e in-app

### Para Administradores
- ✅ **Gestão de usuários** com 4 níveis de permissão
- ✅ **Personalização visual** (logo e cores corporativas)
- ✅ **Controle de acesso** baseado em roles
- ✅ **Logs e auditoria** completos

---

## 🏗️ Arquitetura

### Padrão Arquitetural
- **Clean Architecture** (Controllers → Services → Repositories → Entities)
- **Backend API REST** com NestJS e documentação Swagger
- **Frontend SPA** com Next.js 14 e App Router
- **Autenticação JWT** com refresh tokens

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              Next.js 14 + React 18 + TypeScript             │
│         TailwindCSS | Zustand | React Hook Form            │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS (JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API REST (Backend)                     │
│                 NestJS 10 + TypeScript                      │
│      JWT Auth | Validation | Guards | Interceptors         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS                            │
│                  PostgreSQL 14+ (Prisma ORM)                │
│        Users | Complaints | Attachments | Comments          │
│             Notifications | Settings | StatusHistory        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ARMAZENAMENTO                            │
│         Sistema de Arquivos (uploads/ directory)            │
│              Suporte futuro para AWS S3                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Stack Tecnológica

### Backend
| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Node.js** | 18.x+ | Runtime JavaScript |
| **NestJS** | 10.x | Framework modular e escalável |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.x | ORM (PostgreSQL) |
| **PostgreSQL** | 14.x+ | Banco de dados relacional |
| **Passport.js** | - | Autenticação (JWT + Local) |
| **bcrypt** | 5.1+ | Hash de senhas |
| **Swagger** | - | Documentação automática da API |
| **Nodemailer** | - | Envio de emails |
| **Multer** | - | Upload de arquivos |

### Frontend
| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Next.js** | 14.x | Framework React com SSR |
| **React** | 18.x | Biblioteca UI |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 3.x | Framework CSS utilitário |
| **Zustand** | 4.x | State management |
| **Axios** | - | Cliente HTTP |
| **React Hook Form** | - | Gerenciamento de formulários |
| **Zod** | - | Validação de schemas |
| **Recharts** | - | Gráficos e visualizações |
| **Lucide React** | - | Ícones modernos |
| **Sonner** | - | Toast notifications |

### DevOps & Ferramentas
| Ferramenta | Propósito |
|-----------|-----------|
| **Docker** | Containerização (docker-compose.dev.yml) |
| **PowerShell** | Scripts de automação (Windows) |
| **Git** | Controle de versão |

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação & Autorização
- ✅ JWT com **refresh tokens** (Access: 15min | Refresh: 7 dias)
- ✅ **RBAC** com 4 roles (ADMIN, INVESTIGATOR, REPORTER, VIEWER)
- ✅ Guards e decorators para proteção de rotas
- ✅ Hash de senhas com **bcrypt**
- ✅ Recuperação de senha por email

### 📝 Gestão de Denúncias
- ✅ Criação de denúncias **anônimas**
- ✅ **Protocolo único** alfanumérico (ex: DEN-2024-ABC123)
- ✅ **9 tipos de denúncia** (Assédio,Fraude, Discriminação, etc.)
- ✅ **5 níveis de prioridade** (VERY_LOW → CRITICAL)
- ✅ **4 status** (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- ✅ **Timeline com 6 estágios** de investigação
- ✅ Histórico completo de mudanças de status
- ✅ **Busca funcional** por protocolo, título, tipo e status

### 📎 Upload de Anexos
- ✅ Upload seguro com validação de tipo e tamanho
- ✅ Tipos permitidos: **PDF, DOCX, PNG, JPG, JPEG**
- ✅ Limite configurável (padrão: 10MB)
- ✅ Visualização e download de arquivos
- ✅ Exclusão de anexos

### � Dossiês e Relatórios (✨ Novo!)
- ✅ **Geração de relatórios PDF** completos e estruturados
- ✅ **5 seções**: Resumo, Timeline, Histórico, Anexos, Log de Auditoria
- ✅ **Download seguro** via botão na interface
- ✅ Controle de acesso por **roles** (ADMIN, AUDITOR, INVESTIGATOR)
- ✅ **Marca d'água confidencial** em todas as páginas
- ✅ Footers personalizados com paginação
- ✅ Auditoria completa de downloads
- ✅ Armazenamento local (desenvolvimento) com suporte para S3
- 📖 **[Documentação Completa](FUNCIONALIDADE-DOSSIERS.md)**

### �💬 Sistema de Comentários
- ✅ Comentários vinculados a denúncias
- ✅ Identificação de autor
- ✅ Timeline cronológica
- ✅ Edição e exclusão

### 🔔 Notificações
- ✅ **Email** com templates HTML
- ✅ Notificações **in-app** no dashboard
- ✅ **3 canais** (APP, EMAIL, SMS preparado)
- ✅ **4 tipos** (NEW_COMPLAINT, STATUS_CHANGE, NEW_COMMENT, ASSIGNMENT)
- ✅ Contadores de não lidas
- ✅ Marcar como lido (individual e em massa)

### 📊 Dashboard Administrativo
- ✅ **Estatísticas em tempo real** (total, pendentes, em progresso, resolvidos)
- ✅ **Gráficos com Recharts** (status, tipos, prioridades)
- ✅ **Busca funcional** com resultados em tabela
- ✅ Navegação sem perda de contexto
- ✅ Interface responsiva

### 👥 Gestão de Usuários
- ✅ **CRUD completo** de usuários (Admin)
- ✅ Atribuição de roles
- ✅ Listagem com paginação
- ✅ Filtros e busca

### 🎨 Personalização
- ✅ Upload de **logo personalizado**
- ✅ **Cores corporativas** configuráveis
- ✅ Nome da empresa customizável
- ✅ Aplicação em toda interface

### 🌐 Páginas Públicas
- ✅ **Landing page** com hero e features
- ✅ **Nova Denúncia** (formulário público anônimo)
- ✅ **Acompanhar Denúncia** por protocolo
- ✅ **Login** com logo clicável para homepage
- ✅ Interface moderna e responsiva

---

## 📦 Instalação Rápida

> 💡 **Nota:** Consulte [GUIA-INSTALACAO-COMPLETO.md](GUIA-INSTALACAO-COMPLETO.md) para instruções detalhadas

### Pré-requisitos

```powershell
# Verificar versões mínimas
node -v   # >= 18.0.0
npm -v    # >= 9.0.0
psql --version # PostgreSQL >= 14.0
```

### Opção A: Início Rápido (Windows PowerShell)

```powershell
# 1. Clonar repositório
git clone https://github.com/seu-usuario/canal-denuncia.git
cd canal-denuncia

# 2. Executar script de instalação completa
.\iniciar-sistema.ps1
```

O script automaticamente irá:
- ✅ Instalar dependências do backend e frontend
- ✅ Configurar variáveis de ambiente
- ✅ Configurar PostgreSQL (criar DB + migrations)
- ✅ Popular banco com dados demo
- ✅ Iniciar ambos os servidores

### Opção B: Instalação Manual

#### 1️⃣ Clonar e Instalar Dependências

```powershell
# Clonar repositório
git clone https://github.com/seu-usuario/canal-denuncia.git
cd canal-denuncia

# Instalar dependências do backend
cd apps/backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

#### 2️⃣ Configurar PostgreSQL

```powershell
# Voltar para raiz
cd ../..

# Executar script de configuração do PostgreSQL
.\configurar-postgres.ps1
```

Ou manualmente:
```sql
-- Criar banco de dados
CREATE DATABASE canal_denuncia;

-- Criar usuário (opcional)
CREATE USER canal_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE canal_denuncia TO canal_user;
```

#### 3️⃣ Configurar Variáveis de Ambiente

```powershell
# Backend (.env)
cd apps/backend
cp .env.example .env

# Editar apps/backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canal_denuncia"
JWT_SECRET="seu_secret_super_seguro_aqui"
JWT_REFRESH_SECRET="outro_secret_para_refresh"
FRONTEND_URL="http://localhost:3001"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
```

```powershell
# Frontend (.env.local)
cd ../frontend
cp .env.example .env.local

# Editar apps/frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

#### 4️⃣ Executar Migrations e Seed

```powershell
cd apps/backend

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Popular com dados demo (opcional)
npx prisma db seed
```

#### 5️⃣ Iniciar Servidores

```powershell
# Terminal 1 - Backend
cd apps/backend
npm run start:dev
# Rodando em: http://localhost:3000

# Terminal 2 - Frontend  
cd apps/frontend
npm run dev
# Rodando em: http://localhost:3001
```

---

## 🔑 Credenciais de Teste

Após executar o seed, você terá os seguintes usuários de demonstração:

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| admin@example.com | admin123 | ADMIN | Administrador completo |
| investigator@example.com | inv123 | INVESTIGATOR | Investigador de denúncias |
| reporter@example.com | rep123 | REPORTER | Denunciante interno |
| viewer@example.com | view123 | VIEWER | Visualizador (somente leitura) |

**🔐 Importante:** Altere estas credenciais em produção!

---

## 📖 API Endpoints

### Autenticação

```typescript
POST   /auth/register       // Registro de novo usuário
POST   /auth/login          // Login (retorna access + refresh tokens)
POST   /auth/refresh        // Renovar access token
POST   /auth/logout         // Logout (invalida refresh token)
POST   /auth/forgot-password // Solicitar reset de senha
POST   /auth/reset-password  // Resetar senha com token
```

### Denúncias (Complaints)

```typescript
GET    /complaints          // Listar denúncias (com paginação e busca)
POST   /complaints          // Criar nova denúncia
GET    /complaints/:id      // Detalhes de uma denúncia
PATCH  /complaints/:id      // Atualizar denúncia
DELETE /complaints/:id      // Excluir denúncia
GET    /complaints/stats    // Estatísticas do dashboard
GET    /complaints/protocol/:protocol // Buscar por protocolo
```

### Anexos (Attachments)

```typescript
POST   /attachments         // Upload de arquivo
GET    /attachments/:id     // Detalhes do anexo
GET    /attachments/:id/download // Download do arquivo
DELETE /attachments/:id     // Excluir anexo
```

### Comentários (Comments)

```typescript
GET    /comments/complaint/:id // Listar comentários de uma denúncia
POST   /comments              // Criar comentário
PATCH  /comments/:id          // Editar comentário
DELETE /comments/:id          // Excluir comentário
```

### Notificações (Notifications)

```typescript
GET    /notifications              // Listar notificações do usuário
GET    /notifications/unread-count // Contador de não lidas
PATCH  /notifications/:id/read     // Marcar como lida
PATCH  /notifications/mark-all-read // Marcar todas como lidas
```

### Usuários (Users)

```typescript
GET    /users               // Listar usuários (Admin)
POST   /users               // Criar usuário (Admin)
GET    /users/:id           // Visualizar usuário
PATCH  /users/:id           // Atualizar usuário
DELETE /users/:id           // Excluir usuário (Admin)
GET    /users/me            // Dados do usuário autenticado
```

### Configurações (Settings)

```typescript
GET    /settings            // Obter configurações da empresa
PATCH  /settings            // Atualizar configurações (Admin)
```

📚 **Documentação Interativa:** Acesse `http://localhost:3000/api/docs` (Swagger UI) com o backend rodando para testar todos os endpoints!

---

## 🛠️ Desenvolvimento Local

### Estrutura de Comandos

```bash
# Raiz do monorepo (turborepo)
npm run dev          # Inicia todos os apps em modo watch
npm run build        # Build de produção
npm run test         # Roda todos os testes
npm run lint         # ESLint em todos os projetos
npm run format       # Prettier

# Backend específico
cd apps/backend
npm run dev          # Dev mode com hot-reload
npm run start:prod   # Produção
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run test:cov     # Coverage report

# Prisma
npm run prisma:studio       # UI do banco de dados
npm run prisma:migrate:prod # Rodar migrations em prod
```

### Acessos Úteis (Dev)

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Backend API** | http://localhost:3000 | - |
| **Swagger Docs** | http://localhost:3000/api/v1/docs | - |
| **Prisma Studio** | http://localhost:5555 | - |
| **RabbitMQ Management** | http://localhost:15672 | denuncia_user / secure_password |
| **Kibana** | http://localhost:5601 | - |
| **Adminer (DB UI)** | http://localhost:8080 | postgres / denuncia_user / secure_password |

---

## 📡 API - Exemplos cURL

### 🔐 Autenticação

#### Registrar Novo Usuário

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "denunciante@empresa.com",
    "password": "SenhaSegura123!",
    "fullName": "João Silva"
  }'
```

**Resposta (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "denunciante@empresa.com",
    "password": "SenhaSegura123!"
  }'
```

#### Renovar Access Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Obter Perfil do Usuário Logado

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 📝 Denúncias (em desenvolvimento - próximo módulo)

#### Criar Denúncia Anônima

```bash
curl -X POST http://localhost:3000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "isAnonymous": true,
    "type": "HARASSMENT",
    "priority": "HIGH",
    "title": "Assédio moral na área de TI",
    "description": "Relato detalhado do incidente...",
    "location": "Sala 305 - TI",
    "incidentDate": "2024-01-10T14:30:00Z",
    "involvedPeople": ["João da Silva", "Maria Oliveira"],
    "witnesses": ["Pedro Santos"]
  }'
```

**Resposta esperada:**
```json
{
  "id": "uuid-da-denuncia",
  "protocol": "DEN-2024-A7B3C9",
  "status": "PENDING",
  "message": "Denúncia registrada com sucesso. Guarde seu protocolo para acompanhamento."
}
```

#### Consultar Status por Protocolo

```bash
curl -X GET http://localhost:3000/api/v1/complaints/protocol/DEN-2024-A7B3C9
```

---

## 🐳 Deploy

### Docker Compose (Produção Simplificada)

```bash
# Build das imagens
docker-compose build

# Subir stack completo
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar tudo
docker-compose down
```

### Kubernetes (Produção Escalável)

```bash
# Aplicar manifests (exemplo)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar pods
kubectl get pods -n canal-denuncia

# Logs
kubectl logs -f deployment/backend -n canal-denuncia
```

### CI/CD (GitHub Actions)

O pipeline está em `.github/workflows/ci-cd.yml` e executa:

1. **Lint** e **Format** check
2. **Testes unitários** e de integração
3. **Build** da aplicação
4. **Build e push** da imagem Docker
5. **Deploy** para ambiente (staging/production)

**Variáveis necessárias no GitHub Secrets:**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

---

## 🔒 Conformidade & Segurança

### LGPD (Lei Geral de Proteção de Dados)

✅ **Minimização de dados**: Coleta apenas informações essenciais  
✅ **Anonimização**: Denúncias anônimas não armazenam PII  
✅ **Criptografia**: AES-256 para dados sensíveis em repouso  
✅ **Direitos do titular**: Endpoints para consulta, exclusão e restrição  
✅ **Logs de consentimento**: Auditoria de aceites e termos  
✅ **Retenção**: Política de expurgo após período legal (padrão: 7 anos)

### ISO 27001 (Segurança da Informação)

✅ **Controle de acesso**: RBAC com princípio do menor privilégio  
✅ **Autenticação forte**: JWT + refresh tokens + revogação  
✅ **Criptografia**: TLS 1.3 em trânsito, AES-256 em repouso  
✅ **Logs de auditoria**: Imutáveis e com timestamp  
✅ **Backup e recovery**: Estratégia de disaster recovery  
✅ **Gestão de incidentes**: Workflow de resposta a incidentes

### ISO 37002 & 37301 (Compliance e Whistleblowing)

✅ **Confidencialidade**: Garantia de proteção da identidade  
✅ **Acessibilidade**: Canal disponível 24/7  
✅ **Investigação imparcial**: Separação de roles (investigator vs. admin)  
✅ **Não retaliação**: Mecanismo de bloqueio de citados  
✅ **Cadeia de custódia**: Evidências com hash e timestamps  
✅ **Relatórios periódicos**: Dashboards para comitê de ética

### Medidas de Segurança Implementadas

| Camada | Proteção |
|--------|----------|
| **Rede** | TLS 1.3, Rate Limiting, DDoS protection (Cloudflare) |
| **Aplicação** | Helmet.js, CORS, CSRF tokens, Input validation |
| **Dados** | Criptografia AES-256, Hash bcrypt (12 rounds), Prepared statements |
| **Infraestrutura** | Secrets management (Vault), Network isolation, WAF |
| **Observabilidade** | ELK stack, alertas automáticos, tracing OpenTelemetry |

---

## 🧪 Testes

### Executar Testes

```bash
# Unitários
npm run test

# E2E
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Coverage Mínimo

| Tipo | Target |
|------|--------|
| **Statements** | 80% |
| **Branches** | 75% |
| **Functions** | 80% |
| **Lines** | 80% |

### Exemplo de Teste (AuthService)

```typescript
describe('AuthService - Login', () => {
  it('deve autenticar usuário com credenciais válidas', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('deve lançar UnauthorizedException para senha inválida', async () => {
    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
```

---

## 📁 Estrutura do Projeto

```
canal-denuncia-corporativo/
├── apps/
│   ├── backend/                 # API NestJS
│   │   ├── src/
│   │   │   ├── modules/         # Módulos funcionais
│   │   │   │   ├── auth/        # 🔐 Autenticação
│   │   │   │   ├── users/       # 👥 Usuários
│   │   │   │   ├── complaints/  # 📝 Denúncias
│   │   │   │   ├── dossiers/    # 📂 Dossiês
│   │   │   │   ├── audit/       # 🔍 Auditoria
│   │   │   │   └── notifications/ # 🔔 Notificações
│   │   │   ├── shared/          # Módulos compartilhados
│   │   │   │   ├── prisma/      # Prisma Service
│   │   │   │   ├── logger/      # Winston Logger
│   │   │   │   ├── s3/          # AWS S3 Service
│   │   │   │   └── rabbitmq/    # RabbitMQ Service
│   │   │   ├── config/          # Configurações
│   │   │   ├── main.ts          # Bootstrap
│   │   │   └── app.module.ts    # Root Module
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Schema do banco
│   │   │   ├── migrations/      # Migrations
│   │   │   └── seed.ts          # Seed data
│   │   ├── test/                # Testes E2E
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/                # React App (próxima etapa)
│       ├── src/
│       ├── public/
│       └── package.json
│
├── packages/                    # Shared packages
│   └── types/                   # Tipos TypeScript compartilhados
│
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── postgres-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   └── ingress.yaml
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # Pipeline CI/CD
│
├── docs/                        # Documentação adicional
│   ├── API.md                   # Documentação da API
│   ├── ARCHITECTURE.md          # Decisões arquiteturais
│   ├── SECURITY.md              # Políticas de segurança
│   └── DEPLOYMENT.md            # Guias de deploy
│
├── docker-compose.dev.yml       # Dev environment
├── docker-compose.yml           # Production
├── turbo.json                   # Turborepo config
├── package.json                 # Root package
├── .gitignore
└── README.md                    # Este arquivo
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções de Commit (Conventional Commits)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto é proprietário. © 2024 Marcos Augusto Consultoria de Compliance. Todos os direitos reservados.

---

## 📞 Suporte

- **Email**: compliance@suaempresa.com
- **Documentação**: https://docs.suaempresa.com/canal-denuncia
- **Issues**: https://github.com/maugusilima/canal-denuncia-corporativo/issues

---

## 🗺️ Roadmap

### ✅ Fase 1 - MVP Backend (Concluída)
- [x] Autenticação JWT + Refresh Tokens
- [x] RBAC completo
- [x] Módulo de usuários
- [x] Logs de auditoria
- [x] Documentação Swagger
- [x] Testes unitários
- [x] Docker Compose

### ✅ Fase 2 - Denúncias (Concluída)
- [x] CRUD completo de denúncias
- [x] Workflow de 6 status
- [x] Bloqueio automático de envolvidos
- [x] Histórico de alterações
- [x] Estatísticas agregadas
- [x] Testes unitários (25+)

### ✅ Fase 3 - Anexos & AWS S3 (Concluída)
- [x] Upload de arquivos com validação
- [x] AWS S3 Integration + LocalStack
- [x] Presigned URLs temporárias
- [x] Verificação de integridade SHA-256
- [x] Soft delete com auditoria
- [x] Estatísticas de armazenamento
- [x] Documentação completa

### 📋 Fase 4 - Frontend
- [ ] Interface de denúncia pública
- [ ] Dashboard do denunciante
- [ ] Painel do comitê
- [ ] Painel administrativo
- [ ] Personalização visual

### 📋 Fase 5 - Avançado
- [ ] Geração de dossiês (PDF/ZIP)
- [ ] Sistema de notificações (Email + Push)
- [ ] Dashboards e KPIs
- [ ] Exportação de relatórios
- [ ] Webhooks
- [ ] Assinatura digital de documentos

### 📋 Fase 6 - Produção
- [ ] Kubernetes manifests completos
- [ ] CI/CD configurado
- [ ] Monitoramento (Grafana + Prometheus)
- [ ] Load testing
- [ ] Documentação de operações

---

<div align="center">

**Desenvolvido com ☕ e 🧠 por uma OG7 de engenharia sênior**

*"Compliance não é custo, é investimento em confiança."*

</div>
