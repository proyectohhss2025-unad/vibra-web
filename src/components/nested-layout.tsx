import Footer from './layouts/footer/footer'
import Navbar from './navbar'
 
export default function NestedLayout({ children }: any) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}