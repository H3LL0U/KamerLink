import React, { useState } from "react";

interface ColorPickerProps {
    initialColor?: string;
    onChange: (color: string) => void;
    style?: React.CSSProperties
}

const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor = "#cccccc", onChange, style }) => {
    const [color, setColor] = useState(initialColor);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
        onChange(e.target.value);
    };

    return (
        <input
            type="color"
            value={color}
            onChange={handleChange}
            style={{
                width: "40px",
                height: "40px",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: "none",
                ...style
            }}
        />
    );
};

export default ColorPicker;