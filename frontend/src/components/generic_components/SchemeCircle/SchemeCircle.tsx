import React from "react";
import { type ColorScheme } from "../../../main";

interface SchemeCircleProps {
    scheme: ColorScheme;
    size?: number; // diameter of the circle in pixels
    onClick?: () => void; // optional click handler
}

const SchemeCircle: React.FC<SchemeCircleProps> = ({ scheme, size = 100, onClick }) => {
    const radius = size / 2;
    const center = radius;

    // Function to create an SVG path for a quarter circle
    const quarterPath = (startAngle: number, color: string) => {
        const endAngle = startAngle + 90;
        const rad = (angle: number) => (angle * Math.PI) / 180;
        const x1 = center + radius * Math.cos(rad(startAngle));
        const y1 = center + radius * Math.sin(rad(startAngle));
        const x2 = center + radius * Math.cos(rad(endAngle));
        const y2 = center + radius * Math.sin(rad(endAngle));

        return (
            <path
                d={`M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 0 1 ${x2},${y2} Z`}
                fill={color}
            />
        );
    };

    return (
        <svg
            width={size}
            height={size}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }} // show pointer if clickable
        >
            {quarterPath(0, scheme.first)}
            {quarterPath(90, scheme.second)}
            {quarterPath(180, scheme.third)}
            {quarterPath(270, scheme.fourth)}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="black" strokeWidth={1} />
        </svg>
    );
};

export default SchemeCircle;
