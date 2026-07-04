# 🔧 Guia de Solução de Problemas (Troubleshooting)

## Problemas Comuns e Soluções

### 1. Instalação e Dependências

#### ❌ Erro: `Cannot find module '@nestjs/core'`

**Causa**: Dependências não instaladas ou node_modules corrompido.

**Solução**:
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
cd apps/backend
rm -rf node_modules package-lock.json
cd ../..
npm install
```

#### ❌ Erro: `Prisma Client has not been generated`

**Causa**: Prisma Client não foi gerado após instalação.

**Solução**:
```bash
cd apps/backend
npm run prisma:generate
```

---

### 2. Docker e Containers

#### ❌ Erro: `port 5432 already in use`

**Causa**: PostgreSQL já está rodando na máquina local.

**Solução 1** (Parar serviço local):
```bash
# Windows
net stop postgresql-x64-16

# macOS/Linux
sudo systemctl stop postgresql
```

**Solução 2** (Alterar porta no docker-compose):
```yaml
# docker-compose.dev.yml
postgres:
  ports:
    - "5433:5432"  # Usar porta 5433 no host
```

E alterar no `.env`:
```env
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5433/canal_denuncia?schema=public"
```

#### ❌ Containers não iniciam (unhealthy)

**Diagnóstico**:
```bash
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs elasticsearch
```

**Solução**:
```bash
# Recriar volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Aguardar health checks (~60 segundos)
```

#### ❌ Elasticsearch não inicia (memória insuficiente)

**Causa**: Elasticsearch precisa de mais memória.

**Solução**:
```yaml
# docker-compose.dev.yml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms256m -Xmx256m"  # Reduzir de 512m
```

Ou aumentar memória do Docker Desktop:
- Settings → Resources → Memory → 6GB+

---

### 3. Banco de Dados

#### ❌ Erro: `P1001: Can't reach database server`

**Causa**: PostgreSQL não está acessível.

**Solução**:
```bash
# Verificar se container está rodando
docker ps | grep postgres

# Testar conexão
docker exec -it canal-denuncia-postgres psql -U denuncia_user -d canal_denuncia

# Se falhar, recriar container
docker-compose -f docker-compose.dev.yml restart postgres
```

#### ❌ Erro: `P3009: Failed to create database`

**Causa**: Database já existe ou permissões incorretas.

**Solução**:
```bash
# Reset completo do banco
cd apps/backend
npm run prisma:migrate:reset  # ⚠️ Apaga todos os dados!

# Ou manualmente
docker exec -it canal-denuncia-postgres psql -U denuncia_user -c "DROP DATABASE canal_denuncia;"
docker exec -it canal-denuncia-postgres psql -U denuncia_user -c "CREATE DATABASE canal_denuncia;"
npm run prisma:migrate
```

#### ❌ Migrations falhando

**Solução**:
```bash
cd apps/backend

# Verificar status
npx prisma migrate status

# Resolver migrations pendentes
npx prisma migrate resolve --applied "migration_name"

# Forçar reset (dev only!)
npx prisma migrate reset
```

---

### 4. Autenticação

#### ❌ Erro: `401 Unauthorized` em endpoint protegido

**Causa 1**: Token expirado.

**Solução**: Renovar com refresh token.
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "SEU_REFRESH_TOKEN"}'
```

**Causa 2**: Token inválido ou formato incorreto.

**Solução**: Verificar formato do header.
```bash
# ❌ Errado
Authorization: SEU_TOKEN

# ✅ Correto
Authorization: Bearer SEU_TOKEN
```

#### ❌ Erro: `JWT_SECRET is not defined`

**Causa**: Variável de ambiente não carregada.

**Solução**:
```bash
# Verificar se .env existe
ls -la apps/backend/.env

# Copiar de exemplo
cd apps/backend
cp .env.example .env

# Editar e adicionar secrets
nano .env  # ou code .env
```

#### ❌ Usuário bloqueado ao tentar login

**Solução**: Desbloquear via admin.
```bash
# Via Prisma Studio
cd apps/backend
npm run prisma:studio
# Navegar até Users → Editar → isBlocked = false

# Ou via SQL
docker exec -it canal-denuncia-postgres psql -U denuncia_user -d canal_denuncia \
  -c "UPDATE users SET is_blocked = false WHERE email = 'usuario@empresa.com';"
```

---

### 5. Performance

#### ❌ API muito lenta (> 1s de resposta)

**Diagnóstico**:
```bash
# Verificar logs
docker logs canal-denuncia-backend

# Verificar CPU/memória
docker stats

# Testar conexão com banco
docker exec -it canal-denuncia-postgres psql -U denuncia_user -d canal_denuncia \
  -c "SELECT COUNT(*) FROM users;"
```

**Soluções**:
1. Verificar indexes no banco (já configurados no schema)
2. Aumentar connection pool do Prisma:
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10  // Adicionar
}
```

3. Habilitar query logging para debug:
```typescript
// prisma.service.ts
log: ['query', 'info', 'warn', 'error']
```

---

### 6. Testes

#### ❌ Testes falhando com `Cannot find module`

**Solução**:
```bash
cd apps/backend

# Limpar cache do Jest
npm run test -- --clearCache

# Reinstalar dependencies
rm -rf node_modules
npm install

# Gerar Prisma Client
npm run prisma:generate
```

#### ❌ E2E tests falhando (database connection)

**Solução**:
```bash
# Criar banco de testes separado
docker exec -it canal-denuncia-postgres psql -U denuncia_user \
  -c "CREATE DATABASE canal_denuncia_test;"

# Rodar migrations no banco de teste
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia_test?schema=public" \
  npm run prisma:migrate

# Rodar testes E2E
npm run test:e2e
```

---

### 7. Logs e Debugging

#### ❌ Não consigo ver logs no Kibana

**Solução**:
```bash
# Verificar se Elasticsearch está acessível
curl http://localhost:9200/_cluster/health

# Verificar se logs estão sendo enviados
curl http://localhost:9200/_cat/indices?v

# Recriar index pattern no Kibana
# 1. Abrir http://localhost:5601
# 2. Management → Stack Management → Index Patterns
# 3. Create index pattern: canal-denuncia-logs*
```

#### ❌ Logs sensíveis não estão sendo mascarados

**Solução**: Adicionar campo sensível no logger.service.ts:
```typescript
private maskSensitiveData(data: any): any {
  const sensitiveKeys = [
    'password', 'passwordHash', 'email', 'cpf', 
    'phone', 'reporterEmail', 'SEU_CAMPO_AQUI'
  ];
  // ...
}
```

---

### 8. Deploy e Produção

#### ❌ Erro: `Cannot connect to Docker daemon`

**Solução (Windows)**:
```bash
# Iniciar Docker Desktop
# Start Menu → Docker Desktop

# Verificar status
docker version
```

**Solução (Linux)**:
```bash
# Iniciar serviço
sudo systemctl start docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

#### ❌ Build do Docker falhando

**Solução**:
```bash
# Build com logs detalhados
docker build -f apps/backend/Dockerfile . --progress=plain --no-cache

# Verificar contexto de build
docker build -f apps/backend/Dockerfile . --target builder
```

#### ❌ Kubernetes pod em CrashLoopBackOff

**Diagnóstico**:
```bash
# Ver logs do pod
kubectl logs -f <pod-name> -n canal-denuncia

# Descrever pod
kubectl describe pod <pod-name> -n canal-denuncia

# Verificar secrets
kubectl get secrets -n canal-denuncia
```

---

### 9. Rate Limiting

#### ❌ Erro: `429 Too Many Requests`

**Causa**: Ultrapassou limite de requisições (100 req/min padrão).

**Solução temporária**:
```env
# .env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=500  # Aumentar limite
```

**Solução permanente**: Implementar cache Redis.

---

### 10. CORS

#### ❌ Erro: `CORS policy: No 'Access-Control-Allow-Origin'`

**Solução**:
```env
# .env
CORS_ORIGIN=http://localhost:5173,https://seudominio.com
```

Ou alterar em `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'https://seudominio.com'],
  credentials: true,
});
```

---

## 🆘 Comandos de Emergência

### Reset Completo (Dev)

```bash
# ⚠️ CUIDADO: Apaga TODOS os dados!

# Parar tudo
docker-compose -f docker-compose.dev.yml down -v

# Limpar node_modules
rm -rf node_modules apps/*/node_modules

# Reinstalar
npm install

# Recriar banco
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Subir tudo novamente
cd ../..
docker-compose -f docker-compose.dev.yml up -d

# Iniciar backend
cd apps/backend
npm run dev
```

### Verificação de Saúde Completa

```bash
# Verificar Node.js
node -v  # >= 20.0.0

# Verificar Docker
docker --version
docker-compose --version

# Verificar containers
docker ps

# Testar API
curl http://localhost:3000/api/v1/health

# Testar banco
docker exec -it canal-denuncia-postgres psql -U denuncia_user -d canal_denuncia -c "SELECT 1;"

# Verificar Elasticsearch
curl http://localhost:9200/_cluster/health

# Verificar RabbitMQ
curl -u denuncia_user:secure_password http://localhost:15672/api/overview
```

---

## 📞 Suporte

Se o problema persistir:

1. **Verificar Issues existentes**: https://github.com/sua-org/canal-denuncia-corporativo/issues
2. **Criar novo Issue**: Incluir:
   - Versão do Node.js: `node -v`
   - Sistema operacional
   - Logs completos do erro
   - Steps para reproduzir
3. **Contato**: compliance@suaempresa.com

---

## 📚 Recursos Adicionais

- [README.md](../README.md) - Documentação completa
- [QUICKSTART.md](./QUICKSTART.md) - Setup rápido
- [CHANGELOG.md](../CHANGELOG.md) - Histórico de versões
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Docker Docs](https://docs.docker.com/)

---

*Última atualização: 14 de outubro de 2024*
