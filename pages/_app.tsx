import '../styles/reset.scss'
import type { AppProps } from 'next/app'
import UI_provider, { UI_context } from '../src/context/UI_Provider'
import { Layout } from '../src/components/Layout/Layout'
import { useContext } from 'react'

export default function App({ Component, pageProps }: AppProps) {



  return (
    <UI_provider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </UI_provider>
  )
}
