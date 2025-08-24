import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { type ColorScheme } from "../../../main";

const defaultScheme = {
  first: "#041562",
  second: "#11468F",
  third: "#DA1212",
  fourth: "#EEEEEE",
};

interface LoginButtonProps {
  style?: React.CSSProperties;
  text_style?: React.CSSProperties;
  scheme?: ColorScheme;
  login_text?: string;
  logout_text?: string;
  loading_text?: string;
}

const LoginButton = ({
  scheme = defaultScheme,
  login_text = "Log in",
  logout_text = "Log out",
  loading_text = "Loading...",
  style = {},
  text_style = {},
}: LoginButtonProps) => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  const handleClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Logout with returnTo as current page
      logout({ logoutParams: { returnTo: window.location.href } });
    } else {
      // Save current page in cookie
      document.cookie = `redirect_to=${window.location.pathname}; path=/;`;

      // Trigger login redirect
      loginWithRedirect();
    }
  };

  // Decide what text to show
  const buttonText = isLoading
    ? loading_text
    : isAuthenticated
    ? logout_text
    : login_text;

  return (
    <button
      style={{ backgroundColor: scheme.second, ...style }}
      onClick={handleClick}
      disabled={isLoading} // optionally disable button while loading
    >
      <h6 style={text_style}>{buttonText}</h6>
    </button>
  );
};

export default LoginButton;
