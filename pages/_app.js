import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import Fondo from '../components/Fondo'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Ruta Local — Descubre los negocios de cada municipio de Colombia</title>
        <meta name="description" content="Encuentra hoteles, restaurantes, glamping, artesanías y más en cualquier municipio de Colombia. Apoya el comercio local." />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <Fondo />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </>
  )
}
