# ⚡ COMANDOS RÁPIDOS - Canal de Denúncias

## 🎯 ESCOLHA SUA CONFIGURAÇÃO

### OPÇÃO 1: PostgreSQL (Recomendado)
```powershell
# Após instalar PostgreSQL, execute:
.\configurar-postgres.ps1 -SenhaPostgres "SUASENHA"
```

### OPÇÃO 2: SQLite (Teste Rápido)
```powershell
# Executar imediatamente (sem instalação):
.\configurar-sqlite.ps1
```

---

## 🔄 MUDAR ENTRE BANCOS

### De SQLite → PostgreSQL
```powershell
.\restaurar-postgres.ps1 -SenhaPostgres "SUASENHA"
```

### De PostgreSQL → SQLite
```powershell
.\configurar-sqlite.ps1
```

---

## 🚀 INICIAR SISTEMA NORMALMENTE

Após configurar o banco, use sempre:
```powershell
.\iniciar-sistema.ps1
```

Este comando:
- ✅ Verifica se o banco está rodando
- ✅ Inicia Backend (porta 3000)
- ✅ Inicia Frontend (porta 3001)
- ✅ Abre navegador automaticamente

---

## 🛠️ COMANDOS ÚTEIS

### Backend Separado
```powershell
cd apps\backend
npm run dev
```

### Frontend Separado
```powershell
cd apps\frontend
npm run dev -- --port 3001
```

### Ver Banco de Dados (Interface Visual)
```powershell
cd apps\backend
npm run prisma:studio
```
Abre interface em: http://localhost:5555

### Verificar Logs Backend
Janela do PowerShell com título: "Backend - Porta 3000"

### Resetar Banco de Dados
```powershell
cd apps\backend
npx prisma migrate reset
npm run prisma:seed
```

---

## 🌐 URLs DO SISTEMA

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3001 | Interface do usuário |
| Backend API | http://localhost:3000/api/v1 | API REST |
| Prisma Studio | http://localhost:5555 | Inspetor de banco |
| API Docs | http://localhost:3000/api/docs | Swagger/OpenAPI |

---

## 👤 CREDENCIAIS DE TESTE

### Admin
- 📧 Email: `admin@empresa.com`
- 🔑 Senha: `Demo123!@`
- 🎭 Nível: Administrador completo

### Investigador
- 📧 Email: `investigator@empresa.com`
- 🔑 Senha: `Demo123!@`
- 🎭 Nível: Investigação e análise

### Reporter
- 📧 Email: `reporter@empresa.com`
- 🔑 Senha: `Demo123!@`
- 🎭 Nível: Visualização próprias denúncias

---

## 🐛 PROBLEMAS COMUNS

### Backend não conecta ao banco
```powershell
# Verificar se PostgreSQL está rodando:
Get-Service "*postgres*"

# Ou verificar SQLite:
Test-Path "apps\backend\dev.db"
```

### Porta 3000 ou 3001 em uso
```powershell
# Matar processos Node.js:
Stop-Process -Name node -Force

# Verificar portas em uso:
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
```

### Erro de migrations Prisma
```powershell
cd apps\backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### Docker/WSL não inicia
```powershell
# Use SQLite temporariamente:
.\configurar-sqlite.ps1
```

---

## 📚 DOCUMENTAÇÃO

- [README.md](README.md) - Visão geral do projeto
- [GUIA-INSTALACAO-POSTGRESQL.md](GUIA-INSTALACAO-POSTGRESQL.md) - Detalhes instalação PostgreSQL
- [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Guia completo desenvolvimento
- [docs/QUICKSTART.md](docs/QUICKSTART.md) - Início rápido

---

## 💡 DICAS

1. **Sempre use** `.\iniciar-sistema.ps1` após configurar pela primeira vez
2. **Se testar com SQLite**, pode migrar para PostgreSQL depois sem perder código
3. **Backend deve iniciar antes** do Frontend para evitar erros de conexão
4. **Prisma Studio** é ótimo para ver/editar dados manualmente
5. **Logs do Backend** aparecem na janela PowerShell dedicada

---

## ✅ CHECKLIST PRIMEIRA EXECUÇÃO

- [ ] Escolher banco: PostgreSQL ou SQLite
- [ ] Executar script de configuração correspondente
- [ ] Aguardar Backend conectar (10-15 segundos)
- [ ] Acessar http://localhost:3001/login
- [ ] Fazer login com credenciais de teste
- [ ] Criar denúncia anônima de teste
- [ ] Explorar dashboard admin

---

**🎉 Pronto! Sistema configurado e rodando!**
