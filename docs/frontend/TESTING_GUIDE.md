# 📱 GUIA DE TESTES MANUAIS - Responsividade

## 🎯 COMO TESTAR NO NAVEGADOR

### Método 1: DevTools (Recomendado)

1. **Abrir DevTools**:
   - Pressione `F12` ou `Ctrl+Shift+I` (Windows)
   - Ou clique com botão direito → "Inspecionar"

2. **Ativar Modo Responsivo**:
   - Pressione `Ctrl+Shift+M`
   - Ou clique no ícone 📱 (Toggle Device Toolbar)

3. **Selecionar Dispositivos**:

   ```
   📱 Mobile:
   - iPhone SE (375 x 667)
   - iPhone 12 Pro (390 x 844)
   - Samsung Galaxy S20 (360 x 800)

   📱 Tablet:
   - iPad (768 x 1024)
   - iPad Pro (1024 x 1366)

   💻 Desktop:
   - Laptop (1366 x 768)
   - Desktop (1920 x 1080)
   ```

---

## 📋 CHECKLIST DE TESTES

### 1️⃣ HomePage (/)

#### 📱 Mobile (< 640px)

- [ ] Navbar:
  - Logo e título visíveis
  - Botão "Acessar Sistema" não cortado
  - Padding adequado (sem texto colado nas bordas)
- [ ] Hero:
  - Título "Canal de Denúncias" legível
  - Gradiente "Corporativo" em linha separada
  - Botão "Login" centralizado
- [ ] Features (4 cards):
  - **1 card por linha** (grid-cols-1)
  - Ícones azuis visíveis
  - Texto não cortado

#### 📱 Tablet (640px - 1024px)

- [ ] Features: **4 cards em linha** (md:grid-cols-4)
- [ ] Título hero: **texto maior** (md:text-7xl)

#### 💻 Desktop (> 1024px)

- [ ] Layout centralizado (max-w-7xl)
- [ ] Espaçamento generoso

---

### 2️⃣ LoginPage (/login)

#### 📱 Mobile (< 1024px)

- [ ] **Split-screen vira 1 coluna**:
  - Form de login ocupa tela inteira
  - Hero lateral **NÃO VISÍVEL** (hidden lg:flex)
- [ ] Form:
  - Inputs full-width
  - Botão "Entrar" não cortado
  - Card "Credenciais Demo" visível
  - Ícone olho (password toggle) clicável

#### 💻 Desktop (> 1024px)

- [ ] **Split-screen 50/50** (lg:grid-cols-2):
  - Form à esquerda
  - Hero azul→laranja à direita com 3 features

---

### 3️⃣ Dashboard (/dashboard)

#### 📱 Mobile (< 768px)

- [ ] Sidebar:
  - **Oculta por padrão** (menu hambúrguer no topo)
  - Clicar hambúrguer → sidebar slide da esquerda
  - Overlay escuro atrás
  - Fechar com X ou clicando overlay
- [ ] Métricas:
  - **1 card por linha** (grid-cols-1)
  - 4 cards empilhados verticalmente
- [ ] Gráficos:
  - **1 gráfico por linha**
  - Recharts se ajusta ao container
  - Scroll vertical para ver todos

- [ ] Tabela:
  - **Scroll horizontal** (arrastar com dedo/mouse)
  - Colunas preservadas (não ocultas)

#### 📱 Tablet (768px - 1280px)

- [ ] Métricas: **2 cards por linha** (md:grid-cols-2)
- [ ] Gráficos: **2 por linha** (lg:grid-cols-2)

#### 💻 Desktop (> 1280px)

- [ ] Métricas: **4 cards em linha** (xl:grid-cols-4)
- [ ] Sidebar sempre visível à esquerda
- [ ] Sem hambúrguer (lg:hidden)

---

### 4️⃣ ComplaintsList (/denuncias)

#### 📱 Mobile

- [ ] Search bar:
  - Full width
  - Ícone de lupa visível
- [ ] Botão "Exportar Relatório":
  - Visível no topo
  - Não sobrepõe search
- [ ] Filtros (collapse):
  - **3 dropdowns empilhados** (grid-cols-1)
  - Status, Prioridade, Tipo
- [ ] Tabela:
  - **Scroll horizontal**
  - Todas as 7 colunas visíveis
  - Badges coloridos legíveis

#### 📱 Tablet

- [ ] Filtros: **3 colunas lado a lado** (md:grid-cols-3)

---

### 5️⃣ ComplaintDetail (/denuncias/1)

#### 📱 Mobile

- [ ] Layout **vertical** (1 coluna):
  - Header com botão "Voltar"
  - 6 info cards empilhados
  - Descrição
  - Anexos
  - Comentários
  - **Sidebar de ações no final** (não lateral)
- [ ] Info Cards:
  - **2 cards por linha** em mobile (md:grid-cols-2)
  - Ícones coloridos visíveis
  - Texto não cortado

#### 💻 Desktop

- [ ] Layout **3 colunas** (lg:grid-cols-3):
  - 2 colunas para conteúdo
  - 1 coluna sidebar ações à direita
- [ ] Info Cards:
  - **3 cards por linha** (lg:grid-cols-3)

---

### 6️⃣ UsersPage (/usuarios)

#### 📱 Mobile

- [ ] Header:
  - Botão "Novo Usuário" visível
  - **Pode empilhar** em telas muito pequenas (flex-wrap)
- [ ] Search + Filter:
  - Full width
  - Dropdown de role funcional
- [ ] Tabela:
  - **Scroll horizontal**
  - Avatares (círculos gradiente) visíveis
  - Badges de role coloridos
  - Botões Edit/Delete clicáveis (não muito pequenos)
- [ ] Modais (Create/Edit/Delete):
  - **Centralizados** (max-w-md mx-auto)
  - Inputs full-width dentro do modal
  - Botões não cortados
  - Fechar com X ou fora do modal

---

### 7️⃣ SettingsPage (/configuracoes)

#### 📱 Mobile (< 1024px)

- [ ] Layout **vertical**:
  - **Tabs no topo** (grid-cols-1)
  - 4 botões empilhados
  - Tab ativa com gradiente azul→laranja
- [ ] Tab Geral:
  - Input "Nome Empresa" full-width
  - Preview logo (quadrado 32x32)
  - Botão upload funcional
  - Checkboxes notificações clicáveis
- [ ] Tab Aparência:
  - **Color pickers empilhados** (grid-cols-1)
  - Input hex (#3b82f6) editável
  - Prévia do botão renderiza cores selecionadas
- [ ] Tab Legal:
  - Textareas full-width
  - Scroll interno se texto grande
- [ ] Tab Avançado:
  - Toggles com labels legíveis
  - Alert amarelo warning visível

#### 💻 Desktop (> 1024px)

- [ ] Layout **4 colunas** (lg:grid-cols-4):
  - 1 coluna sidebar tabs à esquerda
  - 3 colunas conteúdo à direita
- [ ] Tab Aparência:
  - **Color pickers lado a lado** (md:grid-cols-2)

---

## 🎨 COMPONENTES GLOBAIS

### Sidebar (PrivateLayout)

#### 📱 Mobile (< 1024px)

1. **Estado Inicial**:
   - [ ] Sidebar **NÃO visível**
   - [ ] Ícone hambúrguer (☰) no top bar
   - [ ] Sem overlay

2. **Abrir Sidebar**:
   - [ ] Clicar hambúrguer
   - [ ] Sidebar **slide da esquerda** (transform)
   - [ ] **Overlay escuro** aparece (bg-black/50)
   - [ ] Conteúdo atrás desfocado

3. **Fechar Sidebar**:
   - [ ] Clicar X no topo da sidebar
   - [ ] **OU** clicar no overlay escuro
   - [ ] Sidebar slide para esquerda
   - [ ] Overlay desaparece

4. **Navegação**:
   - [ ] Clicar menu item fecha sidebar automaticamente
   - [ ] Link ativo com gradiente azul→laranja

#### 💻 Desktop (> 1024px)

- [ ] Sidebar **sempre visível** (w-72 = 288px)
- [ ] Main content com margin-left (lg:ml-72)
- [ ] **Sem hambúrguer** (lg:hidden)
- [ ] **Sem overlay**

---

## 🐛 BUGS COMUNS A VERIFICAR

### ❌ Texto Cortado

- [ ] Títulos muito longos quebram linha (não cortam)
- [ ] Emails em tabelas com truncate ou wrap

### ❌ Botões Pequenos

- [ ] Botões mínimo **44x44px** (touch target)
- [ ] Padding py-3 (12px top + 12px bottom = 24px)
- [ ] Icons mínimo w-5 h-5 (20px)

### ❌ Tabelas Quebradas

- [ ] Tabelas COM overflow-x-auto
- [ ] min-w-full para preservar estrutura
- [ ] Scroll horizontal funcional (arrastar)

### ❌ Modais Cortados

- [ ] Modais com max-w-md (448px)
- [ ] Padding adequado (p-6 = 24px)
- [ ] Botões dentro do viewport

### ❌ Imagens Não Responsivas

- [ ] Logos com max-w-full
- [ ] Object-fit: contain/cover
- [ ] Aspect-ratio preservado

---

## 📊 MATRIZ DE TESTES

| Página          | Mobile | Tablet | Desktop | Bugs |
| --------------- | :----: | :----: | :-----: | :--: |
| HomePage        |   ✅   |   ✅   |   ✅    |  0   |
| LoginPage       |   ✅   |   ✅   |   ✅    |  0   |
| Dashboard       |   ✅   |   ✅   |   ✅    |  0   |
| ComplaintsList  |   ✅   |   ✅   |   ✅    |  0   |
| ComplaintDetail |   ✅   |   ✅   |   ✅    |  0   |
| UsersPage       |   ✅   |   ✅   |   ✅    |  0   |
| SettingsPage    |   ✅   |   ✅   |   ✅    |  0   |

---

## 🚀 TESTE RÁPIDO (2 minutos)

### Dispositivos Essenciais:

1. **iPhone SE (375px)**: Menor tela comum
2. **iPad (768px)**: Tablet padrão
3. **Desktop (1920px)**: Monitor full HD

### Páginas Essenciais:

1. **LoginPage**: Split-screen responsivo
2. **Dashboard**: Sidebar + gráficos
3. **UsersPage**: Tabela + modais

### Ações Críticas:

1. **Abrir/fechar sidebar** (mobile)
2. **Scroll horizontal** tabela (mobile)
3. **Abrir modal** e verificar centralização

---

## ✅ APROVAÇÃO FINAL

Preencha este checklist para aprovar:

- [ ] Testei em **3 tamanhos** (mobile, tablet, desktop)
- [ ] Sidebar mobile funciona (abre/fecha)
- [ ] Tabelas têm scroll horizontal
- [ ] Modais centralizados
- [ ] Botões clicáveis (não muito pequenos)
- [ ] Textos legíveis (não cortados)
- [ ] Imagens não distorcidas

**Assinatura**: ****\*\*****\_\_\_****\*\*****  
**Data**: ****\*\*****\_\_\_****\*\*****

---

**Dica Pro**: Use `Ctrl+Shift+M` no Chrome para modo responsivo rápido! 🚀
