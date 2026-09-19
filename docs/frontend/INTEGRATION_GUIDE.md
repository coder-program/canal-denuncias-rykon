# 🔌 Guia de Integração Backend - NestJS API

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Serviços Disponíveis](#serviços-disponíveis)
- [Hooks Personalizados](#hooks-personalizados)
- [Exemplos de Uso](#exemplos-de-uso)
- [Tratamento de Erros](#tratamento-de-erros)
- [Autenticação](#autenticação)

---

## 🎯 Visão Geral

O frontend agora está **totalmente integrado** com o backend NestJS através de:

- **Axios Client** configurado com interceptors
- **Serviços de API** organizados por módulo
- **Custom Hooks** React para facilitar o uso
- **Tratamento de erros** global com toasts
- **Autenticação JWT** com refresh token

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Arquivo: **`.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

> **Nota**: Altere a porta se seu backend estiver rodando em outra porta.

### 2. Cliente Axios

Arquivo: **`lib/api.ts`**

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL`
- **Timeout**: 30 segundos
- **Interceptors**:
  - **Request**: Adiciona token JWT automaticamente
  - **Response**: Trata erros e exibe toasts

---

## 📦 Serviços Disponíveis

### 1️⃣ Auth Service (`lib/services/authService.ts`)

```typescript
import { authService } from '@/lib/services';

// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, name });

// Logout
await authService.logout();

// Obter usuário autenticado
const user = await authService.me();

// Refresh token
await authService.refresh({ refreshToken });
```

**Rotas Backend**:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

---

### 2️⃣ Complaints Service (`lib/services/complaintsService.ts`)

```typescript
import { complaintsService } from '@/lib/services';

// Criar denúncia
const complaint = await complaintsService.create({
  title: 'Título',
  description: 'Descrição',
  type: 'HARASSMENT',
  priority: 'HIGH',
  isAnonymous: false,
});

// Listar com filtros e paginação
const { data, meta } = await complaintsService.list({
  page: 1,
  limit: 10,
  status: 'PENDING',
  type: 'HARASSMENT',
  search: 'assédio',
});

// Obter por ID
const complaint = await complaintsService.getById('uuid');

// Obter por protocolo
const complaint = await complaintsService.getByProtocol('DEN-2024-A1B2C3');

// Obter estatísticas (Dashboard)
const stats = await complaintsService.getStats();

// Alterar status
await complaintsService.changeStatus('uuid', 'UNDER_INVESTIGATION', 'Resolução');

// Atribuir investigador
await complaintsService.assignInvestigator('uuid', 'investigatorId');

// Atualizar
await complaintsService.update('uuid', { title: 'Novo título' });

// Excluir
await complaintsService.delete('uuid');
```

**Rotas Backend**:

- `POST /complaints`
- `GET /complaints`
- `GET /complaints/:id`
- `GET /complaints/protocol/:protocol`
- `GET /complaints/stats`
- `PATCH /complaints/:id`
- `PATCH /complaints/:id/status`
- `PATCH /complaints/:id/assign`
- `DELETE /complaints/:id`

---

### 3️⃣ Users Service (`lib/services/usersService.ts`)

```typescript
import { usersService } from '@/lib/services';

// Listar usuários
const users = await usersService.list();

// Filtrar por role
const admins = await usersService.list({ role: 'ADMIN' });

// Obter por ID
const user = await usersService.getById('uuid');

// Criar usuário (Admin)
const newUser = await usersService.create({
  email: 'user@example.com',
  password: 'Password@123',
  name: 'João Silva',
  role: 'INVESTIGATOR',
  isActive: true,
});

// Atualizar usuário
await usersService.update('uuid', {
  name: 'Novo Nome',
  role: 'ADMIN',
});

// Excluir usuário
await usersService.delete('uuid');
```

**Rotas Backend**:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

---

## 🎣 Hooks Personalizados

### 1️⃣ useDashboardStats

**Arquivo**: `hooks/useDashboardStats.ts`

```typescript
import { useDashboardStats } from '@/hooks';

function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboardStats();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Total: {stats?.total}</h1>
      <h2>Pendentes: {stats?.pending}</h2>
      {/* ... */}
    </div>
  );
}
```

**Retorna**:

- `stats`: Estatísticas do dashboard
- `loading`: Boolean de carregamento
- `error`: Mensagem de erro (string | null)
- `refetch`: Função para recarregar

---

### 2️⃣ useComplaints

**Arquivo**: `hooks/useComplaints.ts`

```typescript
import { useComplaints } from '@/hooks';

function ComplaintsListPage() {
  const { complaints, meta, loading, error, refetch } = useComplaints({
    page: 1,
    limit: 10,
    status: 'PENDING',
  });

  return (
    <div>
      {complaints.map((complaint) => (
        <div key={complaint.id}>{complaint.title}</div>
      ))}
      <p>Total: {meta?.total}</p>
    </div>
  );
}
```

**Retorna**:

- `complaints`: Array de denúncias
- `meta`: Metadados de paginação
- `loading`: Boolean
- `error`: String | null
- `refetch`: Função

---

### 3️⃣ useUsers

**Arquivo**: `hooks/useUsers.ts`

```typescript
import { useUsers } from '@/hooks';

function UsersPage() {
  const { users, loading, error, refetch } = useUsers({ role: 'ADMIN' });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Login Page

```typescript
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      // Erro já tratado pelo authStore (toast exibido)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

---

### Exemplo 2: Dashboard com Dados Reais

```typescript
'use client';

import { useDashboardStats } from '@/hooks';
import PrivateLayout from '@/components/layouts/PrivateLayout';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Carregando estatísticas...</div>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="text-red-500">Erro: {error}</div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Métricas */}
        <div className="card">
          <h3>Total</h3>
          <p>{stats?.total}</p>
        </div>
        <div className="card">
          <h3>Pendentes</h3>
          <p>{stats?.pending}</p>
        </div>
        <div className="card">
          <h3>Em Investigação</h3>
          <p>{stats?.underInvestigation}</p>
        </div>
        <div className="card">
          <h3>Resolvidas</h3>
          <p>{stats?.resolved}</p>
        </div>
      </div>
    </PrivateLayout>
  );
}
```

---

### Exemplo 3: Lista de Denúncias com Filtros

```typescript
'use client';

import { useState } from 'react';
import { useComplaints } from '@/hooks';

export default function ComplaintsListPage() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { complaints, meta, loading, error, refetch } = useComplaints({
    page,
    limit: 10,
    status,
  });

  const handleFilter = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1); // Reset para primeira página
  };

  return (
    <div>
      {/* Filtros */}
      <select value={status} onChange={(e) => handleFilter(e.target.value)}>
        <option value="">Todos</option>
        <option value="PENDING">Pendentes</option>
        <option value="UNDER_INVESTIGATION">Em Investigação</option>
        <option value="RESOLVED">Resolvidas</option>
      </select>

      {/* Tabela */}
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Título</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>{complaint.protocol}</td>
                <td>{complaint.title}</td>
                <td>{complaint.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      <div>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page} de {meta?.totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === meta?.totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
```

---

### Exemplo 4: CRUD de Usuários

```typescript
'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks';
import { usersService } from '@/lib/services';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { users, loading, refetch } = useUsers();
  const [showModal, setShowModal] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      await usersService.create(data);
      toast.success('Usuário criado com sucesso!');
      refetch(); // Recarregar lista
      setShowModal(false);
    } catch (error) {
      // Erro já tratado pelo interceptor
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este usuário?')) return;

    try {
      await usersService.delete(id);
      toast.success('Usuário excluído!');
      refetch();
    } catch (error) {
      // Erro já tratado
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Novo Usuário</button>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDelete(user.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de criação */}
      {showModal && (
        <CreateUserModal onSubmit={handleCreate} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
```

---

## ⚠️ Tratamento de Erros

### Interceptor Global

O cliente Axios já trata erros automaticamente:

```typescript
// lib/api.ts
switch (status) {
  case 400:
    toast.error('Dados inválidos');
    break;
  case 401:
    toast.error('Sessão expirada. Faça login novamente.');
    // Redireciona para /login
    break;
  case 403:
    toast.error('Acesso negado.');
    break;
  case 404:
    toast.error('Recurso não encontrado');
    break;
  case 500:
    toast.error('Erro interno do servidor');
    break;
}
```

### Tratamento Manual (Opcional)

```typescript
try {
  const data = await complaintsService.getById('invalid-id');
} catch (error: any) {
  // Toast já foi exibido pelo interceptor
  // Mas você pode fazer tratamento adicional:
  if (error.response?.status === 404) {
    router.push('/denuncias'); // Redirecionar
  }
}
```

---

## 🔐 Autenticação

### Como Funciona

1. **Login**:
   - Usuário faz login via `authStore.login()`
   - Backend retorna `accessToken`, `refreshToken` e `user`
   - Dados salvos no `localStorage` (Zustand persist)

2. **Requisições Autenticadas**:
   - Axios interceptor adiciona `Authorization: Bearer {token}` automaticamente
   - Token lido do `localStorage` (`auth-storage`)

3. **Token Expirado (401)**:
   - Interceptor detecta erro 401
   - Limpa `localStorage`
   - Redireciona para `/login`

4. **Refresh Token** (Opcional):
   - Implementar lógica de refresh automático no interceptor
   - Chamar `authStore.refreshAccessToken()` quando token expirar

### Exemplo de Refresh Automático

```typescript
// lib/api.ts (adicionar ao interceptor de resposta)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for 401 e não for retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar refresh
        const authStore = useAuthStore.getState();
        await authStore.refreshAccessToken();

        // Repetir requisição original com novo token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Se refresh falhar, fazer logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

---

## ✅ Checklist de Integração

- [x] Variável `NEXT_PUBLIC_API_URL` configurada em `.env.local`
- [x] Cliente Axios com interceptors (auth + erros)
- [x] Serviços de API criados:
  - [x] `authService.ts`
  - [x] `complaintsService.ts`
  - [x] `usersService.ts`
- [x] Hooks personalizados:
  - [x] `useDashboardStats`
  - [x] `useComplaints`
  - [x] `useUsers`
- [x] AuthStore integrado com API real
- [ ] Dashboard integrado (usar `useDashboardStats`)
- [ ] ComplaintsList integrado (usar `useComplaints`)
- [ ] UsersPage integrado (usar `useUsers`)
- [ ] Testes de integração

---

## 🚀 Próximos Passos

1. **Atualizar Páginas**:
   - Substituir dados mockados por hooks reais
   - Dashboard → `useDashboardStats`
   - ComplaintsList → `useComplaints`
   - UsersPage → `useUsers`

2. **Adicionar Loading States**:
   - Skeleton screens
   - Spinners

3. **Melhorar Tratamento de Erros**:
   - Error boundaries
   - Retry logic

4. **Adicionar Attachments Service**:
   - Upload de arquivos
   - Download de anexos

5. **Implementar Refresh Token Automático**

---

## 📚 Referências

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query) (alternativa para gerenciar cache)

---

**Status**: ✅ **Integração Base Completa**  
**Data**: 16/10/2025  
**Versão**: v1.0.0
