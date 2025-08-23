import React, { useEffect, useState } from "react";
import "./WavyWrapper.css";

type SquigglyWrapperProps = {
  children: React.ReactNode;
  side?: "left" | "right" | "both";
  wavyLineStyle?: React.CSSProperties; 
  hideBelow?: number; // new prop: screen width threshold
};

const SquigglyWrapper: React.FC<SquigglyWrapperProps> = ({
  children,
  side = "both",
  wavyLineStyle = {},
  hideBelow,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldShowLines = !hideBelow || windowWidth >= hideBelow;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {shouldShowLines && (side === "left" || side === "both") && (
        <div className="wavy-line left" style={wavyLineStyle} />
      )}

      {children}

      {shouldShowLines && (side === "right" || side === "both") && (
        <div className="wavy-line right" style={wavyLineStyle} />
      )}
    </div>
  );
};

export default SquigglyWrapper;
