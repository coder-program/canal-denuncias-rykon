# 🏢 Implementação Multi-Tenant White-Label - OuviON

## 📋 Checklist de Implementação

### Backend (NestJS)
- [ ] Schema Prisma atualizado com TenantBranding
- [ ] Migration criada e aplicada
- [ ] TenantMiddleware ajustado
- [ ] TenantGuard implementado
- [ ] SuperAdminGuard implementado
- [ ] TenantBrandingService criado
- [ ] TenantBrandingController criado
- [ ] AuthController ajustado (loginadm + tenant login)
- [ ] Seed data atualizado

### Frontend (Next.js 14)
- [ ] Estrutura de rotas [tenant] criada
- [ ] Layout dinâmico com white-label
- [ ] Página /loginadm
- [ ] Página /[tenant]/login
- [ ] Landing page /[tenant]
- [ ] TenantContext provider
- [ ] Hook useTenant
- [ ] Service de branding

## 🗂️ Estrutura de Arquivos a Criar

```
apps/backend/
├── prisma/
│   ├── schema.prisma (ATUALIZAR)
│   └── migrations/
│       └── [timestamp]_add_tenant_branding/ (CRIAR)
├── src/
│   ├── common/
│   │   ├── middleware/
│   │   │   └── tenant.middleware.ts (ATUALIZAR)
│   │   └── guards/
│   │       ├── tenant.guard.ts (CRIAR)
│   │       └── super-admin.guard.ts (CRIAR)
│   └── modules/
│       ├── tenant/
│       │   ├── branding/
│       │   │   ├── tenant-branding.service.ts (CRIAR)
│       │   │   ├── tenant-branding.controller.ts (CRIAR)
│       │   │   └── dto/
│       │   │       └── update-branding.dto.ts (CRIAR)
│       │   └── tenant.service.ts (ATUALIZAR)
│       └── auth/
│           ├── auth.controller.ts (ATUALIZAR)
│           └── auth.service.ts (ATUALIZAR)

apps/frontend/
├── app/
│   ├── loginadm/
│   │   ├── page.tsx (CRIAR)
│   │   └── layout.tsx (CRIAR)
│   └── [tenant]/
│       ├── layout.tsx (CRIAR)
│       ├── page.tsx (CRIAR)
│       ├── login/
│       │   └── page.tsx (CRIAR)
│       └── dashboard/
│           └── page.tsx (MOVER/AJUSTAR)
├── contexts/
│   └── TenantContext.tsx (CRIAR)
├── hooks/
│   └── useTenant.ts (CRIAR)
└── lib/
    └── services/
        └── brandingService.ts (CRIAR)
```

## 📝 Ordem de Implementação

### Fase 1: Backend - Schema e Migrations (15 min)
1. Atualizar schema.prisma
2. Criar migration
3. Aplicar migration
4. Atualizar seed

### Fase 2: Backend - Middleware e Guards (20 min)
5. Atualizar TenantMiddleware
6. Criar TenantGuard
7. Criar SuperAdminGuard
8. Aplicar guards nos módulos

### Fase 3: Backend - Branding (25 min)
9. Criar TenantBrandingService
10. Criar TenantBrandingController
11. Criar DTOs
12. Registrar no TenantModule

### Fase 4: Backend - Auth (20 min)
13. Atualizar AuthController (loginadm)
14. Atualizar AuthService
15. Criar rota /auth/:tenant/login
16. Validações de tenant

### Fase 5: Frontend - Estrutura (25 min)
17. Criar TenantContext
18. Criar useTenant hook
19. Criar brandingService
20. Criar estrutura de rotas [tenant]

### Fase 6: Frontend - Páginas (30 min)
21. Criar /loginadm
22. Criar /[tenant]/layout com white-label
23. Criar /[tenant]/page (landing)
24. Criar /[tenant]/login
25. Ajustar dashboard existente

### Fase 7: Testes e Ajustes (20 min)
26. Testar fluxo SUPER_ADMIN
27. Testar fluxo tenant 1
28. Testar fluxo tenant 2 (isolamento)
29. Testar bloqueio de tenant inativo
30. Ajustes finais

**Tempo Estimado Total: ~2h 35min**

## 🎯 Próximos Passos

1. Criar todos os arquivos do backend
2. Criar todos os arquivos do frontend
3. Aplicar migrations
4. Testar fluxos
5. Documentar
