import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost,retrievePosts  } from "../api/post"; 
import { useAuth0 } from "@auth0/auth0-react";

import Header from "../components/page_components/Header/Header";
import PostCard from "../components/page_components/PostCard/PostCard";
import NotLoggedIn from "./REPLACEMENTS/not_logged_in";
import LoadingPage from "./REPLACEMENTS/loading";
import Dropdown from "../components/generic_components/Dropdowns/Dropdown";
import MultiDropdown from "../components/generic_components/Dropdowns/MultiDropdown";
import { defaultScheme } from "../main";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";
import { configureClient } from "../api/gen/clients";
import PointsPopUp from "../components/page_components/PointsPopUp/PointsPopUp";
import { getUsers } from "../api/user";
import {type  UserInfo } from "../api/user";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import EmailNotVerified from "./REPLACEMENTS/email_not_verified";
import InvalidEmail from "./REPLACEMENTS/invalid_email";
type Filter = "Nieuw" | "Likes" | "Points";
type Tags = "Nieuws" | "Grappig" | "Idee" | "Alle";

function PostViewPage() {
  const [posts, setPosts] = useState<Posts>({ posts: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [tags, setTags] = useState<Tags[]>(["Nieuws", "Grappig", "Idee"]);
  const [filter, setFilter] = useState<Filter>("Nieuw");
  const { userInfo, accessToken, AuthReplacement,setUserInfo, isAuthenticated} = useAuthenticatedUser();



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
      const data = (await retrievePosts(request)).data;

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
  }, [fetchPosts, isAuthenticated]);

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

        const data = (await retrievePosts(request,)).data;
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
  }, [filter, isAuthenticated]);


  if (AuthReplacement) return AuthReplacement
  if (error) return <InvalidEmail/>;

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
          <>
          
          <PostCard key={index} _post={post} userInfo={userInfo} setUserInfo={setUserInfo} />
          </>
        ))}
        {loading && <div>Loading more posts...</div>}
        {!hasMore && <div>No more posts.</div>}
      </div>
    </>
  );
}

export default PostViewPage;
