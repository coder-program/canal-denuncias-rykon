# 🤖 AI Agent Instructions - Canal de Denúncias Corporativo

**Monorepo Project**: NestJS Backend + Next.js Frontend | PostgreSQL + MongoDB | AWS S3 Integration  
**Tech Stack**: TypeScript, Prisma ORM, Clean Architecture, RBAC, Event-Driven  
**Key Focus**: Compliance, Auditability, Security

---

## 📐 Architecture Overview

### Monorepo Structure (Turborepo)
```
apps/
├── backend/        # NestJS API (Port 3000)
└── frontend/       # Next.js App (Port 3001)
```

**Build Pipeline**: Turborepo orchestrates `dev`, `build`, `test`, `lint` across all apps simultaneously.

### Backend Modules
- **auth**: JWT + Passport (LocalStrategy) + Role-based access (RBAC)
- **users**: User management, blocking/activation, roles
- **complaints**: Core module with 14 service methods, full lifecycle (PENDING → RESOLVED/DISMISSED/ESCALATED)
- **attachments**: S3 integration (presigned URLs, file validation, soft delete)
- **dossiers**: Evidence collection and report generation
- **notifications**: Email alerts (Nodemailer) + Dashboard updates

**Database**:
- PostgreSQL: Main relational data (users, complaints, audit logs)
- MongoDB: Document storage and evidence archival
- Redis: Session/queue management (via BullMQ)

---

## 🚀 Critical Developer Workflows

### Local Development Setup
```powershell
# Root directory
npm install                    # Install workspace dependencies
npm run dev                   # Start all apps in watch mode (backend + frontend simultaneously)

# Backend only
cd apps/backend
npm run start:dev             # NestJS watch mode

# Frontend only
cd apps/frontend
npm run dev                   # Next.js turbopack dev server
```

### Database Operations
```bash
# Run Prisma migrations
npm run db:migrate           # Create/apply migrations

# Seed test data
npm run db:seed              # Load initial users, roles, templates

# Interactive Prisma Studio (GUI for database inspection)
cd apps/backend && npm run prisma:studio
```

### Testing & Quality
```bash
npm run test                 # All tests across apps
npm run test:cov            # With coverage reports
npm run lint                # ESLint + fix
npm run format              # Prettier format all files
```

### Docker Development
```bash
npm run docker:dev          # Spin up PostgreSQL + MongoDB + LocalStack (S3 mock)
# Services available: postgres:5432, mongodb:27017, localstack:4566
```

### Key Environment Variables
Create `.env.local` in backend root:
```env
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia?schema=public"
JWT_SECRET="dev-jwt-secret-change-in-production-minimum-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
ENCRYPTION_KEY="dev-encryption-key-change-in-production"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

---

## 🔐 Security & Access Control Patterns

### RBAC Implementation
**Roles defined in Prisma schema**:
- `PUBLIC`: Create anonymous complaints only
- `REPORTER`: View own complaints + tracking
- `INVESTIGATOR`: Full complaint management, investigation workflow
- `ADMIN`: System-wide access + user management
- `AUDITOR`: Read-only access

**Pattern in controllers**:
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INVESTIGATOR)
async updateComplaint(@Param('id') id: string, ...) { }
```

**Service-level row-level access control**:
```typescript
// REPORTER only sees own complaints
if (userRole === UserRole.REPORTER) {
  query.where.createdBy = userId;
}

// Throw ForbiddenException for unauthorized access
if (userRole === UserRole.REPORTER && complaint.createdBy !== userId) {
  throw new ForbiddenException('Cannot access others\' complaints');
}
```

### Auditability
**Every critical action logged to `AuditLog` table**:
```typescript
await this.prisma.auditLog.create({
  data: {
    userId,              // Who performed action
    action: 'CREATE',    // CREATE|UPDATE|DELETE|CHANGE_STATUS|ASSIGN
    resource: 'complaint',
    resourceId: complaintId,
    details: { previousStatus, newStatus, reason }, // Context
    timestamp: new Date(),
  },
});
```

**Immutable Audit Trail**:
- All status changes recorded in `ComplaintStatusHistory`
- All user blocks/deactivations logged with reason
- Soft deletes never purge data (DISMISSED status instead)

---

## 💼 Business Logic Patterns

### Complaints Service Methods
**Critical service in `apps/backend/src/modules/complaints/complaints.service.ts`**:

| Method | Purpose | Key Behavior |
|--------|---------|--------------|
| `create()` | New complaint | Generates unique protocol (DEN-YYYY-XXXXXX), encrypts PII, calculates SHA-256 hash |
| `findAll()` | List with filters | RBAC filtering, pagination, status/type/priority filters |
| `changeStatus()` | Workflow progression | Creates history entry, triggers notifications, validates transitions |
| `assignInvestigator()` | Assign owner | Sets investigator, changes status to IN_PROGRESS, notifies |
| `getStats()` | Dashboard KPIs | Aggregates by status/type/priority for admin dashboards |

### Complaint Lifecycle
```
PENDING
  ├─→ (assignInvestigator) IN_PROGRESS
  │    └─→ (changeStatus) UNDER_REVIEW
  │         └─→ (changeStatus) RESOLVED ✅
  │         └─→ (changeStatus) DISMISSED ⚠️
  │         └─→ (changeStatus) ESCALATED 🔺
  └─→ (soft delete) DISMISSED
```

### Data Integrity
- **Protocol Generation**: Nanoid + date prefix ensures uniqueness
- **Sensitive Data**: Email, phone, involved names encrypted (CryptoJS)
- **File Hash Verification**: SHA-256 calculated on upload for S3 attachments
- **Soft Deletes**: No hard deletes—status marked DISMISSED, data retained for audit

---

## 🔌 Integration Points

### AWS S3 / LocalStack
**Development**: LocalStack mock S3 on `localhost:4566`  
**Production**: AWS S3 with presigned URLs (15-min expiry)

**Pattern in attachments module**:
```typescript
// Generate presigned URL for download
const signedUrl = await s3Client.sign(
  new GetObjectCommand({ Bucket, Key }),
  { expiresIn: 900 } // 15 minutes
);

// Validate file before upload (size, mime, extension)
validateFileUpload(file);

// Calculate integrity hash
const fileHash = calculateSHA256(buffer);
```

### Email Notifications
**Nodemailer + Handlebars templates**  
Triggers on:
- New complaint creation → notify admins/investigators
- Status change → notify reporter
- Investigator assignment → notify assigned user

**Implementation**: `apps/backend/src/modules/notifications`

### Frontend API Communication
**Axios instance** in `apps/frontend/lib/api.ts`:
- Intercepts 401 → redirect to login
- Attaches JWT bearer token automatically
- Base URL from `NEXT_PUBLIC_API_URL` env var

---

## 📁 File Organization Conventions

### Backend Module Structure
```
modules/complaints/
├── complaints.module.ts           # NestJS module registration
├── complaints.controller.ts       # 10 REST endpoints (GET, POST, PATCH, DELETE)
├── complaints.service.ts          # Business logic (14 methods)
├── complaints.service.spec.ts     # Unit tests (25+ test cases)
└── dto/
    ├── create-complaint.dto.ts    # Validation + documentation
    ├── update-complaint.dto.ts
    ├── query-complaints.dto.ts    # Pagination, filters
    └── change-status.dto.ts
```

**DTOs use class-validator decorators**:
```typescript
export class CreateComplaintDto {
  @IsString()
  @MinLength(10)
  title: string;

  @IsEnum(ComplaintType)
  type: ComplaintType;

  @IsOptional()
  @IsArray()
  involvedPeople?: string[];
}
```

### Frontend Component Structure
```
app/                      # App Router pages
├── nova-denuncia/       # New complaint form (public)
├── acompanhar/          # Track complaint by protocol (public)
├── dashboard/           # Admin dashboard (requires ADMIN role)
├── denuncias/           # Complaint management (INVESTIGATOR)
├── usuarios/            # User management (ADMIN)
└── configuracoes/       # System settings (ADMIN)

components/             # Reusable React components
hooks/                 # Custom React hooks (useAuth, useComplaints)
lib/                   # Utilities (api.ts, validation.ts)
stores/                # Zustand state (auth store, complaints store)
```

---

## 🧪 Testing Conventions

### Backend Unit Tests
**Jest + NestJS testing module**:
```typescript
describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ComplaintsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(ComplaintsService);
  });

  it('should create complaint with valid data', async () => {
    const result = await service.create(createDto, userId);
    expect(result.protocol).toMatch(/^DEN-\d{4}-/);
    expect(result.status).toBe('PENDING');
  });
});
```

### E2E Tests
Run with `.env.test` (separate test database):
```bash
DATABASE_URL="postgresql://...test_db" npm run test:e2e
```

### Frontend Testing
Use React Testing Library + Vitest (configured in `tsconfig.json`)

---

## ⚠️ Common Pitfalls & Solutions

### Env Variable Missing → Application Won't Start
**Solution**: Copy `.env.local` template from docker-compose.dev.yml or docs/QUICKSTART.md

### Database Connection Refused
**Solution**: Ensure PostgreSQL running on port 5432 (or update DATABASE_URL)
```bash
docker-compose -f docker-compose.dev.yml up postgres
```

### JWT Token Expired → 401 Unauthorized
**Solution**: Frontend middleware auto-refreshes via `refreshToken` endpoint. If still failing, verify `JWT_SECRET` matches backend config.

### Complaint Status Transition Invalid
**Solution**: Check `ComplaintStatus` enum. Valid transitions defined in `changeStatus()` service method—not all transitions allowed (e.g., RESOLVED → PENDING is invalid).

### S3 Upload Fails in Development
**Solution**: LocalStack S3 must be running. Verify:
1. `docker-compose up localstack`
2. Environment `AWS_ENDPOINT` set to `http://localhost:4566`

---

## 🎯 Code Review Checklist

Before committing changes:
- [ ] **RBAC**: Does this endpoint validate user role + resource ownership?
- [ ] **Audit Logging**: Is critical action logged to `AuditLog` table?
- [ ] **DTO Validation**: Are inputs validated with class-validator?
- [ ] **Error Handling**: Are specific HTTP exceptions used (BadRequest, Forbidden, NotFound)?
- [ ] **Types**: No `any` types (use strict TypeScript)
- [ ] **Database**: Using Prisma transactions for multi-step operations?
- [ ] **Frontend**: API calls wrapped in try-catch with user-facing error messages?
- [ ] **Tests**: Coverage ≥80% for new service methods?

---

## 📚 Key References

- **Main Docs**: [README.md](../README.md)
- **Backend Architecture**: [DEVELOPER-GUIDE.md](../DEVELOPER-GUIDE.md)
- **API Examples**: [docs/COMPLAINTS-API-EXAMPLES.md](../docs/COMPLAINTS-API-EXAMPLES.md)
- **Setup Guide**: [docs/QUICKSTART.md](../docs/QUICKSTART.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
- **S3 Setup**: [docs/LOCALSTACK-SETUP.md](../docs/LOCALSTACK-SETUP.md)
- **Database Schema**: [apps/backend/prisma/schema.prisma](../apps/backend/prisma/schema.prisma)
