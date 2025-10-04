import { addReplyToComment } from '../../../api/post';
import React, { useRef } from 'react';
import Card from '../../generic_components/Card/Card';
import { likeComment, type PostComment } from '../../../api/post';
import type { ColorScheme } from '../../../main';
import { defaultScheme } from '../../../main';
import CountButton from '../../generic_components/CountButton/CountButton';
import type { UserInfo } from '../../../api/user';

interface CommentComponentProps {
    comment: PostComment;
    userInfo: UserInfo | null;
    color_scheme?: ColorScheme;
    style?: React.CSSProperties;

}


const CommentComponent: React.FC<CommentComponentProps> = ({ comment, color_scheme = defaultScheme, style = {}, userInfo }) => {
    const [curComment, setCurComment] = React.useState(comment);
    const [showReplies, setShowReplies] = React.useState(false);
    const [replyMsg, setReplyMsg] = React.useState("");
    const [replyLoading, setReplyLoading] = React.useState(false);
    const repliesRef = useRef<HTMLDivElement>(null);

    const handleLike = async () => {
        try {
            const response = await likeComment({ _id: curComment._id.$oid });
            if (response.data.status === "Like") {
                setCurComment({ ...curComment, likes: curComment.likes + 1 });
            } else if (response.data.status === "Unlike") {
                setCurComment({ ...curComment, likes: Math.max(0, curComment.likes - 1) });
            }
        } catch (e) {
            console.error("Error liking comment:", e);
        }
    };

    const handleToggleReplies = () => {
        setShowReplies((prev) => !prev);
    };

    const handleReplySubmit = async () => {
        if (!replyMsg.trim()) return;
        setReplyLoading(true);
        try {
            const res = await addReplyToComment({ comment_id: curComment._id.$oid, message: replyMsg });
            // Insert the reply returned from the backend into the replies array
            const newReply = res.data;
            setCurComment(prev => ({
                ...prev,
                replies: [...(prev.replies || []), newReply]
            }));
            setReplyMsg("");
            setShowReplies(true);
        } catch (e) {
            // Optionally handle error
        } finally {
            setReplyLoading(false);
        }
    };

    return (
        <Card
            style={{
                backgroundColor: color_scheme.second,
                color: color_scheme.third,
                margin: 0,
                width: "100%",
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                fontSize: 'clamp(1.25rem, 2vw, 2.2rem)',
                padding: 0,
                boxSizing: "border-box",
                ...style,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.2rem, 2vw, 2.5rem)', position: 'relative' }}>
                <div style={{ padding: 'clamp(1.2rem, 3vw, 2.5rem)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 600, fontSize: 'clamp(1.25rem, 1.7vw, 2rem)', marginBottom: 0 }}>
                        <span>Gebruiker: {curComment.user_id}</span>
                        <span style={{ fontSize: '1rem', color: color_scheme.fourth, whiteSpace: 'nowrap', marginLeft: '1rem' }}>{new Date(curComment.created_at).toLocaleString('nl-NL')}</span>
                    </div>
                    <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.2rem)', marginBottom: '0.5rem' }}>{curComment.message}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(1.25rem, 1.7vw, 2rem)', color: color_scheme.fourth }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                            <CountButton
                                likes={curComment.likes}
                                onClick={handleLike}
                                style={{ backgroundColor: color_scheme.first }}
                                emoji="❤️"
                            />
                            <CountButton
                                likes={Array.isArray(curComment.replies) ? curComment.replies.length : 0}
                                onClick={() => setShowReplies((prev) => !prev)}
                                style={{ backgroundColor: color_scheme.first }}
                                emoji="💬"
                            >
                            </CountButton>
                        </div>
                    </div>
                </div>
                <div
                    ref={repliesRef}
                    style={{
                        background: color_scheme.first,
                        borderRadius: '6px',
                        padding: '1rem 1rem 0 1rem',
                        border: '2px solid #fff',
                        marginTop: 0,
                        maxHeight: showReplies ? 600 : 0,
                        opacity: showReplies ? 1 : 0,
                        transform: showReplies ? 'translateY(0)' : 'translateY(-20px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                    }}
                    className="replies-scrollbar-hide"
                >
                    <div style={{ marginBottom: '1rem' }}>
                        <textarea
                            value={replyMsg}
                            onChange={e => setReplyMsg(e.target.value)}
                            rows={2}
                            maxLength={1000}
                            style={{ width: '100%', borderRadius: '4px', padding: '0.5em', fontSize: '1rem', color: "black" }}
                            placeholder="Schrijf je reactie... (max 1000 tekens)"
                            disabled={replyLoading}
                        />
                        <div style={{ fontSize: '0.9rem', color: color_scheme.fourth, textAlign: 'right' }}>{replyMsg.length}/1000</div>
                        {replyMsg.trim() && (
                            <button
                                onClick={handleReplySubmit}
                                disabled={replyLoading || !replyMsg.trim()}
                                style={{ marginTop: '0.5rem', background: color_scheme.third, color: color_scheme.first, border: 'none', borderRadius: '6px', padding: '0.3em 1em', cursor: 'pointer', fontSize: '1rem' }}
                            >
                                {replyLoading ? 'Plaatsen...' : 'Plaats reactie'}
                            </button>
                        )}
                    </div>
                    {Array.isArray(curComment.replies) && curComment.replies.length > 0 ? (
                        [...curComment.replies]
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((reply: any, idx: number) => (
                                <div key={idx} style={{ marginBottom: '0.7rem', borderRadius: '6px', background: color_scheme.second, padding: '0.7rem', position: 'relative', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                        <div style={{ fontWeight: 500 }}>{reply.user_id}</div>
                                        <div style={{ fontSize: '0.9rem', color: color_scheme.fourth, marginLeft: '1rem', whiteSpace: 'nowrap' }}>{new Date(reply.created_at).toLocaleString('nl-NL')}</div>
                                    </div>
                                    <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>{reply.message}</div>
                                </div>
                            ))
                    ) : (
                        <div>Geen reacties nog.</div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CommentComponent;
/* Hide scrollbar for Chrome, Safari and Opera */
<style>{`
.replies-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
`}</style>