import React, { useEffect } from "react";
import LoadingPage from "./REPLACEMENTS/loading";

function Redirect() {
  useEffect(() => {
    // Read the redirect_to cookie
    const cookies = document.cookie.split(";").map(c => c.trim());
    const redirectCookie = cookies.find(c => c.startsWith("redirect_to="));
    let redirectPath = redirectCookie?.split("=")[1] || "/";

    // Decode URI component
    redirectPath = decodeURIComponent(redirectPath);

    // Ensure redirect is internal
    if (!redirectPath.startsWith("/")) {
      redirectPath = "/";
    }

    // Remove the cookie after reading
    document.cookie = "redirect_to=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Redirect
    window.location.replace(redirectPath);
  }, []);

  return <LoadingPage />;
}

export default Redirect;
