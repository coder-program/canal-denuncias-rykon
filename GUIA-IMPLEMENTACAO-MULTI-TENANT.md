# 🚀 Guia Completo de Implementação Multi-Tenant White-Label

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Backend rodando (NestJS)
- Frontend rodando (Next.js 14)

---

## ⚙️ FASE 1: BACKEND - Schema e Migrations (15 min)

### Passo 1.1: Atualizar schema.prisma

Adicione ao final do arquivo `apps/backend/prisma/schema.prisma`:

```prisma
// ==================== NOVOS ENUMS ====================

enum TenantStatus {
  ACTIVE
  SUSPENDED
  TRIAL
  CANCELLED
}

// ==================== ATUALIZAR ENUM EXISTENTE ====================

// No enum UserRole existente, adicione:
enum UserRole {
  PUBLIC
  REPORTER
  INVESTIGATOR
  ADMIN
  AUDITOR
  SUPER_ADMIN  // << ADICIONAR ESTA LINHA
}

// ==================== NOVOS MODELS ====================

model Tenant {
  id                        String          @id @default(cuid())
  slug                      String          @unique
  name                      String
  status                    TenantStatus    @default(TRIAL)
  subscriptionExpiresAt     DateTime?       @map("subscription_expires_at")
  maxUsers                  Int             @default(10) @map("max_users")
  maxComplaintsPerMonth     Int             @default(100) @map("max_complaints_per_month")
  createdAt                 DateTime        @default(now()) @map("created_at")
  updatedAt                 DateTime        @updatedAt @map("updated_at")
  isActive                  Boolean         @default(true) @map("is_active")
  
  branding                  TenantBranding?
  users                     User[]
  complaints                Complaint[]
  attachments               Attachment[]
  comments                  ComplaintComment[]
  dossiers                  Dossier[]
  notifications             Notification[]
  auditLogs                 AuditLog[]

  @@map("tenants")
}

model TenantBranding {
  id                    String   @id @default(cuid())
  tenantId              String   @unique @map("tenant_id")
  companyName           String   @map("company_name")
  primaryColor          String   @default("#3b82f6") @map("primary_color")
  secondaryColor        String   @default("#f59e0b") @map("secondary_color")
  logoUrl               String?  @map("logo_url")
  faviconUrl            String?  @map("favicon_url")
  loginBackgroundUrl    String?  @map("login_background_url")
  customCss             String?  @map("custom_css")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  
  tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_branding")
}
```

### Passo 1.2: Adicionar tenantId aos models existentes

Em cada model listado abaixo, adicione os campos tenantId e tenant:

```prisma
model User {
  // ... campos existentes ...
  
  tenantId                 String?           @map("tenant_id")
  tenant                   Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  // ... relações existentes ...

  @@index([tenantId])
}

model Complaint {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  // ... relações existentes ...

  @@index([tenantId])
}

model Attachment {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model ComplaintComment {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model Dossier {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model Notification {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

model AuditLog {
  // ... campos existentes ...
  
  tenantId                String?           @map("tenant_id")
  tenant                  Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}
```

### Passo 1.3: Criar e aplicar migrations

```bash
cd apps/backend

# Gerar migration
npx prisma migrate dev --name add_multi_tenant_support

# Gerar cliente Prisma
npx prisma generate
```

### Passo 1.4: Criar seed para dados iniciais

Crie ou atualize `apps/backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar SUPER_ADMIN da plataforma
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ouvion.com' },
    update: {},
    create: {
      email: 'superadmin@ouvion.com',
      passwordHash: hashedPassword,
      fullName: 'Super Administrador',
      role: 'SUPER_ADMIN',
      isActive: true,
      // NÃO TEM tenantId
    },
  });

  console.log('✅ Super Admin criado:', superAdmin.email);

  // 2. Criar Tenant 1 (Empresa Exemplo)
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'empresa-exemplo' },
    update: {},
    create: {
      slug: 'empresa-exemplo',
      name: 'Empresa Exemplo LTDA',
      status: 'ACTIVE',
      maxUsers: 50,
      maxComplaintsPerMonth: 500,
      isActive: true,
    },
  });

  // Criar branding do Tenant 1
  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant1.id },
    update: {},
    create: {
      tenantId: tenant1.id,
      companyName: 'Empresa Exemplo',
      primaryColor: '#3b82f6',
      secondaryColor: '#f59e0b',
    },
  });

  // Criar usuário admin do Tenant 1
  const tenant1Admin = await prisma.user.upsert({
    where: { email: 'admin@empresa-exemplo.com' },
    update: {},
    create: {
      email: 'admin@empresa-exemplo.com',
      passwordHash: hashedPassword,
      fullName: 'Admin Empresa Exemplo',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  console.log('✅ Tenant 1 criado:', tenant1.name);
  console.log('✅ Admin Tenant 1:', tenant1Admin.email);

  // 3. Criar Tenant 2 (Outra Empresa)
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      slug: 'acme-corp',
      name: 'ACME Corporation',
      status: 'TRIAL',
      maxUsers: 10,
      maxComplaintsPerMonth: 100,
      isActive: true,
    },
  });

  // Criar branding do Tenant 2
  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant2.id },
    update: {},
    create: {
      tenantId: tenant2.id,
      companyName: 'ACME Corp',
      primaryColor: '#10b981',
      secondaryColor: '#8b5cf6',
    },
  });

  // Criar usuário admin do Tenant 2
  const tenant2Admin = await prisma.user.upsert({
    where: { email: 'admin@acmecorp.com' },
    update: {},
    create: {
      email: 'admin@acmecorp.com',
      passwordHash: hashedPassword,
      fullName: 'Admin ACME Corp',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  console.log('✅ Tenant 2 criado:', tenant2.name);
  console.log('✅ Admin Tenant 2:', tenant2Admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Executar seed:

```bash
npx prisma db seed
```

---

## ⚙️ FASE 2: BACKEND - Middleware e Guards (20 min)

### Passo 2.1: Copiar arquivos criados

Copie os seguintes arquivos já criados:

1. `src/common/middleware/tenant.middleware.ts`
2. `src/common/guards/tenant.guard.ts`
3. `src/common/guards/super-admin.guard.ts`

### Passo 2.2: Registrar middleware no app.module.ts

Edite `apps/backend/src/app.module.ts`:

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  // ... imports existentes ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Aplica a todas as rotas
  }
}
```

---

## ⚙️ FASE 3: BACKEND - Módulo de Tenant Branding (25 min)

### Passo 3.1: Criar estrutura do módulo

```bash
cd apps/backend/src/modules

# Se não existir, criar pasta tenant
mkdir -p tenant/dto
mkdir -p tenant/services
```

### Passo 3.2: Copiar arquivos criados

1. `modules/tenant/dto/update-branding.dto.ts`
2. `modules/tenant/services/tenant-branding.service.ts`
3. `modules/tenant/tenant-branding.controller.ts`

### Passo 3.3: Criar TenantModule

Crie `apps/backend/src/modules/tenant/tenant.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TenantBrandingService } from './services/tenant-branding.service';
import { TenantBrandingController } from './tenant-branding.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantBrandingController],
  providers: [TenantBrandingService],
  exports: [TenantBrandingService],
})
export class TenantModule {}
```

### Passo 3.4: Registrar TenantModule no AppModule

Edite `apps/backend/src/app.module.ts`:

```typescript
import { TenantModule } from './modules/tenant/tenant.module';

@Module({
  imports: [
    // ... outros imports ...
    TenantModule,
  ],
  // ...
})
export class AppModule implements NestModule {
  // ...
}
```

---

## ⚙️ FASE 4: BACKEND - Atualizar AuthModule (20 min)

### Passo 4.1: Substituir AuthController

Substitua o conteúdo do `apps/backend/src/modules/auth/auth.controller.ts` pelo código em:
`auth.controller.multi-tenant.ts`

### Passo 4.2: Atualizar AuthService

Mescle os métodos de `auth.service.multi-tenant.ts` com o AuthService existente.

Principais mudanças:
- O método `login()` agora inclui `tenantId` no payload do JWT
- Métodos `validateUser()` agora verificam `tenantId`

### Passo 4.3: Atualizar JWT Strategy

Se tiver uma JwtStrategy, certifique-se de incluir `tenantId` no payload:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId || null,
    };
  }
}
```

---

## ⚙️ FASE 5: FRONTEND - Estrutura Base (25 min)

### Passo 5.1: Criar contexts e hooks

Copie os arquivos:
1. `contexts/TenantContext.tsx`
2. `lib/services/brandingService.ts`

### Passo 5.2: Criar estrutura de rotas [tenant]

```bash
cd apps/frontend/app

mkdir -p [tenant]/login
mkdir -p loginadm
```

### Passo 5.3: Copiar arquivos de layout e páginas

1. `app/[tenant]/layout.tsx`
2. `app/[tenant]/page.tsx`
3. `app/[tenant]/login/page.tsx`
4. `app/[tenant]/tenant-layout.css`
5. `app/loginadm/layout.tsx`
6. `app/loginadm/page.tsx`

---

## ⚙️ FASE 6: FRONTEND - Ajustar Rotas Existentes (30 min)

### Passo 6.1: Mover dashboard para dentro de [tenant]

```bash
# Se dashboard está em app/dashboard
mv app/dashboard app/[tenant]/dashboard
```

### Passo 6.2: Atualizar imports no dashboard

Em todos os arquivos do dashboard, adicione o hook `useTenant`:

```typescript
import { useTenant } from '../../../contexts/TenantContext';

export default function DashboardPage() {
  const { tenant, branding } = useTenant();
  
  // Use tenant.id para filtrar dados
  // Use branding.primaryColor para estilização
  
  // ... resto do código ...
}
```

### Passo 6.3: Atualizar chamadas de API para incluir tenantId

Em todos os services de API (complaintsService, attachmentsService, etc), adicione tenantId nas requisições:

```typescript
// Exemplo no complaintsService
export const complaintsService = {
  async list(tenantId: string, filters: any) {
    const response = await apiClient.get(`/complaints`, {
      params: { ...filters },
      headers: {
        'X-Tenant-Slug': tenantId,
      },
    });
    return response.data;
  },
  
  // ... outros métodos ...
};
```

---

## ⚙️ FASE 7: Testes e Validação (20 min)

### Teste 1: Login Super Admin

```bash
# 1. Iniciar backend
cd apps/backend
npm run start:dev

# 2. Abrir navegador
http://localhost:3001/loginadm

# 3. Login
Email: superadmin@ouvion.com
Senha: Admin@123

# ✅ Deve redirecionar para /admin/dashboard
```

### Teste 2: Login Tenant 1

```bash
# 1. Abrir navegador
http://localhost:3001/empresa-exemplo

# ✅ Deve mostrar landing page com branding correto

# 2. Clicar em "Acessar Plataforma"
http://localhost:3001/empresa-exemplo/login

# 3. Login
Email: admin@empresa-exemplo.com
Senha: Admin@123

# ✅ Deve redirecionar para /empresa-exemplo/dashboard
```

### Teste 3: Isolamento entre Tenants

```bash
# 1. Login no Tenant 1
# 2. Criar uma denúncia
# 3. Fazer logout

# 4. Login no Tenant 2
http://localhost:3001/acme-corp/login
Email: admin@acmecorp.com
Senha: Admin@123

# 5. Verificar lista de denúncias

# ✅ NÃO deve mostrar denúncias do Tenant 1
```

### Teste 4: Bloqueio de Tenant Inativo

```bash
# 1. Via Prisma Studio ou SQL, marcar tenant como inativo:
UPDATE tenants SET is_active = false WHERE slug = 'acme-corp';

# 2. Tentar acessar
http://localhost:3001/acme-corp/login

# ✅ Deve mostrar erro "Tenant inativo"
```

---

## 📊 Checklist Final

### Backend
- [ ] Schema Prisma atualizado
- [ ] Migrations aplicadas
- [ ] Seed executado
- [ ] TenantMiddleware registrado
- [ ] TenantGuard criado
- [ ] SuperAdminGuard criado
- [ ] TenantModule criado e registrado
- [ ] AuthController atualizado
- [ ] AuthService atualizado
- [ ] JWT Strategy atualizado

### Frontend
- [ ] TenantContext criado
- [ ] brandingService criado
- [ ] Layout [tenant] criado
- [ ] Landing page [tenant] criada
- [ ] Login [tenant] criado
- [ ] Login admin criado
- [ ] Dashboard movido para [tenant]/dashboard
- [ ] Imports atualizados
- [ ] API calls incluem tenantId

### Testes
- [ ] Login super admin funciona
- [ ] Login tenant 1 funciona
- [ ] Login tenant 2 funciona
- [ ] Isolamento entre tenants OK
- [ ] Bloqueio de tenant inativo OK
- [ ] Branding dinâmico aplicado
- [ ] Cores customizadas funcionam
- [ ] Logo exibido corretamente

---

## 🎯 Credenciais Padrão

### Super Admin (Plataforma)
- URL: http://localhost:3001/loginadm
- Email: superadmin@ouvion.com
- Senha: Admin@123

### Tenant 1 (Empresa Exemplo)
- URL: http://localhost:3001/empresa-exemplo/login
- Email: admin@empresa-exemplo.com
- Senha: Admin@123

### Tenant 2 (ACME Corp)
- URL: http://localhost:3001/acme-corp/login
- Email: admin@acmecorp.com
- Senha: Admin@123

---

## 🚨 Troubleshooting

### Erro: "Tenant não encontrado"
- Verificar se seed foi executado
- Verificar URL do tenant (slug correto)
- Verificar se middleware está registrado

### Erro: "Usuário não pertence a este tenant"
- Verificar se usuário tem tenantId correto no banco
- Verificar se está usando o login correto (/auth/:tenant/login)

### Erro: "Super Admin não pode estar vinculado a um tenant"
- Verificar se SUPER_ADMIN não tem tenantId no banco
- Usar /loginadm para SUPER_ADMIN

### Branding não está aplicando
- Verificar se TenantContext está envolvendo a página
- Verificar se CSS variables estão sendo injetadas
- Verificar console do navegador para erros

---

## 📚 Próximos Passos

1. **Painel Super Admin**: Criar CRUD de tenants
2. **Upload de Logo**: Implementar upload de imagens
3. **Planos e Billing**: Integrar sistema de assinaturas
4. **Rate Limiting**: Implementar por tenant
5. **Analytics**: Dashboard por tenant
6. **Subdomain Routing**: Implementar tenant.ouvion.com
7. **Custom Domain**: Permitir domínios personalizados
8. **SSO/SAML**: Integração com IdP corporativos

---

**Implementação Completa! 🎉**

Seu sistema agora é um SaaS multi-tenant com white-label completo.
