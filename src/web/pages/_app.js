import '../styles/globals.css'
import { Container } from '@mui/material'
import { AppWrapper } from './components/appState'

function MyApp({ Component, pageProps }) {
  return <AppWrapper>
    <Container sx={{ minHeight: '100vh', display: 'flex', flexFlow: 'column nowrap', padding: 0 }}>
      <Component {...pageProps} />
    </Container>
  </AppWrapper>
}

export default MyApp
