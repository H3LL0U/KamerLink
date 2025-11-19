import React, { useState, useEffect, useRef } from "react";
import { defaultScheme } from "../../../main";
interface ColorScheme {
  first: string;
  second: string;
  third: string;
  fourth: string;
}



interface SideBarProps {
  children?: React.ReactNode;
  scheme?: ColorScheme;
  sidebar_offset?: string;
  onHeightChange?: (height: number) => void; // optional callback
}

const SideBar: React.FC<SideBarProps> = ({
  children,
  scheme = defaultScheme,
  sidebar_offset = "0px",
  onHeightChange,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update height when open changes
  useEffect(() => {
    if (menuRef.current && onHeightChange) {
      const rect = menuRef.current.getBoundingClientRect();
      onHeightChange(open ? rect.height : 0);
    }
  }, [open, onHeightChange]);

  return (
    <>
      {/* Button to toggle menu */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          zIndex: 21,
          height: "100%",
          aspectRatio: "1 / 1",
          minHeight: "35px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          float: "right",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.3s ease-in-out",
          userSelect: "none",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          backgroundColor: scheme.second,
          borderRadius: "8px",
        }}
        aria-label={open ? "Close settings menu" : "Open settings menu"}
        title={open ? "Close settings menu" : "Open settings menu"}
      >
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          {open ? "✖" : "☰"}
        </span>
      </button>

      {/* Sliding menu */}
      <div
        ref={menuRef}
        style={{
          position: "absolute",
          top: sidebar_offset,
          left: 0,
          opacity: open ? 1 : 0,
          width: "100vw",
          backgroundColor: scheme.first,
          transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
          zIndex: 20,
          overflow: "auto",
          transform: open ? "translateX(0)" : "translateX(-100vw)",
        }}
      >
        <div style={{ textAlign: "center" }}>{children}</div>
      </div>
    </>
  );
};

export default SideBar;
