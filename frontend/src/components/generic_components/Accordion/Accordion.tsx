import React, { useState, useRef, useEffect } from "react";
import { defaultScheme, type ColorScheme } from "../../../main";

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  scheme?: ColorScheme;
}

export function Accordion({
  title,
  children,
  style = {},
  scheme = defaultScheme,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!contentRef.current) return;

    if (isOpen) {
      const currentHeight = contentRef.current.scrollHeight + "px";
      setMaxHeight(currentHeight);
      requestAnimationFrame(() => setMaxHeight("0px"));
      setIsOpen(false);
    } else {
      const fullHeight = contentRef.current.scrollHeight + "px";
      setMaxHeight(fullHeight);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + "px");
    }
  }, [children, isOpen]);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",          // centers it
        border: `1px solid ${scheme.fourth}`,
        borderRadius: "0.5rem",
        overflow: "hidden",
        marginBottom: "0.5rem",
        backgroundColor: scheme.first,
        ...style,
      }}
    >
<button
  onClick={toggle}
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    background: scheme.second,
    color: scheme.fourth,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  <div style={{ flex: 1 }}>{title}</div>
  <span>{isOpen ? "−" : "+"}</span>
</button>

      <div
        style={{
          maxHeight,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
          background: scheme.first,
          color: scheme.fourth,
        }}
      >
        <div ref={contentRef} style={{ padding: "1rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
