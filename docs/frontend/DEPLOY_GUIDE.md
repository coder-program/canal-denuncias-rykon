# 🚀 Guia de Deploy - Canal de Denúncias

Guia completo para fazer deploy do frontend Next.js em **Vercel**, **Netlify** ou **AWS**.

---

## 📋 Índice

1. [Preparação para Deploy](#preparação-para-deploy)
2. [Deploy na Vercel (Recomendado)](#deploy-na-vercel)
3. [Deploy na Netlify](#deploy-na-netlify)
4. [Deploy na AWS (EC2 + S3)](#deploy-na-aws)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [CI/CD com GitHub Actions](#cicd-com-github-actions)

---

## 🎯 Preparação para Deploy

### 1. **Verificar package.json**

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2. **Criar .gitignore**

```bash
# .gitignore
node_modules
.next
.env.local
.env*.local
.turbo
dist
build
```

### 3. **Configurar next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Para Docker/AWS
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.seudominio.com/api/v1',
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 4. **Testar Build Localmente**

```bash
# Limpar cache
rm -rf .next

# Build de produção
npm run build

# Testar em produção
npm run start
```

---

## 🟦 Deploy na Vercel (Recomendado)

### Por que Vercel?

✅ **Otimizada para Next.js** (mesma empresa)  
✅ **Deploy automático** via Git  
✅ **CDN global** incluso  
✅ **Serverless functions** gratuitas  
✅ **SSL automático**  
✅ **Preview deployments** em PRs

### Passo a Passo

#### **1. Criar conta na Vercel**

- Acesse: https://vercel.com
- Clique em **"Sign Up"**
- Conecte com GitHub/GitLab/Bitbucket

#### **2. Conectar Repositório**

```bash
# No terminal do projeto
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Ou pela interface web:

1. Clique em **"New Project"**
2. **"Import Git Repository"**
3. Selecione o repositório `CanalDeDenuncia`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### **3. Configurar Variáveis de Ambiente**

Na dashboard da Vercel:

1. **Settings** → **Environment Variables**
2. Adicionar:

```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

3. Selecionar ambientes: **Production**, **Preview**, **Development**

#### **4. Deploy Automático**

```bash
# Commit e push
git add .
git commit -m "Deploy inicial"
git push origin main

# Vercel detecta automaticamente e faz deploy! 🎉
```

#### **5. Domínio Customizado**

1. **Settings** → **Domains**
2. Adicionar domínio: `denuncias.seudominio.com`
3. Configurar DNS (CNAME):

```
CNAME denuncias -> cname.vercel-dns.com
```

### Comandos Úteis

```bash
# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Rollback
vercel rollback

# Listar deployments
vercel ls
```

---

## 🟧 Deploy na Netlify

### Por que Netlify?

✅ **Interface simples**  
✅ **Forms e Functions** inclusos  
✅ **Deploy previews**  
✅ **SSL gratuito**  
✅ **CDN global**

### Passo a Passo

#### **1. Criar conta na Netlify**

- Acesse: https://netlify.com
- **Sign Up** com GitHub

#### **2. Método 1: Via CLI**

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Configurar
netlify init

# Deploy
netlify deploy --prod
```

#### **3. Método 2: Via Interface Web**

1. **"Add new site"** → **"Import an existing project"**
2. Conectar repositório GitHub
3. Configurar build:

```bash
Base directory: apps/frontend
Build command: npm run build
Publish directory: .next
```

4. **Deploy site**

#### **4. Configurar Variáveis de Ambiente**

1. **Site settings** → **Environment variables**
2. Adicionar:

```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

#### **5. Arquivo netlify.toml**

Criar na raiz do projeto:

```toml
# netlify.toml
[build]
  base = "apps/frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### **6. Domínio Customizado**

1. **Domain settings** → **Add custom domain**
2. Configurar DNS:

```
CNAME denuncias -> your-site.netlify.app
```

---

## 🟨 Deploy na AWS

### Opção 1: AWS Amplify (Mais Simples)

#### **1. Criar conta AWS**

- Acesse: https://aws.amazon.com
- Criar conta (cartão de crédito necessário)

#### **2. AWS Amplify Console**

1. Abrir **AWS Amplify**
2. **New app** → **Host web app**
3. Conectar repositório GitHub
4. Configurar:

```bash
Base directory: apps/frontend
Build command: npm run build
Output directory: .next
```

5. Adicionar variáveis de ambiente:

```bash
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

6. **Save and deploy**

#### **3. Domínio Customizado**

1. **Domain management** → **Add domain**
2. Configurar Route 53 ou DNS externo

### Opção 2: AWS EC2 + Docker (Avançado)

#### **1. Criar Dockerfile**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

#### **2. Criar instância EC2**

```bash
# Conectar via SSH
ssh -i sua-chave.pem ec2-user@ec2-ip-address.compute.amazonaws.com

# Instalar Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clonar repositório
git clone https://github.com/seu-usuario/CanalDeDenuncia.git
cd CanalDeDenuncia/apps/frontend

# Build Docker
docker build -t canal-denuncia-frontend .

# Rodar container
docker run -d -p 80:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1 \
  --name frontend \
  --restart always \
  canal-denuncia-frontend
```

#### **3. Configurar Nginx como Reverse Proxy**

```nginx
# /etc/nginx/conf.d/canal-denuncia.conf
server {
    listen 80;
    server_name denuncias.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **4. SSL com Let's Encrypt**

```bash
# Instalar Certbot
sudo yum install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d denuncias.seudominio.com
```

### Opção 3: AWS S3 + CloudFront (Static Export)

#### **1. Configurar exportação estática**

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

#### **2. Build e deploy**

```bash
# Build estático
npm run build

# Upload para S3
aws s3 sync out/ s3://seu-bucket-frontend --delete

# Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

---

## 🔒 Variáveis de Ambiente

### Desenvolvimento (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Produção (Plataformas)

```bash
# Backend em produção
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1

# Opcional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
```

### Como Adicionar

**Vercel:**

```bash
vercel env add NEXT_PUBLIC_API_URL
```

**Netlify:**

```bash
netlify env:set NEXT_PUBLIC_API_URL https://api.seudominio.com/api/v1
```

**AWS Amplify:**

- Console → Environment variables → Add variable

---

## 🔄 CI/CD com GitHub Actions

### Workflow para Vercel

```yaml
# .github/workflows/deploy-vercel.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: ./apps/frontend
        run: npm ci

      - name: Build
        working-directory: ./apps/frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/frontend
```

### Workflow para Netlify

```yaml
# .github/workflows/deploy-netlify.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: ./apps/frontend
        run: npm ci

      - name: Build
        working-directory: ./apps/frontend
        run: npm run build

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=apps/frontend/.next
```

---

## 📊 Comparação de Plataformas

| Recurso                  | Vercel          | Netlify         | AWS                 |
| ------------------------ | --------------- | --------------- | ------------------- |
| **Facilidade**           | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐      | ⭐⭐⭐              |
| **Custo (Free Tier)**    | 100GB bandwidth | 100GB bandwidth | 12 meses grátis     |
| **Next.js Support**      | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐        | ⭐⭐⭐⭐            |
| **CDN Global**           | ✅ Sim          | ✅ Sim          | ✅ Sim (CloudFront) |
| **SSL Automático**       | ✅ Sim          | ✅ Sim          | ⚠️ Manual           |
| **Serverless Functions** | ✅ Sim          | ✅ Sim          | ✅ Lambda           |
| **Preview Deployments**  | ✅ Sim          | ✅ Sim          | ⚠️ Manual           |
| **Custom Domain**        | ✅ Grátis       | ✅ Grátis       | ✅ Route 53         |
| **Escalabilidade**       | ⭐⭐⭐⭐        | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐          |
| **Controle Total**       | ⭐⭐⭐          | ⭐⭐⭐          | ⭐⭐⭐⭐⭐          |

---

## 🎯 Recomendações

### Use **Vercel** se:

- ✅ Quer deploy mais fácil e rápido
- ✅ Usa Next.js (otimização perfeita)
- ✅ Quer preview automático em PRs
- ✅ Não quer gerenciar infraestrutura

### Use **Netlify** se:

- ✅ Precisa de forms/functions simples
- ✅ Prefere interface amigável
- ✅ Já usa Netlify CMS

### Use **AWS** se:

- ✅ Precisa de controle total
- ✅ Quer integração com outros serviços AWS
- ✅ Tem requisitos de compliance
- ✅ Já tem infraestrutura AWS

---

## ⚠️ Checklist Pré-Deploy

- [ ] `npm run build` funciona sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Backend em produção funcionando
- [ ] CORS configurado no backend
- [ ] SSL/HTTPS habilitado
- [ ] Domínio configurado
- [ ] Analytics configurado (opcional)
- [ ] Testes E2E passando
- [ ] Performance otimizada (Lighthouse > 90)

---

## 🐛 Troubleshooting

### Build falha na Vercel

```bash
# Limpar cache
vercel --debug

# Verificar logs
vercel logs production
```

### 404 em rotas após deploy

```bash
# Verificar next.config.ts
output: 'standalone' # ou 'export'
```

### Erro de CORS

```typescript
// Backend: adicionar domínio em produção
app.enableCors({
  origin: ['https://denuncias.seudominio.com'],
  credentials: true,
});
```

---

## 🚀 Deploy Rápido (1 minuto)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd apps/frontend
vercel --prod

# 4. Configurar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL production

# ✅ Pronto! Site no ar em https://seu-app.vercel.app
```

---

**Escolha a plataforma e faça deploy! 🎉**
