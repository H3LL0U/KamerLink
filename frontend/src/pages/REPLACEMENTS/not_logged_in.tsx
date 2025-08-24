import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import LoginButton from "../../components/generic_components/LoginButton/LoginButton";
import Header from "../../components/page_components/Header/Header";
interface NotLoggedInProps {
  scheme?: ColorScheme;
}

function NotLoggedIn({ scheme = defaultScheme }: NotLoggedInProps) {
  return (
    <>
    <Header></Header>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: scheme.first,
        color: scheme.fourth,
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ marginBottom: "1rem", color: scheme.third }}>
        Geen toegang
      </h1>
      <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
        Je hebt geen toegang tot deze pagina omdat je niet bent ingelogd.
        Log in om verder te gaan.
      </p>
      <LoginButton />
    </div>
    </>
  );
}

export default NotLoggedIn;
