import React, { useState } from "react";
import PopUp from "../PopUp/PopUp";
import type { ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";

interface PopupButtonProps {
    text?: string;
    style?: React.CSSProperties;
    className?: string;
    colorScheme?: ColorScheme;
    children?: React.ReactNode; // content to show inside the popup
}

const PopupButton: React.FC<PopupButtonProps> = ({
    text = "❤️",
    style,
    className,
    children,
    colorScheme = defaultScheme,
}) => {
    const [showPopup, setShowPopup] = useState(false);

    const handleClick = () => {
        setShowPopup((prev) => !prev);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                style={{
                    backgroundColor: colorScheme.first, // button background
                    border: "none",
                    cursor: "pointer",
                    fontSize: "clamp(1.05rem, 1.2vw, 1.3rem)",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    borderRadius: "8px",
                    padding: "0.6em 1.6em",
                    color: "#fff", // text color can be adjusted
                    transition: "background-color 0.2s",
                    ...style,
                }}
                className={className}
                onClick={handleClick}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorScheme.third)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorScheme.first)}
            >
                {text}
            </button>

            {showPopup && (
                <PopUp
                    onClose={() => setShowPopup(false)}
                    scheme={colorScheme}
                >
                    {children}
                </PopUp>
            )}
        </div>
    );
};

export default PopupButton;
