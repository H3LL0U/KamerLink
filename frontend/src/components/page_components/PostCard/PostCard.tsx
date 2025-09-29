import React, { useState } from "react";
import Card from "../../generic_components/Card/Card";
import { spendPoints, type Posts, type SpendPoints } from "../../../api/post";
import { type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { likePost } from "../../../api/post";
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

  return (
    <>
      <Card
        style={{
          maxWidth: "1000px",
          backgroundColor: scheme.second,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          position: "relative",

        }}
        onClick={!full_view ? handleCardClick : undefined}
      >
        {/* User + Date row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          <span>👤 {curPost.user_id}</span>
          <span>🗓 {new Date(curPost.created_at).toLocaleDateString()}</span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0 }}>{curPost.title}</h3>

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
          }}
        >
          {curPost.message}
        </p>

        {/* Interaction buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <button
            style={{
              backgroundColor: scheme.first,
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
            onClick={async (e) => {
              e.stopPropagation(); // prevent triggering card click
              const response = await likePost({ post_id: curPost._id.$oid });
              setLikes(likes + (response.data.status === "Like" ? 1 : -1));
            }}
          >
            ❤️ {likes}
          </button>
          <button
            style={{
              backgroundColor: scheme.first,
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
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
              fontSize: "0.95rem",
            }}
            onClick={(e) => e.stopPropagation()}
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