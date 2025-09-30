import React, { useState } from "react";
import type { ColorScheme } from '../../../main';
import { defaultScheme } from '../../../main';

interface CommentSubmitProps {
    onSubmit: (message: string) => void;
    color_scheme?: ColorScheme;
    disabled?: boolean;
}

const CommentSubmit: React.FC<CommentSubmitProps> = ({ onSubmit, color_scheme = defaultScheme, disabled = false }) => {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSubmit(message);
            setMessage("");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: '1rem',
            background: color_scheme.second,
            padding: '1.5rem',
            borderRadius: '12px',
            maxWidth: "1000px",
            width: "100%",
            margin: '1.5rem 0',
        }}>
            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                style={{
                    resize: 'vertical',
                    fontSize: '1.1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${color_scheme.third}`,
                    fontFamily: 'inherit',
                    background: color_scheme.fourth,
                    color: color_scheme.first,
                }}
                disabled={disabled}
            />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    style={{
                        background: color_scheme.first,
                        color: color_scheme.fourth,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5em 1.2em',
                        fontWeight: 600,
                        fontSize: '1rem',
                        minWidth: '90px',
                        cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
                        opacity: disabled || !message.trim() ? 0.7 : 1,
                        transition: 'background 0.15s',
                        marginTop: 0,
                    }}
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default CommentSubmit;