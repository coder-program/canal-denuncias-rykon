/**
 * Script de Setup do LocalStack
 * 
 * Este script configura o LocalStack para desenvolvimento local:
 * - Cria bucket S3
 * - Configura CORS
 * - Lista recursos criados
 */

import { 
  S3Client, 
  CreateBucketCommand, 
  PutBucketCorsCommand,
  ListBucketsCommand,
  HeadBucketCommand 
} from '@aws-sdk/client-s3';

const BUCKET_NAME = 'canal-denuncia-attachments';
const LOCALSTACK_ENDPOINT = 'http://localhost:4566';

async function setupLocalStack() {
  console.log('🚀 Iniciando setup do LocalStack...\n');

  const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: LOCALSTACK_ENDPOINT,
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true, // Necessário para LocalStack
  });

  try {
    // 1. Verificar se bucket já existe
    console.log('🔍 Verificando se bucket já existe...');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket '${BUCKET_NAME}' já existe\n`);
    } catch (error: any) {
      if (error.name === 'NotFound') {
        // 2. Criar bucket
        console.log(`📦 Criando bucket '${BUCKET_NAME}'...`);
        await s3Client.send(new CreateBucketCommand({
          Bucket: BUCKET_NAME,
        }));
        console.log(`✅ Bucket '${BUCKET_NAME}' criado com sucesso\n`);
      } else {
        throw error;
      }
    }

    // 3. Configurar CORS
    console.log('🌐 Configurando CORS...');
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }));
    console.log('✅ CORS configurado com sucesso\n');

    // 4. Listar buckets
    console.log('📋 Listando todos os buckets...');
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    console.log('Buckets disponíveis:');
    Buckets?.forEach((bucket) => {
      console.log(`  - ${bucket.Name} (criado em ${bucket.CreationDate})`);
    });

    console.log('\n✅ Setup do LocalStack concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Configure .env.local com AWS_ENDPOINT=http://localhost:4566');
    console.log('  2. Inicie o backend: npm run start:dev');
    console.log('  3. Teste o upload: POST /api/v1/attachments/complaint/:id\n');

  } catch (error: any) {
    console.error('❌ Erro ao configurar LocalStack:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Certifique-se de que o LocalStack está rodando:');
      console.error('   docker-compose -f docker-compose.dev.yml up -d localstack\n');
    }
    
    process.exit(1);
  }
}

// Executar script
setupLocalStack();
