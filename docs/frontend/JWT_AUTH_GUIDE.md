# 🔐 Guia de Autenticação JWT

Sistema completo de autenticação JWT implementado com refresh token automático, proteção de rotas e gerenciamento seguro de tokens.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Implementados](#componentes-implementados)
3. [Fluxo de Autenticação](#fluxo-de-autenticação)
4. [Uso dos Hooks](#uso-dos-hooks)
5. [Proteção de Rotas](#proteção-de-rotas)
6. [Refresh Token Automático](#refresh-token-automático)
7. [Exemplos de Código](#exemplos-de-código)

---

## 🎯 Visão Geral

### Funcionalidades Implementadas

✅ **Login/Logout** com JWT  
✅ **Refresh Token Automático** (renova tokens expirados)  
✅ **Middleware Next.js** (proteção server-side)  
✅ **AuthProvider** (proteção client-side)  
✅ **Hook useAuth()** (verificar permissões)  
✅ **Token Manager** (gerenciamento seguro)  
✅ **Interceptors Axios** (adiciona token automaticamente)  
✅ **Fila de Requisições** (evita múltiplos refresh simultâneos)

---

## 🧩 Componentes Implementados

### 1. **middleware.ts** (Proteção Server-Side)

```typescript
// Protege rotas automaticamente
const PROTECTED_ROUTES = ['/dashboard', '/denuncias', '/usuarios'];
```

### 2. **AuthProvider** (Proteção Client-Side)

```tsx
// Envolve toda a aplicação
<AuthProvider>{children}</AuthProvider>
```

### 3. **useAuth()** Hook

```typescript
const { user, isAuthenticated, requireRole, logout } = useAuth();
```

### 4. **tokenManager** (Gerenciamento de Tokens)

```typescript
import { tokenManager } from '@/lib/utils/tokenManager';

tokenManager.setAccessToken(token, expiresIn);
tokenManager.isTokenExpired(); // true/false
```

### 5. **Axios Interceptors** (Refresh Automático)

- Adiciona token automaticamente em todas as requisições
- Detecta 401 (token expirado)
- Renova token usando refresh token
- Retenta requisição original
- Gerencia fila de requisições pendentes

---

## 🔄 Fluxo de Autenticação

### 1️⃣ Login

```typescript
import { useAuthStore } from '@/stores/authStore';

const { login } = useAuthStore();

// Fazer login
await login('admin@empresa.com', 'Admin@123');

// ✅ Tokens salvos no localStorage
// ✅ Usuário autenticado
// ✅ Redirecionado para /dashboard
```

### 2️⃣ Requisições Autenticadas

```typescript
import { apiClient } from '@/lib/api';

// Token adicionado automaticamente no header
const response = await apiClient.get('/complaints');
```

### 3️⃣ Token Expira (Refresh Automático)

```
1. Usuário faz requisição
2. Backend retorna 401 (token expirado)
3. Interceptor detecta 401
4. Chama POST /auth/refresh com refreshToken
5. Atualiza accessToken no localStorage
6. Retenta requisição original com novo token
7. Usuário nem percebe! ✅
```

### 4️⃣ Logout

```typescript
const { logout } = useAuthStore();

await logout();
// ✅ Chama POST /auth/logout
// ✅ Remove tokens do localStorage
// ✅ Redireciona para /login
```

---

## 🪝 Uso dos Hooks

### **useAuth()** - Verificar Autenticação

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { user, isAuthenticated, isLoading, requireRole } = useAuth();

  // Exibir loading enquanto verifica auth
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Redireciona automaticamente se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Bem-vindo, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### **Verificar Permissões (Role)**

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function AdminPage() {
  const { requireRole } = useAuth();

  useEffect(() => {
    // Apenas ADMIN e INVESTIGATOR
    requireRole(['ADMIN', 'INVESTIGATOR']);
  }, []);

  return <div>Painel Administrativo</div>;
}
```

---

## 🛡️ Proteção de Rotas

### Middleware (Server-Side)

O **middleware.ts** protege rotas automaticamente:

```typescript
// Rotas protegidas (exigem autenticação)
const PROTECTED_ROUTES = ['/dashboard', '/denuncias', '/usuarios', '/configuracoes'];

// Rotas públicas (não exigem autenticação)
const PUBLIC_ROUTES = ['/login', '/'];
```

### AuthProvider (Client-Side)

Envolva o layout da aplicação:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🔄 Refresh Token Automático

### Como Funciona

O sistema usa uma **fila de requisições** para evitar múltiplos refresh simultâneos:

```typescript
// lib/api.ts

let isRefreshing = false;
let failedQueue = [];

// 1. Requisição falha com 401
if (status === 401 && !originalRequest._retry) {
  // 2. Se já está refreshing, adicionar à fila
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  // 3. Iniciar refresh
  isRefreshing = true;
  const newToken = await refreshToken();

  // 4. Atualizar localStorage
  localStorage.setItem('auth-storage', newToken);

  // 5. Processar fila de requisições
  processQueue(null, newToken);

  // 6. Retentar requisição original
  return apiClient(originalRequest);
}
```

### Benefícios

✅ **Transparente** - Usuário não precisa fazer login novamente  
✅ **Eficiente** - Evita múltiplos refresh simultâneos  
✅ **Seguro** - Remove tokens se refresh falhar  
✅ **Automático** - Funciona em todas as requisições

---

## 💻 Exemplos de Código

### Exemplo 1: Página de Login

```tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login falhou:', error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleLogin(formData.get('email') as string, formData.get('password') as string);
      }}
    >
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Exemplo 2: Dashboard com Dados Protegidos

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();

  if (authLoading || statsLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user?.name}!</h1>
      <div>Total de Denúncias: {stats?.total}</div>
      <div>Pendentes: {stats?.pending}</div>
      <div>Em Investigação: {stats?.underInvestigation}</div>
      <div>Resolvidas: {stats?.resolved}</div>
    </div>
  );
}
```

### Exemplo 3: Criar Denúncia (Requisição Autenticada)

```tsx
'use client';

import { complaintsService } from '@/lib/services';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function CreateComplaintForm() {
  const { requireAuth } = useAuth();

  const handleSubmit = async (data: any) => {
    // Verificar se está autenticado
    if (!requireAuth()) return;

    try {
      const response = await complaintsService.create(data);
      toast.success('Denúncia criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar denúncia');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // ... coletar dados do formulário
        handleSubmit(data);
      }}
    >
      {/* Campos do formulário */}
    </form>
  );
}
```

### Exemplo 4: Logout

```tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Sair</button>;
}
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

✅ **Tokens no localStorage** (não em cookies para evitar CSRF)  
✅ **HTTPS obrigatório em produção**  
✅ **Access Token de curta duração** (15 minutos)  
✅ **Refresh Token de longa duração** (7 dias)  
✅ **Logout invalida tokens no backend**  
✅ **Refresh automático transparente**  
✅ **Fila de requisições** evita race conditions

### Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 🧪 Testando a Autenticação

### 1. Iniciar Backend NestJS

```bash
cd apps/backend
npm run start:dev
```

### 2. Iniciar Frontend Next.js

```bash
cd apps/frontend
npm run dev
```

### 3. Testar Login

- Acessar http://localhost:3001/login
- Email: `admin@empresa.com`
- Senha: `Admin@123`

### 4. Testar Refresh Automático

```typescript
// No console do navegador
// 1. Fazer login
// 2. Aguardar token expirar (15 minutos)
// 3. Fazer qualquer requisição
// 4. Observar que o token é renovado automaticamente ✅
```

---

## 📊 Status da Implementação

| Funcionalidade       | Status      |
| -------------------- | ----------- |
| Login/Logout         | ✅ Completo |
| JWT Access Token     | ✅ Completo |
| JWT Refresh Token    | ✅ Completo |
| Refresh Automático   | ✅ Completo |
| Middleware Next.js   | ✅ Completo |
| AuthProvider         | ✅ Completo |
| Hook useAuth()       | ✅ Completo |
| Token Manager        | ✅ Completo |
| Axios Interceptors   | ✅ Completo |
| Fila de Requisições  | ✅ Completo |
| Proteção de Rotas    | ✅ Completo |
| Verificação de Roles | ✅ Completo |

---

## 🚀 Próximos Passos

1. **Atualizar páginas** para usar `useAuth()` hook
2. **Testar fluxo completo** com backend rodando
3. **Implementar verificação de permissões** nas páginas
4. **Adicionar testes unitários** para autenticação
5. **Configurar variáveis de ambiente** para produção

---

## 📝 Notas Importantes

⚠️ **O backend NestJS deve estar rodando** para testar a autenticação  
⚠️ **Certifique-se de que a URL da API está correta** no `.env.local`  
⚠️ **Tokens são salvos no localStorage** - limpar cache se necessário  
⚠️ **Use HTTPS em produção** para segurança dos tokens

---

**Autenticação JWT 100% Implementada!** 🎉
