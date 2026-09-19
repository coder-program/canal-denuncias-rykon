# TESTE DE RESPONSIVIDADE - Canal de Denúncias

## BREAKPOINTS TAILWIND CSS

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg/xl)

---

## CHECKLIST DE TESTES

### 1 HomePage (/)

- [ ] Navbar: Logo + botão empilhados em mobile
- [ ] Hero: Texto 6xl 7xl em desktop (md:text-7xl)
- [ ] Botões: flex-col sm:flex-row
- [ ] Features: grid-cols-1 md:grid-cols-4

### 2 LoginPage (/login)

- [ ] Split-screen: Empilhar em mobile (lg:grid-cols-2)
- [ ] Hero lateral: Oculto em mobile (hidden lg:flex)
- [ ] Form: Full width em mobile

### 3 Dashboard (/dashboard)

- [ ] Métricas: grid-cols-1 md:grid-cols-2 xl:grid-cols-4
- [ ] Gráficos: Overflow-x-auto em mobile
- [ ] Tabela: Scroll horizontal

### 4 ComplaintsList (/denuncias)

- [ ] Search bar: Full width em mobile
- [ ] Filtros: Empilhados em mobile
- [ ] Tabela: overflow-x-auto

### 5 ComplaintDetail (/denuncias/[id])

- [ ] Info cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- [ ] Sidebar: Abaixo do conteúdo em mobile (lg:grid-cols-3)

### 6 UsersPage (/usuarios)

- [ ] Tabela: overflow-x-auto
- [ ] Modais: max-w-md centralizados
- [ ] Botões: Empilhados em mobile

### 7 SettingsPage (/configuracoes)

- [ ] Tabs sidebar: Acima em mobile (lg:grid-cols-4)
- [ ] Color pickers: grid-cols-1 md:grid-cols-2
- [ ] Forms: Full width em mobile

### 8 PrivateLayout (Sidebar)

- [ ] Sidebar: Oculto em mobile (lg:block)
- [ ] Hamburger menu: Visível em mobile (lg:hidden)
- [ ] Overlay: Fecha ao clicar fora
- [ ] Search bar: Oculta ou adaptada em mobile

---

## COMO TESTAR

1. **DevTools do Chrome**:
   - F12 Toggle Device Toolbar (Ctrl+Shift+M)
   - Testar: iPhone SE (375px), iPad (768px), Desktop (1920px)

2. **Redimensionar Janela**:
   - Arrastar borda do navegador
   - Verificar quebras de layout

3. **Orientação**:
   - Portrait (vertical)
   - Landscape (horizontal)

---

## PROBLEMAS COMUNS

- Texto cortado em mobile
- Botões muito pequenos (< 44px altura)
- Tabelas sem scroll horizontal
- Modais maiores que viewport
- Imagens não responsivas
- Sidebar não fecha em mobile

---

## NOTAS

- Tailwind usa **mobile-first**: classes sem prefixo = mobile, md:/lg: = desktop
- Testar com touch (dedos) não apenas mouse
- Verificar zoom 150% e 200%
