# 🚀 SOLUÇÃO RÁPIDA - ERR_CONNECTION_REFUSED

## ⚡ Execute Este Comando (Copie e Cole):

```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia"; Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 3; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend'; Write-Host 'BACKEND - Porta 3000' -ForegroundColor Green; npm run dev"; Start-Sleep -Seconds 15; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend'; Write-Host 'FRONTEND - Porta 3001' -ForegroundColor Cyan; npm run dev -- -p 3001"; Start-Sleep -Seconds 10; Start-Process "http://localhost:3001/login"
```

---

## 📦 Ou Execute o Arquivo .bat (Mais Fácil):

```cmd
INICIAR.bat
```

Duplo clique em `INICIAR.bat` na raiz do projeto.

---

## 🔧 Ou Manualmente (2 Terminais):

### Terminal 1 - Backend
```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\backend"
npm run dev
```

### Terminal 2 - Frontend  
```powershell
cd "C:\Users\maugu\OneDrive\Documentos\Projeto programação\CanalDeDenuncia\apps\frontend"
npm run dev -- -p 3001
```

### Abrir Navegador
```
http://localhost:3001/login
```

---

## ✅ Verificar se Funcionou

**Backend deve mostrar:**
```
[Nest] Application is running on: http://localhost:3000
```

**Frontend deve mostrar:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3001
```

**Login:**
- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## 🐛 Se ainda der erro:

### Verificar se PostgreSQL está rodando:
```powershell
Get-Service -Name postgresql*
```

Se estiver parado:
```powershell
Start-Service postgresql-x64-14
```

### Verificar .env do backend:
```powershell
Get-Content "apps\backend\.env"
```

Deve ter `DATABASE_URL` configurado.

---

**Escolha uma opção e execute!** 🚀
