# 📁 Documentos Normativos

Esta pasta contém os documentos normativos da empresa que ficam disponíveis para download na página inicial do Canal de Denúncias.

## 📄 Documentos Necessários

Coloque os seguintes arquivos PDF nesta pasta:

1. **codigo-etica.pdf**
   - Código de Ética da empresa
   - Princípios e valores corporativos

2. **politica-fornecedores.pdf**
   - Política de Relacionamento com Fornecedores e Parceiros
   - Diretrizes de parceria comercial

3. **politica-anticorrupcao.pdf**
   - Política Anticorrupção e Antissuborno
   - Normas de combate à corrupção

4. **politica-licitacoes.pdf**
   - Política de Participação em Licitações
   - Processos e procedimentos licitatórios

5. **politica-pld-ftp.pdf**
   - Política de Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo (PLD/FTP)
   - Prevenção à Proliferação de Armas de Destruição em Massa

6. **politica-assedio.pdf**
   - Política de Combate ao Assédio Moral e Sexual
   - Diretrizes de ambiente de trabalho saudável

## 🔗 Como Usar

Os documentos são referenciados na página inicial (`/`) com links diretos:

```tsx
{
  title: 'Código de Ética',
  file: '/docs/codigo-etica.pdf'
}
```

Os arquivos devem ser colocados em:

```
apps/frontend/public/docs/
```

E serão acessíveis publicamente via:

```
http://localhost:3001/docs/nome-do-arquivo.pdf
```

## 📝 Placeholder Temporário

Enquanto os documentos reais não estiverem disponíveis, você pode criar PDFs placeholder ou remover/comentar as seções correspondentes na página inicial.

## 🎨 Personalização

Para adicionar mais documentos, edite o array `documents` em:

```
apps/frontend/app/page.tsx
```

Exemplo:

```tsx
{
  title: 'Novo Documento',
  description: 'Descrição do documento',
  icon: FileText,
  color: 'blue',
  file: '/docs/novo-documento.pdf'
}
```

## 📊 Cores Disponíveis

- `blue` - Azul
- `green` - Verde
- `red` - Vermelho
- `purple` - Roxo
- `orange` - Laranja
- `pink` - Rosa

## 📱 Ícones Disponíveis

Importados de `lucide-react`:

- `FileCheck`
- `Building2`
- `Shield`
- `FileText`
- `AlertCircle`
- `Lock`

---

**Nota:** Todos os PDFs devem estar no formato correto e serem acessíveis publicamente. Certifique-se de que os arquivos não contenham informações confidenciais além do necessário.
