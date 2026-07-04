# ✅ Tarefas Pendentes - Landing Page do Canal de Denúncia

## 🚀 IMPLEMENTAÇÃO CONCLUÍDA

✅ **Landing Page Principal (`/`)**
- Hero section com título impactante
- Card destacado "Fazer uma Denúncia"
- Busca de protocolo integrada
- 6 documentos normativos (cards coloridos)
- Seção de garantias
- Seção de contato
- CTA final
- Footer completo

✅ **Página de Acompanhamento (`/acompanhar`)**
- Busca por protocolo
- Exibição de status colorido
- Timeline visual com 5 etapas
- Informações detalhadas da denúncia
- Botões de ação (voltar, imprimir)
- CSS de impressão otimizado

✅ **Documentação**
- `LANDING_PAGE_IMPLEMENTACAO.md` - Guia completo da implementação
- `PERSONALIZACAO_LOGO.md` - Como substituir o logo
- `public/docs/README.md` - Instruções sobre PDFs

---

## 📋 PRÓXIMOS PASSOS (Para o Cliente)

### 1. ⚠️ ADICIONAR PDFs DOS DOCUMENTOS (PRIORIDADE ALTA)

**Pasta:** `apps/frontend/public/docs/`

**Arquivos necessários:**
```
✅ codigo-etica.pdf
✅ politica-fornecedores.pdf
✅ politica-anticorrupcao.pdf
✅ politica-licitacoes.pdf
✅ politica-pld-ftp.pdf
✅ politica-assedio.pdf
```

**Como fazer:**
1. Obtenha os PDFs dos documentos normativos da empresa
2. Renomeie conforme os nomes acima (sem espaços, minúsculas, hífens)
3. Coloque em `apps/frontend/public/docs/`
4. Os links já estão funcionando na landing page

**Alternativa temporária:**
- Se os PDFs não estiverem disponíveis ainda, você pode:
  - Remover a seção temporariamente (comentar linhas 175-216 em `app/page.tsx`)
  - Ou usar PDFs placeholder

---

### 2. 🎨 SUBSTITUIR LOGO INSTITUCIONAL (PRIORIDADE ALTA)

**Instruções completas:** `PERSONALIZACAO_LOGO.md`

**Resumo rápido:**

1. **Adicionar logo:**
   ```
   apps/frontend/public/logo-empresa.png
   ```

2. **Editar 3 arquivos:**
   
   **a) `apps/frontend/app/page.tsx` (linha ~102)**
   ```tsx
   // SUBSTITUIR:
   <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500...">
     <Shield className="w-9 h-9 text-white" />
   </div>

   // POR:
   <img 
     src="/logo-empresa.png" 
     alt="Logo da Empresa" 
     className="h-16 w-auto"
   />
   ```

   **b) `apps/frontend/app/acompanhar/page.tsx` (linha ~139)**
   ```tsx
   // SUBSTITUIR o mesmo bloco com Shield
   // POR:
   <img 
     src="/logo-empresa.png" 
     alt="Logo da Empresa" 
     className="h-12 w-auto"
   />
   ```

   **c) `apps/frontend/components/Sidebar.tsx`**
   ```tsx
   // PROCURAR por <Shield e substituir
   // POR:
   <img 
     src="/logo-empresa.png" 
     alt="Logo" 
     className="h-10 w-auto"
   />
   ```

**Formato recomendado:**
- PNG com fundo transparente ou SVG
- Tamanho: mínimo 256x256 pixels
- Peso: menos de 200KB

---

### 3. 📞 ATUALIZAR INFORMAÇÕES DE CONTATO (PRIORIDADE MÉDIA)

**Arquivo:** `apps/frontend/app/page.tsx`

**Linhas 227-239** - Editar:

```tsx
<Phone className="w-5 h-5 text-primary-400" />
<div>
  <p className="text-white font-semibold">Telefone</p>
  <p className="text-slate-300">0800 123 4567 (24h)</p>  {/* ← ALTERAR */}
</div>

<Mail className="w-5 h-5 text-primary-400" />
<div>
  <p className="text-white font-semibold">E-mail</p>
  <p className="text-slate-300">compliance@empresa.com</p>  {/* ← ALTERAR */}
</div>
```

Substitua pelos dados reais:
- Telefone do canal de denúncias
- E-mail de compliance da empresa

---

### 4. 🔌 INTEGRAR API DE ACOMPANHAMENTO (PRIORIDADE BAIXA)

**Atualmente:** Página de acompanhamento usa dados mockados (simulados)

**Para integrar com backend real:**

**a) Backend - Criar endpoint:**

Arquivo: `apps/backend/src/complaints/complaints.controller.ts`

```typescript
@Get('track/:protocol')
@Public()  // Endpoint público (sem autenticação)
async trackByProtocol(@Param('protocol') protocol: string) {
  const complaint = await this.complaintsService.findOne({ 
    where: { protocol } 
  });
  
  if (!complaint) {
    throw new NotFoundException('Denúncia não encontrada');
  }
  
  return {
    id: complaint.id,
    protocol: complaint.protocol,
    status: complaint.status,
    type: complaint.type,
    title: complaint.title,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt
  };
}
```

**b) Frontend - Substituir mock:**

Arquivo: `apps/frontend/app/acompanhar/page.tsx`

Linha ~115 - Substituir:

```typescript
// REMOVER MOCK:
const mockComplaint: ComplaintStatus = { ... };
setComplaint(mockComplaint);

// ADICIONAR API REAL:
const response = await fetch(
  `http://localhost:3000/api/v1/complaints/track/${protocolToSearch}`
);

if (!response.ok) {
  throw new Error('Protocolo não encontrado');
}

const complaint = await response.json();
setComplaint(complaint);
```

---

## 🧪 TESTES NECESSÁRIOS

### ✅ Antes de Publicar

- [ ] **Landing Page:**
  - [ ] Logo institucional aparece corretamente
  - [ ] Botão "Fazer Denúncia" redireciona para `/nova-denuncia`
  - [ ] Campo de busca de protocolo funciona
  - [ ] Todos os 6 cards de documentos têm PDFs válidos
  - [ ] Informações de contato estão corretas
  - [ ] Seção de garantias renderiza
  - [ ] CTA final funciona
  - [ ] Footer exibe informações corretas

- [ ] **Acompanhamento:**
  - [ ] Busca por protocolo funciona (mock ou API real)
  - [ ] Status é exibido com cor correta
  - [ ] Timeline visual renderiza todas as 5 etapas
  - [ ] Informações da denúncia aparecem
  - [ ] Botão "Voltar ao Início" funciona
  - [ ] Botão "Imprimir" funciona
  - [ ] URL com `?protocol=XXX` carrega automaticamente

- [ ] **Responsividade:**
  - [ ] Mobile (< 768px) - cards em 1 coluna
  - [ ] Tablet (768px-1024px) - cards em 2 colunas
  - [ ] Desktop (> 1024px) - cards em 3 colunas
  - [ ] Texto legível em todos os tamanhos
  - [ ] Botões acessíveis em touch screens

- [ ] **Navegação:**
  - [ ] `/` → `/nova-denuncia` (botão fazer denúncia)
  - [ ] `/` → `/acompanhar` (busca de protocolo)
  - [ ] `/acompanhar` → `/` (botão voltar)
  - [ ] Download de PDFs abre em nova aba
  - [ ] Botão "Área Administrativa" redireciona para `/login`

---

## 📱 COMO VISUALIZAR

### 1. Certifique-se de que o Frontend está rodando:

```powershell
cd apps\frontend
npm run dev -- --port 3001
```

### 2. Acesse no navegador:

- **Landing Page:** http://localhost:3001/
- **Acompanhamento:** http://localhost:3001/acompanhar
- **Teste com protocolo:** http://localhost:3001/acompanhar?protocol=TESTE-123

### 3. Teste em diferentes dispositivos:

**No navegador (DevTools):**
- Pressione F12
- Clique no ícone de dispositivos móveis
- Teste em:
  - iPhone SE (375px)
  - iPhone 12 Pro (390px)
  - iPad (768px)
  - Desktop (1920px)

---

## 🎯 STATUS ATUAL

### ✅ CONCLUÍDO
- [x] Landing page completamente funcional
- [x] Página de acompanhamento funcional (com mock)
- [x] Design responsivo implementado
- [x] Todos os componentes visuais criados
- [x] Navegação entre páginas funcionando
- [x] Documentação completa criada

### ⚠️ AGUARDANDO CLIENTE
- [ ] PDFs dos documentos normativos
- [ ] Logo institucional (PNG ou SVG)
- [ ] Telefone de contato real
- [ ] E-mail de compliance real

### 🔧 OPCIONAL (MELHORIAS)
- [ ] Integrar API real de acompanhamento
- [ ] Adicionar animações de transição
- [ ] Implementar dark mode completo
- [ ] Adicionar mais idiomas (i18n)
- [ ] SEO optimization (meta tags)

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

1. **LANDING_PAGE_IMPLEMENTACAO.md** - Visão geral completa
2. **PERSONALIZACAO_LOGO.md** - Guia de customização de logo
3. **public/docs/README.md** - Gerenciamento de PDFs
4. **TESTE_FLUXO_COMPLETO.md** - Guia de testes do sistema
5. **COMO_INICIAR_SERVIDORES.md** - Como rodar o projeto

---

## 🆘 SUPORTE

**Se precisar de ajuda:**

1. Consulte a documentação acima
2. Verifique se os servidores estão rodando
3. Limpe o cache do navegador (Ctrl + Shift + R)
4. Revise os arquivos modificados

**Arquivos principais criados/modificados:**
```
✅ apps/frontend/app/page.tsx (254 linhas) - NOVA LANDING PAGE
✅ apps/frontend/app/acompanhar/page.tsx (395 linhas) - NOVA PÁGINA
✅ apps/frontend/public/docs/README.md
✅ LANDING_PAGE_IMPLEMENTACAO.md
✅ PERSONALIZACAO_LOGO.md
✅ TAREFAS_PENDENTES.md (este arquivo)
```

---

**🎉 Implementação concluída com sucesso!**

Todos os recursos solicitados foram desenvolvidos. Agora é só personalizar com os dados reais da empresa (logo, PDFs, contatos) e fazer os testes finais antes do deploy.

**Data:** 17/10/2025
**Status:** ✅ COMPLETO - Aguardando customização do cliente
