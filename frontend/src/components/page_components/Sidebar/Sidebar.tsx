import React, { useState } from "react";

interface ColorScheme {
    first: string,
    second: string,
    third: string,
    fourth: string
}


const defaultScheme = {
    first: "#041562",
    second: "#11468F",
    third: "#DA1212",
    fourth: "#EEEEEE"
  };

interface SideBarProps {
  children?: React.ReactNode;
  scheme? : ColorScheme;
  sidebar_offset?: string
}

const SideBar: React.FC<SideBarProps> = ({ children, scheme = defaultScheme, sidebar_offset = "0px" }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button to toggle menu */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position:"relative",
          zIndex: 21,
          width: "5%", // size relative to parent
          
          border: "none",
          cursor: "pointer",
          display: "flex",
          float:"right",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.3s ease-in-out", // animation for icon
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
  style={{
    position: "absolute",
    top: sidebar_offset,
    left: 0, // keep it at 0 for opacity animation
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
