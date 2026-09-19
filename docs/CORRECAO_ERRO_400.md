# 🔧 Erro 400 - Bad Request Corrigido

## ❌ Erro Original

```
POST http://localhost:3000/api/v1/complaints 400 (Bad Request)
```

---

## 🔍 Causa do Problema

O **frontend estava enviando valores de enum que não existem no backend**.

### Valores Incorretos Enviados:

```typescript
// Frontend (ERRADO)
type: 'CONFLICT_OF_INTEREST'; // ❌ Não existe no backend
type: 'DATA_BREACH'; // ❌ Não existe no backend
priority: 'URGENT'; // ❌ Não existe no backend
```

### Valores Aceitos pelo Backend:

```prisma
// Backend - schema.prisma
enum ComplaintType {
  HARASSMENT      ✅
  DISCRIMINATION  ✅
  FRAUD           ✅
  CORRUPTION      ✅
  SAFETY          ✅
  ETHICS          ✅
  OTHER           ✅
}

enum ComplaintPriority {
  LOW       ✅
  MEDIUM    ✅
  HIGH      ✅
  CRITICAL  ✅
}
```

---

## ✅ Solução Aplicada

### 1. **Corrigidas as Categorias**

**Antes:**

```typescript
const CATEGORIES = [
  { value: 'HARASSMENT', label: 'Assédio Moral ou Sexual' },
  { value: 'DISCRIMINATION', label: 'Discriminação' },
  { value: 'FRAUD', label: 'Fraude Financeira' },
  { value: 'CORRUPTION', label: 'Corrupção' },
  { value: 'SAFETY', label: 'Segurança do Trabalho' },
  { value: 'CONFLICT_OF_INTEREST', label: 'Conflito de Interesses' }, // ❌
  { value: 'DATA_BREACH', label: 'Vazamento de Dados' }, // ❌
  { value: 'OTHER', label: 'Outros' },
];
```

**Depois:**

```typescript
const CATEGORIES = [
  { value: 'HARASSMENT', label: 'Assédio Moral ou Sexual' },
  { value: 'DISCRIMINATION', label: 'Discriminação' },
  { value: 'FRAUD', label: 'Fraude Financeira' },
  { value: 'CORRUPTION', label: 'Corrupção' },
  { value: 'SAFETY', label: 'Segurança do Trabalho' },
  { value: 'ETHICS', label: 'Questões Éticas' }, // ✅ NOVO
  { value: 'OTHER', label: 'Outros' },
];
```

### 2. **Corrigidas as Prioridades**

**Antes:**

```typescript
const PRIORITIES = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }, // ❌
];
```

**Depois:**

```typescript
const PRIORITIES = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' }, // ✅
];
```

### 3. **Atualizadas as Interfaces TypeScript**

#### FormData (page.tsx):

```typescript
interface FormData {
  // ...
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // ✅
}
```

#### CreateComplaintRequest (complaintsService.ts):

```typescript
export interface CreateComplaintRequest {
  type: 'HARASSMENT' | 'DISCRIMINATION' | 'FRAUD' | 'CORRUPTION' | 'SAFETY' | 'ETHICS' | 'OTHER'; // ✅
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // ✅
}
```

---

## 📋 Arquivos Modificados

1. ✅ `apps/frontend/app/nova-denuncia/page.tsx`
   - CATEGORIES array
   - PRIORITIES array
   - FormData interface

2. ✅ `apps/frontend/lib/services/complaintsService.ts`
   - CreateComplaintRequest interface

---

## 🧪 Como Testar Agora

### 1. Recarregue a Página

```
http://localhost:3001/nova-denuncia
```

### 2. Preencha o Formulário

```
Título: Teste de denúncia corrigida
Categoria: Questões Éticas (nova opção!)
Prioridade: Crítica (era "Urgente")
Descrição: Testando com os valores corretos...
Delato/Acusado: João Silva
```

### 3. Envie

Agora deve funcionar sem erro 400! ✅

---

## 📊 Mapeamento Completo

### Categorias Válidas:

| Valor Backend    | Label Frontend          |
| ---------------- | ----------------------- |
| `HARASSMENT`     | Assédio Moral ou Sexual |
| `DISCRIMINATION` | Discriminação           |
| `FRAUD`          | Fraude Financeira       |
| `CORRUPTION`     | Corrupção               |
| `SAFETY`         | Segurança do Trabalho   |
| `ETHICS`         | Questões Éticas         |
| `OTHER`          | Outros                  |

### Prioridades Válidas:

| Valor Backend | Label Frontend |
| ------------- | -------------- |
| `LOW`         | Baixa          |
| `MEDIUM`      | Média          |
| `HIGH`        | Alta           |
| `CRITICAL`    | Crítica        |

---

## 💡 Lição Aprendida

**Sempre sincronizar enums entre frontend e backend!**

### Checklist para Evitar Erro 400:

- [ ] Verificar schema.prisma do backend
- [ ] Verificar DTOs (create-complaint.dto.ts)
- [ ] Sincronizar interfaces TypeScript no frontend
- [ ] Testar valores válidos

---

## 🎯 Status Atual

✅ **CORRIGIDO!**

O formulário agora envia apenas valores que o backend aceita.

---

**Data da Correção**: 16/10/2025  
**Erro**: 400 Bad Request  
**Causa**: Enums incompatíveis  
**Solução**: Sincronização Frontend ↔ Backend
