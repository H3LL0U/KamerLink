import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import GenericReplacement from "./generic_replacement";
import type { GenericReplacementProps } from "./generic_replacement";

function InvalidEmail({
  scheme = defaultScheme,
  showHeader = true,
}: GenericReplacementProps) {
  return (
    <GenericReplacement scheme={scheme} showHeader={showHeader}>
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
          Ongeldig e-mailadres
        </h1>

        <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
          Het lijkt erop dat je geen school-e-mailadres hebt gebruikt om je te registreren.
          Gebruik een geldig school-e-mailadres om toegang te krijgen.
        </p>

        <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
          Bekijk onze gids voor instructies over hoe je je kunt registreren:{" "}
          <a
            href="/vragen/#register"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: scheme.third, textDecoration: "underline" }}
          >
            Registratiehandleiding
          </a>
        </p>
      </div>
    </GenericReplacement>
  );
}

export default InvalidEmail;
