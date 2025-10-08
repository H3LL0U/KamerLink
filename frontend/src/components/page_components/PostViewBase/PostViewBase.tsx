import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost, retrievePosts } from "../../../api/post";
import PostCard from "../PostCard/PostCard";
import Dropdown from "../../generic_components/Dropdowns/Dropdown";
import MultiDropdown from "../../generic_components/Dropdowns/MultiDropdown";
import { defaultScheme } from "../../../main";
import ColorTransition from "../../generic_components/ColorTransition/ColorTransition";
import OptionBar from "../../generic_components/OptionBar/OptionBar";
import { useAuthenticatedUser } from "../../../hooks/useAuthenticatedUser";
import InvalidEmail from "../../../pages/REPLACEMENTS/invalid_email";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import Header from "../Header/Header";
import type { PostTag, RequestPostTag } from "../../../api/post";
import PopUpButton from "../../generic_components/PopUpButton/PopUpButton";
import TagSelector from "../TagSelector/TagSelector";

type Filter = "Nieuw" | "Likes" | "Punten";




interface PostViewBaseProps {
    /** Optional custom post fetching function */
    fetchFunction?: (request: RetrievePost,) => Promise<{ data: Posts }>;
    /** Whether to show the header bar or not */
    showHeader?: boolean;
}

export default function PostViewBase({
    fetchFunction = retrievePosts,
    showHeader = false,
}: PostViewBaseProps) {

    const [posts, setPosts] = useState<Posts>({ items: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [fetchAttempts, setFetchAttempts] = useState(0);
    const [atTheEnd, setAtTheEnd] = useState(false);

    const [filter, setFilter] = useState<Filter>("Nieuw");

    const [tags, setTags] = useState<PostTag[]>([])



    const { userInfo, accessToken, AuthReplacement, setUserInfo, isAuthenticated } =
        useAuthenticatedUser();

    const fetchPosts = useCallback(async () => {
        if (loading || !hasMore || !accessToken || fetchAttempts >= 3 || !atTheEnd)
            return;

        setLoading(true);
        try {
            type RetrieveBy = "MostRecent" | "MostLikes" | "MostPoints";
            const filterToRetrieveBy: Record<Filter, RetrieveBy> = {
                Nieuw: "MostRecent",
                Likes: "MostLikes",
                Punten: "MostPoints",
            };
            const tagIds = tags.map(tag => tag._id.$oid).join(" ");
            const request: RetrievePost = {
                type: filterToRetrieveBy[filter],
                page,
                search: tagIds
            };

            const data = (await fetchFunction(request)).data;

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
    }, [hasMore, accessToken, filter, page, atTheEnd, fetchAttempts, loading, fetchFunction]);

    useScrollToBottom(() => setAtTheEnd(true), 200);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            fetchPosts();
        }
    }, [fetchPosts, isAuthenticated, accessToken]);

    // Filter change
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const fetchFilteredPosts = async () => {
            setLoading(true);
            try {
                type RetrieveBy = "MostRecent" | "MostLikes" | "MostPoints";
                const filterToRetrieveBy: Record<Filter, RetrieveBy> = {
                    Nieuw: "MostRecent",
                    Likes: "MostLikes",
                    Punten: "MostPoints",
                };
                const tagIds = tags.map(tag => tag._id.$oid).join(" ");


                const request: RetrievePost = {
                    type: filterToRetrieveBy[filter],
                    page: 0,
                    search: tagIds

                };

                const data = (await fetchFunction(request)).data;
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

        // Reset and refetch
        setPosts({ items: [] });
        setPage(0);
        setHasMore(true);
        fetchFilteredPosts();
    }, [filter, isAuthenticated, accessToken, fetchFunction, tags]);

    if (AuthReplacement) return AuthReplacement;
    if (error) return <InvalidEmail />;

    return (
        <>
            {showHeader && (<>
                <Header />

            </>
            )}

            <div
                style={{
                    width: "100%",
                    backgroundColor: defaultScheme.second,
                }}
            >
                {/* Filters Bar */}
                <OptionBar>
                    <PopUpButton text="Filtreren">

                        <TagSelector onChange={setTags} selectedTags={tags} ></TagSelector>

                    </PopUpButton>

                    <button
                        onClick={() => window.location.replace("/user/new_post")}
                        style={{
                            backgroundColor: defaultScheme.first,
                            borderRadius: "100%",
                        }}
                    >
                        +
                    </button>

                    <Dropdown
                        options={["Nieuw", "Likes", "Punten"]}
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

                {loading && <div>Meer posts laden...</div>}
                {!hasMore && <div>Geen posts meer</div>}
            </div>
        </>
    );
}
