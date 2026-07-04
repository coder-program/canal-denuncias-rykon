# 🚨 GUIA RÁPIDO - Como Manter os Servidores Rodando

**Criado em:** 16/10/2025 - 22:23  
**Problema:** ERR_CONNECTION_REFUSED quando servidores param

---

## ⚡ REINICIAR SERVIDORES RAPIDAMENTE

### Opção 1: PowerShell (2 Terminais Separados)

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"
npm run dev -- --port 3001
```

---

## 🔧 SCRIPT DE INICIALIZAÇÃO RÁPIDA

Salve este script como `iniciar-sistema.ps1` na raiz do projeto:

```powershell
# Script para iniciar Backend e Frontend simultaneamente

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   INICIANDO CANAL DE DENÚNCIAS        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar se Docker está rodando (PostgreSQL)
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Cyan
$pg = docker ps --filter "name=postgres-canal" --format "{{.Status}}" | Select-Object -First 1
if ($pg -match "Up") {
    Write-Host "   ✅ PostgreSQL está rodando`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL não está rodando. Iniciando..." -ForegroundColor Yellow
    docker start postgres-canal
    Start-Sleep -Seconds 3
    Write-Host "   ✅ PostgreSQL iniciado`n" -ForegroundColor Green
}

# Iniciar Backend em nova janela
Write-Host "🚀 Iniciando Backend (nova janela)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "apps\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔴 BACKEND - Porta 3000' -ForegroundColor Red; npm run dev"

Start-Sleep -Seconds 3

# Iniciar Frontend em nova janela
Write-Host "🌐 Iniciando Frontend (nova janela)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "apps\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🔵 FRONTEND - Porta 3001' -ForegroundColor Blue; npm run dev -- --port 3001"

Write-Host "`n⏳ Aguardando servidores iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 12

# Verificar se estão online
Write-Host "`n🔍 Verificando status...`n" -ForegroundColor Cyan

$backendOnline = $false
$frontendOnline = $false

try {
    $null = Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 3
    Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
    $backendOnline = $true
} catch {
    Write-Host "   ⚠️  Backend: Ainda iniciando..." -ForegroundColor Yellow
}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3
    Write-Host "   ✅ Frontend: ONLINE" -ForegroundColor Green
    $frontendOnline = $true
} catch {
    Write-Host "   ⚠️  Frontend: Ainda iniciando..." -ForegroundColor Yellow
}

if ($backendOnline -and $frontendOnline) {
    Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     ✅ SISTEMA PRONTO!                ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host "`n🌐 Acesse: http://localhost:3001/login" -ForegroundColor Cyan
    Write-Host "📧 Login: admin@empresa.com" -ForegroundColor White
    Write-Host "🔑 Senha: Demo123!@`n" -ForegroundColor White
    
    # Abrir navegador automaticamente
    Start-Process "http://localhost:3001/login"
} else {
    Write-Host "`n⚠️  Alguns serviços ainda estão iniciando." -ForegroundColor Yellow
    Write-Host "   Aguarde mais alguns segundos e acesse:" -ForegroundColor Gray
    Write-Host "   http://localhost:3001/login`n" -ForegroundColor Cyan
}

Write-Host "💡 IMPORTANTE: Não feche as janelas do Backend e Frontend!`n" -ForegroundColor Yellow
```

**Para usar:**
```powershell
# Na raiz do projeto:
.\iniciar-sistema.ps1
```

---

## 🛑 PARAR SERVIDORES

### Método 1: Ctrl+C nos Terminais
Pressione `Ctrl+C` em cada terminal onde os servidores estão rodando.

### Método 2: Matar Processos Node
```powershell
Stop-Process -Name node -Force
```

### Método 3: Por Porta
```powershell
# Backend (porta 3000)
$pid = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }

# Frontend (porta 3001)
$pid = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }
```

---

## 🔍 VERIFICAR STATUS

```powershell
Write-Host "`n📊 STATUS DOS SERVIÇOS`n" -ForegroundColor Cyan

# Backend
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 3
    Write-Host "✅ Backend: ONLINE (http://localhost:3000/api/v1)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: OFFLINE" -ForegroundColor Red
}

# Frontend
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3
    Write-Host "✅ Frontend: ONLINE (http://localhost:3001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: OFFLINE" -ForegroundColor Red
}

# PostgreSQL
$pg = docker ps --filter "name=postgres-canal" --format "{{.Status}}"
if ($pg -match "Up") {
    Write-Host "✅ PostgreSQL: ONLINE (postgres-canal)`n" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL: OFFLINE`n" -ForegroundColor Red
}
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Backend não inicia

**Sintomas:**
- Erro de compilação
- Porta 3000 não responde

**Soluções:**
```powershell
cd apps/backend

# 1. Limpar cache e reinstalar
Remove-Item node_modules -Recurse -Force
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
npm install

# 2. Verificar .env
# Certifique-se que existe e está configurado

# 3. Verificar banco de dados
npx prisma migrate dev

# 4. Tentar iniciar novamente
npm run dev
```

---

### Problema: Frontend não inicia

**Sintomas:**
- Erro de compilação
- Porta 3001 não responde
- Tenta usar porta 3000 (já ocupada)

**Soluções:**
```powershell
cd apps/frontend

# 1. Limpar cache
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force
npm install

# 2. Forçar porta 3001
npm run dev -- --port 3001

# 3. Se necessário, matar processo na porta 3000
$pid = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }
```

---

### Problema: PostgreSQL não está rodando

**Sintomas:**
- Backend não consegue conectar ao banco
- Erro: "Connection refused" no Prisma

**Soluções:**
```powershell
# 1. Verificar se o container existe
docker ps -a --filter "name=postgres-canal"

# 2. Iniciar o container
docker start postgres-canal

# 3. Se não existir, criar novamente
docker run -d `
  --name postgres-canal `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres123 `
  -e POSTGRES_DB=canal_denuncia `
  -p 5432:5432 `
  -v postgres-data:/var/lib/postgresql/data `
  postgres:16-alpine

# 4. Esperar iniciar
Start-Sleep -Seconds 5

# 5. Rodar migrations
cd apps/backend
npx prisma migrate dev
```

---

## 📋 CHECKLIST DE INICIALIZAÇÃO

Antes de começar a trabalhar, verifique:

- [ ] PostgreSQL está rodando (`docker ps`)
- [ ] Backend iniciado e respondendo (http://localhost:3000/api/v1)
- [ ] Frontend iniciado e respondendo (http://localhost:3001)
- [ ] Você tem 2 terminais abertos (um para cada servidor)
- [ ] Os terminais estão visíveis (não minimize!)

---

## 💡 DICAS IMPORTANTES

### 1. **Sempre use 2 terminais separados**
- Terminal 1: Backend
- Terminal 2: Frontend
- **NÃO** tente rodar ambos no mesmo terminal

### 2. **Não feche os terminais**
- Minimize, mas não feche
- Se fechar, terá que reiniciar

### 3. **Watch mode está ativo**
- Backend: Recompila automaticamente ao salvar
- Frontend: Hot reload ativo (Fast Refresh)
- Não precisa reiniciar a cada mudança

### 4. **Ordem de inicialização**
1. PostgreSQL (Docker)
2. Backend (aguardar compilar)
3. Frontend (aguardar compilar)

### 5. **Aguarde a compilação completa**
- Backend: "Application is running on..." (~10-15 segundos)
- Frontend: "Ready in Xms" (~3-5 segundos)

---

## 🎯 ATALHOS ÚTEIS

### Criar alias no PowerShell

Adicione ao seu perfil (`$PROFILE`):

```powershell
# Aliases para Canal de Denúncias
function Start-CanaldeDenuncia {
    cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"
    .\iniciar-sistema.ps1
}

function Stop-CanaldeDenuncia {
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Servidores parados" -ForegroundColor Green
}

function Status-CanaldeDenuncia {
    Write-Host "`n📊 Status:" -ForegroundColor Cyan
    try { 
        Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 2 | Out-Null
        Write-Host "✅ Backend: ONLINE" -ForegroundColor Green 
    } catch { 
        Write-Host "❌ Backend: OFFLINE" -ForegroundColor Red 
    }
    try { 
        Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 2 | Out-Null
        Write-Host "✅ Frontend: ONLINE`n" -ForegroundColor Green 
    } catch { 
        Write-Host "❌ Frontend: OFFLINE`n" -ForegroundColor Red 
    }
}

Set-Alias -Name canal-start -Value Start-CanaldeDenuncia
Set-Alias -Name canal-stop -Value Stop-CanaldeDenuncia
Set-Alias -Name canal-status -Value Status-CanaldeDenuncia
```

**Depois é só usar:**
```powershell
canal-start    # Iniciar tudo
canal-status   # Ver status
canal-stop     # Parar tudo
```

---

## 🎉 CONCLUSÃO

Com este guia, você pode:
- ✅ Iniciar os servidores rapidamente
- ✅ Verificar o status a qualquer momento
- ✅ Resolver problemas comuns
- ✅ Parar e reiniciar quando necessário

**Mantenha este arquivo aberto enquanto desenvolve!**

---

**Última atualização:** 16/10/2025 - 22:24  
**Versão:** 1.0.0
