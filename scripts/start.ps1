# Script Simplificado para Iniciar o Projeto
# Canal de Denuncias

# Script agora vive em /scripts; garantir que os comandos relativos rodem a partir da raiz do repo
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "`n=== INICIANDO CANAL DE DENUNCIAS ===" -ForegroundColor Cyan

# Atualizar PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Limpar processos node anteriores
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Verificar e instalar dependencias
Write-Host "`nInstalando dependencias..." -ForegroundColor Yellow
npm install

# Iniciar Docker containers
Write-Host "`nIniciando Docker containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d 2>$null
Start-Sleep -Seconds 5

# Configurar backend
Write-Host "`nConfigurando backend..." -ForegroundColor Yellow
cd apps\backend

# Criar .env se nao existir
if (-not (Test-Path ".env")) {
    @"
DATABASE_URL="postgresql://denuncia_user:secure_password@localhost:5432/canal_denuncia?schema=public"
JWT_SECRET="dev-jwt-secret-change-in-production-minimum-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
ENCRYPTION_KEY="dev-encryption-key-change-in-production"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
S3_BUCKET_NAME=canal-denuncia-attachments
PORT=3000
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Arquivo .env criado" -ForegroundColor Green
}

# Executar migracoes
Write-Host "`nExecutando migracoes do banco..." -ForegroundColor Yellow
npm run prisma:generate 2>$null
npm run prisma:migrate:dev --name init 2>$null
npm run db:seed 2>$null

# Configurar frontend
cd ..\frontend

if (-not (Test-Path ".env.local")) {
    "NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1" | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "Arquivo .env.local criado" -ForegroundColor Green
}

cd ..\..

# Iniciar Backend
Write-Host "`nIniciando Backend (nova janela)..." -ForegroundColor Green
$backendPath = "$PWD\apps\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run start:dev"

Start-Sleep -Seconds 5

# Iniciar Frontend
Write-Host "Iniciando Frontend (nova janela)..." -ForegroundColor Green
$frontendPath = "$PWD\apps\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev -- --port 3001"

Write-Host "`n=== AGUARDE 20 SEGUNDOS ===" -ForegroundColor Yellow
Write-Host "Os servidores estao iniciando..." -ForegroundColor Gray
Start-Sleep -Seconds 20

Write-Host "`n=== SISTEMA INICIADO ===" -ForegroundColor Green
Write-Host "`nAcesse: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Login: admin@empresa.com" -ForegroundColor White
Write-Host "Senha: Demo123!@`n" -ForegroundColor White

Start-Process "http://localhost:3001"
