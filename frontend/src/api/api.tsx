import type { components } from '../types/api';
export const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://infrastem-backend.onrender.com'
    : 'http://localhost:5000'; //apply production url if set
export const FRONTEND_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'infrastem.vercel.app'
    : 'http://localhost:5173/'; //apply production url if set

export const AUTH0DOMAIN ="dev-ptvxswasjjfxn7s4.us.auth0.com";
export const AUTH0CLIENT_ID="DeboSk54X1Hg2f8hu3IIsxTntFhHri5a";

type GambleTypes = "Slots";

interface Gamble {
  gamble_type: GambleTypes;
}

export async function gamble(input: components["schemas"]["Gamble"], access_token: string): Promise<components["schemas"]["GambleResults"]> {
  const response = await fetch(API_BASE_URL + '/api/gamble', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
     },
    
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Failed to gamble');

  const data = (await response.json()) as components["schemas"]["GambleResults"];
  return data;
}




