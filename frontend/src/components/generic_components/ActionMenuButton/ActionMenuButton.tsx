import React, { useState } from "react";
import type { ColorScheme } from "../../../main";

interface ActionItem {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ActionMenuButtonProps {
    actions: ActionItem[];
    scheme: ColorScheme
}

const ActionMenuButton: React.FC<ActionMenuButtonProps> = ({ actions, scheme }) => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu((prev) => !prev);
    };

    const handleActionClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        action: ActionItem
    ) => {
        e.stopPropagation();
        action.onClick(e);
        setShowMenu(false);
    };

    return (
        <div style={{ position: "relative", flexShrink: 0 }}>
            <button
                onClick={toggleMenu}
                style={{
                    fontSize: "1.5rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "center",
                    padding: "0.2rem 0.5rem",
                }}
            >
                ⋮
            </button>

            {showMenu && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: scheme.second,
                        border: `1px solid ${scheme.third}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        zIndex: 100,
                    }}
                >
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={(e) => handleActionClick(e, action)}
                            style={{
                                padding: "0.5em 1em",
                                backgroundColor: scheme.first,
                                border: "none",
                                textAlign: "center",
                                cursor: "pointer",

                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActionMenuButton;
