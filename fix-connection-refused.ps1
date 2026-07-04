# ⚠️ Solução para ERR_CONNECTION_REFUSED

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "   ERR_CONNECTION_REFUSED" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "CAUSA DO ERRO:" -ForegroundColor Yellow
Write-Host "  O backend NestJS NAO esta rodando!" -ForegroundColor Red
Write-Host "  Frontend tenta conectar em http://localhost:3000/api/v1" -ForegroundColor White
Write-Host "  Mas nada responde nessa porta.`n" -ForegroundColor White

Write-Host "VERIFICANDO BACKEND..." -ForegroundColor Cyan

# Testar conexão
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✓ Backend ONLINE - Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nProblema resolvido! O backend esta funcionando.`n" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "  ✗ Backend OFFLINE - Nao responde`n" -ForegroundColor Red
}

Write-Host "SOLUCAO:`n" -ForegroundColor Green

Write-Host "OPCAO 1 - Script Automatico (RECOMENDADO):" -ForegroundColor Cyan
Write-Host "  .\start-complete.ps1`n" -ForegroundColor White

Write-Host "OPCAO 2 - Iniciar Backend Manualmente:" -ForegroundColor Cyan
Write-Host "  1. Abrir NOVO terminal PowerShell" -ForegroundColor White
Write-Host "  2. Executar:" -ForegroundColor White
Write-Host "`n     cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend'" -ForegroundColor Yellow
Write-Host "     npm run dev`n" -ForegroundColor Yellow
Write-Host "  3. Aguardar mensagem:" -ForegroundColor White
Write-Host "     'Application is running on: http://localhost:3000'`n" -ForegroundColor Green

Write-Host "OPCAO 3 - Verificar Problemas:" -ForegroundColor Cyan
Write-Host "  .\diagnostico.ps1`n" -ForegroundColor White

Write-Host "DESEJA EXECUTAR O SCRIPT AUTOMATICO? (S/N): " -ForegroundColor Yellow -NoNewline
$resposta = Read-Host

if ($resposta -eq 'S' -or $resposta -eq 's') {
    Write-Host "`nIniciando ambiente completo...`n" -ForegroundColor Cyan
    & "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\start-complete.ps1"
} else {
    Write-Host "`nInicie o backend manualmente e tente novamente.`n" -ForegroundColor Yellow
}
