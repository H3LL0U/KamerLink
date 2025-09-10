import React, { useState } from "react";
import Card from "../../generic_components/Card/Card";
import { spendPoints, type Posts, type SpendPoints } from "../../../api/post";
import { type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { likePost } from "../../../api/post";
import PointsPopUp from "../PointsPopUp/PointsPopUp";
import { type UserInfo } from "../../../api/user";

interface PostCardProps {
  _post: Posts["posts"][number];
  scheme?: ColorScheme;
  userInfo?: UserInfo| null;
  setUserInfo?: ((value: UserInfo | null | ((prev: UserInfo | null) => UserInfo | null)) => void)|null;
}





function PostCard({ _post, scheme = defaultScheme, userInfo = null, setUserInfo = null }: PostCardProps) {
  const [curPost, setCurPost] = useState(_post)
  const [likes, setLikes] = useState(curPost.likes);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const handleConfirmPoints =async (points: SpendPoints) => {
    const response = await spendPoints(points)
      const newPost:Posts["posts"][number] = {...curPost, points: curPost.points +points.points, }
      setCurPost(newPost)
    console.log(response)
    setShowPointsPopup(false);
  };


function onPointsSet(newUserInfo: UserInfo | null){
    if (newUserInfo && userInfo && setUserInfo){
        const delta = newUserInfo.points- userInfo?.points

        setUserInfo(newUserInfo)
    }

  }


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
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 10, // max lines
          }}
        >
          {curPost.message}
        </p>

        {/* Interaction buttons (Likes, Points, Comments) */}
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
            onClick={async () => {
              let response = await likePost({ post_id: curPost._id.$oid });
              if (response.data.status == "Like") {
                setLikes(likes + 1);
              } else {
                setLikes(likes - 1);
              }
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
            onClick={() => setShowPointsPopup(true)}
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