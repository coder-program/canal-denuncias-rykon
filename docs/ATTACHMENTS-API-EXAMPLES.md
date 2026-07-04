# 📎 API de Anexos - Exemplos de Uso

Guia completo com exemplos de requisições para o módulo de **Attachments** (Anexos de Evidência).

---

## 📋 Índice

1. [Upload de Anexo](#1-upload-de-anexo)
2. [Listar Anexos de uma Denúncia](#2-listar-anexos-de-uma-denúncia)
3. [Obter Detalhes de um Anexo](#3-obter-detalhes-de-um-anexo)
4. [Gerar URL de Download](#4-gerar-url-de-download)
5. [Verificar Integridade](#5-verificar-integridade)
6. [Obter Estatísticas](#6-obter-estatísticas)
7. [Deletar Anexo](#7-deletar-anexo)

---

## 🔐 Autenticação

Todos os endpoints requerem **JWT Bearer Token**:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1. Upload de Anexo

**Endpoint:** `POST /api/v1/attachments/complaint/:complaintId`

**Permissões:** `ADMIN`, `INVESTIGATOR`, `REPORTER` (apenas próprias denúncias)

**Content-Type:** `multipart/form-data`

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/attachments/complaint/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@./evidence-photo.jpg"
```

### JavaScript (fetch)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'http://localhost:3000/api/v1/attachments/complaint/550e8400-e29b-41d4-a716-446655440000',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  }
);

const data = await response.json();
console.log(data);
```

### Python (requests)
```python
import requests

files = {'file': open('evidence-photo.jpg', 'rb')}
headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'http://localhost:3000/api/v1/attachments/complaint/550e8400-e29b-41d4-a716-446655440000',
    headers=headers,
    files=files
)

print(response.json())
```

### Resposta (201 Created)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "complaintId": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "evidence-photo.jpg",
  "mimeType": "image/jpeg",
  "size": 2456789,
  "s3Key": "complaints/a1b2c3d4-e5f6-7890-abcd-ef1234567890-evidence-photo.jpg",
  "s3Bucket": "canal-denuncia-attachments",
  "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "uploadedBy": "user-id-123",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "complaint": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "protocol": "DEN-2024-001234",
    "title": "Assédio moral no departamento de TI"
  },
  "uploader": {
    "id": "user-id-123",
    "email": "investigator@empresa.com",
    "fullName": "João Silva"
  }
}
```

### Erros Comuns

**400 Bad Request - Arquivo não fornecido**
```json
{
  "statusCode": 400,
  "message": "Nenhum arquivo foi enviado"
}
```

**400 Bad Request - Tipo de arquivo inválido**
```json
{
  "statusCode": 400,
  "message": "Tipo de arquivo não permitido. Tipos aceitos: jpg, jpeg, png, gif, pdf, doc, docx, zip"
}
```

**413 Payload Too Large - Arquivo muito grande**
```json
{
  "statusCode": 413,
  "message": "Arquivo excede o tamanho máximo de 25MB"
}
```

**404 Not Found - Denúncia não existe**
```json
{
  "statusCode": 404,
  "message": "Denúncia não encontrada"
}
```

**403 Forbidden - REPORTER tentando acessar denúncia de outro usuário**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para adicionar anexos a esta denúncia"
}
```

---

## 2. Listar Anexos de uma Denúncia

**Endpoint:** `GET /api/v1/attachments/complaint/:complaintId`

**Permissões:** `ADMIN`, `INVESTIGATOR`, `REPORTER` (apenas próprias), `AUDITOR`

### cURL
```bash
curl -X GET http://localhost:3000/api/v1/attachments/complaint/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### JavaScript (fetch)
```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/attachments/complaint/550e8400-e29b-41d4-a716-446655440000',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const attachments = await response.json();
console.log(attachments);
```

### Resposta (200 OK)
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "complaintId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "evidence-photo.jpg",
    "mimeType": "image/jpeg",
    "size": 2456789,
    "s3Key": "complaints/a1b2c3d4-e5f6-7890-abcd-ef1234567890-evidence-photo.jpg",
    "uploadedBy": "user-id-123",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
    "complaintId": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "contract-document.pdf",
    "mimeType": "application/pdf",
    "size": 1234567,
    "s3Key": "complaints/b2c3d4e5-f6g7-8901-bcde-fg2345678901-contract-document.pdf",
    "uploadedBy": "user-id-456",
    "uploadedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## 3. Obter Detalhes de um Anexo

**Endpoint:** `GET /api/v1/attachments/:id`

**Permissões:** `ADMIN`, `INVESTIGATOR`, `REPORTER` (apenas próprias denúncias), `AUDITOR`

### cURL
```bash
curl -X GET http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Resposta (200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "complaintId": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "evidence-photo.jpg",
  "mimeType": "image/jpeg",
  "size": 2456789,
  "s3Key": "complaints/a1b2c3d4-e5f6-7890-abcd-ef1234567890-evidence-photo.jpg",
  "s3Bucket": "canal-denuncia-attachments",
  "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "uploadedBy": "user-id-123",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "deletedAt": null,
  "deletedBy": null,
  "complaint": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "protocol": "DEN-2024-001234",
    "title": "Assédio moral no departamento de TI",
    "status": "IN_PROGRESS"
  },
  "uploader": {
    "id": "user-id-123",
    "email": "investigator@empresa.com",
    "fullName": "João Silva",
    "role": "INVESTIGATOR"
  }
}
```

---

## 4. Gerar URL de Download

**Endpoint:** `GET /api/v1/attachments/:id/download?expiresIn=3600`

**Permissões:** Todas as roles autenticadas

**Query Parameters:**
- `expiresIn` (opcional): Tempo de expiração em segundos (padrão: 3600 = 1 hora)

### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/download?expiresIn=1800" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### JavaScript (fetch)
```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/download?expiresIn=1800',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { downloadUrl, expiresAt } = await response.json();

// Abrir URL em nova aba ou baixar programaticamente
window.open(downloadUrl, '_blank');
```

### Resposta (200 OK)
```json
{
  "downloadUrl": "https://canal-denuncia-attachments.s3.amazonaws.com/complaints/a1b2c3d4-e5f6-7890-abcd-ef1234567890-evidence-photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "expiresAt": "2024-01-15T11:00:00.000Z"
}
```

**Uso da URL:**
```bash
# Baixar arquivo diretamente (sem autenticação adicional)
curl -O "https://canal-denuncia-attachments.s3.amazonaws.com/complaints/..."
```

**⚠️ Importante:**
- A URL é **temporária** e expira após o tempo especificado
- Não requer autenticação adicional (JWT) - use com cuidado
- Após expiração, uma nova URL deve ser gerada

---

## 5. Verificar Integridade

**Endpoint:** `GET /api/v1/attachments/:id/verify`

**Permissões:** `ADMIN`, `AUDITOR` (verificação forense)

Este endpoint baixa o arquivo do S3, recalcula o SHA-256 e compara com o hash armazenado no banco de dados.

### cURL
```bash
curl -X GET http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/verify \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Resposta (200 OK) - Arquivo íntegro
```json
{
  "isValid": true,
  "message": "Integridade do arquivo verificada com sucesso",
  "storedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "calculatedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### Resposta (200 OK) - Arquivo corrompido
```json
{
  "isValid": false,
  "message": "ATENÇÃO: Integridade do arquivo comprometida!",
  "storedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "calculatedHash": "abc123def456789012345678901234567890123456789012345678901234567890"
}
```

**🔒 Caso de Uso:**
- Auditoria forense
- Verificação de cadeia de custódia de evidências
- Detecção de adulteração de arquivos

---

## 6. Obter Estatísticas

**Endpoint:** `GET /api/v1/attachments/stats`

**Permissões:** `ADMIN`, `AUDITOR`

### cURL
```bash
curl -X GET http://localhost:3000/api/v1/attachments/stats \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Resposta (200 OK)
```json
{
  "totalAttachments": 1543,
  "totalSizeBytes": 3456789012,
  "totalSizeMB": 3296.45,
  "totalSizeGB": 3.22,
  "byMimeType": [
    {
      "mimeType": "application/pdf",
      "count": 678,
      "totalSize": 1234567890
    },
    {
      "mimeType": "image/jpeg",
      "count": 543,
      "totalSize": 987654321
    },
    {
      "mimeType": "image/png",
      "count": 234,
      "totalSize": 543210987
    },
    {
      "mimeType": "application/zip",
      "count": 88,
      "totalSize": 691366814
    }
  ]
}
```

---

## 7. Deletar Anexo

**Endpoint:** `DELETE /api/v1/attachments/:id`

**Permissões:** 
- `ADMIN` (qualquer anexo)
- `INVESTIGATOR` (apenas anexos da denúncia atribuída)
- `REPORTER` (apenas anexos próprios)

**Comportamento:**
- **Soft Delete**: Arquivo é marcado como deletado (`deletedAt`, `deletedBy`)
- Arquivo **não é removido do S3** imediatamente (para auditoria)
- Pode ser implementado job de limpeza posterior

### cURL
```bash
curl -X DELETE http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### JavaScript (fetch)
```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

if (response.status === 204) {
  console.log('Anexo deletado com sucesso');
}
```

### Resposta (204 No Content)
Sem corpo de resposta.

### Erros Comuns

**403 Forbidden - REPORTER tentando deletar anexo de outro usuário**
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para deletar este anexo"
}
```

**404 Not Found - Anexo já deletado**
```json
{
  "statusCode": 404,
  "message": "Anexo não encontrado"
}
```

---

## 📊 Logs de Auditoria

Todas as operações geram logs na tabela `audit_logs`:

```sql
SELECT * FROM audit_logs 
WHERE resource = 'attachment' 
  AND resource_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY timestamp DESC;
```

**Ações auditadas:**
- ✅ `CREATE` - Upload de anexo
- ✅ `READ` - Listagem/detalhes
- ✅ `DOWNLOAD` - Geração de URL de download
- ✅ `DELETE` - Soft delete de anexo

---

## 🔒 Controle de Acesso (RBAC)

| Operação | PUBLIC | REPORTER | INVESTIGATOR | ADMIN | AUDITOR |
|----------|--------|----------|--------------|-------|---------|
| Upload | ❌ | ✅ (próprias) | ✅ | ✅ | ❌ |
| Listar | ❌ | ✅ (próprias) | ✅ | ✅ | ✅ |
| Detalhes | ❌ | ✅ (próprias) | ✅ | ✅ | ✅ |
| Download | ❌ | ✅ (próprias) | ✅ | ✅ | ✅ |
| Verificar | ❌ | ❌ | ❌ | ✅ | ✅ |
| Estatísticas | ❌ | ❌ | ❌ | ✅ | ✅ |
| Deletar | ❌ | ✅ (próprios) | ✅ (atribuídas) | ✅ | ❌ |

---

## 🚀 Postman Collection

Importe esta collection no Postman para testar rapidamente:

```json
{
  "info": {
    "name": "Canal de Denúncias - Attachments",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Attachment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/file.pdf"
            }
          ]
        },
        "url": "{{base_url}}/attachments/complaint/{{complaint_id}}"
      }
    },
    {
      "name": "List Attachments",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": "{{base_url}}/attachments/complaint/{{complaint_id}}"
      }
    },
    {
      "name": "Get Download URL",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/attachments/{{attachment_id}}/download?expiresIn=3600",
          "query": [
            {
              "key": "expiresIn",
              "value": "3600"
            }
          ]
        }
      }
    },
    {
      "name": "Verify Integrity",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": "{{base_url}}/attachments/{{attachment_id}}/verify"
      }
    },
    {
      "name": "Get Statistics",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": "{{base_url}}/attachments/stats"
      }
    },
    {
      "name": "Delete Attachment",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": "{{base_url}}/attachments/{{attachment_id}}"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "jwt_token",
      "value": "YOUR_JWT_TOKEN_HERE"
    },
    {
      "key": "complaint_id",
      "value": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "key": "attachment_id",
      "value": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ]
}
```

---

## 📝 Notas Importantes

1. **Tamanho máximo de arquivo:** 25MB (configurável via `MAX_FILE_SIZE`)
2. **Tipos permitidos:** JPG, PNG, GIF, PDF, DOC, DOCX, ZIP (configurável via `ALLOWED_MIME_TYPES`)
3. **Expiração de URLs:** Presigned URLs expiram após 1 hora por padrão
4. **Soft Delete:** Arquivos deletados permanecem no S3 para auditoria
5. **Integridade:** SHA-256 garante autenticidade das evidências

---

**🎯 Próximos passos:** Implemente antivírus (ClamAV) para scanning de arquivos antes do upload!
