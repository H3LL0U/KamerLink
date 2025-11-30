import React, { useEffect } from "react";
import LoadingPage from "./REPLACEMENTS/loading";
import { useAuth0 } from "@auth0/auth0-react";

function Redirect() {
  const { isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) return; // wait until Auth0 is ready

    // Read the redirect_to cookie
    const cookies = document.cookie.split(";").map(c => c.trim());
    const redirectCookie = cookies.find(c => c.startsWith("redirect_to="));
    let redirectPath = "/";
    if (redirectCookie) {
      const eqIndex = redirectCookie.indexOf("=");
      if (eqIndex !== -1) {
        redirectPath = redirectCookie.substring(eqIndex + 1);
      }
    }

    // Decode URI component

    redirectPath = decodeURIComponent(redirectPath);

    // Ensure redirect is internal
    if (!redirectPath.startsWith("/")) {
      redirectPath = "/";
    }

    // Remove the cookie after reading
    document.cookie = "redirect_to=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.replace(redirectPath);
  }, [isLoading]); // only runs once Auth0 is done loading

  return <LoadingPage />;
}

export default Redirect;
