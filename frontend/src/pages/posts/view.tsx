import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { retrieveComments, retrievePosts, type Posts, type PostComment, createComment } from '../../api/post';
import { useAuthenticatedUser } from '../../hooks/useAuthenticatedUser';
import PostCard from '../../components/page_components/PostCard/PostCard';
import Header from '../../components/page_components/Header/Header';
import CommentComponent from '../../components/page_components/CommentComponent/CommentComponent';
import CommentSubmit from '../../components/page_components/CommentComponent/CommentSubmit';
import { defaultScheme } from '../../main';
import { addReplyToComment } from '../../api/post';
import { useScrollToBottom } from '../../hooks/useScrollToBottom';
type Post = Posts["items"][0];

function ViewPost() {

    const scheme = defaultScheme
    const location = useLocation();
    const post_id = useMemo(() => new URLSearchParams(location.search).get("id") ?? "", [location.search]);

    const { AuthReplacement, isAuthenticated, accessToken, userInfo, setUserInfo } = useAuthenticatedUser();

    const [post, setPost] = useState<Post | undefined>(undefined);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [page, setPage] = useState(0);
    const [allLoaded, setAllLoaded] = useState(false);
    const allLoadedRef = useRef(allLoaded);
    useEffect(() => { allLoadedRef.current = allLoaded; }, [allLoaded]);

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
        if (!post_id || !isAuthenticated || !accessToken || allLoaded) return;
        const fetchComments = async () => {

            const res = await retrieveComments({
                page,
                type: "MostLikes", //maybe add filters later
                post_id: post_id
            });
            if (res.data.items.length === 0) {
                setAllLoaded(true);
                return;
            }

            if (page === 0) {
                setComments(res.data.items);
            } else {
                setComments(prev => [...prev, ...res.data.items]);
            }
        };
        fetchComments();
    }, [post_id, isAuthenticated, accessToken, page, allLoaded]);

    // Infinite scroll: fetch next page when bottom is reached
    useScrollToBottom(() => {
        if (!post_id || !isAuthenticated || !accessToken || allLoaded) return;
        if (!allLoadedRef.current) {
            setPage(prev => prev + 1);
        }
    }, 500);

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
                                <CommentComponent key={comment._id.$oid} comment={comment} userInfo={userInfo} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default ViewPost;