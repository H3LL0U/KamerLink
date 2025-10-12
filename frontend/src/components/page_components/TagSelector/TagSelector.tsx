import React, { useState, useEffect } from "react";
import type { ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { type PostTag, retrievePostTags } from "../../../api/post";
import TagButton from "./TagButton";
import ColorPicker from "../../generic_components/ColorPicker/ColorPicker";

interface TagSelectorProps {
    selectedTags?: PostTag[];
    multiple?: boolean;
    colorScheme?: ColorScheme;
    automaticallyFetchTags?: boolean;
    predefined_tags?: PostTag[];
    onChange?: (selected: PostTag[]) => void;
    header?: string
    disallowCreate?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
    selectedTags = [],
    automaticallyFetchTags = true,
    multiple = true,
    colorScheme = defaultScheme,
    predefined_tags = [],
    onChange,
    header = "",
    disallowCreate = true,
}) => {
    const [selected, setSelected] = useState<PostTag[]>(selectedTags);
    const [tags, setTags] = useState<PostTag[]>(predefined_tags);
    const [searchTerm, setSearchTerm] = useState("");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pendingTagName, setPendingTagName] = useState("");
    const [pendingTagColor, setPendingTagColor] = useState("#cccccc");

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const fetchedTags = (
                    await retrievePostTags({
                        page: 0,
                        type: "MostUses",
                        post_id: "",
                        search: searchTerm
                    })
                ).data.items;
                setTags(fetchedTags);
            } catch (err) {
                console.error("Failed to fetch tags:", err);
            }
        };
        if (automaticallyFetchTags) fetchTags();
    }, [automaticallyFetchTags, searchTerm]);

    const toggleTag = (tag: PostTag) => {
        const isSelected = selected.some(
            (t) => t.tag_name.toLowerCase() === tag.tag_name.toLowerCase()
        );

        let newSelected: PostTag[];

        if (isSelected) {

            // Remove tag if it’s already selected
            newSelected = selected.filter(
                (t) => t._id.$oid !== tag._id.$oid && t.tag_name.toLowerCase() !== tag.tag_name.toLowerCase()
            );
        } else {

            // Add tag only if it doesn’t already exist
            newSelected = multiple ? [...selected, tag] : [tag];
        }

        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const addTagWithColor = (name: string, color: string) => {
        const newTag: PostTag = {
            _id: { $oid: Date.now().toString() },
            tag_name: name,
            uses: 0,
            base_tag: false,
            color: color,
        };
        setTags((prev) => [...prev, newTag]);
        toggleTag(newTag);
        resetColorPicker();
    };

    const handleCreateTagClick = (name: string) => {
        setPendingTagName(name);
        setPendingTagColor("#cccccc");
        setShowColorPicker(true);
    };

    const resetColorPicker = () => {
        setShowColorPicker(false);
        setPendingTagName("");
        setPendingTagColor("#cccccc");
        setSearchTerm("");
    };

    const filteredTags = tags.filter((tag) =>
        tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const baseTags = filteredTags.filter((t) => t.base_tag);
    const nonBaseTags = filteredTags.filter((t) => !t.base_tag);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3>{header}</h3>
            {/* Search bar always visible */}
            <input
                type="text"
                placeholder={disallowCreate ? "Zoek een tag" : "Zoek of maak een tag aan"}
                maxLength={30}
                value={searchTerm}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: "0.95rem",
                    color: "black",
                }}
                disabled={showColorPicker}
            />

            {/* Color Picker for new tag */}
            {showColorPicker && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ margin: 0 }}>Selecteer de kleur voor jouw tag</p>
                    <ColorPicker
                        style={{ width: "100%" }}
                        initialColor={pendingTagColor}
                        onChange={(color) => setPendingTagColor(color)}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => addTagWithColor(pendingTagName, pendingTagColor)}
                            style={{
                                padding: "5px 12px",
                                borderRadius: 6,
                                border: "1px solid #888",
                                cursor: "pointer",
                                backgroundColor: pendingTagColor,
                                color: "#000",
                            }}
                        >
                            Gereed
                        </button>
                        <button
                            onClick={resetColorPicker}
                            style={{
                                padding: "5px 12px",
                                borderRadius: 6,
                                border: "1px solid #888",
                                cursor: "pointer",
                                backgroundColor: "#eee",
                                color: "#000",
                            }}
                        >
                            Annuleren
                        </button>
                    </div>
                </div>
            )}

            {/* Base tags section */}
            {baseTags.length > 0 && !showColorPicker && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>Basis tags:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {baseTags.map((tag) => {
                            const isSelected = selected.some((t) => t._id.$oid === tag._id.$oid);
                            return (
                                <TagButton
                                    key={tag._id.$oid}
                                    tag={{ ...tag }}
                                    onSelect={toggleTag}
                                    selectable={true}
                                    selected={isSelected}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Non-base tags section */}
            {!showColorPicker && (
                <>
                    {<hr style={{ margin: "4px 0" }} />}
                    <p style={{ margin: 0, fontWeight: "bold" }}>Gebruiker tags:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {nonBaseTags.map((tag) => {
                            const isSelected = selected.some((t) => t._id.$oid === tag._id.$oid);
                            return (
                                <TagButton
                                    key={tag._id.$oid}
                                    tag={{ ...tag }}
                                    onSelect={toggleTag}
                                    selectable={true}
                                    selected={isSelected}
                                />
                            );
                        })}


                        {/* New tag button */}
                        {!disallowCreate &&
                            searchTerm.trim() &&
                            !tags.some(t => t.tag_name.toLowerCase() === searchTerm.toLowerCase()) &&
                            !showColorPicker && (
                                <TagButton
                                    tag={{
                                        _id: { $oid: "new-" + Date.now() },
                                        tag_name: searchTerm,
                                        uses: 0,
                                        base_tag: false,
                                        color: "#eee",
                                    }}
                                    selectable={true}
                                    selected={false}
                                    onSelect={() => handleCreateTagClick(searchTerm.trim())}
                                    style={{
                                        cursor: "pointer",
                                        borderColor: "#888",
                                        color: "black",
                                    }}
                                />
                            )}

                    </div>
                </>
            )}
        </div>
    );
};

export default TagSelector;
