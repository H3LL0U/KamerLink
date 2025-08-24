import { StrictMode } from 'react'

import { Auth0Provider } from '@auth0/auth0-react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AUTH0CLIENT_ID, AUTH0DOMAIN } from './api/api.tsx';


export interface ColorScheme {
    first: string,
    second: string,
    third: string,
    fourth: string
}

export const defaultScheme = {
    first: "#041562",
    second: "#11468F",
    third: "#DA1212",
    fourth: "#EEEEEE"
  };


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
<Auth0Provider
    domain={AUTH0DOMAIN}
    clientId={AUTH0CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin + "/redirect",
      audience: "https://dev-ptvxswasjjfxn7s4.us.auth0.com/api/v2/",
      scope: "openid profile email"
      
    }}
  >
    <App />
  </Auth0Provider>
  </StrictMode>,
)
