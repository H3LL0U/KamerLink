import React, { useRef } from "react";
import PopupButton from "../../generic_components/Buttons/PopUpButton/PopUpButton";
import TagButton from "./TagButton";
import TagSelector from "./TagSelector";
import type { PostTag } from "../../../api/post";

interface MultitagDisplayProps {
    tags: PostTag[];
    selectedTags?: PostTag[];
    multiple?: boolean;
    onChange?: (selected: PostTag[]) => void;
    header?: string,
    style?: React.CSSProperties;
}

const MultitagDisplay: React.FC<MultitagDisplayProps> = ({
    tags,
    selectedTags = [],
    multiple = true,
    onChange,
    header = "",
    style,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        isDown = true;
        startX = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft = scrollRef.current.scrollLeft;
    };

    const onMouseLeave = () => {
        isDown = false;
    };

    const onMouseUp = () => {
        isDown = false;
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDown || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <PopupButton
            text={
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    style={{
                        display: "flex",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        gap: "6px",
                        alignItems: "center",
                        width: "100%",
                        cursor: "grab",

                    }}
                >
                    {tags.map((tag, index) => (
                        <div key={index} style={{ flex: "0 0 auto", }}>
                            <TagButton tag={tag} />
                        </div>
                    ))}
                </div>
            }
            style={{ padding: 0, margin: 0, backgroundColor: "transparent", maxWidth: "100%", ...style }}
        >
            <TagSelector
                header={header}
                automaticallyFetchTags={false}
                predefined_tags={tags}
                selectedTags={selectedTags}
                multiple={multiple}
                onChange={onChange}
            />
        </PopupButton>
    );
};

export default MultitagDisplay;
