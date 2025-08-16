import React, { useState, useEffect } from "react";

interface TitledNavbarProps {
  buttons: string[];
  onClick?: (buttonName: string) => void;
  navStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  separatorStyle?: React.CSSProperties;
  collapseWidth?: number; // viewport width breakpoint to collapse (default 600)
}

const TitledNavbar: React.FC<TitledNavbarProps> = ({
  buttons,
  onClick,
  navStyle = {},
  buttonStyle = {},
  separatorStyle = {},
  collapseWidth = 1000,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < collapseWidth);
    };

    handleResize(); // check initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapseWidth]);

  const renderSeparator = () => (
    <div
      style={{
        ...defaultStyles.separator,
        ...separatorStyle,
        flexGrow: collapsed ? 0 : 1,
        width: collapsed ? "100%" : undefined,
        margin: collapsed ? "5px 0" : "0 5px",
        height: collapsed ? 2 : 40,
        transform: collapsed ? "none" : "skew(-20deg)",
      }}
    />
  );

  return (
    <nav
      style={{
        ...defaultStyles.nav,
        flexDirection: collapsed ? "column" : "row",
        ...navStyle,
      }}
    >
      {/* Leading separator */}
      {renderSeparator()}

      {buttons.map((btn, _index) => (
        <React.Fragment key={btn}>
          <button
            style={{
              ...defaultStyles.button,
              ...buttonStyle,
              width: collapsed ? "100%" : undefined,
            }}
            onClick={() => onClick && onClick(btn)}
          >
            {btn}
          </button>
          {/* Trailing separator */}
          {renderSeparator()}
        </React.Fragment>
      ))}
    </nav>
  );
};

const defaultStyles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    padding: "0 10px",
    gap: 0,
  } as React.CSSProperties,
  button: {
    background: "transparent",
    border: "none",
    color: "#fff",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "1.5em",
    fontWeight: 600,
    position: "relative" as "relative",
    zIndex: 1,
    flexShrink: 0,
  } as React.CSSProperties,
  separator: {
    backgroundColor: "#444",
    zIndex: 0,
  } as React.CSSProperties,
};

export default TitledNavbar;
