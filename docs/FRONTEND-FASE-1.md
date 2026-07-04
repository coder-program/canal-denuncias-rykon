# 🖥️ Frontend React - Canal de Denúncias

## 📋 Resumo Geral

Frontend React completo em desenvolvimento para o sistema de **Canal de Denúncias Corporativo**.

---

## ✅ Fase 1: Configuração Inicial (100% COMPLETO)

### Estrutura do Projeto

```
apps/frontend/
├── public/                      # Arquivos estáticos
├── src/
│   ├── components/             # Componentes React
│   │   ├── layouts/           # Layouts (Public/Private)
│   │   └── ui/                # Componentes UI reutilizáveis
│   ├── pages/                 # Páginas da aplicação
│   │   ├── auth/              # Login, Registro
│   │   ├── complaints/        # Denúncias
│   │   └── users/             # Usuários (admin)
│   ├── services/              # Serviços de API
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types/interfaces
│   ├── utils/                 # Utilitários e helpers
│   ├── hooks/                 # Custom React hooks
│   ├── App.tsx                # Componente principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais (Tailwind)
├── index.html                 # HTML template
├── package.json               # Dependências
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind CSS config
└── postcss.config.js          # PostCSS config
```

---

## 🛠️ Stack Tecnológica

### Core
- ⚛️ **React 18.3.1** - Biblioteca UI
- 📘 **TypeScript 5.6.2** - Tipagem estática
- ⚡ **Vite 5.4.5** - Build tool e dev server

### Estilização
- 🎨 **Tailwind CSS 3.4.11** - Utility-first CSS framework
- 🔧 **PostCSS + Autoprefixer** - Processamento CSS

### Roteamento
- 🛣️ **React Router DOM 6.26.2** - Navegação SPA

### Gerenciamento de Estado
- 🐻 **Zustand 4.5.5** - State management (auth, notifications)

### Formulários e Validação
- 📝 **React Hook Form 7.53.0** - Gerenciamento de formulários
- ✅ **Zod 3.23.8** - Schema validation
- 🔗 **@hookform/resolvers 3.9.0** - Integração RHF + Zod

### API e Comunicação
- 🌐 **Axios 1.7.7** - Cliente HTTP
- 🔌 **Socket.io-client 4.8.0** - WebSocket real-time

### UI/UX
- 🎯 **Lucide React 0.441.0** - Ícones (Feather icons)
- 🔄 **clsx 2.1.1** - Utility classes
- 📅 **date-fns 4.1.0** - Manipulação de datas
- 🍞 **react-hot-toast 2.4.1** - Notificações toast
- 📊 **Recharts 2.12.7** - Gráficos e dashboards

### Testing
- 🧪 **Vitest 2.1.1** - Test runner
- 📚 **@testing-library/react 16.0.1** - Component testing
- ✔️ **@testing-library/jest-dom 6.5.0** - DOM matchers
- 🎭 **@vitest/ui 2.1.1** - Test UI

---

## 📦 Arquivos Criados

### ✅ Configuração (8 arquivos)
- `package.json` - Dependências e scripts
- `tsconfig.json` - TypeScript strict mode
- `tsconfig.node.json` - TypeScript para Node
- `vite.config.ts` - Vite config com proxy API
- `tailwind.config.js` - Cores customizadas (primary, danger, success, warning)
- `postcss.config.js` - PostCSS plugins
- `.env.example` - Variáveis de ambiente
- `.gitignore` - Arquivos ignorados

### ✅ Types (1 arquivo - ~230 linhas)
- `src/types/index.ts`:
  - Enums: UserRole, ComplaintStatus, ComplaintType, ComplaintPriority, NotificationType
  - Interfaces: User, Complaint, Attachment, Comment, Dossier, Notification
  - DTOs: LoginRequest, RegisterRequest, CreateComplaintRequest, UpdateComplaintRequest
  - ApiResponse com PaginationMeta

### ✅ Services (5 arquivos - ~580 linhas)

#### `src/services/api.ts` (~135 linhas)
- Configuração Axios base
- Interceptors para JWT (auto-refresh)
- Métodos genéricos: get, post, put, patch, delete
- Upload de arquivos com progress

#### `src/services/complaint.service.ts` (~95 linhas)
- `list()` - Listar com filtros
- `getById()` - Obter por ID
- `getByProtocol()` - Buscar por protocolo
- `create()` - Criar denúncia
- `update()` - Atualizar denúncia
- `assignInvestigator()` - Atribuir investigador
- `updateStatus()` - Alterar status
- `getComments()`, `addComment()` - Gerenciar comentários
- `getAttachments()`, `uploadAttachment()`, `deleteAttachment()` - Gerenciar anexos
- `getStats()` - Estatísticas

#### `src/services/dossier.service.ts` (~50 linhas)
- `generate()` - Gerar dossiê PDF/ZIP
- `listByComplaint()` - Listar dossiês
- `getById()` - Obter dossiê
- `getDownloadUrlPdf/Zip()` - URLs de download
- `delete()` - Deletar dossiê
- `getStats()` - Estatísticas

#### `src/services/notification.service.ts` (~45 linhas)
- `list()` - Listar notificações
- `markAsRead()` - Marcar como lida
- `markAllAsRead()` - Marcar todas
- `getUnreadCount()` - Contar não lidas
- `delete()` - Deletar notificação
- `getPreferences()`, `updatePreferences()` - Preferências

#### `src/services/user.service.ts` (~35 linhas)
- `list()` - Listar usuários
- `getById()` - Obter usuário
- `create()` - Criar usuário
- `update()` - Atualizar usuário
- `delete()` - Deletar usuário
- `toggleActive()` - Ativar/desativar
- `changePassword()` - Alterar senha

### ✅ Store Zustand (2 arquivos - ~250 linhas)

#### `src/store/authStore.ts` (~130 linhas)
- State: user, accessToken, refreshToken, isAuthenticated, isLoading
- Actions:
  - `login()` - Login com credenciais
  - `register()` - Registro de conta
  - `logout()` - Logout e limpeza
  - `loadUser()` - Carregar perfil
  - `setUser()` - Atualizar usuário
- Persist com localStorage

#### `src/store/notificationStore.ts` (~130 linhas)
- State: notifications, unreadCount, isLoading, socket
- Actions:
  - `fetchNotifications()` - Buscar notificações
  - `fetchUnreadCount()` - Buscar contagem
  - `markAsRead()`, `markAllAsRead()` - Marcar como lida(s)
  - `deleteNotification()` - Deletar
  - `connectWebSocket()`, `disconnectWebSocket()` - WebSocket
  - `addNotification()` - Adicionar notificação real-time

### ✅ Utils (3 arquivos - ~190 linhas)

#### `src/utils/format.ts` (~65 linhas)
- `cn()` - Combinar classes CSS (clsx)
- `formatDate()` - Data (dd/MM/yyyy)
- `formatDateTime()` - Data e hora
- `formatRelativeTime()` - "há X minutos"
- `formatFileSize()` - Bytes para KB/MB/GB
- `truncateText()` - Truncar texto
- `capitalize()` - Capitalizar string

#### `src/utils/constants.ts` (~90 linhas)
- Traduções PT-BR:
  - `statusTranslations` - Status de denúncias
  - `typeTranslations` - Tipos de denúncias
  - `priorityTranslations` - Prioridades
  - `roleTranslations` - Roles de usuários
- Cores Tailwind:
  - `statusColors` - Cores por status
  - `priorityColors` - Cores por prioridade
- Helpers:
  - `getStatusText()`, `getTypeText()`, etc.
  - `getStatusColor()`, `getPriorityColor()`
  - `getTypeIcon()` - Emojis por tipo

#### `src/utils/validations.ts` (~55 linhas)
- Schemas Zod:
  - `loginSchema` - Login (email + password)
  - `registerSchema` - Registro (name + email + password + confirmPassword)
  - `complaintSchema` - Criar denúncia (campos completos)
  - `commentSchema` - Comentário (content + isInternal)
  - `userSchema` - Usuário (name + email + role + password)
  - `changePasswordSchema` - Trocar senha (oldPassword + newPassword + confirmPassword)

### ✅ App Principal (2 arquivos)

#### `src/App.tsx` (~75 linhas)
- Rotas públicas:
  - `/` - HomePage
  - `/login` - LoginPage
  - `/register` - RegisterPage
  - `/denunciar` - AnonymousComplaintPage
- Rotas privadas (protegidas):
  - `/dashboard` - DashboardPage
  - `/denuncias` - ComplaintsListPage
  - `/denuncias/nova` - ComplaintCreatePage
  - `/denuncias/:id` - ComplaintDetailPage
  - `/usuarios` - UsersPage (admin)
  - `/perfil` - ProfilePage
  - `/notificacoes` - NotificationsPage
- WebSocket connection no mount
- 404 redirect

#### `src/main.tsx` (~30 linhas)
- React 18 createRoot
- BrowserRouter
- Toaster (react-hot-toast) configurado

### ✅ Estilos (1 arquivo)

#### `src/index.css` (~70 linhas)
- Tailwind directives (@tailwind base/components/utilities)
- Classes customizadas:
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`
  - `.input`, `.label`
  - `.card`
  - `.badge`, `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-danger`
- Body styles (font Inter, antialiased)

---

## 📊 Estatísticas

### Arquivos Criados: **24 arquivos**
- Configuração: 8 arquivos
- TypeScript Types: 1 arquivo (~230 linhas)
- Services: 5 arquivos (~580 linhas)
- Store: 2 arquivos (~250 linhas)
- Utils: 3 arquivos (~190 linhas)
- App: 2 arquivos (~105 linhas)
- Styles: 1 arquivo (~70 linhas)
- HTML: 1 arquivo (~15 linhas)

### Total de Código: **~1.440 linhas**

### Dependências Instaladas: **40 packages**
- Produção: 20 packages
- Desenvolvimento: 20 packages

---

## ⏭️ Próximos Passos

### 🔴 Prioridade ALTA (Necessário para funcionar)

1. **Layouts** (2 componentes - ~200 linhas)
   - `PublicLayout` - Header simples + Outlet
   - `PrivateLayout` - Header + Sidebar + Outlet + Footer

2. **Componentes UI** (8-10 componentes - ~600 linhas)
   - Button, Input, Textarea, Select
   - Card, Badge, Modal
   - LoadingSpinner, Alert
   - FileUpload, Dropdown

3. **Páginas de Auth** (3 páginas - ~450 linhas)
   - LoginPage - Formulário de login
   - RegisterPage - Formulário de registro
   - ForgotPasswordPage (opcional)

4. **Páginas Públicas** (2 páginas - ~300 linhas)
   - HomePage - Landing page
   - AnonymousComplaintPage - Formulário anônimo

5. **DashboardPage** (1 página - ~250 linhas)
   - Cards com KPIs
   - Gráficos Recharts
   - Lista de denúncias recentes

### 🟡 Prioridade MÉDIA (Funcionalidades principais)

6. **Páginas de Denúncias** (3 páginas - ~900 linhas)
   - ComplaintsListPage - Tabela + filtros + paginação
   - ComplaintDetailPage - Detalhes + comentários + anexos + timeline
   - ComplaintCreatePage - Formulário completo

7. **Sistema de Anexos** (2 componentes - ~300 linhas)
   - FileUploadZone - Drag & drop
   - AttachmentGallery - Preview + download

8. **NotificationsPage** (1 página - ~200 linhas)
   - Lista de notificações
   - Badge no header
   - Dropdown com últimas notificações

### 🟢 Prioridade BAIXA (Admin e extras)

9. **UsersPage** (1 página - ~350 linhas)
   - Tabela de usuários
   - CRUD completo
   - Gerenciamento de roles

10. **ProfilePage** (1 página - ~200 linhas)
    - Formulário de perfil
    - Trocar senha
    - Preferências

11. **Responsividade Mobile** (~200 linhas adicionais)
    - Menu hamburger
    - Sidebar responsiva
    - Touch gestures

12. **Testes** (~500 linhas)
    - Unit tests (Vitest)
    - Component tests (Testing Library)

---

## 🚀 Como Iniciar

### 1. Instalar dependências (JÁ FEITO ✅)
```bash
cd apps/frontend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env com a URL da API
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 3. Iniciar dev server
```bash
npm run dev
# Aplicação rodará em http://localhost:3000
```

### 4. Build para produção
```bash
npm run build
# Arquivos gerados em dist/
```

### 5. Preview do build
```bash
npm run preview
```

---

## 🎯 Status Atual

### ✅ COMPLETO (25%)
- ✅ Estrutura do projeto
- ✅ Configuração Vite + TypeScript + Tailwind
- ✅ Todas as dependências instaladas
- ✅ Types e interfaces TypeScript
- ✅ Serviços de API (5 services)
- ✅ Store Zustand (auth + notifications)
- ✅ Utils e helpers
- ✅ Validações Zod
- ✅ App.tsx com rotas
- ✅ Estilos globais Tailwind

### 🔄 EM DESENVOLVIMENTO (0%)
- ⏳ Layouts (Public + Private)
- ⏳ Componentes UI
- ⏳ Páginas (auth, denúncias, dashboard, admin)
- ⏳ Sistema de upload de arquivos
- ⏳ Gráficos e dashboards
- ⏳ Notificações real-time
- ⏳ Responsividade mobile
- ⏳ Testes

### 🎯 Próximo Passo Imediato
**Criar os Layouts (PublicLayout + PrivateLayout)** para permitir a navegação básica e começar a visualizar a aplicação no navegador.

---

**Status**: ✅ Fase 1 Completa (25% do frontend total)
**Próximo**: Criar Layouts e Componentes UI
**Progresso Total Frontend**: 25% ⬛⬛⬜⬜⬜⬜⬜⬜⬜⬜
