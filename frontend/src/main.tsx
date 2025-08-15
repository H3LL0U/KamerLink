import { StrictMode } from 'react'

import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
<Auth0Provider
    domain="dev-ptvxswasjjfxn7s4.us.auth0.com"
    clientId="DeboSk54X1Hg2f8hu3IIsxTntFhHri5a"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>
  </StrictMode>,
)
