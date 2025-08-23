import React from "react";

interface TextImageProps {
  title?: React.ReactNode; // Can be string, JSX, or component
  description?: React.ReactNode; // Can be string, JSX, or component
  imageUrl?: string;
  imageAlt?: string;
  imageAlign?: "left" | "right" | "center"; // added center option
  containerStyle?: React.CSSProperties;
}

const TextImage: React.FC<TextImageProps> = ({
  title = <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Default Title</h2>,
  description = <p style={{ color: "#555" }}>Lorem ipsum</p>,
  imageUrl = "",
  imageAlt = "Image",
  imageAlign = "left",
  containerStyle = {},
}) => {
  // Decide alignment
  const justifyContent =
    imageAlign === "right"
      ? "flex-end"
      : imageAlign === "center"
      ? "center"
      : "flex-start";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1rem",
        ...containerStyle,
      }}
    >
      {/* Text section */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        {title}
        {description}
      </div>

      {/* Image section */}
      <div style={{ display: "flex", justifyContent }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: "200px",
              height: "auto",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.15)",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TextImage;
