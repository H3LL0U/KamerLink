import { addReplyToComment, deleteComment, editComment, likeComment, type PostComment } from '../../../api/post';
import React, { useRef, useEffect, useState } from 'react';
import Card from '../../generic_components/Card/Card';
import type { ColorScheme } from '../../../main';
import { defaultScheme } from '../../../main';
import CountButton from '../../generic_components/Buttons/CountButton/CountButton';
import type { UserInfo } from '../../../api/user';
import UserInfoCircle from "../UserInfoCircle/UserInfoCircle";
import { getUsers, isBanned, isHigherRole } from "../../../api/user";
import CommentSubmit from './CommentSubmit';
import ActionMenuButton from '../../generic_components/Buttons/ActionMenuButton/ActionMenuButton';
import Popup from '../../generic_components/PopUp/PopUp';
import PostActionMenu from '../../generic_components/Buttons/ActionMenuButton/PostActionMenu';
import BanUserPopUp from '../PopUps/BanUserPopUp';

interface CommentComponentProps {
    comment: PostComment;
    userInfo: UserInfo | null;
    color_scheme?: ColorScheme;
    style?: React.CSSProperties;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
    comment,
    color_scheme = defaultScheme,
    style = {},
    userInfo
}) => {
    const [curComment, setCurComment] = useState(comment);
    const [authorInfo, setAuthorInfo] = useState<UserInfo | null>(null);
    const [replyAuthors, setReplyAuthors] = useState<Record<string, UserInfo>>({});
    const [showReplies, setShowReplies] = useState(false);
    const [replyMsg, setReplyMsg] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const repliesRef = useRef<HTMLDivElement>(null);
    const [deleted, setDeleted] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showBanPopup, setShowBanPopup] = useState(false)

    // Fetch author info
    useEffect(() => {
        const fetchAuthor = async () => {
            if (comment.user_id && (!authorInfo || authorInfo._id.$oid !== comment.user_id)) {
                const res = await getUsers({ type: comment.user_id, page: 0 });
                if (res.data.items && res.data.items.length > 0) {
                    setAuthorInfo(res.data.items[0]);
                }
            }
        };
        fetchAuthor();
    }, [comment.user_id]);

    // Fetch reply authors
    useEffect(() => {
        const fetchReplyAuthors = async () => {
            if (!Array.isArray(curComment.replies)) return;
            const missingIds = curComment.replies
                .map((r) => r.user_id)
                .filter((id) => id && !replyAuthors[id]);
            if (missingIds.length === 0) return;
            const uniqueIds = Array.from(new Set(missingIds));
            const promises = uniqueIds.map(async (id) => {
                const res = await getUsers({ type: id, page: 0 });
                if (res.data.items && res.data.items.length > 0) {
                    return { id, info: res.data.items[0] as UserInfo };
                }
                return null;
            });
            const results = await Promise.all(promises);
            const newAuthors: Record<string, UserInfo> = {};
            results.forEach((result) => {
                if (result && result.info) {
                    newAuthors[result.id] = result.info;
                }
            });
            if (Object.keys(newAuthors).length > 0) {
                setReplyAuthors((prev) => ({ ...prev, ...newAuthors }));
            }
        };
        fetchReplyAuthors();
    }, [curComment.replies]);

    // Like handler
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

    // Reply submit
    const handleReplySubmit = async () => {
        if (!replyMsg.trim()) return;
        setReplyLoading(true);
        try {
            const res = await addReplyToComment({ comment_id: curComment._id.$oid, message: replyMsg });
            const newReply = res.data;
            setCurComment((prev) => ({
                ...prev,
                replies: [...(prev.replies || []), newReply]
            }));
            setReplyMsg("");
            setShowReplies(true);
        } catch (e) {
            console.error(e);
        } finally {
            setReplyLoading(false);
        }
    };

    // Delete comment
    const handleDelete = async () => {

        try {
            await deleteComment({ item_id: curComment._id.$oid });

        } catch (e) {
            console.error("Failed to delete comment:", e);
            return
        }
        setDeleted(true);
    };

    // Determine if user can edit/delete
    const canEditOrDelete = userInfo && (userInfo._id.$oid === curComment.user_id || userInfo.role === "Admin");

    if (deleted) { return null; }
    if (authorInfo && isBanned(authorInfo)) return null


    return (

        <>
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
                <div style={{ position: "relative", padding: 'clamp(1.2rem, 3vw, 2.5rem)', display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 1.5vw, 2rem)' }}>
                    {/* Top row: author info + action menu */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {authorInfo ? (
                            <UserInfoCircle
                                userInfo={authorInfo}
                                behavior="redirectToUserPage"
                                style={{ height: "40px", width: "40px", display: "inline-block" }}
                            >
                                {authorInfo.nickname}
                            </UserInfoCircle>
                        ) : (
                            <span>Gebruiker: {curComment.user_id}</span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                                style={{
                                    fontSize: "1rem",
                                    color: color_scheme.fourth,
                                    whiteSpace: "nowrap",
                                    marginLeft: "1rem",
                                }}
                            >
                                {new Date(curComment.created_at).toLocaleString("nl-NL")}
                            </span>

                            {!(canEditOrDelete === null) && !isEditing && authorInfo && userInfo && (
                                <PostActionMenu
                                    canEditOrDelete={canEditOrDelete}
                                    userInfo={userInfo}
                                    authorInfo={authorInfo}
                                    scheme={color_scheme}
                                    onEdit={() => setIsEditing(true)}
                                    onDelete={() => setShowDeletePopup(true)}
                                    onBan={() => { setShowBanPopup(true) }} />
                            )}
                        </div>

                    </div>

                    {/* Comment content */}
                    {!isEditing ? (
                        <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.2rem)', marginBottom: '0.5rem', overflowWrap: "break-word" }}>
                            {curComment.message}
                        </div>
                    ) : (
                        <CommentSubmit
                            initialMessage={curComment.message}
                            placeholder='Bewerk een comment...'
                            style={{ margin: 0 }}
                            onCancel={() => setIsEditing(false)}
                            onSubmit={async (message) => {
                                try {
                                    const response = await editComment({
                                        old_item_id: curComment._id.$oid,
                                        update_draft: { message },
                                    });

                                    if (response.status === 200) {
                                        setCurComment((prev) => ({ ...prev, message }));
                                        setIsEditing(false);
                                    } else {
                                        console.error("Failed to edit comment: unexpected status", response.status);
                                    }
                                } catch (error) {
                                    console.error("Error editing comment:", error);
                                }
                            }}
                            color_scheme={color_scheme}
                        />
                    )}

                    {/* Likes & reply buttons */}
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
                            />
                        </div>
                    </div>

                    {/* Replies section */}
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
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            {replyAuthors[reply.user_id] ? (
                                                <UserInfoCircle
                                                    userInfo={replyAuthors[reply.user_id]}
                                                    behavior="redirectToUserPage"
                                                    style={{ height: "32px", width: "32px", display: "inline-block" }}
                                                >
                                                    {replyAuthors[reply.user_id].nickname}
                                                </UserInfoCircle>
                                            ) : (
                                                <div style={{ fontWeight: 500 }}>{reply.user_id}</div>
                                            )}
                                            <div style={{ fontSize: '0.9rem', color: color_scheme.fourth, marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                                                {new Date(reply.created_at).toLocaleString('nl-NL')}
                                            </div>
                                        </div>
                                        <div style={{ whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                                            {reply.message}
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div>Geen reacties nog.</div>
                        )}
                    </div>
                </div>
            </Card>

            {showDeletePopup && (
                <Popup onClose={() => setShowDeletePopup(false)}>
                    <p>Ben je zeker dat je deze post wilt verwijderen</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button onClick={() => setShowDeletePopup(false)}>Annuleren</button>
                        <button onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>Verwijderen</button>
                    </div>
                </Popup>
            )}
            {showBanPopup &&
                authorInfo &&
                userInfo &&
                userInfo &&
                isHigherRole(userInfo.role, authorInfo.role) && (
                    <BanUserPopUp
                        userInfo={authorInfo}
                        onClose={() => setShowBanPopup(false)}
                    />
                )}

        </>
    );
};

export default CommentComponent;
