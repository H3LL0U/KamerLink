import React from "react";

interface LikeButtonProps {
    likes: number;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    emoji?: string;
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
                padding: '0.6em 1.6em',
                ...style,
            }}
            className={className}
            onClick={onClick}
        >
            {children ? children : <>{emoji} {likes}</>}
        </button>
    );
};

export default CountButton;
