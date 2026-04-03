import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { ClickToComponent } from 'click-to-react-component'

import dotenv from 'dotenv';
import { TabsProvider } from '@/services/contexts/tabs-context';
import { DeviceProvider } from '@/services/contexts/device-context';
import { FilterProvider } from '@/services/contexts/filter-context';
dotenv.config();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(
    <DeviceProvider>
      <FilterProvider>
        <TabsProvider>
          <ClickToComponent editor="trae" />
          <Component {...pageProps} />
        </TabsProvider>
      </FilterProvider>
    </DeviceProvider >
  )
}