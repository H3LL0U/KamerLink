import type { paths, components, operations } from "./gen/api";
import { API_BASE_URL } from "./api";
import { client } from "./gen/clients";
export type PostDraft = components["schemas"]["PostDraft"];
export type PostResponse = paths["/api/post"]["post"]["responses"]["200"]["content"]["application/json"];
/* The client created function (like ones bellow) doesn't send the correct request. Couldn't figure out why so it will be written manually. */
export async function createPost(
  draft: PostDraft,
  token: string
): Promise<PostResponse> {
  const formData = new FormData();
  formData.append("title", draft.title);
  formData.append("message", draft.message);
  if (draft.tags) {
    formData.append("tags", JSON.stringify(draft.tags))
  }



  draft.images.forEach((img, i) => {

    formData.append("images", img.toString());

  });

  const res = await fetch(`${API_BASE_URL}/api/post`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to create post: ${res.status}`);
  }

  return res.json();
}

//Posts
export type RetrievePost = operations["retrieve_posts"]["parameters"]["query"]
export type Posts = paths["/api/post"]["get"]["responses"]["200"]["content"]["application/json"];

export type RetrieveBy = components["schemas"]["RetrieveBy"];
export const retrievePosts = client.path("/api/post").method("get").create()


export const likePost = client.path("/api/post/like").method("post").create()


export type SpendPoints = components["schemas"]["GivePoints"];
export const spendPoints = client.path("/api/post/points").method("post").create()

export const checkPoints = client.path("/api/post/points").method("get").create()



// Comments under posts
export const createComment = client.path("/api/post/comment").method("post").create()

export type PostComment = paths["/api/post/comment"]["get"]["responses"]["200"]["content"]["application/json"]["items"][0]

export const retrieveComments = client.path("/api/post/comment").method("get").create()

export const likeComment = client.path("/api/post/comment/like").method("post").create()

//reply to comment
export const addReplyToComment = client.path("/api/post/comment/reply").method("post").create()

//post tags
export type PostTag = paths["/api/post/tags/{post_id}"]["get"]["responses"]["200"]["content"]["application/json"]["items"][0]

export type RequestPostTag = components["schemas"]["RequestPostTag"];


export const retrievePostTags = client.path("/api/post/tags/{post_id}").method("get").create()

export const deletePost = client.path("/api/post").method("delete").create()

export const editPost = client.path("/api/post").method("patch").create()



export const editComment = client.path("/api/post/comment").method("patch").create()

export const deleteComment = client.path("/api/post/comment").method("delete").create()


