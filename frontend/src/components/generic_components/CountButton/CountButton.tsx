import React from "react";

interface LikeButtonProps {
    likes: number;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    emoji?: string | React.ReactNode;
}

const CountButton: React.FC<LikeButtonProps> = ({ likes, onClick, style, className, children, emoji = "❤️" }) => {
    return (
        <button
            style={{
                backgroundColor: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "clamp(1.05rem, 1.2vw, 1.3rem)",
                fontFamily: 'inherit',
                fontWeight: 500,
                borderRadius: '8px',
                padding: '0.8em 1.2em',
                ...style,
            }}
            className={className}
            onClick={onClick}
        >
            {children ? children : <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
            }}>
                {emoji} {likes}
            </div>}
        </button>
    );
};

export default CountButton;
