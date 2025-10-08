import React, { useState, useEffect } from "react";
import Card from "../../generic_components/Card/Card";
import { retrievePostTags, spendPoints, type Posts, type SpendPoints } from "../../../api/post";
import { type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { likePost } from "../../../api/post";
import LikeButton from "../../generic_components/CountButton/CountButton";
import PointsPopUp from "../PointsPopUp/PointsPopUp";
import { type UserInfo } from "../../../api/user";
import UserInfoCircle from "../UserInfoCircle/UserInfoCircle";
import { getUsers } from "../../../api/user";
import type { PostTag } from "../../../api/post";
import TagButton from "../TagSelector/TagButton";
import PopupButton from "../../generic_components/PopUpButton/PopUpButton";
import TagSelector from "../TagSelector/TagSelector";
import MultitagDisplay from "../TagSelector/MultitagDisplay";
interface PostCardProps {
  _post: Posts["items"][number];
  scheme?: ColorScheme;
  userInfo?: UserInfo | null;
  full_view?: boolean,
  setUserInfo?: ((value: UserInfo | null | ((prev: UserInfo | null) => UserInfo | null)) => void) | null;
}

function PostCard({ _post, scheme = defaultScheme, userInfo = null, setUserInfo = null, full_view = false }: PostCardProps) {
  const [curPost, setCurPost] = useState(_post);
  const [likes, setLikes] = useState(curPost.likes);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [authorInfo, setAuthorInfo] = useState<UserInfo | null>(null);
  const [postTags, setPostTags] = useState<PostTag[]>([])
  const handleConfirmPoints = async (points: SpendPoints) => {
    const response = await spendPoints(points);
    const newPost: Posts["items"][number] = { ...curPost, points: curPost.points + points.points };
    setCurPost(newPost);
    setShowPointsPopup(false);
    console.log(response);
  };

  function onPointsSet(newUserInfo: UserInfo | null) {
    if (newUserInfo && userInfo && setUserInfo) {
      setUserInfo(newUserInfo);
    }
  }

  const handleCardClick = () => {
    // Redirect to the full view page
    if (!full_view) {
      window.location.href = window.location.href = `${window.location.origin}/posts/view?id=${curPost._id.$oid}`;;
    }

  };

  useEffect(() => {
    // Fetch author info if not already fetched
    const fetchAuthor = async () => {
      if (_post.user_id && (!authorInfo || authorInfo._id.$oid !== _post.user_id)) {
        const res = await getUsers({ type: _post.user_id, page: 0 });
        if (res.data.items && res.data.items.length > 0) {
          setAuthorInfo(res.data.items[0]);
        }
      }
    };
    fetchAuthor();

  }, [_post.user_id]);

  useEffect(() => {
    // Fetch possible post tags
    if (_post.tags && _post._id) {
      const fetchPostTags = async () => {
        const res = await retrievePostTags({ post_id: _post._id.$oid, page: 0, type: "MostUses" })

        if (res.data.items && res.data.items.length > 0) {
          setPostTags(res.data.items)


        }
      }
      fetchPostTags();

    }


  }, [_post.tags])



  const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  return (
    <>
      <Card
        style={{
          maxWidth: "1000px",
          backgroundColor: scheme.second,
          padding: "clamp(0.1rem, 5vw, 2rem)",
          display: "flex",
          paddingTop: "0px",
          flexDirection: "column",
          gap: "clamp(1.2rem, 2vw, 2.5rem)",
          position: "relative",
          fontFamily,
          fontSize: 'clamp(1.25rem, 2vw, 2.2rem)',
          ...(full_view ? { width: "100%", margin: 0, marginTop: "5%" } : {}),
        }}
        onClick={!full_view ? handleCardClick : undefined}
      >
        {/* Post tags*/}
        <MultitagDisplay tags={postTags}>

        </MultitagDisplay>
        {/* User + Date row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "clamp(1.1rem, 1.3vw, 1.3rem)", // smaller font size
            opacity: 0.85,
            fontFamily,
            fontWeight: 500,
          }}
        >
          {authorInfo ? (
            <UserInfoCircle
              userInfo={authorInfo}
              behavior="redirectToUserPage"
              style={{ height: "60px", width: "60px", display: "inline-block" }}
            >
              {authorInfo.nickname}
            </UserInfoCircle>
          ) : (
            <span>👤</span>
          )}
          <span style={{ fontSize: "0.80em" }}>{new Date(curPost.created_at).toLocaleDateString()}</span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontFamily, fontWeight: 700, fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '0.01em', wordBreak: "break-word" }}>{curPost.title}</h3>

        {/* Description */}
        <p
          style={{
            margin: 0,
            overflow: full_view ? "visible" : "hidden",
            display: full_view ? "block" : "-webkit-box",
            WebkitBoxOrient: full_view ? undefined : "vertical",
            WebkitLineClamp: full_view ? undefined : 10,
            wordBreak: "break-word",
            whiteSpace: full_view ? "pre-wrap" : "normal",
            fontFamily,
            fontSize: 'clamp(1.1rem, 2vw, 2.0rem)',
            lineHeight: 1.8,
          }}
        >
          {curPost.message}
        </p>

        {/* Interaction buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "clamp(1.5rem, 2vw, 3rem)",
            marginTop: "1rem",
            fontFamily,
          }}
        >
          <LikeButton
            likes={likes}
            style={{ backgroundColor: scheme.first, fontFamily }}
            onClick={async (e) => {
              e.stopPropagation(); // prevent triggering card click
              const response = await likePost({ post_id: curPost._id.$oid });
              setLikes(likes + (response.data.status === "Like" ? 1 : -1));
            }}
          />
          <button
            style={{
              backgroundColor: scheme.first,
              border: "none",
              cursor: "pointer",
              fontSize: "clamp(1.05rem, 1.2vw, 1.3rem)",
              fontFamily,
              fontWeight: 500,
              borderRadius: '8px',
              padding: '0.6em 1.6em',
            }}
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering card click
              setShowPointsPopup(true);
            }}
          >
            ⭐ {curPost.points}
          </button>
          <button
            style={{
              backgroundColor: scheme.first,
              border: "none",
              cursor: "pointer",
              fontSize: "clamp(1.05rem, 1.2vw, 1.3rem)",
              fontFamily,
              fontWeight: 500,
              borderRadius: '8px',
              padding: '0.6em 1.6em',
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick();
            }
            }
          >
            💬
          </button>
        </div>
      </Card>

      {showPointsPopup && (
        <PointsPopUp
          post_id={curPost._id.$oid}
          remaining_points={userInfo?.points || 0}
          onConfirm={handleConfirmPoints}
          onClose={() => setShowPointsPopup(false)}
          setUserInfo={setUserInfo}
          userInfo={userInfo}
          scheme={scheme}
        />
      )}
    </>
  );
}


export default PostCard;