import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import LoginButton from "../../components/generic_components/Buttons/LoginButton/LoginButton";
import Header from "../../components/page_components/Header/Header";
import GenericReplacement, { type GenericReplacementProps } from "./generic_replacement";


function EmailNotVerified({ scheme = defaultScheme }: GenericReplacementProps) {
  return (
    <>
      <GenericReplacement scheme={scheme} showHeader={true}>
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
            E-mail niet bevestigd
          </h1>
          <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
            Je kunt deze pagina niet bekijken omdat je e-mail niet is bevestigd.
            Controleer je inbox voor de bevestigingsmail van Auth0 en bevestig je
            e-mailadres om verder te gaan.
          </p>

        </div>
      </GenericReplacement>
    </>
  );
}

export default EmailNotVerified;