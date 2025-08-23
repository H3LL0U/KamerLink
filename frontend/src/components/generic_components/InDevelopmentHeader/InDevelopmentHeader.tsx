import React from "react";

interface InDevelopmentProps {
  message?: string; // custom warning text
}

const InDevelopment: React.FC<InDevelopmentProps> = ({
  message = "In development",
}) => {
  return (
    <div
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        textAlign: "center",
        boxSizing: "border-box",

        // police tape stripes
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          #FFD700,
          #FFD700 20px,
          #000 20px,
          #000 40px
        )`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: "rgba(255,255,255,0.8)", 
          padding: "0.5rem 1rem",
          borderRadius: "6px",
        }}
      >
        <h3 style={{ margin: 0, color: "#000" }}>{message}</h3>
      </div>
    </div>
  );
};

export default InDevelopment;
