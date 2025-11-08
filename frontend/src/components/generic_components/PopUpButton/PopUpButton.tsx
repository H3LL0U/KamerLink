import React, { useState } from "react";
import PopUp from "../PopUp/PopUp";
import type { ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";

interface PopupButtonProps {
    text?: React.ReactElement | string;
    style?: React.CSSProperties;
    className?: string;
    colorScheme?: ColorScheme;
    children?: React.ReactNode;
}

const PopupButton: React.FC<PopupButtonProps> = ({
    text = "❤️",
    style,
    className,
    children,
    colorScheme = defaultScheme,
}) => {
    const [showPopup, setShowPopup] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setShowPopup((prev) => !prev);
    };

    return (
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
            <button
                type="button"
                style={{
                    backgroundColor: colorScheme.first,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "clamp(1.05rem, 1.2vw, 1.3rem)",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    borderRadius: "8px",
                    padding: "0.6em 1.6em",
                    color: "#fff",
                    transition: "opacity 0.2s",

                    ...style,
                }}
                className={className}
                onClick={handleClick}

                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
                {text}
            </button>

            {showPopup && (
                <PopUp onClose={() => setShowPopup(false)} scheme={colorScheme}>
                    {children}
                </PopUp>
            )}
        </div>
    );
};

export default PopupButton;
