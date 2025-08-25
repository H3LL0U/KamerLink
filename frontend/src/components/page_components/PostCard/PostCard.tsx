import React, { useState } from "react";
import Card from "../../generic_components/Card/Card";
import { type Posts } from "../../../api/post";
import {type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
import { like_post } from "../../../api/like";
interface PostCardProps {
  post: Posts["posts"][number];
  scheme?: ColorScheme,
  access_token?:string
}

function PostCard({ post, scheme = defaultScheme, access_token = "" }: PostCardProps) {


    const [likes, setLikes] = useState(post.likes);

  return (
    <Card
      style={{

        maxWidth: "1000px",
        backgroundColor:scheme.second,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
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
        <span>👤 {post.user_id}</span>
        <span>🗓 {new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {/* Title */}
      <h3 style={{ margin: 0 }}>{post.title}</h3>

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
        {post.message}
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
            backgroundColor:scheme.first,
            border: "none",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
          onClick={async () => {
            let response = await like_post({post_id: post._id.$oid} ,access_token)
            if (response.status == "Like"){
              setLikes(likes+1)

            }
            else{
              setLikes(likes -1)
            }
          }}
        >
          ❤️ {likes}
        </button>
        <button
          style={{
            backgroundColor:scheme.first,
            border: "none",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          ⭐ {post.points}
        </button>
        <button
          style={{
            backgroundColor:scheme.first,
            border: "none",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          💬
        </button>
      </div>
    </Card>
  );
}

export default PostCard;
