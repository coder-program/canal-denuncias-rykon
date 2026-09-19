# 📄 PDFs Placeholder - Instruções

Como os PDFs reais dos documentos normativos ainda não foram fornecidos, você tem duas opções:

## Opção 1: Criar PDFs Placeholder (Temporário)

Você pode criar PDFs simples temporários para testar os links:

### Usando Microsoft Word ou Google Docs:

1. **Código de Ética**
   - Crie um documento com título "Código de Ética da Empresa"
   - Adicione conteúdo genérico sobre ética empresarial
   - Salve como PDF: `codigo-etica.pdf`

2. **Política de Fornecedores**
   - Título: "Política de Relacionamento com Fornecedores e Parceiros"
   - Conteúdo sobre diretrizes de parceria
   - Salve como: `politica-fornecedores.pdf`

3. **Política Anticorrupção**
   - Título: "Política Anticorrupção e Antissuborno"
   - Conteúdo sobre combate à corrupção
   - Salve como: `politica-anticorrupcao.pdf`

4. **Política de Licitações**
   - Título: "Política de Participação em Licitações"
   - Conteúdo sobre processos licitatórios
   - Salve como: `politica-licitacoes.pdf`

5. **Política PLD/FTP**
   - Título: "Política de Prevenção à Lavagem de Dinheiro (PLD/FTP)"
   - Conteúdo sobre prevenção ao terrorismo
   - Salve como: `politica-pld-ftp.pdf`

6. **Política de Assédio**
   - Título: "Política de Combate ao Assédio Moral e Sexual"
   - Conteúdo sobre ambiente de trabalho saudável
   - Salve como: `politica-assedio.pdf`

### Onde colocar:

```
apps/frontend/public/docs/
```

---

## Opção 2: Ocultar a Seção Temporariamente

Se preferir não mostrar os documentos até ter os PDFs reais:

### Editar: `apps/frontend/app/page.tsx`

**Linhas 175-216** - Comentar a seção inteira:

```tsx
{
  /* SEÇÃO TEMPORARIAMENTE DESABILITADA - AGUARDANDO PDFs

      <section className="max-w-7xl mx-auto px-6 py-16 bg-white/50 backdrop-blur-sm rounded-3xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Documentos Normativos</h2>
          ...
        </div>
      </section>

FIM DA SEÇÃO DESABILITADA */
}
```

---

## Opção 3: Usar Gerador Online de PDF

### Ferramentas gratuitas:

1. **Canva** (canva.com)
   - Template profissional
   - Fácil de personalizar
   - Export em PDF

2. **Google Docs**
   - Crie documento
   - Arquivo → Fazer download → PDF

3. **Microsoft Word Online**
   - Gratuito com conta Microsoft
   - Salvar como PDF

4. **LibreOffice Writer**
   - Software gratuito
   - Export direto para PDF

---

## Template Sugerido para os PDFs

### Estrutura Básica:

```
┌─────────────────────────────────┐
│  LOGO DA EMPRESA (OPCIONAL)     │
│                                 │
│  TÍTULO DO DOCUMENTO            │
│  Política/Código/Norma          │
│                                 │
├─────────────────────────────────┤
│                                 │
│  1. OBJETIVO                    │
│     Descrever o propósito...    │
│                                 │
│  2. ABRANGÊNCIA                 │
│     Quem está sujeito...        │
│                                 │
│  3. DIRETRIZES                  │
│     • Diretriz 1                │
│     • Diretriz 2                │
│     • Diretriz 3                │
│                                 │
│  4. RESPONSABILIDADES           │
│     Definir papéis...           │
│                                 │
│  5. PENALIDADES                 │
│     Consequências...            │
│                                 │
│  6. DISPOSIÇÕES FINAIS          │
│     Informações adicionais...   │
│                                 │
├─────────────────────────────────┤
│  Versão: 1.0                    │
│  Data: Outubro/2025             │
│  Aprovado por: [Nome]           │
└─────────────────────────────────┘
```

---

## Conteúdo Genérico Sugerido

### 1. Código de Ética (Exemplo)

```markdown
CÓDIGO DE ÉTICA EMPRESARIAL

1. OBJETIVO
   Este código estabelece os princípios éticos que guiam as ações
   da empresa e de todos os seus colaboradores.

2. VALORES FUNDAMENTAIS

- Integridade
- Transparência
- Respeito
- Responsabilidade
- Excelência

3. CONDUTAS ESPERADAS

- Agir com honestidade em todas as relações
- Respeitar a diversidade e promover inclusão
- Proteger informações confidenciais
- Evitar conflitos de interesse
- Cumprir todas as leis e regulamentações

4. CANAL DE DENÚNCIAS
   Violações a este código devem ser reportadas através do
   Canal de Denúncias, com garantia de confidencialidade.

5. CONSEQUÊNCIAS
   Violações podem resultar em medidas disciplinares,
   incluindo advertência, suspensão ou desligamento.
```

### 2. Política Anticorrupção (Exemplo)

```markdown
POLÍTICA ANTICORRUPÇÃO E ANTISSUBORNO

1. PROPÓSITO
   Estabelecer diretrizes rígidas contra qualquer forma de
   corrupção, suborno ou práticas antiéticas.

2. PROIBIÇÕES
   É ESTRITAMENTE PROIBIDO:

- Oferecer, prometer ou dar vantagem indevida
- Solicitar ou aceitar propinas
- Facilitar pagamentos não autorizados
- Contratar intermediários para práticas ilícitas

3. BRINDES E PRESENTES

- Limitados a R$ 200,00
- Devem ser reportados
- Não podem influenciar decisões

4. RELACIONAMENTO COM GOVERNO

- Transparência total
- Documentação completa
- Aprovação prévia da Compliance

5. PENALIDADES
   Violações resultam em:

- Demissão por justa causa
- Processo civil/criminal
- Responsabilização pessoal
```

---

## Status Atual dos PDFs

```
❌ codigo-etica.pdf             - PENDENTE
❌ politica-fornecedores.pdf     - PENDENTE
❌ politica-anticorrupcao.pdf    - PENDENTE
❌ politica-licitacoes.pdf       - PENDENTE
❌ politica-pld-ftp.pdf          - PENDENTE
❌ politica-assedio.pdf          - PENDENTE
```

**Próxima ação:** Obter os documentos reais ou criar placeholders temporários.

---

## Checklist de Validação dos PDFs

Quando adicionar os PDFs reais, verifique:

- [ ] Arquivo está em formato PDF
- [ ] Nome do arquivo está correto (sem espaços, minúsculas)
- [ ] PDF abre corretamente
- [ ] Conteúdo está legível
- [ ] Tamanho do arquivo é razoável (< 5MB)
- [ ] PDF está na pasta correta (`public/docs/`)
- [ ] Link funciona no navegador

---

## Teste Rápido

Após adicionar os PDFs:

```bash
# Acesse diretamente no navegador:
http://localhost:3001/docs/codigo-etica.pdf
http://localhost:3001/docs/politica-fornecedores.pdf
http://localhost:3001/docs/politica-anticorrupcao.pdf
http://localhost:3001/docs/politica-licitacoes.pdf
http://localhost:3001/docs/politica-pld-ftp.pdf
http://localhost:3001/docs/politica-assedio.pdf
```

Se o PDF abre, o link está funcionando! ✅

---

**Nota:** Os PDFs placeholder são apenas para testes. Substitua pelos documentos oficiais antes do deploy em produção.
