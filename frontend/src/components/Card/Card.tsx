import React from "react";

type CardProps = {
  title?: string;
  children?: React.ReactNode
  style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ title = "", children, style = {} }) => {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "rgba(100, 100, 100, 0.1)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "90%",
    display: "flex",
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: "column",
    margin: "5%",

    ...style,
  };

  return (
    <div style={defaultStyle}>
      <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>
      {children}
    </div>
  );
};

export default Card;