import type { paths,  components, operations} from "../types/api";
import { API_BASE_URL } from "./api";
export type PostDraft = components["schemas"]["PostDraft"];
export type PostResponse = paths["api/post"]["post"]["responses"]["200"]["content"]["application/json"];


export async function createPost(
  draft: PostDraft,
  token: string
): Promise<PostResponse> {
  const formData = new FormData();
  formData.append("title", draft.title);
  formData.append("message", draft.message);

  
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
