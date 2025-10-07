import React, { useState, useEffect } from "react";
import type { ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { type PostTag, retrievePostTags } from "../../../api/post";

interface TagSelectorProps {
    selectedTags?: string[]; // optional initial selected tags
    multiple?: boolean; // allow multiple selection
    colorScheme?: ColorScheme;
    onChange?: (selected: string[]) => void; // callback when selection changes
}

const TagSelector: React.FC<TagSelectorProps> = ({
    selectedTags = [],
    multiple = true,
    colorScheme = defaultScheme,
    onChange,
}) => {
    const [selected, setSelected] = useState<string[]>(selectedTags);
    const [tags, setTags] = useState<PostTag[]>([]);

    // Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const fetchedTags = (await retrievePostTags({ page: 0, type: "MostUses", post_id: "" })).data.items; // assuming this returns PostTag[]
                setTags(fetchedTags);
            } catch (err) {
                console.error("Failed to fetch tags:", err);
            }
        };

        fetchTags();
    }, []);

    const toggleTag = (tagValue: string) => {
        let newSelected: string[];
        if (selected.includes(tagValue)) {
            newSelected = selected.filter((t) => t !== tagValue);
        } else {
            newSelected = multiple ? [...selected, tagValue] : [tagValue];
        }
        setSelected(newSelected);
        if (onChange) onChange(newSelected);
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
            }}
        >
            {tags.map((tag) => {
                const tagValue = tag.tag_name; // replace 'value' with the actual field in PostTag
                const isSelected = selected.includes(tagValue);
                return (
                    <button
                        key={tag._id.$oid}
                        onClick={() => toggleTag(tagValue)}
                        style={{
                            padding: "0.4em 0.8em",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: isSelected
                                ? colorScheme.third
                                : colorScheme.second,
                            color: "#fff",
                            transition: "background-color 0.2s",
                        }}
                    >
                        {tagValue}
                    </button>
                );
            })}
        </div>
    );
};

export default TagSelector;
