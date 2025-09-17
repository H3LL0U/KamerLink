import { useState, useEffect, type JSX } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { configureClient } from "../api/gen/clients";
import { getUsers, type UserInfo } from "../api/user";

import NotLoggedIn from "../pages/REPLACEMENTS/not_logged_in";
import EmailNotVerified from "../pages/REPLACEMENTS/email_not_verified";
import LoadingPage from "../pages/REPLACEMENTS/loading";

export function useAuthenticatedUser() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();

  const [accessToken, setAccessToken] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [AuthReplacement, setAuthReplacement] = useState<JSX.Element | null>(<LoadingPage />);

  // Determine replacement component once on relevant changes
  useEffect(() => {
    if (isLoading) {
      setAuthReplacement(<LoadingPage />);
    } else if (!isAuthenticated) {
      setAuthReplacement(<NotLoggedIn />);
    } else if (isAuthenticated && user && !user.email_verified) {

      setAuthReplacement(<EmailNotVerified />);
    } else {
      setAuthReplacement(null); // user can see page content
    }
  }, [isLoading, isAuthenticated, user?.email_verified]);

  // Fetch access token once
  useEffect(() => {
    if (!isAuthenticated || accessToken) return;

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
  }, [isAuthenticated, accessToken, getAccessTokenSilently]);

  // Fetch user info once
  useEffect(() => {
    if (!isAuthenticated || !accessToken || userInfo) return;

    const fetchUserInfo = async () => {
      try {
        const data = (await getUsers({ type: "_Self", page: 0 })).data;
        setUserInfo(data.items[0]);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError("Failed to fetch user info.");
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, accessToken, userInfo]);

  return { accessToken, userInfo, AuthReplacement, error, user, setUserInfo, isAuthenticated };
}
