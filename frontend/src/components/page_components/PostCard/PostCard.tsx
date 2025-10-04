import React, { useState } from "react";
import Card from "../../generic_components/Card/Card";
import { spendPoints, type Posts, type SpendPoints } from "../../../api/post";
import { type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { likePost } from "../../../api/post";
import LikeButton from "../../generic_components/CountButton/CountButton";
import PointsPopUp from "../PointsPopUp/PointsPopUp";
import { type UserInfo } from "../../../api/user";
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
      window.location.href = `posts/view?id=${curPost._id.$oid}`;
    }

  };

  const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  return (
    <>
      <Card
        style={{
          maxWidth: "1000px",
          backgroundColor: scheme.second,
          padding: "clamp(0.1rem, 5vw, 2rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(1.2rem, 2vw, 2.5rem)",
          position: "relative",
          fontFamily,
          fontSize: 'clamp(1.25rem, 2vw, 2.2rem)',
          ...(full_view ? { width: "100%", margin: 0, marginTop: "5%" } : {}),
        }}
        onClick={!full_view ? handleCardClick : undefined}
      >
        {/* User + Date row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "clamp(1.25rem, 1.7vw, 2rem)",
            opacity: 0.85,
            fontFamily,
            fontWeight: 500,
          }}
        >
          <span>👤</span>
          <span>🗓 {new Date(curPost.created_at).toLocaleDateString()}</span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontFamily, fontWeight: 700, fontSize: 'clamp(2rem, 3vw, 2.8rem)', letterSpacing: '0.01em' }}>{curPost.title}</h3>

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