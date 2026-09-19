'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TenantBranding {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBackgroundUrl: string | null;
  customCss: string | null;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
}

interface TenantContextType {
  tenant: Tenant;
  branding: TenantBranding;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  children,
  tenant,
  branding,
}: {
  children: ReactNode;
  tenant: Tenant;
  branding: TenantBranding;
}) {
  return <TenantContext.Provider value={{ tenant, branding }}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }

  return context;
}
