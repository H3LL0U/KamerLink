import React, { type ReactNode } from "react";
import { type ColorScheme, defaultScheme } from "../../../main";

interface PopupProps {
  children: ReactNode;
  onClose: () => void;
  scheme?: ColorScheme;
}

function Popup({ children, onClose, scheme = defaultScheme }: PopupProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        e.stopPropagation();

        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          backgroundColor: scheme.second,
          color: scheme.fourth,
          border: `2px solid ${scheme.third}`,
          borderRadius: "10px",
          padding: "2.5rem",
          minWidth: "300px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Popup;
