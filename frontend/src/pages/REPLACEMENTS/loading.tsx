import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import Header from "../../components/page_components/Header/Header";
import type { GenericReplacementProps } from "./generic_replacement";
import GenericReplacement from "./generic_replacement";
function LoadingSpinner({ scheme }: { scheme: ColorScheme }) {
  return (
    <div
      style={{
        border: `4px solid ${scheme.fourth}`,
        borderTop: `4px solid ${scheme.third}`,
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}

export default function LoadingPage({ scheme = defaultScheme, showHeader = true }: GenericReplacementProps) {
  return (
    <>
      <GenericReplacement showHeader={showHeader} scheme={scheme}>

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
          <h1 style={{ marginBottom: "1rem", color: scheme.third }}>Laden...</h1>
          <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
            De pagina wordt geladen. Even geduld alstublieft.
          </p>

          <LoadingSpinner scheme={scheme} />
        </div>

        {/* One-time animation definition */}
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
      </GenericReplacement>
    </>
  );
}
