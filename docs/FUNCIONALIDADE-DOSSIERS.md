# 📄 Módulo de Dossiês - Download de Relatórios em PDF

> **Versão:** 1.0.0  
> **Data:** 21 de Fevereiro de 2026  
> **Status:** ✅ Implementado e Funcional

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura Técnica](#arquitetura-técnica)
- [Estrutura do PDF](#estrutura-do-pdf)
- [API Endpoints](#api-endpoints)
- [Como Usar](#como-usar)
- [Configuração](#configuração)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Módulo de Dossiês** permite a geração e download de relatórios completos em formato PDF de denúncias, consolidando todas as informações relevantes em um documento estruturado e profissional.

### Características Principais

- ✅ **Geração de PDF** com PDFKit
- ✅ **Relatórios Estruturados** com múltiplas seções
- ✅ **Download Seguro** via URL pré-assinada
- ✅ **Controle de Acesso** baseado em roles (RBAC)
- ✅ **Auditoria Completa** de downloads
- ✅ **Armazenamento Local** (desenvolvimento) com suporte futuro para S3

---

## ✨ Funcionalidades

### 1. Geração de Relatórios PDF

**Conteúdo incluído no PDF:**

#### 📊 Página de Cabeçalho

- Logo corporativo
- Título do dossiê
- Protocolo da denúncia
- Data e hora de geração
- Usuário que gerou o relatório

#### 📝 Seção 1: Resumo da Denúncia

- **Informações Básicas:**
  - Protocolo
  - Título
  - Tipo de denúncia
  - Prioridade
  - Status atual
  - Data de criação
  - Última atualização

- **Descrição Completa:**
  - Texto detalhado da denúncia
  - Formatação preservada

#### 📅 Seção 2: Timeline de Investigação

- **6 Estágios Rastreados:**
  1. Recebida
  2. Em Análise
  3. Investigação
  4. Validação
  5. Concluída
  6. Arquivada

- **Informações de Cada Estágio:**
  - Data de transição
  - Duração em cada estágio
  - Progresso visual

#### 🗂️ Seção 3: Histórico de Status

- Lista cronológica de mudanças
- Data e hora de cada mudança
- Status anterior → Status novo
- Usuário responsável pela mudança (quando aplicável)
- Observações adicionais

#### 📎 Seção 4: Anexos

- Lista de todos os anexos da denúncia
- Nome do arquivo
- Tipo (extensão)
- Tamanho formatado (KB/MB)
- Data de upload
- Usuário que fez o upload
- Indicação de anexos deletados

#### 📋 Seção 5: Log de Auditoria (Opcional)

- **Disponível apenas para:** ADMIN e AUDITOR
- Lista completa de ações realizadas
- Timestamp de cada ação
- Usuário executor
- Tipo de ação
- Detalhes técnicos

#### 🔖 Rodapé em Todas as Páginas

- Número da página (X de Y)
- Data de geração
- Marca d'água "CONFIDENCIAL"

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

```
Backend:
├── NestJS 10.x
├── PDFKit 0.17.2          # Geração de PDF
├── Archiver 7.0.1         # Compressão ZIP (futuro)
├── Prisma ORM 5.x         # Persistência
└── AWS S3 SDK v3          # Storage (preparado)

Frontend:
├── Next.js 14
├── React 18
├── Fetch API              # Download de arquivos
└── Blob API               # Manipulação de binários
```

### Fluxo de Geração do PDF

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│  1. Usuário clica em "Baixar Relatório"                    │
│  2. POST /dossiers/complaint/:id/generate                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND - DOSSIERS CONTROLLER           │
│  3. Valida permissões (ADMIN, AUDITOR, INVESTIGATOR)       │
│  4. Chama DossiersService.generateDossier()                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   DOSSIERS SERVICE                          │
│  5. Busca dados completos da denúncia                      │
│     ├── Denúncia base                                       │
│     ├── Histórico de status                                 │
│     ├── Anexos                                              │
│     ├── Comentários                                         │
│     └── Logs de auditoria (se aplicável)                   │
│                                                             │
│  6. Gera PDF com PDFKit                                     │
│     ├── Renderiza cabeçalho                                │
│     ├── Adiciona seções (resumo, timeline, etc.)           │
│     ├── Formata tabelas e listas                           │
│     └── Adiciona rodapé em todas as páginas                │
│                                                             │
│  7. Salva arquivo localmente ou no S3                      │
│     └── uploads/dossiers/[timestamp]-[hash].pdf            │
│                                                             │
│  8. Cria registro no banco (Dossier)                       │
│     ├── ID do dossiê                                        │
│     ├── Caminho do arquivo (s3PdfKey)                      │
│     ├── Denúncia vinculada                                  │
│     ├── Usuário gerador                                     │
│     └── Data de geração                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│  9. Recebe ID do dossiê                                     │
│  10. GET /dossiers/:id/download/pdf                        │
│  11. Recebe URL de download                                 │
│  12. Fetch da URL com token JWT                            │
│  13. Converte resposta para Blob                           │
│  14. Cria URL temporária (createObjectURL)                 │
│  15. Dispara download no navegador                         │
│  16. Revoga URL temporária                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Estrutura do PDF Gerado

### Cabeçalho (Todas as páginas)

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO]                                    DOSSIÊ - DEN-XXX │
│                                                             │
│  Gerado em: 21/02/2026 às 10:30                            │
│  Gerado por: admin@empresa.com                             │
└─────────────────────────────────────────────────────────────┘
```

### Página 1: Resumo

```
═══════════════════════════════════════════════════════════════
                      RESUMO DA DENÚNCIA
═══════════════════════════════════════════════════════════════

PROTOCOLO:          DEN-2026-ABC123
TÍTULO:             Fraude em processos de compra
TIPO:               Fraude
PRIORIDADE:         Alta
STATUS ATUAL:       Em Progresso
DATA CRIAÇÃO:       15/02/2026 14:30
ÚLTIMA ATUALIZAÇÃO: 20/02/2026 16:45

─────────────────────────────────────────────────────────────
DESCRIÇÃO DETALHADA
─────────────────────────────────────────────────────────────

[Texto completo da denúncia...]
```

### Página 2: Timeline

```
═══════════════════════════════════════════════════════════════
                  TIMELINE DE INVESTIGAÇÃO
═══════════════════════════════════════════════════────════════

1. RECEBIDA
   └─ 15/02/2026 14:30
   └─ Duração: 2 horas

2. EM ANÁLISE
   └─ 15/02/2026 16:30
   └─ Duração: 1 dia

3. INVESTIGAÇÃO (Atual)
   └─ 16/02/2026 10:00
   └─ Duração: 4 dias (em andamento)

[Progresso: ████████░░░░░░  50%]
```

### Página 3: Histórico de Status

```
═══════════════════════════════════════════════════════════════
                    HISTÓRICO DE STATUS
═══════════════════════════════════════════════════════════════

┌───────────────┬──────────┬────────────┬──────────────────┐
│ Data/Hora     │ De       │ Para       │ Alterado Por     │
├───────────────┼──────────┼────────────┼──────────────────┤
│ 15/02 14:30   │ -        │ PENDING    │ Sistema          │
│ 15/02 16:30   │ PENDING  │ ANALYZING  │ admin@teste.com  │
│ 16/02 10:00   │ ANALYZING│ IN_PROGRESS│ inv@teste.com    │
└───────────────┴──────────┴────────────┴──────────────────┘
```

### Página 4: Anexos

```
═══════════════════════════════════════════════════════════════
                         ANEXOS
═══════════════════════════════════════════════════════════════

Total de anexos: 3

1. documento-evidencia.pdf
   ├─ Tipo: PDF
   ├─ Tamanho: 2.5 MB
   ├─ Upload: 15/02/2026 14:45
   └─ Por: admin@empresa.com

2. foto-comprovante.jpg
   ├─ Tipo: JPEG
   ├─ Tamanho: 850 KB
   ├─ Upload: 15/02/2026 14:50
   └─ Por: admin@empresa.com

3. planilha-dados.xlsx (DELETADO)
   ├─ Tipo: XLSX
   ├─ Deletado em: 18/02/2026 11:20
   └─ Por: investigator@empresa.com
```

### Página 5: Log de Auditoria (Somente ADMIN/AUDITOR)

```
═══════════════════════════════════════════════════════════════
                    LOG DE AUDITORIA
═══════════════════════════════════════════════════════════════

[15/02/2026 14:30:15] CREATE - complaint
└─ Usuário: sistema
└─ Detalhes: Denúncia criada via formulário público

[15/02/2026 16:30:42] STATUS_CHANGE - complaint
└─ Usuário: admin@empresa.com
└─ Detalhes: PENDING → ANALYZING

[15/02/2026 14:45:23] UPLOAD - attachment
└─ Usuário: admin@empresa.com
└─ Detalhes: documento-evidencia.pdf (2.5 MB)
```

### Rodapé (Todas as páginas)

```
─────────────────────────────────────────────────────────────
CONFIDENCIAL | Gerado em 21/02/2026           Página 1 de 5
```

---

## 🔌 API Endpoints

### 1. Gerar Dossiê

```http
POST /api/v1/dossiers/complaint/:complaintId/generate
```

**Autenticação:** Bearer Token (JWT)

**Permissões:** `ADMIN`, `AUDITOR`, `INVESTIGATOR`

**Request Body:**

```json
{
  "includeSummary": true,
  "includeTimeline": true,
  "includeAttachments": true,
  "includeAuditLog": true,
  "format": "pdf"
}
```

**Response (201 Created):**

```json
{
  "id": "clxyz123456789",
  "complaintId": "cmlqpruyz000178sifupjj9ok",
  "title": "Dossiê - DEN-2026-ABC123",
  "summary": "Dossiê gerado para denúncia DEN-2026-ABC123...",
  "s3PdfKey": "dossiers/1771618999693-8b04fb4f6a605e6e.pdf",
  "s3ZipKey": null,
  "generatedAt": "2026-02-21T10:30:00.000Z",
  "complaint": {
    "id": "cmlqpruyz000178sifupjj9ok",
    "protocol": "DEN-2026-ABC123",
    "title": "Fraude em processos de compra",
    "status": "IN_PROGRESS"
  },
  "generator": {
    "id": "ab056f18-af69-4d58-bf86-430149ed9f47",
    "email": "admin@empresa.com",
    "fullName": "Administrador do Sistema",
    "role": "ADMIN"
  }
}
```

**Erros Possíveis:**

- `400 Bad Request`: Dados inválidos
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Denúncia não encontrada

---

### 2. Obter URL de Download (PDF)

```http
GET /api/v1/dossiers/:id/download/pdf?expiresIn=3600
```

**Autenticação:** Bearer Token (JWT)

**Permissões:** `ADMIN`, `AUDITOR`, `INVESTIGATOR`, `REPORTER`

**Query Parameters:**

- `expiresIn` (opcional): Tempo de expiração da URL em segundos (padrão: 3600 = 1 hora)

**Response (200 OK):**

```json
{
  "downloadUrl": "/api/v1/attachments/local/dossiers/1771618999693-8b04fb4f6a605e6e.pdf",
  "expiresAt": "2026-02-21T11:30:00.000Z",
  "filename": "dossier-DEN-2026-ABC123.pdf"
}
```

**Erros Possíveis:**

- `400 Bad Request`: PDF não disponível
- `403 Forbidden`: Sem permissão para acessar
- `404 Not Found`: Dossiê não encontrado

---

### 3. Servir Arquivo Local (Desenvolvimento)

```http
GET /api/v1/attachments/local/:key
```

**Autenticação:** Opcional (público se configurado)

**Exemplo:**

```
GET /api/v1/attachments/local/dossiers/1771618999693-8b04fb4f6a605e6e.pdf
```

**Response:**

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="1771618999693-8b04fb4f6a605e6e.pdf"`
- **Body:** Binary stream do arquivo PDF

---

### 4. Listar Dossiês de uma Denúncia

```http
GET /api/v1/dossiers/complaint/:complaintId
```

**Autenticação:** Bearer Token (JWT)

**Permissões:** `ADMIN`, `AUDITOR`, `INVESTIGATOR`, `REPORTER`

**Response (200 OK):**

```json
[
  {
    "id": "clxyz123456789",
    "complaintId": "cmlqpruyz000178sifupjj9ok",
    "title": "Dossiê - DEN-2026-ABC123",
    "generatedAt": "2026-02-21T10:30:00.000Z",
    "generator": {
      "email": "admin@empresa.com",
      "fullName": "Administrador"
    }
  },
  {
    "id": "clxyz987654321",
    "complaintId": "cmlqpruyz000178sifupjj9ok",
    "title": "Dossiê - DEN-2026-ABC123",
    "generatedAt": "2026-02-15T14:20:00.000Z",
    "generator": {
      "email": "auditor@empresa.com",
      "fullName": "Auditor Interno"
    }
  }
]
```

---

### 5. Obter Detalhes de um Dossiê

```http
GET /api/v1/dossiers/:id
```

**Autenticação:** Bearer Token (JWT)

**Permissões:** `ADMIN`, `AUDITOR`, `INVESTIGATOR`, `REPORTER`

**Response (200 OK):**

```json
{
  "id": "clxyz123456789",
  "complaintId": "cmlqpruyz000178sifupjj9ok",
  "title": "Dossiê - DEN-2026-ABC123",
  "summary": "Dossiê gerado para denúncia DEN-2026-ABC123. Tipo: Fraude...",
  "s3PdfKey": "dossiers/1771618999693-8b04fb4f6a605e6e.pdf",
  "s3ZipKey": null,
  "generatedAt": "2026-02-21T10:30:00.000Z",
  "complaint": {
    "id": "cmlqpruyz000178sifupjj9ok",
    "protocol": "DEN-2026-ABC123",
    "title": "Fraude em processos de compra",
    "status": "IN_PROGRESS"
  },
  "generator": {
    "id": "ab056f18-af69-4d58-bf86-430149ed9f47",
    "email": "admin@empresa.com",
    "fullName": "Administrador do Sistema",
    "role": "ADMIN"
  }
}
```

---

### 6. Deletar Dossiê

```http
DELETE /api/v1/dossiers/:id
```

**Autenticação:** Bearer Token (JWT)

**Permissões:** `ADMIN` (apenas)

**Response (204 No Content):**

- Sem corpo na resposta

**Erros Possíveis:**

- `403 Forbidden`: Apenas ADMIN pode deletar
- `404 Not Found`: Dossiê não encontrado

---

## 💻 Como Usar

### No Frontend (Interface do Usuário)

#### 1. Acessar Página de Detalhes da Denúncia

```
http://localhost:3001/denuncias/[id]
```

#### 2. Localizar o Botão de Download

No cabeçalho da página de detalhes, você encontrará o botão:

```
┌──────────────────────────────────────────────────────────┐
│  ← Voltar    [Editar]   [Atribuir]   [📄 Baixar Relatório] │
└──────────────────────────────────────────────────────────┘
```

#### 3. Clicar no Botão

- ⏳ Mensagem de carregamento: "Gerando relatório..."
- ✅ Sucesso: "Relatório baixado com sucesso!"
- ❌ Erro: Mensagem de erro específica

#### 4. Download Automático

O navegador iniciará automaticamente o download do arquivo:

```
dossier-DEN-2026-ABC123.pdf
```

---

### Via API (Desenvolvimento/Programático)

#### Exemplo usando cURL

```bash
# 1. Fazer login e obter token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"admin123"}' \
  | jq -r '.accessToken')

# 2. Gerar dossiê
DOSSIER_ID=$(curl -X POST \
  http://localhost:3000/api/v1/dossiers/complaint/cmlqpruyz000178sifupjj9ok/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "includeSummary": true,
    "includeTimeline": true,
    "includeAttachments": true,
    "includeAuditLog": true,
    "format": "pdf"
  }' | jq -r '.id')

# 3. Obter URL de download
DOWNLOAD_URL=$(curl -X GET \
  "http://localhost:3000/api/v1/dossiers/$DOSSIER_ID/download/pdf" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.downloadUrl')

# 4. Baixar arquivo
curl -X GET \
  "http://localhost:3000$DOWNLOAD_URL" \
  -H "Authorization: Bearer $TOKEN" \
  --output relatorio.pdf

echo "✅ PDF baixado como relatorio.pdf"
```

#### Exemplo usando JavaScript/TypeScript

```typescript
import axios from 'axios';
import fs from 'fs';

async function downloadDossier(complaintId: string, token: string) {
  try {
    // 1. Gerar dossiê
    const generateResponse = await axios.post(
      `http://localhost:3000/api/v1/dossiers/complaint/${complaintId}/generate`,
      {
        includeSummary: true,
        includeTimeline: true,
        includeAttachments: true,
        includeAuditLog: true,
        format: 'pdf',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const dossierId = generateResponse.data.id;
    console.log(`✅ Dossiê gerado: ${dossierId}`);

    // 2. Obter URL de download
    const downloadResponse = await axios.get(
      `http://localhost:3000/api/v1/dossiers/${dossierId}/download/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const { downloadUrl, filename } = downloadResponse.data;
    console.log(`📥 Baixando: ${filename}`);

    // 3. Baixar arquivo
    const fileResponse = await axios.get(`http://localhost:3000${downloadUrl}`, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${token}` },
    });

    // 4. Salvar arquivo
    fs.writeFileSync(filename, fileResponse.data);
    console.log(`✅ Arquivo salvo: ${filename}`);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Uso
const token = 'seu_jwt_token_aqui';
const complaintId = 'cmlqpruyz000178sifupjj9ok';
downloadDossier(complaintId, token);
```

---

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

Adicione ao arquivo `.env` do backend:

```env
# Armazenamento de Arquivos
USE_LOCAL_STORAGE=true                    # true = local, false = S3
LOCAL_STORAGE_PATH=./uploads              # Caminho para arquivos locais

# AWS S3 (Futuro)
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=canal-denuncia-files
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# PDF Generation
PDF_LOGO_PATH=./uploads/settings/logo.png # Logo corporativo para PDF
```

### Permissões de Diretório

```powershell
# Criar diretório de uploads se não existir
New-Item -Path "apps/backend/uploads/dossiers" -ItemType Directory -Force

# Verificar permissões (Windows)
icacls "apps\backend\uploads\dossiers"
```

### Limite de Tamanho de Upload

No arquivo `apps/backend/src/main.ts`:

```typescript
app.use(express.json({ limit: '50mb' })); // Ajuste conforme necessário
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

---

## 🔐 Segurança

### Controle de Acesso

| Operação                 | ADMIN | AUDITOR | INVESTIGATOR | REPORTER | VIEWER |
| ------------------------ | ----- | ------- | ------------ | -------- | ------ |
| Gerar dossiê             | ✅    | ✅      | ✅           | ❌       | ❌     |
| Download PDF             | ✅    | ✅      | ✅           | ✅\*     | ❌     |
| Listar dossiês           | ✅    | ✅      | ✅           | ✅\*     | ❌     |
| Deletar dossiê           | ✅    | ❌      | ❌           | ❌       | ❌     |
| Visualizar log auditoria | ✅    | ✅      | ❌           | ❌       | ❌     |

\* REPORTER: Apenas denúncias criadas por ele ou atribuídas a ele

### Auditoria

Todas as operações de dossiê são registradas:

```typescript
// Exemplo de registro de auditoria
{
  action: 'DOWNLOAD',
  resource: 'dossier',
  resourceId: 'clxyz123456789',
  userId: 'ab056f18-af69-4d58-bf86-430149ed9f47',
  details: {
    format: 'pdf',
    expiresIn: 3600
  },
  timestamp: '2026-02-21T10:30:00.000Z'
}
```

### Proteção de Dados

1. **URLs Temporárias**: Downloads expiram após tempo configurado (padrão 1 hora)
2. **Autenticação JWT**: Token obrigatório em todas as requisições
3. **Validação de Acesso**: Verificação de permissão antes de gerar/baixar
4. **Marca d'água**: "CONFIDENCIAL" em todas as páginas do PDF
5. **Criptografia**: Transmissão via HTTPS (produção)

---

## 🐛 Troubleshooting

### Problema: Erro 500 ao gerar dossiê

**Sintomas:**

```json
{
  "statusCode": 500,
  "message": "Internal Server Error"
}
```

**Possíveis Causas e Soluções:**

1. **Denúncia não encontrada**

   ```
   Solução: Verificar se o ID da denúncia está correto
   ```

2. **Permissão negada**

   ```
   Solução: Verificar role do usuário (deve ser ADMIN, AUDITOR ou INVESTIGATOR)
   ```

3. **Erro ao criar diretório**

   ```
   Solução:
   cd apps/backend
   mkdir -p uploads/dossiers
   ```

4. **PDFKit não instalado**
   ```
   Solução:
   cd apps/backend
   npm install pdfkit @types/pdfkit archiver @types/archiver
   ```

---

### Problema: PDF corrompido ou não abre

**Sintomas:**

- Arquivo baixado mas não abre
- Erro "PDF corrompido" ao abrir

**Soluções:**

1. **Verificar Content-Type**

   ```typescript
   // Em attachments.controller.ts
   res.set({
     'Content-Type': 'application/pdf',
     'Content-Disposition': `attachment; filename="..."`,
   });
   ```

2. **Verificar se arquivo existe localmente**

   ```powershell
   ls apps/backend/uploads/dossiers/
   ```

3. **Testar download direto**
   ```
   http://localhost:3000/api/v1/attachments/local/dossiers/[filename].pdf
   ```

---

### Problema: Download não inicia

**Sintomas:**

- Botão clicado mas nada acontece
- Loading infinito

**Soluções:**

1. **Console do navegador**

   ```
   F12 → Console → Verificar erros
   ```

2. **Network tab**

   ```
   F12 → Network → Ver requisições falhando
   ```

3. **Verificar token JWT**

   ```typescript
   // localStorage deve conter token válido
   localStorage.getItem('token');
   ```

4. **CORS habilitado**
   ```typescript
   // apps/backend/src/main.ts
   app.enableCors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3001',
     credentials: true,
   });
   ```

---

### Problema: "userId is undefined"

**Sintomas:**

```
[generateDossier] userId: undefined
```

**Causa:**

- Interface JwtPayload estava usando `sub` mas JwtStrategy retorna `id`

**Solução (já aplicada):**

```typescript
// dossiers.controller.ts
interface JwtPayload {
  id: string; // ✅ Correto (era 'sub' antes)
  email: string;
  role: UserRole;
}

// Uso
return this.dossiersService.generateDossier(
  complaintId,
  user.id, // ✅ Correto
  user.role,
  generateDossierDto,
);
```

---

### Problema: URL relativa não funciona com Axios

**Sintomas:**

```
TypeError: relativeURL.replace is not a function
```

**Causa:**

- Axios não consegue processar URLs relativas retornadas pelo S3Service

**Solução (já aplicada):**

```typescript
// Frontend: usar Fetch API em vez de Axios
const fileResponse = await fetch(fullUrl, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const blob = await fileResponse.blob();
// ... criar download
```

---

## 📊 Estatísticas e Métricas

### Performance

- **Tempo médio de geração**: 1-3 segundos (denúncia com 10 anexos)
- **Tamanho médio do PDF**: 500KB - 2MB
- **Limite de anexos**: Ilimitado (performance degrada após 50+)

### Capacidade

- **Dossiês simultâneos**: 10+ gerações paralelas (depende do servidor)
- **Armazenamento local**: Limitado pelo disco (recomendado 10GB+)
- **Cache**: Não implementado (cada request gera novo PDF)

---

## 🚀 Roadmap Futuro

### Funcionalidades Planejadas

- [ ] **Geração de ZIP** (PDF + todos os anexos)
- [ ] **Templates customizáveis** (empresas podem customizar layout)
- [ ] **Assinatura digital** do dossiê
- [ ] **Versionamento** de dossiês (histórico de gerações)
- [ ] **Cache inteligente** (evitar regenerar PDF idêntico)
- [ ] **Compressão de imagens** no PDF
- [ ] **Sumário clicável** (índice com links internos)
- [ ] **Gráficos e visualizações** no PDF
- [ ] **Notificação automática** quando dossiê for gerado
- [ ] **Agendamento** de geração periódica

### Melhorias Técnicas

- [ ] Migração para **AWS S3** (produção)
- [ ] **Worker queue** para geração assíncrona (Bull/BullMQ)
- [ ] **Progress tracking** (mostrar % de geração)
- [ ] **Retry logic** para falhas temporárias
- [ ] **Health checks** do módulo
- [ ] **Métricas** (Prometheus/Grafana)
- [ ] **Rate limiting** por usuário
- [ ] **Cleanup automático** de arquivos antigos

---

## 📝 Changelog

### v1.0.0 (21/02/2026)

**✨ Funcionalidades Adicionadas:**

- Geração de PDF com PDFKit
- 5 seções completas no relatório
- Download seguro via URL temporária
- Controle de acesso por roles
- Auditoria de downloads
- Rota para servir arquivos locais
- Interface no frontend com botão de download

**🐛 Correções:**

- Corrigido: Interface JwtPayload usando `sub` em vez de `id`
- Corrigido: URL relativa não funcionando com Axios
- Corrigido: Extração incorreta do objeto retornado por getPresignedDownloadUrl
- Corrigido: PDF corrompido por headers incorretos
- Corrigido: Download usando Blob API

**📚 Documentação:**

- Criada documentação completa do módulo
- Exemplos de uso em cURL e TypeScript
- Guia de troubleshooting
- Diagramas de arquitetura

---

## 📞 Suporte

Para problemas ou dúvidas:

1. **Documentação**: Consulte este arquivo primeiro
2. **Logs**: Verifique `apps/backend/logs/` para erros detalhados
3. **Issues**: Abra um issue no repositório do projeto
4. **Email**: contato@empresa.com

---

## 📄 Licença

Este módulo faz parte do Sistema Canal de Denúncias e está licenciado sob MIT License.

---

**Última Atualização:** 21 de Fevereiro de 2026  
**Versão do Documento:** 1.0.0  
**Autor:** Equipe de Desenvolvimento
