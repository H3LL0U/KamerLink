import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from "react-router-dom";
import { retrievePosts, type Posts } from '../../api/post';
import { useAuthenticatedUser } from '../../hooks/useAuthenticatedUser';
import PostCard from '../../components/page_components/PostCard/PostCard';
import Header from '../../components/page_components/Header/Header';
import { userInfo } from 'os';

type Post = Posts["items"][0];

function ViewPost() {
    const location = useLocation();
    const post_id = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);

    const { AuthReplacement, isAuthenticated, accessToken, userInfo, setUserInfo } = useAuthenticatedUser();

    // Hooks must run unconditionally
    const [post, setPost] = useState<Post | undefined>(undefined);

    useEffect(() => {
        if (!post_id || !isAuthenticated || !accessToken) return;
        const fetchPost = async () => {
            const posts = await retrievePosts({ type: post_id, page: 0 });
            setPost(posts.data.items[0]);
        };
        fetchPost();
    }, [accessToken]);

    return (
        <>
            {AuthReplacement ? (
                <>{AuthReplacement}</>
            ) : (
                <>
                    <Header></Header>
                    <div style={{ display: "flex", justifyContent: "center", }}>

                        {
                            post && <PostCard _post={post} full_view={true} userInfo={userInfo} setUserInfo={setUserInfo}></PostCard>
                        }

                    </div>
                </>
            )}
        </>
    );

}

export default ViewPost;