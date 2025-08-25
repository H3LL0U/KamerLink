import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost, retrievePosts } from "../api/post";
import { useAuth0 } from "@auth0/auth0-react";
import Card from "../components/generic_components/Card/Card";
import Header from "../components/page_components/Header/Header";
import PostCard from "../components/page_components/PostCard/PostCard";
import NotLoggedIn from "./REPLACEMENTS/not_logged_in";
import LoadingPage from "./REPLACEMENTS/loading";
import Dropdown from "../components/generic_components/Dropdowns/Dropdown";
import MultiDropdown from "../components/generic_components/Dropdowns/MultiDropdown";
import { defaultScheme } from "../main";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";

type Filter = "Nieuw" | "Likes" | "Points";
type Tags = "Nieuws" | "Grappig" | "Idee" | "Alle";

function PostViewPage() {
  const [posts, setPosts] = useState<Posts>({ posts: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string>("");

  const [tags, setTags] = useState<Tags[]>(["Nieuws", "Grappig", "Idee"]);
  const [filter, setFilter] = useState<Filter>("Nieuw");

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  // Make sure accessToken is set once user is authenticated
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);

      } catch (err) {
        console.error("Failed to get access token:", err);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || !accessToken) return;
    setLoading(true);

    try {
      type RetrieveBy = "MostRecent" | "MostLikes" | "MostPoints";

      const filterToRetrieveBy: Record<Filter, RetrieveBy> = {
        Nieuw: "MostRecent",
        Likes: "MostLikes",
        Points: "MostPoints",
      };

      const request: RetrievePost = {
        type: filterToRetrieveBy[filter],
        page: page,
      };
      const data = await retrievePosts(request, accessToken);

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
  }, [page, loading, hasMore, accessToken, filter]);

  // initial fetch
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchPosts();
    }
  }, [fetchPosts, isAuthenticated, accessToken]);

  // when filter changes, reset posts and fetch fresh
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const fetchFilteredPosts = async () => {
      setLoading(true);
      try {
        type RetrieveBy = "MostRecent" | "MostLikes" | "MostPoints";
        const filterToRetrieveBy: Record<Filter, RetrieveBy> = {
          Nieuw: "MostRecent",
          Likes: "MostLikes",
          Points: "MostPoints",
        };

        const request: RetrievePost = {
          type: filterToRetrieveBy[filter],
          page: 0,
        };

        const data = await retrievePosts(request, accessToken);
        setPosts({ posts: data.posts });
        setPage(1);
        setHasMore(data.posts.length > 0);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    // reset state first
    setPosts({ posts: [] });
    setPage(0);
    setHasMore(true);

    fetchFilteredPosts();
  }, [filter, accessToken, isAuthenticated]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <NotLoggedIn />;
  }

  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <ColorTransition
        height="5px"
        from={defaultScheme.fourth}
        to={defaultScheme.second}
      ></ColorTransition>
      <div style={{ width: "100%", backgroundColor: defaultScheme.second }}>
        {/* Filters Bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "0.5rem 1rem",
            gap: "1rem",
            maxWidth: "1000px",
            margin: "auto",
          }}
        >
          <MultiDropdown
            onSelect={setTags}
            options={["Grappig", "Idee", "Nieuws", "Alle"]}
            selectAllOption={"Alle"}
            placeholder="Selecteer tags"
          />

          <button
            onClick={() => {
              window.location.replace("/user/new_post");
            }}
            style={{ backgroundColor: defaultScheme.first, borderRadius: "100%" }}
          >
            +
          </button>

          <Dropdown
            options={["Nieuw", "Likes", "Points"]}
            onSelect={setFilter}
            placeholder="Nieuw"
            scheme={defaultScheme}
            style={{
              minWidth: "120px",
            }}
          />
        </div>

        {/* Bottom Transition Line */}
        <ColorTransition
          height="5px"
          from={defaultScheme.second}
          to={defaultScheme.first}
        ></ColorTransition>
      </div>
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
          <PostCard key={index} post={post} access_token={accessToken} />
        ))}
        {loading && <div>Loading more posts...</div>}
        {!hasMore && <div>No more posts.</div>}
      </div>
    </>
  );
}

export default PostViewPage;
