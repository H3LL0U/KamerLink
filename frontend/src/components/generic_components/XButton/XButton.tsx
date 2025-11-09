import React from "react";

interface CancelButtonProps {
    onClick: () => void;
    color?: string;
    size?: string | number;
    style?: React.CSSProperties;
}

const CancelButton: React.FC<CancelButtonProps> = ({
    onClick,
    color = "#888",
    size = "1.5rem",
    style = {},
}) => {
    return (
        <button
            onClick={onClick}
            style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                color,
                fontSize: size,
                cursor: "pointer",
                fontWeight: 700,
                lineHeight: 1,
                padding: "0 0.25rem",
                ...style,
            }}
            aria-label="Cancel"
        >
            ×
        </button>
    );
};

export default CancelButton;
