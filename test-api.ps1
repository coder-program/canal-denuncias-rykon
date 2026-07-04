# Script de Testes de API - Canal de Denuncia
# Versao simples sem emojis

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "TESTES DE API - CANAL DE DENUNCIA" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/v1"
$ErrorCount = 0
$SuccessCount = 0

# 1. TESTE: Login Admin
Write-Host "`n[TESTE 1] Login com Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@empresa.com"
        password = "Demo123!@"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $response.accessToken
    Write-Host "SUCCESS - Token obtido" -ForegroundColor Green
    Write-Host "User: $($response.user.fullName) | Role: $($response.user.role)" -ForegroundColor Gray
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
    exit 1
}

# Headers para requests autenticados
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. TESTE: Obter perfil
Write-Host "`n[TESTE 2] GET /auth/me..." -ForegroundColor Yellow
try {
    $me = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "SUCCESS - Usuario: $($me.fullName)" -ForegroundColor Green
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 3. TESTE: Listar denuncias
Write-Host "`n[TESTE 3] GET /complaints..." -ForegroundColor Yellow
try {
    $complaints = Invoke-RestMethod -Uri "$baseUrl/complaints" -Method GET -Headers $headers
    Write-Host "SUCCESS - Total: $($complaints.meta.total) denuncias" -ForegroundColor Green
    $SuccessCount++
    
    if ($complaints.data.Count -gt 0) {
        $firstComplaint = $complaints.data[0]
        $complaintId = $firstComplaint.id
        Write-Host "Primeira denuncia ID: $complaintId | Protocolo: $($firstComplaint.protocol)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 4. TESTE: Obter estatisticas
Write-Host "`n[TESTE 4] GET /complaints/stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/complaints/stats" -Method GET -Headers $headers
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host "Total: $($stats.total) | Pendentes: $($stats.pending) | Em Analise: $($stats.inProgress)" -ForegroundColor Gray
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 5. TESTE: Criar nova denuncia
Write-Host "`n[TESTE 5] POST /complaints - Criar denuncia..." -ForegroundColor Yellow
try {
    $newComplaint = @{
        isAnonymous = $false
        type = "HARASSMENT"
        title = "Teste Automatizado de Criacao de Denuncia"
        description = "Esta e uma denuncia criada pelo script de testes automatizados para validar o endpoint de criacao. A descricao precisa ter no minimo 50 caracteres para passar na validacao do DTO do backend conforme especificado nas regras de negocio."
        priority = "HIGH"
        location = "Setor TI - Sala 305"
        involvedPeople = @("Joao Silva", "Maria Santos")
        witnesses = @("Pedro Costa")
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "$baseUrl/complaints" -Method POST -Body $newComplaint -Headers $headers
    $newComplaintId = $created.id
    Write-Host "SUCCESS - Nova denuncia criada: $newComplaintId" -ForegroundColor Green
    Write-Host "Protocolo: $($created.protocol)" -ForegroundColor Gray
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 6. TESTE: Obter detalhes da denuncia criada
if ($newComplaintId) {
    Write-Host "`n[TESTE 6] GET /complaints/$newComplaintId..." -ForegroundColor Yellow
    try {
        $detail = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId" -Method GET -Headers $headers
        Write-Host "SUCCESS - Denuncia: $($detail.title)" -ForegroundColor Green
        Write-Host "Status: $($detail.status) | Tipo: $($detail.type)" -ForegroundColor Gray
        $SuccessCount++
    }
    catch {
        Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 7. TESTE MODAL: Mudar status para UNDER_REVIEW
if ($newComplaintId) {
    Write-Host "`n[TESTE 7] MODAL: Mudar Status -> UNDER_REVIEW..." -ForegroundColor Magenta
    try {
        $statusChange = @{
            status = "UNDER_REVIEW"
            reason = "Denuncia recebida e em processo de analise preliminar. Investigacao iniciada."
        } | ConvertTo-Json
        
        $updated = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId/status" -Method PATCH -Body $statusChange -Headers $headers
        Write-Host "SUCCESS - Status alterado para: $($updated.status)" -ForegroundColor Green
        $SuccessCount++
    }
    catch {
        Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 8. TESTE MODAL: Mudar status para RESOLVED (com notas obrigatorias)
if ($newComplaintId) {
    Write-Host "`n[TESTE 8] MODAL: Mudar Status -> RESOLVED (com notas)..." -ForegroundColor Magenta
    try {
        $resolveChange = @{
            status = "RESOLVED"
            reason = "Caso resolvido apos investigacao completa. Medidas disciplinares foram aplicadas conforme politica interna."
        } | ConvertTo-Json
        
        $resolved = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId/status" -Method PATCH -Body $resolveChange -Headers $headers
        Write-Host "SUCCESS - Status alterado para: $($resolved.status)" -ForegroundColor Green
        $SuccessCount++
    }
    catch {
        Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 9. TESTE VALIDACAO: Tentar RESOLVED sem reason (deve falhar)
if ($newComplaintId) {
    Write-Host "`n[TESTE 9] VALIDACAO: RESOLVED sem reason (deve falhar)..." -ForegroundColor Yellow
    try {
        $invalidResolve = @{
            status = "RESOLVED"
            reason = ""
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId/status" -Method PATCH -Body $invalidResolve -Headers $headers
        Write-Host "FALHOU - Deveria ter rejeitado mas aceitou!" -ForegroundColor Red
        $ErrorCount++
    }
    catch {
        Write-Host "SUCCESS - Validacao funcionou (rejeitou corretamente)" -ForegroundColor Green
        $SuccessCount++
    }
}

# 10. TESTE: Listar investigadores
Write-Host "`n[TESTE 10] GET /users (investigadores)..." -ForegroundColor Yellow
try {
    $investigators = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
    Write-Host "SUCCESS - Total de usuarios: $($investigators.Count)" -ForegroundColor Green
    
    if ($investigators.Count -gt 0) {
        $investigatorId = $investigators[0].id
        Write-Host "Primeiro usuario: $($investigators[0].fullName) | Role: $($investigators[0].role)" -ForegroundColor Gray
    }
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 11. TESTE MODAL: Atribuir investigador
if ($newComplaintId -and $investigatorId) {
    Write-Host "`n[TESTE 11] MODAL: Atribuir Investigador..." -ForegroundColor Magenta
    try {
        $assigned = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId/assign/$investigatorId" -Method PATCH -Headers $headers
        Write-Host "SUCCESS - Investigador atribuido: $($assigned.investigatorId)" -ForegroundColor Green
        $SuccessCount++
    }
    catch {
        Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 12. TESTE: Verificar atribuicao
if ($newComplaintId) {
    Write-Host "`n[TESTE 12] Verificar atribuicao..." -ForegroundColor Yellow
    try {
        $check = Invoke-RestMethod -Uri "$baseUrl/complaints/$newComplaintId" -Method GET -Headers $headers
        if ($check.investigatorId -eq $investigatorId) {
            Write-Host "SUCCESS - Investigador foi atribuido corretamente" -ForegroundColor Green
            $SuccessCount++
        }
        else {
            Write-Host "FALHOU - Investigador nao foi atribuido" -ForegroundColor Red
            $ErrorCount++
        }
    }
    catch {
        Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# 13. TESTE: Login como Investigador
Write-Host "`n[TESTE 13] Login como Investigador..." -ForegroundColor Yellow
try {
    $invLogin = @{
        email = "investigador@empresa.com"
        password = "Demo123!@"
    } | ConvertTo-Json
    
    $invResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $invLogin -ContentType "application/json"
    Write-Host "SUCCESS - Investigador logado: $($invResponse.user.fullName)" -ForegroundColor Green
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 14. TESTE: Filtro por status
Write-Host "`n[TESTE 14] Filtro por status (PENDING)..." -ForegroundColor Yellow
try {
    $filtered = Invoke-RestMethod -Uri "$baseUrl/complaints?status=PENDING" -Method GET -Headers $headers
    Write-Host "SUCCESS - Denuncias pendentes: $($filtered.meta.total)" -ForegroundColor Green
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# 15. TESTE: Paginacao
Write-Host "`n[TESTE 15] Paginacao (5 itens)..." -ForegroundColor Yellow
try {
    $paginated = Invoke-RestMethod -Uri "$baseUrl/complaints?page=1&limit=5" -Method GET -Headers $headers
    Write-Host "SUCCESS - Pagina 1 com $($paginated.data.Count) itens" -ForegroundColor Green
    Write-Host "Total: $($paginated.meta.total) | Paginas: $($paginated.meta.totalPages)" -ForegroundColor Gray
    $SuccessCount++
}
catch {
    Write-Host "FALHOU - $($_.Exception.Message)" -ForegroundColor Red
    $ErrorCount++
}

# RELATORIO FINAL
Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "RELATORIO FINAL" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$TotalTests = $SuccessCount + $ErrorCount
$SuccessRate = if ($TotalTests -gt 0) { [math]::Round(($SuccessCount / $TotalTests) * 100, 2) } else { 0 }

Write-Host "`nTotal de Testes: $TotalTests" -ForegroundColor White
Write-Host "Sucessos:        $SuccessCount" -ForegroundColor Green
Write-Host "Falhas:          $ErrorCount" -ForegroundColor $(if ($ErrorCount -eq 0) { "Green" } else { "Red" })
Write-Host "Taxa de Sucesso: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -eq 100) { "Green" } else { "Yellow" })

if ($ErrorCount -eq 0) {
    Write-Host "`n*** TODOS OS TESTES PASSARAM! ***" -ForegroundColor Green
    Write-Host "Sistema funcionando perfeitamente!" -ForegroundColor Green
}
else {
    Write-Host "`n*** ALGUNS TESTES FALHARAM ***" -ForegroundColor Yellow
    Write-Host "Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host "`nCredenciais de Teste:" -ForegroundColor Cyan
Write-Host "  Admin:        admin@empresa.com / Demo123!@"
Write-Host "  Investigador: investigador@empresa.com / Demo123!@"
Write-Host "  Denunciante:  denunciante@empresa.com / Demo123!@"
Write-Host "  Auditor:      auditor@empresa.com / Demo123!@"

Write-Host "`nURLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  Backend:  http://localhost:3000/api/v1"
Write-Host "  Swagger:  http://localhost:3000/api/v1/docs"

if ($newComplaintId) {
    Write-Host "`nDenuncia criada para testes: $newComplaintId" -ForegroundColor Gray
    Write-Host "Para deletar: DELETE /complaints/$newComplaintId" -ForegroundColor Gray
}

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
