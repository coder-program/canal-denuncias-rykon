# 🔧 SOLUÇÃO: Backend Precisa do PostgreSQL

## ❌ Erro Atual

```
PrismaClientInitializationError: Can't reach database server at `localhost:5433`
```

O **backend NestJS** não consegue se conectar ao banco de dados PostgreSQL.

---

## ✅ SOLUÇÕES (Escolha uma)

### 🎯 OPÇÃO 1: Usar SQLite (Mais Fácil - SEM PostgreSQL)

**Vantagem:** Não precisa instalar PostgreSQL, funciona direto!

#### Passos:

1. **Edite o arquivo `apps/backend/prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "sqlite"  // MUDE DE "postgresql" PARA "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Edite o arquivo `apps/backend/.env`:**

```env
DATABASE_URL="file:./dev.db"
```

3. **Execute os comandos:**

```powershell
cd apps\backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

### 🐘 OPÇÃO 2: Instalar PostgreSQL no Windows

#### Passos:

1. **Baixe o PostgreSQL:**
   - Acesse: https://www.postgresql.org/download/windows/
   - Baixe o instalador do PostgreSQL 16+

2. **Instale com essas configurações:**
   - Porta: **5432** (padrão)
   - Senha do usuário `postgres`: **escolha uma senha forte**

3. **Crie o arquivo `apps/backend/.env`:**

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/canal_denuncia?schema=public"
JWT_SECRET="seu-secret-super-secreto-aqui-123"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto-aqui-456"
```

⚠️ **IMPORTANTE:** Troque `SUA_SENHA` pela senha que você definiu na instalação!

4. **Execute os comandos:**

```powershell
cd apps\backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

### 🐳 OPÇÃO 3: Usar Docker (Para quem tem Docker instalado)

#### Passo 1: Inicie o container PostgreSQL

```powershell
docker run -d `
  --name postgres-canal `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=canal_denuncia `
  -p 5433:5432 `
  postgres:16-alpine
```

#### Passo 2: Crie o arquivo `apps/backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/canal_denuncia?schema=public"
JWT_SECRET="seu-secret-super-secreto-aqui-123"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto-aqui-456"
```

#### Passo 3: Execute os comandos

```powershell
cd apps\backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

## 🚀 Após Resolver o Banco de Dados

### 1. Backend deve mostrar:

```
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

### 2. Teste a conexão:

No PowerShell:
```powershell
Invoke-WebRequest http://localhost:3000/api/v1
```

Deve retornar: `StatusCode: 200`

### 3. Acesse o frontend:

```
http://localhost:3001/login
```

**Credenciais:**
- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## 📝 Arquivos Importantes

### `apps/backend/.env` (exemplo completo)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canal_denuncia?schema=public"

# JWT
JWT_SECRET="seu-secret-super-secreto-aqui-change-me-in-production-123"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto-aqui-change-me-in-production-456"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# API
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# CORS
FRONTEND_URL="http://localhost:3001"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# AWS S3 (opcional - para uploads)
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"
# AWS_S3_BUCKET="canal-denuncia-files"

# Email (opcional - para notificações)
# MAIL_HOST="smtp.gmail.com"
# MAIL_PORT=587
# MAIL_USER="seu-email@gmail.com"
# MAIL_PASSWORD="sua-senha-app"
# MAIL_FROM="noreply@canaldenuncia.com"

# Elasticsearch (opcional - para logs)
# ELASTICSEARCH_NODE="http://localhost:9200"
# ELASTICSEARCH_USERNAME="elastic"
# ELASTICSEARCH_PASSWORD="changeme"
```

---

## 🎯 Recomendação

**Para desenvolvimento rápido:** Use **OPÇÃO 1 (SQLite)**
- Não precisa instalar nada
- Funciona imediatamente
- Perfeito para testes e desenvolvimento

**Para produção:** Use **PostgreSQL** (Opção 2 ou 3)
- Mais robusto
- Melhor performance
- Recomendado para deploy

---

## 🆘 Ainda com Problemas?

### Erro: "Prisma schema not found"

```powershell
cd apps\backend
npx prisma generate
```

### Erro: "Environment variable not found: DATABASE_URL"

Certifique-se que o arquivo `.env` existe em `apps/backend/.env`

### Erro: "Migration failed"

```powershell
cd apps\backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## ✅ Checklist

- [ ] Escolhi uma opção (SQLite, PostgreSQL ou Docker)
- [ ] Criei/editei o arquivo `apps/backend/.env`
- [ ] Executei `npx prisma generate`
- [ ] Executei `npx prisma migrate dev --name init`
- [ ] Executei `npm run dev` no backend
- [ ] Backend mostrou "Application is running on: http://localhost:3000"
- [ ] Testei login no frontend (http://localhost:3001/login)
- [ ] Login funcionou sem `ERR_CONNECTION_REFUSED`! 🎉

