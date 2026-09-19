# Canal de Denúncias - Frontend

> Sistema moderno de gestão de denúncias corporativas com design azul laranja

**Status**: **100% Completo e Responsivo**  
**Versão**: 1.0.0  
**Última Atualização**: 16/10/2025

---

## Quick Start

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Acessar: http://localhost:3000
```

**Credenciais Demo**:

- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## Páginas (7/7 )

1. **HomePage** (`/`) - Landing page pública
2. **LoginPage** (`/login`) - Autenticação split-screen
3. **Dashboard** (`/dashboard`) - Métricas + 3 gráficos Recharts
4. **ComplaintsListPage** (`/denuncias`) - Lista com filtros
5. **ComplaintDetailPage** (`/denuncias/[id]`) - Detalhe completo
6. **UsersPage** (`/usuarios`) - CRUD usuários (Admin)
7. **SettingsPage** (`/configuracoes`) - White-label (Admin)

---

## Stack

- **Next.js 15.5.5** (App Router, Turbopack)
- **React 19.1.1** + **TypeScript 5.9.3**
- **Tailwind CSS v3.4.0** (Azul #3b82f6 Laranja #f97316)
- **Zustand** (state) + **React Hook Form + Zod** (forms)
- **Recharts** (gráficos) + **Lucide React** (ícones)
- **React Hot Toast** (notificações) + **Axios** (HTTP)

---

## Design System

```tsx
// Botões
<button className="btn-primary">Gradiente AzulLaranja</button>
<button className="btn-secondary">Outline</button>

// Cards
<div className="card">{/* Conteúdo */}</div>

// Inputs
<input className="input-field" />

// Background
<div className="gradient-bg">{/* Conteúdo */}</div>
```

**Paleta**:

- Primária: `#3b82f6` (azul-500)
- Secundária: `#f97316` (laranja-500)
- Fonte: **Inter** (Google Fonts)

---

## Responsividade

**100% Testado**:

- Mobile (375px - iPhone SE)
- Tablet (768px - iPad)
- Desktop (1920px)

**Breakpoints**: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

**Componentes Adaptativos**:

- Sidebar: Hambúrguer mobile + overlay
- Tabelas: overflow-x-auto
- Gráficos: ResponsiveContainer
- Modais: max-w-md centralizado

  **Relatório completo**: [RESPONSIVENESS_REPORT.md](./RESPONSIVENESS_REPORT.md)  
  **Guia de testes**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## Estrutura

```
apps/frontend/
 app/                     # App Router
    page.tsx             # HomePage
    login/page.tsx       # Login
    dashboard/page.tsx   # Dashboard
    denuncias/           # Lista + Detalhe
    usuarios/page.tsx    # CRUD Usuários
    configuracoes/page.tsx # Settings
 components/layouts/      # PrivateLayout
 stores/authStore.ts      # Zustand
 lib/api.ts               # Axios
 types/index.ts           # TypeScript
 tailwind.config.js       # Tailwind
```

---

## Scripts

```bash
npm run dev      # Desenvolvimento (Turbopack)
npm run build    # Build produção
npm start        # Servidor produção
npm run lint     # ESLint
```

---

## Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Importar projeto no Vercel
3. Root Directory: `apps/frontend`
4. Framework: Next.js
5. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Docs

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Zustand](https://github.com/pmndrs/zustand)

---

<div align="center">

** Canal de Denúncias** - Compliance Corporativo

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)](https://www.typescriptlang.org/)

Feito com usando **Next.js** e **Tailwind CSS**

</div>
