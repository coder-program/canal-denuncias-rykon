# 💻 Guia Técnico - Módulo de Denúncias

## Para Desenvolvedores

Este documento explica a arquitetura e implementação do módulo de denúncias para facilitar manutenção e extensão.

---

## 📐 Arquitetura

### Clean Architecture
```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│      complaints.controller.ts           │
│  (REST endpoints, DTOs, Decorators)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           BUSINESS LOGIC LAYER          │
│        complaints.service.ts            │
│  (Domain logic, Validations, Rules)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            DATA ACCESS LAYER            │
│           PrismaService                 │
│     (Database operations, ORM)          │
└─────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos

```
apps/backend/src/modules/complaints/
├── complaints.module.ts           # NestJS module definition
├── complaints.controller.ts       # REST endpoints (10)
├── complaints.service.ts          # Business logic (14 methods)
├── complaints.service.spec.ts     # Unit tests (25+ cases)
└── dto/
    ├── create-complaint.dto.ts    # Create validation
    ├── update-complaint.dto.ts    # Update validation
    ├── query-complaints.dto.ts    # Query/filter validation
    └── change-status.dto.ts       # Status change validation
```

---

## 🔧 Service Methods

### ComplaintsService

#### CRUD Operations
| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `create()` | `CreateComplaintDto`, `userId?` | `Complaint` | Cria denúncia com protocolo único |
| `findAll()` | `QueryComplaintsDto`, `userRole`, `userId?` | `PaginatedResult<Complaint>` | Lista com filtros e RBAC |
| `findOne()` | `id`, `userRole`, `userId?` | `Complaint` | Detalhes completos com relacionamentos |
| `findByProtocol()` | `protocol` | `ComplaintPublic` | Busca pública (sanitizada) |
| `update()` | `id`, `UpdateComplaintDto`, `userId`, `userRole` | `Complaint` | Atualiza campos |
| `remove()` | `id`, `userId` | `{ message }` | Soft delete (marca como DISMISSED) |

#### Workflow Operations
| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `assignInvestigator()` | `complaintId`, `investigatorId`, `assignedBy` | `Complaint` | Atribui investigador e muda status |
| `changeStatus()` | `complaintId`, `newStatus`, `reason`, `userId` | `Complaint` | Altera status com auditoria |

#### Analytics
| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `getStats()` | - | `Stats` | Estatísticas agregadas por status/tipo/prioridade |

#### Private Helpers
| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `generateProtocol()` | - | `string` | Gera protocolo único (DEN-YYYY-XXXXXX) |
| `encryptSensitiveData()` | `data` | `encrypted` | Criptografa PII (estrutura pronta) |
| `calculateIntegrityHash()` | `data` | `string` | Hash SHA-256 para integridade |
| `sanitizeComplaint()` | `complaint` | `sanitized` | Remove dados sensíveis |
| `notifyNewComplaint()` | `complaint` | `void` | Notifica admins/investigadores |
| `autoBlockInvolvedUsers()` | `involvedPeople`, `complaintId`, `blockedBy?` | `void` | Bloqueia usuários citados |

---

## 🎯 Fluxos de Negócio

### 1. Criar Denúncia

```typescript
// 1. Controller recebe request
POST /complaints
Body: CreateComplaintDto

// 2. Service processa
complaints.service.create(dto, userId?)
  ↓
  // 2.1. Gera protocolo único
  generateProtocol() → "DEN-2024-ABC123"
  ↓
  // 2.2. Criptografa PII
  encryptSensitiveData({ email, phone, involvedPeople })
  ↓
  // 2.3. Calcula hash de integridade
  calculateIntegrityHash({ title, description, type })
  ↓
  // 2.4. Cria no banco
  prisma.complaint.create(...)
  ↓
  // 2.5. Cria histórico inicial
  prisma.complaintStatusHistory.create({
    previousStatus: null,
    newStatus: 'PENDING'
  })
  ↓
  // 2.6. Log de auditoria
  prisma.auditLog.create({
    action: 'CREATE',
    resource: 'complaint'
  })
  ↓
  // 2.7. Notifica admins/investigadores
  notifyNewComplaint(complaint)
  ↓
  // 2.8. Bloqueia usuários citados (se configurado)
  autoBlockInvolvedUsers(involvedPeople, complaintId)
  ↓
  // 2.9. Sanitiza e retorna
  sanitizeComplaint(complaint)

// 3. Controller retorna HTTP 201
```

### 2. Workflow de Status

```typescript
PENDING              // Aguardando triagem
  ↓ assignInvestigator()
IN_PROGRESS          // Em investigação
  ↓ changeStatus('UNDER_REVIEW')
UNDER_REVIEW         // Comitê analisando
  ↓ changeStatus('RESOLVED')
RESOLVED             // Caso resolvido (resolvedAt setado)

// Alternativas:
  → DISMISSED        // Arquivada/Improcedente
  → ESCALATED        // Escalada para instâncias superiores
```

---

## 🔐 Segurança

### RBAC (Role-Based Access Control)

```typescript
// Guard: JwtAuthGuard + RolesGuard
// Decorator: @Roles(...)

// Exemplo:
@Patch(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
async update(@Param('id') id: string, ...) {
  // Apenas ADMIN e INVESTIGATOR chegam aqui
}
```

### Controle de Acesso Específico

```typescript
// REPORTER só vê próprias denúncias
if (userRole === UserRole.REPORTER) {
  where.createdBy = userId;
}

// REPORTER não pode visualizar denúncia de outros
if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
  throw new ForbiddenException();
}
```

### Auditoria Automática

```typescript
// Toda ação crítica registra em AuditLog
await this.prisma.auditLog.create({
  data: {
    userId,                    // Quem fez
    action: 'CREATE',          // O que fez
    resource: 'complaint',     // Onde fez
    resourceId: complaint.id,  // ID do recurso
    details: { ... },          // Contexto adicional
  },
});
```

---

## 🧪 Testes

### Estrutura de Testes

```typescript
describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  // Mock de PrismaService
  const mockPrismaService = {
    complaint: {
      create: jest.fn(),
      findMany: jest.fn(),
      // ...
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
  });

  it('should create a new complaint', async () => {
    mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);
    
    const result = await service.create(createDto, 'user-123');
    
    expect(result).toBeDefined();
    expect(result.protocol).toMatch(/^DEN-\d{4}-[A-Z0-9]{6}$/);
  });
});
```

### Rodar Testes

```bash
# Todos os testes
npm test

# Apenas ComplaintsService
npm test complaints.service.spec

# Com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📊 DTOs e Validação

### CreateComplaintDto

```typescript
export class CreateComplaintDto {
  @IsBoolean()
  isAnonymous: boolean;

  @IsOptional()
  @IsEmail()
  reporterEmail?: string;

  @IsEnum(ComplaintType)
  type: ComplaintType;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(50)
  description: string;

  // ... outros campos
}
```

### Validação Automática

```typescript
// No main.ts:
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Remove campos não declarados no DTO
    forbidNonWhitelisted: true, // Rejeita se houver campos extras
    transform: true,        // Transforma tipos automaticamente
  }),
);
```

---

## 🔌 Integrações

### Prisma

```typescript
// Todas as operações via PrismaService
constructor(private readonly prisma: PrismaService) {}

// Exemplo: Criar com relacionamentos
const complaint = await this.prisma.complaint.create({
  data: {
    protocol,
    title,
    description,
    creator: {
      connect: { id: userId }, // Relacionamento
    },
  },
  include: {
    creator: true,    // Incluir na resposta
    investigator: true,
  },
});
```

### Logger

```typescript
constructor(private readonly loggerService: LoggerService) {}

// Uso
this.loggerService.log(
  `Nova denúncia criada: ${protocol}`,
  'ComplaintsService',
  { complaintId: complaint.id, isAnonymous: complaint.isAnonymous },
);

this.loggerService.warn(
  `Usuário bloqueado automaticamente: ${user.email}`,
  'ComplaintsService',
  { userId: user.id, complaintId },
);
```

---

## 🚀 Extensões Futuras

### 1. Adicionar Novo Status

```typescript
// 1. Atualizar enum no schema.prisma
enum ComplaintStatus {
  PENDING
  IN_PROGRESS
  UNDER_REVIEW
  RESOLVED
  DISMISSED
  ESCALATED
  ARCHIVED      // ← Novo status
}

// 2. Gerar migration
npm run prisma:migrate

// 3. Atualizar documentação
// Nenhuma alteração de código necessária!
```

### 2. Adicionar Novo Tipo de Denúncia

```typescript
// 1. Atualizar enum no schema.prisma
enum ComplaintType {
  HARASSMENT
  DISCRIMINATION
  FRAUD
  CORRUPTION
  SAFETY_VIOLATION
  ENVIRONMENTAL
  DATA_BREACH    // ← Novo tipo
  OTHER
}

// 2. Gerar migration
npm run prisma:migrate

// 3. Atualizar documentação
```

### 3. Adicionar Campo Customizado

```typescript
// 1. Atualizar model no schema.prisma
model Complaint {
  // ... campos existentes
  customField   String?  // ← Novo campo
}

// 2. Gerar migration
npm run prisma:migrate

// 3. Atualizar CreateComplaintDto
@IsOptional()
@IsString()
customField?: string;

// 4. Atualizar testes
```

---

## 🐛 Debugging

### Habilitar Logs do Prisma

```typescript
// apps/backend/src/shared/prisma/prisma.service.ts

this.$on('query', (e) => {
  this.logger.debug(`Query: ${e.query}`);
  this.logger.debug(`Duration: ${e.duration}ms`);
});
```

### Ver Queries SQL

```bash
# .env
DATABASE_URL="postgresql://...?connection_limit=10&log_level=query"
```

### Verificar Estado do Banco

```bash
# Entrar no Adminer
open http://localhost:8080

# Ou via CLI
docker exec -it postgres psql -U postgres -d canal_denuncia_dev

# Ver denúncias
SELECT id, protocol, status, type FROM complaints;

# Ver logs de auditoria
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 📚 Referências Importantes

### Código-Fonte
- Service: `apps/backend/src/modules/complaints/complaints.service.ts`
- Controller: `apps/backend/src/modules/complaints/complaints.controller.ts`
- Schema: `apps/backend/prisma/schema.prisma`

### Documentação
- [API Examples](../docs/COMPLAINTS-API-EXAMPLES.md)
- [Phase 2 Summary](../docs/PHASE-2-SUMMARY.md)
- [Quick Start Tests](../QUICK-START-TESTS.md)

### Ferramentas
- Swagger: http://localhost:3000/api/v1/docs
- Adminer: http://localhost:8080
- Kibana: http://localhost:5601

---

## 💡 Boas Práticas

### 1. Sempre use DTOs
```typescript
// ✅ Correto
async create(@Body() createDto: CreateComplaintDto) {
  return this.service.create(createDto);
}

// ❌ Errado
async create(@Body() data: any) {
  return this.service.create(data);
}
```

### 2. Validação no DTO, lógica no Service
```typescript
// ✅ Correto
// DTO valida formato
@MinLength(50)
description: string;

// Service valida regra de negócio
if (complaint.status === 'RESOLVED' && !complaint.resolvedAt) {
  throw new BadRequestException('Resolved complaints must have resolvedAt');
}
```

### 3. Use transações para operações atômicas
```typescript
// ✅ Correto
await this.prisma.$transaction(async (tx) => {
  await tx.complaint.update({ ... });
  await tx.complaintStatusHistory.create({ ... });
  await tx.auditLog.create({ ... });
});
```

### 4. Sempre faça log de ações críticas
```typescript
// ✅ Correto
this.loggerService.log(`Denúncia ${protocol} criada`, 'ComplaintsService');
```

### 5. Use includes para otimizar queries
```typescript
// ✅ Correto - Uma query com include
const complaint = await this.prisma.complaint.findUnique({
  where: { id },
  include: {
    creator: true,
    investigator: true,
    attachments: true,
  },
});

// ❌ Errado - Múltiplas queries
const complaint = await this.prisma.complaint.findUnique({ where: { id } });
const creator = await this.prisma.user.findUnique({ where: { id: complaint.createdBy } });
const investigator = await this.prisma.user.findUnique({ where: { id: complaint.investigatorId } });
```

---

## 📄 Módulo de Dossiês (Relatórios PDF)

### DossiersService

#### Métodos Principais
| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `generateDossier()` | `complaintId`, `userId`, `format: 'PDF'\|'ZIP'` | `Dossier` | Gera relatório estruturado com 5 seções |
| `getDownloadUrlPDF()` | `id`, `userId` | `{ url, expiresIn }` | Gera URL temporária de download |
| `findAll()` | `userId`, `userRole`, `filters` | `PaginatedResult<Dossier>` | Lista dossiês com RBAC |
| `findOne()` | `id`, `userId` | `Dossier` | Detalhes com relacionamentos |
| `remove()` | `id`, `userId` | `{ message }` | Soft delete (marca como deletedAt) |

#### Estrutura do PDF Gerado

```typescript
// 5 Seções Principais:
1. RESUMO EXECUTIVO
   - Protocolo, status, categoria, prioridade
   - Data de criação e atualização
   - Descrição completa
   - Informações do denunciante

2. LINHA DO TEMPO
   - Cronologia de eventos
   - Formato: DD/MM/YYYY HH:mm
   - Ícones por tipo de evento

3. HISTÓRICO DE STATUS
   - Todas as mudanças de status
   - Responsável por cada mudança
   - Data e observações
   - Duração em cada status

4. ANEXOS
   - Lista completa de arquivos
   - Nome, tipo, tamanho
   - Data de upload e responsável
   - Status de verificação

5. REGISTRO DE AUDITORIA
   - Log completo de ações
   - Usuário, ação, timestamp
   - Detalhes das alterações
```

#### Recursos de Segurança

```typescript
// 1. RBAC para geração
const canGenerate = [UserRole.ADMIN, UserRole.AUDITOR, UserRole.INVESTIGATOR];
if (!canGenerate.includes(userRole)) {
  throw new ForbiddenException();
}

// 2. Marca d'água em todas as páginas
doc.fontSize(60).fillColor('#FF0000', 0.1)
   .text('CONFIDENCIAL', 0, 300, { align: 'center' });

// 3. Auditoria de download
await this.prisma.auditLog.create({
  data: {
    userId,
    action: 'DOWNLOAD',
    resource: 'dossier',
    resourceId: id,
  },
});

// 4. URLs temporárias (expiram em 1 hora)
const downloadUrl = await this.s3Service.getPresignedDownloadUrl(key, 3600);
```

#### Uso no Frontend

```typescript
// Botão de download na página de detalhes
const downloadReport = async () => {
  setGeneratingReport(true);
  
  try {
    // 1. Gerar dossiê
    const { data } = await apiClient.post(
      `/dossiers/complaint/${id}/generate`,
      { format: 'PDF' }
    );
    
    // 2. Obter URL de download
    const downloadResponse = await apiClient.get(
      `/dossiers/${data.id}/download/pdf`
    );
    
    // 3. Download do arquivo
    const response = await fetch(downloadResponse.data.url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // 4. Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `denuncia-${protocol}.pdf`;
    link.click();
    
    // 5. Cleanup
    window.URL.revokeObjectURL(url);
    
    toast.success('Relatório baixado com sucesso!');
  } catch (error) {
    toast.error('Erro ao baixar relatório');
  } finally {
    setGeneratingReport(false);
  }
};
```

#### Arquivos do Módulo

```
apps/backend/src/modules/dossiers/
├── dossiers.module.ts                # Module definition
├── dossiers.controller.ts            # 6 endpoints REST (~290 linhas)
├── dossiers.service.ts               # Geração de PDF (~800 linhas)
└── dto/
    └── generate-dossier.dto.ts       # Validation
```

#### Documentação Completa

Para detalhes completos sobre:
- Arquitetura e fluxo de dados (16 etapas)
- Estrutura detalhada do PDF
- 6 endpoints com exemplos cURL/TypeScript
- Matriz de permissões RBAC
- Guia de troubleshooting
- Métricas de performance
- Roadmap de funcionalidades

Consulte: **[FUNCIONALIDADE-DOSSIERS.md](./FUNCIONALIDADE-DOSSIERS.md)**

---

**Happy Coding!** 💻🚀
