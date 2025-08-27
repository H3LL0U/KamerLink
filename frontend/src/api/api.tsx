export const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://kamerlink.onrender.com'
    : 'http://localhost:5000'; //apply production url if set
export const FRONTEND_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'infrastem.vercel.app'
    : 'http://localhost:5173/'; //apply production url if set

export const AUTH0DOMAIN ="dev-ptvxswasjjfxn7s4.us.auth0.com";
export const AUTH0CLIENT_ID="DeboSk54X1Hg2f8hu3IIsxTntFhHri5a";

