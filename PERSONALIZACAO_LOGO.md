# 🎨 Personalização do Logo Institucional

Este guia explica como substituir o logo padrão pelo logo institucional do cliente.

## 📍 Onde Está o Logo

O logo aparece em **3 locais principais**:

1. **Página Inicial** (`/`)
2. **Página de Acompanhamento** (`/acompanhar`)
3. **Todas as páginas internas** (Dashboard, Denúncias, etc.)

## 🔧 Método 1: Substituir com Imagem (Recomendado)

### 1. Adicionar o arquivo de logo

Coloque o arquivo do logo (PNG, SVG ou JPG) em:
```
apps/frontend/public/logo-empresa.png
```

### 2. Atualizar a Página Inicial

Edite o arquivo: `apps/frontend/app/page.tsx`

**Linha ~102** - Substitua o componente Shield por:

```tsx
<div className="flex items-center gap-4">
  {/* Logo Institucional */}
  <img 
    src="/logo-empresa.png" 
    alt="Logo da Empresa" 
    className="h-16 w-auto"
  />
  <div>
    <h1 className="text-2xl font-bold text-slate-900">Canal de Denúncias</h1>
    <p className="text-sm text-slate-600">Compliance e Integridade Corporativa</p>
  </div>
</div>
```

### 3. Atualizar a Página de Acompanhamento

Edite o arquivo: `apps/frontend/app/acompanhar/page.tsx`

**Linha ~139** - Substitua:

```tsx
<Link href="/" className="flex items-center gap-4">
  <img 
    src="/logo-empresa.png" 
    alt="Logo da Empresa" 
    className="h-12 w-auto"
  />
  <div>
    <h1 className="text-xl font-bold text-slate-900">Acompanhar Denúncia</h1>
    <p className="text-xs text-slate-600">Consulte o status pelo protocolo</p>
  </div>
</Link>
```

### 4. Atualizar o Layout Principal

Edite o arquivo: `apps/frontend/components/Sidebar.tsx`

**Procure por:** `<Shield` e substitua por:

```tsx
<img 
  src="/logo-empresa.png" 
  alt="Logo" 
  className="h-10 w-auto"
/>
```

## 🎯 Método 2: Usar Next.js Image (Otimizado)

Para melhor performance, use o componente `Image` do Next.js:

```tsx
import Image from 'next/image';

// No código:
<Image
  src="/logo-empresa.png"
  alt="Logo da Empresa"
  width={64}
  height={64}
  className="h-16 w-auto"
  priority
/>
```

## 📐 Recomendações de Tamanho

- **Formato:** PNG com fundo transparente ou SVG
- **Tamanho recomendado:** 256x256 pixels (mínimo)
- **Proporção:** Quadrada ou retangular (máx 3:1)
- **Peso:** Menos de 200KB

## 🎨 Ajustes de Estilo

### Logo com Fundo

Se o logo precisar de um fundo:

```tsx
<div className="bg-white p-3 rounded-xl shadow-md">
  <img 
    src="/logo-empresa.png" 
    alt="Logo" 
    className="h-12 w-auto"
  />
</div>
```

### Logo Muito Grande

Se o logo ficar muito grande:

```tsx
<img 
  src="/logo-empresa.png" 
  alt="Logo" 
  className="h-10 w-auto"  {/* Reduzir de h-16 para h-10 */}
/>
```

### Logo Muito Pequeno

Se o logo ficar muito pequeno:

```tsx
<img 
  src="/logo-empresa.png" 
  alt="Logo" 
  className="h-20 w-auto"  {/* Aumentar de h-16 para h-20 */}
/>
```

## 📱 Responsividade

Para diferentes tamanhos em mobile vs desktop:

```tsx
<img 
  src="/logo-empresa.png" 
  alt="Logo" 
  className="h-12 md:h-16 w-auto"  {/* 12 no mobile, 16 no desktop */}
/>
```

## 🔍 Localizações Exatas dos Logos

### 1. apps/frontend/app/page.tsx
- **Linha ~102:** Header principal
- **Linha ~280:** Footer

### 2. apps/frontend/app/acompanhar/page.tsx
- **Linha ~139:** Header da página de acompanhamento

### 3. apps/frontend/components/Sidebar.tsx
- **Linha ~85:** Sidebar do dashboard (procure por `<Shield`)

### 4. apps/frontend/app/login/page.tsx
- **Linha ~35:** Página de login (se houver logo)

## 🧪 Testar as Mudanças

Após fazer as alterações:

1. Salve todos os arquivos
2. O Next.js recarregará automaticamente
3. Verifique todas as páginas:
   - http://localhost:3001/ (Home)
   - http://localhost:3001/acompanhar (Acompanhamento)
   - http://localhost:3001/dashboard (Dashboard - após login)

## 🎭 Exemplo Completo

**Antes:**
```tsx
<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
  <Shield className="w-9 h-9 text-white" />
</div>
```

**Depois:**
```tsx
<img 
  src="/logo-empresa.png" 
  alt="Logo da Empresa" 
  className="h-16 w-auto rounded-xl shadow-lg"
/>
```

## 🆘 Problemas Comuns

### Logo não aparece
- Verifique se o arquivo está em `public/` (não em `public/images/`)
- O caminho deve ser `/logo-empresa.png` (com barra inicial)
- Limpe o cache: `Ctrl + Shift + R`

### Logo muito grande/pequeno
- Ajuste a classe `h-16` para `h-10`, `h-12`, `h-20`, etc.
- Use `w-auto` para manter a proporção

### Logo pixelizado
- Use formato SVG para qualidade infinita
- Ou PNG em alta resolução (mínimo 256x256px)

---

**🎨 Dica:** Mantenha o logo simples e legível. Um bom logo deve funcionar em tamanhos pequenos e grandes.
