import { Fetcher } from "openapi-typescript-fetch";
import type { paths } from "./api";
import { API_BASE_URL } from "../api";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Create the client
export const client = Fetcher.for<paths>();

/**
 * Custom hook to automatically configure the API client with Auth0 JWT.
 * Add it to every page where authorization is needed
 */

export function useAuth0ClientConfig() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) return;

    const configure = async () => {
      try {
        const token = await getAccessTokenSilently();
        configureClient(token); // set client token dynamically
      } catch (err) {
        console.error("Failed to get Auth0 token", err);
      }
    };

    configure();
  }, [isAuthenticated, getAccessTokenSilently]);
}

// Default configuration without bearer token
client.configure({
  baseUrl: API_BASE_URL,
  init: {
    headers: {},
  },
});

export function configureClient(token: string) {
  client.configure({
    baseUrl: API_BASE_URL,
    init: {
      headers: {
        Authorization: token,
      },
    },
  });
}
