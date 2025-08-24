import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost, retrievePosts } from "../api/post";
import { useAuth0 } from "@auth0/auth0-react";
import Card from "../components/generic_components/Card/Card";
import Header from "../components/page_components/Header/Header";
import PostCard from "../components/page_components/PostCard/PostCard";
import NotLoggedIn from "./REPLACEMENTS/not_logged_in";
import LoadingPage from "./REPLACEMENTS/loading";
function PostViewPage() {
  const [posts, setPosts] = useState<Posts>({ posts: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const request: RetrievePost = {
        type: "MostRecent",
        page: page,
      };
      const data = await retrievePosts(request, token);

      if (data.posts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => ({ posts: [...prev.posts, ...data.posts] }));
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, getAccessTokenSilently]);

  // initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [fetchPosts, isAuthenticated]);

  // infinite scroll
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts, isAuthenticated]);

  if (isLoading) {
    return <LoadingPage/>
  }

  // 🔑 Only show NotLoggedIn if we are sure the user is not authenticated
  if (!isAuthenticated) {
    return <NotLoggedIn />;
  }

  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {posts.posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
        {loading && <div>Loading more posts...</div>}
        {!hasMore && <div>No more posts.</div>}
      </div>
    </>
  );
}

export default PostViewPage;
