# 📋 Exemplos de Uso da API de Denúncias

Guia completo com exemplos cURL e explicações para todos os endpoints do módulo de denúncias.

---

## 📌 Índice

1. [Criar Denúncia (Pública)](#1-criar-denúncia-pública)
2. [Buscar por Protocolo (Pública)](#2-buscar-por-protocolo-pública)
3. [Listar Denúncias](#3-listar-denúncias)
4. [Ver Detalhes de Denúncia](#4-ver-detalhes-de-denúncia)
5. [Atualizar Denúncia](#5-atualizar-denúncia)
6. [Atribuir Investigador](#6-atribuir-investigador)
7. [Alterar Status](#7-alterar-status)
8. [Estatísticas](#8-estatísticas)
9. [Arquivar Denúncia](#9-arquivar-denúncia)

---

## 1. Criar Denúncia (Pública)

**Endpoint público** - não requer autenticação.

### Exemplo 1: Denúncia Identificada

```bash
curl -X POST http://localhost:3000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "isAnonymous": false,
    "reporterEmail": "denunciante@example.com",
    "reporterPhone": "+5511999999999",
    "type": "HARASSMENT",
    "priority": "HIGH",
    "title": "Assédio moral no departamento de vendas",
    "description": "Durante o mês de outubro, presenciei repetidas situações de assédio moral pelo gestor da equipe. O comportamento incluiu gritos, humilhações públicas e ameaças de demissão sem justificativa.",
    "location": "Escritório - 3º andar, sala 305",
    "incidentDate": "2024-10-01T14:30:00Z",
    "involvedPeople": ["João Silva", "maria@empresa.com"],
    "witnesses": ["Pedro Santos", "Ana Costa"],
    "metadata": {
      "department": "Vendas",
      "shift": "Manhã"
    }
  }'
```

**Resposta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "protocol": "DEN-2024-A1B2C3",
  "status": "PENDING",
  "type": "HARASSMENT",
  "priority": "HIGH",
  "title": "Assédio moral no departamento de vendas",
  "isAnonymous": false,
  "createdAt": "2024-10-14T10:30:00.000Z",
  "updatedAt": "2024-10-14T10:30:00.000Z"
}
```

### Exemplo 2: Denúncia Anônima

```bash
curl -X POST http://localhost:3000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "isAnonymous": true,
    "type": "FRAUD",
    "priority": "CRITICAL",
    "title": "Fraude em processo licitatório",
    "description": "Tenho conhecimento de que o processo de licitação XYZ-2024 foi direcionado para um fornecedor específico mediante pagamento de propina. Há documentos que comprovam a manipulação dos requisitos técnicos para favorecer uma única empresa.",
    "location": "Departamento de Compras",
    "incidentDate": "2024-09-15T00:00:00Z",
    "metadata": {
      "processNumber": "LIC-2024-0345"
    }
  }'
```

**Resposta:**
```json
{
  "id": "987e6543-e21b-34d5-a678-426614174000",
  "protocol": "DEN-2024-XYZ789",
  "status": "PENDING",
  "type": "FRAUD",
  "priority": "CRITICAL",
  "title": "Fraude em processo licitatório",
  "isAnonymous": true,
  "createdAt": "2024-10-14T10:35:00.000Z"
}
```

---

## 2. Buscar por Protocolo (Pública)

Permite ao denunciante acompanhar o status da denúncia usando o protocolo recebido.

```bash
curl -X GET http://localhost:3000/api/v1/complaints/protocol/DEN-2024-A1B2C3
```

**Resposta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "protocol": "DEN-2024-A1B2C3",
  "status": "IN_PROGRESS",
  "type": "HARASSMENT",
  "priority": "HIGH",
  "title": "Assédio moral no departamento de vendas",
  "createdAt": "2024-10-14T10:30:00.000Z",
  "updatedAt": "2024-10-15T14:20:00.000Z",
  "resolvedAt": null,
  "isAnonymous": false
}
```

---

## 3. Listar Denúncias

**Requer autenticação** - JWT Bearer Token.

### Exemplo 1: Listar Todas (ADMIN/INVESTIGATOR)

```bash
curl -X GET "http://localhost:3000/api/v1/complaints?page=1&limit=20" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Exemplo 2: Filtrar por Status

```bash
curl -X GET "http://localhost:3000/api/v1/complaints?status=PENDING&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Exemplo 3: Filtrar por Tipo e Prioridade

```bash
curl -X GET "http://localhost:3000/api/v1/complaints?type=HARASSMENT&priority=HIGH&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Exemplo 4: Buscar com Palavra-Chave

```bash
curl -X GET "http://localhost:3000/api/v1/complaints?search=assédio" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "protocol": "DEN-2024-A1B2C3",
      "status": "PENDING",
      "type": "HARASSMENT",
      "priority": "HIGH",
      "title": "Assédio moral no departamento de vendas",
      "createdAt": "2024-10-14T10:30:00.000Z",
      "creator": {
        "id": "user-123",
        "email": "denunciante@example.com",
        "fullName": "José Silva",
        "role": "REPORTER"
      },
      "investigator": null,
      "_count": {
        "attachments": 2,
        "statusHistory": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 4. Ver Detalhes de Denúncia

**Requer autenticação** - JWT Bearer Token.

```bash
curl -X GET http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "protocol": "DEN-2024-A1B2C3",
  "status": "IN_PROGRESS",
  "type": "HARASSMENT",
  "priority": "HIGH",
  "title": "Assédio moral no departamento de vendas",
  "description": "Durante o mês de outubro...",
  "location": "Escritório - 3º andar, sala 305",
  "incidentDate": "2024-10-01T14:30:00.000Z",
  "involvedPeople": ["João Silva", "maria@empresa.com"],
  "witnesses": ["Pedro Santos"],
  "creator": {
    "id": "user-123",
    "email": "denunciante@example.com",
    "fullName": "José Silva",
    "role": "REPORTER"
  },
  "investigator": {
    "id": "inv-456",
    "email": "investigador@empresa.com",
    "fullName": "Maria Oliveira"
  },
  "attachments": [
    {
      "id": "att-1",
      "filename": "evidencia-01.pdf",
      "mimeType": "application/pdf",
      "size": 245678,
      "uploadedAt": "2024-10-14T11:00:00.000Z"
    }
  ],
  "statusHistory": [
    {
      "id": "hist-1",
      "previousStatus": "PENDING",
      "newStatus": "IN_PROGRESS",
      "reason": "Atribuída ao investigador Maria Oliveira",
      "changedAt": "2024-10-15T09:00:00.000Z",
      "changedBy": "admin-789"
    },
    {
      "id": "hist-2",
      "previousStatus": null,
      "newStatus": "PENDING",
      "reason": "Denúncia criada",
      "changedAt": "2024-10-14T10:30:00.000Z"
    }
  ],
  "createdAt": "2024-10-14T10:30:00.000Z",
  "updatedAt": "2024-10-15T09:00:00.000Z"
}
```

---

## 5. Atualizar Denúncia

**Requer autenticação** - Apenas ADMIN/INVESTIGATOR.

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "CRITICAL",
    "metadata": {
      "updatedBy": "Investigator",
      "notes": "Situação agravada após nova evidência"
    }
  }'
```

---

## 6. Atribuir Investigador

**Requer autenticação** - Apenas ADMIN.

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000/assign/inv-456 \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN"
```

**Resposta:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "protocol": "DEN-2024-A1B2C3",
  "status": "IN_PROGRESS",
  "investigatorId": "inv-456",
  "updatedAt": "2024-10-15T09:00:00.000Z"
}
```

---

## 7. Alterar Status

**Requer autenticação** - Apenas ADMIN/INVESTIGATOR.

### Exemplo 1: Iniciar Investigação

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "reason": "Investigação iniciada após análise preliminar das evidências"
  }'
```

### Exemplo 2: Colocar em Revisão

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer SEU_TOKEN_JWT_INVESTIGATOR" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "UNDER_REVIEW",
    "reason": "Investigação concluída. Aguardando parecer do comitê de ética"
  }'
```

### Exemplo 3: Resolver Denúncia

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "reason": "Medidas disciplinares aplicadas. Gestor advertido e participará de treinamento de liderança. Departamento de RH implementará acompanhamento mensal."
  }'
```

### Exemplo 4: Arquivar por Improcedência

```bash
curl -X PATCH http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DISMISSED",
    "reason": "Após investigação detalhada com entrevistas e análise de evidências, não foram encontrados elementos que comprovem as alegações"
  }'
```

---

## 8. Estatísticas

**Requer autenticação** - Apenas ADMIN/AUDITOR.

```bash
curl -X GET http://localhost:3000/api/v1/complaints/stats \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN"
```

**Resposta:**
```json
{
  "total": 150,
  "byStatus": {
    "pending": 25,
    "inProgress": 40,
    "resolved": 85
  },
  "byType": {
    "HARASSMENT": 35,
    "DISCRIMINATION": 20,
    "FRAUD": 15,
    "CORRUPTION": 10,
    "SAFETY_VIOLATION": 25,
    "ENVIRONMENTAL": 5,
    "OTHER": 40
  },
  "byPriority": {
    "LOW": 40,
    "MEDIUM": 70,
    "HIGH": 30,
    "CRITICAL": 10
  }
}
```

---

## 9. Arquivar Denúncia

**Requer autenticação** - Apenas ADMIN.

```bash
curl -X DELETE http://localhost:3000/api/v1/complaints/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN"
```

**Resposta:**
```json
{
  "message": "Denúncia arquivada com sucesso"
}
```

---

## 🔑 Tipos de Denúncia (ComplaintType)

| Valor | Descrição |
|-------|-----------|
| `HARASSMENT` | Assédio moral ou sexual |
| `DISCRIMINATION` | Discriminação (raça, gênero, idade, etc.) |
| `FRAUD` | Fraude financeira ou documental |
| `CORRUPTION` | Corrupção ou suborno |
| `SAFETY_VIOLATION` | Violação de normas de segurança |
| `ENVIRONMENTAL` | Crimes ambientais |
| `OTHER` | Outros tipos de denúncia |

---

## ⚠️ Níveis de Prioridade (ComplaintPriority)

| Valor | Descrição | SLA |
|-------|-----------|-----|
| `LOW` | Baixa prioridade | 15 dias |
| `MEDIUM` | Média prioridade | 7 dias |
| `HIGH` | Alta prioridade | 3 dias |
| `CRITICAL` | Crítica - requer ação imediata | 24 horas |

---

## 📊 Estados da Denúncia (ComplaintStatus)

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando triagem |
| `IN_PROGRESS` | Em investigação |
| `UNDER_REVIEW` | Em análise pelo comitê |
| `RESOLVED` | Resolvida |
| `DISMISSED` | Arquivada (improcedente) |
| `ESCALATED` | Escalada para instâncias superiores |

---

## 🔒 Controle de Acesso (RBAC)

| Endpoint | PUBLIC | REPORTER | INVESTIGATOR | ADMIN | AUDITOR |
|----------|--------|----------|--------------|-------|---------|
| POST /complaints | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /complaints/protocol/:protocol | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /complaints | ❌ | ✅ (próprias) | ✅ | ✅ | ✅ |
| GET /complaints/:id | ❌ | ✅ (próprias) | ✅ | ✅ | ✅ |
| GET /complaints/stats | ❌ | ❌ | ❌ | ✅ | ✅ |
| PATCH /complaints/:id | ❌ | ❌ | ✅ | ✅ | ❌ |
| PATCH /complaints/:id/assign | ❌ | ❌ | ❌ | ✅ | ❌ |
| PATCH /complaints/:id/status | ❌ | ❌ | ✅ | ✅ | ❌ |
| DELETE /complaints/:id | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 🛡️ Recursos de Segurança

### 1. Bloqueio Automático de Usuários Citados

Quando a configuração `auto_block_involved_users` está ativada no sistema:

```bash
# Consultar configuração
curl -X GET http://localhost:3000/api/v1/system-settings/auto_block_involved_users \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN"

# Ativar bloqueio automático
curl -X PATCH http://localhost:3000/api/v1/system-settings/auto_block_involved_users \
  -H "Authorization: Bearer SEU_TOKEN_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{ "value": "true" }'
```

**Comportamento:**
- Usuários listados em `involvedPeople` são automaticamente bloqueados
- Acesso ao sistema é suspenso preventivamente
- Log de auditoria registra a ação
- Bloqueio pode ser revertido por ADMIN após investigação

### 2. Auditoria Completa

Todas as ações são registradas na tabela `AuditLog`:
- Criação de denúncia
- Visualização de detalhes
- Alterações de status
- Atribuição de investigadores
- Bloqueio de usuários

### 3. Criptografia de Dados Sensíveis

Dados de PII (Personally Identifiable Information) são criptografados:
- Email do denunciante
- Telefone do denunciante
- Nomes de pessoas envolvidas

### 4. Integridade de Dados

Cada denúncia recebe um hash SHA-256 de integridade para detectar adulteração.

---

## 📝 Notas Importantes

1. **Protocolo único**: Cada denúncia recebe um protocolo único no formato `DEN-YYYY-XXXXXX`
2. **Denúncias anônimas**: Não armazenam informações do criador
3. **Soft delete**: Denúncias nunca são deletadas fisicamente, apenas marcadas como `DISMISSED`
4. **Notificações**: Admins e investigadores são notificados automaticamente sobre novas denúncias
5. **Histórico de status**: Todas as mudanças de status são rastreadas com motivo e responsável

---

## 🧪 Scripts de Teste

### Script para criar múltiplas denúncias de teste:

```bash
#!/bin/bash

for i in {1..5}; do
  curl -X POST http://localhost:3000/api/v1/complaints \
    -H "Content-Type: application/json" \
    -d "{
      \"isAnonymous\": false,
      \"reporterEmail\": \"teste$i@example.com\",
      \"type\": \"HARASSMENT\",
      \"priority\": \"MEDIUM\",
      \"title\": \"Denúncia de teste #$i\",
      \"description\": \"Esta é uma denúncia de teste para validação do sistema. Contém descrição detalhada com mais de 50 caracteres para atender aos requisitos mínimos.\"
    }"
  echo ""
done
```

---

**Documentação gerada em:** 2024-10-14  
**Versão da API:** v1.0.0
