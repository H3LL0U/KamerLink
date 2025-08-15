import { StrictMode } from 'react'

import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AUTH0CLIENT_ID,AUTH0DOMAIN } from './api/api.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
<Auth0Provider
    domain={AUTH0DOMAIN}
    clientId={AUTH0CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://dev-ptvxswasjjfxn7s4.us.auth0.com/api/v2/",
      scope: "openid profile email"
      
    }}
  >
    <App />
  </Auth0Provider>
  </StrictMode>,
)
