import { useAuth0 } from "@auth0/auth0-react";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import { useNavigate } from "react-router-dom";
import Header from "../../components/page_components/Header/Header";
import PostFormCard from "../../components/page_components/PostDraftCard/PostDraftCard";
import { createPost, type PostDraft } from "../../api/post";

function PostPage() {
  const { AuthReplacement, user } = useAuthenticatedUser();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  if (AuthReplacement) return AuthReplacement;

  // External submit function to pass into PostFormCard
  const handlePostSubmit = async (draft: PostDraft) => {
    const token = await getAccessTokenSilently();
    const response = await createPost(draft, token);

    if (response?.post_id) {
      navigate(`/posts/view?id=${response.post_id}`);
    } else {
      // Optionally handle errors here
      console.error("Failed to create post", response);
    }
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2rem 0" }}>
        <PostFormCard onSubmit={handlePostSubmit} />
      </div>
    </>
  );
}

export default PostPage;
