import React, { useState, type DragEvent, type FormEvent } from "react";
import Card from "../../generic_components/Card/Card";
import PopupButton from "../../generic_components/PopUpButton/PopUpButton";
import TagSelector from "../../page_components/TagSelector/TagSelector";
import MultitagDisplay from "../../page_components/TagSelector/MultitagDisplay";
import { type PostDraft, type PostTag } from "../../../api/post";
import { defaultScheme } from "../../../main";

export async function filesToNumbers(files: File[]): Promise<number[][]> {
    const readFile = (file: File) =>
        new Promise<number[]>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const buffer = reader.result as ArrayBuffer;
                const bytes = new Uint8Array(buffer);
                resolve(Array.from(bytes));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

    return Promise.all(files.map(readFile));
}

interface PostDraftCardProps {
    onSubmit: (draft: PostDraft) => Promise<void>;
    onCancel?: () => void; // <-- Added cancel handler prop
    initialTitle?: string;
    initialMessage?: string;
    initialTags?: PostTag[];
    actionTitle?: string;
    colorScheme?: { first: string; second: string; third: string };
    style?: React.CSSProperties;
}

const PostDraftCard: React.FC<PostDraftCardProps> = ({
    onSubmit,
    onCancel,
    initialTitle = "",
    initialMessage = "",
    initialTags = [],
    colorScheme = defaultScheme,
    style,
    actionTitle = "Maak een post"

}) => {
    const [title, setTitle] = useState(initialTitle);
    const [message, setMessage] = useState(initialMessage);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<PostTag[]>(initialTags);

    // Handle image drag & drop
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return;
        setPhotos((prev) => [...prev, ...files]);
        setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return;
        setPhotos((prev) => [...prev, ...files]);
        setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };

    const handleRemovePhoto = (idx: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== idx));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const images = await filesToNumbers(photos);
        const draft: PostDraft = { title, message, images, tags: selectedTags };
        await onSubmit(draft);
    };

    return (
        <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ position: "relative", width: "100%" }}>
            <Card
                style={{
                    position: "relative",
                    padding: "1rem",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    borderRadius: "18px",
                    background: colorScheme.second,
                    margin: "2rem auto",
                    width: "100%",
                    maxWidth: "1000px",
                    border: `1px solid ${colorScheme.third}`,
                    ...style
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        width: "100%",
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <MultitagDisplay
                            header="Verwijder tags"
                            tags={selectedTags}
                            onChange={(tagsToRemove: PostTag[]) =>
                                setSelectedTags((prev: PostTag[]) =>
                                    prev.filter(
                                        (tag) =>
                                            !tagsToRemove.some(
                                                (removeTag) => removeTag._id.$oid === tag._id.$oid
                                            )
                                    )
                                )
                            }
                        />
                    </div>

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                flexShrink: 0,
                                background: "none",
                                border: "none",
                                color: colorScheme.third,
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                fontWeight: 700,
                                lineHeight: 1,
                                padding: "0 0.25rem",
                            }}
                            aria-label="Cancel"
                        >
                            ×
                        </button>
                    )}
                </div>

                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "2rem",
                        fontWeight: 700,
                        fontSize: "2.2rem",
                        letterSpacing: "0.01em",
                    }}
                >
                    {actionTitle}
                </h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Titel"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={100}
                        style={{
                            width: "100%",
                            marginBottom: 8,
                            padding: "12px 14px",
                            color: "black",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            fontSize: "1.1rem",
                            background: "#f9fafb",
                            fontWeight: 500,
                        }}
                    />
                    <div style={{ textAlign: "right", marginBottom: 10, fontSize: "0.95em", color: "#fff" }}>
                        {title.length}/100
                    </div>

                    <textarea
                        placeholder="Bericht"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        maxLength={5000}
                        style={{
                            width: "100%",
                            height: "25vh",
                            marginBottom: 8,
                            padding: "12px 14px",
                            color: "black",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            fontSize: "1.1rem",
                            background: "#f9fafb",
                            fontWeight: 400,
                            resize: "vertical",
                        }}
                    />
                    <div style={{ textAlign: "right", marginBottom: 10, fontSize: "0.95em", color: "#fff" }}>
                        {message.length}/5000
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {
                            //<input
                            //    type="file"
                            //    accept="image/*"
                            //    multiple
                            //    onChange={handleFileInputChange}

                            //    style={{ flexShrink: 0, padding: "6px 8px" }}
                            //>

                            // Will be replaced if image upload functionality is added

                        }
                        <PopupButton text="Selecteer tags" style={{ flexShrink: 0 }}>
                            <TagSelector onChange={setSelectedTags} selectedTags={selectedTags} disallowCreate={false} />
                        </PopupButton>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            marginTop: 10,
                            marginBottom: 18,
                        }}
                    >
                        {photoPreviews.map((src, idx) => (
                            <div key={idx} style={{ position: "relative" }}>
                                <img
                                    src={src}
                                    alt={`preview-${idx}`}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(idx)}
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        background: "#111827",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "22px",
                                        height: "22px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "15px",
                                        cursor: "pointer",
                                        padding: 0,
                                        lineHeight: 1,
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: 15,
                            padding: "12px 0",
                            width: "100%",
                            background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "1.15rem",
                            border: "none",
                            borderRadius: 8,
                            boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            letterSpacing: "0.01em",
                        }}
                    >
                        Verstuur
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default PostDraftCard;
