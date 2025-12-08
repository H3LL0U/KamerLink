import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import GenericReplacement, { type GenericReplacementProps } from "./generic_replacement";

function NotFound({ scheme = defaultScheme, showHeader = true }: GenericReplacementProps) {
    return (
        <>
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
                        Pagina niet gevonden
                    </h1>

                    <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
                        De pagina die je probeert te bereiken bestaat niet of is verplaatst.
                        Controleer de URL of ga terug naar de startpagina.
                    </p>

                    <a
                        href="/"
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: scheme.second,
                            color: "white",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        Ga terug naar de Home-pagina
                    </a>
                </div>
            </GenericReplacement>
        </>
    );
}

export default NotFound;
