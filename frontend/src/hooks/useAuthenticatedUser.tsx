import { useState, useEffect, type JSX } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { configureClient } from "../api/gen/clients";
import { getUsers, type UserInfo } from "../api/user";

import NotLoggedIn from "../pages/REPLACEMENTS/not_logged_in";
import EmailNotVerified from "../pages/REPLACEMENTS/email_not_verified";
import LoadingPage from "../pages/REPLACEMENTS/loading";
import UnexpectedError from "../pages/REPLACEMENTS/unexpected_error";
export function useAuthenticatedUser() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();

  const [accessToken, setAccessToken] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [AuthReplacement, setAuthReplacement] = useState<JSX.Element | null>(<LoadingPage />);
  const [retryCount, setRetryCount] = useState(0);

  // Determine which replacement to show
  useEffect(() => {
    if (isLoading) {
      setAuthReplacement(<LoadingPage />);
    } else if (!isAuthenticated) {
      setAuthReplacement(<NotLoggedIn />);
    } else if (!user?.email_verified) {
      setAuthReplacement(<EmailNotVerified />);
    } else if (error && retryCount >= 3) {
      // After 3 failures, fall back to EmailNotVerified
      setAuthReplacement(<UnexpectedError />);
    } else {
      setAuthReplacement(null); // User can see content
    }
  }, [isLoading, isAuthenticated, user?.email_verified, error, retryCount]);

  // Fetch access token only if user is authenticated and email verified
  useEffect(() => {
    if (!isAuthenticated || !user?.email_verified || accessToken || retryCount > 3) return;

    const fetchToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);
        configureClient(token);
      } catch (err) {
        console.error("Failed to get access token:", err);
        setError("Failed to get access token.");
      }
    };

    fetchToken();
  }, [isAuthenticated, user?.email_verified, accessToken, getAccessTokenSilently]);

  // Fetch user info with retry (max 3 times)
  useEffect(() => {
    if (!isAuthenticated || !user?.email_verified || !accessToken || userInfo) return;
    if (retryCount >= 3) return; // Stop after 3 failed attempts

    const fetchUserInfo = async () => {
      try {
        const data = (await getUsers({ type: "_Self", page: 0 })).data;
        setUserInfo(data.items[0]);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError("Failed to fetch user info.");
        setRetryCount(retryCount + 1);
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, user?.email_verified, accessToken, userInfo, retryCount]);

  return { accessToken, userInfo, AuthReplacement, error, user, setUserInfo, isAuthenticated };
}
