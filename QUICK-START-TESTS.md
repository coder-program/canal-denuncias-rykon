# 🚀 Guia Rápido - Testando o Módulo de Denúncias

## ⚡ Setup em 3 Minutos

### 1. Iniciar Ambiente
```powershell
# Entrar na pasta do backend
cd apps\backend

# Instalar dependências (se ainda não fez)
npm install

# Subir containers Docker
docker-compose -f ..\..\docker-compose.dev.yml up -d

# Aguardar containers iniciarem (~30 segundos)
timeout /t 30

# Aplicar migrations
npm run prisma:migrate

# Popular banco com dados de exemplo
npm run prisma:seed

# Iniciar backend
npm run dev
```

### 2. Verificar se Tudo Subiu
```powershell
# Backend: http://localhost:3000
# Swagger: http://localhost:3000/api/v1/docs
# PostgreSQL: localhost:5432
# MongoDB: localhost:27017
# RabbitMQ: http://localhost:15672 (guest/guest)
# Adminer: http://localhost:8080
# Kibana: http://localhost:5601
```

---

## 📝 Testando Denúncias (cURL)

### Cenário 1: Criar Denúncia Pública (Anônima)

```powershell
curl -X POST http://localhost:3000/api/v1/complaints `
  -H "Content-Type: application/json" `
  -d '{
    \"isAnonymous\": true,
    \"type\": \"FRAUD\",
    \"priority\": \"CRITICAL\",
    \"title\": \"Fraude detectada em processo licitatório\",
    \"description\": \"Testemunhei manipulação de documentos no processo LIC-2024-0345. Há evidências de direcionamento para fornecedor específico mediante pagamento irregular. A situação é grave e requer investigação imediata.\"
  }'
```

**✅ Resposta esperada:**
```json
{
  "id": "uuid-aqui",
  "protocol": "DEN-2024-ABC123",
  "status": "PENDING",
  "type": "FRAUD",
  "priority": "CRITICAL",
  "isAnonymous": true,
  "createdAt": "2024-10-14T..."
}
```

**⚠️ IMPORTANTE: Copie o protocolo retornado!**

---

### Cenário 2: Acompanhar Denúncia (Público)

```powershell
# Substitua o protocolo pelo retornado acima
curl http://localhost:3000/api/v1/complaints/protocol/DEN-2024-ABC123
```

**✅ Resposta:**
```json
{
  "protocol": "DEN-2024-ABC123",
  "status": "PENDING",
  "type": "FRAUD",
  "priority": "CRITICAL",
  "title": "Fraude detectada...",
  "createdAt": "2024-10-14T...",
  "updatedAt": "2024-10-14T..."
}
```

---

### Cenário 3: Login como ADMIN

```powershell
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"admin@canaldenuncia.com\",
    \"password\": \"Admin@2024\"
  }'
```

**✅ Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "admin@canaldenuncia.com",
    "role": "ADMIN"
  }
}
```

**⚠️ COPIE O accessToken!**

---

### Cenário 4: Ver Estatísticas (ADMIN)

```powershell
# Substitua SEU_TOKEN pelo accessToken copiado
curl http://localhost:3000/api/v1/complaints/stats `
  -H "Authorization: Bearer SEU_TOKEN"
```

**✅ Resposta:**
```json
{
  "total": 5,
  "byStatus": {
    "pending": 4,
    "inProgress": 1,
    "resolved": 0
  },
  "byType": {
    "HARASSMENT": 2,
    "FRAUD": 1,
    "DISCRIMINATION": 1,
    "OTHER": 1
  },
  "byPriority": {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 1,
    "CRITICAL": 1
  }
}
```

---

### Cenário 5: Listar Todas as Denúncias (ADMIN)

```powershell
curl "http://localhost:3000/api/v1/complaints?page=1&limit=10" `
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### Cenário 6: Ver Detalhes de Denúncia

```powershell
# Substitua COMPLAINT_ID pelo id retornado na listagem
curl http://localhost:3000/api/v1/complaints/COMPLAINT_ID `
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### Cenário 7: Atribuir Investigador (ADMIN)

```powershell
# Primeiro, pegue o ID do investigador do seed (investigator@canaldenuncia.com)
# Depois substitua COMPLAINT_ID e INVESTIGATOR_ID

curl -X PATCH "http://localhost:3000/api/v1/complaints/COMPLAINT_ID/assign/INVESTIGATOR_ID" `
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### Cenário 8: Alterar Status para IN_PROGRESS (ADMIN)

```powershell
curl -X PATCH http://localhost:3000/api/v1/complaints/COMPLAINT_ID/status `
  -H "Authorization: Bearer SEU_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"status\": \"IN_PROGRESS\",
    \"reason\": \"Investigação iniciada após análise preliminar\"
  }'
```

---

### Cenário 9: Criar Denúncia Identificada

```powershell
curl -X POST http://localhost:3000/api/v1/complaints `
  -H "Content-Type: application/json" `
  -d '{
    \"isAnonymous\": false,
    \"reporterEmail\": \"denunciante@example.com\",
    \"reporterPhone\": \"+5511999887766\",
    \"type\": \"HARASSMENT\",
    \"priority\": \"HIGH\",
    \"title\": \"Assédio moral recorrente no setor comercial\",
    \"description\": \"Durante os últimos 3 meses, presenciei situações repetidas de assédio moral pelo gestor da área comercial. O comportamento inclui gritos em público, humilhações e ameaças veladas de demissão sem justificativa técnica. Já tentei resolver internamente sem sucesso.\",
    \"location\": \"Escritório Central - 3º andar, sala 305\",
    \"incidentDate\": \"2024-10-01T14:30:00Z\",
    \"involvedPeople\": [\"João Silva\", \"maria.santos@empresa.com\"],
    \"witnesses\": [\"Pedro Costa\", \"Ana Oliveira\"],
    \"metadata\": {
      \"department\": \"Comercial\",
      \"shift\": \"Manhã\",
      \"frequency\": \"Semanal\"
    }
  }'
```

---

### Cenário 10: Resolver Denúncia (ADMIN)

```powershell
curl -X PATCH http://localhost:3000/api/v1/complaints/COMPLAINT_ID/status `
  -H "Authorization: Bearer SEU_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"status\": \"RESOLVED\",
    \"reason\": \"Após investigação completa com entrevistas e análise de evidências, foram aplicadas medidas disciplinares: advertência formal ao gestor, participação obrigatória em treinamento de liderança, e acompanhamento mensal pelo RH por 6 meses.\"
  }'
```

---

## 🧪 Scripts de Teste Automatizado

### Criar 5 Denúncias de Teste (PowerShell)

```powershell
# Salvar como: test-complaints.ps1

for ($i=1; $i -le 5; $i++) {
    $body = @{
        isAnonymous = $false
        reporterEmail = "teste$i@example.com"
        type = "HARASSMENT"
        priority = "MEDIUM"
        title = "Denúncia de teste #$i"
        description = "Esta é uma denúncia de teste para validação do sistema. Contém descrição detalhada com mais de 50 caracteres para atender aos requisitos mínimos de validação."
    } | ConvertTo-Json

    curl -X POST http://localhost:3000/api/v1/complaints `
        -H "Content-Type: application/json" `
        -d $body

    Write-Host "`n--- Denúncia $i criada ---`n"
    Start-Sleep -Seconds 1
}
```

**Executar:**
```powershell
.\test-complaints.ps1
```

---

## 📊 Swagger UI (Alternativa ao cURL)

### Acessar Interface Interativa

1. Abra: **http://localhost:3000/api/v1/docs**

2. Para endpoints autenticados:
   - Clique em **"Authorize"** (canto superior direito)
   - Cole o `accessToken` no formato: `Bearer SEU_TOKEN`
   - Clique em **"Authorize"**

3. Agora teste qualquer endpoint pela interface!

---

## 👥 Usuários de Teste (do Seed)

| Email | Senha | Role | Descrição |
|-------|-------|------|-----------|
| `admin@canaldenuncia.com` | `Admin@2024` | ADMIN | Acesso total |
| `investigator@canaldenuncia.com` | `Investigator@2024` | INVESTIGATOR | Investigações |
| `reporter@canaldenuncia.com` | `Reporter@2024` | REPORTER | Criar denúncias |
| `auditor@canaldenuncia.com` | `Auditor@2024` | AUDITOR | Ver logs |

---

## 🔍 Verificar Logs de Auditoria

### No Kibana (http://localhost:5601)

1. Ir em **Discover**
2. Filtrar por `resource: "complaint"`
3. Ver todas as ações: CREATE, READ, UPDATE, DELETE

---

## 🐛 Troubleshooting

### Backend não inicia
```powershell
# Verificar logs
docker logs canal-denuncia-backend

# Verificar se PostgreSQL está rodando
docker ps | findstr postgres
```

### Migrations falharam
```powershell
# Resetar banco (⚠️ APAGA TODOS OS DADOS)
npm run prisma:migrate:reset

# Recriar
npm run prisma:migrate
npm run prisma:seed
```

### Token expirado
```powershell
# Fazer login novamente
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@canaldenuncia.com\",\"password\":\"Admin@2024\"}'
```

---

## 📚 Documentação Completa

- **API Examples**: `docs\COMPLAINTS-API-EXAMPLES.md`
- **Phase 2 Summary**: `docs\PHASE-2-SUMMARY.md`
- **Changelog**: `CHANGELOG.md`
- **Troubleshooting**: `docs\TROUBLESHOOTING.md`

---

## ✅ Checklist de Testes

- [ ] Criar denúncia anônima
- [ ] Criar denúncia identificada
- [ ] Buscar por protocolo (público)
- [ ] Login como ADMIN
- [ ] Ver estatísticas
- [ ] Listar denúncias com filtros
- [ ] Ver detalhes de denúncia
- [ ] Atribuir investigador
- [ ] Alterar status
- [ ] Testar RBAC (tentar acessar como REPORTER)
- [ ] Verificar logs de auditoria no Kibana
- [ ] Testar validação de campos (enviar título com 5 caracteres)
- [ ] Testar paginação (page=2, limit=5)
- [ ] Testar busca textual (search=assédio)

---

**Pronto para testar!** 🚀

Se tudo funcionar, você terá um módulo de denúncias completo e production-ready! 🎉
