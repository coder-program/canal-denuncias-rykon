# ========================================
# GUIA RÁPIDO - SETUP DO PROJETO
# ========================================

## 📋 Pré-requisitos

1. **Node.js** 18+ instalado
2. **Docker Desktop** rodando
3. **Git** instalado
4. **AWS CLI** (opcional, para produção)

---

## 🚀 Setup Inicial (Primeira Vez)

### 1. Instalar Dependências

```bash
cd apps/backend
npm install
```

### 2. Subir Infraestrutura Local (Docker)

```bash
# Na raiz do projeto
docker-compose -f docker-compose.dev.yml up -d
```

**Serviços iniciados:**
- PostgreSQL (porta 5432)
- MongoDB (porta 27017)
- RabbitMQ (porta 5672, UI: 15672)
- Elasticsearch (porta 9200)
- LocalStack/S3 (porta 4566)

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na pasta `apps/backend/`:

```bash
# apps/backend/.env.local

# ====================================
# APPLICATION
# ====================================
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# ====================================
# DATABASE - PostgreSQL
# ====================================
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia?schema=public"

# ====================================
# DATABASE - MongoDB
# ====================================
MONGODB_URI="mongodb://denuncia_user:secure_password@localhost:27017/canal_denuncia_docs"

# ====================================
# JWT & AUTHENTICATION
# ====================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-minimum-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ====================================
# ENCRYPTION (AES-256 para PII)
# ====================================
ENCRYPTION_KEY=your-32-char-encryption-key-here-change-in-prod

# ====================================
# AWS S3 - LocalStack (Desenvolvimento)
# ====================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=canal-denuncia-attachments
AWS_ENDPOINT=http://localhost:4566
S3_PRESIGNED_URL_EXPIRATION=3600

# ====================================
# EMAIL (SMTP)
# ====================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@suaempresa.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=Canal de Denúncias <noreply@suaempresa.com>

# ====================================
# RABBITMQ (Mensageria)
# ====================================
RABBITMQ_URI=amqp://denuncia_user:secure_password@localhost:5672

# ====================================
# ELASTICSEARCH (Logs & Auditoria)
# ====================================
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# ====================================
# RATE LIMITING
# ====================================
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ====================================
# CORS
# ====================================
CORS_ORIGIN=http://localhost:5173

# ====================================
# FRONTEND URL (para links em emails)
# ====================================
FRONTEND_URL=http://localhost:5173

# ====================================
# FILE UPLOAD LIMITS
# ====================================
MAX_FILE_SIZE=26214400
ALLOWED_FILE_TYPES=pdf,png,jpg,jpeg,doc,docx,zip

# ====================================
# AUDIT & COMPLIANCE
# ====================================
ENABLE_AUDIT_LOG=true
DATA_RETENTION_DAYS=2555
```

### 4. Executar Migrações Prisma

```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

### 5. Criar Bucket S3 no LocalStack

```bash
# Usando AWS CLI
aws --endpoint-url=http://localhost:4566 s3 mb s3://canal-denuncia-attachments

# OU usando o script automatizado
npx ts-node scripts/setup-localstack.ts
```

### 6. Seed do Banco (Opcional - Dados de Teste)

```bash
npx prisma db seed
```

### 7. Iniciar Aplicação

```bash
npm run start:dev
```

Acesse:
- **API**: http://localhost:3000/api/v1
- **Swagger**: http://localhost:3000/api/docs

---

## 🧪 Executar Testes

### Todos os Testes
```bash
npm test
```

### Testes Específicos
```bash
# AttachmentsService
npm test -- attachments.service.spec

# S3Service
npm test -- s3.service.spec

# ComplaintsService
npm test -- complaints.service.spec
```

### Cobertura de Testes
```bash
npm run test:cov
```

---

## 🔍 Verificar Status dos Serviços

### Docker
```bash
docker ps
```

### PostgreSQL
```bash
docker exec -it canal-denuncia-postgres psql -U denuncia_user -d canal_denuncia
```

### MongoDB
```bash
docker exec -it canal-denuncia-mongo mongosh -u denuncia_user -p secure_password
```

### RabbitMQ UI
http://localhost:15672  
User: `denuncia_user` / Password: `secure_password`

### Elasticsearch
http://localhost:9200  
User: `elastic` / Password: `changeme`

### LocalStack/S3
```bash
# Listar buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# Listar arquivos no bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://canal-denuncia-attachments/
```

---

## 📝 Fluxo de Desenvolvimento

### 1. Criar Nova Feature

```bash
# Criar branch
git checkout -b feature/nova-feature

# Criar módulo NestJS
nest g module modules/nova-feature
nest g service modules/nova-feature
nest g controller modules/nova-feature
```

### 2. Modificar Schema Prisma

```bash
# Editar prisma/schema.prisma
# Executar migração
npx prisma migrate dev --name add_new_table

# Gerar tipos TypeScript
npx prisma generate
```

### 3. Criar Testes

```bash
# Criar arquivo de teste
# modules/nova-feature/__tests__/nova-feature.service.spec.ts

# Executar testes
npm test -- nova-feature.service.spec
```

### 4. Testar API

```bash
# Usando cURL
curl -X GET http://localhost:3000/api/v1/nova-feature \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Ou usando Postman/Insomnia
```

### 5. Commit e Push

```bash
git add .
git commit -m "feat: adicionar nova feature"
git push origin feature/nova-feature
```

---

## 🎯 Endpoints Principais

### Autenticação
```bash
# Login
POST /api/v1/auth/login
Body: { "email": "admin@test.com", "password": "senha123" }

# Obter novo access token
POST /api/v1/auth/refresh
Body: { "refreshToken": "<REFRESH_TOKEN>" }
```

### Denúncias
```bash
# Criar denúncia
POST /api/v1/complaints
Body: { "title": "Título", "description": "Descrição", ... }

# Listar denúncias
GET /api/v1/complaints

# Buscar por protocolo
GET /api/v1/complaints/protocol/DEN-2024-001234
```

### Anexos
```bash
# Upload de anexo
POST /api/v1/attachments/complaint/:complaintId
Content-Type: multipart/form-data
Body: file=@./evidence.pdf

# Listar anexos
GET /api/v1/attachments/complaint/:complaintId

# Download URL
GET /api/v1/attachments/:id/download
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module @nestjs/..."
```bash
cd apps/backend
npm install
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Recriar container
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Erro: "LocalStack connection refused"
```bash
# Verificar se LocalStack está rodando
docker logs canal-denuncia-localstack

# Recriar container
docker-compose -f docker-compose.dev.yml down localstack
docker-compose -f docker-compose.dev.yml up -d localstack
```

### Erro: Prisma "Type 'Attachment' not found"
```bash
# Regerar tipos Prisma
npx prisma generate
```

### Portas em uso
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000,5432,27017 | Format-Table

# Matar processo
Stop-Process -Id <PID> -Force
```

---

## 📚 Documentação Adicional

- [Arquitetura](docs/ARCHITECTURE.md)
- [API de Denúncias](docs/COMPLAINTS-API-EXAMPLES.md)
- [API de Anexos](docs/ATTACHMENTS-API-EXAMPLES.md)
- [LocalStack Setup](docs/LOCALSTACK-SETUP.md)
- [Fase 2 Summary](docs/PHASE-2-SUMMARY.md)
- [Fase 3 Summary](docs/PHASE-3-SUMMARY.md)
- [Changelog](CHANGELOG.md)

---

## 🔒 Credenciais Padrão (Desenvolvimento)

### Admin User (após seed)
- Email: `admin@test.com`
- Password: `Admin@123`
- Role: `ADMIN`

### Investigator User
- Email: `investigator@test.com`
- Password: `Invest@123`
- Role: `INVESTIGATOR`

### Reporter User
- Email: `reporter@test.com`
- Password: `Report@123`
- Role: `REPORTER`

---

## ⚠️ IMPORTANTE - Produção

**NUNCA** use as credenciais padrão em produção!

- Altere todas as senhas e secrets
- Desabilite `AWS_ENDPOINT` (use S3 real)
- Configure SSL/TLS nos bancos de dados
- Use variáveis de ambiente seguras (AWS Secrets Manager, Azure Key Vault)
- Habilite 2FA para contas admin
- Configure backup automático
- Monitore logs com Grafana/Prometheus

---

**Status do Projeto:** 🟢 Fase 3 Completa  
**Próxima Fase:** Dossiers + Notifications + Frontend  
**Versão:** v1.2.0
