# 📡 Exemplos de Uso - API de Dossiers

Este arquivo contém exemplos práticos de como usar a API de Dossiers do Canal de Denúncias.

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT. Primeiro, obtenha um token:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

Use o token em todos os requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1️⃣ Gerar Dossiê Completo (PDF + ZIP)

### Request

```bash
curl -X POST http://localhost:3000/dossiers/complaint/complaint-123/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "includeSummary": true,
    "includeTimeline": true,
    "includeAttachments": true,
    "includeAuditLog": false,
    "format": "both"
  }'
```

### Response (201 Created)

```json
{
  "id": "dossier-abc123",
  "complaintId": "complaint-123",
  "title": "Dossiê - DEN-2024-001",
  "summary": "Dossiê gerado para denúncia DEN-2024-001. Tipo: Assédio. Status atual: Em Progresso. Total de anexos: 3. Total de alterações de status: 2.",
  "generatedBy": "user-admin-123",
  "s3PdfKey": "dossiers/dossier-abc123.pdf",
  "s3ZipKey": "dossiers/dossier-abc123.zip",
  "generatedAt": "2024-10-15T10:30:00.000Z",
  "complaint": {
    "id": "complaint-123",
    "protocol": "DEN-2024-001",
    "title": "Assédio Moral no Departamento de TI",
    "status": "IN_PROGRESS"
  },
  "createdBy": {
    "id": "user-admin-123",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

---

## 2️⃣ Gerar Apenas PDF

### Request

```bash
curl -X POST http://localhost:3000/dossiers/complaint/complaint-123/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "includeSummary": true,
    "includeTimeline": true,
    "includeAttachments": false,
    "format": "pdf"
  }'
```

### Response (201 Created)

```json
{
  "id": "dossier-def456",
  "complaintId": "complaint-123",
  "title": "Dossiê - DEN-2024-001",
  "summary": "Dossiê gerado para denúncia DEN-2024-001...",
  "generatedBy": "user-admin-123",
  "s3PdfKey": "dossiers/dossier-def456.pdf",
  "s3ZipKey": null,
  "generatedAt": "2024-10-15T10:35:00.000Z"
}
```

---

## 3️⃣ Gerar Apenas ZIP

### Request

```bash
curl -X POST http://localhost:3000/dossiers/complaint/complaint-123/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "includeAttachments": true,
    "format": "zip"
  }'
```

### Response (201 Created)

```json
{
  "id": "dossier-ghi789",
  "complaintId": "complaint-123",
  "title": "Dossiê - DEN-2024-001",
  "s3PdfKey": null,
  "s3ZipKey": "dossiers/dossier-ghi789.zip",
  "generatedAt": "2024-10-15T10:40:00.000Z"
}
```

---

## 4️⃣ Listar Dossiês de uma Denúncia

### Request

```bash
curl -X GET http://localhost:3000/dossiers/complaint/complaint-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response (200 OK)

```json
[
  {
    "id": "dossier-abc123",
    "complaintId": "complaint-123",
    "title": "Dossiê - DEN-2024-001",
    "generatedAt": "2024-10-15T10:30:00.000Z",
    "createdBy": {
      "id": "user-admin-123",
      "email": "admin@example.com",
      "fullName": "Admin User"
    }
  },
  {
    "id": "dossier-def456",
    "complaintId": "complaint-123",
    "title": "Dossiê - DEN-2024-001",
    "generatedAt": "2024-10-15T10:35:00.000Z",
    "createdBy": {
      "id": "user-committee-456",
      "email": "committee@example.com",
      "fullName": "Committee Member"
    }
  }
]
```

---

## 5️⃣ Obter Detalhes de um Dossiê

### Request

```bash
curl -X GET http://localhost:3000/dossiers/dossier-abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response (200 OK)

```json
{
  "id": "dossier-abc123",
  "complaintId": "complaint-123",
  "title": "Dossiê - DEN-2024-001",
  "summary": "Dossiê gerado para denúncia DEN-2024-001. Tipo: Assédio. Status atual: Em Progresso. Total de anexos: 3. Total de alterações de status: 2.",
  "generatedBy": "user-admin-123",
  "s3PdfKey": "dossiers/dossier-abc123.pdf",
  "s3ZipKey": "dossiers/dossier-abc123.zip",
  "generatedAt": "2024-10-15T10:30:00.000Z",
  "complaint": {
    "id": "complaint-123",
    "protocol": "DEN-2024-001",
    "title": "Assédio Moral no Departamento de TI",
    "description": "Descrição detalhada da situação...",
    "type": "HARASSMENT",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "location": "Departamento de TI",
    "incidentDate": "2024-01-15T00:00:00.000Z",
    "isAnonymous": false,
    "createdBy": "user-reporter-789",
    "createdAt": "2024-01-20T10:00:00.000Z"
  },
  "createdBy": {
    "id": "user-admin-123",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

---

## 6️⃣ Download PDF

### Request

```bash
curl -X GET "http://localhost:3000/dossiers/dossier-abc123/download/pdf?expiresIn=3600" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `expiresIn` (opcional): Tempo de expiração em segundos (padrão: 3600 = 1 hora)

### Response (200 OK)

```json
{
  "downloadUrl": "https://s3.amazonaws.com/canal-denuncia-attachments/dossiers/dossier-abc123.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresAt": "2024-10-15T11:30:00.000Z",
  "filename": "dossier-DEN-2024-001.pdf"
}
```

### Usando a URL

```bash
# Baixar o arquivo
curl -o dossier-DEN-2024-001.pdf "https://s3.amazonaws.com/canal-denuncia-attachments/dossiers/..."

# Ou abrir no navegador
open "https://s3.amazonaws.com/canal-denuncia-attachments/dossiers/..."
```

---

## 7️⃣ Download ZIP

### Request

```bash
curl -X GET "http://localhost:3000/dossiers/dossier-abc123/download/zip?expiresIn=7200" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `expiresIn` (opcional): Tempo de expiração em segundos (neste exemplo: 7200 = 2 horas)

### Response (200 OK)

```json
{
  "downloadUrl": "https://s3.amazonaws.com/canal-denuncia-attachments/dossiers/dossier-abc123.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresAt": "2024-10-15T12:30:00.000Z",
  "filename": "dossier-DEN-2024-001.zip"
}
```

---

## 8️⃣ Estatísticas de Dossiês

### Request

```bash
curl -X GET http://localhost:3000/dossiers/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Permissões:** Apenas ADMIN e COMMITTEE

### Response (200 OK)

```json
{
  "totalDossiers": 42,
  "topGenerators": [
    {
      "generatedBy": "user-admin-123",
      "_count": {
        "id": 15
      }
    },
    {
      "generatedBy": "user-committee-456",
      "_count": {
        "id": 12
      }
    },
    {
      "generatedBy": "user-investigator-789",
      "_count": {
        "id": 8
      }
    }
  ],
  "recentDossiers": [
    {
      "id": "dossier-abc123",
      "generatedAt": "2024-10-15T10:30:00.000Z",
      "complaint": {
        "protocol": "DEN-2024-001",
        "title": "Assédio Moral no Departamento de TI"
      },
      "createdBy": {
        "email": "admin@example.com",
        "fullName": "Admin User"
      }
    },
    {
      "id": "dossier-def456",
      "generatedAt": "2024-10-14T15:20:00.000Z",
      "complaint": {
        "protocol": "DEN-2024-002",
        "title": "Fraude Financeira"
      },
      "createdBy": {
        "email": "committee@example.com",
        "fullName": "Committee Member"
      }
    }
  ]
}
```

---

## 9️⃣ Deletar Dossiê (Apenas ADMIN)

### Request

```bash
curl -X DELETE http://localhost:3000/dossiers/dossier-abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Permissões:** Apenas ADMIN

### Response (204 No Content)

Sem corpo de resposta. O dossiê e seus arquivos (PDF e ZIP) foram permanentemente deletados do sistema e do S3.

---

## ❌ Tratamento de Erros

### Erro 400 - Dossiê sem PDF

```bash
curl -X GET http://localhost:3000/dossiers/dossier-xyz/download/pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Este dossiê não possui PDF gerado",
  "error": "Bad Request"
}
```

### Erro 403 - Acesso Negado

```bash
# REPORTER tentando gerar dossiê
curl -X POST http://localhost:3000/dossiers/complaint/complaint-123/generate \
  -H "Authorization: Bearer REPORTER_TOKEN"
```

**Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Erro 403 - REPORTER acessando denúncia de outro

```bash
# REPORTER tentando acessar denúncia de outro usuário
curl -X GET http://localhost:3000/dossiers/complaint/complaint-456 \
  -H "Authorization: Bearer REPORTER_TOKEN"
```

**Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar esta denúncia",
  "error": "Forbidden"
}
```

### Erro 404 - Dossiê Não Encontrado

```bash
curl -X GET http://localhost:3000/dossiers/invalid-id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Dossiê não encontrado",
  "error": "Not Found"
}
```

### Erro 404 - Denúncia Não Encontrada

```bash
curl -X POST http://localhost:3000/dossiers/complaint/invalid-id/generate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Denúncia não encontrada",
  "error": "Not Found"
}
```

---

## 🔄 Fluxo Completo de Uso

### Cenário: Investigador gerando e baixando dossiê

```bash
# 1. Login como INVESTIGATOR
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investigator@example.com",
    "password": "senha123"
  }'

# Response: { "access_token": "TOKEN_INVESTIGATOR", ... }

# 2. Gerar dossiê completo (PDF + ZIP)
curl -X POST http://localhost:3000/dossiers/complaint/complaint-123/generate \
  -H "Authorization: Bearer TOKEN_INVESTIGATOR" \
  -H "Content-Type: application/json" \
  -d '{
    "includeSummary": true,
    "includeTimeline": true,
    "includeAttachments": true,
    "includeAuditLog": false,
    "format": "both"
  }'

# Response: { "id": "dossier-new123", ... }

# 3. Obter URL de download do ZIP
curl -X GET "http://localhost:3000/dossiers/dossier-new123/download/zip?expiresIn=3600" \
  -H "Authorization: Bearer TOKEN_INVESTIGATOR"

# Response: { "downloadUrl": "https://s3.../dossier.zip", ... }

# 4. Baixar o arquivo
curl -o dossiê-completo.zip "https://s3.amazonaws.com/canal-denuncia-attachments/dossiers/..."

# 5. Descompactar e visualizar
unzip dossiê-completo.zip
cat README.txt
open dossier-DEN-2024-001.pdf
```

---

## 📊 Postman Collection

### Importar para Postman

Crie uma collection com as seguintes variáveis:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "YOUR_TOKEN_HERE",
  "complaint_id": "complaint-123",
  "dossier_id": "dossier-abc123"
}
```

Use `{{base_url}}`, `{{access_token}}`, etc. nos requests.

---

## 🧪 Testes com Jest/Supertest

```typescript
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Dossiers E2E', () => {
  let app: INestApplication;
  let adminToken: string;

  it('POST /dossiers/complaint/:id/generate - should generate dossier', async () => {
    const response = await request(app.getHttpServer())
      .post('/dossiers/complaint/complaint-123/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        includeSummary: true,
        includeTimeline: true,
        includeAttachments: true,
        format: 'both',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('s3PdfKey');
    expect(response.body).toHaveProperty('s3ZipKey');
  });

  it('GET /dossiers/:id/download/pdf - should return download URL', async () => {
    const response = await request(app.getHttpServer())
      .get('/dossiers/dossier-abc123/download/pdf')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ expiresIn: 3600 })
      .expect(200);

    expect(response.body).toHaveProperty('downloadUrl');
    expect(response.body).toHaveProperty('expiresAt');
    expect(response.body.filename).toContain('.pdf');
  });
});
```

---

## 📝 Notas Importantes

### 1. URLs Pré-assinadas

As URLs de download geradas pelo S3 são temporárias e expiram após o tempo especificado. Por padrão, expiram em 1 hora (3600 segundos).

### 2. Tamanho de Arquivos

- PDFs: Geralmente entre 100KB - 2MB
- ZIPs: Dependem dos anexos (podem ser 10MB+)

### 3. Performance

- Geração de PDF: ~1-3 segundos
- Geração de ZIP: ~2-5 segundos (depende do número de anexos)
- Download de anexos do S3: Paralelo quando possível

### 4. Limitações

- Máximo de anexos por denúncia: Limitado pela configuração do S3Service
- Tamanho máximo de arquivo individual: 25MB (configurável)

---

## 🔗 Links Úteis

- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`
- **Documentação**: `docs/MODULO-DOSSIERS.md`

---

**🚀 Desenvolvido para o Canal de Denúncias Corporativo**
