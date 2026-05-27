import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { ClickToComponent } from 'click-to-react-component'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import dotenv from 'dotenv';
import { TabsProvider } from '@/services/contexts/tabs-context';
import { DeviceProvider } from '@/services/contexts/device-context';
import { FilterProvider } from '@/services/contexts/filter-context';
import RouteErrorBoundary from '@/components/error-boundary';
import OfflineBanner from '@/components/OfflineBanner';
import OfflineScreen from '@/components/OfflineScreen';
import useNetworkStatus from '@/hooks/useNetworkStatus';
dotenv.config();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const AUTH_ROUTES = ['/forms/login', '/forms/register'];

function AppShell({ children }: { children: ReactNode }) {
  const { isConnected, checkConnection } = useNetworkStatus();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkConnection().then(() => setInitialCheckDone(true));
  }, [checkConnection]);

  const isAuthRoute = AUTH_ROUTES.some((route) => router.pathname.startsWith(route));

  if (initialCheckDone && !isConnected) {
    if (isAuthRoute) {
      return <OfflineScreen onRetry={() => checkConnection()} />;
    }
    return (
      <>
        <OfflineBanner visible={true} />
        {children}
      </>
    );
  }

  return (
    <>
      {!isAuthRoute && <OfflineBanner visible={initialCheckDone && !isConnected} />}
      {children}
    </>
  );
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  // Suprimir el error inofensivo "Cancel rendering route" de Next.js
  useEffect(() => {
    const handleRouteError = (err: any) => {
      if (err?.message?.includes?.('Cancel rendering route')) {
        return; // Error conocido e inofensivo
      }
    };
    router.events?.on('routeChangeError', handleRouteError);
    return () => router.events?.off('routeChangeError', handleRouteError);
  }, [router]);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(
    <AppShell>
      <RouteErrorBoundary>
        <DeviceProvider>
          <FilterProvider>
            <TabsProvider>
              <ClickToComponent editor="trae" />
              <Component {...pageProps} />
            </TabsProvider>
          </FilterProvider>
        </DeviceProvider>
      </RouteErrorBoundary>
    </AppShell>
  )
}