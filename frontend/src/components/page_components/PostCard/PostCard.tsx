import React, { useState, useEffect } from "react";
import Card from "../../generic_components/Card/Card";
import { retrievePostTags, spendPoints, type Posts, type SpendPoints, likePost, deletePost, editPost } from "../../../api/post";
import { type ColorScheme, defaultScheme } from "../../../main";
import LikeButton from "../../generic_components/CountButton/CountButton";
import PointsPopUp from "../PointsPopUp/PointsPopUp";
import { type UserInfo } from "../../../api/user";
import UserInfoCircle from "../UserInfoCircle/UserInfoCircle";
import { getUsers } from "../../../api/user";
import type { PostDraft, PostTag } from "../../../api/post";
import MultitagDisplay from "../TagSelector/MultitagDisplay";
import PostDraftCard from "../PostDraftCard/PostDraftCard";
import Popup from "../../generic_components/PopUp/PopUp";
import CountButton from "../../generic_components/CountButton/CountButton";

interface PostCardProps {
  _post: Posts["items"][number];
  scheme?: ColorScheme;
  userInfo?: UserInfo | null;
  full_view?: boolean;
  setUserInfo?: ((value: UserInfo | null | ((prev: UserInfo | null) => UserInfo | null)) => void) | null;
}

function PostCard({ _post, scheme = defaultScheme, userInfo = null, setUserInfo = null, full_view = false }: PostCardProps) {
  const [curPost, setCurPost] = useState(_post);
  const [likes, setLikes] = useState(curPost.likes);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [authorInfo, setAuthorInfo] = useState<UserInfo | null>(null);
  const [postTags, setPostTags] = useState<PostTag[]>([]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const canEditOrDelete = userInfo?.role === "Admin" || userInfo?._id.$oid === curPost.user_id;



  let genericCardStyle: React.CSSProperties = {
    maxWidth: "1000px",
    backgroundColor: scheme.second,
    padding: "clamp(0.1rem, 5vw, 2rem)",
    display: "flex",
    paddingTop: 0,
    overflow: "hidden",
    flexDirection: "column",
    gap: "clamp(1.2rem, 2vw, 2.5rem)",
    position: "relative",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    fontSize: "clamp(1.25rem, 2vw, 2.2rem)",
    ...(full_view ? { width: "100%", margin: 0, marginTop: "5%" } : {}),
  }


  // Handle points update
  const handleConfirmPoints = async (points: SpendPoints) => {
    await spendPoints(points);
    setCurPost({ ...curPost, points: curPost.points + points.points });
    setShowPointsPopup(false);
  };

  const handleEditSubmit = async (draft: PostDraft) => {
    const response = await editPost({ old_item_id: curPost._id.$oid, update_draft: draft });
    if (response) {
      setCurPost({ ...curPost });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    let response = await deletePost({ item_id: curPost._id.$oid });
    if (response.status === 200) {
      setIsDeleted(true);
    }
    setShowDeletePopup(false);
    if (full_view) window.location.href = "/";
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      if (_post.user_id && (!authorInfo || authorInfo._id.$oid !== _post.user_id)) {
        const res = await getUsers({ type: _post.user_id, page: 0 });
        if (res.data.items?.length) setAuthorInfo(res.data.items[0]);
      }
    };
    fetchAuthor();

    if (_post.tags && _post._id) {
      const fetchPostTags = async () => {
        const res = await retrievePostTags({ post_id: _post._id.$oid, page: 0, type: "MostUses" });
        if (res.data.items?.length) setPostTags(res.data.items);
      };
      fetchPostTags();
    }
  }, [_post, authorInfo]);

  if (isDeleted) return null;

  if (isEditing) {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>

        </div>
        <PostDraftCard
          actionTitle="Bewerk een post"
          style={{ maxWidth: "1000px", margin: "0 auto" }}
          onCancel={() => setIsEditing(false)}
          key={curPost._id.$oid} // remounts component to reset state
          initialTitle={curPost.title}
          initialMessage={curPost.message}
          initialTags={postTags}
          onSubmit={handleEditSubmit}
          colorScheme={scheme}
        />
      </>
    );
  }

  return (
    <>
      <Card
        style={{
          maxWidth: "1000px",
          backgroundColor: scheme.second,
          padding: "clamp(0.1rem, 5vw, 2rem)",
          display: "flex",
          paddingTop: 0,
          overflow: "hidden",
          flexDirection: "column",
          gap: "clamp(1.2rem, 2vw, 2.5rem)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
          fontSize: "clamp(1.25rem, 2vw, 2.2rem)",
          ...(full_view ? { width: "100%", margin: 0, marginTop: "5%" } : {}),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "100%",
            gap: "0.5rem",
            flexWrap: "nowrap"
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultitagDisplay tags={postTags} />
          </div>

          {canEditOrDelete && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionButtons((prev) => !prev);
                }}
                style={{
                  fontSize: "1.5rem",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "0.2rem 0.5rem"
                }}
              >
                ⋮
              </button>

              {showActionButtons && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: scheme.second,
                    border: `1px solid ${scheme.third}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    zIndex: 100
                  }}
                >
                  <button
                    style={{ padding: "0.5em 1em" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowActionButtons(false);
                    }}
                  >
                    Bewerken
                  </button>
                  <button
                    style={{ padding: "0.5em 1em" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeletePopup(true);
                      setShowActionButtons(false);
                    }}
                  >
                    Verwijderen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "clamp(1.1rem, 1.3vw, 1.3rem)", opacity: 0.85 }}>
          {authorInfo ? (
            <UserInfoCircle userInfo={authorInfo} behavior="redirectToUserPage" style={{ height: "60px", width: "60px" }} />
          ) : (<span>👤</span>)}
          <span style={{ fontSize: "0.80em" }}>{new Date(curPost.created_at).toLocaleDateString()}</span>
        </div>

        <h3 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(2rem, 3vw, 2.8rem)", wordBreak: "break-word" }}>{curPost.title}</h3>
        <p
          style={{
            margin: 0,
            overflow: full_view ? "visible" : "hidden",
            display: full_view ? "block" : "-webkit-box",
            WebkitBoxOrient: full_view ? undefined : "vertical",
            WebkitLineClamp: full_view ? undefined : 10,
            wordBreak: "break-word",
            whiteSpace: full_view ? "pre-wrap" : "normal",
            fontSize: "clamp(1.1rem, 2vw, 2.0rem)",
            lineHeight: 1.8
          }}
        >
          {curPost.message}
        </p>

        <div style={{ display: "flex", gap: "clamp(1.5rem, 2vw, 3rem)", marginTop: "1rem" }}>
          <CountButton likes={likes} style={{ backgroundColor: scheme.first }} onClick={async e => {
            e.stopPropagation();
            const response = await likePost({ post_id: curPost._id.$oid });
            setLikes(likes + (response.data.status === "Like" ? 1 : -1));
          }} />
          <CountButton likes={curPost.points} emoji="⭐" style={{ backgroundColor: scheme.first }} onClick={e => { e.stopPropagation(); setShowPointsPopup(true); }} />
          <CountButton likes={curPost.comment_count ?? 0} emoji="💬" style={{ backgroundColor: scheme.first }} onClick={e => { e.stopPropagation(); window.location.href = `${window.location.origin}/posts/view?id=${curPost._id.$oid}`; }} />
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

      {showDeletePopup && (
        <Popup onClose={() => setShowDeletePopup(false)}>
          <p>Ben je zeker dat je deze post wilt verwijderen</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeletePopup(false)}>Annuleren</button>
            <button onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>Verwijderen</button>
          </div>
        </Popup>
      )}
    </>
  );
}

export default PostCard;
