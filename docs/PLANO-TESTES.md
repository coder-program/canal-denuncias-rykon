# 🧪 Plano de Testes - Canal de Denúncias

## 📋 Checklist de Testes

### ✅ Fase 1: Inicialização dos Servidores

- [ ] Backend iniciado na porta 3001
- [ ] Frontend iniciado na porta 5173
- [ ] Banco de dados conectado
- [ ] Sem erros no console

---

### ✅ Fase 2: Autenticação

#### 2.1 Login

- [ ] Acessar http://localhost:5173/login
- [ ] Testar login com credenciais inválidas (deve mostrar erro)
- [ ] Testar login com credenciais válidas
- [ ] Verificar redirecionamento para dashboard
- [ ] Verificar token no localStorage

#### 2.2 Registro

- [ ] Acessar página de registro
- [ ] Testar validações (email inválido, senha fraca, etc.)
- [ ] Criar nova conta
- [ ] Verificar redirecionamento para login

---

### ✅ Fase 3: Dashboard

- [ ] Verificar carregamento dos 4 KPIs
- [ ] Verificar gráfico de barras (denúncias por status)
- [ ] Verificar gráfico de pizza (denúncias por tipo)
- [ ] Verificar gráfico de linha (tendência)
- [ ] Verificar tabela de denúncias recentes
- [ ] Clicar em denúncia recente (deve navegar para detalhes)

---

### ✅ Fase 4: Listagem de Denúncias

#### 4.1 Navegação

- [ ] Acessar /complaints via sidebar
- [ ] Verificar carregamento da tabela
- [ ] Verificar contador de denúncias

#### 4.2 Filtros

- [ ] Testar filtro por Status (todos os status)
- [ ] Testar filtro por Tipo (todos os tipos)
- [ ] Testar filtro por Prioridade (todas as prioridades)
- [ ] Testar busca por protocolo
- [ ] Testar busca por título
- [ ] Limpar filtros (botão X)

#### 4.3 Paginação

- [ ] Verificar paginação (se houver mais de 10 denúncias)
- [ ] Navegar para próxima página
- [ ] Navegar para página anterior
- [ ] Verificar atualização da URL com parâmetros

#### 4.4 Ações

- [ ] Clicar em "Ver Detalhes" (deve abrir página de detalhes)
- [ ] Clicar em botão "Atualizar" (deve recarregar lista)
- [ ] Verificar botão "Nova Denúncia" (se role permitir)

---

### ✅ Fase 5: Detalhes da Denúncia

#### 5.1 Visualização

- [ ] Acessar detalhes de uma denúncia
- [ ] Verificar carregamento de todas as informações:
  - [ ] Protocolo
  - [ ] Título
  - [ ] Tipo
  - [ ] Status
  - [ ] Prioridade
  - [ ] Data de criação
  - [ ] Descrição
  - [ ] Evidências
  - [ ] Resolução (se houver)
- [ ] Verificar card de anexos
- [ ] Verificar card de comentários

#### 5.2 Comentários

- [ ] Verificar lista de comentários existentes
- [ ] Adicionar novo comentário
- [ ] Verificar atualização da lista
- [ ] Verificar toast de sucesso

#### 5.3 Anexos

- [ ] Verificar lista de anexos
- [ ] Clicar em "Download" (deve baixar arquivo)
- [ ] Verificar tamanho formatado
- [ ] Verificar ícone correto por tipo de arquivo

---

### ✅ Fase 6: **MODAIS FUNCIONAIS** (NOVO!)

#### 6.1 Modal: Mudar Status ⭐

**Pré-requisito:** Login como ADMIN

- [ ] Clicar em botão "Mudar Status" no header
- [ ] Verificar abertura do modal
- [ ] Verificar status atual pré-selecionado
- [ ] **Teste 1: Mudar para UNDER_REVIEW**
  - [ ] Selecionar "EM ANÁLISE"
  - [ ] Adicionar notas (opcional)
  - [ ] Clicar em "Salvar"
  - [ ] Verificar toast de sucesso
  - [ ] Verificar atualização do badge de status
  - [ ] Verificar fechamento do modal
- [ ] **Teste 2: Mudar para INVESTIGATING**
  - [ ] Abrir modal novamente
  - [ ] Selecionar "INVESTIGANDO"
  - [ ] Salvar
  - [ ] Verificar atualização
- [ ] **Teste 3: Mudar para RESOLVED (com validação)**
  - [ ] Abrir modal
  - [ ] Selecionar "RESOLVIDO"
  - [ ] **Verificar alerta informativo aparece**
  - [ ] Tentar salvar SEM preencher notas
  - [ ] **Verificar alerta de erro (notas obrigatórias)**
  - [ ] Preencher campo de resolução
  - [ ] Salvar
  - [ ] Verificar toast de sucesso
  - [ ] Verificar campo "Resolução" aparece na denúncia
- [ ] **Teste 4: Outros status**
  - [ ] Testar PENDING
  - [ ] Testar CLOSED
  - [ ] Testar REJECTED
- [ ] **Teste 5: Cancelar**
  - [ ] Abrir modal
  - [ ] Fazer alterações
  - [ ] Clicar em "Cancelar"
  - [ ] Verificar que nada foi alterado

#### 6.2 Modal: Atribuir Investigador ⭐

**Pré-requisito:** Login como ADMIN

- [ ] Clicar em botão "Atribuir Investigador" no header
- [ ] Verificar abertura do modal
- [ ] **Verificar carregamento da lista de investigadores**
- [ ] Verificar spinner de loading (pode ser rápido)
- [ ] **Teste 1: Atribuir investigador**
  - [ ] Selecionar um investigador da lista
  - [ ] Verificar nome + email no dropdown
  - [ ] Verificar alerta "Uma notificação será enviada"
  - [ ] Clicar em "Atribuir"
  - [ ] Verificar toast de sucesso
  - [ ] Verificar campo "Investigador" atualizado
  - [ ] Verificar fechamento do modal
- [ ] **Teste 2: Trocar investigador**
  - [ ] Abrir modal novamente
  - [ ] Verificar investigador atual pré-selecionado
  - [ ] Selecionar outro investigador
  - [ ] Salvar
  - [ ] Verificar atualização
- [ ] **Teste 3: Remover investigador**
  - [ ] Abrir modal
  - [ ] Selecionar opção vazia (se disponível)
  - [ ] Verificar alerta de aviso
  - [ ] Salvar
  - [ ] Verificar remoção
- [ ] **Teste 4: Cancelar**
  - [ ] Abrir modal
  - [ ] Fazer seleção
  - [ ] Clicar em "Cancelar"
  - [ ] Verificar que nada foi alterado
- [ ] **Teste 5: Estados de loading**
  - [ ] Verificar botão desabilitado durante submit
  - [ ] Verificar loading no botão "Atribuir"

#### 6.3 Controle de Acesso

- [ ] **Logout e login como REPORTER**
- [ ] Acessar detalhes de denúncia
- [ ] **Verificar que botões de ação NÃO aparecem**
- [ ] Verificar que apenas pode adicionar comentários
- [ ] **Logout e login como INVESTIGATOR**
- [ ] Verificar permissões intermediárias

---

### ✅ Fase 7: Navegação e UX

#### 7.1 Sidebar

- [ ] Verificar todos os links funcionam
- [ ] Verificar ícones corretos
- [ ] Verificar link ativo destacado
- [ ] Testar logout

#### 7.2 Botão Voltar

- [ ] Na página de detalhes, clicar em "Voltar"
- [ ] Verificar navegação para listagem
- [ ] Verificar que filtros anteriores foram mantidos (se houver)

#### 7.3 Responsividade

- [ ] Redimensionar janela (desktop → tablet → mobile)
- [ ] Verificar sidebar em mobile (deve colapsar)
- [ ] Verificar tabelas em mobile (overflow-x-auto)
- [ ] Verificar modais em mobile

---

### ✅ Fase 8: Tratamento de Erros

#### 8.1 Erros de Rede

- [ ] Parar backend
- [ ] Tentar carregar dashboard (deve mostrar erro)
- [ ] Tentar carregar listagem (deve mostrar erro)
- [ ] Verificar mensagens de erro amigáveis
- [ ] Reinicar backend
- [ ] Clicar em "Tentar novamente"

#### 8.2 Erros de Validação

- [ ] Tentar adicionar comentário vazio (deve mostrar erro)
- [ ] Tentar mudar status para RESOLVED sem notas
- [ ] Verificar toast de erro

#### 8.3 Erros de Autorização

- [ ] Login como usuário sem permissão
- [ ] Tentar acessar /admin (se existir)
- [ ] Verificar redirecionamento ou erro 403

---

### ✅ Fase 9: Performance e Console

- [ ] Verificar tempo de carregamento das páginas
- [ ] Verificar console do browser (sem erros)
- [ ] Verificar Network tab (requests corretos)
- [ ] Verificar localStorage (token, user)
- [ ] Verificar que não há memory leaks (React DevTools)

---

## 🎯 Cenários de Teste Completos

### Cenário 1: Fluxo Completo ADMIN

1. Login como ADMIN
2. Ver dashboard com todos os KPIs
3. Navegar para listagem de denúncias
4. Filtrar por status "PENDENTE"
5. Abrir detalhes da primeira denúncia
6. Adicionar comentário
7. Atribuir investigador via modal
8. Mudar status para "EM ANÁLISE" via modal
9. Voltar para listagem
10. Verificar que status foi atualizado na tabela

### Cenário 2: Fluxo Completo INVESTIGATOR

1. Login como INVESTIGATOR
2. Ver dashboard
3. Navegar para "Minhas Denúncias" (filtrar por investigador)
4. Abrir denúncia atribuída
5. Adicionar comentários de investigação
6. Solicitar mudança de status (se tiver permissão)

### Cenário 3: Fluxo Completo REPORTER

1. Login como REPORTER
2. Ver dashboard (limitado)
3. Ver apenas suas denúncias
4. Abrir denúncia criada por ele
5. Adicionar comentário
6. Verificar que não pode mudar status/atribuir

---

## 📊 Critérios de Sucesso

### Funcionalidade ✅

- [ ] Todas as páginas carregam sem erro
- [ ] Todos os botões funcionam
- [ ] Todos os modais abrem/fecham corretamente
- [ ] Todas as validações funcionam
- [ ] Todas as notificações (toasts) aparecem

### API ✅

- [ ] Todas as chamadas retornam dados corretos
- [ ] Erros são tratados adequadamente
- [ ] Loading states são mostrados
- [ ] Dados são atualizados após ações

### UX ✅

- [ ] Interface é intuitiva
- [ ] Feedback visual é claro
- [ ] Não há bugs visuais
- [ ] Responsividade funciona
- [ ] Animações são suaves

### Performance ✅

- [ ] Páginas carregam em < 2s
- [ ] Não há travamentos
- [ ] Console sem erros críticos
- [ ] Memory usage estável

---

## 🐛 Bugs Encontrados

### Durante os Testes

_(Preencher durante os testes)_

| #   | Descrição | Severidade | Status |
| --- | --------- | ---------- | ------ |
| 1   |           | 🔴 Alta    | ⏳     |
| 2   |           | 🟡 Média   | ⏳     |
| 3   |           | 🟢 Baixa   | ⏳     |

---

## 🚀 Próximos Passos Após Testes

1. ✅ Corrigir bugs críticos encontrados
2. ✅ Implementar melhorias de UX identificadas
3. 📝 Implementar ComplaintCreatePage
4. 👥 Implementar UsersPage (ADMIN)
5. 👤 Implementar ProfilePage
6. 🔔 Implementar NotificationsPage
7. 📱 Testes em dispositivos mobile reais
8. 🎨 Ajustes finais de design

---

**Data do Teste:** 15/10/2025  
**Testador:** \***\*\_\_\_\*\***  
**Versão:** Frontend v0.1.0 + Backend v0.1.0
