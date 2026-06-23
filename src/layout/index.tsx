import type { ReactElement } from 'react'
import Layout from './layout'
import NestedLayout from '../components/nested-layout'
import type { NextPageWithLayout } from '@/pages/_app'
 
const Page: NextPageWithLayout = () => {
  return <p>hello world</p>
}
 
Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <NestedLayout>{page}</NestedLayout>
    </Layout>
  )
}
 
export default Page