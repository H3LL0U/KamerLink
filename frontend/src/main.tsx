import { StrictMode, useState } from 'react'

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

const kamerlinghOnnesScheme = {
  first: "#3f6693",
  second: "#5a86acff", //#90abc3 was the original color, but a more saturated color is better for text
  third: "#ffd854",
  fourth: "#e5e9ef"
}

export const kamerlinkScheme = {
  first: "#041562",
  second: "#11468F",
  third: "#DA1212",
  fourth: "#EEEEEE"
};

export const darkScheme = {
  first: "#121212",
  second: "#313030ff",
  third: "#DA1212",
  fourth: "#E0E0E0"
};

export const nameToScheme = new Map<string, ColorScheme>([
  ["dark", darkScheme],
  ["kamerlink", kamerlinkScheme],
  ["default", kamerlinghOnnesScheme],
]);

const schemeToName = new Map<ColorScheme, string>(
  Array.from(nameToScheme.entries()).map(([name, scheme]) => [scheme, name])
);


export const getColorScheme = () => {
  const theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];

  const scheme = nameToScheme.get(theme ?? "default")
  if (scheme) {
    return scheme
  }
  return kamerlinghOnnesScheme
};

export const defaultScheme = getColorScheme();



export const changeScheme = (scheme: ColorScheme) => {
  const schemeName = schemeToName.get(scheme)
  if (schemeName) {
    document.cookie = `theme=${schemeName}; path=/;`;
  }
  else {
    document.cookie = `theme=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
  if (scheme !== defaultScheme) {
    window.location.reload();
  }

}



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
