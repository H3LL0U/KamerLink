import React, { useEffect, useState, useCallback } from 'react';
import { type Posts, type RetrievePost, retrievePosts } from '../api/post';
import { useAuth0 } from '@auth0/auth0-react';
import Card from '../components/Card/Card';

function PostViewPage() {
  const [posts, setPosts] = useState<Posts>({ posts: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const { getAccessTokenSilently } = useAuth0();

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return; // prevent multiple calls
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const request: RetrievePost = {
        type: "MostRecent",
        page: page,
      };
      const data = await retrievePosts(request, token);

      if (data.posts.length === 0) {
        setHasMore(false); // no more posts
      } else {
        setPosts(prev => ({ posts: [...prev.posts, ...data.posts] }));
        setPage(prev => prev + 1);
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
    fetchPosts();
  }, [fetchPosts]);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 200
      ) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  if (error) return <div>{error}</div>;

  return (
    <div>
      {posts.posts.map((post, index) => (
        
        <Card >
        
          <h3>{post.title}</h3>
          <p>{post.message}</p>
          <p>Likes: {post.likes}, Points: {post.points}</p>
        </Card>
      ))}
      {loading && <div>Loading more posts...</div>}
      {!hasMore && <div>No more posts.</div>}
    </div>
  );
}

export default PostViewPage;
