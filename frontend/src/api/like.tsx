import type { paths,  components, operations} from "./types/api";
import { API_BASE_URL } from "./api";
import { toQueryString } from "./api";


export async function like_post(input: components["schemas"]["LikePost"], access_token: string): Promise<components["schemas"]["ResponseLikePost"]> {
  const response = await fetch(API_BASE_URL + '/api/post/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
     },
    
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Failed to gamble');

  const data = (await response.json()) as components["schemas"]["ResponseLikePost"]
  return data;
}
