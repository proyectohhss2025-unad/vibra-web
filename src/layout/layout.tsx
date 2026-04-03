import Footer from '../components/layouts/footer/footer'
import Navbar from '../components/navbar'
 
export default function Layout({ children }: any) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}