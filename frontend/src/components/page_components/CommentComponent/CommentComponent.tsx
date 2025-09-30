import React from 'react';
import Card from '../../generic_components/Card/Card';
import type { PostComment } from '../../../api/post';
import type { ColorScheme } from '../../../main';
import { defaultScheme } from '../../../main';
import LikeButton from '../../generic_components/LikeButton/LikeButton';

interface CommentComponentProps {
    comment: PostComment;
    color_scheme?: ColorScheme;
    style?: React.CSSProperties;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment, color_scheme = defaultScheme, style = {} }) => {
    return (
        <Card
            style={{
                backgroundColor: color_scheme.second,
                color: color_scheme.third,
                margin: 0,
                width: "100%",
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                fontSize: 'clamp(1.25rem, 2vw, 2.2rem)',
                padding: 'clamp(1.2rem, 3vw, 2.5rem)',
                boxSizing: "border-box",
                ...style,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.2rem, 2vw, 2.5rem)' }}>
                <div style={{ fontWeight: 600, fontSize: 'clamp(1.25rem, 1.7vw, 2rem)' }}>
                    User: {comment.user_id}
                </div>
                <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.2rem)', marginBottom: '0.5rem' }}>{comment.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(1.25rem, 1.7vw, 2rem)', color: color_scheme.fourth }}>
                    <LikeButton
                        likes={comment.likes}
                        onClick={() => { }}
                        style={{ backgroundColor: color_scheme.first }}
                    />
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
            </div>
        </Card >
    );
};

export default CommentComponent;