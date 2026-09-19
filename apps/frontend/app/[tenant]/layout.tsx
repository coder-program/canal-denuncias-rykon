import { notFound } from 'next/navigation';
import { TenantProvider } from '@/contexts/TenantContext';
import { brandingService } from '@/lib/services/brandingService';
import './tenant-layout.css';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  // Busca dados do tenant e branding
  let tenantData;
  const { tenant: tenantSlug } = await params;

  try {
    tenantData = await brandingService.getBySlug(tenantSlug);
  } catch (error) {
    notFound();
  }

  const { tenant, branding } = tenantData;

  return (
    <html lang="pt-BR">
      <head>
        <title>{branding.companyName} - Canal de Denúncias</title>
        {branding.faviconUrl && <link rel="icon" href={branding.faviconUrl} />}

        {/* Cores customizadas via CSS Variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --tenant-primary: ${branding.primaryColor};
              --tenant-secondary: ${branding.secondaryColor};
            }
          `,
          }}
        />

        {/* CSS customizado do tenant */}
        {branding.customCss && <style dangerouslySetInnerHTML={{ __html: branding.customCss }} />}
      </head>

      <body>
        <TenantProvider tenant={tenant} branding={branding}>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}

// Gera metadata dinâmica
export async function generateMetadata({ params }: { params: { tenant: string } }) {
  try {
    const { branding } = await brandingService.getBySlug(params.tenant);

    return {
      title: `${branding.companyName} - Canal de Denúncias`,
      description: `Canal de denúncias confidencial de ${branding.companyName}`,
    };
  } catch {
    return {
      title: 'Canal de Denúncias',
    };
  }
}
