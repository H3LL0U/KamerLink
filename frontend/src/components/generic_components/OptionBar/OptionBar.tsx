import React from "react";
import { defaultScheme, type ColorScheme } from "../../../main";

interface OptionsBarProps {
  children: React.ReactNode;
  scheme?: ColorScheme;
}

function OptionsBar({ children, scheme = defaultScheme }: OptionsBarProps) {
  return (
    <div style={{ width: "100%", backgroundColor: scheme.second }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-evenly", // distribute options evenly
          alignItems: "center",
          padding: "0.5rem 1rem",
          gap: "1rem",
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default OptionsBar;