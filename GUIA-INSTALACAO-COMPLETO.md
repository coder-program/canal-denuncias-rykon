# 🚀 Guia de Instalação Completo - Canal de Denúncias

**Data:** 09/02/2026  
**Sistema Operacional:** Windows  
**Tempo estimado:** 30-45 minutos

---

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Node.js](#instalação-do-nodejs)
3. [Instalação do Docker Desktop](#instalação-do-docker-desktop)
4. [Configuração do Projeto](#configuração-do-projeto)
5. [Inicialização do Sistema](#inicialização-do-sistema)
6. [Verificação](#verificação)
7. [Solução de Problemas](#solução-de-problemas)

---

## 🔧 Pré-requisitos

### Requisitos Mínimos do Sistema:
- **Windows 10/11** (64-bit)
- **8 GB RAM** (mínimo) | 16 GB recomendado
- **10 GB** de espaço livre em disco
- **Conexão com internet** para downloads

---

## 1️⃣ Instalação do Node.js

### Passo 1: Download
1. Acesse: **https://nodejs.org/**
2. Baixe a versão **LTS (Long Term Support)**
   - Versão recomendada: **v20.x.x** ou superior
   - Arquivo: `node-v20.x.x-x64.msi`

### Passo 2: Instalação
1. Execute o arquivo `.msi` baixado
2. Clique em **"Next"** na tela de boas-vindas
3. Aceite os termos de licença
4. **Importante:** Mantenha todas as opções padrão marcadas, incluindo:
   - ✅ Node.js runtime
   - ✅ npm package manager
   - ✅ Add to PATH (ESSENCIAL)
   - ✅ Tools for Native Modules
5. Clique em **"Install"**
6. Aguarde a instalação (2-5 minutos)
7. Clique em **"Finish"**

### Passo 3: Verificação
Abra um **NOVO PowerShell** (importante: feche qualquer terminal aberto antes) e execute:

```powershell
node --version
npm --version
```

**Resultado esperado:**
```
v20.x.x
10.x.x
```

Se aparecer erro "termo não reconhecido":
- Reinicie o computador
- Abra um novo PowerShell como Administrador
- Tente novamente

---

## 2️⃣ Instalação do Docker Desktop

### Passo 1: Download
1. Acesse: **https://www.docker.com/products/docker-desktop**
2. Clique em **"Download for Windows"**
3. Baixe o arquivo `Docker Desktop Installer.exe`

### Passo 2: Instalação
1. Execute o instalador como **Administrador**
2. Na tela de configuração, certifique-se de marcar:
   - ✅ Use WSL 2 instead of Hyper-V (recomendado)
   - ✅ Add shortcut to desktop
3. Clique em **"Ok"** e aguarde (5-10 minutos)
4. **Reinicie o computador** quando solicitado

### Passo 3: Configuração Inicial
1. Após reiniciar, abra o **Docker Desktop**
2. Aceite os termos de serviço
3. (Opcional) Faça login ou pule esta etapa
4. Aguarde até ver **"Docker Desktop is running"** (ícone verde)

### Passo 4: Verificação
No PowerShell, execute:

```powershell
docker --version
docker ps
```

**Resultado esperado:**
```
Docker version 24.x.x, build xxxxxxx

CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

---

## 3️⃣ Configuração do Projeto

### Passo 1: Abrir o Projeto no VS Code

1. Abra o **Visual Studio Code**
2. Navegue até a pasta do projeto:
   ```
   C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia
   ```

### Passo 2: Abrir Terminal Integrado

Pressione **`` Ctrl + ` ``** (ou menu **Terminal → New Terminal**)

### Passo 3: Instalar Dependências

Execute no terminal:

```powershell
# Instalar dependências do projeto (monorepo)
npm install
```

⏳ **Aguarde:** Este processo pode levar 5-10 minutos na primeira vez.

### Passo 4: Configurar Variáveis de Ambiente

#### Backend:
```powershell
cd apps\backend

# Criar arquivo .env
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

Se não existir `.env.example`, crie manualmente o arquivo `apps\backend\.env` com:

```env
# Database
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia?schema=public"

# JWT
JWT_SECRET="dev-jwt-secret-change-in-production-minimum-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="dev-encryption-key-change-in-production"

# AWS / LocalStack
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET_NAME=canal-denuncia-attachments

# Email (opcional para dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# App
PORT=3000
NODE_ENV=development
```

#### Frontend:
```powershell
cd ..\frontend

# Criar arquivo .env.local
```

Crie o arquivo `apps\frontend\.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 4️⃣ Inicialização do Sistema

### Passo 1: Iniciar Banco de Dados (Docker)

Na raiz do projeto:

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"

# Iniciar PostgreSQL, MongoDB e LocalStack
docker-compose -f docker-compose.dev.yml up -d
```

**Aguarde 10-15 segundos** para os containers iniciarem.

Verifique se estão rodando:
```powershell
docker ps
```

Deve mostrar 3 containers: `postgres`, `mongodb`, `localstack`

### Passo 2: Executar Migrações do Banco

```powershell
cd apps\backend

# Executar migrações Prisma
npm run prisma:migrate

# Carregar dados iniciais (admin, roles, etc)
npm run db:seed
```

### Passo 3: Iniciar Backend (Terminal 1)

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"

npm run start:dev
```

**Aguarde até ver:**
```
[Nest] ... LOG [NestApplication] Nest application successfully started
[Nest] ... LOG Application is running on: http://localhost:3000
```

✅ **Backend pronto!** Deixe este terminal aberto.

### Passo 4: Iniciar Frontend (Terminal 2)

**Abra um NOVO terminal** (Ctrl + Shift + `)

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"

npm run dev -- --port 3001
```

**Aguarde até ver:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
- Ready in 3.5s
```

✅ **Frontend pronto!** Deixe este terminal aberto também.

---

## 5️⃣ Verificação

### Teste 1: Acessar o Sistema

1. Abra o navegador em: **http://localhost:3001**
2. Deve aparecer a página de login do Canal de Denúncias

### Teste 2: Fazer Login

**Credenciais padrão:**
- **Email:** `admin@empresa.com`
- **Senha:** `Demo123!@`

### Teste 3: Verificar API

No navegador, acesse: **http://localhost:3000/api/v1**

Deve retornar JSON:
```json
{
  "message": "Canal de Denúncias API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 6️⃣ Atalhos e Scripts Úteis

### Criar Script de Inicialização Rápida

Salve como `iniciar.ps1` na raiz do projeto:

```powershell
# Inicialização Rápida - Canal de Denúncias

Write-Host "`n🚀 Iniciando Canal de Denúncias...`n" -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "✓ Verificando Docker..." -ForegroundColor Yellow
docker start postgres-canal mongodb-canal localstack-canal 2>$null
Start-Sleep -Seconds 3

# 2. Backend
Write-Host "✓ Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend'
npm run start:dev
"@

Start-Sleep -Seconds 5

# 3. Frontend
Write-Host "✓ Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend'
npm run dev -- --port 3001
"@

Write-Host "`n✅ Sistema iniciando em novas janelas!" -ForegroundColor Green
Write-Host "📱 Aguarde 20 segundos e acesse: http://localhost:3001`n" -ForegroundColor Cyan
```

**Para usar:**
```powershell
.\iniciar.ps1
```

---

## 7️⃣ Solução de Problemas

### ❌ Erro: "npm não é reconhecido"
**Causa:** Node.js não instalado ou PATH incorreto  
**Solução:**
1. Feche TODOS os terminais
2. Reinicie o computador
3. Abra novo PowerShell
4. Execute `node --version`

### ❌ Erro: "Docker daemon is not running"
**Causa:** Docker Desktop não está iniciado  
**Solução:**
1. Abra o Docker Desktop (ícone na barra de tarefas)
2. Aguarde até ficar verde ("Engine running")
3. Tente novamente

### ❌ Erro: "Port 3000 is already in use"
**Causa:** Processo anterior ainda rodando  
**Solução:**
```powershell
# Matar processos Node.js
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Reiniciar backend
cd apps\backend
npm run start:dev
```

### ❌ Erro: "Cannot connect to database"
**Causa:** PostgreSQL não está rodando  
**Solução:**
```powershell
# Verificar containers
docker ps -a

# Iniciar container se estiver parado
docker start postgres-canal

# Ou reiniciar tudo
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### ❌ Erro: "Prisma schema not found"
**Causa:** Dependências não instaladas  
**Solução:**
```powershell
cd apps\backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### ❌ Frontend mostra página em branco
**Causa:** API não está respondendo  
**Solução:**
1. Verifique se backend está rodando (http://localhost:3000/api/v1)
2. Verifique arquivo `apps\frontend\.env.local`
3. Limpe cache do Next.js:
```powershell
cd apps\frontend
Remove-Item .next -Recurse -Force
npm run dev -- --port 3001
```

---

## 📞 Comandos de Emergência

### Resetar Tudo
```powershell
# Parar tudo
docker-compose -f docker-compose.dev.yml down
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Limpar cache
cd apps\backend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue

cd ..\frontend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# Reinstalar
cd ..\..
npm install

# Reiniciar Docker
docker-compose -f docker-compose.dev.yml up -d
Start-Sleep -Seconds 10

# Reconstruir banco
cd apps\backend
npm run prisma:migrate
npm run db:seed
```

---

## 🎯 Checklist de Sucesso

- [ ] Node.js instalado (`node --version` funciona)
- [ ] npm instalado (`npm --version` funciona)
- [ ] Docker Desktop rodando (ícone verde)
- [ ] Dependências instaladas (`npm install` concluído)
- [ ] Arquivo `.env` criado no backend
- [ ] Arquivo `.env.local` criado no frontend
- [ ] Containers Docker rodando (`docker ps` mostra 3 containers)
- [ ] Migrações executadas (`npm run prisma:migrate`)
- [ ] Seed executado (`npm run db:seed`)
- [ ] Backend rodando (http://localhost:3000/api/v1 responde)
- [ ] Frontend rodando (http://localhost:3001 abre)
- [ ] Login funciona (admin@empresa.com / Demo123!@)

---

## 🎓 Próximos Passos

Após tudo funcionando:

1. **Explore o Sistema:**
   - Dashboard de administração
   - Criar nova denúncia
   - Gestão de usuários
   - Anexos e dossiês

2. **Leia a Documentação:**
   - [README.md](README.md) - Visão geral
   - [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Arquitetura
   - [docs/QUICKSTART.md](docs/QUICKSTART.md) - Guia rápido

3. **Execute os Testes:**
   ```powershell
   npm run test
   npm run test:e2e
   ```

---

## 📚 Recursos Adicionais

- **Node.js Docs:** https://nodejs.org/docs
- **Docker Docs:** https://docs.docker.com
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**✅ Instalação Completa!** Se todos os passos foram seguidos, o sistema deve estar rodando perfeitamente.

**❓ Problemas?** Verifique a seção [Solução de Problemas](#solução-de-problemas) ou crie uma issue no repositório.
