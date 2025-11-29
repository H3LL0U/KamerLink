import type { components } from "./gen/api";
import { client } from "./gen/clients";

export type UserInfo = components["schemas"]["UserInfo"]
export const getUsers = client.path("/api/user").method("get").create()

export const retrieveUserPosts = client.path("/api/user/{user_id}/posts").method("get").create()

export const banUser = client.path("/api/user/ban/{ban_user_id}").method("post").create();


export const roleToPriority = new Map<string, number>([
    ["Student", 1],
    ["Teacher", 2],
    ["Admin", 3],
]);


export const isHigherRole = (roleA: UserInfo["role"], roleB: UserInfo["role"]): boolean => {

    return (roleToPriority.get(roleA) ?? 0) > (roleToPriority.get(roleB) ?? 99);
}


