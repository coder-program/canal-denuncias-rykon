# 🐳 LocalStack Setup - Desenvolvimento Local AWS S3

Este guia explica como configurar o **LocalStack** para simular o AWS S3 localmente durante o desenvolvimento.

---

## 📌 O que é LocalStack?

LocalStack é um emulador de serviços AWS que roda completamente localmente, permitindo desenvolvimento e testes sem precisar de uma conta AWS real.

**Benefícios:**
- ✅ **Zero custos** - Sem gastos com S3 durante desenvolvimento
- ✅ **Rápido** - Sem latência de rede para a AWS
- ✅ **Isolado** - Não afeta recursos de produção
- ✅ **Reproduzível** - Ambiente consistente entre desenvolvedores

---

## 🚀 Instalação

### Opção 1: Docker Compose (Recomendado)

Adicione ao seu `docker-compose.dev.yml`:

```yaml
services:
  # ... outros serviços ...

  localstack:
    image: localstack/localstack:latest
    container_name: canal-denuncia-localstack
    ports:
      - "4566:4566"  # Gateway único para todos os serviços
      - "4510-4559:4510-4559"  # Portas para serviços externos
    environment:
      - SERVICES=s3
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
      - DOCKER_HOST=unix:///var/run/docker.sock
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_DEFAULT_REGION=us-east-1
    volumes:
      - "./tmp/localstack:/tmp/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
    networks:
      - canal-denuncia-network
```

Suba o container:
```bash
docker-compose -f docker-compose.dev.yml up -d localstack
```

### Opção 2: LocalStack CLI

```bash
# Instalar LocalStack
pip install localstack

# Iniciar LocalStack
localstack start
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Atualize seu `.env.local` para usar o LocalStack:

```bash
# AWS S3 - LocalStack (Desenvolvimento)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=canal-denuncia-attachments
AWS_ENDPOINT=http://localhost:4566  # 🔥 Endpoint do LocalStack
S3_PRESIGNED_URL_EXPIRATION=3600
```

**⚠️ IMPORTANTE:**  
- Em **produção**, remova `AWS_ENDPOINT` para usar o S3 real da AWS
- Use credenciais reais da AWS em produção (IAM User/Role)

---

## 🪣 Criar Bucket S3

Após iniciar o LocalStack, crie o bucket:

### Usando AWS CLI:
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://canal-denuncia-attachments
```

### Usando Script Node.js:

Crie `scripts/setup-localstack.ts`:

```typescript
import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';

async function setupLocalStack() {
  const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
  });

  try {
    // Criar bucket
    await s3Client.send(new CreateBucketCommand({
      Bucket: 'canal-denuncia-attachments',
    }));
    console.log('✅ Bucket criado com sucesso');

    // Configurar CORS
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: 'canal-denuncia-attachments',
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
          },
        ],
      },
    }));
    console.log('✅ CORS configurado');
  } catch (error: any) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️  Bucket já existe');
    } else {
      console.error('❌ Erro:', error);
    }
  }
}

setupLocalStack();
```

Execute:
```bash
npx ts-node scripts/setup-localstack.ts
```

---

## 🧪 Testar Conexão

### Teste básico com AWS CLI:
```bash
# Listar buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# Enviar arquivo de teste
echo "Hello LocalStack" > test.txt
aws --endpoint-url=http://localhost:4566 s3 cp test.txt s3://canal-denuncia-attachments/

# Listar objetos no bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://canal-denuncia-attachments/
```

### Teste com API do backend:
```bash
# Enviar anexo (Postman/cURL)
curl -X POST http://localhost:3000/api/v1/attachments/complaint/<COMPLAINT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@./test-file.pdf"
```

---

## 🔍 Acessar Dashboard LocalStack (Pro)

**LocalStack Pro** oferece dashboard web:

```bash
# Instalar versão Pro (trial gratuito)
pip install localstack[pro]

# Configurar API key
export LOCALSTACK_API_KEY=your-api-key

# Acessar dashboard
open http://localhost:4566/_localstack/health
```

---

## 📂 Estrutura de Pastas S3

O S3Service organiza arquivos por pasta:

```
canal-denuncia-attachments/
├── complaints/
│   ├── <uuid>-evidence.pdf
│   ├── <uuid>-photo.jpg
│   └── ...
├── dossiers/
│   ├── <uuid>-dossier.pdf
│   └── ...
└── temp/
    └── ...
```

---

## 🧹 Limpeza

### Parar LocalStack:
```bash
docker-compose -f docker-compose.dev.yml down localstack
```

### Limpar dados persistidos:
```bash
rm -rf ./tmp/localstack
```

---

## 🚨 Troubleshooting

### Erro: `Could not connect to the endpoint URL`
**Causa:** LocalStack não está rodando  
**Solução:**
```bash
docker-compose -f docker-compose.dev.yml up -d localstack
docker logs canal-denuncia-localstack
```

### Erro: `The specified bucket does not exist`
**Causa:** Bucket não foi criado  
**Solução:**
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://canal-denuncia-attachments
```

### Erro: `SignatureDoesNotMatch`
**Causa:** Credenciais incorretas  
**Solução:** Use `test`/`test` como `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`

### Presigned URLs não funcionam
**Causa:** LocalStack usa localhost, mas aplicação está em container  
**Solução:** Use `host.docker.internal:4566` ou configure rede Docker

---

## 🔐 Migração para AWS S3 Real

Quando for para produção:

1. **Remover `AWS_ENDPOINT`** do `.env`:
```bash
# Remover esta linha:
# AWS_ENDPOINT=http://localhost:4566
```

2. **Configurar credenciais reais**:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<IAM_USER_KEY>
AWS_SECRET_ACCESS_KEY=<IAM_USER_SECRET>
AWS_S3_BUCKET=canal-denuncia-prod-attachments
```

3. **Criar bucket na AWS**:
```bash
aws s3 mb s3://canal-denuncia-prod-attachments --region us-east-1
```

4. **Configurar IAM Policy** (permissões mínimas):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::canal-denuncia-prod-attachments/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::canal-denuncia-prod-attachments"
    }
  ]
}
```

---

## 📚 Recursos

- [LocalStack Docs](https://docs.localstack.cloud/overview/)
- [AWS CLI S3 Commands](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html)
- [AWS SDK v3 for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

**🎯 Dica:** Use sempre LocalStack em desenvolvimento para economizar custos e acelerar testes!
