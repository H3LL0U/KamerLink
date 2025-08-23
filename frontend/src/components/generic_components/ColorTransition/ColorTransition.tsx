import React from "react";

function ColorTransition({ from, to ,height ="50px", style = {}}: { from: string; to: string, height?:string, style?:React.CSSProperties }) {
    return (
      <div
        className="fuzzy-transition"
        style={{
          width: "100%",
          background: `linear-gradient(to bottom, ${from}, ${to})`,
          height: `${height}`,
          ...style
        }}
      />
    );
  }
  
  export default ColorTransition;