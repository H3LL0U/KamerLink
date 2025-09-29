import type { paths, components, operations } from "./gen/api";
import { API_BASE_URL } from "./api";
import { client } from "./gen/clients";
export type PostDraft = components["schemas"]["PostDraft"];
export type PostResponse = paths["/api/post"]["post"]["responses"]["200"]["content"]["application/json"];
/* The client created function (like ones bellow) doens't send the correct request. Couldn't figure out why so it will be written manually. */
export async function createPost(
  draft: PostDraft,
  token: string
): Promise<PostResponse> {
  const formData = new FormData();
  formData.append("title", draft.title);
  formData.append("message", draft.message);



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

// Get request


export type RetrievePost = components["schemas"]["RetrievePaginated"];
export type Posts = paths["/api/post"]["get"]["responses"]["200"]["content"]["application/json"];

export type RetrieveBy = components["schemas"]["RetrieveBy"];
export const retrievePosts = client.path("/api/post").method("get").create()


export const likePost = client.path("/api/post/like").method("post").create()


export type SpendPoints = components["schemas"]["GivePoints"];
export const spendPoints = client.path("/api/post/points").method("post").create()

export const checkPoints = client.path("/api/post/points").method("get").create()

export const createComment = client.path("/api/post/comment").method("post").create()

export const retrieveComments = client.path("/api/post/comment").method("get").create()