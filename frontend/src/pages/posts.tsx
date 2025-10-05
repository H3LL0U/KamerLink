import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost, retrievePosts } from "../api/post";
import Header from "../components/page_components/Header/Header";
import PostCard from "../components/page_components/PostCard/PostCard";
import Dropdown from "../components/generic_components/Dropdowns/Dropdown";
import MultiDropdown from "../components/generic_components/Dropdowns/MultiDropdown";
import { defaultScheme } from "../main";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";
import OptionBar from "../components/generic_components/OptionBar/OptionBar";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import InvalidEmail from "./REPLACEMENTS/invalid_email";
import { useScrollToBottom } from "../hooks/useScrollToBottom";

type Filter = "Nieuw" | "Likes" | "Points";
type Tags = "Nieuws" | "Grappig" | "Idee" | "Alle";

function PostViewPage() {
  const [posts, setPosts] = useState<Posts>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [atTheEnd, setAtTheEnd] = useState(false);
  const [tags, setTags] = useState<Tags[]>(["Nieuws", "Grappig", "Idee"]);
  const [filter, setFilter] = useState<Filter>("Nieuw");

  const { userInfo, accessToken, AuthReplacement, setUserInfo, isAuthenticated } =
    useAuthenticatedUser();

  // --- FETCH POSTS ---
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || !accessToken || fetchAttempts >= 3 || !atTheEnd) return;



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
        page,
      };

      const data = (await retrievePosts(request)).data;

      if (data.items.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => ({ items: [...prev.items, ...data.items] }));
        setPage((prev) => prev + 1);
        setAtTheEnd(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts.");
      setFetchAttempts((prev) => prev + 1);

    } finally {
      setLoading(false);
    }
  }, [hasMore, accessToken, filter, setPage, page, atTheEnd]);

  useScrollToBottom(() => {
    // User reached bottom, set atTheEnd to true
    setAtTheEnd(true);
  }, 200);

  // --- INITIAL FETCH ---
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchPosts();
    }
  }, [fetchPosts, isAuthenticated, accessToken]);

  // --- WHEN FILTER CHANGES, RESET POSTS ---
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

        const data = (await retrievePosts(request)).data;
        setPosts({ items: data.items });
        setPage(1);
        setHasMore(data.items.length > 0);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };
    // reset before fetching
    setPosts({ items: [] });
    setPage(0);
    setHasMore(true);
    fetchFilteredPosts();
  }, [filter, isAuthenticated, accessToken]);



  if (AuthReplacement) return AuthReplacement;
  if (error) return <InvalidEmail />;

  return (
    <>
      <Header />
      <div style={{ width: "100%", backgroundColor: defaultScheme.second }}>
        {/* Filters Bar */}
        <OptionBar>
          <MultiDropdown
            onSelect={setTags}
            options={["Grappig", "Idee", "Nieuws", "Alle"]}
            selectAllOption="Alle"
            placeholder="Selecteer tags"
          />

          <button
            onClick={() => {
              window.location.replace("/user/new_post");
            }}
            style={{
              backgroundColor: defaultScheme.first,
              borderRadius: "100%",
            }}
          >
            +
          </button>

          <Dropdown
            options={["Nieuw", "Likes", "Points"]}
            onSelect={setFilter}
            placeholder="Nieuw"
            scheme={defaultScheme}
            style={{ minWidth: "120px" }}
          />
        </OptionBar>

        {/* Bottom Transition Line */}
        <ColorTransition
          height="5px"
          from={defaultScheme.second}
          to={defaultScheme.first}
        />
      </div>

      {/* POSTS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {posts.items.map((post, index) => (
          <PostCard
            key={index}
            _post={post}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
          />
        ))}

        {loading && <div>Meer posts laden</div>}
        {!hasMore && <div>Geen posts meer</div>}
      </div>
    </>
  );
}

export default PostViewPage;
