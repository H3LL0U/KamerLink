import { Fetcher } from "openapi-typescript-fetch";
import type { paths } from "./api";
import { API_BASE_URL } from "../api";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";


import type { Middleware, ApiResponse } from "openapi-typescript-fetch";

/**
 * Middleware to JSON.stringify any query params that are objects.
 */
function flattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    // Special handling for Rust-style enum objects
    if (typeof value === "object" && Object.keys(value).length === 1) {
      const variantKey = Object.keys(value)[0];
      const variantValue = value[variantKey];

      // Flatten as type[Variant] = value
      result[`${key}=${variantKey}`] = variantValue;
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function withQuerySerialization<F extends (...args: any[]) => Promise<any>>(fn: F): F {
  return ((arg: any, init?: RequestInit & { headers?: Headers | Record<string, string> }) => {
    const serialized = flattenObject(arg);

    // Merge headers if init already has them
    const mergedInit: typeof init = {
      ...init,
      headers: {
        ...(init?.headers instanceof Headers
          ? Object.fromEntries(init.headers.entries())
          : init?.headers),
      },
    };

    return fn(serialized, mergedInit);
  }) as F;
}
// Create the client
export const client = Fetcher.for<paths>()



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
//client.use(stringifyObjectsMiddleware);
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


