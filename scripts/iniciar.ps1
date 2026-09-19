# 🚀 Script de Inicialização - Canal de Denúncias
# Use este script após instalar Node.js e Docker

param(
    [switch]$SkipDocker,
    [switch]$ResetDatabase
)

$ErrorActionPreference = "Continue"

# Cores
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

# Banner
Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                              ║" -ForegroundColor Cyan
Write-Host "║     CANAL DE DENÚNCIAS CORPORATIVO          ║" -ForegroundColor Yellow
Write-Host "║     Sistema de Compliance & Auditoria        ║" -ForegroundColor White
Write-Host "║                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Definir caminhos (script agora vive em /scripts, raiz do projeto é um nível acima)
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot "apps\backend"
$frontendPath = Join-Path $projectRoot "apps\frontend"

# Verificar se Node.js está instalado
Write-Info "🔍 Verificando pré-requisitos..."
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Success "   ✓ Node.js: $nodeVersion"
    Write-Success "   ✓ npm: $npmVersion"
} catch {
    Write-Error "   ✗ Node.js não está instalado!"
    Write-Warning ""
    Write-Warning "Por favor, instale o Node.js primeiro:"
    Write-Warning "1. Acesse: https://nodejs.org/"
    Write-Warning "2. Baixe a versão LTS"
    Write-Warning "3. Execute o instalador"
    Write-Warning "4. Reinicie o PowerShell"
    Write-Warning ""
    Write-Warning "Consulte o GUIA-INSTALACAO-COMPLETO.md para detalhes"
    exit 1
}

# Verificar Docker (se não for pulado)
if (-not $SkipDocker) {
    Write-Info "`n🐳 Verificando Docker..."
    try {
        $dockerVersion = docker --version 2>$null
        Write-Success "   ✓ Docker: $dockerVersion"
        
        # Verificar se Docker está rodando
        docker ps >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "   ✓ Docker Engine: Rodando"
        } else {
            Write-Warning "   ⚠ Docker Engine não está rodando"
            Write-Warning "   Por favor, inicie o Docker Desktop"
            Read-Host "   Pressione Enter após iniciar o Docker Desktop"
        }
    } catch {
        Write-Warning "   ⚠ Docker não encontrado"
        Write-Warning "   O sistema funcionará sem S3 local (AWS real será usado)"
        $SkipDocker = $true
    }
}

# Verificar/instalar dependências
Write-Info "`n📦 Verificando dependências..."

# Dependências da raiz
if (-not (Test-Path "node_modules")) {
    Write-Warning "   Instalando dependências do projeto (primeira vez)..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "   ✗ Erro ao instalar dependências"
        exit 1
    }
    Write-Success "   ✓ Dependências instaladas"
} else {
    Write-Success "   ✓ Dependências já instaladas"
}

# Verificar arquivos .env
Write-Info "`n⚙️ Verificando configurações..."

# Backend .env
$backendEnv = Join-Path $backendPath ".env"
if (-not (Test-Path $backendEnv)) {
    Write-Warning "   Criando arquivo .env para o backend..."
    
    $envContent = @"
# Database
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia?schema=public"

# JWT
JWT_SECRET="dev-jwt-secret-change-in-production-minimum-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="dev-encryption-key-change-in-production"

# AWS / LocalStack
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET_NAME=canal-denuncia-attachments

# App
PORT=3000
NODE_ENV=development
"@
    
    Set-Content -Path $backendEnv -Value $envContent
    Write-Success "   ✓ Arquivo .env criado para backend"
} else {
    Write-Success "   ✓ Backend .env configurado"
}

# Frontend .env.local
$frontendEnv = Join-Path $frontendPath ".env.local"
if (-not (Test-Path $frontendEnv)) {
    Write-Warning "   Criando arquivo .env.local para o frontend..."
    
    $envContent = "NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1"
    Set-Content -Path $frontendEnv -Value $envContent
    Write-Success "   ✓ Arquivo .env.local criado para frontend"
} else {
    Write-Success "   ✓ Frontend .env.local configurado"
}

# Iniciar Docker containers
if (-not $SkipDocker) {
    Write-Info "`n🐳 Iniciando containers Docker..."
    
    docker-compose -f docker-compose.dev.yml up -d 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "   ✓ Containers iniciados"
        Write-Info "   Aguardando PostgreSQL inicializar..."
        Start-Sleep -Seconds 8
    } else {
        Write-Warning "   ⚠ Erro ao iniciar containers (continuando...)"
    }
}

# Executar migrações (se necessário)
Write-Info "`n🗄️ Verificando banco de dados..."
Push-Location $backendPath
try {
    # Verificar se precisa executar migrações
    $needsMigration = $false
    if ($ResetDatabase) {
        Write-Warning "   Resetando banco de dados..."
        npm run prisma:migrate:reset -- --force 2>$null
        $needsMigration = $true
    } else {
        # Tentar gerar cliente Prisma
        npm run prisma:generate >$null 2>&1
        
        # Verificar se banco existe
        $dbCheck = npm run prisma:migrate:status 2>&1
        if ($dbCheck -match "not found|connection refused|ECONNREFUSED") {
            Write-Warning "   Banco de dados não encontrado. Criando..."
            $needsMigration = $true
        }
    }
    
    if ($needsMigration) {
        Write-Info "   Executando migrações..."
        npm run prisma:migrate:dev --name init 2>$null
        
        Write-Info "   Carregando dados iniciais (seed)..."
        npm run db:seed 2>$null
        
        Write-Success "   ✓ Banco de dados configurado"
    } else {
        Write-Success "   ✓ Banco de dados pronto"
    }
} catch {
    Write-Warning "   ⚠ Erro ao configurar banco (pode não estar disponível)"
} finally {
    Pop-Location
}

# Limpar processos Node anteriores
Write-Info "`n🧹 Limpando processos anteriores..."
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Success "   ✓ Pronto"

# Iniciar Backend
Write-Info "`n🚀 Iniciando servidores..."
Write-Success "   ➤ Backend (porta 3000) - Nova janela"

$backendScript = @"
`$host.UI.RawUI.WindowTitle = '🔴 BACKEND - Porta 3000'
Write-Host ''
Write-Host '╔══════════════════════════════════════════════╗' -ForegroundColor Red
Write-Host '║           BACKEND - NestJS API              ║' -ForegroundColor Yellow
Write-Host '║               Porta 3000                     ║' -ForegroundColor White
Write-Host '╚══════════════════════════════════════════════╝' -ForegroundColor Red
Write-Host ''
cd '$backendPath'
npm run start:dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Aguardar backend iniciar
Write-Info "   Aguardando backend inicializar..."
Start-Sleep -Seconds 8

# Iniciar Frontend
Write-Success "   ➤ Frontend (porta 3001) - Nova janela"

$frontendScript = @"
`$host.UI.RawUI.WindowTitle = '🔵 FRONTEND - Porta 3001'
Write-Host ''
Write-Host '╔══════════════════════════════════════════════╗' -ForegroundColor Blue
Write-Host '║          FRONTEND - Next.js App             ║' -ForegroundColor Yellow
Write-Host '║               Porta 3001                     ║' -ForegroundColor White
Write-Host '╚══════════════════════════════════════════════╝' -ForegroundColor Blue
Write-Host ''
cd '$frontendPath'
npm run dev -- --port 3001
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Aguardar servidores iniciarem
Write-Info "`n⏳ Aguardando servidores iniciarem completamente..."
Write-Host "   (Isso pode levar 15-25 segundos)" -ForegroundColor Gray

Start-Sleep -Seconds 15

# Verificar status
Write-Info "`n🔍 Verificando status dos servidores..."

$backendOnline = $false
$frontendOnline = $false

# Tentar conectar ao backend
for ($i = 1; $i -le 3; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1" -TimeoutSec 3 -ErrorAction Stop
        Write-Success "   ✓ Backend: ONLINE"
        $backendOnline = $true
        break
    } catch {
        if ($i -lt 3) {
            Write-Host "   ⏳ Backend: Aguardando... (tentativa $i/3)" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        } else {
            Write-Warning "   ⚠ Backend: Ainda inicializando..."
        }
    }
}

# Tentar conectar ao frontend
for ($i = 1; $i -le 3; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3 -ErrorAction Stop
        Write-Success "   ✓ Frontend: ONLINE"
        $frontendOnline = $true
        break
    } catch {
        if ($i -lt 3) {
            Write-Host "   ⏳ Frontend: Aguardando... (tentativa $i/3)" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        } else {
            Write-Warning "   ⚠ Frontend: Ainda inicializando..."
        }
    }
}

# Resultado final
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                              ║" -ForegroundColor Green

if ($backendOnline -and $frontendOnline) {
    Write-Host "║            ✅ SISTEMA PRONTO!               ║" -ForegroundColor Yellow
    Write-Host "║                                              ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acesse o sistema:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Credenciais de teste:" -ForegroundColor Cyan
    Write-Host "   Email: admin@empresa.com" -ForegroundColor White
    Write-Host "   Senha: Demo123!@" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 URLs úteis:" -ForegroundColor Cyan
    Write-Host "   API:       http://localhost:3000/api/v1" -ForegroundColor Gray
    Write-Host "   Docs API:  http://localhost:3000/api/docs" -ForegroundColor Gray
    Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor Gray
    Write-Host ""
    
    # Abrir navegador automaticamente
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3001"
    
} else {
    Write-Host "║          ⚠ SISTEMA INICIANDO...             ║" -ForegroundColor Yellow
    Write-Host "║                                              ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Warning "Alguns serviços ainda estão iniciando."
    Write-Host "Aguarde mais 10-15 segundos e acesse:" -ForegroundColor Gray
    Write-Host "   http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "💡 Dica: " -ForegroundColor Yellow -NoNewline
Write-Host "Não feche as janelas do Backend e Frontend!" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para parar os servidores:" -ForegroundColor Yellow
Write-Host "   - Pressione Ctrl+C em cada janela" -ForegroundColor Gray
Write-Host "   - Ou feche as janelas diretamente" -ForegroundColor Gray
Write-Host ""
