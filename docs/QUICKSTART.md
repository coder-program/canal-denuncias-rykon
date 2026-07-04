# 🚀 Guia Rápido de Setup - 5 Minutos

## Pré-requisitos

✅ Node.js 20+ instalado  
✅ Docker Desktop rodando  
✅ Git configurado

## Passo a Passo

### 1️⃣ Clone e Instale (2 min)

```bash
git clone https://github.com/sua-org/canal-denuncia-corporativo.git
cd canal-denuncia-corporativo
npm install
```

### 2️⃣ Configure Environment (30 seg)

```bash
cd apps/backend
cp .env.example .env
```

**Edite apenas estas linhas no .env:**
```env
JWT_SECRET=seu-secret-aqui-minimo-32-caracteres
JWT_REFRESH_SECRET=seu-refresh-secret-aqui-minimo-32-chars
ENCRYPTION_KEY=sua-chave-32-chars-para-criptografia
```

### 3️⃣ Suba Infraestrutura (1 min)

```bash
cd ../..
docker-compose -f docker-compose.dev.yml up -d
```

Aguarde todos os containers ficarem healthy (~30-60 segundos).

### 4️⃣ Setup do Banco (1 min)

```bash
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
```

### 5️⃣ Inicie o Backend (30 seg)

```bash
npm run dev
```

## ✅ Pronto!

🎉 **Backend rodando:** http://localhost:3000/api/v1  
📚 **Swagger Docs:** http://localhost:3000/api/v1/docs  
🗄️ **Prisma Studio:** `npm run prisma:studio` (em outro terminal)

## 🧪 Teste Rápido com cURL

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@empresa.com",
    "password": "Senha123!",
    "fullName": "Usuario Teste"
  }'

# Copie o accessToken da resposta e teste:
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

## 🐛 Troubleshooting

**Erro de conexão com banco?**
```bash
docker-compose -f docker-compose.dev.yml ps
# Verifique se postgres está "healthy"
```

**Porta 3000 já em uso?**
```bash
# Altere PORT=3001 no .env
```

**Prisma não gera client?**
```bash
cd apps/backend
npx prisma generate --schema=./prisma/schema.prisma
```

## 📞 Ajuda

- Documentação completa: [README.md](../README.md)
- Issues: https://github.com/sua-org/canal-denuncia-corporativo/issues
