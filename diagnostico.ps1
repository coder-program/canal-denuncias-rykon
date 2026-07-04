# 🔧 Script de Diagnóstico e Inicialização

## Verificar Status Atual

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO DO SISTEMA" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar processos Node.js
Write-Host "[1] Processos Node.js rodando:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Select-Object Id, ProcessName, CPU, StartTime | Format-Table
} else {
    Write-Host "   Nenhum processo Node.js encontrado" -ForegroundColor Red
}

# 2. Verificar porta 3000
Write-Host "`n[2] Porta 3000 (Backend):" -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "   Porta 3000 EM USO:" -ForegroundColor Green
    Write-Host "   $port3000" -ForegroundColor White
} else {
    Write-Host "   Porta 3000 LIVRE (Backend nao esta rodando!)" -ForegroundColor Red
}

# 3. Verificar porta 3001
Write-Host "`n[3] Porta 3001 (Frontend):" -ForegroundColor Yellow
$port3001 = netstat -ano | findstr :3001
if ($port3001) {
    Write-Host "   Porta 3001 EM USO:" -ForegroundColor Green
    Write-Host "   $port3001" -ForegroundColor White
} else {
    Write-Host "   Porta 3001 LIVRE" -ForegroundColor Yellow
}

# 4. Testar conexão com backend
Write-Host "`n[4] Testando conexão com backend:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET -ErrorAction Stop
    Write-Host "   Backend ONLINE - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Backend OFFLINE - Nao responde em http://localhost:3000/api/v1" -ForegroundColor Red
}

# 5. Verificar variável de ambiente
Write-Host "`n[5] Variavel de ambiente (.env.local):" -ForegroundColor Yellow
$envFile = "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend\.env.local"
if (Test-Path $envFile) {
    $apiUrl = Get-Content $envFile | Select-String "NEXT_PUBLIC_API_URL"
    Write-Host "   $apiUrl" -ForegroundColor White
} else {
    Write-Host "   Arquivo .env.local NAO ENCONTRADO!" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO CONCLUIDO" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
