import React from "react";
import type { PostTag } from "../../../api/post";

interface TagButtonProps {
    tag: PostTag;
    onSelect?: (post_tag: PostTag) => void;
    style?: React.CSSProperties;
    selectable?: boolean;   // new prop
    selected?: boolean;     // new prop
}

// Utility function to compute text color based on background brightness
const getContrastingTextColor = (backgroundColor: string): string => {
    let r = 0, g = 0, b = 0;

    if (backgroundColor.startsWith("#")) {
        const hex = backgroundColor.replace("#", "");
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    } else if (backgroundColor.startsWith("rgb")) {
        const rgbValues = backgroundColor.match(/\d+/g);
        if (rgbValues) {
            [r, g, b] = rgbValues.map(Number);
        }
    }

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "black" : "white";
};

const TagButton: React.FC<TagButtonProps> = ({ tag, onSelect, style, selectable = false, selected = false }) => {
    // If selectable and selected, override color to grey
    const backgroundColor = selectable && selected ? "#A0A0A0" : tag.color;
    const textColor = getContrastingTextColor(backgroundColor);

    return (
        <div
            style={{
                backgroundColor,
                color: textColor,
                borderRadius: "50px",
                display: "inline-block",
                borderColor: "black",
                borderStyle: "solid",
                borderWidth: "2px",
                padding: "5px 10px",
                textAlign: "center",
                cursor: "pointer",
                userSelect: "none",
                fontSize: "0.7rem",
                ...style,
            }}
            onClick={() => onSelect?.(tag)}
        >
            {tag.tag_name} ({tag.uses})
        </div>
    );
};

export default TagButton;



