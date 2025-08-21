import type { paths,  components, operations} from "./types/api";
import { API_BASE_URL } from "./api";
import { toQueryString } from "./api";
export type PostDraft = components["schemas"]["PostDraft"];
export type PostResponse = paths["/api/post"]["post"]["responses"]["200"]["content"]["application/json"];


export async function createPost(
  draft: PostDraft,
  token: string
): Promise<PostResponse> {
  const formData = new FormData();
  formData.append("title", draft.title);
  formData.append("message", draft.message);
  if (draft.location) {
    formData.append("location", JSON.stringify(draft.location));
  }
  if (draft.goal) {
    formData.append("goal", JSON.stringify(draft.goal));
  }

  
  draft.images.forEach((img, i) => {

      // Convert base64 string to Blob
      const byteString = atob(img.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
      const blob = new Blob([ab], { type: "image/png" });
      formData.append("images", blob, `image${i}.png`);
    
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


export type RetrievePost = components["schemas"]["RetrievePost"];
export type Posts = paths["/api/post"]["get"]["responses"]["200"]["content"]["application/json"];

export async function retrievePosts(
  request: RetrievePost,
  access_token: string
): Promise<Posts> {
  // Convert request object into query parameters

  const response = await fetch(`${API_BASE_URL}/api/post?${toQueryString(request)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
  }

  const data: Posts = await response.json();
  return data;
}

