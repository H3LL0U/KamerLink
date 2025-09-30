import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from "react-router-dom";
import { retrieveComments, retrievePosts, type Posts, type PostComment, createComment } from '../../api/post';
import { useAuthenticatedUser } from '../../hooks/useAuthenticatedUser';
import PostCard from '../../components/page_components/PostCard/PostCard';
import Header from '../../components/page_components/Header/Header';
import CommentComponent from '../../components/page_components/CommentComponent/CommentComponent';
import CommentSubmit from '../../components/page_components/CommentComponent/CommentSubmit';
import { defaultScheme } from '../../main';
type Post = Posts["items"][0];

function ViewPost() {

    const scheme = defaultScheme
    const location = useLocation();
    const post_id = useMemo(() => new URLSearchParams(location.search).get("id") ?? "", [location.search]);

    const { AuthReplacement, isAuthenticated, accessToken, userInfo, setUserInfo } = useAuthenticatedUser();

    const [post, setPost] = useState<Post | undefined>(undefined);
    const [comments, setComments] = useState<PostComment[]>([]);
    // const [newComment, setNewComment] = useState<string>("");

    // Fetch the post
    useEffect(() => {
        if (!post_id || !isAuthenticated || !accessToken) return;
        const fetchPost = async () => {
            const posts = await retrievePosts({ type: post_id, page: 0 });
            setPost(posts.data.items[0]);
        };
        fetchPost();
    }, [post_id, isAuthenticated, accessToken]);

    // Fetch comments
    useEffect(() => {
        if (!post_id || !isAuthenticated || !accessToken) return;
        const fetchComments = async () => {
            const res = await retrieveComments({
                page: 0,
                type: "MostLikes",
                post_id: post_id
            });

            setComments(res.data.items); // Already correctly typed
        };
        fetchComments();
    }, [post_id, isAuthenticated, accessToken]);

    // Handle creating a comment
    const handleCreateComment = async (msg: string) => {
        if (!msg.trim()) return;
        if (!post_id || !accessToken) return;

        const res = await createComment({ message: msg, post_id });
        setComments(prev => [res.data, ...prev]);
    };

    return (
        <>
            {AuthReplacement ? (
                <>{AuthReplacement}</>
            ) : (
                <>
                    <Header />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        {post && (
                            <PostCard _post={post} full_view={true} userInfo={userInfo} setUserInfo={setUserInfo} />
                        )}

                        {/* Comment input */}
                        <CommentSubmit
                            onSubmit={handleCreateComment}
                            color_scheme={defaultScheme}
                            disabled={!isAuthenticated || !accessToken}
                        />

                        {/* Comments list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "1000px" }}>
                            {comments.map(comment => (
                                <CommentComponent key={comment._id.$oid} comment={comment} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default ViewPost;