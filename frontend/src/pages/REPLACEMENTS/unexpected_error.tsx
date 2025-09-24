import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import Header from "../../components/page_components/Header/Header";

interface UnexpectedErrorProps {
  scheme?: ColorScheme;
}

function UnexpectedError({ scheme = defaultScheme }: UnexpectedErrorProps) {
  return (
    <>
      <Header />
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
          Onverwachte fout
        </h1>
        <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
          Er is een onverwachte fout opgetreden. Probeer de pagina te
          vernieuwen of kom later terug.
        </p>
      </div>
    </>
  );
}

export default UnexpectedError;
