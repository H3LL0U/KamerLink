import React from "react";
import Card from "../../generic_components/Card/Card";
import { type Posts } from "../../../api/post";
import {type ColorScheme } from "../../../main";
import { defaultScheme } from "../../../main";
interface PostCardProps {
  post: Posts["posts"][number];
  scheme?: ColorScheme
}

function PostCard({ post, scheme = defaultScheme }: PostCardProps) {
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
        >
          ❤️ {post.likes}
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
