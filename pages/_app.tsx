import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
          <title>Bingo Butler</title>
          <meta name="description" content="A bingo board game with Discord Bot integration" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
      </Head>
      <Component {...pageProps} />
      <footer className="footer">
        <p>kongi</p>
      </footer>
    </>
  ) 
}
export default MyApp
