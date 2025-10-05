import type { components } from "./gen/api";
import { client } from "./gen/clients";

export type UserInfo = components["schemas"]["UserInfo"]
export const getUsers = client.path("/api/user").method("get").create()

export const retrieveUserPosts = client.path("/api/user/{user_id}/posts").method("get").create()