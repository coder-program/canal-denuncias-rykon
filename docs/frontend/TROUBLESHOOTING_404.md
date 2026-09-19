# 🔧 Como Resolver Erro 404 no Login

## Problema

```
POST http://localhost:3000/api/v1/auth/login 404 (Not Found)
```

## Causas Possíveis

1. ❌ **Backend NestJS não está rodando**
2. ❌ **Backend está em porta diferente**
3. ❌ **URL da API está incorreta no .env.local**
4. ❌ **CORS não está configurado no backend**

---

## ✅ Soluções

### 1. Verificar se o Backend está Rodando

```bash
# Abrir novo terminal
cd C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend

# Instalar dependências (se necessário)
npm install

# Iniciar backend em modo desenvolvimento
npm run start:dev
```

**Saída esperada:**

```
[Nest] 12345  - LOG [NestFactory] Starting Nest application...
[Nest] 12345  - LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - LOG Application is running on: http://localhost:3000
```

### 2. Verificar Porta do Backend

Se o backend estiver em **porta diferente** (ex: 3001), atualize o `.env.local`:

```bash
# apps/frontend/.env.local

# Se backend está em porta 3001:
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Se backend está em porta 3000:
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**Reinicie o frontend após alterar .env.local:**

```bash
# Parar servidor (Ctrl+C)
# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

### 3. Trocar Porta do Frontend

Se o backend está em **porta 3000** e o frontend também, altere a porta do frontend:

```bash
# apps/frontend/package.json
"scripts": {
  "dev": "next dev -p 3001 --turbopack"
}
```

Agora acesse: http://localhost:3001/login

### 4. Configurar CORS no Backend

O backend NestJS precisa aceitar requisições do frontend:

```typescript
// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:3001', // Frontend local
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Prefixo global /api/v1
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
  console.log(`Backend rodando em: http://localhost:3000/api/v1`);
}
bootstrap();
```

### 5. Testar Endpoints do Backend

```bash
# Verificar se o backend está acessível
curl http://localhost:3000/api/v1/auth/login

# Ou use PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET
```

**Resposta esperada:** Status 200 ou 404 (mas não erro de conexão)

---

## 🚀 Solução Rápida (Recomendada)

### Opção 1: Frontend na porta 3001, Backend na 3000

```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev -p 3001

# Acesse: http://localhost:3001/login
```

### Opção 2: Ambos na mesma porta usando Proxy

```typescript
// apps/frontend/next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};
```

Agora use apenas `/api/v1` (sem localhost):

```bash
# .env.local
NEXT_PUBLIC_API_URL=/api/v1
```

---

## 📋 Checklist de Diagnóstico

Execute estes comandos para diagnosticar:

```powershell
# 1. Verificar processos Node.js rodando
Get-Process -Name node -ErrorAction SilentlyContinue

# 2. Verificar portas em uso
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 3. Testar conexão com backend
Test-NetConnection -ComputerName localhost -Port 3000

# 4. Verificar variáveis de ambiente
cd apps/frontend
Get-Content .env.local
```

---

## 🔍 Verificar URLs no Código

### authService.ts

```typescript
// Deve usar a URL do .env.local
import { apiClient } from '../api';

export const authService = {
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};
```

### lib/api.ts

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL, // ✅ Correto
});
```

---

## ✅ Solução Definitiva

**Configuração Recomendada:**

1. **Backend** → Porta **3000**
2. **Frontend** → Porta **3001**
3. **.env.local** → `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`

```bash
# Terminal 1 - Backend
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
npm run start:dev

# Terminal 2 - Frontend (nova porta)
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"
npm run dev -- -p 3001

# Acessar: http://localhost:3001/login
```

---

## 🐛 Erros Comuns

### Erro: "EADDRINUSE: address already in use"

```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou no PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Erro: "Network Error" ou "ERR_CONNECTION_REFUSED"

```bash
# Backend não está rodando
cd apps/backend
npm run start:dev
```

### Erro: "CORS policy"

```typescript
// Adicionar no backend main.ts
app.enableCors({
  origin: ['http://localhost:3001'],
  credentials: true,
});
```

---

## ✅ Teste Final

1. ✅ Backend rodando: http://localhost:3000/api/v1
2. ✅ Frontend rodando: http://localhost:3001
3. ✅ .env.local com URL correta
4. ✅ CORS habilitado no backend
5. ✅ Login funcionando sem erro 404

---

**Problema resolvido!** 🎉
